import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { Database, MessageSquare, Clock, ArrowRight, Activity, ShieldCheck, Plus } from "lucide-react";
import Card, { CardHeader, CardTitle, CardContent } from "../components/Card";

export const Dashboard = () => {
  const { user } = useAuth();
  const { activeConnection } = useChat();
  const navigate = useNavigate();

  // Mock bar height data matching image 3 telemetry graph
  const barHeights = [
    85, 35, 20, 15, 12, 10, 8, 7, 6, 5, 5, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner Card */}
      <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 rounded-3xl shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Console Summary
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
          Welcome back, {user?.username || "admin"}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Interact with relational databases using natural language prompts. The AI will translate, execute, format, and explain query results in real-time.
        </p>
      </Card>

      {/* 3 Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connected Databases */}
        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Connected Databases
            </span>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-2">
              2
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Database size={22} />
          </div>
        </Card>

        {/* Active Conversations */}
        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Conversations
            </span>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-2">
              15
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MessageSquare size={22} />
          </div>
        </Card>

        {/* Avg Latency */}
        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg Latency (API)
            </span>
            <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              94 ms
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Telemetry & Workspace Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Latency Chart */}
        <Card glass={false} className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  API & Query Execution Latency (ms)
                </h3>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md">
                Live Telemetry
              </span>
            </div>

            {/* Custom SVG Bar Graph */}
            <div className="h-44 w-full pt-4 pb-2 flex items-end justify-between gap-1 border-b border-slate-200 dark:border-slate-800">
              {barHeights.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-t-xs hover:bg-emerald-600 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span>users/me</span>
              <span>connections</span>
              <span>chat/sessions/34/stream</span>
              <span>chat/sessions/28</span>
              <span>users/me</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Launch Workspace */}
        <Card glass={false} className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Launch Workspace
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              Configure connections or open an AI chat dialog immediately.
            </p>

            {/* Quick Action Cards */}
            <div className="space-y-3">
              {/* Manage Catalogs */}
              <div
                onClick={() => navigate("/connections")}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Manage Catalogs
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Add MySQL connection
                  </p>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>

              {/* Start SQL Prompt */}
              <div
                onClick={() => navigate("/chat")}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Start SQL Prompt
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Query with English
                  </p>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Clock size={14} />
              <span>Audit Log Records: <strong>5 recent</strong></span>
            </span>
            <Link
              to="/admin"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Admin Console</span>
              <span>→</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
