import { AppHeader } from "@/components/layout/app-header";
import { BudgetManager } from "@/components/budget/budget-manager";
import { getBudgetStatus, getCategories } from "@/lib/api";

export default async function BudgetPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const [budgetStatus, categories] = await Promise.all([
    getBudgetStatus(currentMonth),
    getCategories(),
  ]);

  const expenseCategories = categories.filter((c) => c.type === "expense");

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

        <BudgetManager
          budgetStatus={budgetStatus}
          categories={expenseCategories}
          currentMonth={currentMonth}
        />
      </div>
    </main>
  );
}
