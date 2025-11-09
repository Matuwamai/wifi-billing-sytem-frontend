import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlansPage from "./pages/PlanPage";
import AdminPlansPage from "./pages/Admin/plans";
import UserSubscriptionsPage from "./pages/Admin/UserSubscriptionsPage";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlansPage />} />
          <Route path="/admin/plans" element={<AdminPlansPage />} />
          <Route
            path="/admin/user-subscriptions"
            element={<UserSubscriptionsPage />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
