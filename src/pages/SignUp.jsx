import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../features/auth/authThunks";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    if (!username.trim()) {
      alert("Username is required");
      return;
    }
    if (!fullName.trim()) {
      alert("Full name is required");
      return;
    }

    if (!email.trim()) {
      alert("Email is required");
      return;
    }
    if (!phoneNumber.trim()) {
      alert("Phone number is required");
      return;
    }
    if (!gender) {
      alert("Vui lòng chọn giới tính");
      return;
    }

    if (!dateOfBirth) {
      alert("Vui lòng chọn ngày sinh");
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
    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp");
      return;
    }

    try {
      const resultAction = await dispatch(
        register({
          username,
          email,
          phoneNumber,
          password,
          gender,
          dateOfBirth,
          fullName,
        }),
      );

      if (register.fulfilled.match(resultAction)) {
        alert("Đăng ký thành công!");
        navigate("/auth/sign-in"); // 👈 quay về sign-in
      } else {
        alert(resultAction.payload || resultAction.error.message);
      }
    } catch (err) {
      alert(err.message || "Register failed");
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="col-span-2">
              <label className="block mb-1 text-gray-700">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ tên"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-200 outline-none"
                disabled={loading}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block mb-1 text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1 text-gray-700">Phone</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                disabled={loading}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 text-gray-700">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                disabled={loading}
              >
                <option value="">-- Chọn --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block mb-1 text-gray-700">Ngày sinh</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-gray-700">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-1 text-gray-700">
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                disabled={loading}
              />
            </div>
          </div>
          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full py-2 text-white rounded ${
              loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
            } transition`}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
        {/* Error */}
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

        {/* Link sang sign-in */}
        <p className="text-sm text-center mt-4 text-gray-500">
          Đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/auth/sign-in")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Đăng nhập
          </span>
        </p>
      </div>
    </section>
  );
};

export default SignUp;
