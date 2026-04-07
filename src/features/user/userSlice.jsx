import { createSlice } from "@reduxjs/toolkit";
import {
  getMyInfo,
  getUserById,
  getAllUsers,
  createUser,
  deleteUser,
  uploadAvatar,
  updateProfile
} from "./userThunks";

// ===== INITIAL STATE =====
const initialState = {
  myInfo: null,        // current user info
  selectedUser: null,  // user detail
  users: [],           // user list
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // clear selected user
    clearSelectedUser(state) {
      state.selectedUser = null;
    },

    // clear error
    clearUserError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===== GET MY INFO =====
      .addCase(getMyInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.myInfo = action.payload;
      })
      .addCase(getMyInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET USER BY ID =====
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET ALL USERS =====
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== CREATE USER =====
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload); // add new user
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== DELETE USER =====
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (u) => u.id !== action.payload
        ); // remove user
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPLOAD AVATAR =====
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.myInfo = action.payload; // update avatar
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPDATE PROFILE =====
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myInfo = action.payload; // update profile
      });
  },
});

export const { clearSelectedUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;