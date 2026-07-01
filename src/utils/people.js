export function personName(personId, guests) {
  if (personId === "me") return "Moi";
  return guests.find((g) => g.id === personId)?.name ?? personId;
}
