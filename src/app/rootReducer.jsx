import { combineReducers } from "@reduxjs/toolkit";

// Import reducers from different features/modules
import userReducer from "../features/user/userSlice";     // Handles user-related state (profile, list, etc.)
import chatReducer from "../features/chat/chatSlice";     // Handles chat state (messages, rooms, etc.)
import authReducer from "../features/auth/authSlice";     // Handles authentication (login, token, user info)
import friendReducer from "../features/friend/friendSlice"; // Handles friend-related state (friend list, requests, etc.)

// Combine all reducers into a single root reducer
export default combineReducers({
    auth: authReducer,     // Authentication state
    user: userReducer,     // User management state
    chat: chatReducer,     // Chat system state
    friend: friendReducer, // Friend system state
}); 