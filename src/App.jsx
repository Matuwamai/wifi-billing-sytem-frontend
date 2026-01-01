import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlansPage from "./pages/PlanPage";
import AdminPlansPage from "./pages/Admin/plans";
import UserSubscriptionsPage from "./pages/Admin/UserSubscriptionsPage";
import AdminSubscriptionsPage from "./pages/Admin/AdminSubscriptionsPage";
import AdminPaymentPage from "./pages/Admin/AdminPaymentPage";
import Layout from "../src/componets/Layot"; // Fixed import
import VoucherPage from "./pages/Admin/Voucher";
import UsersPage from "./pages/Admin/userPage";
import AnalyticsPage from "./pages/Admin/AnalyticPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlansPage />} />
        {/* Admin routes with Layout wrapper */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<AdminPlansPage />} /> {/* /admin */}
          <Route path="plans" element={<AdminPlansPage />} />{" "}
          {/* /admin/plans */}
          <Route
            path="user-subscriptions"
            element={<UserSubscriptionsPage />}
          />{" "}
          {/* /admin/user-subscriptions */}
          <Route
            path="subscriptions"
            element={<AdminSubscriptionsPage />}
          />{" "}
          {/* /admin/subscriptions */}
          <Route path="payments" element={<AdminPaymentPage />} />{" "}
          {/* /admin/payments */}
          {/* ... other routes ... */}
          <Route path="vouchers" element={<VoucherPage />} />{" "}
          {/* /admin/vouchers */}
          <Route path="users" element={<UsersPage />} /> {/* /admin/users */}
          <Route path="analytics" element={<AnalyticsPage />} />{" "}
          {/* /admin/analytics */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
