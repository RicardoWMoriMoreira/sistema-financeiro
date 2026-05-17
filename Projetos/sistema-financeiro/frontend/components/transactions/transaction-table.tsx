"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteInstallmentGroup,
  useMarkInstallmentGroupPaid,
  useUpdateTransaction,
  useDeleteTransaction,
  useUpdateInstallmentGroup,
} from "@/lib/hooks";
import {
  formatCurrency,
  formatDate,
  formatPaymentMethod,
  formatPaymentStatus,
  formatSpendingProfile,
  formatTransactionType,
} from "@/lib/formatters";
import type {
  Category,
  PaymentMethod,
  PaymentStatus,
  SpendingProfile,
  Transaction,
  TransactionType,
  CreditCard,
} from "@/types/transactions";

type SortField = "description" | "category" | "type" | "date" | "amount";
type SortDirection = "asc" | "desc";

type SortConfig = {
  field: SortField | null;
  direction: SortDirection;
};

type EditScope = "single" | "group";

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  total: number;
};

type TransactionTableProps = {
  transactions: Transaction[];
  categories: Category[];
  creditCards: CreditCard[];
  pagination?: PaginationInfo;
  basePath?: string;
};

export function TransactionTable({
  transactions,
  categories,
  creditCards,
  pagination,
  basePath = "/transactions",
}: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const updateGroupMutation = useUpdateInstallmentGroup();
  const markGroupPaidMutation = useMarkInstallmentGroupPaid();
  const deleteGroupMutation = useDeleteInstallmentGroup();

  const [editingTransactionId, setEditingTransactionId] =
    useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [spendingProfile, setSpendingProfile] = useState<SpendingProfile>("variable");
  const [dueDate, setDueDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [installmentGroupId, setInstallmentGroupId] = useState<string | null>(null);
  const [installmentNumber, setInstallmentNumber] = useState(1);
  const [installmentTotal, setInstallmentTotal] = useState(1);
  const [creditCardId, setCreditCardId] = useState("");
  const [editScope, setEditScope] = useState<EditScope>("single");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");

  const [error, setError] = useState<string | null>(null);

  const isSubmitting =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    updateGroupMutation.isPending ||
    markGroupPaidMutation.isPending ||
    deleteGroupMutation.isPending;

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: "asc",
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.type === type);
  }, [categories, type]);

  const isCardPayment = paymentMethod === "credit_card" || paymentMethod === "debit_card";
  const availableCards = useMemo(() => {
    const expectedCardType = paymentMethod === "credit_card" ? "credit" : "debit";
    return creditCards.filter((card) => card.card_type === expectedCardType);
  }, [creditCards, paymentMethod]);

  const sortedTransactions = useMemo(() => {
    if (!sortConfig.field) {
      return transactions;
    }

    return [...transactions].sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "description":
          comparison = a.description.localeCompare(b.description, "pt-BR");
          break;
        case "category":
          const catA = a.category?.name ?? "";
          const catB = b.category?.name ?? "";
          comparison = catA.localeCompare(catB, "pt-BR");
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = parseFloat(a.amount) - parseFloat(b.amount);
          break;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [transactions, sortConfig]);

  function handleSort(field: SortField) {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { field, direction: "asc" };
    });
  }

  function getSortIcon(field: SortField) {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 inline h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 inline h-4 w-4" />
    );
  }

  function startEditing(transaction: Transaction) {
    setError(null);

    setEditingTransactionId(transaction.id);
    setDescription(transaction.description);
    setAmount(transaction.amount);
    setType(transaction.type);
    setPaymentMethod(transaction.payment_method);
    setSpendingProfile(transaction.spending_profile);
    setDueDate(transaction.due_date ?? "");
    setPaymentStatus(transaction.payment_status);
    setInstallmentGroupId(transaction.installment_group_id);
    setInstallmentNumber(transaction.installment_number);
    setInstallmentTotal(transaction.installment_total);
    setCreditCardId(transaction.credit_card_id ? String(transaction.credit_card_id) : "");
    setEditScope("single");
    setCategoryId(String(transaction.category_id));
    setDate(transaction.date);
  }

  function cancelEditing() {
    setEditingTransactionId(null);
    setDescription("");
    setAmount("");
    setType("expense");
    setPaymentMethod("pix");
    setSpendingProfile("variable");
    setDueDate("");
    setPaymentStatus("pending");
    setInstallmentGroupId(null);
    setInstallmentNumber(1);
    setInstallmentTotal(1);
    setCreditCardId("");
    setEditScope("single");
    setCategoryId("");
    setDate("");
    setError(null);
  }

  async function handleUpdateTransaction(transactionId: number) {
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

    if (!date) {
      setError("Informe uma data.");
      return;
    }

    if (isCardPayment && !creditCardId) {
      setError("Selecione o cartão usado nessa transação.");
      return;
    }

    updateMutation.mutate(
      {
        id: transactionId,
        data: {
          description: description.trim(),
          amount,
          type,
          payment_method: paymentMethod,
          spending_profile: spendingProfile,
          due_date: dueDate || null,
          payment_status: paymentStatus,
          installment_group_id: installmentGroupId,
          installment_number: installmentNumber,
          installment_total: installmentTotal,
          category_id: Number(categoryId),
          credit_card_id: isCardPayment ? Number(creditCardId) : null,
          date,
        },
      },
      {
        onSuccess: () => {
          cancelEditing();
          toast.success("Transação atualizada com sucesso!");
          router.refresh();
        },
        onError: (err) => {
          const message =
            err instanceof Error
              ? err.message
              : "Erro ao editar transação.";

          setError(message);
          toast.error(message);
        },
      }
    );
  }

  async function handleDeleteTransaction(transactionId: number) {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar esta transação?",
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    deleteMutation.mutate(transactionId, {
      onSuccess: () => {
        toast.success("Transação deletada com sucesso!");
        router.refresh();
      },
      onError: (err) => {
        const message =
          err instanceof Error
            ? err.message
            : "Erro ao deletar transação.";

        setError(message);
        toast.error(message);
      },
    });
  }

  function handleUpdateInstallmentGroup(groupId: string) {
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

    if (!date) {
      setError("Informe uma data.");
      return;
    }

    if (isCardPayment && !creditCardId) {
      setError("Selecione o cartão usado nessa transação.");
      return;
    }

    updateGroupMutation.mutate(
      {
        groupId,
        data: {
          description: description.trim(),
          amount,
          type,
          payment_method: paymentMethod,
          spending_profile: spendingProfile,
          due_date: dueDate || null,
          payment_status: paymentStatus,
          installment_group_id: groupId,
          installment_number: installmentNumber,
          installment_total: installmentTotal,
          category_id: Number(categoryId),
          credit_card_id: isCardPayment ? Number(creditCardId) : null,
          date,
        },
      },
      {
        onSuccess: (result) => {
          cancelEditing();
          toast.success(
            `${result.affected} parcela(s) atualizada(s) no grupo com sucesso!`,
          );
          router.refresh();
        },
        onError: (err) => {
          const message =
            err instanceof Error
              ? err.message
              : "Erro ao atualizar grupo de parcelas.";
          setError(message);
          toast.error(message);
        },
      },
    );
  }

  function handleMarkInstallmentGroupPaid(groupId: string) {
    const confirmed = window.confirm(
      "Marcar todas as parcelas deste grupo como pagas?",
    );

    if (!confirmed) {
      return;
    }

    markGroupPaidMutation.mutate(groupId, {
      onSuccess: (result) => {
        toast.success(`${result.affected} parcela(s) marcadas como pagas!`);
        router.refresh();
      },
      onError: (err) => {
        const message =
          err instanceof Error
            ? err.message
            : "Erro ao marcar grupo de parcelas como pago.";
        setError(message);
        toast.error(message);
      },
    });
  }

  function handleDeleteInstallmentGroup(groupId: string) {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar todas as parcelas deste grupo?",
    );

    if (!confirmed) {
      return;
    }

    deleteGroupMutation.mutate(groupId, {
      onSuccess: (result) => {
        toast.success(`${result.affected} parcela(s) deletadas com sucesso!`);
        router.refresh();
      },
      onError: (err) => {
        const message =
          err instanceof Error
            ? err.message
            : "Erro ao deletar grupo de parcelas.";
        setError(message);
        toast.error(message);
      },
    });
  }

  return (
    <Card
      id="transacoes"
      className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
    >
      <CardHeader>
        <CardTitle>Transações</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {transactions.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nenhuma transação encontrada para os filtros atuais.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
                  <TableHead
                    className="cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("description")}
                  >
                    Descrição {getSortIcon("description")}
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Parcela
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("category")}
                  >
                    Categoria {getSortIcon("category")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("type")}
                  >
                    Tipo {getSortIcon("type")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("date")}
                  >
                    Data {getSortIcon("date")}
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Pagamento
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Cartão
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Custo
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Vencimento
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">
                    Status
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={() => handleSort("amount")}
                  >
                    Valor {getSortIcon("amount")}
                  </TableHead>
                  <TableHead className="text-right text-slate-600 dark:text-slate-400">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedTransactions.map((transaction) => {
                  const isEditing =
                    editingTransactionId === transaction.id;

                  return (
                    <TableRow
                      key={transaction.id}
                      className="border-slate-200 dark:border-slate-800"
                    >
                      <TableCell className="min-w-[180px] font-medium">
                        {isEditing ? (
                          <Input
                            value={description}
                            onChange={(event) =>
                              setDescription(event.target.value)
                            }
                            className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                          />
                        ) : (
                          transaction.description
                        )}
                      </TableCell>

                      <TableCell className="min-w-[90px] text-slate-700 dark:text-slate-300">
                        {`${transaction.installment_number}/${transaction.installment_total}`}
                      </TableCell>

                      <TableCell className="min-w-[180px] text-slate-700 dark:text-slate-300">
                        {isEditing ? (
                          <Select
                            value={categoryId}
                            onValueChange={setCategoryId}
                          >
                            <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                              <SelectValue placeholder="Categoria" />
                            </SelectTrigger>

                            <SelectContent>
                              {filteredCategories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={String(category.id)}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          transaction.category?.name ?? "Sem categoria"
                        )}
                      </TableCell>

                      <TableCell className="min-w-[140px]">
                        {isEditing ? (
                          <Select
                            value={type}
                            onValueChange={(value) => {
                              setType(value as TransactionType);
                              setCategoryId("");
                            }}
                          >
                            <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectItem value="expense">
                                Despesa
                              </SelectItem>
                              <SelectItem value="income">
                                Receita
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant={
                              transaction.type === "income"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {formatTransactionType(transaction.type)}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="min-w-[150px] text-slate-700 dark:text-slate-300">
                        {isEditing ? (
                          <Input
                            type="date"
                            value={date}
                            onChange={(event) =>
                              setDate(event.target.value)
                            }
                            className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                          />
                        ) : (
                          formatDate(transaction.date)
                        )}
                      </TableCell>

                      <TableCell className="min-w-[190px] text-slate-700 dark:text-slate-300">
                        {isEditing ? (
                          <Select
                            value={paymentMethod}
                            onValueChange={(value) => {
                              setPaymentMethod(value as PaymentMethod);
                              setCreditCardId("");
                            }}
                          >
                            <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                              <SelectValue placeholder="Pagamento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="credit_card">
                                Cartão de crédito
                              </SelectItem>
                              <SelectItem value="debit_card">
                                Cartão de débito
                              </SelectItem>
                              <SelectItem value="cash">Dinheiro</SelectItem>
                              <SelectItem value="pix">Pix</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          formatPaymentMethod(transaction.payment_method)
                        )}
                      </TableCell>

                      <TableCell className="min-w-[210px] text-slate-700 dark:text-slate-300">
                        {isEditing ? (
                          isCardPayment ? (
                            <Select value={creditCardId} onValueChange={setCreditCardId}>
                              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                                <SelectValue placeholder="Selecione o cartão" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableCards.map((card) => (
                                  <SelectItem key={card.id} value={String(card.id)}>
                                    {`${card.name} •••• ${card.last_four}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            "-"
                          )
                        ) : (transaction.payment_method === "credit_card" ||
                          transaction.payment_method === "debit_card") &&
                          transaction.credit_card ? (
                          `${transaction.credit_card.name} •••• ${transaction.credit_card.last_four}`
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell className="min-w-[150px] text-slate-700 dark:text-slate-300">
                        {isEditing ? (
                          <Select
                            value={spendingProfile}
                            onValueChange={(value) =>
                              setSpendingProfile(value as SpendingProfile)
                            }
                          >
                            <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                              <SelectValue placeholder="Custo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixo</SelectItem>
                              <SelectItem value="variable">Variável</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          formatSpendingProfile(transaction.spending_profile)
                        )}
                      </TableCell>

                      <TableCell className="min-w-[150px] text-slate-700 dark:text-slate-300">
                        {isEditing ? (
                          <Input
                            type="date"
                            value={dueDate}
                            onChange={(event) => setDueDate(event.target.value)}
                            className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
                          />
                        ) : transaction.due_date ? (
                          formatDate(transaction.due_date)
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell className="min-w-[120px] text-slate-700 dark:text-slate-300">
                        {isEditing ? (
                          <Select
                            value={paymentStatus}
                            onValueChange={(value) =>
                              setPaymentStatus(value as PaymentStatus)
                            }
                          >
                            <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Pago</SelectItem>
                              <SelectItem value="pending">A pagar</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant={
                              transaction.payment_status === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {formatPaymentStatus(transaction.payment_status)}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="min-w-[140px] text-right font-semibold">
                        {isEditing ? (
                          <Input
                            value={amount}
                            onChange={(event) =>
                              setAmount(event.target.value)
                            }
                            inputMode="decimal"
                            className="border-slate-300 bg-white text-right dark:border-slate-700 dark:bg-slate-950"
                          />
                        ) : (
                          formatCurrency(transaction.amount)
                        )}
                      </TableCell>

                      <TableCell className="min-w-[190px] text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                if (
                                  editScope === "group" &&
                                  transaction.installment_total > 1 &&
                                  transaction.installment_group_id
                                ) {
                                  handleUpdateInstallmentGroup(
                                    transaction.installment_group_id,
                                  );
                                  return;
                                }

                                handleUpdateTransaction(transaction.id);
                              }}
                              disabled={isSubmitting}
                              aria-label={`Salvar alterações da transação ${transaction.description}`}
                            >
                              {editScope === "group" &&
                              transaction.installment_total > 1
                                ? "Salvar grupo"
                                : "Salvar"}
                            </Button>

                            {transaction.installment_total > 1 && (
                              <Select
                                value={editScope}
                                onValueChange={(value) =>
                                  setEditScope(value as EditScope)
                                }
                              >
                                <SelectTrigger className="w-[210px] border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                                  <SelectValue placeholder="Escopo da edição" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="single">
                                    Apenas esta parcela
                                  </SelectItem>
                                  <SelectItem value="group">
                                    Todas as parcelas
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              disabled={isSubmitting}
                              aria-label="Cancelar edição"
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(transaction)}
                              disabled={isSubmitting}
                              aria-label={`Editar transação ${transaction.description}`}
                            >
                              Editar
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteTransaction(transaction.id)
                              }
                              disabled={isSubmitting}
                              aria-label={`Deletar transação ${transaction.description}`}
                            >
                              Deletar
                            </Button>

                            {transaction.installment_total > 1 &&
                              transaction.installment_group_id && (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      handleMarkInstallmentGroupPaid(
                                        transaction.installment_group_id as string,
                                      )
                                    }
                                    disabled={isSubmitting}
                                    aria-label="Marcar todas as parcelas do grupo como pagas"
                                  >
                                    Pagar grupo
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteInstallmentGroup(
                                        transaction.installment_group_id as string,
                                      )
                                    }
                                    disabled={isSubmitting}
                                    aria-label="Deletar todas as parcelas do grupo"
                                  >
                                    Excluir grupo
                                  </Button>
                                </>
                              )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando {transactions.length} de {pagination.total} transações
            </p>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(page));
                router.push(`${basePath}?${params.toString()}`);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
