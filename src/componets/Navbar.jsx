import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Home,
  Shield,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({ onMenuClick, showMenuButton = true }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);

  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock notifications - replace with API call
      const mockNotifications = [
        {
          id: 1,
          title: "New user registered",
          time: "5 mins ago",
          unread: true,
        },
        { id: 2, title: "Payment received", time: "1 hour ago", unread: true },
        {
          id: 3,
          title: "System update scheduled",
          time: "2 hours ago",
          unread: false,
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate("/admin/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement search functionality here
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, unread: false }))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const userInitials = user?.phone
    ? user.phone
        .replace(/^\+254/, "")
        .charAt(0)
        .toUpperCase()
    : "A";

  const formatPhone = (phone) => {
    if (!phone) return "";
    return phone.replace(/^\+254/, "0");
  };

  const getUserName = () => {
    if (user?.username) return user.username;
    if (user?.phone) return formatPhone(user.phone);
    return "Admin User";
  };

  const getUserRole = () => {
    if (!user?.UserRole) return "User";

    const roleMap = {
      ADMIN: "Administrator",
      MODERATOR: "Moderator",
      USER: "User",
    };

    return roleMap[user.UserRole] || user.UserRole;
  };

  return (
    <header className="w-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 sm:px-6 py-4 shadow-md border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-sm bg-opacity-90">
      <div className="flex items-center justify-between">
        {/* Left Section: Menu Button & Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          )}

          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate("/admin")}
          >
            <div className="relative">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIRNp-vzGebS9al1QV2RIzLgpfwtqGI8pqHw&s"
                alt="Budget WiFi Logo"
                className="h-10 w-10 rounded-lg border-2 border-slate-600 object-cover"
              />
              {isAdmin && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0f172a]"></div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                Budget WiFi
                {isAdmin && <Shield size={14} className="text-blue-400" />}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Welcome back, {getUserName()}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Search, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar (Desktop) */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, plans, payments..."
                className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 lg:w-64 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </form>
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Mobile Search Bar */}
          {searchOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 px-4 py-2 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(false)}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors group"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* Notifications Panel */}
            {false && ( // Change to true to show notifications panel
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Mark all read
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${
                          notification.unread ? "bg-blue-900/10" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 mt-2 rounded-full ${
                              notification.unread
                                ? "bg-blue-500"
                                : "bg-slate-600"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell size={32} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-slate-400">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-slate-700">
                  <button
                    onClick={() => navigate("/admin/notifications")}
                    className="w-full text-center text-sm text-blue-400 hover:text-blue-300"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
              aria-label="User menu"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {userInitials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a]"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">
                  {getUserName()}
                </p>
                <p className="text-xs text-slate-400">{getUserRole()}</p>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {userInitials}
                    </div>
                    <div>
                      <p className="font-medium text-white truncate">
                        {getUserName()}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Shield size={10} className="text-blue-400" />
                        {getUserRole()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    navigate("/admin");
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors text-left"
                >
                  <Home size={16} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/admin/profile");
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors text-left"
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/admin/settings");
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors text-left"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>

                <div className="h-px my-1 bg-slate-700"></div>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors text-left"
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>

                <div className="h-px my-1 bg-slate-700"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
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
      {(searchOpen || profileMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setSearchOpen(false);
            setProfileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Navbar;
