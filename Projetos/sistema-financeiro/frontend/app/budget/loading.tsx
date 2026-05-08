import { AppHeader } from "@/components/layout/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Orçamento Mensal</h2>
          <p className="mt-2 text-sm text-slate-400">
            Defina limites de gastos por categoria e acompanhe seu consumo mensal.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-slate-800" />
          ))}
        </div>

        <Skeleton className="h-96 rounded-2xl bg-slate-800" />
      </div>
    </main>
  );
}
