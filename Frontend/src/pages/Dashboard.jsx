import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { Database, Zap, Clock, Cpu, ArrowUpRight, MessageSquareCode } from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const { activeConnection } = useChat();

  const metrics = [
    { title: "Connected Databases", value: "3", change: "MySQL, Postgres, Oracle", icon: Database },
    { title: "Total Queries Executed", value: "128", change: "+14% this week", icon: Zap },
    { title: "Avg AI Translation Latency", value: "142 ms", change: "Optimal Speed", icon: Clock },
    { title: "LLM Token Usage", value: "14.2k", change: "Gemini / Groq LLMs", icon: Cpu },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.username || "User"} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise Neural SQL Assistant & Database Analytics Console
          </p>
        </div>

        <Link
          to="/chat"
          className="glass-button-primary px-5 py-3 text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <MessageSquareCode size={16} />
          <span>Launch AI Query Workspace</span>
        </Link>
      </div>

      {/* Glass Card Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="glass-card glass-card-hover p-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{m.title}</span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{m.value}</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{m.change}</p>
              </div>
              <div className="p-3.5 bg-blue-50/80 border border-blue-100 text-blue-600 rounded-xl shadow-xs">
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Database Target Banner */}
      <div className="glass-card p-6 border-l-4 border-l-blue-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Target Database</h2>
          </div>
          <Link to="/connections" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            <span>Manage Connections</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {activeConnection ? (
          <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold text-slate-900">{activeConnection.name}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Host: <strong className="text-slate-800">{activeConnection.host}:{activeConnection.port}</strong> | Target DB: <strong className="text-blue-600">{activeConnection.databaseName}</strong>
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold w-fit">
              Connected & Verified
            </span>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No target database selected.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
