"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  getTransactionsPaginated,
  getTransactionSummary,
  createTransaction as createTransactionApi,
  updateTransaction as updateTransactionApi,
  deleteTransaction as deleteTransactionApi,
  updateInstallmentGroup as updateInstallmentGroupApi,
  markInstallmentGroupPaid as markInstallmentGroupPaidApi,
  deleteInstallmentGroup as deleteInstallmentGroupApi,
} from "@/lib/api";
import type {
  TransactionFilters,
  TransactionCreate,
  TransactionUpdate,
} from "@/types/transactions";

export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters?: TransactionFilters) =>
    [...transactionKeys.lists(), filters] as const,
  paginated: (filters?: TransactionFilters) =>
    [...transactionKeys.all, "paginated", filters] as const,
  summary: (filters?: TransactionFilters) =>
    [...transactionKeys.all, "summary", filters] as const,
  detail: (id: number) => [...transactionKeys.all, "detail", id] as const,
};

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    staleTime: 30 * 1000,
  });
}

export function useTransactionsPaginated(filters?: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.paginated(filters),
    queryFn: () => getTransactionsPaginated(filters),
    staleTime: 30 * 1000,
  });
}

export function useTransactionSummary(filters?: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.summary(filters),
    queryFn: () => getTransactionSummary(filters),
    staleTime: 30 * 1000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionCreate) => createTransactionApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: TransactionUpdate;
    }) => updateTransactionApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTransactionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useUpdateInstallmentGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: TransactionUpdate;
    }) => updateInstallmentGroupApi(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useMarkInstallmentGroupPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => markInstallmentGroupPaidApi(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useDeleteInstallmentGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => deleteInstallmentGroupApi(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
