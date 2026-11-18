import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  XMarkIcon,
  CameraIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  PhoneIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { uploadAvatar } from "../features/user/userThunks";
import ProfileUpdateModal from "./ProfileUpdateModal";
import { useToast } from "../components/common/ToastContext";

const ProfileModal = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    if (!open) {
      setPreview(null);
      return;
    }
    const handleEsc = (e) => {
      if (e.key === "Escape" && !uploading) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose, uploading]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!open) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh (JPG, PNG, WEBP, GIF)");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dung lượng ảnh tối đa là 5MB");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      setUploading(true);
      await dispatch(uploadAvatar(file)).unwrap();
      toast.success("Cập nhật ảnh đại diện thành công!");
      setPreview(null);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(typeof err === "string" ? err : "Tải ảnh đại diện thất bại");
      setPreview(null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const avatarUrl =
    preview ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.fullName || "User"
    )}&background=2563eb&color=fff&bold=true`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) onClose();
      }}
    >
      <div
        className="bg-[#0f172a] rounded-2xl shadow-2xl shadow-blue-950/80 w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-y-auto border border-slate-700/80 text-white animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative h-28 bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 p-4 flex justify-between items-start">
          <span className="text-white/80 font-semibold text-xs tracking-wider uppercase">
            Hồ sơ tài khoản
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition focus:outline-none focus:ring-2 focus:ring-white/40"
            title="Đóng (Esc)"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar floating over banner */}
          <div className="flex flex-col items-center -mt-14 mb-4">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={user?.fullName}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-800 shadow-xl bg-slate-900"
              />

              {/* Upload Overlay Button */}
              <label
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl cursor-pointer hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-600/40 transition"
                title="Thay đổi ảnh đại diện"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CameraIcon className="w-4 h-4" />
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <h3 id="profile-modal-title" className="mt-3 font-bold text-lg text-white">
              {user?.fullName || "Chưa đặt tên"}
            </h3>
            <span className="inline-block mt-0.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ● Đang hoạt động
            </span>
          </div>

          {/* Details List */}
          <div className="space-y-2.5 text-xs text-slate-300 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between py-1">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <EnvelopeIcon className="w-4 h-4 text-cyan-400" />
                Email
              </span>
              <span className="font-semibold text-white">
                {user?.email || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <UserCircleIcon className="w-4 h-4 text-cyan-400" />
                Giới tính
              </span>
              <span className="font-semibold text-white">
                {user?.gender === "MALE"
                  ? "Nam"
                  : user?.gender === "FEMALE"
                  ? "Nữ"
                  : user?.gender || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <CalendarDaysIcon className="w-4 h-4 text-cyan-400" />
                Ngày sinh
              </span>
              <span className="font-semibold text-white">
                {user?.dateOfBirth || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-800">
              <span className="flex items-center gap-2 text-slate-400 font-medium">
                <PhoneIcon className="w-4 h-4 text-cyan-400" />
                Số điện thoại
              </span>
              <span className="font-semibold text-white">
                {user?.phoneNumber || "—"}
              </span>
            </div>
          </div>

          {/* Update Button */}
          <button
            type="button"
            onClick={() => setShowUpdateModal(true)}
            className="w-full mt-4 py-2.5 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 text-white"
          >
            <PencilSquareIcon className="w-4 h-4" />
            Cập nhật thông tin
          </button>
        </div>
      </div>

      <ProfileUpdateModal
        open={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        user={user}
      />
    </div>
  );
};

export default ProfileModal;
