// redux/slices/subscriptionSlice.js
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
 * Get current user's subscriptions
 * GET /api/subscriptions/my
 */
export const fetchUserSubscriptions = createAsyncThunk(
  "subscription/fetchUserSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/subscriptions/my", getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions",
      );
    }
  },
);

/**
 * Get current user's active subscription
 * GET /api/subscriptions/my/active
 */
export const fetchActiveSubscription = createAsyncThunk(
  "subscription/fetchActiveSubscription",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/subscriptions/my/active", getAuthHeaders());
      return res.data;
    } catch (error) {
      // 404 is normal if no active subscription
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch active subscription",
      );
    }
  },
);

/**
 * Get subscription usage (data usage + active sessions)
 * GET /api/subscriptions/:id/usage
 */
export const fetchSubscriptionUsage = createAsyncThunk(
  "subscription/fetchSubscriptionUsage",
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `/subscriptions/${subscriptionId}/usage`,
        getAuthHeaders(),
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch usage data",
      );
    }
  },
);

/**
 * Admin: Get all subscriptions with filters
 * GET /api/subscriptions?status=&userId=&limit=&offset=
 */
export const fetchAllSubscriptions = createAsyncThunk(
  "subscription/fetchAllSubscriptions",
  async (
    { status = "", userId = "", limit = 50, offset = 0 } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.get("/subscriptions", {
        params: { status, userId, limit, offset },
        ...getAuthHeaders(),
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all subscriptions",
      );
    }
  },
);

/**
 * Get single subscription details
 * GET /api/subscriptions/:id
 */
export const fetchSubscriptionDetails = createAsyncThunk(
  "subscription/fetchSubscriptionDetails",
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `/subscriptions/${subscriptionId}`,
        getAuthHeaders(),
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscription details",
      );
    }
  },
);

/**
 * Admin: Manually expire a subscription
 * POST /api/subscriptions/:id/expire
 */
export const expireSubscription = createAsyncThunk(
  "subscription/expireSubscription",
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/subscriptions/${subscriptionId}/expire`,
        {},
        getAuthHeaders(),
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to expire subscription",
      );
    }
  },
);

/**
 * Admin: Batch expire stale subscriptions
 * POST /api/subscriptions/expire-stale
 */
export const expireStaleSubscriptions = createAsyncThunk(
  "subscription/expireStaleSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        "/subscriptions/expire-stale",
        {},
        getAuthHeaders(),
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to expire stale subscriptions",
      );
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    // User's subscriptions
    subscriptions: [],
    subscriptionsLoading: false,

    // Active subscription
    activeSubscription: null,
    activeLoading: false,

    // Usage data
    usageData: null,
    usageLoading: false,

    // Admin: all subscriptions
    allSubscriptions: [],
    total: 0,
    allLoading: false,

    // Selected subscription details
    selectedSubscription: null,
    detailsLoading: false,

    // Global error
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSubscription: (state) => {
      state.selectedSubscription = null;
    },
    clearUsageData: (state) => {
      state.usageData = null;
    },
    resetSubscriptions: (state) => {
      state.subscriptions = [];
      state.activeSubscription = null;
      state.allSubscriptions = [];
      state.total = 0;
      state.selectedSubscription = null;
      state.usageData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch user subscriptions ──
      .addCase(fetchUserSubscriptions.pending, (state) => {
        state.subscriptionsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSubscriptions.fulfilled, (state, action) => {
        state.subscriptionsLoading = false;
        state.subscriptions = action.payload.data || action.payload;
      })
      .addCase(fetchUserSubscriptions.rejected, (state, action) => {
        state.subscriptionsLoading = false;
        state.error = action.payload;
      })

      // ── Fetch active subscription ──
      .addCase(fetchActiveSubscription.pending, (state) => {
        state.activeLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveSubscription.fulfilled, (state, action) => {
        state.activeLoading = false;
        state.activeSubscription = action.payload?.data || action.payload;
      })
      .addCase(fetchActiveSubscription.rejected, (state, action) => {
        state.activeLoading = false;
        state.activeSubscription = null; // No active sub is normal
      })

      // ── Fetch subscription usage ──
      .addCase(fetchSubscriptionUsage.pending, (state) => {
        state.usageLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionUsage.fulfilled, (state, action) => {
        state.usageLoading = false;
        state.usageData = action.payload.data || action.payload;
      })
      .addCase(fetchSubscriptionUsage.rejected, (state, action) => {
        state.usageLoading = false;
        state.error = action.payload;
      })

      // ── Fetch all subscriptions (admin) ──
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.allLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.allLoading = false;
        state.allSubscriptions = action.payload.data || action.payload;
        state.total = action.payload.total || state.allSubscriptions.length;
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.allLoading = false;
        state.error = action.payload;
      })

      // ── Fetch subscription details ──
      .addCase(fetchSubscriptionDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedSubscription = action.payload.data || action.payload;
      })
      .addCase(fetchSubscriptionDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // ── Expire subscription ──
      .addCase(expireSubscription.pending, (state) => {
        state.error = null;
      })
      .addCase(expireSubscription.fulfilled, (state, action) => {
        // Update the expired subscription in the list
        const expiredId = action.payload.subscriptionId;
        state.allSubscriptions = state.allSubscriptions.map((sub) =>
          sub.id === expiredId ? { ...sub, status: "EXPIRED" } : sub,
        );
        if (state.selectedSubscription?.id === expiredId) {
          state.selectedSubscription.status = "EXPIRED";
        }
      })
      .addCase(expireSubscription.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ── Expire stale subscriptions ──
      .addCase(expireStaleSubscriptions.pending, (state) => {
        state.error = null;
      })
      .addCase(expireStaleSubscriptions.fulfilled, (state) => {
        // Success - might want to refetch the list
      })
      .addCase(expireStaleSubscriptions.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSelectedSubscription,
  clearUsageData,
  resetSubscriptions,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
