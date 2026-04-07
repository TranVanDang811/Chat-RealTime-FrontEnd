import { createAsyncThunk } from "@reduxjs/toolkit";
import chatApi from "./chatApi";

// ===== SEND MESSAGE =====
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (payload, { rejectWithValue }) => {
    try {
      return await chatApi.sendMessage(payload); // call API send message
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message); // handle error
    }
  }
);

// ===== GET MESSAGES =====
export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async ({ roomId, page = 0, size = 20 }, { rejectWithValue }) => {
    try {
      const result = await chatApi.getMessages(roomId, page, size);
      // ensure always return array
      const messages = Array.isArray(result)
        ? result
        : result?.result ?? [];
      return messages;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== CREATE PRIVATE ROOM =====
export const createPrivateRoom = createAsyncThunk(
  "chat/createPrivateRoom",
  async (userId, { rejectWithValue }) => {
    try {
      return await chatApi.createPrivateRoom(userId); // create 1-1 room
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== CREATE GROUP ROOM =====
export const createGroupRoom = createAsyncThunk(
  "chat/createGroupRoom",
  async (payload, { rejectWithValue }) => {
    try {
      return await chatApi.createGroupRoom(payload); // create group
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== GET ROOMS =====
export const getRooms = createAsyncThunk(
  "chat/getRooms",
  async (_, { rejectWithValue }) => {
    try {
      return await chatApi.getRooms(); // get all rooms
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== UPDATE ROOM NAME =====
export const updateRoomName = createAsyncThunk(
  "chat/updateRoomName",
  async (payload, { rejectWithValue }) => {
    try {
      return await chatApi.updateRoomName(payload); // update room name
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== MARK AS SEEN =====
export const markAsSeen = createAsyncThunk(
  "chat/markAsSeen",
  async (roomId, { rejectWithValue }) => {
    try {
      await chatApi.markAsSeen(roomId); // mark messages as read
      return roomId; // return roomId only
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== ADD MEMBERS =====
export const addRoomMembers = createAsyncThunk(
  "chat/addRoomMembers",
  async ({ roomId, memberIds }, { rejectWithValue }) => {
    try {
      return await chatApi.addRoomMembers({ roomId, memberIds }); // add users
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);