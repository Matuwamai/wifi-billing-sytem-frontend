import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import planReducer from "../features/plan/planSlice";
import paymentReducer from "../features/payment/paymentSlice";
import subscriptionReducer from "../features/subscription/subscriptionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    payment: paymentReducer,
    subscription: subscriptionReducer,
  },
});

export default store;
