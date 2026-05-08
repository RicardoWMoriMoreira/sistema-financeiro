import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatTransactionType,
} from "@/lib/formatters";

describe("formatCurrency", () => {
  it("should format a positive number as BRL currency", () => {
    const result = formatCurrency("1234.56");
    expect(result).toContain("1.234,56");
  });

  it("should format zero correctly", () => {
    const result = formatCurrency("0");
    expect(result).toContain("0,00");
  });

  it("should format large numbers with thousand separators", () => {
    const result = formatCurrency("1000000.00");
    expect(result).toContain("1.000.000,00");
  });
});

describe("formatDate", () => {
  it("should format ISO date string to pt-BR format", () => {
    const result = formatDate("2026-05-07");
    expect(result).toBe("07/05/2026");
  });

  it("should format another date correctly", () => {
    const result = formatDate("2026-12-25");
    expect(result).toBe("25/12/2026");
  });
});

describe("formatTransactionType", () => {
  it("should return 'Receita' for income", () => {
    const result = formatTransactionType("income");
    expect(result).toBe("Receita");
  });

  it("should return 'Despesa' for expense", () => {
    const result = formatTransactionType("expense");
    expect(result).toBe("Despesa");
  });
});
