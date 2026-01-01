import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Wifi,
  CreditCard,
  ClipboardList,
  Ticket,
  Home,
  BarChart,
  X,
  Settings,
  Shield,
  LogOut,
  Activity,
  Database,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContex";

const Sidebar = ({ onClose }) => {
  const [activePath, setActivePath] = useState("/admin");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  // Navigation links with permissions
  const navLinks = [
    {
      name: "Dashboard",
      icon: <Home size={20} />,
      path: "/admin",
      requiredRole: "USER",
    },
    {
      name: "Users",
      icon: <Users size={20} />,
      path: "/admin/users",
      requiredRole: "ADMIN",
      badge: "12",
    },
    {
      name: "Plans",
      icon: <Wifi size={20} />,
      path: "/admin/plans",
      requiredRole: "ADMIN",
    },
    {
      name: "Payments",
      icon: <CreditCard size={20} />,
      path: "/admin/payments",
      requiredRole: "ADMIN",
      badge: "3",
    },
    {
      name: "Subscriptions",
      icon: <ClipboardList size={20} />,
      path: "/admin/subscriptions",
      requiredRole: "MODERATOR",
    },
    {
      name: "Vouchers",
      icon: <Ticket size={20} />,
      path: "/admin/vouchers",
      requiredRole: "ADMIN",
    },
    {
      name: "Analytics",
      icon: <BarChart size={20} />,
      path: "/admin/analytics",
      requiredRole: "ADMIN",
    },
    {
      name: "System Logs",
      icon: <Database size={20} />,
      path: "/admin/logs",
      requiredRole: "ADMIN",
    },
    {
      name: "Activity",
      icon: <Activity size={20} />,
      path: "/admin/activity",
      requiredRole: "MODERATOR",
    },
  ];

  // Check if user has permission for a link
  const hasPermission = (requiredRole) => {
    if (!user?.UserRole) return false;

    const rolesHierarchy = {
      USER: 0,
      MODERATOR: 1,
      ADMIN: 2,
    };

    const userRoleLevel = rolesHierarchy[user.UserRole] || 0;
    const requiredRoleLevel = rolesHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  };

  // Filter links based on user role
  const filteredLinks = navLinks.filter((link) =>
    hasPermission(link.requiredRole)
  );

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  const getUserName = () => {
    if (user?.username) return user.username;
    if (user?.phone) {
      // Format phone number for display
      const phone = user.phone.replace(/^\+254/, "0");
      return phone.length > 9 ? `${phone.substring(0, 9)}...` : phone;
    }
    return "Admin User";
  };

  const getUserStatus = () => {
    if (!user) return "Offline";

    const now = new Date().getTime();
    const lastActive = user.lastActive || now;
    const diffInMinutes = Math.floor((now - lastActive) / (1000 * 60));

    if (diffInMinutes < 5) return "Online";
    if (diffInMinutes < 60) return "Away";
    return "Offline";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Online":
        return "bg-green-500";
      case "Away":
        return "bg-yellow-500";
      default:
        return "bg-slate-500";
    }
  };

  const userStatus = getUserStatus();
  const statusColor = getStatusColor(userStatus);

  return (
    <aside className="w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] min-h-screen text-white flex flex-col border-r border-slate-700/50">
      {/* Mobile Close Button */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700/50 lg:hidden">
        <h2 className="text-xl font-bold">Menu</h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Brand Section */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIRNp-vzGebS9al1QV2RIzLgpfwtqGI8pqHw&s"
              alt="Budget WiFi Logo"
              className="h-16 w-16 rounded-xl border-2 border-slate-600 object-cover"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full border-2 border-[#0f172a] flex items-center justify-center">
              <Shield size={10} className="text-white" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Budget WiFi</h2>
            <p className="text-xs text-slate-400 mt-1">Admin Panel v1.0</p>
            <div className="mt-2 px-3 py-1 bg-slate-800/50 rounded-full inline-block">
              <span className="text-xs font-medium text-blue-400">
                {user?.UserRole === "ADMIN"
                  ? "Administrator Mode"
                  : "User Mode"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-slate-700/50">
        <div
          className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
          onClick={() => handleNavigation("/admin/profile")}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.phone?.charAt(0).toUpperCase() || "A"}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 ${statusColor} rounded-full border-2 border-[#0f172a]`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{getUserName()}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Shield
                  size={10}
                  className={
                    user?.UserRole === "ADMIN"
                      ? "text-blue-400"
                      : "text-slate-500"
                  }
                />
                {user?.UserRole || "User"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">{userStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {filteredLinks.map((link) => {
            const isActive =
              activePath === link.path ||
              activePath.startsWith(link.path + "/");

            return (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.path)}
                className={`
                  w-full flex items-center justify-between gap-3 p-3 rounded-lg transition-all group relative
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/30 text-blue-300 border border-blue-500/30"
                      : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${
                      isActive
                        ? "text-blue-400"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {link.icon}
                  </div>
                  <span className="font-medium text-left">{link.name}</span>
                </div>

                {link.badge && (
                  <span
                    className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${
                      isActive
                        ? "bg-blue-500/30 text-blue-300"
                        : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-slate-300"
                    }
                  `}
                  >
                    {link.badge}
                  </span>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-l"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-700/50 space-y-2">
        {/* Settings */}
        <button
          onClick={() => handleNavigation("/admin/settings")}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <Settings size={20} className="text-slate-400" />
          <span className="font-medium">Settings</span>
        </button>

        {/* Help */}
        <button
          onClick={() => handleNavigation("/admin/help")}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <HelpCircle size={20} className="text-slate-400" />
          <span className="font-medium">Help & Support</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-2 border border-red-500/20"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>

        {/* System Status */}
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
