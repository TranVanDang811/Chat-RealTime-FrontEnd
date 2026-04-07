import { createSlice } from "@reduxjs/toolkit";
import {
  findUserByPhone,
  sendFriendRequest,
  acceptFriend,
  rejectFriend,
  getFriends,
  getIncoming,
  getOutgoing,
} from "./friendThunks";

// ===== INITIAL STATE =====
const initialState = {
  searchUser: null, // result from search
  friends: [],      // friend list
  incoming: [],     // received requests
  outgoing: [],     // sent requests
  loading: false,
  error: null,
};

const friendSlice = createSlice({
  name: "friend",
  initialState,
  reducers: {
    // clear search result
    clearSearchUser(state) {
      state.searchUser = null;
    },

    // ===== REALTIME =====

    // add incoming request
    addIncomingRequest(state, action) {
      state.incoming.unshift(action.payload);
    },

    // add new friend
    addFriend(state, action) {
      state.friends.unshift(action.payload);
    },

    // remove incoming request
    removeIncoming(state, action) {
      state.incoming = state.incoming.filter(
        (f) => f.id !== action.payload
      );
    },

    // remove outgoing request
    removeOutgoing(state, action) {
      state.outgoing = state.outgoing.filter(
        (f) => f.id !== action.payload
      );
    },

    // add outgoing request
    addOutgoing(state, action) {
      state.outgoing.unshift(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder

      // ===== SEARCH USER =====
      .addCase(findUserByPhone.fulfilled, (state, action) => {
        state.searchUser = action.payload;
      })

      // ===== GET INCOMING REQUESTS =====
      .addCase(getIncoming.fulfilled, (state, action) => {
        state.incoming = action.payload;
      })

      // ===== GET FRIENDS =====
      .addCase(getFriends.fulfilled, (state, action) => {
        state.friends = action.payload;
      })

      // ===== ACCEPT FRIEND =====
      .addCase(acceptFriend.fulfilled, (state, action) => {
        const friend = action.payload;

        // remove from requests
        state.incoming = state.incoming.filter(f => f.id !== friend.id);
        state.outgoing = state.outgoing.filter(f => f.id !== friend.id);

        // add to friend list
        if (friend.user) {
          state.friends.unshift(friend);
        }
      })

      // ===== REJECT FRIEND =====
      .addCase(rejectFriend.fulfilled, (state, action) => {
        state.incoming = state.incoming.filter(
          f => f.id !== action.payload
        );
      })

      // ===== GET OUTGOING REQUESTS =====
      .addCase(getOutgoing.fulfilled, (state, action) => {
        state.outgoing = action.payload;
      })

      // ===== SEND FRIEND REQUEST =====
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        if (action.payload) {
          state.outgoing.unshift(action.payload);
        }
      });
  },
});

export const {
  clearSearchUser,
  addIncomingRequest,
  addFriend,
  removeIncoming,
  removeOutgoing,
  addOutgoing,
} = friendSlice.actions;

export default friendSlice.reducer;