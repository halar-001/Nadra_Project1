import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useConnection } from "../context/ConnectionContext";
import { useChat } from "../context/ChatContext";
import {
  Database,
  MessageSquare,
  Clock,
  ArrowRight,
  Activity,
  Terminal,
  Search,
  Pause,
  Play,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
  Zap
} from "lucide-react";
import Card from "../components/Card";

// Initial Mock Logs Stream
const INITIAL_LOGS = [
  { id: 1, timestamp: "11:34:02", level: "INFO", module: "AUTH_SERVICE", message: "JWT token validated for user" },
  { id: 2, timestamp: "11:34:15", level: "SUCCESS", module: "SQL_PARSER", message: "Natural language query parsed into optimized AST in 4ms" },
  { id: 3, timestamp: "11:34:16", level: "SUCCESS", module: "EXECUTOR", message: "Executed SELECT on target database catalog (Returned 12 rows in 14ms)" },
  { id: 4, timestamp: "11:35:01", level: "INFO", module: "CATALOG", message: "Active database pool connection verified for target connection" },
  { id: 5, timestamp: "11:36:20", level: "SECURITY", module: "RBAC", message: "Access granted for resource /api/v1/connections" },
  { id: 6, timestamp: "11:37:44", level: "WARN", module: "CACHE", message: "Schema Metadata cache hit ratio verified" },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const { connections, selectedConnection } = useConnection();
  const { messages } = useChat();
  const navigate = useNavigate();

  // Dynamic system counts
  const connectedCount = connections?.length || 0;
  const activeDbName = selectedConnection?.connectionName || connections[0]?.connectionName || "Local Database";
  const activeDbType = selectedConnection?.databaseType || connections[0]?.databaseType || "MYSQL";
  const userQueryCount = messages?.filter((m) => m.sender === "USER")?.length || 0;
  const aiQueryCount = messages?.filter((m) => m.sender === "AI" && !m.isError)?.length || 0;
  
  // Calculate average execution time dynamically
  const aiMessages = messages?.filter((m) => m.sender === "AI" && m.executionTimeMs);
  const avgLatencyMs = aiMessages && aiMessages.length > 0
    ? Math.round(aiMessages.reduce((acc, m) => acc + m.executionTimeMs, 0) / aiMessages.length)
    : 18;

  // Dynamic Telemetry Latency dataset
  const dynamicLatencyData = [
    { endpoint: "/api/chat/stream", latency: avgLatencyMs > 0 ? avgLatencyMs : 85, time: "11:30" },
    { endpoint: "/api/connections", latency: 35, time: "11:31" },
    { endpoint: "/api/users/me", latency: 20, time: "11:32" },
    { endpoint: "/api/sql/validate", latency: 15, time: "11:33" },
    { endpoint: "/api/auth/login", latency: 45, time: "11:34" },
    { endpoint: "/api/chat/sessions", latency: 28, time: "11:35" },
    { endpoint: "/api/schema/refresh", latency: 92, time: "11:36" },
    { endpoint: "/api/health", latency: 8, time: "11:37" },
    { endpoint: "/api/chat/stream", latency: avgLatencyMs, time: "11:38" },
    { endpoint: "/api/users/me", latency: 18, time: "11:39" },
  ];

  // Log Stream State
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [copied, setCopied] = useState(false);
  const logTerminalRef = useRef(null);

  // Timeframe state for latency chart
  const [timeframe, setTimeframe] = useState("1H");
  const [activeHoverBar, setActiveHoverBar] = useState(null);

  // Auto-generate live stream logs every 4 seconds when live is active
  useEffect(() => {
    if (!isLiveStreaming) return;

    const mockMessages = [
      { level: "SUCCESS", module: "EXECUTOR", message: "SQL Query executed successfully (Returned 8 rows in 11ms)" },
      { level: "INFO", module: "LLM_SERVICE", message: "Prompt tokens processed: 142 | Completion tokens: 68" },
      { level: "SECURITY", module: "AUDIT", message: "User session heartbeat acknowledged (IP: 192.168.1.45)" },
      { level: "INFO", module: "CONNECTION_POOL", message: "Keep-alive ping to mysql_prod_db successful (9ms)" },
      { level: "WARN", module: "RATE_LIMIT", message: "Client query frequency: 12 requests/min (Normal)" },
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];

      setLogs((prev) => [
        ...prev.slice(-30),
        {
          id: Date.now(),
          timestamp: timeStr,
          level: randomMsg.level,
          module: randomMsg.module,
          message: randomMsg.message,
        },
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Auto scroll terminal log bottom
  useEffect(() => {
    if (isLiveStreaming && logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs, isLiveStreaming]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesFilter = logFilter === "ALL" || log.level === logFilter;
    const matchesSearch =
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.module.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.level}] [${l.module}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case "SUCCESS":
        return "text-emerald-400 bg-emerald-500/20 border border-emerald-500/40";
      case "SECURITY":
        return "text-purple-300 bg-purple-500/20 border border-purple-500/40";
      case "WARN":
        return "text-amber-300 bg-amber-500/20 border border-amber-500/40";
      case "ERROR":
        return "text-rose-400 bg-rose-500/20 border border-rose-500/40";
      default:
        return "text-sky-300 bg-sky-500/20 border border-sky-500/40";
    }
  };

  const userRoleStr = (user?.role || (Array.isArray(user?.roles) ? user?.roles[0] : user?.roles) || "VIEWER").replace("ROLE_", "");
  const isAdmin = userRoleStr.toUpperCase() === "ADMIN";

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      {/* Hero Welcome Banner */}
      <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 rounded-md">
                Console Active
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Role: {(user?.role || (Array.isArray(user?.roles) ? user?.roles[0] : user?.roles) || "VIEWER").replace("ROLE_", "")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Welcome back, {user?.fullName || user?.username || "Admin"}! 👋
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Target Catalog: <strong className="text-blue-600 dark:text-blue-400">{activeDbName}</strong> ({activeDbType}). Monitor telemetry, system logs, and query analytics in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/chat")}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
            >
              <Zap size={15} />
              <span>Launch SQL Prompt</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 3 Dynamic Stat Metric Cards with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Connected Catalogs
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{connectedCount}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-0.5 ${connectedCount > 0 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 animate-pulse" : "text-amber-600 bg-amber-50"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${connectedCount > 0 ? "bg-emerald-500" : "bg-amber-500"}`}></span> {connectedCount > 0 ? "Live" : "No DB"}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Database size={18} />
              </div>
            </div>
            {/* Minimal Sparkline SVG */}
            <svg className="w-full h-10 mt-4 opacity-70" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,25 Q10,10 20,20 T40,15 T60,25 T80,10 T100,20 L100,30 L0,30 Z" fill="rgba(59, 130, 246, 0.1)" />
              <path d="M0,25 Q10,10 20,20 T40,15 T60,25 T80,10 T100,20" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </Card>

        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  User AI Prompts
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{userQueryCount}</h3>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <TrendingUp size={10} className="mr-0.5" /> {aiQueryCount} SQL Generated
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 border border-purple-100 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Activity size={18} />
              </div>
            </div>
            {/* Sparkline Bar Graph */}
            <div className="flex items-end gap-1.5 h-10 mt-4 opacity-70 w-full">
              {[30, 50, 40, 70, 60, 90, 80, 100, 85, 95].map((val, i) => (
                <div key={i} className="flex-1 bg-purple-200 dark:bg-purple-900/50 rounded-t-sm group-hover:bg-purple-400 dark:group-hover:bg-purple-500 transition-colors" style={{ height: `${val}%` }}></div>
              ))}
            </div>
          </div>
        </Card>

        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Avg Execution Latency
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white">{avgLatencyMs}<span className="text-lg text-slate-500 ml-1">ms</span></h3>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <Clock size={18} />
              </div>
            </div>
            {/* Smooth Latency Sparkline */}
            <svg className="w-full h-10 mt-4 opacity-70" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,20 Q15,5 30,15 T60,25 T80,10 T100,15" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              <circle cx="100" cy="15" r="3" fill="#10b981" className="animate-pulse" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Telemetry Latency Graph & Workspace Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Telemetry Latency Bar Chart */}
        <Card glass={false} className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  API & Query Execution Latency (ms)
                </h3>
              </div>

              {/* Timeframe Buttons */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold">
                {["1H", "24H", "7D"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      timeframe === t
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Bar Graph */}
            <div className="relative">
              {activeHoverBar !== null && (
                <div className="absolute top-0 right-0 bg-slate-950 text-white text-[11px] px-3 py-1.5 rounded-xl border border-slate-800 shadow-lg z-20 animate-in fade-in font-mono">
                  <span className="text-emerald-400 font-bold">{dynamicLatencyData[activeHoverBar].latency} ms</span>
                  <span className="text-slate-400 ml-2">({dynamicLatencyData[activeHoverBar].endpoint})</span>
                </div>
              )}

              <div className="h-48 w-full pt-8 pb-2 flex items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800">
                {dynamicLatencyData.map((item, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setActiveHoverBar(i)}
                    onMouseLeave={() => setActiveHoverBar(null)}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
                  >
                    <div
                      style={{ height: `${(item.latency / 100) * 100}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        activeHoverBar === i
                          ? "bg-blue-600 dark:bg-blue-400 shadow-lg shadow-blue-500/50 scale-x-105"
                          : "bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-600"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 font-medium">
              <span>11:30</span>
              <span>11:32</span>
              <span>11:34</span>
              <span>11:36</span>
              <span>Now ({avgLatencyMs}ms avg)</span>
            </div>
          </div>
        </Card>

        {/* Right: Quick Launch Workspace */}
        <Card glass={false} className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Quick Action Launcher
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 rounded-full border border-blue-200/80 dark:border-blue-800">
                4 Tools
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
              Direct access to SQL prompt, schema explorer, catalogs, and system audit logs.
            </p>

            <div className="space-y-2.5">
              <div
                onClick={() => navigate("/chat")}
                className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/30 dark:hover:to-slate-800/60 transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Ask AI SQL Prompt
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Generate sanitized SQL from natural language
                    </p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div
                onClick={() => navigate("/schema")}
                className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/30 dark:hover:to-slate-800/60 transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Database size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Inspect Database Schemas
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Explore tables, columns & foreign relationships
                    </p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div
                onClick={() => navigate("/connections")}
                className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-purple-500/60 dark:hover:border-purple-500/60 bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 dark:hover:from-purple-950/30 dark:hover:to-slate-800/60 transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Manage Catalogs & Credentials
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Configure MySQL, PostgreSQL & SQLite credentials
                    </p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div
                onClick={() => navigate("/admin")}
                className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-amber-950/30 dark:hover:to-slate-800/60 transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Security & RBAC Audit Logs
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Review access logs, tenant roles & system metrics
                    </p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-500" />
              <span>RBAC Enforcement: <strong className="text-slate-900 dark:text-white">Active</strong></span>
            </span>
            <Link
              to="/admin"
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Audit Console</span>
              <span>→</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* SYSTEM AUDIT LOGS WIDGET: LIGHT & DARK MODE COMPLIANT CARD CONTAINER (ADMIN ONLY) */}
      {isAdmin && (
        <Card glass={false} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-2xs space-y-4">
          {/* Terminal Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              {/* macOS Window Controls */}
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />

              <div className="ml-3 flex items-center gap-2 text-xs font-mono font-extrabold text-slate-900 dark:text-white tracking-wide">
                <Terminal size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>DataPulse System Audit Logs</span>
              </div>

              {isLiveStreaming && (
                <span className="ml-2 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE STREAM
                </span>
              )}
            </div>

            {/* Terminal Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Search Filter Input */}
              <div className="relative flex items-center">
                <Search size={13} className="absolute left-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Level Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 font-mono text-[11px]">
                {["ALL", "INFO", "SUCCESS", "WARN", "SECURITY"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      logFilter === lvl
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Live Toggle Button */}
              <button
                onClick={() => setIsLiveStreaming(!isLiveStreaming)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                title={isLiveStreaming ? "Pause Live Stream" : "Resume Live Stream"}
              >
                {isLiveStreaming ? <Pause size={14} /> : <Play size={14} className="text-emerald-500" />}
              </button>

              {/* Copy Logs Button */}
              <button
                onClick={handleCopyLogs}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                title="Copy logs"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Embedded High-Contrast Terminal Log Viewport */}
          <div className="bg-[#090d16] p-4 rounded-2xl border border-slate-800 shadow-inner">
            <div
              ref={logTerminalRef}
              className="h-60 w-full overflow-y-auto font-mono text-xs space-y-2 pr-2 custom-scrollbar select-text"
            >
              {filteredLogs.length === 0 ? (
                <div className="text-slate-400 py-8 text-center text-xs">
                  No log entries match the selected filter query.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 hover:bg-[#131b2e] p-1.5 rounded-lg transition-colors leading-relaxed"
                  >
                    <span className="text-slate-400 shrink-0 text-[11px] font-mono font-bold">[{log.timestamp}]</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border shrink-0 ${getLevelStyle(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>
                    <span className="text-slate-300 font-bold shrink-0 text-[11px]">[{log.module}]</span>
                    <span className="text-white font-medium text-xs font-mono">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
