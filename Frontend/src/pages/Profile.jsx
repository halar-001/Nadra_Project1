import React from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, UserCheck, Key } from "lucide-react";

export const Profile = () => {
  const { user } = useAuth();
  const userInitials = user?.username ? user.username.substring(0, 2).toUpperCase() : "US";

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Account Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage user identity, security privileges, and application credentials.</p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-5 border-b border-slate-200/60 pb-6">
          <div className="w-16 h-16 rounded-full bg-[#D97706] text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
            {userInitials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.username}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200/80 rounded-md text-[10px] uppercase font-bold tracking-widest">
                Role: {user?.role || "ADMIN"}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck size={12} />
                JWT Authenticated
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="glass-panel p-4 rounded-xl space-y-1">
            <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">User Account ID</span>
            <p className="font-mono text-sm font-bold text-slate-900">{user?.id}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl space-y-1">
            <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Security Clearance</span>
            <p className="font-semibold text-sm text-slate-900">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
