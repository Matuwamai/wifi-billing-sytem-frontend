import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

// Fetch all vouchers
export const fetchVouchers = createAsyncThunk(
  "voucher/fetchVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/vouchers/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("✅ Fetch vouchers response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Fetch vouchers error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch vouchers"
      );
    }
  }
);

// Check voucher validity
export const confirmVoucher = createAsyncThunk(
  "voucher/confirmVoucher",
  async (code, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/vouchers/check/${code}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("✅ Confirm voucher response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Confirm voucher error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to confirm voucher"
      );
    }
  }
);

// Redeem voucher
export const redeemVoucher = createAsyncThunk(
  "voucher/redeemVoucher",
  async (voucherData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/vouchers/redeem", voucherData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("✅ Redeem voucher response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Redeem voucher error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to redeem voucher"
      );
    }
  }
);

// Create voucher(s)
export const createVoucher = createAsyncThunk(
  "voucher/createVoucher",
  async (voucherData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/vouchers/create", voucherData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("✅ Create voucher response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Create voucher error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create voucher"
      );
    }
  }
);

// Delete voucher
export const deleteVoucher = createAsyncThunk(
  "voucher/deleteVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/vouchers/${voucherId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("✅ Delete voucher response:", res.data);
      return { id: voucherId, ...res.data };
    } catch (error) {
      console.error(
        "❌ Delete voucher error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete voucher"
      );
    }
  }
);

// Expire old vouchers
export const expireVouchers = createAsyncThunk(
  "voucher/expireVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        "/vouchers/expire",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("✅ Expire vouchers response:", res.data);
      return res.data;
    } catch (error) {
      console.error(
        "❌ Expire vouchers error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to expire vouchers"
      );
    }
  }
);

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    vouchers: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 50,
      pages: 0,
    },
    loading: false,
    error: null,
    lastCreated: null, // Store last created vouchers for display
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastCreated: (state) => {
      state.lastCreated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vouchers
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false;
        // API returns: { success: true, vouchers: [...], pagination: {...} }
        state.vouchers = action.payload.vouchers || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vouchers";
      })

      // Confirm voucher
      .addCase(confirmVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmVoucher.fulfilled, (state, action) => {
        state.loading = false;
        // API returns: { valid: true/false, message: "...", voucher: {...} }
      })
      .addCase(confirmVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to confirm voucher";
      })

      // Redeem voucher
      .addCase(redeemVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemVoucher.fulfilled, (state, action) => {
        state.loading = false;
        // API returns: { success: true, message: "...", subscription: {...}, session: {...} }
      })
      .addCase(redeemVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to redeem voucher";
      })

      // Create voucher
      .addCase(createVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.loading = false;
        // API returns: { success: true, message: "...", vouchers: [{code, plan, expiresAt}] }
        state.lastCreated = action.payload.vouchers || [];
        // Note: We don't add to state.vouchers here because the full voucher objects
        // aren't returned. User should call fetchVouchers() to refresh the list.
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create voucher";
      })

      // Delete voucher
      .addCase(deleteVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted voucher from the list
        state.vouchers = state.vouchers.filter(
          (v) => v.id !== action.payload.id
        );
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete voucher";
      })

      // Expire vouchers
      .addCase(expireVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(expireVouchers.fulfilled, (state, action) => {
        state.loading = false;
        // API returns: { success: true, message: "...", count: N }
        // Note: User should call fetchVouchers() to refresh the list
      })
      .addCase(expireVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to expire vouchers";
      });
  },
});

export const { clearError, clearLastCreated } = voucherSlice.actions;

export default voucherSlice.reducer;
