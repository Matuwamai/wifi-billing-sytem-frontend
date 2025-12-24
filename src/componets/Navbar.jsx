// Navbar.jsx
import React, { useState } from "react";
import {
  Bell,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Moon,
  Sun,
} from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="w-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 sm:px-6 py-4 shadow-md border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        {/* Left Section: Menu Button & Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIRNp-vzGebS9al1QV2RIzLgpfwtqGI8pqHw&s"
              alt="Logo"
              className="h-10 w-10 rounded-lg border-2 border-slate-600"
            />
            <div>
              <h1 className="text-xl font-semibold text-white">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Welcome back, Admin
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Search, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar (Desktop) */}
          <div className="hidden md:block relative">
            <div className="flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 lg:w-64"
                />
              </div>
            </div>
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <Search size={20} />
          </button>

          {/* Mobile Search Bar */}
          {searchOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 px-4 py-2 bg-slate-800 border-b border-slate-700 z-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-50">
                <a
                  href="/admin/profile"
                  className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <User size={16} />
                  <span>My Profile</span>
                </a>
                <a
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors text-left"
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <div className="h-px my-1 bg-slate-700"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {profileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
