import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export const MainLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-transparent font-sans antialiased text-slate-900 dark:text-slate-100">
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="lg:pl-64 flex-1 h-screen overflow-y-auto bg-transparent flex flex-col min-w-0">
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1 w-full 2xl:max-w-[120rem] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
