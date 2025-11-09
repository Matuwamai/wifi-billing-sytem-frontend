import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

// Get user's subscriptions
export const fetchUserSubscriptions = createAsyncThunk(
  "subscription/fetchUserSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/subscriptions/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
    }
  }
);

// Admin: Get all subscriptions
export const fetchAllSubscriptions = createAsyncThunk(
  "subscription/fetchAllSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/subscriptions/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch all subscriptions"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    subscriptions: [],
    allSubscriptions: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user subscriptions
      .addCase(fetchUserSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchUserSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all subscriptions (admin)
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.allSubscriptions = action.payload;
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
