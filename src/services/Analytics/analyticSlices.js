// redux/slices/analyticsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

// Get auth headers
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * Fetch dashboard analytics overview
 * GET /api/analytics/dashboard
 */
export const fetchDashboardAnalytics = createAsyncThunk(
  "analytics/fetchDashboardAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      console.log("📊 Fetching dashboard analytics...");
      const res = await axios.get("/analytics/dashboard", getAuthHeaders());
      console.log("✅ Analytics response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Analytics fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics",
      );
    }
  },
);

/**
 * Fetch revenue trends
 * GET /api/analytics/revenue?period=daily|weekly|monthly
 */
export const fetchRevenueTrends = createAsyncThunk(
  "analytics/fetchRevenueTrends",
  async ({ period = "monthly" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `/analytics/revenue?period=${period}`, // ✏️ CHANGED: /revenue not /revenue-trends
        getAuthHeaders(),
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch revenue trends",
      );
    }
  },
);

/**
 * Fetch subscription analytics
 * GET /api/analytics/subscriptions
 */
export const fetchSubscriptionAnalytics = createAsyncThunk(
  "analytics/fetchSubscriptionAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/analytics/subscriptions", getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch subscription analytics",
      );
    }
  },
);

/**
 * Fetch user growth data
 * GET /api/analytics/users/growth?period=daily|monthly
 */
export const fetchUserGrowth = createAsyncThunk(
  "analytics/fetchUserGrowth",
  async ({ period = "monthly" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `/analytics/users/growth?period=${period}`, // ✏️ CHANGED: /users/growth not /user-growth
        getAuthHeaders(),
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user growth data",
      );
    }
  },
);

/**
 * ✨ NEW: Fetch top performing plans
 * GET /api/analytics/plans/top
 */
export const fetchTopPlans = createAsyncThunk(
  "analytics/fetchTopPlans",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/analytics/plans/top", getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch top plans",
      );
    }
  },
);

/**
 * ✨ NEW: Fetch payment methods analytics
 * GET /api/analytics/payments/methods
 */
export const fetchPaymentMethods = createAsyncThunk(
  "analytics/fetchPaymentMethods",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        "/analytics/payments/methods",
        getAuthHeaders(),
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment analytics",
      );
    }
  },
);

/**
 * ✨ NEW: Fetch RADIUS analytics
 * GET /api/analytics/radius
 */
export const fetchRadiusAnalytics = createAsyncThunk(
  "analytics/fetchRadiusAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/analytics/radius", getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch RADIUS analytics",
      );
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    // Dashboard overview
    dashboardData: null,
    loading: false,

    // Revenue trends
    revenueTrends: [],
    trendsLoading: false,

    // Subscription analytics
    subscriptionAnalytics: null,
    subscriptionsLoading: false,

    // User growth
    userGrowth: [],
    userGrowthLoading: false,

    // ✨ NEW: Top plans
    topPlans: [],
    topPlansLoading: false,

    // ✨ NEW: Payment methods
    paymentMethods: null,
    paymentMethodsLoading: false,

    // ✨ NEW: RADIUS analytics
    radiusAnalytics: null,
    radiusLoading: false,

    // Global error
    error: null,
  },
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    resetAnalytics: (state) => {
      state.dashboardData = null;
      state.revenueTrends = [];
      state.subscriptionAnalytics = null;
      state.userGrowth = [];
      state.topPlans = [];
      state.paymentMethods = null;
      state.radiusAnalytics = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Dashboard analytics ──
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardData = action.payload.data || action.payload;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch dashboard analytics";
      })

      // ── Revenue trends ──
      .addCase(fetchRevenueTrends.pending, (state) => {
        state.trendsLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueTrends.fulfilled, (state, action) => {
        state.trendsLoading = false;
        state.revenueTrends = action.payload.data || action.payload;
      })
      .addCase(fetchRevenueTrends.rejected, (state, action) => {
        state.trendsLoading = false;
        state.error = action.payload || "Failed to fetch revenue trends";
      })

      // ── Subscription analytics ──
      .addCase(fetchSubscriptionAnalytics.pending, (state) => {
        state.subscriptionsLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionAnalytics.fulfilled, (state, action) => {
        state.subscriptionsLoading = false;
        state.subscriptionAnalytics = action.payload.data || action.payload;
      })
      .addCase(fetchSubscriptionAnalytics.rejected, (state, action) => {
        state.subscriptionsLoading = false;
        state.error =
          action.payload || "Failed to fetch subscription analytics";
      })

      // ── User growth ──
      .addCase(fetchUserGrowth.pending, (state) => {
        state.userGrowthLoading = true;
        state.error = null;
      })
      .addCase(fetchUserGrowth.fulfilled, (state, action) => {
        state.userGrowthLoading = false;
        state.userGrowth = action.payload.data || action.payload;
      })
      .addCase(fetchUserGrowth.rejected, (state, action) => {
        state.userGrowthLoading = false;
        state.error = action.payload || "Failed to fetch user growth data";
      })

      // ── ✨ NEW: Top plans ──
      .addCase(fetchTopPlans.pending, (state) => {
        state.topPlansLoading = true;
        state.error = null;
      })
      .addCase(fetchTopPlans.fulfilled, (state, action) => {
        state.topPlansLoading = false;
        state.topPlans = action.payload.data || action.payload;
      })
      .addCase(fetchTopPlans.rejected, (state, action) => {
        state.topPlansLoading = false;
        state.error = action.payload || "Failed to fetch top plans";
      })

      // ── ✨ NEW: Payment methods ──
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethods = action.payload.data || action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.error = action.payload || "Failed to fetch payment analytics";
      })

      // ── ✨ NEW: RADIUS analytics ──
      .addCase(fetchRadiusAnalytics.pending, (state) => {
        state.radiusLoading = true;
        state.error = null;
      })
      .addCase(fetchRadiusAnalytics.fulfilled, (state, action) => {
        state.radiusLoading = false;
        state.radiusAnalytics = action.payload.data || action.payload;
      })
      .addCase(fetchRadiusAnalytics.rejected, (state, action) => {
        state.radiusLoading = false;
        state.error = action.payload || "Failed to fetch RADIUS analytics";
      });
  },
});

export const { clearAnalyticsError, resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
