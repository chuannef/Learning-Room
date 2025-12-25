import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { getUserAvatarSrc } from "../lib/avatar";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

function normalizeCallId(raw) {
  if (!raw) return "";

  const id = String(raw);

  const dmExact = /^dm-[a-f0-9]{24}-[a-f0-9]{24}$/i;
  const groupExact = /^group-[a-f0-9]{24}$/i;
  if (dmExact.test(id) || groupExact.test(id)) return id;

  const dmMatch = id.match(/dm-[a-f0-9]{24}-[a-f0-9]{24}/i);
  if (dmMatch?.[0]) return dmMatch[0];

  const groupMatch = id.match(/group-[a-f0-9]{24}/i);
  if (groupMatch?.[0]) return groupMatch[0];

  return id;
}

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callError, setCallError] = useState("");
  const initKeyRef = useRef("");

  const { authUser, isLoading } = useAuthUser();

  const {
    data: tokenData,
    isLoading: tokenLoading,
    isError: tokenIsError,
    error: tokenError,
  } = useQuery({
    queryKey: ["streamToken", authUser?._id],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: false,
  });

  const normalizedCallId = normalizeCallId(callId);

  useEffect(() => {
    if (callId && normalizedCallId && callId !== normalizedCallId) {
      navigate(`/call/${normalizedCallId}`, { replace: true });
    }
  }, [callId, normalizedCallId, navigate]);

  // Block group calls (group channels use id like group-<groupId>)
  useEffect(() => {
    if (normalizedCallId?.startsWith("group-")) {
      toast.error("Group video calls are disabled");
      navigate("/groups");
    }
  }, [normalizedCallId, navigate]);

  useEffect(() => {
    if (isLoading) return;

    if (!normalizedCallId) {
      setCallError("Missing call id");
      setIsConnecting(false);
      return;
    }

    if (!authUser) {
      setCallError("Please log in to join the call");
      setIsConnecting(false);
    }
  }, [isLoading, authUser, normalizedCallId]);

  useEffect(() => {
    const initCall = async () => {
      if (!authUser || !normalizedCallId) return;

      if (tokenLoading) return;

      if (tokenIsError) {
        const msg = tokenError?.response?.data?.message || tokenError?.message || "Failed to load Stream token";
        setCallError(msg);
        setIsConnecting(false);
        return;
      }

      if (!tokenData?.token) {
        setCallError("Stream token missing from server response");
        setIsConnecting(false);
        return;
      }

      const apiKey = String(tokenData?.apiKey || "").trim();
      if (!apiKey) {
        setCallError("Stream API key missing from server response");
        setIsConnecting(false);
        return;
      }

      if (normalizedCallId.startsWith("group-")) {
        setIsConnecting(false);
        return;
      }

      const initKey = `${authUser._id}:${normalizedCallId}:${tokenData.token}`;
      if (initKeyRef.current === initKey) return;
      initKeyRef.current = initKey;

      let videoClient;
      let callInstance;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser?.fullName || authUser?.username || "User",
        };

        const avatar = getUserAvatarSrc(authUser);
        if (typeof avatar === "string" && avatar && !avatar.startsWith("data:image/") && avatar.length <= 4000) {
          user.image = avatar;
        }

        // Explicit connect so we can fail fast & show the real error.
        videoClient = new StreamVideoClient({
          apiKey,
          options: {
            maxConnectUserRetries: 1,
          },
        });

        const connectTimeoutMs = 15000;
        await Promise.race([
          videoClient.connectUser(user, tokenData.token),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Connect timed out")), connectTimeoutMs)),
        ]);

        callInstance = videoClient.call("default", normalizedCallId);

        const joinTimeoutMs = 25000;
        await Promise.race([
          callInstance.join({ create: true }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Join call timed out")), joinTimeoutMs)),
        ]);

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        const msg = error?.message || "Could not join the call. Please try again.";
        setCallError(msg);
        toast.error(msg);

        try {
          await callInstance?.leave?.();
        } catch {
          // ignore
        }
        try {
          await videoClient?.disconnectUser?.();
        } catch {
          // ignore
        }
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
    return () => {
      // Best-effort cleanup when navigating away.
      try {
        call?.leave?.();
      } catch {
        // ignore
      }
      try {
        client?.disconnectUser?.();
      } catch {
        // ignore
      }
    };
  }, [tokenData?.token, tokenData?.apiKey, tokenLoading, tokenIsError, tokenError, authUser, normalizedCallId]);

  // Token fetch can hang (cold start / network). Fail fast with a useful error.
  useEffect(() => {
    if (!authUser || !normalizedCallId) return;
    if (!tokenLoading) return;

    const t = setTimeout(() => {
      setCallError("Loading call token timed out. Please refresh and try again.");
      setIsConnecting(false);
    }, 20000);

    return () => clearTimeout(t);
  }, [authUser, normalizedCallId, tokenLoading]);

  if (isLoading || (isConnecting && !callError)) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>{callError || "Could not initialize call. Please refresh or try again later."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  useEffect(() => {
    // Ensure the call UI never causes page scrolling.
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyMargin = document.body.style.margin;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.margin = prevBodyMargin;
    };
  }, []);

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <div className="relative w-screen h-screen overflow-hidden">
        <div className="absolute inset-0">
          <ParticipantsPerUserLayout />
        </div>
        <div className="absolute left-0 right-0 bottom-0">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

const ParticipantsPerUserLayout = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [viewport, setViewport] = useState(() => {
    if (typeof window === "undefined") return { w: 1280, h: 720 };
    return { w: window.innerWidth || 1280, h: window.innerHeight || 720 };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setViewport({ w: window.innerWidth || 1280, h: window.innerHeight || 720 });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const tiles = useMemo(() => {
    // Ensure 1 participant per userId (avoid multiple camera tiles per user).
    const byUserId = new Map();
    for (const participant of participants || []) {
      const userId = String(participant?.userId || "");
      if (!userId) continue;

      const existing = byUserId.get(userId);
      if (!existing) {
        byUserId.set(userId, participant);
        continue;
      }

      // Prefer local participant entry if duplicates exist.
      if (!existing.isLocalParticipant && participant.isLocalParticipant) {
        byUserId.set(userId, participant);
      }
    }

    const uniqueParticipants = Array.from(byUserId.values());
    // Stable-ish ordering: local first, then by name/userId.
    uniqueParticipants.sort((a, b) => {
      if (a.isLocalParticipant && !b.isLocalParticipant) return -1;
      if (!a.isLocalParticipant && b.isLocalParticipant) return 1;
      const an = String(a.name || a.userId || "");
      const bn = String(b.name || b.userId || "");
      return an.localeCompare(bn);
    });

    return uniqueParticipants.flatMap((p) => {
      const userId = String(p.userId);
      const baseKey = `${userId}:${p.sessionId || ""}`;

      const result = [
        {
          key: `${baseKey}:video`,
          participant: p,
          trackType: "videoTrack",
        },
      ];

      // Add a second tile only when this user is screen sharing.
      if (p.screenShareStream) {
        result.push({
          key: `${baseKey}:screen`,
          participant: p,
          trackType: "screenShareTrack",
        });
      }

      return result;
    });
  }, [participants]);

  const grid = useMemo(() => {
    const count = tiles.length;
    if (count <= 0) return { cols: 1, rows: 1 };

    // Fit-all layout (no scroll): choose cols/rows based on viewport aspect ratio.
    const aspect = Math.max(0.5, Math.min(2.5, viewport.w / Math.max(1, viewport.h)));
    let cols = Math.ceil(Math.sqrt(count * aspect));
    cols = Math.max(1, Math.min(cols, count));
    const rows = Math.max(1, Math.ceil(count / cols));

    return { cols, rows };
  }, [tiles.length, viewport.w, viewport.h]);

  const density = useMemo(() => {
    const count = tiles.length;
    // Keep everything on screen; reduce whitespace as tiles increase.
    if (count <= 2) return { padding: "p-2", gap: "gap-2" };
    if (count <= 4) return { padding: "p-1", gap: "gap-1" };
    return { padding: "p-1", gap: "gap-0.5" };
  }, [tiles.length]);

  return (
    <div className={`w-full h-full ${density.padding} overflow-hidden`}>
      <div
        className={`h-full w-full grid ${density.gap} overflow-hidden`}
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((t) => (
          <div key={t.key} className="min-w-0 min-h-0">
            <div
              className="min-w-0 min-h-0"
              style={
                t.trackType === "videoTrack"
                  ? {
                      width: "calc(100% - 15px)",
                      height: "calc(100% - 15px)",
                      margin: "auto",
                    }
                  : undefined
              }
            >
              <ParticipantView participant={t.participant} trackType={t.trackType} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallPage;
