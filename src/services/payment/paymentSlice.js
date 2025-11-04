import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import BASE_URL from "../../../baseURL.js";

axios.defaults.baseURL = BASE_URL;
export const startPayment = createAsyncThunk(
  "payment/startPayment",
  async ({ phone, userId, planId }) => {
    const res = await axios.post("/mpesa/pay", {
      phone,
      userId,
      planId,
    });
    return res.data;
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    payment: null,
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
