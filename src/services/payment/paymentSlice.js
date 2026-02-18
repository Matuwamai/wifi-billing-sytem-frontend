// redux/slices/paymentSlice.js
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
 * Initiate M-Pesa STK push payment
 * POST /api/payments/initiate
 */
export const startPayment = createAsyncThunk(
  "payment/startPayment",
  async (
    {
      phone,
      userId,
      planId,
      macAddress,
      deviceName,
      deviceHostname,
      suggestedUsername,
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.post("/payments/initiate", {
        phone,
        userId,
        planId,
        macAddress,
        deviceName,
        deviceHostname, // ✨ NEW: for username generation
        suggestedUsername, // ✨ NEW: optional username hint
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Payment initiation failed",
      );
    }
  },
);

/**
 * Check payment status by checkout request ID (for polling)
 * GET /api/payments/status/:checkoutRequestId
 */
export const checkPaymentStatus = createAsyncThunk(
  "payment/checkPaymentStatus",
  async (checkoutRequestId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/payments/status/${checkoutRequestId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check payment status",
      );
    }
  },
);

/**
 * Fetch all payments (admin only)
 * GET /api/payments?search=&status=&limit=&offset=
 */
export const fetchAllPayments = createAsyncThunk(
  "payment/fetchAllPayments",
  async (
    { search = "", status = "", limit = 50, offset = 0 } = {},
    { rejectWithValue },
  ) => {
    try {
      console.log("📥 Fetching payments with params:", {
        search,
        status,
        limit,
        offset,
      });
      const res = await axios.get("/payments", {
        params: { search, status, limit, offset },
        ...getAuthHeaders(),
      });
      console.log("✅ Payments API response:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Payments fetch error:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payments",
      );
    }
  },
);

/**
 * Fetch single payment details (admin only)
 * GET /api/payments/:id
 */
export const fetchPaymentDetails = createAsyncThunk(
  "payment/fetchPaymentDetails",
  async (paymentId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/payments/${paymentId}`, getAuthHeaders());
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payment details",
      );
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    // List of payments (admin view)
    payments: [],
    total: 0, // ✨ NEW: total count for pagination

    // Single payment details
    selectedPayment: null,
    detailsLoading: false,

    // Payment initiation
    currentPayment: null, // ✨ NEW: the payment being processed
    checkoutRequestId: null, // ✨ NEW: for status polling
    paymentStatus: null, // ✨ NEW: PENDING | SUCCESS | FAILED

    // UI states
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetPaymentState: (state) => {
      state.payments = [];
      state.total = 0;
      state.selectedPayment = null;
      state.currentPayment = null;
      state.checkoutRequestId = null;
      state.paymentStatus = null;
      state.success = false;
      state.error = null;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.checkoutRequestId = null;
      state.paymentStatus = null;
      state.success = false;
      state.error = null;
    },
    // Manual status update (for optimistic UI)
    setPaymentStatus: (state, action) => {
      state.paymentStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Start payment ──
      .addCase(startPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(startPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentPayment = action.payload.payment || action.payload;
        state.checkoutRequestId =
          action.payload.stkResponse?.CheckoutRequestID || null;
        state.paymentStatus = "PENDING";
      })
      .addCase(startPayment.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Payment failed";
      })

      // ── Check payment status ──
      .addCase(checkPaymentStatus.pending, (state) => {
        // Don't set loading to avoid UI flicker during polling
        state.error = null;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.paymentStatus = action.payload.status || "PENDING";
        if (action.payload.status === "SUCCESS") {
          state.success = true;
        }
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        // Don't treat polling errors as critical
        console.warn("Payment status check failed:", action.payload);
      })

      // ── Fetch all payments ──
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data || action.payload.payments || [];
        state.total = action.payload.total || state.payments.length;
        console.log(
          "✅ Updated payments in state:",
          state.payments.length,
          "total:",
          state.total,
        );
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch payments";
      })

      // ── Fetch payment details ──
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
      });
  },
});

export const {
  resetPaymentState,
  clearSelectedPayment,
  clearCurrentPayment,
  setPaymentStatus,
} = paymentSlice.actions;

export default paymentSlice.reducer;
