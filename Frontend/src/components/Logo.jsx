import React from "react";
import { Link } from 'react-router-dom';

export const Logo = ({ size = "md" }) => {
  const isSm = size === "sm";

  return (
    <Link to="/dashboard" className="flex items-center gap-3 select-none cursor-pointer hover:opacity-90 transition-opacity block">
      {/* 3D Stacked Database Cylinder Logo Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={isSm ? "34" : "42"}
          height={isSm ? "34" : "42"}
          viewBox="0 0 40 40"
          fill="none"
          className="hover:scale-105 transition-transform"
        >
          <defs>
            <linearGradient id="db-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="db-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          {/* Top Cylinder Disc */}
          <ellipse cx="20" cy="11" rx="14" ry="5" fill="url(#db-purple-grad)" />
          <ellipse cx="20" cy="11" rx="11" ry="3.5" fill="#a855f7" opacity="0.4" />
          
          {/* Middle Ring */}
          <path d="M6 11 v7 c0 2.8 6.3 5 14 5 s14 -2.2 14 -5 v-7" fill="none" stroke="url(#db-purple-grad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M6 18 v7 c0 2.8 6.3 5 14 5 s14 -2.2 14 -5 v-7" fill="none" stroke="url(#db-purple-grad)" strokeWidth="3" strokeLinecap="round" />
          
          {/* Bottom Ring */}
          <path d="M6 25 v7 c0 2.8 6.3 5 14 5 s14 -2.2 14 -5 v-7" fill="none" stroke="url(#db-cyan-grad)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white leading-none ${isSm ? "text-lg" : "text-xl"}`}>
            Data<span className="text-blue-600 dark:text-blue-400">Pulse</span>
          </span>
          <span className={`ml-2 px-1 py-0.5 font-bold tracking-tight text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border-2 border-blue-400/80 dark:border-blue-800/80 rounded-lg leading-none ${isSm ? "text-lg" : "text-xl"}`}>
            AI
          </span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 tracking-widest uppercase mt-0.5">
          Intelligent Database Assistant
        </span>
      </div>
    </Link>
  );
};

export default Logo;
