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
import { createGoal } from "@/lib/api";
import type { GoalType } from "@/types/transactions";

type GoalFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState<GoalType>("saving");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !targetAmount || !deadline) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      await createGoal({
        name,
        target_amount: targetAmount,
        current_amount: currentAmount || "0",
        deadline,
        type,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar meta");
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Meta *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Viagem para praia"
            className="border-slate-600 bg-slate-700"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Select value={type} onValueChange={(v) => setType(v as GoalType)}>
            <SelectTrigger className="border-slate-600 bg-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saving">Economia</SelectItem>
              <SelectItem value="spending">Controle de Gastos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetAmount">Valor da Meta *</Label>
          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            min="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            className="border-slate-600 bg-slate-700"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount">Valor Inicial</Label>
          <Input
            id="currentAmount"
            type="number"
            step="0.01"
            min="0"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0.00"
            className="border-slate-600 bg-slate-700"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Prazo *</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
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
          {isSubmitting ? "Criando..." : "Criar Meta"}
        </Button>
      </div>
    </form>
  );
}
