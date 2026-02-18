import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../services/auth/authSlice";
import planReducer from "../services/plan/planSlice";
import paymentReducer from "../services/payment/paymentSlice";
import subscriptionReducer from "../services/subscription/subscriptionSlice";
import VoucherReducer from "../services/voucher/Vouchers";
import userReducer from "../services/users/userSlices";
import analyticReducer from "../services/Analytics/analyticSlices";
import radiusReducer from "../services/radius/radiusSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    payment: paymentReducer,
    subscription: subscriptionReducer,
    voucher: VoucherReducer,
    user: userReducer,
    analytic: analyticReducer,
    radius: radiusReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "auth/login/fulfilled",
          "auth/loginWithUsername/fulfilled",
          "auth/loginWithMpesaCode/fulfilled",
          "auth/createGuestUser/fulfilled",
          "auth/logout/fulfilled",
          // Add other actions that might contain non-serializable data
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          "auth.user",
          "auth.error",
          "payment.data", // If you have complex payment data
          "subscription.data", // If you have dates or complex objects
          // Add other state paths with non-serializable data
        ],
      },
    }),
  // Optional: Add dev tools configuration
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
