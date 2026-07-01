import { useState } from "react";

function initialShares(guests, existingShares) {
  const draft = { me: existingShares?.me ?? 1 };
  for (const guest of guests) {
    draft[guest.id] = existingShares?.[guest.id] ?? 0;
  }
  return draft;
}

export default function ShareModal({ line, guests, existingShares, onCancel, onValidate }) {
  const [shares, setShares] = useState(() => initialShares(guests, existingShares));

  const lineTotal = line.price * line.quantity;
  const totalShares = Object.values(shares).reduce((sum, n) => sum + n, 0);
  const pricePerShare = totalShares > 0 ? lineTotal / totalShares : 0;

  function setShareFor(personId, value) {
    const n = Math.max(0, Number.parseInt(value, 10) || 0);
    setShares((prev) => ({ ...prev, [personId]: n }));
  }

  const people = [{ id: "me", name: "Moi" }, ...guests];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{line.name} – Partager entre qui ?</h2>

        <ul className="share-row-list">
          {people.map((person) => (
            <li key={person.id} className="share-row">
              <span className="share-row-name">{person.name}</span>
              <input
                className="card-input share-shares-input"
                type="number"
                min="0"
                value={shares[person.id] ?? 0}
                onChange={(e) => setShareFor(person.id, e.target.value)}
              />
              <span className="share-row-amount">
                {shares[person.id] > 0 ? `€${(shares[person.id] * pricePerShare).toFixed(2)}` : "—"}
              </span>
            </li>
          ))}
        </ul>

        <p className="share-per-share-hint">
          {totalShares > 0
            ? `€${lineTotal.toFixed(2)} ÷ ${totalShares} part${totalShares > 1 ? "s" : ""} = €${pricePerShare.toFixed(2)} / part`
            : "Ajoutez au moins une part"}
        </p>

        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="modal-btn-primary" disabled={totalShares === 0} onClick={() => onValidate(shares)}>
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
