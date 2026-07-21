import React from "react";
import { ShieldAlert, Activity, CheckCircle } from "lucide-react";

export const Admin = () => {
  const auditLogs = [
    { id: 101, action: "USER_AUTHENTICATION", user: "admin", ip: "127.0.0.1", latency: "45 ms", timestamp: "2026-07-21 11:34:00" },
    { id: 102, action: "SQL_QUERY_EXECUTION", user: "admin", ip: "127.0.0.1", latency: "142 ms", timestamp: "2026-07-21 11:36:00" },
    { id: 103, action: "DB_CATALOG_SELECT", user: "admin", ip: "127.0.0.1", latency: "12 ms", timestamp: "2026-07-21 11:38:00" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Audit Logs & Security</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time enterprise audit trail, API telemetry, and security access logs.</p>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
          <ShieldAlert size={18} className="text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Security Access Telemetry</h2>
        </div>

        {/* Data Table inside Glass Container */}
        <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-xs max-h-96">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
                <th className="p-3 font-semibold text-slate-700 font-mono">ID</th>
                <th className="p-3 font-semibold text-slate-700 font-mono">Action Event</th>
                <th className="p-3 font-semibold text-slate-700 font-mono">User Identity</th>
                <th className="p-3 font-semibold text-slate-700 font-mono">IP Address</th>
                <th className="p-3 font-semibold text-slate-700 font-mono">Latency</th>
                <th className="p-3 font-semibold text-slate-700 font-mono">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono text-slate-500 font-bold">{log.id}</td>
                  <td className="p-3 font-mono text-blue-600 font-semibold">{log.action}</td>
                  <td className="p-3 font-mono text-slate-800">{log.user}</td>
                  <td className="p-3 font-mono text-slate-600">{log.ip}</td>
                  <td className="p-3 font-mono text-emerald-600 font-bold">{log.latency}</td>
                  <td className="p-3 font-mono text-slate-400">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
