import React from "react";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#f4f7fc] dark:bg-[#070b14] transition-colors duration-300">
      {/* Soft Ambient Radial Blur Orbs */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-blue-400/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-orb-pulse" />
      <div className="absolute top-1/3 -right-32 w-[450px] h-[450px] bg-indigo-300/25 dark:bg-indigo-600/15 rounded-full blur-3xl animate-orb-pulse" style={{ animationDelay: "2.5s" }} />
      <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-sky-300/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-orb-pulse" style={{ animationDelay: "4.5s" }} />

      {/* Floating 3D Geometric Accents */}
      <div className="absolute top-12 left-[10%] w-14 h-14 rounded-2xl border border-blue-200 dark:border-blue-800/40 bg-white/60 dark:bg-blue-900/10 backdrop-blur-md animate-float-slow hidden md:flex items-center justify-center shadow-lg shadow-blue-500/5">
        <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-400/40 rotate-12 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
        </div>
      </div>

      <div className="absolute bottom-20 right-[8%] w-20 h-20 rounded-3xl border border-indigo-200 dark:border-indigo-800/40 bg-white/60 dark:bg-indigo-900/10 backdrop-blur-md animate-float-reverse hidden md:flex items-center justify-center shadow-lg shadow-indigo-500/5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 border border-indigo-300/50 -rotate-45" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] opacity-60 dark:opacity-20" />
    </div>
  );
};

export default AnimatedBackground;
