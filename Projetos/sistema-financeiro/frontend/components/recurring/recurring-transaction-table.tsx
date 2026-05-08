"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteRecurringTransaction, toggleRecurringTransaction } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Category, FrequencyType, RecurringTransaction } from "@/types/transactions";

type RecurringTransactionTableProps = {
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
};

const frequencyLabels: Record<FrequencyType, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export function RecurringTransactionTable({
  recurringTransactions,
}: RecurringTransactionTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleToggle(id: number) {
    try {
      setLoadingId(id);
      await toggleRecurringTransaction(id);
      toast.success("Status alterado com sucesso!");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao alterar status.";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta transação recorrente?")) {
      return;
    }

    try {
      setLoadingId(id);
      await deleteRecurringTransaction(id);
      toast.success("Transação recorrente excluída com sucesso!");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao excluir transação recorrente.";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  }

  if (recurringTransactions.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900 text-slate-50">
        <CardContent className="py-8">
          <p className="text-center text-slate-400">
            Nenhuma transação recorrente cadastrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-900 text-slate-50">
      <CardHeader>
        <CardTitle>Transações recorrentes</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-400">Descrição</TableHead>
                <TableHead className="text-slate-400">Categoria</TableHead>
                <TableHead className="text-slate-400">Tipo</TableHead>
                <TableHead className="text-slate-400">Valor</TableHead>
                <TableHead className="text-slate-400">Frequência</TableHead>
                <TableHead className="text-slate-400">Próxima</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-right text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {recurringTransactions.map((recurring) => (
                <TableRow
                  key={recurring.id}
                  className="border-slate-700 hover:bg-slate-800/50"
                >
                  <TableCell className="font-medium">
                    {recurring.description}
                  </TableCell>

                  <TableCell>
                    {recurring.category?.name || "-"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={recurring.type === "income" ? "default" : "destructive"}
                      className={
                        recurring.type === "income"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }
                    >
                      {recurring.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>

                  <TableCell
                    className={
                      recurring.type === "income"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {formatCurrency(recurring.amount)}
                  </TableCell>

                  <TableCell>
                    {frequencyLabels[recurring.frequency]}
                  </TableCell>

                  <TableCell>
                    {formatDate(recurring.next_occurrence)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={recurring.is_active ? "default" : "secondary"}
                      className={
                        recurring.is_active
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-500/20 text-slate-400"
                      }
                    >
                      {recurring.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(recurring.id)}
                        disabled={loadingId === recurring.id}
                        className="border-slate-700 bg-transparent hover:bg-slate-800"
                      >
                        {recurring.is_active ? "Desativar" : "Ativar"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(recurring.id)}
                        disabled={loadingId === recurring.id}
                        className="border-red-900 bg-transparent text-red-400 hover:bg-red-950 hover:text-red-300"
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
