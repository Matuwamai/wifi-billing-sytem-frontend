// redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * Admin: Fetch all users with filters
 * GET /api/users?search=&status=&role=&isGuest=&limit=&offset=
 */
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (
    {
      search = "",
      status = "",
      role = "",
      isGuest = "",
      limit = 50,
      offset = 0,
    } = {},
    { rejectWithValue },
  ) => {
    try {
      console.log("📥 Fetching users with params:", {
        search,
        status,
        role,
        isGuest,
        limit,
        offset,
      });
      const res = await axios.get("/users", {
        params: { search, status, role, isGuest, limit, offset },
        ...getAuthHeaders(),
      });
      console.log("✅ Users API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Users fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users",
      );
    }
  },
);

/**
 * Fetch user profile/details
 * GET /api/users/:id
 */
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (userId, { rejectWithValue }) => {
    try {
      console.log("📥 Fetching user profile for ID:", userId);
      const res = await axios.get(`/users/profile/${userId}`, getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile",
      );
    }
  },
);

/**
 * Update user information
 * PATCH /api/users/:id
 */
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `/users/profile/${userId}`,
        updates,
        getAuthHeaders(),
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user",
      );
    }
  },
);

/**
 * Admin: Block a user
 * POST /api/users/:id/block
 */
export const blockUser = createAsyncThunk(
  "user/blockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/users/${userId}/block`,
        {},
        getAuthHeaders(),
      );
      return { userId, ...res.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to block user",
      );
    }
  },
);

/**
 * Admin: Unblock a user
 * POST /api/users/:id/unblock
 */
export const unblockUser = createAsyncThunk(
  "user/unblockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/users/${userId}/unblock`,
        {},
        getAuthHeaders(),
      );
      return { userId, ...res.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unblock user",
      );
    }
  },
);

/**
 * Admin: Delete a user
 * DELETE /api/users/:id
 */
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/users/${userId}`, getAuthHeaders());
      return { userId, ...res.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user",
      );
    }
  },
);

/**
 * Get user connection status (subscription + RADIUS session)
 * GET /api/users/:id/status
 */
export const fetchUserStatus = createAsyncThunk(
  "user/fetchUserStatus",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/users/${userId}/status`, getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user status",
      );
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const userSlice = createSlice({
  name: "user",
  initialState: {
    // Users list (admin)
    users: [],
    total: 0,
    loading: false,

    // Selected user details
    selectedUser: null,
    detailsLoading: false,

    // User status (connection info)
    userStatus: null,
    statusLoading: false,

    // Global error
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.userStatus = null;
    },
    resetUsers: (state) => {
      state.users = [];
      state.total = 0;
      state.selectedUser = null;
      state.userStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch all users ──
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data || action.payload;
        state.total = action.payload.total || state.users.length;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch user profile ──
      .addCase(fetchUserProfile.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedUser = action.payload.data || action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // ── Update user ──
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data || action.payload;

        // Update in users list
        const index = state.users.findIndex((u) => u.id === updated.id);
        if (index !== -1) {
          state.users[index] = updated;
        }

        // Update selected user
        if (state.selectedUser?.id === updated.id) {
          state.selectedUser = updated;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Block user ──
      .addCase(blockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockUser.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload.userId;

        // Update status in users list
        const index = state.users.findIndex((u) => u.id === userId);
        if (index !== -1) {
          state.users[index].status = "BLOCKED";
        }

        // Update selected user
        if (state.selectedUser?.id === userId) {
          state.selectedUser.status = "BLOCKED";
        }
      })
      .addCase(blockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Unblock user ──
      .addCase(unblockUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unblockUser.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload.userId;

        // Update status in users list
        const index = state.users.findIndex((u) => u.id === userId);
        if (index !== -1) {
          state.users[index].status = "ACTIVE";
        }

        // Update selected user
        if (state.selectedUser?.id === userId) {
          state.selectedUser.status = "ACTIVE";
        }
      })
      .addCase(unblockUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Delete user ──
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload.userId;

        // Remove from users list
        state.users = state.users.filter((u) => u.id !== userId);
        state.total = Math.max(0, state.total - 1);

        // Clear selected if it was deleted
        if (state.selectedUser?.id === userId) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Fetch user status ──
      .addCase(fetchUserStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.userStatus = action.payload.data || action.payload;
      })
      .addCase(fetchUserStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedUser, resetUsers } = userSlice.actions;
export default userSlice.reducer;
