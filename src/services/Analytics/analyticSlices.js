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

// Fetch dashboard analytics
export const fetchDashboardAnalytics = createAsyncThunk(
  "analytics/fetchDashboardAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching dashboard analytics...");
      const res = await axios.get("/analytics/dashboard", getAuthHeaders());
      console.log("Analytics API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Analytics fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch analytics"
      );
    }
  }
);

// Fetch revenue trends
export const fetchRevenueTrends = createAsyncThunk(
  "analytics/fetchRevenueTrends",
  async ({ period = "monthly" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `/analytics/revenue-trends?period=${period}`,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch revenue trends"
      );
    }
  }
);

// Fetch subscription analytics
export const fetchSubscriptionAnalytics = createAsyncThunk(
  "analytics/fetchSubscriptionAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/analytics/subscriptions", getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch subscription analytics"
      );
    }
  }
);

// Fetch user growth data
export const fetchUserGrowth = createAsyncThunk(
  "analytics/fetchUserGrowth",
  async ({ period = "monthly" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `/analytics/user-growth?period=${period}`,
        getAuthHeaders()
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user growth data"
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    dashboardData: null,
    revenueTrends: [],
    subscriptionAnalytics: null,
    userGrowth: [],
    loading: false,
    trendsLoading: false,
    subscriptionsLoading: false,
    userGrowthLoading: false,
    error: null,
  },
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard analytics
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
      // Revenue trends
      .addCase(fetchRevenueTrends.pending, (state) => {
        state.trendsLoading = true;
      })
      .addCase(fetchRevenueTrends.fulfilled, (state, action) => {
        state.trendsLoading = false;
        state.revenueTrends = action.payload.data || action.payload;
      })
      .addCase(fetchRevenueTrends.rejected, (state, action) => {
        state.trendsLoading = false;
        state.error = action.payload || "Failed to fetch revenue trends";
      })
      // Subscription analytics
      .addCase(fetchSubscriptionAnalytics.pending, (state) => {
        state.subscriptionsLoading = true;
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
      // User growth
      .addCase(fetchUserGrowth.pending, (state) => {
        state.userGrowthLoading = true;
      })
      .addCase(fetchUserGrowth.fulfilled, (state, action) => {
        state.userGrowthLoading = false;
        state.userGrowth = action.payload.data || action.payload;
      })
      .addCase(fetchUserGrowth.rejected, (state, action) => {
        state.userGrowthLoading = false;
        state.error = action.payload || "Failed to fetch user growth data";
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
