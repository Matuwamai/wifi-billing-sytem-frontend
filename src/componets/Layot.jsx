// Layout.tsx
import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

type LayoutProps = {
  children: ReactNode,
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 bg-[#16213E] min-h-screen text-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
