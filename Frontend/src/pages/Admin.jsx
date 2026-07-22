import React, { useState } from "react";
import { ShieldCheck, RotateCw, Search, Terminal, Activity, AlertTriangle } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";

export const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isReloading, setIsReloading] = useState(false);

  const logs = [
    { id: 1, user: "admin", action: "LOGIN_SUCCESS", details: "Successfully logged in from IP" },
    { id: 2, user: "System", action: "REFRESH_FAILED", details: "Revoked or invalid refresh token used" },
    { id: 3, user: "System", action: "REFRESH_FAILED", details: "Revoked or invalid refresh token used" },
    { id: 4, user: "admin", action: "LOGIN_SUCCESS", details: "Successfully logged in from IP" },
    { id: 5, user: "admin", action: "CHAT_PROMPT", details: "Session: show me all students with first-nam..., Prompt: show me all students with first-name ali" },
    { id: 6, user: "admin", action: "LOGIN_SUCCESS", details: "Successfully logged in from IP" },
    { id: 7, user: "admin", action: "CHAT_PROMPT", details: "Session: Show all users, Prompt: Show all users" },
  ];

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => setIsReloading(false), 600);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Purple latency graph heights
  const latencyHeights = [90, 45, 25, 18, 12, 8, 6, 5, 4, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Security & Telemetry Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit logs and query engine metrics
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          icon={RotateCw}
          isLoading={isReloading}
          onClick={handleReload}
          className="rounded-2xl"
        >
          Reload System State
        </Button>
      </div>

      {/* Top 2 Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: API & Query Latency */}
        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              API & Query Latency (ms)
            </h3>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
            {latencyHeights.map((h, idx) => (
              <div key={idx} className="flex-1 bg-indigo-500 dark:bg-indigo-400 rounded-t-xs hover:bg-indigo-600 transition-all" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
            <span>users/me</span>
            <span>chat/sessions/33/stream</span>
            <span>auth/logout</span>
            <span>metrics/latency</span>
            <span>users/me</span>
          </div>
        </Card>

        {/* Right: HTTP & Query Error Counts */}
        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              HTTP & Query Error Counts
            </h3>
          </div>

          <div className="h-44 w-full flex items-end justify-around gap-6 border-b border-slate-200 dark:border-slate-800 pb-2 px-8">
            <div className="w-24 bg-amber-500 rounded-t-lg" style={{ height: "85%" }} />
            <div className="w-24 bg-amber-500 rounded-t-lg" style={{ height: "20%" }} />
            <div className="w-24 bg-amber-500 rounded-t-lg" style={{ height: "8%" }} />
          </div>
          <div className="flex items-center justify-around text-[10px] font-mono text-slate-400 mt-2">
            <span>auth/refresh</span>
            <span>auth/login</span>
            <span>metrics/latency</span>
          </div>
        </Card>
      </div>

      {/* Operations Audit Trail */}
      <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Operations Audit Trail
            </h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400">
                    --
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                    {log.user}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Admin;
