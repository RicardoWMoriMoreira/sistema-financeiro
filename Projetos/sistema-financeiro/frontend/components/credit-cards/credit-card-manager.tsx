"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createCreditCard,
  deleteCreditCard,
  toggleCreditCard,
} from "@/lib/api";
import type { CreditCard } from "@/types/transactions";

type CreditCardManagerProps = {
  cards: CreditCard[];
};

export function CreditCardManager({ cards }: CreditCardManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [closingDay, setClosingDay] = useState("1");
  const [dueDay, setDueDay] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lastFour.length !== 4) {
      toast.error("Informe os 4 últimos dígitos do cartão.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createCreditCard({
        name: name.trim(),
        brand: brand.trim() || "Outro",
        last_four: lastFour,
        closing_day: Number(closingDay),
        due_day: Number(dueDay),
      });
      setName("");
      setBrand("");
      setLastFour("");
      setClosingDay("1");
      setDueDay("1");
      toast.success("Cartão cadastrado com sucesso!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar cartão.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(cardId: number) {
    try {
      await toggleCreditCard(cardId);
      toast.success("Status do cartão alterado.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar cartão.");
    }
  }

  async function handleDelete(cardId: number) {
    const confirmed = window.confirm("Deseja remover este cartão?");
    if (!confirmed) return;
    try {
      await deleteCreditCard(cardId);
      toast.success("Cartão removido.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover cartão.");
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900 text-slate-50">
      <CardHeader>
        <CardTitle>Gerenciar cartões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="card-name">Nome do cartão</Label>
            <Input
              id="card-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Nubank Principal"
              required
              className="border-slate-700 bg-slate-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-brand">Bandeira</Label>
            <Input
              id="card-brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Ex: Mastercard"
              className="border-slate-700 bg-slate-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-last-four">Final</Label>
            <Input
              id="card-last-four"
              value={lastFour}
              onChange={(event) => setLastFour(event.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="1234"
              required
              className="border-slate-700 bg-slate-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing-day">Fechamento</Label>
            <Input
              id="closing-day"
              type="number"
              min={1}
              max={31}
              value={closingDay}
              onChange={(event) => setClosingDay(event.target.value)}
              required
              className="border-slate-700 bg-slate-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due-day">Vencimento</Label>
            <Input
              id="due-day"
              type="number"
              min={1}
              max={31}
              value={dueDay}
              onChange={(event) => setDueDay(event.target.value)}
              required
              className="border-slate-700 bg-slate-950"
            />
          </div>
          <div className="md:col-span-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Cadastrar cartão"}
            </Button>
          </div>
        </form>

        {cards.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhum cartão cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-400">Bandeira</TableHead>
                  <TableHead className="text-slate-400">Final</TableHead>
                  <TableHead className="text-slate-400">Fechamento</TableHead>
                  <TableHead className="text-slate-400">Vencimento</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-slate-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card) => (
                  <TableRow key={card.id} className="border-slate-700">
                    <TableCell>{card.name}</TableCell>
                    <TableCell>{card.brand}</TableCell>
                    <TableCell>{`•••• ${card.last_four}`}</TableCell>
                    <TableCell>{card.closing_day}</TableCell>
                    <TableCell>{card.due_day}</TableCell>
                    <TableCell>
                      <Badge className={card.is_active ? "bg-emerald-500/20 text-emerald-400" : ""}>
                        {card.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleToggle(card.id)}>
                          {card.is_active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(card.id)}>
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
