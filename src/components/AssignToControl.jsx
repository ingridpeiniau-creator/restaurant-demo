const SHARE_VALUE = "__share__";

export default function AssignToControl({ line, guests, assignment, isFrozen, onAssignSingle, onOpenShare }) {
  const value = assignment?.mode === "share" ? SHARE_VALUE : assignment?.owner ?? "me";

  function handleChange(e) {
    const next = e.target.value;
    if (next === SHARE_VALUE) {
      onOpenShare(line);
    } else {
      onAssignSingle(line.lineId, next);
    }
  }

  return (
    <select className="assign-to-select" value={value} onChange={handleChange} disabled={isFrozen}>
      <option value="me">Moi</option>
      {guests.map((guest) => (
        <option key={guest.id} value={guest.id}>{guest.name}</option>
      ))}
      <option value={SHARE_VALUE}>Partager…</option>
    </select>
  );
}
