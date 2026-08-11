import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "./MainLayout";
import Loader from "../components/Loader";
import { ShieldAlert } from "lucide-react";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullScreen text="Verifying authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role Protection Check
  if (requiredRole) {
    const rawRole = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : user?.roles) || "";
    const roleString = typeof rawRole === "string" ? rawRole : (rawRole?.authority || rawRole?.name || rawRole?.roleName || "");
    
    // Normalize role string comparison (e.g. "ROLE_ADMIN" -> "ADMIN", "admin" -> "ADMIN")
    const normalizedRole = roleString.toUpperCase().replace("ROLE_", "").trim();
    const normalizedRequired = requiredRole.toUpperCase().replace("ROLE_", "").trim();

    const hasPermission = normalizedRole === normalizedRequired;

    if (!hasPermission) {
      return (
        <MainLayout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-4">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Logs Restricted</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
              You are signed in as <strong>{user?.email || "User"}</strong> with role{" "}
              <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                {normalizedRole || "VIEWER"}
              </span>
              . Accessing System Logs requires <strong>{normalizedRequired}</strong> privileges.
            </p>
            
            <div className="mt-6 flex items-center gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = "/login";
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Switch Account (Sign in as Admin)
              </button>
            </div>
          </div>
        </MainLayout>
      );
    }
  }

  return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;
