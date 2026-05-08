export function formatCurrency(value: string | number): string {
  const numericValue = Number(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatTransactionType(type: "income" | "expense"): string {
  const labels = {
    income: "Receita",
    expense: "Despesa",
  };

  return labels[type];
}

export function formatPaymentMethod(
  method: "credit_card" | "debit_card" | "cash" | "pix",
): string {
  const labels = {
    credit_card: "Cartão de crédito",
    debit_card: "Cartão de débito",
    cash: "Dinheiro",
    pix: "Pix",
  };

  return labels[method];
}

export function formatSpendingProfile(method: "fixed" | "variable"): string {
  const labels = {
    fixed: "Fixo",
    variable: "Variável",
  };

  return labels[method];
}

export function formatPaymentStatus(status: "paid" | "pending"): string {
  const labels = {
    paid: "Pago",
    pending: "A pagar",
  };

  return labels[status];
}
