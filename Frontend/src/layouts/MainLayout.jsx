import React from "react";

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
};

export default MainLayout;
