// Navbar.tsx
import React from "react";

const Navbar = () => {
  return (
    <header className="w-full bg-[#1E2A47] text-white flex justify-between items-center px-6 py-4 shadow-md">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        <span>Admin User</span>
        <button className="bg-[#FF4D4F] px-4 py-1 rounded hover:bg-[#ff7875] transition-colors">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
