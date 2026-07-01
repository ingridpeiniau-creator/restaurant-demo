import { personName } from "../utils/people";

function itemLabel(line) {
  return line.quantity > 1 ? `${line.name} x${line.quantity}` : line.name;
}

function itemsByPerson(cartLines, assignments) {
  const map = {};
  for (const line of cartLines) {
    const assignment = assignments[line.lineId] ?? { mode: "single", owner: "me" };
    const owners =
      assignment.mode === "single"
        ? [assignment.owner]
        : Object.keys(assignment.shares ?? {}).filter((p) => assignment.shares[p] > 0);

    for (const personId of owners) {
      (map[personId] ??= []).push(itemLabel(line));
    }
  }
  return map;
}

export default function PersonBreakdownTable({ perPerson, guests, cartLines, assignments }) {
  const itemsMap = itemsByPerson(cartLines, assignments);

  return (
    <table className="breakdown-table">
      <thead>
        <tr>
          <th>Personne</th>
          <th>Articles</th>
          <th>Sous-total</th>
          <th>Taxes</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {perPerson.map((person) => (
          <tr key={person.id}>
            <td>{personName(person.id, guests)}</td>
            <td>{(itemsMap[person.id] ?? []).join(", ") || "—"}</td>
            <td>€{person.subtotal.toFixed(2)}</td>
            <td>€{person.tax.toFixed(2)}</td>
            <td>€{person.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
