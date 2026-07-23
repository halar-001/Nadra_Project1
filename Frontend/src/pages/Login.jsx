import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(true),
});

export const Login = () => {
  const { login, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("expired") === "true";
  const [localError, setLocalError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin1@aidatabaseassistant.com",
      password: "Admin@12345",
      rememberMe: true,
    },
  });

  const handleQuickFill = (email, password) => {
    setValue("email", email);
    setValue("password", password);
    clearAuthError();
    setLocalError(null);
  };

  const onSubmit = async (data) => {
    clearAuthError();
    setLocalError(null);
    try {
      await login(data.email, data.password, data.rememberMe);
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900/5">
      <div className="w-full max-w-md glass-card p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient accent behind card */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-6">
          <Logo size="md" />
          <h1 className="text-xl font-bold text-slate-900 mt-4">Sign in to DataPulse AI</h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Neural SQL Assistant</p>
        </div>

        {/* Session expired or Auth error alert banner */}
        {(sessionExpired || localError || authError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-start space-x-2">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>
              {sessionExpired
                ? "Your session has expired. Please sign in again."
                : localError || authError}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="user@example.com"
              {...register("email")}
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.email && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.password && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 glass-button-primary font-semibold text-xs transition-all mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Console</span>
            )}
          </button>
        </form>

        {/* Quick Pre-seeded Admin shortcuts for Developer testing */}
        <div className="mt-6 pt-4 border-t border-slate-200/60">
          <p className="text-[11px] font-semibold text-slate-500 mb-2 text-center uppercase tracking-wider">
            Pre-seeded Dev Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin1@aidatabaseassistant.com", "Admin@12345")}
              className="px-2 py-1.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer border border-slate-200"
            >
              👑 Admin 1
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("admin2@aidatabaseassistant.com", "Admin@12345")}
              className="px-2 py-1.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer border border-slate-200"
            >
              👑 Admin 2
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Need a Viewer account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Register as Viewer
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
