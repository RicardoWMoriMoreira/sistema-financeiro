export type TransactionSummary = {
    total_income: string;
    total_expense: string;
    balance: string;
  };

  export type TransactionStatusCounts = {
    paid: number;
    pending: number;
    total: number;
  };

  export type TransactionGroupActionResult = {
    group_id: string;
    affected: number;
    message: string;
  };
  
  export type TransactionType = "income" | "expense";
  export type PaymentMethod = "credit_card" | "debit_card" | "cash" | "pix";
  export type SpendingProfile = "fixed" | "variable";
  export type PaymentStatus = "paid" | "pending";
  
  export type Category = {
    id: number;
    name: string;
    type: TransactionType;
  };
  
  export type CategoryCreate = {
    name: string;
    type: TransactionType;
  };
  
  export type CategoryUpdate = {
    name: string;
    type: TransactionType;
  };

  export type CreditCard = {
    id: number;
    name: string;
    brand: string;
    last_four: string;
    closing_day: number;
    due_day: number;
    is_active: boolean;
    created_at: string;
  };

  export type CreditCardCreate = {
    name: string;
    brand: string;
    last_four: string;
    closing_day: number;
    due_day: number;
  };

  export type CreditCardUpdate = CreditCardCreate & {
    is_active: boolean;
  };
  
  export type Transaction = {
    id: number;
    description: string;
    amount: string;
    type: TransactionType;
    payment_method: PaymentMethod;
    spending_profile: SpendingProfile;
    due_date: string | null;
    payment_status: PaymentStatus;
    installment_group_id: string | null;
    installment_number: number;
    installment_total: number;
    category_id: number;
    credit_card_id: number | null;
    category: Category | null;
    credit_card: CreditCard | null;
    date: string;
  };
  
  export type TransactionCreate = {
    description: string;
    amount: string;
    type: TransactionType;
    payment_method: PaymentMethod;
    spending_profile: SpendingProfile;
    due_date?: string | null;
    payment_status: PaymentStatus;
    installment_total?: number;
    category_id: number;
    credit_card_id?: number | null;
    date: string;
  };
  
  export type TransactionUpdate = {
    description: string;
    amount: string;
    type: TransactionType;
    payment_method: PaymentMethod;
    spending_profile: SpendingProfile;
    due_date?: string | null;
    payment_status: PaymentStatus;
    installment_group_id?: string | null;
    installment_number?: number;
    installment_total?: number;
    category_id: number;
    credit_card_id?: number | null;
    date: string;
  };
  
  export type TransactionFilters = {
    type?: TransactionType;
    payment_status?: PaymentStatus;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    per_page?: number;
  };

  export type PaginatedTransactions = {
    items: Transaction[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };

export type GoalType = "saving" | "spending";

export type GoalStatus = "active" | "completed" | "failed";

export type Goal = {
  id: number;
  user_id: number | null;
  name: string;
  target_amount: string;
  current_amount: string;
  deadline: string;
  type: GoalType;
  status: GoalStatus;
  created_at: string;
};

export type GoalCreate = {
  name: string;
  target_amount: string;
  current_amount?: string;
  deadline: string;
  type: GoalType;
};

export type GoalUpdate = {
  name: string;
  target_amount: string;
  current_amount: string;
  deadline: string;
  type: GoalType;
  status: GoalStatus;
};

export type GoalProgress = {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  deadline: string;
  type: GoalType;
  status: GoalStatus;
  progress_percentage: string;
  remaining_amount: string;
  days_remaining: number;
  is_on_track: boolean;
};

export type GoalsSummary = {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  failed_goals: number;
  total_target: string;
  total_current: string;
  overall_progress: string;
};

export type Budget = {
  id: number;
  user_id: number | null;
  category_id: number;
  category: Category;
  month: string;
  amount_limit: string;
  created_at: string;
};

export type BudgetCreate = {
  category_id: number;
  month: string;
  amount_limit: string;
};

export type BudgetUpdate = {
  category_id: number;
  month: string;
  amount_limit: string;
};

export type BudgetStatus = {
  id: number;
  category_id: number;
  category: Category;
  month: string;
  amount_limit: string;
  amount_spent: string;
  remaining: string;
  percentage_used: string;
  is_exceeded: boolean;
};

export type PiggyBank = {
  id: number;
  name: string;
  description: string | null;
  target_amount: string;
  current_amount: string;
  progress_percentage: string;
  remaining_amount: string;
  created_at: string;
};

export type PiggyBankCreate = {
  name: string;
  description?: string | null;
  target_amount: string;
  current_amount?: string;
};

export type PiggyBankUpdate = {
  name: string;
  description?: string | null;
  target_amount: string;
  current_amount: string;
};

  export type TransactionHistoryItem = {
    period: string;
    income: string;
    expense: string;
    balance: string;
  };

  export type TransactionHistoryResponse = {
    items: TransactionHistoryItem[];
    group_by: "day" | "week" | "month";
    period: string;
  };

  export type HistoryPeriod = "6m" | "12m" | "ytd" | "all";
  export type HistoryGroupBy = "day" | "week" | "month";

  export type FrequencyType = "daily" | "weekly" | "monthly" | "yearly";

  export type RecurringTransaction = {
    id: number;
    description: string;
    amount: string;
    type: TransactionType;
    category_id: number;
    category: Category | null;
    frequency: FrequencyType;
    start_date: string;
    end_date: string | null;
    next_occurrence: string;
    is_active: boolean;
    last_generated: string | null;
  };

  export type RecurringTransactionCreate = {
    description: string;
    amount: string;
    type: TransactionType;
    category_id: number;
    frequency: FrequencyType;
    start_date: string;
    end_date?: string | null;
  };

  export type RecurringTransactionUpdate = {
    description: string;
    amount: string;
    type: TransactionType;
    category_id: number;
    frequency: FrequencyType;
    start_date: string;
    end_date?: string | null;
    is_active: boolean;
  };

  export type ProcessRecurringResult = {
    processed_count: number;
    transactions_created: number;
  };