import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    await registerAuth(data.username, data.email, data.password);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-md glass-card p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center mb-8">
          <Logo size="md" />
          <h1 className="text-xl font-bold text-slate-900 mt-4">Create DataPulse Account</h1>
          <p className="text-xs text-slate-500 mt-1">Get started with AI Database Assistant</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              {...register("username")}
              placeholder="johndoe"
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.username && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.email && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 glass-input text-slate-900 text-xs"
            />
            {errors.password && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 glass-button-primary font-semibold text-xs transition-all mt-2 cursor-pointer"
          >
            {isSubmitting ? "Creating Account..." : "Register Account"}
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
