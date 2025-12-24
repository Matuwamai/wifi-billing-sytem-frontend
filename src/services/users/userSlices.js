// services/user/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Fetch all users (Admin)
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching users...");
      const res = await axios.get("/user", getAuthHeaders());
      console.log("Users API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Users fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Fetch user profile/details
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("Fetching user profile for ID:", userId);
      const res = await axios.get(`/user/profile/${userId}`, getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);

// Block/Unblock user
export const toggleUserStatus = createAsyncThunk(
  "user/toggleUserStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `/user/${userId}/status`,
        { status },
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    selectedUser: null,
    loading: false,
    detailsLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response structures
        if (action.payload.users) {
          state.users = action.payload.users;
        } else if (action.payload.data) {
          state.users = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.users = action.payload;
        }
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch users";
      })

      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedUser = action.payload.user || action.payload.data;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch user profile";
      })

      // Toggle user status
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update user in list
        const updatedUser = action.payload.user || action.payload.data;
        const index = state.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        // Update selected user if it's the same
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
