import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authThunks";
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "MALE",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate
    if (!form.username.trim() || !form.password.trim() || !form.fullName.trim()) {
      setErrorMessage("Vui lòng điền đầy đủ các thông tin bắt buộc (*).");
      return;
    }

    if (form.password.length < 4) {
      setErrorMessage("Mật khẩu phải có ít nhất 4 ký tự.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    const payload = {
      username: form.username.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      email: form.email.trim() || null,
      phoneNumber: form.phoneNumber.trim() || null,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender,
    };

    try {
      const resultAction = await dispatch(register(payload));
      if (register.fulfilled.match(resultAction)) {
        setSuccessMessage("Đăng ký tài khoản thành công! Đang chuyển hướng đến đăng nhập...");
        setTimeout(() => {
          navigate("/auth/sign-in");
        }, 1500);
      } else {
        setErrorMessage(
          resultAction.payload ||
          resultAction.error?.message ||
          "Đăng ký thất bại. Tên đăng nhập hoặc số điện thoại có thể đã tồn tại."
        );
      }
    } catch (err) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi đăng ký.");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="backdrop-blur-2xl bg-[#0f172a]/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-950/70 border border-slate-700/70 p-5 sm:p-8 md:p-10 transition-all">
        {/* App Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30 mb-3 transform hover:scale-105 transition">
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Đăng ký để kết nối vào không gian Midnight Blue
          </p>
        </div>

        {/* Error notification */}
        {(errorMessage || authError) && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 animate-slide-down"
          >
            <ExclamationCircleIcon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1 leading-relaxed">
              {errorMessage || authError}
            </p>
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 flex items-center gap-3 p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 animate-slide-down"
          >
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="flex-1 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Username */}
            <div>
              <label htmlFor="signup-username" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Tên đăng nhập <span className="text-rose-400" title="Bắt buộc">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="signup-username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="username..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="signup-fullname" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Họ và tên <span className="text-rose-400" title="Bắt buộc">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="signup-fullname"
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Mật khẩu <span className="text-rose-400" title="Bắt buộc">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-400"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-3.5 h-3.5" />
                  ) : (
                    <EyeIcon className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirmpassword" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Xác nhận mật khẩu <span className="text-rose-400" title="Bắt buộc">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="signup-confirmpassword"
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="signup-phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="signup-phone"
                  type="tel"
                  name="phoneNumber"
                  autoComplete="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="0912345678..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="signup-dob" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Ngày sinh
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDaysIcon className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  id="signup-dob"
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="signup-gender" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Giới tính
              </label>
              <select
                id="signup-gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition text-slate-200 disabled:opacity-60"
                disabled={loading}
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.99] shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý đăng ký...</span>
              </>
            ) : (
              <span>Đăng ký tài khoản</span>
            )}
          </button>
        </form>

        {/* Back to Sign In */}
        <div className="text-center mt-5 text-xs text-slate-400">
          Đã có tài khoản?{" "}
          <Link
            to="/auth/sign-in"
            className="font-semibold text-cyan-400 hover:text-cyan-300 transition underline underline-offset-2"
          >
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
