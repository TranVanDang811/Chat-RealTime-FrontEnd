import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { updateProfile } from "../features/user/userThunks";

const ProfileUpdateModal = ({ open, onClose, user }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    gender: "MALE",
    dateOfBirth: "",
  });

  // load data khi mở modal
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
        gender: user.gender || "MALE",
        dateOfBirth: user.dateOfBirth || "",
      });
    }
  }, [user]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await dispatch(updateProfile(form)).unwrap();
      onClose(); // đóng modal sau khi save
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-96 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold">Cập nhật thông tin</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          <div>
            <label>Họ tên</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 mt-1"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 mt-1"
            />
          </div>

          <div>
            <label>Giới tính</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 mt-1"
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
          </div>

          <div>
            <label>Ngày sinh</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 mt-1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdateModal;