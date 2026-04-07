import axiosInstance from "../../services/axiosInstance";

export default {
  // tìm user bằng phone
  findByPhone: (phone) =>
    axiosInstance.get(`/api/users/phone/${phone}`).then(res => res.data),

  // gửi lời mời
  sendRequest: (receiverId) =>
    axiosInstance.post(`/api/friends/request/${receiverId}`).then(res => res.data),

  // accept
  accept: (id) =>
    axiosInstance.put(`/api/friends/accept/${id}`).then(res => res.data),

  // reject
  reject: (id) =>
    axiosInstance.put(`/api/friends/reject/${id}`).then(res => res.data),

  //  danh sách bạn
  getFriends: () =>
    axiosInstance.get("/api/friends").then(res => res.data),

  //  incoming
  getIncoming: () =>
    axiosInstance.get("/api/friends/incoming").then(res => res.data),

  //  outgoing
  getOutgoing: () =>
    axiosInstance.get("/api/friends/outgoing").then(res => res.data),

  //  unfriend
  remove: (id) =>
    axiosInstance.delete(`/api/friends/${id}`).then(res => res.data),
};