import { createAsyncThunk } from "@reduxjs/toolkit";
import authAPI from "./authAPI";
import { clearTokens, setTokens } from "../../services/axiosInstance";
import userAPI from "../user/userAPI";

// ===== LOGIN =====
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // 1. call API login -> get token
      const authRes = await authAPI.login(credentials);
      const authPayload = authRes.result || authRes;

      const token = authPayload.token || authPayload.accessToken;
      const refreshToken = authPayload.refreshToken;

      // 2. save token (localStorage + axios)
      setTokens({ token, refreshToken });

      // 3. get user info
      const userRes = await userAPI.getMyInfo();
      const user = userRes.result || userRes;

      // 4. return data -> save to Redux
      return { token, refreshToken, user };
    } catch (e) {
      // error -> clear token
      clearTokens();
      return rejectWithValue(
        e.response?.data?.message || e.message || "Login failed"
      );
    }
  }
);

// ===== REFRESH TOKEN =====
export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      // 1. get refreshToken from localStorage
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      // 2. call API refresh
      const res = await authAPI.refresh({ refreshToken });
      const payload = res.result || res;

      const newToken = payload.token || payload.accessToken;
      const newRefreshToken = payload.refreshToken;

      // 3. save new token
      setTokens({ token: newToken, refreshToken: newRefreshToken });

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (e) {
      // refresh fail -> logout
      clearTokens();
      return rejectWithValue(
        e.response?.data?.message || e.message || "Refresh failed"
      );
    }
  }
);

// ===== LOGOUT =====
export const logout = createAsyncThunk(
  "auth/logout",
  async (payload) => {
    try {
      const token = payload?.token || localStorage.getItem("token");
      const refreshToken = payload?.refreshToken || localStorage.getItem("refreshToken");
      // call API logout
      await authAPI.logout({ token, refreshToken });
    } catch (e) {
      // ignore error (vẫn logout)
      console.error("Logout API error:", e);
    } finally {
      // luôn clear token
      clearTokens();
    }
  }
);

// ===== RESTORE SESSION (reload page) =====
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      // 1. get token from localStorage
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token) return rejectWithValue("No token");

      // 2. call API to check token + get user
      const userRes = await userAPI.getMyInfo();
      const user = userRes.result || userRes;

      // 3. restore login state
      return { token, refreshToken, user };
    } catch (e) {
      // token invalid -> clear
      clearTokens();
      return rejectWithValue(e.response?.data || e.message);
    }
  }
);

// ===== REGISTER =====
export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      // 1. call API register
      const res = await authAPI.register(payload);
      const authPayload = res.result || res;

      const token = authPayload.token || authPayload.accessToken;
      const refreshToken = authPayload.refreshToken;

      // 2. save token (auto login after register)
      setTokens({ token, refreshToken });

      // 3. get user info
      const userRes = await userAPI.getMyInfo();
      const user = userRes.result || userRes;

      return { token, refreshToken, user };
    } catch (e) {
      clearTokens();
      return rejectWithValue(
        e.response?.data?.message || e.message || "Register failed"
      );
    }
  }
);