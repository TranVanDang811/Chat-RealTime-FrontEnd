import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
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

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await dispatch(logout({ token })).unwrap();
      navigate("/auth/sign-in");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center w-20 bg-blue-400 shadow-md py-6 h-full border-r border-gray-200">
      {/* Avatar */}
      <div className="flex flex-col items-center space-y-6">
        {loading ? (
          <div className="w-12 h-12 rounded-full bg-blue-300 animate-pulse" />
        ) : (
          <img
            onClick={() => setShowProfileModal(true)}
            src={
              myInfo?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(myInfo?.fullName || "U")}&background=6366f1&color=fff`
            }
            alt={myInfo?.fullName}
            className="w-12 h-12 rounded-full object-cover border-2 border-white"
          />
        )}
        {myInfo && (
          <span className="text-[10px] text-blue-100 font-medium text-center px-1 leading-tight">
            {myInfo.fullName}
          </span>
        )}
      </div>

      {/* Settings button + dropdown */}
      <div className="flex flex-col items-center mb-4 relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`p-3 rounded transition ${menuOpen ? "bg-blue-300" : "hover:bg-blue-300"}`}
        >
          <Cog6ToothIcon className="w-8 h-8 text-gray-100" />
        </button>

        {/* Dropdown — mở sang phải */}
        {menuOpen && (
          <div
            className="absolute bottom-0 left-full ml-2 w-44 bg-white rounded-xl shadow-xl
            border border-gray-100 overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-700 truncate">
                {myInfo?.fullName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {myInfo?.email}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500
                hover:bg-red-50 transition"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
      <ProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={myInfo}
      />
    </div>
  );
};

export default Topbar;
