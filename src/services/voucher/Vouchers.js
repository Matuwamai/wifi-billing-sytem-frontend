import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;

export const fetchVouchers = createAsyncThunk(
  "voucher/fetchVouchers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/vouchers/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const confirmVoucher = createAsyncThunk(
  "voucher/confirmVoucher",
  async (code, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        "/vouchers/check/:code",
        { params: { code } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const redeemVoucher = createAsyncThunk(
  "voucher/redeemVoucher",
  async (voucherData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/vouchers/redeem", voucherData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const createVoucher = createAsyncThunk(
  "voucher/createVoucher",
  async (voucherData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/vouchers/create", voucherData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const deleteVoucher = createAsyncThunk(
  "voucher/deleteVoucher",
  async (voucherId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/vouchers/${voucherId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
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
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const voucherSlice = createSlice({
  name: "voucher",
  initialState: {
    vouchers: [],
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
      // Fetch vouchers
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload.data;
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
        state.vouchers.push(action.payload.data);
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create voucher";
      })
      .addCase(expireVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(expireVouchers.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(expireVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to expire vouchers";
      });
  },
});

export const { clearError } = voucherSlice.actions;

export default voucherSlice.reducer;
