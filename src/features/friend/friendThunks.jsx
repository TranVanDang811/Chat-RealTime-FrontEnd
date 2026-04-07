import { createAsyncThunk } from "@reduxjs/toolkit";
import friendAPI from "./friendAPI";

// ===== SEARCH USER BY PHONE =====
export const findUserByPhone = createAsyncThunk(
  "friend/findByPhone",
  async (phone, { rejectWithValue }) => {
    try {
      const res = await friendAPI.findByPhone(phone); // search user
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== SEND FRIEND REQUEST =====
export const sendFriendRequest = createAsyncThunk(
  "friend/sendRequest",
  async (receiverId, { rejectWithValue }) => {
    try {
      const res = await friendAPI.sendRequest(receiverId); // send request
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== ACCEPT FRIEND =====
export const acceptFriend = createAsyncThunk(
  "friend/accept",
  async (id, { rejectWithValue }) => {
    try {
      const res = await friendAPI.accept(id); // accept request
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== REJECT FRIEND =====
export const rejectFriend = createAsyncThunk(
  "friend/reject",
  async (id, { rejectWithValue }) => {
    try {
      await friendAPI.reject(id); // reject request
      return id; // return id to remove from state
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== GET FRIEND LIST =====
export const getFriends = createAsyncThunk(
  "friend/getFriends",
  async (_, { rejectWithValue }) => {
    try {
      const res = await friendAPI.getFriends(); // get all friends
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== GET INCOMING REQUESTS =====
export const getIncoming = createAsyncThunk(
  "friend/getIncoming",
  async (_, { rejectWithValue }) => {
    try {
      const res = await friendAPI.getIncoming(); // requests received
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== GET OUTGOING REQUESTS =====
export const getOutgoing = createAsyncThunk(
  "friend/getOutgoing",
  async (_, { rejectWithValue }) => {
    try {
      const res = await friendAPI.getOutgoing(); // requests sent
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);