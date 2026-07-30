import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getHealth } from "../services/healthService";
import { Sun, Moon, Menu } from "lucide-react";

export const Navbar = ({ onToggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [backendOnline, setBackendOnline] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/chat":
        return { title: "Database Workspace", subtitle: "Session ID: 35" };
      case "/dashboard":
        return { title: "DataPulse Dashboard", subtitle: "System Telemetry & Overview" };
      case "/connections":
        return { title: "Database Catalogs", subtitle: "Manage External Connections" };
      case "/schema":
        return { title: "Schema Explorer", subtitle: "Inspect Structure & Metadata Cache" };
      case "/profile":
        return { title: "User Account Profile", subtitle: "Security & Credentials" };
      case "/admin":
        return { title: "System Audit Logs", subtitle: "Admin Security Trail" };
      default:
        return { title: "Database Workspace", subtitle: "Session ID: 35" };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header className="py-2.5 px-6 mx-4 my-2.5 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl flex items-center justify-between gap-4 shrink-0 shadow-sm shadow-slate-200/40 dark:shadow-none">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu size={18} />
        </button>

        {/* Backend Live Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
          <span
            className={`h-2 w-2 rounded-full ${
              backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
            API: <strong className={backendOnline ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>{backendOnline ? "ONLINE (8080)" : "OFFLINE"}</strong>
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {/* Page Heading beside API indicator */}
        <div className="hidden sm:block">
          <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <p className="text-[10px] font-mono text-slate-400 leading-none mt-0.5">
              {pageInfo.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs hover:scale-105"
        title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      >
        {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
      </button>
    </header>
  );
};

export default Navbar;
