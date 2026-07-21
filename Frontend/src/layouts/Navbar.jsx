import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { getHealth } from "../services/healthService";
import { Activity, Database, Sun, Moon, LogOut } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { activeConnection } = useChat();
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    getHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  return (
    <header className="h-16 glass-panel border-b border-white/60 sticky top-0 z-10 px-8 flex items-center justify-between backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Backend Health Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-slate-200/60 shadow-2xs text-xs font-medium text-slate-700">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              backendOnline ? "bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" : "bg-amber-500"
            }`}
          ></span>
          <span className="font-mono text-[11px]">
            Backend Status: <strong className={backendOnline ? "text-emerald-600" : "text-amber-600"}>{backendOnline ? "ONLINE (8080)" : "OFFLINE"}</strong>
          </span>
        </div>

        {/* Active DB Catalog Tag */}
        {activeConnection && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/80 text-xs text-blue-700 font-medium">
            <Database size={13} className="text-blue-600" />
            <span className="font-bold uppercase tracking-wider text-[10px]">{activeConnection.dbType}</span>
            <span>•</span>
            <span className="font-mono text-[11px]">{activeConnection.databaseName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <p className="text-xs font-bold text-slate-900">{user?.username}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{user?.role || "ADMIN"}</p>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50/80 transition-colors border border-transparent hover:border-red-200/60"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
