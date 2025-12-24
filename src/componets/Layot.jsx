// Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless open */}
      <div
        className={`
          fixed lg:relative z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:w-64
          h-full
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar with menu button */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>

        {/* Mobile Footer (optional) */}
        <div className="lg:hidden bg-slate-800/80 border-t border-slate-700/50 p-3 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Budget WiFi Admin Panel</p>
        </div>
      </div>
    </div>
  );
};

export default Layout;
