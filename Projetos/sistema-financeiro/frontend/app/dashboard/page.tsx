import Link from "next/link";

import { BudgetAlertsCard } from "@/components/dashboard/budget-alerts-card";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { ExpenseByCategoryChart } from "@/components/dashboard/expense-by-category-chart";
import { GoalsSummaryCard } from "@/components/dashboard/goals-summary-card";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  getBudgetStatus,
  getCategories,
  getGoalsSummary,
  getTransactionSummary,
  getTransactions,
} from "@/lib/api";

export default async function DashboardPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [summary, transactions, categories, goalsSummary, budgetStatus] = await Promise.all([
    getTransactionSummary(),
    getTransactions(),
    getCategories(),
    getGoalsSummary(),
    getBudgetStatus(currentMonth),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <SummaryCards summary={summary} />

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Transações cadastradas</p>
            <strong className="mt-2 block text-3xl">
              {transactions.length}
            </strong>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Categorias cadastradas</p>
            <strong className="mt-2 block text-3xl">{categories.length}</strong>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Ações rápidas</p>
            <strong className="mt-2 block text-3xl">3</strong>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <IncomeExpenseChart summary={summary} />

          <ExpenseByCategoryChart transactions={transactions} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <GoalsSummaryCard summary={goalsSummary} />

          <BudgetAlertsCard budgets={budgetStatus} />
        </section>

        <EvolutionChart />

        <QuickActions />

        <RecentTransactions transactions={transactions} />

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Próximos passos</h2>
              <p className="mt-1 text-sm text-slate-400">
                Continue alimentando o sistema com lançamentos financeiros para
                acompanhar sua evolução.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/transactions#nova-transacao">
                  Cadastrar transação
                </Link>
              </Button>

              <Button asChild variant="outline" className="text-slate-500">
                <Link href="/categories">Criar categoria</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
