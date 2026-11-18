import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { getMyInfo } from "../features/user/userThunks";
import { logout } from "../features/auth/authThunks";
import { useNavigate } from "react-router-dom";
import ProfileModal from "../modal/ProfileModal";

const Topbar = () => {
  const dispatch = useDispatch();
  const { myInfo, loading } = useSelector((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getMyInfo());
  }, [dispatch]);

  // Click outside or Escape to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await dispatch(logout({ token, refreshToken })).unwrap();
      navigate("/auth/sign-in");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setMenuOpen(false);
    }
  };

  const avatarUrl =
    myInfo?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      myInfo?.fullName || "User"
    )}&background=2563eb&color=fff&bold=true`;

  return (
    <aside className="w-16 md:w-18 bg-[#070c18] border-r border-slate-800/80 flex flex-col items-center justify-between py-4 h-full z-30 flex-shrink-0 select-none shadow-xl">
      {/* ── Top Section: Brand & Navigation Rail ─────────────────────────── */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Brand App Icon */}
        <div className="relative group">
          <button
            title="Chat Realtime SaaS"
            aria-label="Thương hiệu Chat Realtime SaaS"
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-600/30 hover:shadow-blue-500/40 active:scale-95 transition-all duration-150 focus:outline-none"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl border border-slate-700/80 z-50">
            Chat SaaS Workspace
          </div>
        </div>

        <div className="w-8 h-[1px] bg-slate-800/80" />

        {/* Main Navigation Item: Chats (Active state: subtle, professional) */}
        <div className="relative group">
          <button
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/25 flex items-center justify-center transition-all duration-150 shadow-xs"
            title="Hội thoại tin nhắn"
            aria-label="Hội thoại tin nhắn"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
          </button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl border border-slate-700/80 z-50">
            Tin nhắn & Hội thoại
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Profile Avatar & Settings ───────────────────── */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Profile Avatar with Status */}
        <div className="relative group">
          {loading ? (
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl skeleton-shimmer ring-1 ring-slate-700" />
          ) : (
            <button
              onClick={() => setShowProfileModal(true)}
              className="relative block rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 group-hover:ring-2 group-hover:ring-blue-500/60 transition-all duration-150"
              title="Xem hồ sơ tài khoản"
              aria-label="Xem hồ sơ tài khoản cá nhân"
            >
              <img
                src={avatarUrl}
                alt={myInfo?.fullName || "User"}
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl object-cover ring-1 ring-slate-700/80 shadow-md group-hover:scale-105 transition-transform duration-150"
              />
              {/* Online Indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#070c18] rounded-full shadow-xs" />
            </button>
          )}

          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-slate-100 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl z-50 border border-slate-700/80">
            <p className="font-semibold text-white">{myInfo?.fullName || "Hồ sơ cá nhân"}</p>
            <p className="text-[10px] text-slate-400">Nhấp để mở chi tiết</p>
          </div>
        </div>

        {/* Settings Button & Popover */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            title="Tùy chọn & Đăng xuất"
            aria-label="Tùy chọn cài đặt & Đăng xuất"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${menuOpen
              ? "bg-slate-800 text-cyan-400 ring-1 ring-blue-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>

          {/* SaaS Settings Popover */}
          {menuOpen && (
            <div
              role="menu"
              aria-label="Tùy chọn tài khoản"
              className="absolute bottom-2 left-full ml-3 w-60 max-w-[calc(100vw-80px)] bg-[#0f172a]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden z-50 py-1 animate-dropdown origin-bottom-left text-slate-200"
            >
              {/* User preview header */}
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <img
                    src={avatarUrl}
                    alt={myInfo?.fullName}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {myInfo?.fullName || "User"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {myInfo?.email || myInfo?.phoneNumber || "Tài khoản SaaS"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                    <ShieldCheckIcon className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>

              {/* Action items */}
              <div className="p-1.5 space-y-0.5 text-xs">
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCircleIcon className="w-4 h-4 text-cyan-400" />
                    <span>Thông tin tài khoản</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">⌘P</span>
                </button>

                <div className="my-1 border-t border-slate-800" />

                <button
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-400" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={myInfo}
      />
    </aside>
  );
};

export default Topbar;
