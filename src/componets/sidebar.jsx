// Sidebar.tsx
import React, { useState } from "react";
import {
  Users,
  Wifi,
  CreditCard,
  ClipboardList,
  Ticket,
  Menu,
  X,
  Home,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart,
} from "lucide-react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Users");

  const links = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/admin" },
    { name: "Users", icon: <Users size={20} />, path: "/admin/users" },
    { name: "Plans", icon: <Wifi size={20} />, path: "/admin/plans" },
    {
      name: "Payments",
      icon: <CreditCard size={20} />,
      path: "/admin/payments",
    },
    {
      name: "Subscriptions",
      icon: <ClipboardList size={20} />,
      path: "/admin/subscriptions",
    },
    { name: "Vouchers", icon: <Ticket size={20} />, path: "/admin/vouchers" },
    {
      name: "Analytics",
      icon: <BarChart size={20} />,
      path: "/admin/analytics",
    },
  ];

  const bottomLinks = [
    { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
    { name: "Security", icon: <Shield size={20} />, path: "/admin/security" },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:block absolute -right-3 top-6 z-20 p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-40
          bg-gradient-to-b from-[#0f172a] to-[#1e293b]
          min-h-screen text-white
          transition-all duration-300 ease-in-out
          border-r border-slate-700/50
          ${isCollapsed ? "w-20" : "w-64"}
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo Area */}
        <div className="p-4 border-b border-slate-700/50">
          <div
            className={`flex items-center gap-3 ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <h2 className="text-xl font-bold">Admin Panel</h2>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Shield size={16} />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-4 space-y-1">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.path}
              onClick={() => {
                setActiveLink(link.name);
                setMobileMenuOpen(false);
              }}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${
                  activeLink === link.name
                    ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/30 text-blue-300 border border-blue-500/30"
                    : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <div
                className={`${
                  activeLink === link.name ? "text-blue-400" : "text-slate-400"
                }`}
              >
                {link.icon}
              </div>
              {!isCollapsed && <span className="font-medium">{link.name}</span>}
            </a>
          ))}
        </nav>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-slate-700/50"></div>
        </div>

        {/* Bottom Links */}
        <div className="p-4 mt-auto space-y-1">
          {bottomLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                hover:bg-slate-800/50 text-slate-300 hover:text-white
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <div className="text-slate-400">{link.icon}</div>
              {!isCollapsed && <span className="font-medium">{link.name}</span>}
            </a>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isCollapsed && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-slate-400">admin@example.com</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                  <LogOut size={18} className="text-slate-400" />
                </button>
              </>
            )}
            {isCollapsed && (
              <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                <LogOut size={18} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content adjustment for collapsed sidebar */}
      <div
        className={`
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}
      `}
      >
        {/* Your main content goes here */}
      </div>
    </>
  );
};

export default Sidebar;
