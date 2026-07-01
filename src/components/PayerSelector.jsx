export default function PayerSelector({ guests, paymentMode, payer, onSetMode, onSetPayer }) {
  return (
    <div className="payer-selector">
      <p className="payer-selector-label">Qui paie ?</p>
      <div className="payer-mode-buttons">
        <button
          className={`payer-mode-btn ${paymentMode === "singlePayer" ? "active" : ""}`}
          onClick={() => onSetMode("singlePayer")}
        >
          Un payeur
        </button>
        <button className="payer-mode-btn payer-mode-btn--disabled" disabled title="Bientôt disponible">
          Partager les frais (bientôt disponible)
        </button>
      </div>

      {paymentMode === "singlePayer" && (
        <select className="payer-select" value={payer ?? "me"} onChange={(e) => onSetPayer(e.target.value)}>
          <option value="me">Moi</option>
          {guests.map((guest) => (
            <option key={guest.id} value={guest.id}>{guest.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
