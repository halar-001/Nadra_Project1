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
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  Plus,
} from "lucide-react";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useConnection } from "../context/ConnectionContext";

export const Sidebar = ({ isOpenMobile, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    searchTerm,
    setSearchTerm,
    createNewSession,
    renameSession,
    deleteSession,
  } = useChat();
  const { connections, selectedConnectionId, setSelectedConnectionId } = useConnection();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
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
    { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { label: "Databases", path: "/connections", icon: Database },
    { label: "Schema Explorer", path: "/schema", icon: FolderTree },
    { label: "System Logs", path: "/admin", icon: ShieldCheck },
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

  const handleStartRename = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = async (e, sessionId) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      await renameSession(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    setDeleteConfirmId(sessionId);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans border-r border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
      {/* Brand Header & Sticky Target Connection Dropdown */}
      <div className="shrink-0 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 z-10">
        <div className="p-4 flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Target Database Select Dropdown (Pinned at Top) */}
        <div className="px-3 pb-3 space-y-1.5">
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
              onChange={async (e) => {
                const newConnId = Number(e.target.value);
                setSelectedConnectionId(newConnId);
                await createNewSession("New Chat Session", newConnId);
                if (location.pathname !== "/chat") navigate("/chat");
              }}
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
      </div>

      {/* SIDEBAR SCROLL CONTAINER */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 min-h-0">

        {/* + NEW CHAT LAUNCHER BUTTON */}
        <div>
          <button
            onClick={() => {
              createNewSession("New Chat Session", selectedConnectionId);
              navigate("/chat");
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className="space-y-1">
          <NavLink
            to="/chat"
            onClick={onCloseMobile}
            className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group ${
              location.pathname === "/chat"
                ? "bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-extrabold border border-blue-200/80 dark:border-blue-800"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <SquarePen size={16} className="shrink-0" />
            <span>AI Chat Assistant</span>
          </NavLink>

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon size={16} className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* CONVERSATION SEARCH BOX */}
        <div className="pt-1">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-7 pr-2.5 text-[11px] font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Recents Conversation Sessions List (Filtered by Selected Database Connection) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
          {(() => {
            const displayedSessions = sessions.filter((s) => {
              const matchesSearch = !searchTerm.trim() || s.title.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesConn = !selectedConnectionId || !s.connectionId || Number(s.connectionId) === Number(selectedConnectionId);
              return matchesSearch && matchesConn;
            });

            return (
              <>
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>Conversations</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-extrabold">
                    {displayedSessions.length}
                  </span>
                </div>

                {displayedSessions.length > 0 ? (
                  displayedSessions.map((s) => {
                    const isSelected = s.id === activeSessionId && location.pathname === "/chat";
                    const isEditing = editingSessionId === s.id;

                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionId(s.id);
                          if (location.pathname !== "/chat") navigate("/chat");
                          onCloseMobile();
                        }}
                        className={`group w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold border border-slate-200 dark:border-slate-700"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare size={13} className={isSelected ? "text-blue-500 shrink-0" : "text-slate-400 shrink-0"} />
                          {isEditing ? (
                            <input
                              type="text"
                              autoFocus
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRename(e, s.id);
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-blue-500 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-none"
                            />
                          ) : (
                            <span className="truncate font-semibold text-[11px]">{s.title}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {isEditing ? (
                            <button
                              onClick={(e) => handleSaveRename(e, s.id)}
                              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-600 rounded"
                            >
                              <Check size={12} />
                            </button>
                          ) : (
                            <>
                              <span className="text-[9px] font-mono text-slate-400 group-hover:hidden">
                                {s.messageCount || 0}/40
                              </span>
                              <button
                                onClick={(e) => handleStartRename(e, s)}
                                className="hidden group-hover:block p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                title="Rename Chat"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, s.id)}
                                className="hidden group-hover:block p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                                title="Delete Chat"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-slate-400 text-xs italic">
                    No conversations for this database.
                  </div>
                )}
              </>
            );
          })()}
        </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-sm flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Delete Chat?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Are you sure you want to delete this conversation session? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <button
                onClick={async () => {
                  await deleteSession(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
