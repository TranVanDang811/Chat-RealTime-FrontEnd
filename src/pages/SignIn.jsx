import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authThunks";
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: authError, isAuthenticated } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("lastUsername");
    if (saved) setUsername(saved);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("Vui lòng nhập tên đăng nhập (username).");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    try {
      const resultAction = await dispatch(login({ username: username.trim(), password }));
      if (login.fulfilled.match(resultAction)) {
        localStorage.setItem("lastUsername", username.trim());
      } else {
        setErrorMessage(resultAction.payload || resultAction.error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi đăng nhập.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Midnight Glass Card */}
      <div className="backdrop-blur-2xl bg-[#0f172a]/95 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-950/70 border border-slate-700/70 p-5 sm:p-8 md:p-10 transition-all">
        {/* App Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30 mb-4 transform hover:scale-105 transition">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Chat Realtime
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Đăng nhập vào không gian trò chuyện Midnight
          </p>
        </div>

        {/* Error notification banner */}
        {(errorMessage || authError) && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 animate-slide-down"
          >
            <ExclamationCircleIcon className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="flex-1 leading-relaxed">
              {errorMessage || authError}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label htmlFor="signin-username" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Tên đăng nhập <span className="text-rose-400" title="Bắt buộc">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                id="signin-username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="Nhập tên tài khoản (vd: admin)..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="signin-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mật khẩu <span className="text-rose-400" title="Bắt buộc">*</span>
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <LockClosedIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                id="signin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 accent-blue-600"
              />
              <span>Ghi nhớ tài khoản</span>
            </label>
            <span className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer">
              Quên mật khẩu?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.99] shadow-lg shadow-blue-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý đăng nhập...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0f172a] text-slate-500 font-medium">
              Chưa có tài khoản?
            </span>
          </div>
        </div>

        {/* Link to Sign Up */}
        <div className="text-center">
          <Link
            to="/auth/sign-up"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-cyan-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
          >
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
