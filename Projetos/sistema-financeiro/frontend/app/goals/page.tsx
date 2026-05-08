import { AppHeader } from "@/components/layout/app-header";
import { GoalsManager } from "@/components/goals/goals-manager";
import { getGoalsWithProgress, getGoalsSummary } from "@/lib/api";

export default async function GoalsPage() {
  const [goals, summary] = await Promise.all([
    getGoalsWithProgress(),
    getGoalsSummary(),
  ]);

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

        <GoalsManager goals={goals} summary={summary} />
      </div>
    </main>
  );
}
