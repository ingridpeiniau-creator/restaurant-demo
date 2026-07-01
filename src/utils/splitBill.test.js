import { describe, it, expect } from "vitest";
import { computeCartTotals, computeOrderSummary, ME } from "./splitBill";

function cents(euros) {
  return Math.round(euros * 100);
}

function sumPerPersonTotalCents(summary) {
  return summary.perPerson.reduce((sum, p) => sum + cents(p.total), 0);
}

describe("computeCartTotals", () => {
  it("computes subtotal/tax/total for a flat tax rate", () => {
    const cart = [
      { lineId: "1", price: 8, quantity: 1 },
      { lineId: "2", price: 3, quantity: 1 },
    ];
    const totals = computeCartTotals(cart, 0.2);
    expect(totals.subtotal).toBeCloseTo(11);
    expect(totals.tax).toBeCloseTo(2.2);
    expect(totals.total).toBeCloseTo(13.2);
  });

  it("handles multi-quantity lines", () => {
    const cart = [{ lineId: "1", price: 6.5, quantity: 3 }];
    const totals = computeCartTotals(cart, 0.2);
    expect(totals.subtotal).toBeCloseTo(19.5);
  });
});

describe("computeOrderSummary", () => {
  it("assigns single-owner lines entirely to that person", () => {
    const guests = [{ id: "guest-alice", name: "Alice" }, { id: "guest-bob", name: "Bob" }];
    const cart = [
      { lineId: "1", price: 8, quantity: 1 },
      { lineId: "2", price: 3, quantity: 1 },
    ];
    const assignments = {
      1: { mode: "single", owner: "guest-alice" },
      2: { mode: "single", owner: "guest-bob" },
    };
    const summary = computeOrderSummary(cart, guests, assignments, 0.2);

    const alice = summary.perPerson.find((p) => p.id === "guest-alice");
    const bob = summary.perPerson.find((p) => p.id === "guest-bob");
    const me = summary.perPerson.find((p) => p.id === ME);

    expect(alice.subtotal).toBeCloseTo(8);
    expect(bob.subtotal).toBeCloseTo(3);
    expect(me.subtotal).toBeCloseTo(0);
    expect(sumPerPersonTotalCents(summary)).toBe(cents(summary.order.total));
  });

  it("defaults unassigned lines to the orderer (me)", () => {
    const guests = [{ id: "guest-alice", name: "Alice" }];
    const cart = [{ lineId: "1", price: 5, quantity: 1 }];
    const summary = computeOrderSummary(cart, guests, {}, 0.2);
    const me = summary.perPerson.find((p) => p.id === ME);
    expect(me.subtotal).toBeCloseTo(5);
  });

  it("matches the PRD worked example: Pizza EUR12 shared 2:1, 10% tax", () => {
    // PRD 5.3.1: Alice 2 shares / Bob 1 share of a EUR12 pizza -> Alice EUR8, Bob EUR4.
    // Tax 10% => EUR1.20 total, split proportionally: Alice EUR0.80, Bob EUR0.40.
    const guests = [{ id: "guest-alice", name: "Alice" }, { id: "guest-bob", name: "Bob" }];
    const cart = [{ lineId: "1", price: 12, quantity: 1 }];
    const assignments = {
      1: { mode: "share", shares: { "guest-alice": 2, "guest-bob": 1 } },
    };
    const summary = computeOrderSummary(cart, guests, assignments, 0.1);

    const alice = summary.perPerson.find((p) => p.id === "guest-alice");
    const bob = summary.perPerson.find((p) => p.id === "guest-bob");

    expect(alice.subtotal).toBeCloseTo(8);
    expect(bob.subtotal).toBeCloseTo(4);
    expect(alice.tax).toBeCloseTo(0.8);
    expect(bob.tax).toBeCloseTo(0.4);
    expect(alice.total).toBeCloseTo(8.8);
    expect(bob.total).toBeCloseTo(4.4);
  });

  it("resolves the EUR10-among-3 rounding edge case exactly", () => {
    const guests = [{ id: "guest-alice", name: "Alice" }, { id: "guest-bob", name: "Bob" }];
    const cart = [{ lineId: "1", price: 10, quantity: 1 }];
    const assignments = {
      1: { mode: "share", shares: { [ME]: 1, "guest-alice": 1, "guest-bob": 1 } },
    };
    const summary = computeOrderSummary(cart, guests, assignments, 0.2);

    // 1000 cents / 3 = 333.33... -> two people get 333, one gets 334.
    const subtotalCentsByPerson = summary.perPerson.map((p) => cents(p.subtotal));
    expect(subtotalCentsByPerson.sort()).toEqual([333, 333, 334]);
    expect(subtotalCentsByPerson.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(sumPerPersonTotalCents(summary)).toBe(cents(summary.order.total));
  });

  it("includes a zero-item guest at EUR0 across subtotal/tax/total", () => {
    const guests = [
      { id: "guest-alice", name: "Alice" },
      { id: "guest-empty", name: "Empty Guest" },
    ];
    const cart = [{ lineId: "1", price: 10, quantity: 1 }];
    const assignments = { 1: { mode: "single", owner: "guest-alice" } };
    const summary = computeOrderSummary(cart, guests, assignments, 0.2);

    const empty = summary.perPerson.find((p) => p.id === "guest-empty");
    expect(empty.subtotal).toBe(0);
    expect(empty.tax).toBe(0);
    expect(empty.total).toBe(0);
  });

  it("falls back to the orderer when a share line has zero total shares", () => {
    const cart = [{ lineId: "1", price: 5, quantity: 1 }];
    const assignments = { 1: { mode: "share", shares: {} } };
    const summary = computeOrderSummary(cart, [], assignments, 0.2);
    const me = summary.perPerson.find((p) => p.id === ME);
    expect(me.subtotal).toBeCloseTo(5);
  });

  it("always sums per-person totals to exactly the order total, across many random configurations", () => {
    const guestPool = [
      { id: "guest-a", name: "A" },
      { id: "guest-b", name: "B" },
      { id: "guest-c", name: "C" },
      { id: "guest-d", name: "D" },
      { id: "guest-e", name: "E" },
    ];

    for (let seed = 0; seed < 50; seed++) {
      const guestCount = seed % 6; // 0..5
      const guests = guestPool.slice(0, guestCount);
      const people = [ME, ...guests.map((g) => g.id)];

      const lineCount = 1 + (seed % 8);
      const cart = [];
      const assignments = {};
      for (let i = 0; i < lineCount; i++) {
        const lineId = `line-${seed}-${i}`;
        const price = 1 + ((seed * 7 + i * 13) % 47) / 3; // arbitrary non-round price
        const quantity = 1 + ((seed + i) % 3);
        cart.push({ lineId, price, quantity });

        if (i % 2 === 0) {
          const owner = people[(seed + i) % people.length];
          assignments[lineId] = { mode: "single", owner };
        } else {
          const shares = {};
          people.forEach((p, idx) => {
            shares[p] = (seed + i + idx) % 3; // some zero shares
          });
          assignments[lineId] = { mode: "share", shares };
        }
      }

      const summary = computeOrderSummary(cart, guests, assignments, 0.2);
      expect(sumPerPersonTotalCents(summary)).toBe(cents(summary.order.total));
    }
  });
});
