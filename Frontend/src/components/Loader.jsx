import React from "react";
import { Loader2, Database } from "lucide-react";

export const Loader = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  glass = true,
  className = "",
}) => {
  const spinnerSizes = {
    sm: 18,
    md: 28,
    lg: 40,
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
        <Loader2
          size={spinnerSizes[size] || 28}
          className="animate-spin text-blue-600 dark:text-blue-400 relative z-10"
        />
      </div>
      {text && (
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md">
        <div className="glass-modal p-8 rounded-3xl flex flex-col items-center gap-4 shadow-2xl border border-white/80 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Database size={28} className="animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">DataPulse AI</h4>
            <p className="text-xs font-medium text-slate-500">{text}</p>
          </div>
          <Loader2 size={24} className="animate-spin text-blue-600 dark:text-blue-400 mt-2" />
        </div>
      </div>
    );
  }

  return spinner;
};

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800/80 rounded-xl ${className}`} />
);

export default Loader;
