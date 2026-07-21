import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquareCode, Database, ShieldAlert, User, LogOut, ChevronUp } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { activeConnection } = useChat();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "AI Chat Assistant", path: "/chat", icon: MessageSquareCode },
    { label: "DB Connections", path: "/connections", icon: Database },
    { label: "Admin Logs", path: "/admin", icon: ShieldAlert },
  ];

  const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "US";

  return (
    <aside className="w-64 glass-panel border-r border-white/60 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo Header */}
      <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
        <Logo size="sm" />
      </div>

      {/* Select Dropdown */}
      <div className="p-3 border-b border-slate-200/60 bg-white/30 backdrop-blur-xs">
        <select
          className="w-full bg-transparent border-none text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
          defaultValue={activeConnection?.id || ""}
        >
          <option value="">
            {activeConnection ? `${activeConnection.dbType}: ${activeConnection.databaseName}` : "Select Database Catalog..."}
          </option>
        </select>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#efefef] text-slate-900 shadow-xs font-semibold"
                    : "hover:bg-slate-200/60 text-slate-800"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile & Popup */}
      <div className="p-3 border-t border-slate-200/80 relative" ref={menuRef}>
        {/* Profile Popover Menu */}
        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 glass-modal p-2 shadow-2xl border border-white/90 rounded-2xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-1">
            <div className="p-2 border-b border-slate-200/60">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.username || "User"}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email || "user@aidatabaseassistant.com"}</p>
            </div>

            <button
              onClick={() => {
                setShowUserMenu(false);
                navigate("/profile");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/80 hover:text-blue-600 rounded-xl transition-colors text-left cursor-pointer"
            >
              <User size={15} className="text-blue-500" />
              <span>View Profile</span>
            </button>

            <button
              onClick={() => {
                setShowUserMenu(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/80 rounded-xl transition-colors text-left cursor-pointer"
            >
              <LogOut size={15} className="text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* User Card Trigger */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/60 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#D97706] flex items-center justify-center text-white text-sm font-semibold shadow-sm shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.username || "User"}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role || "Admin"}</p>
            </div>
          </div>

          <ChevronUp
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
