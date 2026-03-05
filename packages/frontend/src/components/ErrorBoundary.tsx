"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary that catches errors in any child component tree.
 * Shows a styled error card with a retry button instead of crashing the whole page.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 border border-red-500/20 bg-red-400/5 rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-red-300 font-semibold mb-1">Something went wrong</p>
          <p className="text-brand-muted text-sm mb-5 max-w-sm">
            {this.state.error?.message || "An unexpected error occurred in this section."}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 text-sm bg-brand-surface border border-red-500/30 hover:border-red-400/50 rounded-lg text-red-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
