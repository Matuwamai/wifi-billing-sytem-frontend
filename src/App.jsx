import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContex";
import store from "./store/store";

// Pages
import PlansPage from "./pages/PlanPage";
import AdminPlansPage from "./pages/Admin/plans";
import UserSubscriptionsPage from "./pages/Admin/UserSubscriptionsPage";
import AdminSubscriptionsPage from "./pages/Admin/AdminSubscriptionsPage";
import AdminPaymentPage from "./pages/Admin/AdminPaymentPage";
import Layout from "./componets/Layot";
import VoucherPage from "./pages/Admin/Voucher";
import UsersPage from "./pages/Admin/userPage";
import AnalyticsPage from "./pages/Admin/AnalyticPage";
import Unauthorized from "./pages/Admin/UnauthorizedPage";
import LoginPage from "./pages/Admin/LoginPage";
import ProtectedRoute from "./componets/ProtectedRoutes";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<PlansPage />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/plans" replace />} />
              <Route path="plans" element={<AdminPlansPage />} />
              <Route
                path="user-subscriptions"
                element={<UserSubscriptionsPage />}
              />
              <Route
                path="subscriptions"
                element={<AdminSubscriptionsPage />}
              />
              <Route path="payments" element={<AdminPaymentPage />} />
              <Route path="vouchers" element={<VoucherPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Fallback Routes */}
            {/* // In your App.jsx - add this route */}
            <Route
              path="/login"
              element={<Navigate to="/admin/login" replace />}
            />
          </Routes>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
