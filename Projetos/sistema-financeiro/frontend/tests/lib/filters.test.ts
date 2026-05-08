import { describe, it, expect } from "vitest";
import { parseTransactionFilters } from "@/lib/filters";

describe("parseTransactionFilters", () => {
  it("should return empty object for empty params", () => {
    const result = parseTransactionFilters({});
    expect(result).toEqual({});
  });

  it("should parse type correctly", () => {
    const result = parseTransactionFilters({ type: "income" });
    expect(result.type).toBe("income");
  });

  it("should ignore invalid type", () => {
    const result = parseTransactionFilters({ type: "invalid" });
    expect(result.type).toBeUndefined();
  });

  it("should parse category_id as number", () => {
    const result = parseTransactionFilters({ category_id: "5" });
    expect(result.category_id).toBe(5);
  });

  it("should ignore invalid category_id", () => {
    const result = parseTransactionFilters({ category_id: "abc" });
    expect(result.category_id).toBeUndefined();
  });

  it("should parse dates correctly", () => {
    const result = parseTransactionFilters({
      start_date: "2026-01-01",
      end_date: "2026-12-31",
    });
    expect(result.start_date).toBe("2026-01-01");
    expect(result.end_date).toBe("2026-12-31");
  });

  it("should parse page and per_page", () => {
    const result = parseTransactionFilters({
      page: "2",
      per_page: "20",
    });
    expect(result.page).toBe(2);
    expect(result.per_page).toBe(20);
  });

  it("should ignore page less than 1", () => {
    const result = parseTransactionFilters({ page: "0" });
    expect(result.page).toBeUndefined();
  });

  it("should parse all filters together", () => {
    const result = parseTransactionFilters({
      type: "expense",
      category_id: "3",
      start_date: "2026-05-01",
      end_date: "2026-05-31",
      page: "1",
    });

    expect(result).toEqual({
      type: "expense",
      category_id: 3,
      start_date: "2026-05-01",
      end_date: "2026-05-31",
      page: 1,
    });
  });
});
