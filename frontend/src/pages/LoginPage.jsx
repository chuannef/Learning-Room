import { useState } from "react";
import { ShipWheelIcon, SearchIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // This is how we did it at first, without using our custom hook
  // const queryClient = useQueryClient();
  // const {
  //   mutate: loginMutation,
  //   isPending,
  //   error,
  // } = useMutation({
  //   mutationFn: login,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  // This is how we did it using our custom hook - optimized version
  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
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
                    <span>{error.response?.data?.message || "Login failed"}</span>
                  </div>
                )}

                <div className="text-center">
                  <h1 className="text-3xl font-semibold">Sign In</h1>
                  <div className="text-sm opacity-80 mt-1">
                    New here?{" "}
                    <Link to="/signup" className="link link-primary">
                      Sign up
                    </Link>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="mt-4 space-y-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Email"
                      className="input input-bordered w-full bg-base-100/30"
                      value={loginData.email}
                      onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
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
                      value={loginData.password}
                      onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="divider opacity-80">or sign in with</div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      className="btn btn-circle btn-sm"
                      onClick={() => toast("Social sign-in not implemented")}
                      title="Facebook"
                    >
                      f
                    </button>
                    <button
                      type="button"
                      className="btn btn-circle btn-sm"
                      onClick={() => toast("Social sign-in not implemented")}
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
export default LoginPage;
