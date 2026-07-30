import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  SquarePen,
  LayoutGrid,
  Database,
  FolderTree,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useConnection } from "../context/ConnectionContext";

export const Sidebar = ({ isOpenMobile, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { activeConnection } = useChat();
  const { connections, selectedConnectionId, setSelectedConnectionId } = useConnection();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mainNavItems = [
    { label: "New chat", path: "/chat", icon: SquarePen },
    { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { label: "Databases", path: "/connections", icon: Database },
    { label: "Schema Explorer", path: "/schema", icon: FolderTree },
    { label: "System Logs", path: "/admin", icon: ShieldCheck },
  ];

  const recentItems = [
    { id: 1, title: "New Conversation", path: "/chat?session=1" },
    { id: 2, title: "show me all students with...", path: "/chat?session=2" },
    { id: 3, title: "Show all users", path: "/chat?session=3" },
    { id: 4, title: "Show all users", path: "/chat?session=4" },
  ];

  const displayName = user?.fullName || user?.username || "User";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "US";
  const rawRole = user?.role || (Array.isArray(user?.roles) ? user?.roles[0] : user?.roles) || "VIEWER";
  const formattedRole = typeof rawRole === "string" ? rawRole.replace("ROLE_", "") : "VIEWER";
  const isAdmin = formattedRole.toUpperCase() === "ADMIN";

  const visibleNavItems = mainNavItems.filter((item) => item.path !== "/admin" || isAdmin);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans border-r border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <Logo size="sm" />
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>
      </div>

      {/* Target Database Select Dropdown */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Target Connection
          </span>
          <span className="px-1.5 py-0.2 text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 rounded-full border border-blue-200/80 dark:border-blue-800">
            {connections?.length || 0} Active
          </span>
        </div>
        <div className="relative flex items-center">
          <select
            value={selectedConnectionId || ""}
            onChange={(e) => setSelectedConnectionId(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl py-2 px-3 pr-8 text-xs font-extrabold text-slate-900 dark:text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs transition-all hover:bg-slate-100 dark:hover:bg-slate-750"
          >
            {connections && connections.length > 0 ? (
              connections.map((conn) => (
                <option key={conn.id} value={conn.id} className="dark:bg-slate-900 font-semibold">
                  {conn.connectionName} ({conn.databaseType || "DB"})
                </option>
              ))
            ) : (
              <option value="" disabled className="dark:bg-slate-900">
                No Connections Available
              </option>
            )}
          </select>
          <ChevronDown size={14} className="absolute right-3 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="px-2.5 py-2.5 space-y-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full" />
              )}
              <Icon size={16} className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Recents Section (Scrolls smoothly without pushing footer) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-2 border-t border-slate-100 dark:border-slate-800/80 space-y-0.5">
        <div className="px-3 py-1 text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider">
          Recents
        </div>

        {recentItems.map((rec, idx) => {
          const isSelected = idx === 0 && location.pathname === "/chat";
          return (
            <button
              key={rec.id}
              onClick={() => {
                navigate(rec.path);
                onCloseMobile();
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors truncate block cursor-pointer ${
                isSelected
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {rec.title}
            </button>
          );
        })}
      </div>

      {/* User Footer Profile Card & Popup Menu (Pinned at bottom) */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 relative shrink-0" ref={menuRef}>
        {/* Floating Menu Popup above User Trigger */}
        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-slate-900 p-2 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 space-y-1">
            <button
              onClick={() => {
                setShowUserMenu(false);
                onCloseMobile();
                navigate("/profile");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
            >
              <User size={16} className="text-slate-500" />
              <span>Profile</span>
            </button>

            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

            <button
              onClick={() => {
                setShowUserMenu(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left cursor-pointer"
            >
              <LogOut size={16} className="text-red-500" />
              <span>Log out</span>
            </button>
          </div>
        )}

        {/* Profile Card Button */}
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-full flex items-center justify-between p-2 rounded-2xl transition-all text-left cursor-pointer ${
            showUserMenu ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`}
          title="User Account Menu"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize font-medium">{formattedRole}</p>
            </div>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col h-screen fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 z-10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
