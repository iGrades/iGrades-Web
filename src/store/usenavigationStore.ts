import { create } from "zustand";

export type ParentPage = "home" | "student" | "settings";
export type StudentPage = "home" | "quiz" | "learn" | "settings"

interface NavigationState {
  currentParentPage: ParentPage;
  setCurrentParentPage: (page: ParentPage) => void;
  currentStudentPage: StudentPage;
  setCurrentStudentPage: (page: StudentPage) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentParentPage: "home",
  setCurrentParentPage: (page) => set({ currentParentPage: page }),
  currentStudentPage: "home",
  setCurrentStudentPage: (page) => set({ currentStudentPage: page }),
}));
