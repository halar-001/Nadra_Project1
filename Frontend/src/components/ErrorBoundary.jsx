import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Button from "../components/Button";
import Card from "../components/Card";

export const ErrorPage = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center p-8 sm:p-10 shadow-2xl border border-red-200 dark:border-red-900/40">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 dark:bg-red-500/20 text-red-500 flex items-center justify-center mb-6 shadow-inner border border-red-500/20">
          <AlertTriangle size={44} />
        </div>
        <span className="text-xs font-mono font-bold tracking-widest text-red-600 dark:text-red-400 uppercase bg-red-100 dark:bg-red-950/60 px-3 py-1 rounded-full">
          Application Error
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
          Something went wrong
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          An unexpected UI execution exception occurred. Details below:
        </p>

        {error?.message && (
          <div className="my-6 p-4 rounded-xl bg-slate-900 text-red-400 font-mono text-xs text-left overflow-x-auto border border-slate-800">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          {resetErrorBoundary && (
            <Button variant="primary" icon={RefreshCw} onClick={resetErrorBoundary}>
              Try Again
            </Button>
          )}
          <Button variant="secondary" icon={Home} onClick={() => (window.location.href = "/dashboard")}>
            Reload App
          </Button>
        </div>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPage error={this.state.error} resetErrorBoundary={this.handleReset} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
