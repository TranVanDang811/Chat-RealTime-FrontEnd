import { createAsyncThunk } from "@reduxjs/toolkit";
import userAPI from "./userAPI";

// ===== GET MY INFO =====
export const getMyInfo = createAsyncThunk(
  "user/getMyInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userAPI.getMyInfo(); // get current user
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== GET USER BY ID =====
export const getUserById = createAsyncThunk(
  "user/getById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await userAPI.getById(id); // get user by id
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== GET ALL USERS =====
export const getAllUsers = createAsyncThunk(
  "user/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userAPI.getAll(); // get all users
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== CREATE USER =====
export const createUser = createAsyncThunk(
  "user/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await userAPI.createUser(payload); // create user
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== DELETE USER =====
export const deleteUser = createAsyncThunk(
  "user/delete",
  async (id, { rejectWithValue }) => {
    try {
      await userAPI.deleteUser(id); // delete user
      return id; // return id to remove from state
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== UPLOAD AVATAR =====
export const uploadAvatar = createAsyncThunk(
  "user/uploadAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const res = await userAPI.uploadAvatar(file); // upload avatar
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

// ===== UPDATE PROFILE =====
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await userAPI.updateProfile(payload); // update profile
      return res.result || res;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);