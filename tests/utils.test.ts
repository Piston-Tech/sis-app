import { describe, expect, it } from "vitest";
import formatMoney from "@/utils/formatMoney";
import formatNumber from "@/utils/formatNumber";
import createSlug from "@/utils/createSlug";
import getClassDateRange from "@/utils/getClassDateRange";
import type { Session } from "@/types";

describe("formatNumber", () => {
  it("groups thousands", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber("1234567")).toBe("1,234,567");
    expect(formatNumber(-1234567)).toBe("-1,234,567");
  });

  it("keeps decimals", () => {
    expect(formatNumber(1234.5)).toBe("1,234.5");
    expect(formatNumber("1234567.891")).toBe("1,234,567.891");
  });

  it("fixes to two decimals when asked", () => {
    expect(formatNumber(1234.5, true)).toBe("1,234.50");
    expect(formatNumber("1000000", true)).toBe("1,000,000.00");
    expect(formatNumber(12.345, true)).toBe("12.35");
  });

  it("returns non-numeric input unchanged", () => {
    expect(formatNumber("N/A")).toBe("N/A");
  });
});

describe("formatMoney", () => {
  it("prefixes the currency symbol", () => {
    expect(formatMoney(250000, false, "Nigerian Naira")).toBe("₦250,000");
    expect(formatMoney("1999.9", true, "US Dollar")).toBe("$1,999.90");
    expect(formatMoney(10, false, "Euro")).toBe("€10");
    expect(formatMoney(10, false, "Pound")).toBe("£10");
  });
});

describe("createSlug", () => {
  it("slugifies", () => {
    expect(createSlug("  Project Management: Advanced!  ")).toBe(
      "project-management-advanced",
    );
    expect(createSlug("Café Crème")).toBe("cafe-creme");
    expect(createSlug("a  --  b")).toBe("a-b");
  });
});

describe("getClassDateRange", () => {
  const session = (date: string) => ({ date: new Date(date) }) as Session;

  it("returns nulls for no sessions", () => {
    expect(getClassDateRange([])).toEqual({ min: null, max: null });
  });

  it("finds the first and last session dates", () => {
    const { min, max } = getClassDateRange([
      session("2026-03-10"),
      session("2026-01-05"),
      session("2026-02-20"),
    ]);
    expect(min?.toISOString().slice(0, 10)).toBe("2026-01-05");
    expect(max?.toISOString().slice(0, 10)).toBe("2026-03-10");
  });
});
