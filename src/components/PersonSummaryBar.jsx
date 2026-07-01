import { personName } from "../utils/people";

export default function PersonSummaryBar({ perPerson, guests }) {
  return (
    <div className="person-summary-bar">
      {perPerson.map((person) => (
        <span key={person.id} className="person-summary-chip">
          {personName(person.id, guests)} : €{person.total.toFixed(2)}
        </span>
      ))}
    </div>
  );
}
