// Sidebar.jsx
import React from "react";
import {
  Users,
  Wifi,
  CreditCard,
  ClipboardList,
  Ticket,
  Home,
  BarChart,
  X,
} from "lucide-react";

const Sidebar = ({ onClose }) => {
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

  // Get current path to highlight active link
  const currentPath = window.location.pathname;

  return (
    <aside className="w-64 bg-gradient-to-b from-[#0f172a] to-[#1e293b] min-h-screen text-white px-4 py-6 border-r border-slate-700/50">
      {/* Mobile Close Button */}
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <h2 className="text-xl font-bold">Menu</h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      {/* Desktop Title */}
      <h2 className="text-2xl font-bold mb-8 hidden lg:block">Admin Panel</h2>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.path}
            onClick={onClose} // Close sidebar on mobile when link is clicked
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-all
              ${
                currentPath === link.path
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/30 text-blue-300 border border-blue-500/30"
                  : "hover:bg-slate-800/50 text-slate-300 hover:text-white"
              }
            `}
          >
            <div
              className={`${
                currentPath === link.path ? "text-blue-400" : "text-slate-400"
              }`}
            >
              {link.icon}
            </div>
            <span className="font-medium">{link.name}</span>
          </a>
        ))}
      </nav>

      {/* Logo/Brand Section */}
      <div className="mt-10 pt-6 border-t border-slate-700/50">
        <div className="flex flex-col items-center gap-3">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIRNp-vzGebS9al1QV2RIzLgpfwtqGI8pqHw&s"
            alt="Logo"
            className="h-16 w-16 rounded-lg border-2 border-slate-600"
          />
          <div className="text-center">
            <h3 className="font-semibold text-white">Budget WiFi</h3>
            <p className="text-xs text-slate-400">Admin Panel v1.0</p>
          </div>
        </div>
      </div>

      {/* User Info (optional) */}
      <div className="mt-6 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-white">Admin Issa</p>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
