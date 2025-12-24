import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;
// paymentSlice.js
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
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
  async (params, { rejectWithValue }) => {
    try {
      console.log("Fetching payments with params:", params);
      const res = await axios.get("/mpesa", {
        params,
        ...getAuthHeaders(),
      });
      console.log("Payments API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Payments fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payments"
      );
    }
  }
);

export const fetchPaymentDetails = createAsyncThunk(
  "payment/fetchPaymentDetails",
  async (paymentId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/mpesa/${paymentId}`, getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment details"
      );
    }
  }
);

// export const clearSelectedPayment = createAsyncThunk(
//   "payment/clearSelectedPayment",
//   async () => {
//     return null;
//   }
// );

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payments: [], // This will store the payments array
    data: null, // This stores the full API response
    selectedPayment: null,
    loading: false,
    detailsLoading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.payments = [];
      state.data = null;
      state.selectedPayment = null;
      state.success = false;
      state.error = null;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all payments
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Store full response
        // Extract payments array from response (could be in data or directly)
        state.payments =
          action.payload.data ||
          action.payload.payments ||
          action.payload ||
          [];
        console.log("Updated payments in state:", state.payments);
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch payments";
      })

      // Fetch payment details
      .addCase(fetchPaymentDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedPayment = action.payload.data || action.payload;
      })
      .addCase(fetchPaymentDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch payment details";
      })

      // Start payment
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

export const { resetPaymentState, clearSelectedPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
