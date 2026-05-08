"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalForm } from "@/components/goals/goal-form";
import type { GoalProgress, GoalsSummary } from "@/types/transactions";

type GoalsManagerProps = {
  goals: GoalProgress[];
  summary: GoalsSummary;
};

export function GoalsManager({ goals, summary }: GoalsManagerProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900 text-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Total de Metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <strong className="text-2xl">{summary.total_goals}</strong>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 text-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Metas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <strong className="text-2xl text-blue-400">
              {summary.active_goals}
            </strong>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 text-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Metas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <strong className="text-2xl text-emerald-400">
              {summary.completed_goals}
            </strong>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900 text-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <strong className="text-2xl">
              {Number(summary.overall_progress).toFixed(0)}%
            </strong>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Suas Metas</h3>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "Nova Meta"}
          </Button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h4 className="mb-4 font-medium">Criar Nova Meta</h4>
            <GoalForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {goals.length === 0 ? (
          <p className="text-center text-slate-400 py-8">
            Nenhuma meta cadastrada. Crie sua primeira meta!
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={handleSuccess} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
