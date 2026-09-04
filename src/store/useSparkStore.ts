import { create } from "zustand";

export interface QuestionContext {
  questionText: string;
  options?: { [key: string]: string };
  studentAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  questionNumber?: number;
}

export interface StudentPerformanceContext {
  topicAccuracyPercent?: number;
  recentAttemptsCount?: number;
  recentScoreSummary?: string;
  weakTopics?: string[];
  commonMisconceptions?: string[];
}

export interface TutoringState {
  currentGuidanceLevel?: number; // 1 to 6
  guidanceLevelName?: string;
  hintsGiven?: number;
  lastMisconception?: string | null;
  studentStatus?: string;
}

export interface LearningContext {
  contextType?: "general_tutor" | "quiz_review" | "topic_study" | "past_questions" | "exam_prep";
  examination?: string; // e.g., "WAEC", "JAMB", "NECO", "BECE"
  gradeLevel?: string;  // e.g., "SSS 3", "JSS 2"
  subject?: string;     // e.g., "Mathematics", "Biology"
  topic?: string;       // e.g., "Quadratic Equations", "Photosynthesis"
  subtopic?: string;
  currentQuestion?: QuestionContext;
  performance?: StudentPerformanceContext;
  tutoringState?: TutoringState;
  sourceView?: string;
}

interface SparkState {
  isOpen: boolean;
  activeContext: LearningContext | null;
  pendingInitialPrompt: string | null;
  
  // Actions
  setIsOpen: (isOpen: boolean) => void;
  toggleSpark: () => void;
  openSpark: () => void;
  closeSpark: () => void;
  setContext: (context: LearningContext | null) => void;
  clearContext: () => void;
  openWithContext: (context: LearningContext, initialPrompt?: string) => void;
  consumePendingPrompt: () => string | null;
}

export const useSparkStore = create<SparkState>((set, get) => ({
  isOpen: false,
  activeContext: null,
  pendingInitialPrompt: null,

  setIsOpen: (isOpen) => set({ isOpen }),
  toggleSpark: () => set((state) => ({ isOpen: !state.isOpen })),
  openSpark: () => set({ isOpen: true }),
  closeSpark: () => set({ isOpen: false }),

  setContext: (context) => set({ activeContext: context }),
  clearContext: () => set({ activeContext: null, pendingInitialPrompt: null }),

  openWithContext: (context, initialPrompt) => {
    set({
      isOpen: true,
      activeContext: context,
      pendingInitialPrompt: initialPrompt || null,
    });
  },

  consumePendingPrompt: () => {
    const prompt = get().pendingInitialPrompt;
    if (prompt) {
      set({ pendingInitialPrompt: null });
    }
    return prompt;
  },
}));
