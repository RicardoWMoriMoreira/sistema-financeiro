"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBudget } from "@/lib/api";
import type { Category } from "@/types/transactions";

type BudgetFormProps = {
  categories: Category[];
  currentMonth: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function BudgetForm({
  categories,
  currentMonth,
  onSuccess,
  onCancel,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState("");
  const [amountLimit, setAmountLimit] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!categoryId || !amountLimit || !month) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      await createBudget({
        category_id: Number(categoryId),
        month,
        amount_limit: amountLimit,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar orçamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="border-slate-600 bg-slate-700">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountLimit">Limite de Gastos *</Label>
          <Input
            id="amountLimit"
            type="number"
            step="0.01"
            min="0.01"
            value={amountLimit}
            onChange={(e) => setAmountLimit(e.target.value)}
            placeholder="0.00"
            className="border-slate-600 bg-slate-700"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="month">Mês *</Label>
          <Input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border-slate-600 bg-slate-700"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-400"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Orçamento"}
        </Button>
      </div>
    </form>
  );
}
