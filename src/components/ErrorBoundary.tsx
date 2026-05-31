"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center max-w-lg w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-50 rounded-full animate-bounce">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Something went wrong
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-600 font-medium">
              An unexpected client-side exception has occurred. Our team has been notified.
            </p>
            
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-left overflow-auto max-h-48 text-xs font-mono text-gray-800">
                <p className="font-bold text-red-600 mb-1">{this.state.error.toString()}</p>
                <p>{this.state.error.stack}</p>
              </div>
            )}

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={this.handleReset}
                className="w-full sm:w-auto font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-2xl py-6 px-6 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full sm:w-auto font-bold border-gray-200 hover:bg-gray-50 rounded-2xl py-6 px-6 flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4 text-gray-600" /> Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
