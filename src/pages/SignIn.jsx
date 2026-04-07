import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authThunks";


const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Load username đã lưu
  useEffect(() => {
    const saved = localStorage.getItem("lastUsername");
    if (saved) setUsername(saved);
  }, []);

  // Nếu đã login thành công, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (!username.trim()) {
      alert("Username is required");
      return;
    }
    if (!password.trim()) {
      alert("Password is required");
      return;
    }
    if (password.length < 4) {
      alert("Password must be at least 4 characters");
      return;
    }

    try {
      const resultAction = await dispatch(login({ username, password }));
      if (login.fulfilled.match(resultAction)) {
        // Lưu username để lần sau auto-fill
        localStorage.setItem("lastUsername", username);
      } else {
        // Login failed
        alert(resultAction.payload || resultAction.error.message);
      }
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập username"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-200 outline-none"
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-200 outline-none"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-2 text-white rounded ${
            loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
          } transition`}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        <p className="text-sm text-center mt-4 text-gray-500">
  Chưa có tài khoản?{" "}
  <span
    onClick={() => navigate("/auth/sign-up")}
    className="text-blue-500 cursor-pointer hover:underline"
  >
    Đăng ký tại đây
  </span>
</p>
      </div>
    </section>
  );
};

export default SignIn;