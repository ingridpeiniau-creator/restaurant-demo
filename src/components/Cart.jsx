import { useState } from "react";
import { computeCartTotals, computeOrderSummary } from "../utils/splitBill";
import SplitToggle from "./SplitToggle";
import AddGuestsModal from "./AddGuestsModal";
import AssignToControl from "./AssignToControl";
import ShareModal from "./ShareModal";
import PersonSummaryBar from "./PersonSummaryBar";

export default function Cart({ cart, onRemove, onCheckout, splitBill }) {
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [shareModalLine, setShareModalLine] = useState(null);

  const { state, actions, canAddGuest } = splitBill;
  const { subtotal, tax, total } = computeCartTotals(cart);

  const summary = state.isActive
    ? computeOrderSummary(cart, state.guests, state.assignments)
    : null;

  function handleEnableSplit() {
    actions.setActive(true);
    setShowGuestsModal(true);
  }

  function handleCancelGuestsModal() {
    if (state.guests.length === 0) actions.setActive(false);
    setShowGuestsModal(false);
  }

  function handleShareValidate(shares) {
    actions.setLineShares(shareModalLine.lineId, shares);
    setShareModalLine(null);
  }

  return (
    <aside className="cart">
      <div className="cart-header-row">
        <h2>Your Order</h2>
        <SplitToggle
          isActive={state.isActive}
          guestCount={state.guests.length}
          isFrozen={state.isFrozen}
          onEnable={handleEnableSplit}
          onManageGuests={() => setShowGuestsModal(true)}
          onDisable={() => actions.setActive(false)}
        />
      </div>

      {summary && <PersonSummaryBar perPerson={summary.perPerson} guests={state.guests} />}

      {cart.length === 0 ? (
        <p className="cart-empty">No items yet.</p>
      ) : (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.lineId} className="cart-item">
              <span className="cart-item-emoji">{item.emoji}</span>
              <div className="cart-item-details">
                <span className="cart-item-name">{item.name}</span>
                <span className="cart-item-qty">x{item.quantity}</span>
              </div>
              <span className="cart-item-price">€{(item.price * item.quantity).toFixed(2)}</span>
              {state.isActive && (
                <AssignToControl
                  line={item}
                  guests={state.guests}
                  assignment={state.assignments[item.lineId]}
                  isFrozen={state.isFrozen}
                  onAssignSingle={actions.assignLine}
                  onOpenShare={setShareModalLine}
                />
              )}
              <button className="remove-btn" onClick={() => onRemove(item.lineId)}>✕</button>
            </li>
          ))}
        </ul>
      )}

      <div className="cart-totals">
        <div className="cart-totals-row">
          <span>Subtotal</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        <div className="cart-totals-row">
          <span>Tax (20%)</span>
          <span>€{tax.toFixed(2)}</span>
        </div>
        <div className="cart-totals-row total">
          <span>Total</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      <button
        className="checkout-btn"
        disabled={cart.length === 0}
        onClick={onCheckout}
      >
        Place Order
      </button>

      {showGuestsModal && (
        <AddGuestsModal
          guests={state.guests}
          canAddGuest={canAddGuest}
          onAddGuest={actions.addGuest}
          onRemoveGuest={actions.removeGuest}
          onRenameGuest={actions.renameGuest}
          onCancel={handleCancelGuestsModal}
          onContinue={() => setShowGuestsModal(false)}
        />
      )}

      {shareModalLine && (
        <ShareModal
          line={shareModalLine}
          guests={state.guests}
          existingShares={state.assignments[shareModalLine.lineId]?.shares}
          onCancel={() => setShareModalLine(null)}
          onValidate={handleShareValidate}
        />
      )}
    </aside>
  );
}
