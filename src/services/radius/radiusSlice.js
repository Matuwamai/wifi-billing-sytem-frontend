// redux/slices/radiusSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

// Auth headers helper
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * Get RADIUS statistics overview
 * GET /api/radius/stats
 */
export const fetchRadiusStats = createAsyncThunk(
  "radius/fetchRadiusStats",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📊 Fetching RADIUS stats...");
      const res = await axios.get("/radius/stats", getAuthHeaders());
      console.log("✅ RADIUS stats response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ RADIUS stats error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch RADIUS stats",
      );
    }
  },
);

/**
 * Get active RADIUS sessions
 * GET /api/radius/sessions?username=&limit=&offset=
 */
export const fetchActiveSessions = createAsyncThunk(
  "radius/fetchActiveSessions",
  async (
    { username = "", limit = 50, offset = 0 } = {},
    { rejectWithValue },
  ) => {
    try {
      console.log("📥 Fetching active sessions...");
      const res = await axios.get("/radius/sessions", {
        params: { username, limit, offset },
        ...getAuthHeaders(),
      });
      console.log("✅ Active sessions:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Active sessions error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch active sessions",
      );
    }
  },
);

/**
 * Get session history (all sessions including stopped)
 * GET /api/radius/sessions/history?username=&from=&to=&limit=&offset=
 */
export const fetchSessionHistory = createAsyncThunk(
  "radius/fetchSessionHistory",
  async (
    { username = "", from = "", to = "", limit = 100, offset = 0 } = {},
    { rejectWithValue },
  ) => {
    try {
      console.log("📥 Fetching session history...");
      const res = await axios.get("/radius/sessions/history", {
        params: { username, from, to, limit, offset },
        ...getAuthHeaders(),
      });
      console.log("✅ Session history:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Session history error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch session history",
      );
    }
  },
);

/**
 * Get list of RADIUS users
 * GET /api/radius/users?search=&limit=&offset=
 */
export const fetchRadiusUsers = createAsyncThunk(
  "radius/fetchRadiusUsers",
  async ({ search = "", limit = 50, offset = 0 } = {}, { rejectWithValue }) => {
    try {
      console.log("📥 Fetching RADIUS users...");
      const res = await axios.get("/radius/users", {
        params: { search, limit, offset },
        ...getAuthHeaders(),
      });
      console.log("✅ RADIUS users:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ RADIUS users error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch RADIUS users",
      );
    }
  },
);

/**
 * Get single RADIUS user details with sessions & usage
 * GET /api/radius/users/:username
 */
export const fetchRadiusUser = createAsyncThunk(
  "radius/fetchRadiusUser",
  async (username, { rejectWithValue }) => {
    try {
      console.log("📥 Fetching RADIUS user:", username);
      const res = await axios.get(
        `/radius/users/${username}`,
        getAuthHeaders(),
      );
      console.log("✅ RADIUS user details:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ RADIUS user error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch RADIUS user",
      );
    }
  },
);

/**
 * Disconnect user's active sessions
 * POST /api/radius/users/:username/disconnect
 */
export const disconnectUser = createAsyncThunk(
  "radius/disconnectUser",
  async (username, { rejectWithValue }) => {
    try {
      console.log("🔌 Disconnecting user:", username);
      const res = await axios.post(
        `/radius/users/${username}/disconnect`,
        {},
        getAuthHeaders(),
      );
      console.log("✅ User disconnected:", res.data);
      return { username, ...res.data };
    } catch (error) {
      console.error("❌ Disconnect error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to disconnect user",
      );
    }
  },
);

/**
 * Delete RADIUS user (remove from radcheck + radreply)
 * DELETE /api/radius/users/:username
 */
export const deleteRadiusUser = createAsyncThunk(
  "radius/deleteRadiusUser",
  async (username, { rejectWithValue }) => {
    try {
      console.log("🗑️ Deleting RADIUS user:", username);
      const res = await axios.delete(
        `/radius/users/${username}`,
        getAuthHeaders(),
      );
      console.log("✅ RADIUS user deleted:", res.data);
      return { username, ...res.data };
    } catch (error) {
      console.error("❌ Delete RADIUS user error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete RADIUS user",
      );
    }
  },
);

/**
 * Update user's speed limit
 * PATCH /api/radius/users/:username/speed
 */
