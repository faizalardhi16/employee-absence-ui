import { create } from "zustand"
import { persist } from "zustand/middleware"

const STORAGE_KEY = "police-ui-preferences"

/** Preferensi UI aplikasi. Satu-satunya state yang di-persist ke localStorage. */
interface UiStore {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    { name: STORAGE_KEY, partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }) },
  ),
)
