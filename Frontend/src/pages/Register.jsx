import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const Register = () => {
  const { register: registerAuth, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    clearAuthError();
    setLocalError(null);
    try {
      await registerAuth(data.fullName, data.email, data.password);
      navigate("/dashboard");
    } catch (err) {
      setLocalError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900/5">
      <div className="w-full max-w-md glass-card p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient accent behind card */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-6">
          <Logo size="md" />
          <h1 className="text-xl font-bold text-slate-900 mt-4">Create Viewer Account</h1>
          <p className="text-xs text-slate-500 mt-1">Get started with DataPulse AI Assistant</p>
        </div>

        {/* Info Banner explaining Viewer role restriction */}
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs flex items-start space-x-2">
          <span className="shrink-0 mt-0.5">ℹ️</span>
          <span>
            Public registrations are assigned <strong>Viewer</strong> access. Admin accounts require system administrator provisioning.
          </span>
        </div>

        {/* Error Alert Banner */}
        {(localError || authError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-start space-x-2">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{localError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Sarah Connor"
              {...register("fullName")}
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.fullName && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="sarah@example.com"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-500 font-medium mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 glass-button-primary font-semibold text-xs transition-all mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
