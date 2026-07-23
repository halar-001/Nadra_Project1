import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8 sm:p-10 shadow-2xl border border-white/80 dark:border-slate-800">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6 shadow-inner border border-amber-500/20">
          <AlertCircle size={44} />
        </div>
        <span className="text-xs font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full">
          404 - Page Not Found
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">
          Lost in Query Space?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-8 leading-relaxed">
          The table or page you are requesting doesn't exist in our schema repository. Let's get you back to safety.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
