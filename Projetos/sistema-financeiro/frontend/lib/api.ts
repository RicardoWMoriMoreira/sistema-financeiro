import type {
  Budget,
  BudgetCreate,
  BudgetStatus,
  BudgetUpdate,
  Category,
  CategoryCreate,
  CategoryUpdate,
  CreditCard,
  CreditCardCreate,
  CreditCardUpdate,
  Goal,
  GoalCreate,
  GoalProgress,
  GoalsSummary,
  GoalUpdate,
  HistoryGroupBy,
  HistoryPeriod,
  PaginatedTransactions,
  PiggyBank,
  PiggyBankCreate,
  PiggyBankUpdate,
  ProcessRecurringResult,
  RecurringTransaction,
  RecurringTransactionCreate,
  RecurringTransactionUpdate,
  Transaction,
  TransactionCreate,
  TransactionFilters,
  TransactionGroupActionResult,
  TransactionHistoryResponse,
  TransactionStatusCounts,
  TransactionSummary,
  TransactionUpdate,
} from "@/types/transactions";

export type CsvImportResult = {
  imported: number;
  failed: number;
  errors: string[];
};

function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não foi configurada.");
  }

  return apiUrl.replace(/\/+$/, "");
}

function buildApiUrl(path: string): string {
  return `${getApiUrl()}${path}`;
}

function toQueryString(params: URLSearchParams): string {
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  const error = await response.json().catch(() => null);

  if (typeof error?.detail === "string") {
    return error.detail;
  }

  if (Array.isArray(error?.detail)) {
    const first = error.detail[0];
    if (typeof first?.msg === "string") {
      return first.msg;
    }
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return fallback;
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  fallbackError = "Erro ao processar requisição.",
): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);

  if (!response.ok) {
    const message = await parseErrorMessage(response, fallbackError);
    throw new Error(message);
  }

  return response.json();
}

async function requestJsonNoStore<T>(
  path: string,
  fallbackError = "Erro ao processar requisição.",
): Promise<T> {
  return requestJson<T>(
    path,
    {
      cache: "no-store",
    },
    fallbackError,
  );
}

function buildTransactionQueryString(filters?: TransactionFilters): string {
  if (!filters) {
    return "";
  }

  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.payment_status) {
    params.set("payment_status", filters.payment_status);
  }

  if (filters.category_id) {
    params.set("category_id", String(filters.category_id));
  }

  if (filters.start_date) {
    params.set("start_date", filters.start_date);
  }

  if (filters.end_date) {
    params.set("end_date", filters.end_date);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  return toQueryString(params);
}

export async function getTransactionSummary(
  filters?: TransactionFilters,
): Promise<TransactionSummary> {
  const queryString = buildTransactionQueryString(filters);
  return requestJsonNoStore<TransactionSummary>(
    `/transactions/summary${queryString}`,
    "Erro ao buscar resumo financeiro.",
  );
}

export async function getTransactionStatusCounts(
  filters?: TransactionFilters,
): Promise<TransactionStatusCounts> {
  const queryString = buildTransactionQueryString(filters);
  return requestJsonNoStore<TransactionStatusCounts>(
    `/transactions/status-counts${queryString}`,
    "Erro ao buscar contagens de status.",
  );
}

export async function getTransactionHistory(
  period: HistoryPeriod = "6m",
  groupBy: HistoryGroupBy = "month",
): Promise<TransactionHistoryResponse> {
  const params = new URLSearchParams();
  params.set("period", period);
  params.set("group_by", groupBy);

  return requestJsonNoStore<TransactionHistoryResponse>(
    `/transactions/history${toQueryString(params)}`,
    "Erro ao buscar histórico de transações.",
  );
}

export async function getTransactions(
  filters?: TransactionFilters,
): Promise<Transaction[]> {
  const queryString = buildTransactionQueryString(filters);
  return requestJsonNoStore<Transaction[]>(
    `/transactions${queryString}`,
    "Erro ao buscar transações.",
  );
}

