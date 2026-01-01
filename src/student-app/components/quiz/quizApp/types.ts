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
  grade: string;     
  gradeLabel: string;
}

export interface QuizResults {
  subjectResults: Record<string, SubjectResult>;
    overallPassed: boolean;
    overallGrade: string;      
    overallGradeLabel: string; 
    timestamp: string;
    attemptIds: Record<string, string>;
    studentAnswers: Record<string, string>;
}

export interface QuizAttemptProps {
  quizData: {
    mode: string;
    score: number;
    status: string;
    subjects: Subject[];
    topics: string[];
    quizzes: any[];
    questions: Question[];
    timePerSubject: number;
    totalTime: number;
  };
  onComplete: (results: any) => void;
  onCancel: () => void;
  setShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface QuizHeaderProps {
  currentSubject: Subject;
  timeLeft: number;
  isSubjectCompleted: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  mode: string;
  disableActions?: boolean;
  cheatingScore: number;
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
  setShowSideBar: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
}
