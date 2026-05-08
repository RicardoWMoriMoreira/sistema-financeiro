"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { processRecurringTransactions } from "@/lib/api";

export function ProcessRecurringButton() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleProcess() {
    try {
      setIsProcessing(true);

      const result = await processRecurringTransactions();

      if (result.transactions_created > 0) {
        toast.success(
          `${result.transactions_created} transação(ões) criada(s) com sucesso!`
        );
      } else {
        toast.info("Nenhuma transação pendente para processar.");
      }

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar transações.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Button
      onClick={handleProcess}
      disabled={isProcessing}
      className="bg-emerald-600 hover:bg-emerald-700"
    >
      {isProcessing ? "Processando..." : "Processar pendentes"}
    </Button>
  );
}
