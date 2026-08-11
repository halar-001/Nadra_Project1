import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import { User, Key, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import AuthCarousel from "../components/AuthCarousel";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(true),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const Login = ({ initialTab = "login" }) => {
  const { login, register: registerUser, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("expired") === "true";
  const passwordChanged = searchParams.get("passwordChanged") === "true";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [localError, setLocalError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Login Form Hook
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  // Register Form Hook
  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data) => {
    clearAuthError();
    setLocalError(null);
    try {
      await login(data.email, data.password, data.rememberMe);
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  const onSignup = async (data) => {
    clearAuthError();
    setLocalError(null);
    try {
      await registerUser(data.fullName, data.email, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        setActiveTab("login");
        setLoginValue("email", data.email);
        setIsSuccess(false);
      }, 2000);
    } catch (err) {
      setLocalError(err.message || "Registration failed. Please try again.");
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative bg-slate-50 dark:bg-[#070b14] overflow-y-auto">
      <AnimatedBackground />

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10 flex flex-col space-y-6 my-auto py-4">
        
        {/* Top Header: Centered Logo */}
        <div className="flex justify-center items-center">
          <Logo />
        </div>

        {/* 2-Column Cards Grid: Equal Top Position & Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch w-full">
          
          {/* Left Card: Auth Form */}
          <div className="glass-card bg-white dark:bg-slate-900/90 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between h-full border border-slate-200/80 dark:border-slate-800/80">
            <div className="auth-top-accent"></div>
            
            <div className="p-6 sm:p-8 flex-1 flex flex-col">
              {/* Segmented Sliding Tab Control */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6 relative shrink-0">
                <div
                  className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-transform duration-300 ease-out ${
                    activeTab === "register" ? "translate-x-[100%]" : "translate-x-0"
                  }`}
                ></div>
                <button
                  onClick={() => { setActiveTab("login"); setLocalError(null); }}
                  className={`relative w-1/2 py-2.5 text-sm font-bold z-10 transition-colors cursor-pointer ${
                    activeTab === "login" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setActiveTab("register"); setLocalError(null); }}
                  className={`relative w-1/2 py-2.5 text-sm font-bold z-10 transition-colors cursor-pointer ${
                    activeTab === "register" ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Alerts */}
              {passwordChanged && activeTab === "login" && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-medium">Password changed successfully! Please sign in with your new password.</p>
                </div>
              )}

              {sessionExpired && activeTab === "login" && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <p className="text-xs font-medium">Your session has expired. Please sign in again.</p>
                </div>
              )}

              {displayError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-2.5 animate-in shake">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <p className="text-xs font-medium">{displayError}</p>
                </div>
              )}

              {isSuccess && activeTab === "register" && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <p className="text-xs font-bold">Account created successfully! Redirecting to login...</p>
                </div>
              )}

              {/* Form Container */}
              <div className="flex-1 flex flex-col justify-center">
                {/* LOGIN FORM */}
                {activeTab === "login" && (
                  <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4 animate-slide-tab">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                        USERNAME / EMAIL
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          {...loginRegister("email")}
                          type="email"
                          placeholder="admin@example.com"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      {loginErrors.email && <p className="text-xs text-rose-500 font-medium pl-1 mt-1">{loginErrors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center pl-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          PASSWORD
                        </label>
                      </div>
                      <div className="relative">
                        <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          {...loginRegister("password")}
                          type="password"
                          placeholder="••••••••"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      {loginErrors.password && <p className="text-xs text-rose-500 font-medium pl-1 mt-1">{loginErrors.password.message}</p>}
                    </div>

                    <div className="flex items-center pl-1 py-1">
                      <input
                        {...loginRegister("rememberMe")}
                        id="rememberMe"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer transition-colors"
                      />
                      <label htmlFor="rememberMe" className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                        Remember me
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoginSubmitting}
                      className="w-full py-3.5 px-4 btn-primary-vibrant text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    >
                      {isLoginSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Sign In Securely</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* REGISTER FORM */}
                {activeTab === "register" && (
                  <form onSubmit={handleSignupSubmit(onSignup)} className="space-y-3.5 animate-slide-tab">
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                        FULL NAME
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          {...signupRegister("fullName")}
                          type="text"
                          placeholder="John Doe"
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                      {signupErrors.fullName && <p className="text-xs text-rose-500 font-medium pl-1 mt-1">{signupErrors.fullName.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                        EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          {...signupRegister("email")}
                          type="email"
                          placeholder="admin@example.com"
                          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                      {signupErrors.email && <p className="text-xs text-rose-500 font-medium pl-1 mt-1">{signupErrors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                          PASSWORD
                        </label>
                        <div className="relative">
                          <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...signupRegister("password")}
                            type="password"
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                          />
                        </div>
                        {signupErrors.password && <p className="text-[10px] text-rose-500 font-medium pl-1 mt-1">{signupErrors.password.message}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                          CONFIRM
                        </label>
                        <div className="relative">
                          <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            {...signupRegister("confirmPassword")}
                            type="password"
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                          />
                        </div>
                        {signupErrors.confirmPassword && <p className="text-[10px] text-rose-500 font-medium pl-1 mt-1">{signupErrors.confirmPassword.message}</p>}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSignupSubmitting || isSuccess}
                      className="w-full py-3.5 px-4 btn-primary-vibrant text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-3 cursor-pointer"
                    >
                      {isSignupSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>


          </div>

          {/* Right Card: Feature Showcase Carousel */}
          <div className="hidden lg:flex flex-col h-full">
            <AuthCarousel />
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
