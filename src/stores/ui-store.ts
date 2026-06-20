"use client";

// Cross-cutting CLIENT UI state that isn't tied to one domain.
//
// NOTE: this is a tiny zero-dependency store (React's useSyncExternalStore) so
// the app builds without `zustand` installed (C: drive is full — see
// ARCHITECTURE.md). The `useUiStore((s) => s.x)` selector API matches zustand,
// so swapping to real zustand later is a one-line change.
import { useSyncExternalStore } from "react";

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

let state: UiState;
const listeners = new Set<() => void>();

function setState(partial: Partial<UiState>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

state = {
  sidebarOpen: true,
  toggleSidebar: () => setState({ sidebarOpen: !state.sidebarOpen }),
  setSidebarOpen: (open) => setState({ sidebarOpen: open }),
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Read UI state with a selector, e.g. `useUiStore((s) => s.sidebarOpen)`. */
export function useUiStore<T>(selector: (s: UiState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}
