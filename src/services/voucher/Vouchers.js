// redux/slices/voucherSlice.js
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
 * Admin: Fetch all vouchers with filters
 * GET /api/vouchers/list?status=&planId=&page=&limit=
 */
export const fetchVouchers = createAsyncThunk(
  "voucher/fetchVouchers",
  async (
    { status = "", planId = "", page = 1, limit = 50 } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.get("/vouchers/list", {
        params: { status, planId, page, limit },
        ...getAuthHeaders(),
      });
      console.log("✅ Fetch vouchers response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Fetch vouchers error:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch vouchers",
      );
    }
  },
);

/**
 * Check voucher validity (no auth required)
 * GET /api/vouchers/check/:code
 */
export const confirmVoucher = createAsyncThunk(
  "voucher/confirmVoucher",
  async (code, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/vouchers/check/${code}`);
      console.log("✅ Confirm voucher response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Confirm voucher error:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Invalid voucher code",
      );
    }
  },
);

/**
 * Redeem voucher (no auth required - creates user if needed)
 * POST /api/vouchers/redeem
 */
export const redeemVoucher = createAsyncThunk(
  "voucher/redeemVoucher",
  async (
    { voucherCode, phone, deviceName, ipAddress, userAgent },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.post("/vouchers/redeem", {
        voucherCode,
        phone,
        deviceName,
        ipAddress,
        userAgent,
      });
      console.log("✅ Redeem voucher response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Redeem voucher error:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to redeem voucher",
      );
    }
  },
);

/**
 * Admin: Create voucher(s)
 * POST /api/vouchers/create
 */
export const createVoucher = createAsyncThunk(
  "voucher/createVoucher",
  async (
    { planId, quantity = 1, expiresInDays = 30, adminId },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.post(
        "/vouchers/create",
        { planId, quantity, expiresInDays, adminId },
        getAuthHeaders(),
      );
      console.log("✅ Create voucher response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Create voucher error:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to create voucher",
      );
    }
  },
);

/**
 * Admin: Delete voucher
 * DELETE /api/vouchers/:id
 */
export const deleteVoucher = createAsyncThunk(
  "voucher/deleteVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `/vouchers/${voucherId}`,
        getAuthHeaders(),
      );
      console.log("✅ Delete voucher response:", res.data);
      return { id: voucherId, ...res.data };
    } catch (error) {
      console.error(
        "❌ Delete voucher error:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete voucher",
      );
    }
  },
);

/**
 * Admin: Manually expire old vouchers
 * POST /api/vouchers/expire
 */
export const expireVouchers = createAsyncThunk(
  "voucher/expireVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post("/vouchers/expire", {}, getAuthHeaders());
      console.log("✅ Expire vouchers response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Expire vouchers error:",
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to expire vouchers",
      );
    }
  },
);

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    // Vouchers list (admin)
    vouchers: [],
    total: 0,
    pagination: {
      page: 1,
      limit: 50,
      pages: 0,
    },

    // Voucher confirmation (before redemption)
    confirmedVoucher: null,
    confirmLoading: false,

    // Redemption result
    redemptionResult: null, // ✨ NEW: stores RADIUS credentials after redemption
    redemptionLoading: false,

    // Creation result
    lastCreated: null, // Recently created vouchers

    // UI states
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastCreated: (state) => {
      state.lastCreated = null;
    },
    clearConfirmedVoucher: (state) => {
      state.confirmedVoucher = null;
    },
    clearRedemptionResult: (state) => {
      state.redemptionResult = null;
    },
    resetVouchers: (state) => {
      state.vouchers = [];
      state.total = 0;
      state.confirmedVoucher = null;
      state.redemptionResult = null;
      state.lastCreated = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch vouchers ──
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload.vouchers || action.payload.data || [];
        state.total = action.payload.total || state.vouchers.length;
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 50,
          pages:
            action.payload.pages ||
            Math.ceil(state.total / (action.payload.limit || 50)),
        };
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Confirm voucher ──
      .addCase(confirmVoucher.pending, (state) => {
        state.confirmLoading = true;
        state.error = null;
        state.confirmedVoucher = null;
      })
      .addCase(confirmVoucher.fulfilled, (state, action) => {
        state.confirmLoading = false;
        state.confirmedVoucher = action.payload.voucher || action.payload;
      })
      .addCase(confirmVoucher.rejected, (state, action) => {
        state.confirmLoading = false;
        state.error = action.payload;
        state.confirmedVoucher = null;
      })

      // ── Redeem voucher ──
      .addCase(redeemVoucher.pending, (state) => {
        state.redemptionLoading = true;
        state.error = null;
        state.redemptionResult = null;
      })
      .addCase(redeemVoucher.fulfilled, (state, action) => {
        state.redemptionLoading = false;
        // Store full redemption result including RADIUS credentials
        state.redemptionResult = {
          success: true,
          user: action.payload.user,
          subscription: action.payload.subscription,
          instructions: action.payload.instructions,
          // RADIUS credentials for WiFi login
          radiusCredentials: {
            username: action.payload.user?.username,
            password: action.payload.user?.password,
          },
        };
      })
      .addCase(redeemVoucher.rejected, (state, action) => {
        state.redemptionLoading = false;
        state.error = action.payload;
        state.redemptionResult = null;
      })

      // ── Create voucher ──
      .addCase(createVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastCreated = null;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.loading = false;
        // Store created vouchers for display
        state.lastCreated = action.payload.vouchers || [];
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Delete voucher ──
      .addCase(deleteVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.loading = false;
        // Remove deleted voucher from list
        state.vouchers = state.vouchers.filter(
          (v) => v.id !== action.payload.id,
        );
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Expire vouchers ──
      .addCase(expireVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(expireVouchers.fulfilled, (state, action) => {
        state.loading = false;
        // User should refetch vouchers list to see updated statuses
      })
      .addCase(expireVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearLastCreated,
  clearConfirmedVoucher,
  clearRedemptionResult,
  resetVouchers,
} = voucherSlice.actions;

export default voucherSlice.reducer;
