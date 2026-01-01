import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContex";
import store from "./store/store";

// Pages
import PlansPage from "./pages/PlanPage";
import AdminPlansPage from "./pages/Admin/plans";
import UserSubscriptionsPage from "./pages/Admin/UserSubscriptionsPage";
import AdminSubscriptionsPage from "./pages/Admin/AdminSubscriptionsPage";
import AdminPaymentPage from "./pages/Admin/AdminPaymentPage";
import Layout from "../src/componets/Layot"; // Fixed import
import VoucherPage from "./pages/Admin/Voucher";
import UsersPage from "./pages/Admin/userPage";
import AnalyticsPage from "./pages/Admin/AnalyticPage";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<PlansPage />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<Layout />}>
              <Route index element={<AdminPlansPage />} />
              <Route path="plans" element={<AdminPlansPage />} />{" "}
              <Route
                path="user-subscriptions"
                element={<UserSubscriptionsPage />}
              />{" "}
              <Route
                path="subscriptions"
                element={<AdminSubscriptionsPage />}
              />{" "}
              <Route path="payments" element={<AdminPaymentPage />} />{" "}
              <Route path="vouchers" element={<VoucherPage />} />{" "}
              <Route path="users" element={<UsersPage />} />{" "}
              <Route path="analytics" element={<AnalyticsPage />} />{" "}
            </Route>

            {/* Fallback Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
