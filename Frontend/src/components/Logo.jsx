import React from "react";

export const Logo = ({ size = "md" }) => {
  const isSm = size === "sm";

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center shrink-0">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full"></div>
        <svg
          width={isSm ? "26" : "32"}
          height={isSm ? "26" : "32"}
          viewBox="0 0 40 40"
          fill="none"
          className="relative z-10 hover:scale-105 transition-transform"
        >
          <defs>
            <linearGradient id="logo-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="logo-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <path
            d="M8 12C8 9.2 13.3 7 20 7C26.6 7 32 9.2 32 12C32 14.7 26.6 17 20 17C13.3 17 8 14.7 8 12Z"
            fill="url(#logo-grad-primary)"
          />
          <path
            d="M8 17C8 19.7 13.3 22 20 22C26.6 22 32 19.7 32 17M8 17V20C8 22.7 13.3 25 20 25C26.6 25 32 22.7 32 20V17"
            stroke="url(#logo-grad-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M8 25V28C8 30.7 13.3 33 20 33C26.6 33 32 30.7 32 28V25"
            stroke="url(#logo-grad-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M27 6L28.2 9.8L32 11L28.2 12.2L27 16L25.8 12.2L22 11L25.8 9.8L27 6Z"
            fill="url(#logo-grad-accent)"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight text-slate-900 ${isSm ? "text-base" : "text-xl"}`}>
          Data<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Pulse</span>
          <span className="ml-1 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200/80 rounded-md">
            AI
          </span>
        </span>
      </div>
    </div>
  );
};

export default Logo;
