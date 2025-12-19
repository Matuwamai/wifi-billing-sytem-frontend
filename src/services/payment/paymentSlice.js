import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;
// paymentSlice.js
export const startPayment = createAsyncThunk(
  "payment/startPayment",
  async (
    { phone, userId, planId, macAddress, deviceName },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post("/mpesa/pay", {
        phone,
        userId,
        planId,
        macAddress, // Add this
        deviceName, // Add this
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Payment failed");
    }
  }
);
export const fetchAllPayments = createAsyncThunk(
  "payment/fetchAllPayments",
  async (params) => {
    const res = await axios.get("/payments", { params });
    return res.data;
  }
);

export const fetchPaymentDetails = createAsyncThunk(
  "payment/fetchPaymentDetails",
  async (paymentId) => {
    const res = await axios.get(`/payments/${paymentId}`);
    return res.data;
  }
);

export const clearSelectedPayment = createAsyncThunk(
  "payment/clearSelectedPayment",
  async () => {
    return null;
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payment: null,
    payments: [],
    selectedPayment: null,
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.payment = null;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(startPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload;
        state.success = true;
      })
      .addCase(startPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
