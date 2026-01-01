import { SearchIcon, ShipWheelIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";

const AboutPage = () => {
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
            <div className="w-full max-w-2xl card bg-base-100/20 backdrop-blur-md border border-base-100/30 shadow-xl">
              <div className="card-body">
                <h1 className="text-3xl font-semibold">Giới thiệu</h1>
                <p className="mt-2 opacity-90 leading-relaxed">
                  Đây là web học tập, nơi bạn có thể kết bạn, trao đổi và luyện tập thông qua chat 1-1, chat nhóm
                  và gọi video.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
