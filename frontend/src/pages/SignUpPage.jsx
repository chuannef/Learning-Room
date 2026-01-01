import { useState } from "react";
import { ShipWheelIcon, SearchIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";

import useSignUp from "../hooks/useSignUp";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({ fullName: "", email: "", password: "" });

  // This is how we did it at first, without using our custom hook
  // const queryClient = useQueryClient();
  // const {
  //   mutate: signupMutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: signup,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  // This is how we did it using our custom hook - optimized version
  const { isPending, error, signupMutation } = useSignUp();

  const handleSignup = (e) => {
    e.preventDefault();

    const fullName = String(signupData.fullName || "").trim();
    const email = String(signupData.email || "").trim();
    const password = String(signupData.password || "");

    signupMutation({ fullName, email, password });
  };

  const bgUrl =
    "https://cdn-media.sforum.vn/storage/app/media/ctvseo_maihue/hinh-nen-1920-1080/hinh-nen-1920-1080-thumbnail.jpg";

  return (
    <div
      className="min-h-screen"
      data-theme="forest"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="min-h-screen bg-cover bg-center">
        <div className="min-h-screen bg-black/35 flex flex-col">
          <div className="navbar bg-base-100/20 backdrop-blur-md border-b border-base-100/20">
            <div className="max-w-7xl mx-auto w-full px-4 flex items-center">
              <div className="flex-1 flex items-center gap-3">
                <div className="btn btn-ghost btn-circle">
                  <ShipWheelIcon className="size-5" />
                </div>

                <ul className="menu menu-horizontal px-1 hidden md:flex">
                  <li><a>Home</a></li>
                  <li><a>Service</a></li>
                  <li><a>Contact</a></li>
                  <li><Link to="/about">About</Link></li>
                </ul>
              </div>

              <div className="flex items-center gap-2">
                <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100/30">
                  <SearchIcon className="size-4 opacity-80" />
                  <input type="text" className="grow" placeholder="Search" />
                </label>
                <Link to="/login" className="btn btn-ghost btn-circle" title="Account">
                  <UserIcon className="size-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-md card bg-base-100/20 backdrop-blur-md border border-base-100/30 shadow-xl">
              <div className="card-body">
                {error && (
                  <div className="alert alert-error mb-2">
                    <span>{error.response?.data?.message || "Sign up failed"}</span>
                  </div>
                )}

                <div className="text-center">
                  <h1 className="text-3xl font-semibold">Sign Up</h1>
                  <div className="text-sm opacity-80 mt-1">
                    Already a member?{" "}
                    <Link to="/login" className="link link-primary">
                      Sign in
                    </Link>
                  </div>
                </div>

                <form onSubmit={handleSignup} className="mt-4 space-y-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="input input-bordered w-full bg-base-100/30"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData((p) => ({ ...p, fullName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Email"
                      className="input input-bordered w-full bg-base-100/30"
                      value={signupData.email}
                      onChange={(e) => setSignupData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Password"
                      className="input input-bordered w-full bg-base-100/30"
                      value={signupData.password}
                      onChange={(e) => setSignupData((p) => ({ ...p, password: e.target.value }))}
                      required
                    />
                  </div>

                  <button className="btn btn-primary w-full" type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Sign up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </button>

                  <div className="divider opacity-80">or sign up with</div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      className="btn btn-circle btn-sm"
                      onClick={() => toast("Social sign-up not implemented")}
                      title="Facebook"
                    >
                      f
                    </button>
                    <button
                      type="button"
                      className="btn btn-circle btn-sm"
                      onClick={() => toast("Social sign-up not implemented")}
                      title="Google"
                    >
                      G
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
