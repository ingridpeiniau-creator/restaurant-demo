const ME = "me";

function toCents(amount) {
  return Math.round(amount * 100);
}

function fromCents(cents) {
  return cents / 100;
}

/**
 * Distributes `targetSumCents` across the keys of `exactAmountsCents` so the
 * result sums exactly to `targetSumCents`, using largest-remainder rounding:
 * floor everything, then hand out the leftover cents to whichever keys had
 * the largest fractional remainder (stable tie-break by key order). This
 * avoids always penalizing "the last person" and keeps the result
 * deterministic regardless of object key iteration order.
 */
function largestRemainderRound(exactAmountsCents, targetSumCents) {
  const keys = Object.keys(exactAmountsCents);
  const floored = {};
  let flooredSum = 0;
  for (const key of keys) {
    const value = Math.floor(exactAmountsCents[key]);
    floored[key] = value;
    flooredSum += value;
  }

  const remainderCents = targetSumCents - flooredSum;
  const byRemainderDesc = [...keys].sort((a, b) => {
    const remA = exactAmountsCents[a] - Math.floor(exactAmountsCents[a]);
    const remB = exactAmountsCents[b] - Math.floor(exactAmountsCents[b]);
    if (remB !== remA) return remB - remA;
    return a < b ? -1 : a > b ? 1 : 0;
  });

  for (let i = 0; i < remainderCents; i++) {
    floored[byRemainderDesc[i]] += 1;
  }

  return floored;
}

function allocateItemShares(lineTotalCents, shares) {
  const participants = Object.keys(shares).filter((key) => shares[key] > 0);
  const totalShares = participants.reduce((sum, key) => sum + shares[key], 0);

  if (totalShares === 0) {
    return { [ME]: lineTotalCents };
  }

  const exact = {};
  for (const key of participants) {
    exact[key] = (lineTotalCents * shares[key]) / totalShares;
  }
  return largestRemainderRound(exact, lineTotalCents);
}

/**
 * Subtotal/tax/total for a cart, independent of split-bill assignment.
 * Single source of truth shared by the non-split cart/checkout view and
 * as the order-level basis when split mode is active.
 */
function computeCartTotals(cartLines, taxRate = 0.2) {
  const subtotalCents = cartLines.reduce(
    (sum, line) => sum + toCents(line.price * line.quantity),
    0
  );
  const taxCents = Math.round(subtotalCents * taxRate);
  return {
    subtotal: fromCents(subtotalCents),
    tax: fromCents(taxCents),
    total: fromCents(subtotalCents + taxCents),
  };
}

/**
 * Full per-person breakdown for a split-bill order. Guarantees
 * sum(perPerson.total) === order.total to the cent.
 */
function computeOrderSummary(cartLines, guests, assignments, taxRate = 0.2) {
  const people = [ME, ...guests.map((g) => g.id)];
  const personSubtotalCents = Object.fromEntries(people.map((p) => [p, 0]));

  for (const line of cartLines) {
    const lineTotalCents = toCents(line.price * line.quantity);
    const assignment = assignments[line.lineId] ?? { mode: "single", owner: ME };

    if (assignment.mode === "single") {
      const owner = people.includes(assignment.owner) ? assignment.owner : ME;
      personSubtotalCents[owner] += lineTotalCents;
    } else {
      const allocation = allocateItemShares(lineTotalCents, assignment.shares ?? {});
      for (const [person, cents] of Object.entries(allocation)) {
        if (person in personSubtotalCents) personSubtotalCents[person] += cents;
        else personSubtotalCents[ME] += cents;
      }
    }
  }

  const orderSubtotalCents = Object.values(personSubtotalCents).reduce((a, b) => a + b, 0);
  const orderTaxCents = Math.round(orderSubtotalCents * taxRate);

  const exactTax = {};
  for (const person of people) {
    exactTax[person] =
      orderSubtotalCents === 0
        ? 0
        : (orderTaxCents * personSubtotalCents[person]) / orderSubtotalCents;
  }
  const personTaxCents = largestRemainderRound(exactTax, orderTaxCents);

  const perPerson = people.map((person) => ({
    id: person,
    subtotal: fromCents(personSubtotalCents[person]),
    tax: fromCents(personTaxCents[person]),
    total: fromCents(personSubtotalCents[person] + personTaxCents[person]),
  }));

  return {
    perPerson,
    order: {
      subtotal: fromCents(orderSubtotalCents),
      tax: fromCents(orderTaxCents),
      total: fromCents(orderSubtotalCents + orderTaxCents),
    },
  };
}

export { ME, computeCartTotals, computeOrderSummary, allocateItemShares, largestRemainderRound };
