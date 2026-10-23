"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-3xl bg-red-500/[0.05] border border-red-500/20 text-center space-y-3 my-4">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
            {this.props.fallbackTitle || "Ocorreu um erro ao carregar este conteúdo"}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            {this.state.error?.message || "Uma falha inesperada impediu a exibição deste componente."}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleRetry}
            className="rounded-full text-xs font-bold gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
