// Navbar.tsx
import React from "react";

const Navbar = () => {
  return (
    <header className="w-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex justify-between items-center px-6 py-4 shadow-md">
      <div className="flex items-center gap-3">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIRNp-vzGebS9al1QV2RIzLgpfwtqGI8pqHw&s"
          alt="Logo"
          className="h-10 w-10"
        />
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
