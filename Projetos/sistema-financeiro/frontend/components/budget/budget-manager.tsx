"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetTable } from "@/components/budget/budget-table";
import { BudgetForm } from "@/components/budget/budget-form";
import { formatCurrency } from "@/lib/formatters";
import type { BudgetStatus, Category } from "@/types/transactions";

type BudgetManagerProps = {
  budgetStatus: BudgetStatus[];
  categories: Category[];
  currentMonth: string;
};

export function BudgetManager({
  budgetStatus,
  categories,
  currentMonth,
}: BudgetManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  const totalLimit = budgetStatus.reduce(
    (sum, b) => sum + Number(b.amount_limit),
    0
  );
  const totalSpent = budgetStatus.reduce(
    (sum, b) => sum + Number(b.amount_spent),
    0
  );
  const exceededCount = budgetStatus.filter((b) => b.is_exceeded).length;

  const categoriesWithBudget = budgetStatus.map((b) => b.category_id);
  const availableCategories = categories.filter(
    (c) => !categoriesWithBudget.includes(c.id)
  );

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-800 bg-slate-900 text-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Limite Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <strong className="text-2xl">{formatCurrency(String(totalLimit))}</strong>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 text-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <strong className="text-2xl">{formatCurrency(String(totalSpent))}</strong>
            <p className="text-sm text-slate-400">
              {totalLimit > 0
                ? `${((totalSpent / totalLimit) * 100).toFixed(0)}% do limite`
                : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 text-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Orçamentos Excedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <strong
              className={`text-2xl ${exceededCount > 0 ? "text-red-400" : "text-emerald-400"}`}
            >
              {exceededCount}
            </strong>
            <p className="text-sm text-slate-400">
              de {budgetStatus.length} categorias
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Orçamentos do Mês</h3>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1 text-sm"
            />
          </div>
          {availableCategories.length > 0 && (
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancelar" : "Novo Orçamento"}
            </Button>
          )}
        </div>

        {showForm && availableCategories.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h4 className="mb-4 font-medium">Definir Limite de Orçamento</h4>
            <BudgetForm
              categories={availableCategories}
              currentMonth={selectedMonth}
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {budgetStatus.length === 0 ? (
          <p className="py-8 text-center text-slate-400">
            Nenhum orçamento definido para este mês. Crie seu primeiro orçamento!
          </p>
        ) : (
          <BudgetTable budgets={budgetStatus} onUpdate={handleSuccess} />
        )}
      </section>
    </>
  );
}
