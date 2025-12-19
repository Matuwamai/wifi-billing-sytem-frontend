// Sidebar.tsx
import React from "react";
import { Users, Wifi, CreditCard, ClipboardList, Ticket } from "lucide-react";

const Sidebar = () => {
  const links = [
    { name: "Users", icon: <Users size={20} /> },
    { name: "Plans", icon: <Wifi size={20} /> },
    { name: "Payments", icon: <CreditCard size={20} /> },
    { name: "Subscriptions", icon: <ClipboardList size={20} /> },
    { name: "Vouchers", icon: <Ticket size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#1E2A47] min-h-screen text-white px-4 py-6">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.name}
            href={`#${link.name.toLowerCase()}`}
            className="flex items-center gap-3 p-2 rounded hover:bg-[#2A3B6D] transition-colors"
          >
            {link.icon}
            <span>{link.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
