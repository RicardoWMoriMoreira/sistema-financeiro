"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRecurringTransaction } from "@/lib/api";
import type { Category, FrequencyType, TransactionType } from "@/types/transactions";

type RecurringTransactionFormProps = {
  categories: Category[];
};

function getTodayInputValue(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const frequencyLabels: Record<FrequencyType, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export function RecurringTransactionForm({ categories }: RecurringTransactionFormProps) {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState<FrequencyType>("monthly");
  const [startDate, setStartDate] = useState(getTodayInputValue());
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.type === type);
  }, [categories, type]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!description.trim()) {
      setError("Informe uma descrição.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    if (!categoryId) {
      setError("Selecione uma categoria.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createRecurringTransaction({
        description: description.trim(),
        amount,
        type,
        category_id: Number(categoryId),
        frequency,
        start_date: startDate,
        end_date: endDate || null,
      });

      setDescription("");
      setAmount("");
      setCategoryId("");
      setStartDate(getTodayInputValue());
      setEndDate("");

      toast.success("Transação recorrente cadastrada com sucesso!");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao cadastrar transação recorrente.";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900 text-slate-50">
      <CardHeader>
        <CardTitle>Nova transação recorrente</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex: Aluguel"
              className="border-slate-700 bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Ex: 1500.00"
              inputMode="decimal"
              className="border-slate-700 bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label>Frequência</Label>
            <Select
              value={frequency}
              onValueChange={(value) => setFrequency(value as FrequencyType)}
            >
              <SelectTrigger className="border-slate-700 bg-slate-950">
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>

              <SelectContent>
                {(Object.keys(frequencyLabels) as FrequencyType[]).map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {frequencyLabels[freq]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as TransactionType);
                setCategoryId("");
              }}
            >
              <SelectTrigger className="border-slate-700 bg-slate-950">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={filteredCategories.length === 0}
            >
              <SelectTrigger className="border-slate-700 bg-slate-950">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>

              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Data inicial</Label>
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="border-slate-700 bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Data final (opcional)</Label>
            <Input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="border-slate-700 bg-slate-950"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 md:col-span-2">{error}</p>
          )}

          {filteredCategories.length === 0 && (
            <p className="text-sm text-amber-400 md:col-span-2">
              Nenhuma categoria disponível para esse tipo. Cadastre categorias
              ou rode o seed no backend.
            </p>
          )}

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Cadastrar recorrência"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
