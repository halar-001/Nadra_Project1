import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-transparent font-sans antialiased text-slate-900">
      <Sidebar />
      <div className="pl-64 flex-1 h-screen overflow-y-auto bg-transparent flex flex-col">
        <Navbar />
        <main className="p-8 space-y-8 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