export async function getTransactionsPaginated(
  filters?: TransactionFilters,
): Promise<PaginatedTransactions> {
  const params = new URLSearchParams();

  if (filters?.type) {
    params.set("type", filters.type);
  }

  if (filters?.payment_status) {
    params.set("payment_status", filters.payment_status);
  }

  if (filters?.category_id) {
    params.set("category_id", String(filters.category_id));
  }

  if (filters?.start_date) {
    params.set("start_date", filters.start_date);
  }

  if (filters?.end_date) {
    params.set("end_date", filters.end_date);
  }

  if (filters?.search) {
    params.set("search", filters.search);
  }

  if (filters?.page) {
    params.set("page", String(filters.page));
  }

  if (filters?.per_page) {
    params.set("per_page", String(filters.per_page));
  }

  return requestJsonNoStore<PaginatedTransactions>(
    `/transactions/paginated${toQueryString(params)}`,
    "Erro ao buscar transações.",
  );
}

export async function createTransaction(
  payload: TransactionCreate,
): Promise<Transaction> {
  return requestJson<Transaction>(
    "/transactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao cadastrar transação.",
  );
}

export async function updateTransaction(
  transactionId: number,
  payload: TransactionUpdate,
): Promise<Transaction> {
  return requestJson<Transaction>(
    `/transactions/${transactionId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao editar transação.",
  );
}

export async function deleteTransaction(
  transactionId: number,
): Promise<Transaction> {
  return requestJson<Transaction>(
    `/transactions/${transactionId}`,
    {
      method: "DELETE",
    },
    "Erro ao deletar transação.",
  );
}

export async function updateInstallmentGroup(
  groupId: string,
  payload: TransactionUpdate,
): Promise<TransactionGroupActionResult> {
  return requestJson<TransactionGroupActionResult>(
    `/transactions/installments/${groupId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao atualizar grupo de parcelas.",
  );
}

export async function markInstallmentGroupPaid(
  groupId: string,
): Promise<TransactionGroupActionResult> {
  return requestJson<TransactionGroupActionResult>(
    `/transactions/installments/${groupId}/mark-paid`,
    {
      method: "PATCH",
    },
    "Erro ao marcar grupo de parcelas como pago.",
  );
}

export async function deleteInstallmentGroup(
  groupId: string,
): Promise<TransactionGroupActionResult> {
  return requestJson<TransactionGroupActionResult>(
    `/transactions/installments/${groupId}`,
    {
      method: "DELETE",
    },
    "Erro ao excluir grupo de parcelas.",
  );
}

export async function getCategories(): Promise<Category[]> {
  return requestJsonNoStore<Category[]>("/categories", "Erro ao buscar categorias.");
}

export async function createCategory(
  payload: CategoryCreate,
): Promise<Category> {
  return requestJson<Category>(
    "/categories",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao cadastrar categoria.",
  );
}

export async function updateCategory(
  categoryId: number,
  payload: CategoryUpdate,
): Promise<Category> {
  return requestJson<Category>(
    `/categories/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao editar categoria.",
  );
}

export async function deleteCategory(
  categoryId: number,
): Promise<Category> {
  return requestJson<Category>(
    `/categories/${categoryId}`,
    {
      method: "DELETE",
    },
    "Erro ao deletar categoria.",
  );
}

export async function getCreditCards(): Promise<CreditCard[]> {
  return requestJsonNoStore<CreditCard[]>("/credit-cards", "Erro ao buscar cartões.");
}

export async function createCreditCard(payload: CreditCardCreate): Promise<CreditCard> {
  return requestJson<CreditCard>(
    "/credit-cards",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Erro ao cadastrar cartão.",
  );
}

export async function updateCreditCard(
  cardId: number,
  payload: CreditCardUpdate,
): Promise<CreditCard> {
  return requestJson<CreditCard>(
    `/credit-cards/${cardId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Erro ao editar cartão.",
  );
}

export async function toggleCreditCard(cardId: number): Promise<CreditCard> {
  return requestJson<CreditCard>(
    `/credit-cards/${cardId}/toggle`,
    { method: "PATCH" },
    "Erro ao alterar status do cartão.",
  );
}

export async function deleteCreditCard(cardId: number): Promise<CreditCard> {
  return requestJson<CreditCard>(
    `/credit-cards/${cardId}`,
    { method: "DELETE" },
    "Erro ao remover cartão.",
  );
}

export function getExportCsvUrl(filters?: TransactionFilters): string {
  const queryString = buildTransactionQueryString(filters);
  return buildApiUrl(`/transactions/export/csv${queryString}`);
}

export function getExportPdfUrl(filters?: TransactionFilters): string {
  const queryString = buildTransactionQueryString(filters);
  return buildApiUrl(`/transactions/report/pdf${queryString}`);
}

export async function importTransactionsCsv(file: File): Promise<CsvImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  return requestJson<CsvImportResult>(
    "/transactions/import/csv",
    {
      method: "POST",
      body: formData,
    },
    "Erro ao importar arquivo CSV.",
  );
}

export async function getGoals(
  status?: string,
  type?: string,
): Promise<Goal[]> {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (type) {
    params.set("type", type);
  }

  return requestJsonNoStore<Goal[]>(
    `/goals${toQueryString(params)}`,
    "Erro ao buscar metas.",
  );
}

export async function getGoalsWithProgress(
  status?: string,
  type?: string,
): Promise<GoalProgress[]> {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (type) {
    params.set("type", type);
  }

  return requestJsonNoStore<GoalProgress[]>(
    `/goals/progress${toQueryString(params)}`,
    "Erro ao buscar progresso das metas.",
  );
}

export async function getGoalsSummary(): Promise<GoalsSummary> {
  return requestJsonNoStore<GoalsSummary>(
    "/goals/summary",
    "Erro ao buscar resumo das metas.",
  );
}

export async function createGoal(payload: GoalCreate): Promise<Goal> {
  return requestJson<Goal>(
    "/goals",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao criar meta.",
  );
}

export async function updateGoal(
  goalId: number,
  payload: GoalUpdate,
): Promise<Goal> {
  return requestJson<Goal>(
    `/goals/${goalId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao atualizar meta.",
  );
}

export async function updateGoalAmount(
  goalId: number,
  currentAmount: string,
): Promise<Goal> {
  return requestJson<Goal>(
    `/goals/${goalId}/amount`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ current_amount: currentAmount }),
    },
    "Erro ao atualizar valor da meta.",
  );
}

export async function deleteGoal(goalId: number): Promise<Goal> {
  return requestJson<Goal>(
    `/goals/${goalId}`,
    {
      method: "DELETE",
    },
    "Erro ao deletar meta.",
  );
}

export async function getBudgets(
  month?: string,
  categoryId?: number,
): Promise<Budget[]> {
  const params = new URLSearchParams();

  if (month) {
    params.set("month", month);
  }

  if (categoryId) {
    params.set("category_id", String(categoryId));
  }

  return requestJsonNoStore<Budget[]>(
    `/budgets${toQueryString(params)}`,
    "Erro ao buscar orçamentos.",
  );
}

export async function getBudgetStatus(month?: string): Promise<BudgetStatus[]> {
  const params = new URLSearchParams();

  if (month) {
    params.set("month", month);
  }

  return requestJsonNoStore<BudgetStatus[]>(
    `/budgets/status${toQueryString(params)}`,
    "Erro ao buscar status dos orçamentos.",
  );
}

export async function getExceededBudgets(
  month?: string,
): Promise<BudgetStatus[]> {
  const params = new URLSearchParams();

  if (month) {
    params.set("month", month);
  }

  return requestJsonNoStore<BudgetStatus[]>(
    `/budgets/exceeded${toQueryString(params)}`,
    "Erro ao buscar orçamentos excedidos.",
  );
}

export async function createBudget(payload: BudgetCreate): Promise<Budget> {
  return requestJson<Budget>(
    "/budgets",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao criar orçamento.",
  );
}

export async function updateBudget(
  budgetId: number,
  payload: BudgetUpdate,
): Promise<Budget> {
  return requestJson<Budget>(
    `/budgets/${budgetId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao atualizar orçamento.",
  );
}

export async function deleteBudget(budgetId: number): Promise<Budget> {
  return requestJson<Budget>(
    `/budgets/${budgetId}`,
    {
      method: "DELETE",
    },
    "Erro ao deletar orçamento.",
  );
}

export async function getPiggyBanks(): Promise<PiggyBank[]> {
  return requestJsonNoStore<PiggyBank[]>("/piggy-banks", "Erro ao buscar cofrinhos.");
}

export async function createPiggyBank(payload: PiggyBankCreate): Promise<PiggyBank> {
  return requestJson<PiggyBank>(
    "/piggy-banks",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Erro ao criar cofrinho.",
  );
}

export async function updatePiggyBank(
  piggyBankId: number,
  payload: PiggyBankUpdate,
): Promise<PiggyBank> {
  return requestJson<PiggyBank>(
    `/piggy-banks/${piggyBankId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Erro ao editar cofrinho.",
  );
}

export async function updatePiggyBankBalance(
  piggyBankId: number,
  amountDelta: string,
): Promise<PiggyBank> {
  return requestJson<PiggyBank>(
    `/piggy-banks/${piggyBankId}/balance`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount_delta: amountDelta }),
    },
    "Erro ao atualizar saldo do cofrinho.",
  );
}

export async function deletePiggyBank(piggyBankId: number): Promise<PiggyBank> {
  return requestJson<PiggyBank>(
    `/piggy-banks/${piggyBankId}`,
    { method: "DELETE" },
    "Erro ao excluir cofrinho.",
  );
}

export async function getRecurringTransactions(
  isActive?: boolean,
): Promise<RecurringTransaction[]> {
  const params = new URLSearchParams();

  if (isActive !== undefined) {
    params.set("is_active", String(isActive));
  }

  return requestJsonNoStore<RecurringTransaction[]>(
    `/recurring-transactions${toQueryString(params)}`,
    "Erro ao buscar transações recorrentes.",
  );
}

export async function getRecurringTransaction(
  recurringId: number,
): Promise<RecurringTransaction> {
  return requestJsonNoStore<RecurringTransaction>(
    `/recurring-transactions/${recurringId}`,
    "Erro ao buscar transação recorrente.",
  );
}

export async function createRecurringTransaction(
  payload: RecurringTransactionCreate,
): Promise<RecurringTransaction> {
  return requestJson<RecurringTransaction>(
    "/recurring-transactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao cadastrar transação recorrente.",
  );
}

export async function updateRecurringTransaction(
  recurringId: number,
  payload: RecurringTransactionUpdate,
): Promise<RecurringTransaction> {
  return requestJson<RecurringTransaction>(
    `/recurring-transactions/${recurringId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    "Erro ao editar transação recorrente.",
  );
}

export async function toggleRecurringTransaction(
  recurringId: number,
): Promise<RecurringTransaction> {
  return requestJson<RecurringTransaction>(
    `/recurring-transactions/${recurringId}/toggle`,
    {
      method: "PATCH",
    },
    "Erro ao alterar status da transação recorrente.",
  );
}

export async function deleteRecurringTransaction(
  recurringId: number,
): Promise<RecurringTransaction> {
  return requestJson<RecurringTransaction>(
    `/recurring-transactions/${recurringId}`,
    {
      method: "DELETE",
    },
    "Erro ao deletar transação recorrente.",
  );
}

export async function processRecurringTransactions(): Promise<ProcessRecurringResult> {
  return requestJsonNoStore<ProcessRecurringResult>(
    "/recurring-transactions/process",
    "Erro ao processar transações recorrentes.",
  );
}