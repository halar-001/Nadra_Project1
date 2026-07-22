import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@aidatabaseassistant.com", password: "password123" },
  });

  const onSubmit = async (data) => {
    await login(data.email, data.password);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-md glass-card p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient accent behind card */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8">
          <Logo size="md" />
          <h1 className="text-xl font-bold text-slate-900 mt-4">Sign in to DataPulse AI</h1>
          <p className="text-xs text-slate-500 mt-1">Enterprise Neural SQL Assistant</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              {...register("email")}
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.email && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.password && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 glass-button-primary font-semibold text-xs transition-all mt-2 cursor-pointer"
          >
            {isSubmitting ? "Signing in..." : "Sign In to Console"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Need an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
