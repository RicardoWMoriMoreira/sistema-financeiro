import { SummaryCards } from "@/components/dashboard/summary-cards";
import { AppHeader } from "@/components/layout/app-header";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionTable } from "@/components/transactions/transaction-table";
import {
  getCategories,
  getTransactionStatusCounts,
  getTransactionSummary,
  getTransactionsPaginated,
} from "@/lib/api";
import { parseTransactionFilters } from "@/lib/filters";

type TransactionsPageProps = {
  searchParams: Promise<{
    type?: string;
    payment_status?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: string;
  }>;
};

const PER_PAGE = 10;

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const filters = parseTransactionFilters(params);

  const filtersWithPagination = {
    ...filters,
    page: filters.page || 1,
    per_page: PER_PAGE,
  };
  const filtersForCounts = { ...filters };
  delete filtersForCounts.payment_status;
  delete filtersForCounts.page;
  delete filtersForCounts.per_page;

  const [summary, paginatedTransactions, categories, statusCounts] = await Promise.all([
    getTransactionSummary(filters),
    getTransactionsPaginated(filtersWithPagination),
    getCategories(),
    getTransactionStatusCounts(filtersForCounts),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <SummaryCards summary={summary} />

        <TransactionFilters
          categories={categories}
          initialFilters={filters}
          statusCounts={statusCounts}
          basePath="/transactions"
        />

        <div id="nova-transacao">
          <TransactionForm categories={categories} />
        </div>

        <TransactionTable
          transactions={paginatedTransactions.items}
          categories={categories}
          pagination={{
            currentPage: paginatedTransactions.page,
            totalPages: paginatedTransactions.total_pages,
            total: paginatedTransactions.total,
          }}
          basePath="/transactions"
        />
      </div>
    </main>
  );
}
