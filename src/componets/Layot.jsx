import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Fixed Navbar */}
        <Navbar />

        {/* Scrollable Content Area */}
        <main className="flex-1  bg-[#16213E] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
