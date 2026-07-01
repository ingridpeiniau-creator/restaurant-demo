import { describe, it, expect } from "vitest";
import { calculateTotals } from "./pricing";

describe("calculateTotals", () => {
  it("returns zeros for an empty cart", () => {
    expect(calculateTotals([])).toEqual({ subtotal: 0, tax: 0, total: 0 });
  });

  it("keeps the total equal to the tax-included item prices (no tax added on top)", () => {
    const cart = [{ price: 6.5, quantity: 1 }];
    const { total } = calculateTotals(cart);
    expect(total).toBeCloseTo(6.5, 2);
  });

  it("extracts a 10% VAT from the tax-included price rather than adding it", () => {
    const cart = [{ price: 6.5, quantity: 1 }];
    const { subtotal, tax, total } = calculateTotals(cart);
    expect(subtotal).toBeCloseTo(5.91, 2);
    expect(tax).toBeCloseTo(0.59, 2);
    expect(subtotal + tax).toBeCloseTo(total, 2);
    expect(tax).toBeCloseTo(subtotal * 0.10, 2);
  });

  it("multiplies by quantity", () => {
    const cart = [{ price: 6.5, quantity: 2 }];
    const { total } = calculateTotals(cart);
    expect(total).toBeCloseTo(13.0, 2);
  });

  it("sums across multiple distinct items", () => {
    const cart = [
      { price: 6.5, quantity: 1 },
      { price: 14.0, quantity: 2 },
    ];
    const { total } = calculateTotals(cart);
    expect(total).toBeCloseTo(34.5, 2);
  });
});
