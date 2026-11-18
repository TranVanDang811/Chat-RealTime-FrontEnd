import axiosInstance from "../../services/axiosInstance";

export default {

  // ===== CREATE USER =====
  createUser: (payload) =>
    axiosInstance.post("/api/users", {
      username: payload.username,
      email: payload.email,
      password: payload.password,
    }).then(res => res.data), // create new user

  // ===== GET USER BY ID =====
  getById: (id) =>
    axiosInstance.get(`/api/users/id/${id}`).then(res => res.data), // get user by id

  // ===== GET ALL USERS =====
  getAll: () =>
    axiosInstance.get("/api/users").then(res => res.data), // get all users

  // ===== GET MY INFO =====
  getMyInfo: () =>
    axiosInstance.get("/api/users/myInfo").then(res => res.data), // current user info

  // ===== DELETE USER =====
  deleteUser: (id) =>
    axiosInstance.delete(`/api/users/${id}`).then(res => res.data), // delete user

  // ===== UPLOAD AVATAR =====
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosInstance.post("/api/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(res => res.data); // upload avatar image
  },

  // ===== UPDATE PROFILE =====
  updateProfile: (payload) =>
    axiosInstance.put("/api/users/profile", payload)
      .then(res => res.data), // update user profile
};