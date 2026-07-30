import React, { forwardRef } from "react";

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconRight: IconRight,
      className = "",
      type = "text",
      fullWidth = true,
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? "w-full" : ""} space-y-1.5`}>
        {label && (
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
              <Icon size={17} />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={`glass-input w-full py-2.5 text-sm transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
              Icon ? "pl-10" : "pl-3.5"
            } ${IconRight ? "pr-10" : "pr-3.5"} ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300/70 dark:border-slate-700/80"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
            {...props}
          />
          {IconRight && (
            <div className="absolute right-3.5 text-slate-400 dark:text-slate-500">
              <IconRight size={17} />
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-semibold text-red-500 animate-in fade-in duration-150">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
