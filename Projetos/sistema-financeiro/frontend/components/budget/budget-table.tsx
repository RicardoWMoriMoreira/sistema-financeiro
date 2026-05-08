"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBudget } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import type { BudgetStatus } from "@/types/transactions";

type BudgetTableProps = {
  budgets: BudgetStatus[];
  onUpdate: () => void;
};

function getStatusColor(percentageUsed: number, isExceeded: boolean) {
  if (isExceeded) return "bg-red-500/20 text-red-400";
  if (percentageUsed >= 80) return "bg-amber-500/20 text-amber-400";
  return "bg-emerald-500/20 text-emerald-400";
}

function getProgressBarColor(percentageUsed: number, isExceeded: boolean) {
  if (isExceeded) return "bg-red-500";
  if (percentageUsed >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}

export function BudgetTable({ budgets, onUpdate }: BudgetTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (budgetId: number) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;

    setDeletingId(budgetId);
    try {
      await deleteBudget(budgetId);
      onUpdate();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao excluir orçamento"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700">
            <TableHead className="text-slate-400">Categoria</TableHead>
            <TableHead className="text-slate-400">Limite</TableHead>
            <TableHead className="text-slate-400">Gasto</TableHead>
            <TableHead className="text-slate-400">Restante</TableHead>
            <TableHead className="text-slate-400">Progresso</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-right text-slate-400">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => {
            const percentageUsed = Number(budget.percentage_used);
            const progressWidth = Math.min(percentageUsed, 100);

            return (
              <TableRow key={budget.id} className="border-slate-700">
                <TableCell className="font-medium">
                  {budget.category.name}
                </TableCell>
                <TableCell>{formatCurrency(budget.amount_limit)}</TableCell>
                <TableCell>{formatCurrency(budget.amount_spent)}</TableCell>
                <TableCell
                  className={
                    budget.is_exceeded ? "text-red-400" : "text-emerald-400"
                  }
                >
                  {formatCurrency(budget.remaining)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-full transition-all ${getProgressBarColor(percentageUsed, budget.is_exceeded)}`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                    <span className="text-sm">{percentageUsed.toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={getStatusColor(percentageUsed, budget.is_exceeded)}
                  >
                    {budget.is_exceeded
                      ? "Excedido"
                      : percentageUsed >= 80
                        ? "Atenção"
                        : "OK"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(budget.id)}
                    disabled={deletingId === budget.id}
                    className="border-slate-600 text-slate-400 hover:text-red-400"
                  >
                    {deletingId === budget.id ? "..." : "Excluir"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