export const updateUserSpeed = createAsyncThunk(
  "radius/updateUserSpeed",
  async ({ username, rateLimit }, { rejectWithValue }) => {
    try {
      console.log("⚡ Updating speed for:", username, "→", rateLimit);
      const res = await axios.patch(
        `/radius/users/${username}/speed`,
        { rateLimit },
        getAuthHeaders(),
      );
      console.log("✅ Speed updated:", res.data);
      return { username, rateLimit, ...res.data };
    } catch (error) {
      console.error("❌ Update speed error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update speed",
      );
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const radiusSlice = createSlice({
  name: "radius",
  initialState: {
    // Stats overview
    stats: null,
    statsLoading: false,

    // Active sessions
    activeSessions: [],
    activeSessionsTotal: 0,
    activeSessionsLoading: false,

    // Session history
    sessionHistory: [],
    sessionHistoryTotal: 0,
    historyLoading: false,

    // RADIUS users list
    radiusUsers: [],
    radiusUsersTotal: 0,
    radiusUsersLoading: false,

    // Selected RADIUS user details
    selectedRadiusUser: null,
    selectedUserLoading: false,

    // UI states
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRadiusUser: (state) => {
      state.selectedRadiusUser = null;
    },
    resetRadius: (state) => {
      state.stats = null;
      state.activeSessions = [];
      state.activeSessionsTotal = 0;
      state.sessionHistory = [];
      state.sessionHistoryTotal = 0;
      state.radiusUsers = [];
      state.radiusUsersTotal = 0;
      state.selectedRadiusUser = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch RADIUS stats ──
      .addCase(fetchRadiusStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchRadiusStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data || action.payload;
      })
      .addCase(fetchRadiusStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // ── Fetch active sessions ──
      .addCase(fetchActiveSessions.pending, (state) => {
        state.activeSessionsLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveSessions.fulfilled, (state, action) => {
        state.activeSessionsLoading = false;
        state.activeSessions = action.payload.data || action.payload;
        state.activeSessionsTotal =
          action.payload.total || state.activeSessions.length;
      })
      .addCase(fetchActiveSessions.rejected, (state, action) => {
        state.activeSessionsLoading = false;
        state.error = action.payload;
      })

      // ── Fetch session history ──
      .addCase(fetchSessionHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchSessionHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.sessionHistory = action.payload.data || action.payload;
        state.sessionHistoryTotal =
          action.payload.total || state.sessionHistory.length;
      })
      .addCase(fetchSessionHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      })

      // ── Fetch RADIUS users ──
      .addCase(fetchRadiusUsers.pending, (state) => {
        state.radiusUsersLoading = true;
        state.error = null;
      })
      .addCase(fetchRadiusUsers.fulfilled, (state, action) => {
        state.radiusUsersLoading = false;
        state.radiusUsers = action.payload.data || action.payload;
        state.radiusUsersTotal =
          action.payload.total || state.radiusUsers.length;
      })
      .addCase(fetchRadiusUsers.rejected, (state, action) => {
        state.radiusUsersLoading = false;
        state.error = action.payload;
      })

      // ── Fetch RADIUS user details ──
      .addCase(fetchRadiusUser.pending, (state) => {
        state.selectedUserLoading = true;
        state.error = null;
      })
      .addCase(fetchRadiusUser.fulfilled, (state, action) => {
        state.selectedUserLoading = false;
        state.selectedRadiusUser = action.payload.data || action.payload;
      })
      .addCase(fetchRadiusUser.rejected, (state, action) => {
        state.selectedUserLoading = false;
        state.error = action.payload;
      })

      // ── Disconnect user ──
      .addCase(disconnectUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(disconnectUser.fulfilled, (state, action) => {
        state.loading = false;
        const username = action.payload.username;

        // Remove from active sessions list
        state.activeSessions = state.activeSessions.filter(
          (s) => s.username !== username,
        );
        state.activeSessionsTotal = Math.max(0, state.activeSessionsTotal - 1);

        // Update selected user if it's the same
        if (state.selectedRadiusUser?.username === username) {
          state.selectedRadiusUser.activeSessions = 0;
        }
      })
      .addCase(disconnectUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Delete RADIUS user ──
      .addCase(deleteRadiusUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRadiusUser.fulfilled, (state, action) => {
        state.loading = false;
        const username = action.payload.username;

        // Remove from RADIUS users list
        state.radiusUsers = state.radiusUsers.filter(
          (u) => u.username !== username,
        );
        state.radiusUsersTotal = Math.max(0, state.radiusUsersTotal - 1);

        // Clear selected if it was deleted
        if (state.selectedRadiusUser?.username === username) {
          state.selectedRadiusUser = null;
        }
      })
      .addCase(deleteRadiusUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Update user speed ──
      .addCase(updateUserSpeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserSpeed.fulfilled, (state, action) => {
        state.loading = false;
        const { username, rateLimit } = action.payload;

        // Update in RADIUS users list
        const index = state.radiusUsers.findIndex(
          (u) => u.username === username,
        );
        if (index !== -1) {
          // Assuming the user object has a rateLimit field
          state.radiusUsers[index].rateLimit = rateLimit;
        }

        // Update selected user
        if (state.selectedRadiusUser?.username === username) {
          state.selectedRadiusUser.rateLimit = rateLimit;
        }
      })
      .addCase(updateUserSpeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedRadiusUser, resetRadius } =
  radiusSlice.actions;

export default radiusSlice.reducer;
