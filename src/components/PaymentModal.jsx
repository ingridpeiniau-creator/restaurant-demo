import { useState, useEffect } from "react";
import { computeCartTotals, computeOrderSummary } from "../utils/splitBill";
import { personName } from "../utils/people";
import PersonBreakdownTable from "./PersonBreakdownTable";
import PayerSelector from "./PayerSelector";

function generateOrderNumber() {
  return "DL-" + Math.floor(10000 + Math.random() * 90000);
}

function shareCodeFor(orderNumber, guestId) {
  return `${orderNumber}-${guestId.slice(-4).toUpperCase()}`;
}

export default function PaymentModal({ cart, splitBill, onClose, onSuccess }) {
  const { subtotal, tax, total } = computeCartTotals(cart);
  const { state, actions } = splitBill;

  const [step, setStep] = useState("summary");
  const [orderNumber] = useState(generateOrderNumber);
  const [orderTime] = useState(() => new Date());
  const [form, setForm] = useState({ name: "", number: "", expiry: "", cvv: "" });

  useEffect(() => {
    if (state.isActive && state.paymentMode === null) {
      actions.setPaymentMode("singlePayer");
      actions.setPayer("me");
    }
  }, [state.isActive, state.paymentMode, actions]);

  useEffect(() => {
    if (step !== "processing") return;
    const timer = setTimeout(() => setStep("success"), 2000);
    return () => clearTimeout(timer);
  }, [step]);

  function handleOverlayClick() {
    if (step !== "processing") onClose();
  }

  function handleNumberChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setForm((f) => ({ ...f, number: formatted }));
  }

  function handleExpiryChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted = raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw;
    setForm((f) => ({ ...f, expiry: formatted }));
  }

  const canPay =
    form.name.trim() &&
    form.number.replace(/\s/g, "").length === 16 &&
    form.expiry.length === 5 &&
    form.cvv.length >= 3;

  const formattedTime = orderTime.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const summary = state.isActive ? computeOrderSummary(cart, state.guests, state.assignments) : null;
  const payerName = state.isActive ? personName(state.payer ?? "me", state.guests) : null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {step === "summary" && (
          <div className="modal-step">
            <h2 className="modal-title">Order Summary</h2>
            <ul className="modal-item-list">
              {cart.map((item) => (
                <li key={item.lineId} className="modal-item-row">
                  <span className="modal-item-emoji">{item.emoji}</span>
                  <span className="modal-item-name">{item.name}</span>
                  <span className="modal-item-qty">x{item.quantity}</span>
                  <span className="modal-item-price">€{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="modal-totals">
              <div className="modal-totals-row">
                <span>Subtotal</span><span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="modal-totals-row">
                <span>Tax (20%)</span><span>€{tax.toFixed(2)}</span>
              </div>
              <div className="modal-totals-row modal-totals-total">
                <span>Total</span><span>€{total.toFixed(2)}</span>
              </div>
            </div>

            {summary && (
              <div className="split-payment-section">
                <h3 className="split-payment-subtitle">Récapitulatif par personne</h3>
                <PersonBreakdownTable
                  perPerson={summary.perPerson}
                  guests={state.guests}
                  cartLines={cart}
                  assignments={state.assignments}
                />
                <PayerSelector
                  guests={state.guests}
                  paymentMode={state.paymentMode}
                  payer={state.payer}
                  onSetMode={actions.setPaymentMode}
                  onSetPayer={actions.setPayer}
                />
              </div>
            )}

            <div className="modal-actions">
              <button className="modal-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="modal-btn-primary" onClick={() => setStep("card")}>
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {step === "card" && (
          <div className="modal-step">
            <h2 className="modal-title">Payment Details</h2>
            <div className="card-form">
              <label className="card-label">
                Name on card
                <input
                  className="card-input"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="card-label">
                Card number
                <input
                  className="card-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={form.number}
                  onChange={handleNumberChange}
                />
              </label>
              <div className="card-row">
                <label className="card-label">
                  Expiry
                  <input
                    className="card-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={form.expiry}
                    onChange={handleExpiryChange}
                  />
                </label>
                <label className="card-label">
                  CVV
                  <input
                    className="card-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={form.cvv}
                    onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  />
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-secondary" onClick={() => setStep("summary")}>Back</button>
              <button
                className="modal-btn-primary"
                disabled={!canPay}
                onClick={() => setStep("processing")}
              >
                Pay €{total.toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="modal-step modal-step-centered">
            <div className="spinner" />
            <p className="processing-title">Processing your payment…</p>
            <p className="processing-subtitle">Please do not close this window.</p>
          </div>
        )}

        {step === "success" && (
          <div className="modal-step modal-step-centered">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Payment Successful!</h2>
            <p className="success-meta">Order {orderNumber} · {formattedTime}</p>
            {summary && (
              <p className="success-meta">Payé par {payerName}</p>
            )}
            <ul className="modal-item-list modal-item-list--receipt">
              {cart.map((item) => (
                <li key={item.lineId} className="modal-item-row">
                  <span className="modal-item-emoji">{item.emoji}</span>
                  <span className="modal-item-name">{item.name}</span>
                  <span className="modal-item-qty">x{item.quantity}</span>
                  <span className="modal-item-price">€{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="modal-totals">
              <div className="modal-totals-row modal-totals-total">
                <span>Total paid</span><span>€{total.toFixed(2)}</span>
              </div>
            </div>

            {summary && state.guests.length > 0 && (
              <div className="split-share-codes">
                <h3 className="split-payment-subtitle">Part de chaque invité</h3>
                <ul className="share-code-list">
                  {state.guests.map((guest) => {
                    const person = summary.perPerson.find((p) => p.id === guest.id);
                    return (
                      <li key={guest.id} className="share-code-row">
                        <span>{guest.name} — €{person.total.toFixed(2)}</span>
                        <code>{shareCodeFor(orderNumber, guest.id)}</code>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <button className="modal-btn-primary modal-btn-full" onClick={onSuccess}>
              Start New Order
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
