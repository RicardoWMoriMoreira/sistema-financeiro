import { AppHeader } from "@/components/layout/app-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoalsLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Metas Financeiras</h2>
          <p className="mt-2 text-sm text-slate-400">
            Defina e acompanhe suas metas de economia e controle de gastos.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-slate-800" />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl bg-slate-800" />
          ))}
        </div>
      </div>
    </main>
  );
}
