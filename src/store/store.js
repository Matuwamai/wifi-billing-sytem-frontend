import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../services/auth/authSlice";
import planReducer from "../services/plan/planSlice";
import paymentReducer from "../services/payment/paymentSlice";
import subscriptionReducer from "../services/subscription/subscriptionSlice";
import VoucherReducer from "../services/voucher/Vouchers";
import userReducer from "../services/users/userSlices";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    payment: paymentReducer,
    subscription: subscriptionReducer,
    voucher: VoucherReducer,
    user: userReducer,
  },
});

export default store;
