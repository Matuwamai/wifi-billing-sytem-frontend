import React from "react";
import PlansPage from "./pages/PlanPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlansPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
