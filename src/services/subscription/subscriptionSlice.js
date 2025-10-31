import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchSubscription = createAsyncThunk(
  "subscription/fetchSubscription",
  async (userId) => {
    const res = await axios.get(`/api/subscriptions/${userId}`);
    return res.data;
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState: {
    subscription: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default subscriptionSlice.reducer;
