import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { updateProfile } from "../features/user/userThunks";
import { useToast } from "../components/common/ToastContext";

const ProfileUpdateModal = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    gender: "MALE",
    dateOfBirth: "",
  });

  // Handle ESC key to close modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, loading]);

  useEffect(() => {
    if (user && open) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        gender: user.gender || "MALE",
        dateOfBirth: user.dateOfBirth || "",
      });
      setError("");
    }
  }, [user, open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setError("Họ và tên không được để trống.");
      return;
    }

    try {
      setLoading(true);
      await dispatch(updateProfile(form)).unwrap();
      toast.success("Cập nhật hồ sơ cá nhân thành công!");
      onClose();
    } catch (err) {
      console.error(err);
      setError(typeof err === "string" ? err : "Cập nhật hồ sơ thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-update-modal-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-[#0f172a] w-full max-w-[420px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-slate-700/80 text-white overflow-hidden animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/70 flex-shrink-0">
          <div>
            <h2 id="profile-update-modal-title" className="font-bold text-white text-base leading-tight">
              Cập nhật hồ sơ cá nhân
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chỉnh sửa thông tin hiển thị của bạn trên hệ thống
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50"
            title="Đóng cửa sổ (Esc)"
            aria-label="Đóng"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
            {/* Inline Error Alert */}
            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-950/40 text-rose-300 font-medium border border-rose-800/60 flex items-start gap-2.5 animate-slide-down"
              >
                <ExclamationTriangleIcon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Field: Full Name */}
            <div>
              <label htmlFor="update-fullname" className="font-semibold text-slate-200 block mb-1.5">
                Họ và tên <span className="text-rose-400" title="Bắt buộc">*</span>
              </label>
              <input
                id="update-fullname"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên..."
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                autoFocus
              />
            </div>

            {/* Field: Email */}
            <div>
              <label htmlFor="update-email" className="font-semibold text-slate-200 block mb-1.5">
                Địa chỉ Email
              </label>
              <input
                id="update-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
              />
            </div>

            {/* Fields: Gender & Date of Birth */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="update-gender" className="font-semibold text-slate-200 block mb-1.5">
                  Giới tính
                </label>
                <select
                  id="update-gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label htmlFor="update-dob" className="font-semibold text-slate-200 block mb-1.5">
                  Ngày sinh
                </label>
                <input
                  id="update-dob"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-800 bg-slate-900/60">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-xl active:scale-98 transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading || !form.fullName.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold active:scale-98 shadow-md shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdateModal;
