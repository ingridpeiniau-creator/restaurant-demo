import { useState } from "react";
import { MAX_GUESTS } from "../hooks/useSplitBill";

export default function AddGuestsModal({ guests, canAddGuest, onAddGuest, onRemoveGuest, onRenameGuest, onCancel, onContinue }) {
  const [draftName, setDraftName] = useState("");

  function handleAdd() {
    if (!draftName.trim() || !canAddGuest) return;
    onAddGuest(draftName);
    setDraftName("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  function handleRenameBlur(guest, index) {
    // Names can be cleared while editing; on blur, fall back to a placeholder
    // so a guest is never left nameless. Also drops stray leading/trailing spaces.
    const trimmed = guest.name.trim();
    onRenameGuest(guest.id, trimmed || `Invité ${index + 1}`);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Qui partage ce repas ?</h2>

        <ul className="guest-list">
          {guests.map((guest, index) => (
            <li key={guest.id} className="guest-row">
              <input
                className="card-input guest-name-input"
                type="text"
                value={guest.name}
                onChange={(e) => onRenameGuest(guest.id, e.target.value)}
                onBlur={() => handleRenameBlur(guest, index)}
              />
              <button className="remove-btn" onClick={() => onRemoveGuest(guest.id)}>✕</button>
            </li>
          ))}
        </ul>

        <div className="guest-add-row">
          <input
            className="card-input"
            type="text"
            placeholder="Nom de l'invité"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canAddGuest}
          />
          <button className="modal-btn-secondary" onClick={handleAdd} disabled={!canAddGuest || !draftName.trim()}>
            + Ajouter
          </button>
        </div>
        <p className="guest-limit-hint">{MAX_GUESTS} invités max</p>

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="modal-btn-primary" disabled={guests.length === 0} onClick={onContinue}>
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
