import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { XMarkIcon, CameraIcon } from "@heroicons/react/24/outline";
import { uploadAvatar } from "../features/user/userThunks";
import ProfileUpdateModal from "./ProfileUpdateModal";

const ProfileModal = ({ open, onClose, user }) => {
const dispatch = useDispatch();
const [preview, setPreview] = useState(null);
const [showUpdateModal, setShowUpdateModal] = useState(false);
useEffect(() => {
const handleEsc = (e) => {
if (e.key === "Escape") onClose();
};
document.addEventListener("keydown", handleEsc);
return () => document.removeEventListener("keydown", handleEsc);
}, [onClose]);

if (!open) return null;

// chọn file
const handleFileChange = async (e) => {
const file = e.target.files[0];
if (!file) return;

// preview
const previewUrl = URL.createObjectURL(file);
setPreview(previewUrl);

    try {
         await dispatch(uploadAvatar(file)).unwrap();
    } catch (err) {
        console.error("Upload failed:", err);
    }
};

return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden" onClick={(e)=> e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
            <h2 className="text-base font-semibold text-gray-800">
                Thông tin tài khoản
            </h2>

            <button onClick={onClose}>
                <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        {/* Body */}
        <div className="p-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <img src={ preview || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.fullName || "U" )}` }
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-400" />

                    {/* upload button */}
                    <label
                        className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full cursor-pointer hover:bg-blue-600">
                        <CameraIcon className="w-4 h-4 text-white" />
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>

                <h3 className="mt-3 font-semibold">{user?.fullName}</h3>
            </div>

            {/* Info */}
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Email</span>
                    <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                    <span>Gender</span>
                    <span>{user?.gender}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date of birth</span>
                    <span>{user?.dateOfBirth}</span>
                </div>

                <div className="flex justify-between">
                    <span>Phone</span>
                    <span>{user?.phoneNumber}</span>
                </div>
            </div>
            <button onClick={()=> setShowUpdateModal(true)}
                className="w-full mt-3 p-2 text-sm rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                >
                Cập nhật thông tin
            </button>
        </div>
    </div>
    <ProfileUpdateModal open={showUpdateModal} onClose={()=> setShowUpdateModal(false)}
        user={user}
        />
</div>
);
};

export default ProfileModal;
