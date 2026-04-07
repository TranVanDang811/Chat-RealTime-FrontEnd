import axiosInstance from "../../services/axiosInstance";

export default {
  login: (payload) =>
    axiosInstance.post("/auth/token", payload).then(res => res.data), // login

  refresh: (payload) =>
    axiosInstance.post("/auth/refresh", payload).then(res => res.data), // refresh token

  register: (payload) =>
    axiosInstance.post("/auth/register", payload).then(res => res.data), // register new user

  logout: (payload) =>
    axiosInstance.post("/auth/logout", payload).then(res => res.data), // logout
};