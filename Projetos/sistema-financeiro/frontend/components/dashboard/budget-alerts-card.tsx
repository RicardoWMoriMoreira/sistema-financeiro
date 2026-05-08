import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import type { BudgetStatus } from "@/types/transactions";

type BudgetAlertsCardProps = {
  budgets: BudgetStatus[];
};

export function BudgetAlertsCard({ budgets }: BudgetAlertsCardProps) {
  const exceededBudgets = budgets.filter((b) => b.is_exceeded);
  const warningBudgets = budgets.filter(
    (b) => !b.is_exceeded && Number(b.percentage_used) >= 80
  );
  const alertBudgets = [...exceededBudgets, ...warningBudgets].slice(0, 3);

  return (
    <Card className="border-slate-800 bg-slate-900 text-slate-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Alertas de Orçamento
        </CardTitle>
        <Button asChild variant="outline" size="sm" className="border-slate-700 text-slate-300">
          <Link href="/budget">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {alertBudgets.length === 0 ? (
          <div className="flex items-center gap-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
              <span className="text-emerald-400">✓</span>
            </div>
            <div>
              <p className="font-medium text-emerald-400">Tudo sob controle!</p>
              <p className="text-sm text-slate-400">
                Nenhum orçamento em alerta
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alertBudgets.map((budget) => {
              const isExceeded = budget.is_exceeded;
              const percentageUsed = Number(budget.percentage_used);

              return (
                <div
                  key={budget.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3"
                >
                  <div>
                    <p className="font-medium">{budget.category.name}</p>
                    <p className="text-sm text-slate-400">
                      {formatCurrency(budget.amount_spent)} de{" "}
                      {formatCurrency(budget.amount_limit)}
                    </p>
                  </div>
                  <Badge
                    className={
                      isExceeded
                        ? "bg-red-500/20 text-red-400"
                        : "bg-amber-500/20 text-amber-400"
                    }
                  >
                    {isExceeded ? "Excedido" : `${percentageUsed.toFixed(0)}%`}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
