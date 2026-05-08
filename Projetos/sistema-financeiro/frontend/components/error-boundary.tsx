"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
            <AlertTriangle className="size-8 text-red-600 dark:text-red-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Algo deu errado
            </h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              Ocorreu um erro inesperado. Tente recarregar o componente ou
              atualize a página.
            </p>
          </div>

          {this.state.error && (
            <details className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-950">
              <summary className="cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300">
                Detalhes do erro
              </summary>
              <pre className="mt-3 overflow-auto text-xs text-red-600 dark:text-red-400">
                {this.state.error.message}
              </pre>
            </details>
          )}

          <Button
            onClick={this.handleReset}
            className="gap-2"
            aria-label="Tentar novamente"
          >
            <RefreshCw className="size-4" />
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
