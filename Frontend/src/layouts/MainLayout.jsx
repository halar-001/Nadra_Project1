import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export const MainLayout = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname === "/chat";

  return (
    <div className="min-h-screen flex bg-slate-100/80 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      <Sidebar
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="lg:pl-64 flex-1 h-screen overflow-hidden flex flex-col min-w-0">
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main
          className={`flex-1 w-full ${
            isChatPage
              ? "px-4 pb-4 pt-1 h-[calc(100vh-5rem)] flex flex-col overflow-hidden"
              : "p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto 2xl:max-w-[120rem] mx-auto"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
