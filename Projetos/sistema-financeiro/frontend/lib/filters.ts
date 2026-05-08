import type {
  PaymentStatus,
  TransactionFilters,
  TransactionType,
} from "@/types/transactions";

type SearchParams = {
  type?: string;
  payment_status?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: string;
  per_page?: string;
};

export function parseTransactionFilters(
  params: SearchParams,
): TransactionFilters {
  const filters: TransactionFilters = {};

  if (params.type === "income" || params.type === "expense") {
    filters.type = params.type as TransactionType;
  }

  if (params.payment_status === "paid" || params.payment_status === "pending") {
    filters.payment_status = params.payment_status as PaymentStatus;
  }

  if (params.category_id) {
    const categoryId = Number(params.category_id);

    if (!Number.isNaN(categoryId)) {
      filters.category_id = categoryId;
    }
  }

  if (params.start_date) {
    filters.start_date = params.start_date;
  }

  if (params.end_date) {
    filters.end_date = params.end_date;
  }

  if (params.search) {
    filters.search = params.search;
  }

  if (params.page) {
    const page = Number(params.page);

    if (!Number.isNaN(page) && page >= 1) {
      filters.page = page;
    }
  }

  if (params.per_page) {
    const perPage = Number(params.per_page);

    if (!Number.isNaN(perPage) && perPage >= 1) {
      filters.per_page = perPage;
    }
  }

  return filters;
}
