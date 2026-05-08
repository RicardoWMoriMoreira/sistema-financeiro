"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Erro na página:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-slate-50">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-red-950/50">
          <AlertTriangle className="size-10 text-red-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Ocorreu um erro</h1>
          <p className="text-slate-400">
            Algo inesperado aconteceu. Você pode tentar novamente ou voltar para
            a página inicial.
          </p>
        </div>

        {error.digest && (
          <p className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 font-mono text-xs text-slate-500">
            Código: {error.digest}
          </p>
        )}

        <div className="flex gap-3">
          <Button onClick={reset} className="gap-2" aria-label="Tentar novamente">
            <RefreshCw className="size-4" />
            Tentar novamente
          </Button>

          <Button variant="outline" asChild>
            <Link href="/dashboard" aria-label="Voltar para a página inicial">
              <Home className="size-4" />
              Página inicial
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
