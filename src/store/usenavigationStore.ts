import { create } from "zustand";

export type Page = "home" | "student" | "settings" | "community";

interface NavigationState {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: "home",
  setCurrentPage: (page) => set({ currentPage: page }),
}));
