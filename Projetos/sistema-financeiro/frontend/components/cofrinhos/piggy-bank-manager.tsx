"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPiggyBank,
  deletePiggyBank,
  updatePiggyBankBalance,
} from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import type { PiggyBank } from "@/types/transactions";

type PiggyBankManagerProps = {
  piggyBanks: PiggyBank[];
};

export function PiggyBankManager({ piggyBanks }: PiggyBankManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [description, setDescription] = useState("");
  const [deltaById, setDeltaById] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await createPiggyBank({
        name: name.trim(),
        description: description.trim() || null,
        target_amount: targetAmount,
        current_amount: "0",
      });
      setName("");
      setTargetAmount("");
      setDescription("");
      toast.success("Cofrinho criado com sucesso!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar cofrinho.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateBalance(piggyBankId: number) {
    const amount = deltaById[piggyBankId];
    if (!amount || Number(amount) === 0) {
      toast.error("Informe um valor diferente de zero.");
      return;
    }

    try {
      await updatePiggyBankBalance(piggyBankId, amount);
      setDeltaById((prev) => ({ ...prev, [piggyBankId]: "" }));
      toast.success("Saldo do cofrinho atualizado!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar saldo.");
    }
  }

  async function handleDelete(piggyBankId: number) {
    const confirmed = window.confirm("Deseja excluir este cofrinho?");
    if (!confirmed) return;
    try {
      await deletePiggyBank(piggyBankId);
      toast.success("Cofrinho excluído.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir cofrinho.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900 text-slate-50">
        <CardHeader>
          <CardTitle>Novo cofrinho</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="piggy-name">Nome</Label>
              <Input
                id="piggy-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex: Viagem fim do ano"
                required
                className="border-slate-700 bg-slate-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piggy-target">Meta (R$)</Label>
              <Input
                id="piggy-target"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                inputMode="decimal"
                placeholder="Ex: 3000.00"
                required
                className="border-slate-700 bg-slate-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piggy-description">Descrição (opcional)</Label>
              <Input
                id="piggy-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Objetivo do cofrinho"
                className="border-slate-700 bg-slate-950"
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar cofrinho"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {piggyBanks.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900 text-slate-50">
          <CardContent className="py-8 text-center text-slate-400">
            Nenhum cofrinho criado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {piggyBanks.map((piggyBank) => {
            const progress = Math.min(Number(piggyBank.progress_percentage), 100);
            return (
              <Card key={piggyBank.id} className="border-slate-800 bg-slate-900 text-slate-50">
                <CardHeader>
                  <CardTitle className="text-lg">{piggyBank.name}</CardTitle>
                  {piggyBank.description && (
                    <p className="text-sm text-slate-400">{piggyBank.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm">
                    <p>{`Meta: ${formatCurrency(piggyBank.target_amount)}`}</p>
                    <p>{`Atual: ${formatCurrency(piggyBank.current_amount)}`}</p>
                    <p>{`Faltam: ${formatCurrency(piggyBank.remaining_amount)}`}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>Progresso</span>
                      <span>{`${progress.toFixed(0)}%`}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={deltaById[piggyBank.id] ?? ""}
                      onChange={(event) =>
                        setDeltaById((prev) => ({ ...prev, [piggyBank.id]: event.target.value }))
                      }
                      placeholder="Ex: 150.00 ou -50.00"
                      className="border-slate-700 bg-slate-950"
                    />
                    <Button onClick={() => handleUpdateBalance(piggyBank.id)}>Atualizar</Button>
                  </div>
                  <Button variant="destructive" onClick={() => handleDelete(piggyBank.id)}>
                    Excluir cofrinho
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
