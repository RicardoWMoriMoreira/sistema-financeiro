import { AppHeader } from "@/components/layout/app-header";
import { RecurringTransactionForm } from "@/components/recurring/recurring-transaction-form";
import { RecurringTransactionTable } from "@/components/recurring/recurring-transaction-table";
import { ProcessRecurringButton } from "@/components/recurring/process-recurring-button";
import { getCategories, getRecurringTransactions } from "@/lib/api";

export default async function RecurringPage() {
  const [recurringTransactions, categories] = await Promise.all([
    getRecurringTransactions(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transações Recorrentes</h1>
            <p className="text-sm text-slate-400">
              Gerencie suas receitas e despesas que se repetem automaticamente
            </p>
          </div>

          <ProcessRecurringButton />
        </div>

        <RecurringTransactionForm categories={categories} />

        <RecurringTransactionTable
          recurringTransactions={recurringTransactions}
          categories={categories}
        />
      </div>
    </main>
  );
}
