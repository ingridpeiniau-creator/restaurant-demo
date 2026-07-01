const TAX_RATE = 0.10;

export function calculateTotals(cart) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = total / (1 + TAX_RATE);
  const tax = total - subtotal;

  return { subtotal, tax, total };
}
