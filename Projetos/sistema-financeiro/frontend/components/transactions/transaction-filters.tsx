"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, FileText } from "lucide-react";

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
import { CsvImportModal } from "@/components/transactions/csv-import-modal";
import { getExportCsvUrl, getExportPdfUrl } from "@/lib/api";
import type {
  Category,
  PaymentStatus,
  TransactionStatusCounts,
  TransactionFilters as TransactionFiltersType,
  TransactionType,
} from "@/types/transactions";

type TransactionFiltersProps = {
  categories: Category[];
  initialFilters: TransactionFiltersType;
  statusCounts?: TransactionStatusCounts;
  basePath?: string;
};

type TypeFilterValue = TransactionType | "all";
type StatusFilterValue = PaymentStatus | "all";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getQuickFilterDates(filter: "7days" | "month" | "year") {
  const today = new Date();

  switch (filter) {
    case "7days": {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      return { startDate: formatDate(startDate), endDate: formatDate(today) };
    }
    case "month": {
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatDate(startDate), endDate: formatDate(today) };
    }
    case "year": {
      const startDate = new Date(today.getFullYear(), 0, 1);
      return { startDate: formatDate(startDate), endDate: formatDate(today) };
    }
  }
}

export function TransactionFilters({
  categories,
  initialFilters,
  statusCounts,
  basePath = "/transactions",
}: TransactionFiltersProps) {
  const router = useRouter();

  const [type, setType] = useState<TypeFilterValue>(
    initialFilters.type ?? "all",
  );
  const [paymentStatus, setPaymentStatus] = useState<StatusFilterValue>(
    initialFilters.payment_status ?? "all",
  );

  const [categoryId, setCategoryId] = useState(
    initialFilters.category_id ? String(initialFilters.category_id) : "all",
  );

  const [startDate, setStartDate] = useState(initialFilters.start_date ?? "");
  const [endDate, setEndDate] = useState(initialFilters.end_date ?? "");
  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const availableCategories = useMemo(() => {
    if (type === "all") {
      return categories;
    }

    return categories.filter((category) => category.type === type);
  }, [categories, type]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (type !== "all") {
      params.set("type", type);
    }

    if (paymentStatus !== "all") {
      params.set("payment_status", paymentStatus);
    }

    if (categoryId !== "all") {
      params.set("category_id", categoryId);
    }

    if (startDate) {
      params.set("start_date", startDate);
    }

    if (endDate) {
      params.set("end_date", endDate);
    }

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const queryString = params.toString();

    router.push(queryString ? `${basePath}?${queryString}` : basePath);
  }

  function clearFilters() {
    setType("all");
    setPaymentStatus("all");
    setCategoryId("all");
    setStartDate("");
    setEndDate("");
    setSearch("");

    router.push(basePath);
  }

  function applyQuickFilter(filter: "7days" | "month" | "year") {
    const { startDate: newStartDate, endDate: newEndDate } = getQuickFilterDates(filter);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }

  function getCurrentFilters(): TransactionFiltersType {
    const filters: TransactionFiltersType = {};

    if (type !== "all") {
      filters.type = type;
    }

    if (paymentStatus !== "all") {
      filters.payment_status = paymentStatus;
    }

    if (categoryId !== "all") {
      filters.category_id = Number(categoryId);
    }

    if (startDate) {
      filters.start_date = startDate;
    }

    if (endDate) {
      filters.end_date = endDate;
    }

    if (search.trim()) {
      filters.search = search.trim();
    }

    return filters;
  }

  function handleExportCsv() {
    const url = getExportCsvUrl(getCurrentFilters());
    window.open(url, "_blank");
  }

  function handleExportPdf() {
    const url = getExportPdfUrl(getCurrentFilters());
    window.open(url, "_blank");
  }

  return (
    <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Label className="w-full text-sm text-slate-600 dark:text-slate-400">Filtros rápidos</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyQuickFilter("7days")}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            Últimos 7 dias
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyQuickFilter("month")}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            Este mês
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyQuickFilter("year")}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            Este ano
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="search">Buscar por descrição</Label>

            <Input
              id="search"
              type="text"
              placeholder="Digite para buscar..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>

            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as TypeFilterValue);
                setCategoryId("all");
              }}
            >
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>

            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>

                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>

            <Select
              value={paymentStatus}
              onValueChange={(value) => setPaymentStatus(value as StatusFilterValue)}
            >
              <SelectTrigger className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">
                  {`Pago (${statusCounts?.paid ?? 0})`}
                </SelectItem>
                <SelectItem value="pending">
                  {`A pagar (${statusCounts?.pending ?? 0})`}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Data inicial</Label>

            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Data final</Label>

            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="flex flex-wrap items-end gap-2 md:col-span-2">
            <Button type="submit" className="flex-1" aria-label="Aplicar filtros">
              Filtrar
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="flex-1 text-slate-600 dark:text-slate-500"
              aria-label="Limpar todos os filtros"
            >
              Limpar
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-2 md:col-span-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Importar transações de CSV"
            >
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              Importar CSV
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              className="flex-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Exportar transações para CSV"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Exportar CSV
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleExportPdf}
              className="flex-1 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Gerar relatório em PDF"
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              Gerar PDF
            </Button>
          </div>
        </form>

        <CsvImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />
      </CardContent>
    </Card>
  );
}
