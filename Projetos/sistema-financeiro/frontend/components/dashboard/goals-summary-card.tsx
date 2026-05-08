import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import type { GoalsSummary } from "@/types/transactions";

type GoalsSummaryCardProps = {
  summary: GoalsSummary;
};

export function GoalsSummaryCard({ summary }: GoalsSummaryCardProps) {
  return (
    <Card className="border-slate-800 bg-slate-900 text-slate-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Resumo de Metas
        </CardTitle>
        <Button asChild variant="outline" size="sm" className="border-slate-700 text-slate-300">
          <Link href="/goals">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">Metas Ativas</p>
            <p className="text-xl font-bold text-blue-400">
              {summary.active_goals}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Concluídas</p>
            <p className="text-xl font-bold text-emerald-400">
              {summary.completed_goals}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Guardado</p>
            <p className="text-lg font-semibold">
              {formatCurrency(summary.total_current)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Progresso</p>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.min(Number(summary.overall_progress), 100)}%` }}
                />
              </div>
              <span className="text-sm">
                {Number(summary.overall_progress).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
