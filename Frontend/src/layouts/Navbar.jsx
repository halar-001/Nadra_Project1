import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getHealth } from "../services/healthService";
import { Sun, Moon, Menu } from "lucide-react";

export const Navbar = ({ onToggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    getHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  return (
    <header className="py-3 px-4 sm:px-8 flex items-center justify-between bg-transparent">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu size={20} />
        </button>

        {/* Backend Live Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-xs font-semibold">
          <span
            className={`h-2 w-2 rounded-full ${
              backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
            API: <strong className={backendOnline ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>{backendOnline ? "ONLINE (8080)" : "OFFLINE"}</strong>
          </span>
        </div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
      >
        {theme === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
      </button>
    </header>
  );
};

export default Navbar;
