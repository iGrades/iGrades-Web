import { create } from "zustand";

export type ParentPage = "home" | "student" | "settings";
export type StudentPage = "home" | "quiz" | "learn" | "rewards" | "settings";

interface NavigationState {
  currentParentPage: ParentPage;
  setCurrentParentPage: (page: ParentPage) => void;
  parentSettingsTab: string;
  setParentSettingsTab: (tab: string) => void;

  currentStudentPage: StudentPage;
  setCurrentStudentPage: (page: StudentPage) => void;
  studentSettingsTab: string;
  setStudentSettingsTab: (tab: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentParentPage: "home",
  setCurrentParentPage: (page) => set({ currentParentPage: page }),
  parentSettingsTab: "igrade",
  setParentSettingsTab: (tab) => set({ parentSettingsTab: tab }),

  currentStudentPage: "home",
  setCurrentStudentPage: (page) => set({ currentStudentPage: page }),
  studentSettingsTab: "profile",
  setStudentSettingsTab: (tab) => set({ studentSettingsTab: tab }),
}));
