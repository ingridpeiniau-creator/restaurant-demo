export default function SplitToggle({ isActive, guestCount, isFrozen, onEnable, onManageGuests, onDisable }) {
  if (!isActive) {
    return (
      <button className="split-toggle-btn" onClick={onEnable}>
        🧾 Partager cette commande
      </button>
    );
  }

  return (
    <div className="split-toggle-active">
      <button className="split-toggle-manage-btn" onClick={onManageGuests} disabled={isFrozen}>
        👥 {guestCount} invité{guestCount > 1 ? "s" : ""}
      </button>
      {!isFrozen && (
        <button className="split-toggle-disable-btn" onClick={onDisable} title="Ne plus partager">
          ✕
        </button>
      )}
    </div>
  );
}
