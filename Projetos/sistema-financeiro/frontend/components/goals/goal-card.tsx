"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { deleteGoal, updateGoalAmount } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import type { GoalProgress } from "@/types/transactions";

type GoalCardProps = {
  goal: GoalProgress;
  onUpdate: () => void;
};

function getStatusColor(status: string, isOnTrack: boolean) {
  if (status === "completed") return "bg-emerald-500/20 text-emerald-400";
  if (status === "failed") return "bg-red-500/20 text-red-400";
  if (!isOnTrack) return "bg-amber-500/20 text-amber-400";
  return "bg-blue-500/20 text-blue-400";
}

function getProgressBarColor(status: string, isOnTrack: boolean) {
  if (status === "completed") return "bg-emerald-500";
  if (status === "failed") return "bg-red-500";
  if (!isOnTrack) return "bg-amber-500";
  return "bg-blue-500";
}

function getStatusLabel(status: string) {
  if (status === "completed") return "Concluída";
  if (status === "failed") return "Não Alcançada";
  return "Ativa";
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const progressPercent = Math.min(Number(goal.progress_percentage), 100);

  const handleUpdateAmount = async () => {
    if (!newAmount) return;

    setIsUpdating(true);
    try {
      await updateGoalAmount(goal.id, newAmount);
      setNewAmount("");
      setShowUpdateForm(false);
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao atualizar valor");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

    setIsDeleting(true);
    try {
      await deleteGoal(goal.id);
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir meta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="font-medium">{goal.name}</h4>
          <p className="text-sm text-slate-400">
            {goal.type === "saving" ? "Economia" : "Controle de Gastos"}
          </p>
        </div>
        <Badge className={getStatusColor(goal.status, goal.is_on_track)}>
          {getStatusLabel(goal.status)}
        </Badge>
      </div>

      <div className="mb-3">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-slate-400">Progresso</span>
          <span>{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className={`h-full transition-all duration-300 ${getProgressBarColor(goal.status, goal.is_on_track)}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400">Valor Atual</p>
          <p className="font-medium">{formatCurrency(goal.current_amount)}</p>
        </div>
        <div>
          <p className="text-slate-400">Meta</p>
          <p className="font-medium">{formatCurrency(goal.target_amount)}</p>
        </div>
        <div>
          <p className="text-slate-400">Faltam</p>
          <p className="font-medium">{formatCurrency(goal.remaining_amount)}</p>
        </div>
        <div>
          <p className="text-slate-400">Prazo</p>
          <p className="font-medium">
            {goal.days_remaining > 0
              ? `${goal.days_remaining} dias`
              : "Vencido"}
          </p>
        </div>
      </div>

      {goal.status === "active" && (
        <>
          {showUpdateForm ? (
            <div className="mb-3 space-y-2">
              <Label htmlFor={`amount-${goal.id}`}>Novo valor atual</Label>
              <div className="flex gap-2">
                <Input
                  id={`amount-${goal.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 border-slate-600 bg-slate-700"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateAmount}
                  disabled={isUpdating || !newAmount}
                >
                  {isUpdating ? "..." : "Salvar"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUpdateForm(false)}
                  className="border-slate-600 text-slate-400"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUpdateForm(true)}
                className="flex-1 border-slate-600 text-slate-300"
              >
                Atualizar Valor
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="border-red-800 text-red-400 hover:bg-red-950"
              >
                {isDeleting ? "..." : "Excluir"}
              </Button>
            </div>
          )}
        </>
      )}

      {goal.status !== "active" && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full border-slate-600 text-slate-400"
        >
          {isDeleting ? "..." : "Remover"}
        </Button>
      )}
    </div>
  );
}
