import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { TransactionSummary } from "@/types/transactions";

type SummaryCardsProps = {
  summary: TransactionSummary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <section id="resumo" className="grid gap-4 sm:grid-cols-3">
      <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Receitas
          </CardTitle>
        </CardHeader>

        <CardContent>
          <strong className="text-2xl">
            {formatCurrency(summary.total_income)}
          </strong>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Despesas
          </CardTitle>
        </CardHeader>

        <CardContent>
          <strong className="text-2xl">
            {formatCurrency(summary.total_expense)}
          </strong>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Saldo
          </CardTitle>
        </CardHeader>

        <CardContent>
          <strong className="text-2xl">
            {formatCurrency(summary.balance)}
          </strong>
        </CardContent>
      </Card>
    </section>
  );
}
