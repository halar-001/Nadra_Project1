import React from "react";

export const Card = ({
  children,
  className = "",
  hover = false,
  glass = true,
  padding = "p-6",
  onClick,
  ...props
}) => {
  const glassStyle = glass
    ? hover
      ? "glass-card glass-card-hover"
      : "glass-card"
    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl";

  return (
    <div
      onClick={onClick}
      className={`${glassStyle} ${padding} ${onClick ? "cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800/80 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;
