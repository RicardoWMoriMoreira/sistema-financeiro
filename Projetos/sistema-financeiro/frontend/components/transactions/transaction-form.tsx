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
import { useCreateTransaction } from "@/lib/hooks";
import type {
  Category,
  FrequencyType,
  PaymentMethod,
  PaymentStatus,
  SpendingProfile,
  TransactionType,
} from "@/types/transactions";

type TransactionFormProps = {
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

export function TransactionForm({ categories }: TransactionFormProps) {
  const router = useRouter();
  const createMutation = useCreateTransaction();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [spendingProfile, setSpendingProfile] = useState<SpendingProfile>("variable");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [installmentTotal, setInstallmentTotal] = useState("1");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(getTodayInputValue());
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyType>("monthly");
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

    const parsedInstallments = Number(installmentTotal);
    if (
      Number.isNaN(parsedInstallments) ||
      parsedInstallments < 1 ||
      parsedInstallments > 360
    ) {
      setError("Informe um número de parcelas entre 1 e 360.");
      return;
    }

    const resetForm = () => {
      setDescription("");
      setAmount("");
      setCategoryId("");
      setDate(getTodayInputValue());
      setPaymentMethod("pix");
      setSpendingProfile("variable");
      setDueDate("");
      setPaymentStatus("pending");
      setInstallmentTotal("1");
      setIsRecurring(false);
      setFrequency("monthly");
      router.refresh();
    };

    if (isRecurring) {
      setIsSubmitting(true);
      try {
        await createRecurringTransaction({
          description: description.trim(),
          amount,
          type,
          category_id: Number(categoryId),
          frequency,
          start_date: date,
        });

        toast.success("Transação recorrente cadastrada com sucesso!");
        resetForm();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao cadastrar transação recorrente.";
        setError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      createMutation.mutate(
        {
          description: description.trim(),
          amount,
          type,
          payment_method: paymentMethod,
          spending_profile: spendingProfile,
          due_date: dueDate || null,
          payment_status: paymentStatus,
          installment_total: parsedInstallments,
          category_id: Number(categoryId),
          date,
        },
        {
          onSuccess: () => {
            toast.success("Transação cadastrada com sucesso!");
            resetForm();
          },
          onError: (err) => {
            const message =
              err instanceof Error ? err.message : "Erro ao cadastrar transação.";
            setError(message);
            toast.error(message);
          },
        }
      );
    }
  }

  return (
    <Card className="mt-6 border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
      <CardHeader>
        <CardTitle>Nova transação</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex: Mercado"
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Ex: 120.50"
              inputMode="decimal"
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{isRecurring ? "Data inicial" : "Data"}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
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
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
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
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
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
            <Label>Forma de pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de débito</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="pix">Pix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custo</Label>
            <Select
              value={spendingProfile}
              onValueChange={(value) => setSpendingProfile(value as SpendingProfile)}
            >
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                <SelectValue placeholder="Selecione o custo" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="fixed">Fixo</SelectItem>
                <SelectItem value="variable">Variável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Data de vencimento</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={paymentStatus}
              onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
            >
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">A pagar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installments">Número de parcelas</Label>
            <Input
              id="installments"
              type="number"
              min={1}
              max={360}
              value={installmentTotal}
              onChange={(event) => setInstallmentTotal(event.target.value)}
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              id="is_recurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(event) => setIsRecurring(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
            />
            <Label htmlFor="is_recurring" className="cursor-pointer">
              Tornar transação recorrente
            </Label>
          </div>

          {isRecurring && (
            <div className="space-y-2 md:col-span-2">
              <Label>Frequência</Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value as FrequencyType)}
              >
                <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
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
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 md:col-span-2">{error}</p>
          )}

          {filteredCategories.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 md:col-span-2">
              Nenhuma categoria disponível para esse tipo. Cadastre categorias
              ou rode o seed no backend.
            </p>
          )}

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {isSubmitting || createMutation.isPending
                ? "Salvando..."
                : isRecurring
                  ? "Cadastrar recorrência"
                  : "Cadastrar transação"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
