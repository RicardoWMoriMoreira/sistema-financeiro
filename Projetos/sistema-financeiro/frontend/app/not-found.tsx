"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-slate-50">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-amber-950/50">
          <FileQuestion className="size-10 text-amber-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl font-bold text-slate-300">404</h1>
          <h2 className="text-2xl font-semibold">Página não encontrada</h2>
          <p className="text-slate-400">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard" aria-label="Ir para a página inicial">
              <Home className="size-4" />
              Página inicial
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            aria-label="Voltar para a página anterior"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
        </div>
      </div>
    </main>
  );
}
