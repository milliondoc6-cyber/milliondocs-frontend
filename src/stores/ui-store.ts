// ⚠️ Requires `npm install zustand` (see ARCHITECTURE.md disk-space note).
// Cross-cutting CLIENT UI state that isn't tied to one feature. Feature-specific
// client state lives in that feature's folder (e.g. features/auth/store.ts).
import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
