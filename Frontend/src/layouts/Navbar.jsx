import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useChat } from "../context/ChatContext";
import { getHealth } from "../services/healthService";
import { Sun, Moon, Menu, Trash2, MessageSquare, LayoutGrid, Database, Network, UserCircle, ShieldAlert } from "lucide-react";
import Button from "../components/Button";

export const Navbar = ({ onToggleMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { messages, clearMessages } = useChat();
  const [backendOnline, setBackendOnline] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/chat":
        return { title: "Database Workspace", subtitle: `${messages?.length || 0} / 40 Msgs`, Icon: MessageSquare };
      case "/dashboard":
        return { title: "DataPulse Dashboard", subtitle: "System Telemetry & Overview", Icon: LayoutGrid };
      case "/connections":
        return { title: "Database Catalogs", subtitle: "Manage External Connections", Icon: Database };
      case "/schema":
        return { title: "Schema Explorer", subtitle: "Inspect Structure & Metadata Cache", Icon: Network };
      case "/profile":
        return { title: "User Account Profile", subtitle: "Security & Credentials", Icon: UserCircle };
      case "/admin":
        return { title: "System Audit Logs", subtitle: "Admin Security Trail", Icon: ShieldAlert };
      default:
        return { title: "Database Workspace", subtitle: `${messages?.length || 0} / 40 Msgs`, Icon: MessageSquare };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <>
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
        <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 mx-3 hidden sm:block" />

        {/* Page Heading beside API indicator */}
        <div className="hidden sm:flex sm:items-center sm:gap-3">
          {pageInfo.Icon && (
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-50/80 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs">
              <pageInfo.Icon size={18} />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1 w-1 rounded-full bg-blue-500/60 dark:bg-blue-400/60"></div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-none tracking-wider uppercase font-sans">
                {pageInfo.subtitle}
              </p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Right Controls: Clear Chat & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {location.pathname === "/chat" && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-extrabold transition-all cursor-pointer border border-slate-200/90 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs hover:scale-105"
            title="Clear Chat Messages"
          >
            <Trash2 size={13} className="text-rose-500" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs hover:scale-105"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
        </button>
      </div>
    </header>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-sm flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Clear Chat Messages?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Are you sure you want to clear all messages in this session? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                variant="secondary"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <button
                onClick={() => {
                  clearMessages();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-500/20"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
