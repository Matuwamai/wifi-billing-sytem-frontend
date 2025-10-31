import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../services/auth/authSlice";
import planReducer from "../services/plan/planSlice";
import paymentReducer from "../services/payment/paymentSlice";
import subscriptionReducer from "../services/subscription/subscriptionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    payment: paymentReducer,
    subscription: subscriptionReducer,
  },
});

export default store;
