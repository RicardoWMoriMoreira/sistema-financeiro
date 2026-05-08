import Link from "next/link";

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
import {
  formatCurrency,
  formatDate,
  formatTransactionType,
} from "@/lib/formatters";
import type { Transaction } from "@/types/transactions";

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Últimas transações</CardTitle>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Os 5 lançamentos mais recentes cadastrados no sistema.
          </p>
        </div>

        <Button asChild variant="outline" className="text-slate-600 dark:text-slate-500">
          <Link href="/transactions">Ver todas</Link>
        </Button>
      </CardHeader>

      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhuma transação cadastrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
                  <TableHead className="text-slate-600 dark:text-slate-400">Descrição</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Categoria</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Data</TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400">
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-slate-200 dark:border-slate-800">
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>

                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {transaction.category?.name ?? "Sem categoria"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === "income"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {formatTransactionType(transaction.type)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {formatDate(transaction.date)}
                    </TableCell>

                    <TableCell className="text-right font-semibold">
                      {formatCurrency(transaction.amount)}
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
