export interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  subject_id: string;
  topic_id: string;
  quiz_id: string;
}

export interface Subject {
  id: string;
  displayName: string;
  dbName: string;
}

export interface SubjectResult {
  correct: number;
  total: number;
  percentage: number;
  passed: boolean;
}

export interface QuizResults {
  subjectResults: Record<string, SubjectResult>;
  overallPassed: boolean;
  timestamp: string;
  attemptIds: Record<string, string>;
}

export interface QuizAttemptProps {
  quizData: {
    mode: string;
    subjects: Subject[];
    topics: string[];
    quizzes: any[];
    questions: Question[];
    timePerSubject: number;
    totalTime: number;
  };
  onComplete: (results: any) => void;
  onCancel: () => void;
}

export interface QuizHeaderProps {
  currentSubject: Subject;
  timeLeft: number;
  isSubjectCompleted: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  mode: string;
  disableActions?: boolean;
}

export interface SubjectNavigationProps {
  subjects: Subject[];
  quizzes: any[];
  currentSubjectIndex: number;
  completedSubjects: Set<number>;
  disabledSubjects?: boolean[];
  onSubjectChange: (index: number) => void;
}

export interface QuestionComponentProps {
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string;
  disabled?: boolean;
  onAnswerSelect: (questionId: string, answer: string) => void;
}

export interface QuizNavigationProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  isSubjectCompleted: boolean;
  disabled?: boolean;
  onQuestionSelect: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onAutoSubmit: () => void;
}

export interface ResultsPageProps {
  quizResults: QuizResults;
  quizData: QuizAttemptProps["quizData"];
  onComplete: (results: any) => void;
  onCancel: () => void;
}
