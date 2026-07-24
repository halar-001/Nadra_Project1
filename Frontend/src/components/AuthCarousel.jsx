import React, { useState, useEffect } from "react";
import { Sparkles, Activity, ShieldCheck, Database, Terminal, CheckCircle2 } from "lucide-react";

const slides = [
  {
    id: "sql-gen",
    badge: "Neural Engine v4.2",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Sparkles,
    title: "Instant English to SQL Translation",
    description: "Ask questions in plain language. DataPulse AI compiles, optimizes, and executes high-performance SQL across your catalogs.",
    visual: (
      <div className="w-full bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-lg text-xs font-mono space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Terminal size={13} className="text-blue-400" />
            <span>query_generator.prompt</span>
          </div>
          <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active AI
          </span>
        </div>
        <div className="text-slate-300 flex items-start gap-2">
          <span className="text-blue-400 shrink-0">💬 Prompt:</span>
          <span className="text-slate-200">"Show top 5 users by total orders in 2026"</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">Optimized SQL Output</div>
          <p className="text-blue-300">SELECT u.username, COUNT(o.id) AS total_orders</p>
          <p className="text-purple-300">FROM users u JOIN orders o ON u.id = o.user_id</p>
          <p className="text-emerald-400">WHERE YEAR(o.created_at) = 2026 GROUP BY u.id LIMIT 5;</p>
        </div>
      </div>
    ),
  },
  {
    id: "telemetry",
    badge: "Sub-100ms Latency",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Activity,
    title: "Multi-Catalog Telemetry & Speed",
    description: "Monitor execution telemetry in real time. Direct connection pools to PostgreSQL, MySQL, SQLite, and Oracle.",
    visual: (
      <div className="w-full bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
          <span className="text-slate-400 font-mono text-[11px]">Live Database Nodes</span>
          <span className="text-xs font-extrabold text-blue-400">4 Connected</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-blue-400" />
              <span className="text-slate-200 font-medium">mysql_prod_db</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">14 ms</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-purple-400" />
              <span className="text-slate-200 font-medium">postgres_analytics</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">28 ms</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "security",
    badge: "Enterprise RBAC",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: ShieldCheck,
    title: "Granular Security & Access Control",
    description: "Role-based authorization built-in. Role management for Admins, Analysts, and Viewers with full audit logging.",
    visual: (
      <div className="w-full bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-lg space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400 text-[11px] font-mono">Security Context</span>
          <span className="text-purple-400 font-bold">JWT 256-Bit</span>
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span>Strict Role Enforcement (ADMIN / VIEWER)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span>Real-time Prompt Sanitization Guardrails</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[11px]">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
            <span>Automated Audit Trail & Logs</span>
          </div>
        </div>
      </div>
    ),
  },
];

export const AuthCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = slides[activeIndex];
  const IconComponent = current.icon;

  return (
    <div
      className="hidden lg:flex flex-col justify-between w-full h-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-2xl text-slate-900 dark:text-white min-h-[500px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between relative z-10">
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${current.badgeColor} flex items-center gap-1.5 shadow-2xs`}>
          <IconComponent size={14} />
          <span>{current.badge}</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400 font-bold">
          0{activeIndex + 1} / 0{slides.length}
        </span>
      </div>

      {/* Slide Visual & Description */}
      <div className="my-4 space-y-4 relative z-10">
        {current.visual}

        <div className="space-y-1.5">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.description}
          </p>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800 relative z-10">
        <div className="flex items-center space-x-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === activeIndex
                  ? "w-7 bg-blue-600 dark:bg-blue-400"
                  : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          DATAPULSE ASSISTANT PLATFORM
        </span>
      </div>
    </div>
  );
};

export default AuthCarousel;
