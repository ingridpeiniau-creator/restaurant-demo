import { useReducer, useMemo } from "react";

export const MAX_GUESTS = 5;

const initialState = {
  isActive: false,
  isFrozen: false,
  guests: [],
  assignments: {},
  paymentMode: null,
  payer: null,
};

function genGuestId() {
  return `guest-${Math.random().toString(36).slice(2, 10)}`;
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE":
      return action.active
        ? { ...state, isActive: true }
        : { ...initialState };

    case "ADD_GUEST": {
      const name = action.name.trim();
      if (!name || state.guests.length >= MAX_GUESTS || state.isFrozen) return state;
      return { ...state, guests: [...state.guests, { id: genGuestId(), name }] };
    }

    case "REMOVE_GUEST": {
      if (state.isFrozen) return state;
      const guests = state.guests.filter((g) => g.id !== action.guestId);
      const assignments = { ...state.assignments };
      for (const [lineId, assignment] of Object.entries(assignments)) {
        if (assignment.mode === "single" && assignment.owner === action.guestId) {
          assignments[lineId] = { mode: "single", owner: "me" };
        } else if (assignment.mode === "share" && assignment.shares?.[action.guestId] != null) {
          const shares = { ...assignment.shares };
          delete shares[action.guestId];
          assignments[lineId] = { ...assignment, shares };
        }
      }
      const payer = state.payer === action.guestId ? null : state.payer;
      return { ...state, guests, assignments, payer };
    }

    case "RENAME_GUEST": {
      if (state.isFrozen) return state;
      const name = action.name.trim();
      if (!name) return state;
      return {
        ...state,
        guests: state.guests.map((g) => (g.id === action.guestId ? { ...g, name } : g)),
      };
    }

    case "ASSIGN_LINE":
      if (state.isFrozen) return state;
      return {
        ...state,
        assignments: {
          ...state.assignments,
          [action.lineId]: { mode: "single", owner: action.owner },
        },
      };

    case "SET_LINE_SHARES":
      if (state.isFrozen) return state;
      return {
        ...state,
        assignments: {
          ...state.assignments,
          [action.lineId]: { mode: "share", shares: action.shares },
        },
      };

    case "REMOVE_LINE": {
      if (!(action.lineId in state.assignments)) return state;
      const assignments = { ...state.assignments };
      delete assignments[action.lineId];
      return { ...state, assignments };
    }

    case "SET_PAYMENT_MODE":
      return { ...state, paymentMode: action.mode };

    case "SET_PAYER":
      return { ...state, payer: action.payer };

    case "FREEZE":
      return { ...state, isFrozen: true };

    case "UNFREEZE":
      return { ...state, isFrozen: false };

    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

export function useSplitBill() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      setActive: (active) => dispatch({ type: "SET_ACTIVE", active }),
      addGuest: (name) => dispatch({ type: "ADD_GUEST", name }),
      removeGuest: (guestId) => dispatch({ type: "REMOVE_GUEST", guestId }),
      renameGuest: (guestId, name) => dispatch({ type: "RENAME_GUEST", guestId, name }),
      assignLine: (lineId, owner) => dispatch({ type: "ASSIGN_LINE", lineId, owner }),
      setLineShares: (lineId, shares) => dispatch({ type: "SET_LINE_SHARES", lineId, shares }),
      removeLine: (lineId) => dispatch({ type: "REMOVE_LINE", lineId }),
      setPaymentMode: (mode) => dispatch({ type: "SET_PAYMENT_MODE", mode }),
      setPayer: (payer) => dispatch({ type: "SET_PAYER", payer }),
      freeze: () => dispatch({ type: "FREEZE" }),
      unfreeze: () => dispatch({ type: "UNFREEZE" }),
      reset: () => dispatch({ type: "RESET" }),
    }),
    []
  );

  const canAddGuest = state.guests.length < MAX_GUESTS && !state.isFrozen;

  return useMemo(
    () => ({ state, actions, canAddGuest }),
    [state, actions, canAddGuest]
  );
}
