export type UserRole = 'student' | 'teacher';

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  schoolName: string;
  subject: string;
  avatar: string;
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "12A1"
  grade: string; // "Khối 10" | "Khối 11" | "Khối 12"
  academicYear: string; // e.g. "2026 - 2027"
  schoolName?: string; // e.g. "THPT Võ Thị Sáu"
  description?: string;
  createdAt: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  stt?: number; // Số thứ tự theo danh sách chuẩn (1, 2, 3... N)
  name: string;
  fullName?: string; // Họ và tên đầy đủ
  hoVaChuLot?: string; // Họ và chữ lót (ví dụ: "Trần Thái")
  ten?: string; // Tên (ví dụ: "An")
  lastName?: string; // Họ và chữ lót chuẩn: lấy từ trái qua ngoại trừ từ cuối cùng
  firstName?: string; // Tên chuẩn: từ cuối cùng
  studentCode?: string; // Mã học sinh (e.g. from vnEdu 2511404881)
  email: string;
  username?: string;
  password?: string;
  isAccountActive?: boolean;
  phone?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  dob?: string;
  avatar: string;
  level: number;
  badgeTitle: string;
  xp: number;
  xpToNextLevel: number;
  completionPercent: number;
  streakDays: number;
  rank: number;
  classId: string;
  className: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

export interface Lesson {
  id: string;
  title: string;
  chapter: string;
  order: number;
  durationMinutes: number;
  isLocked: boolean;
  videoUrl: string;
  videoType: 'youtube' | 'mp4';
  slideUrl?: string;
  slidePages?: string[];
  overview: string;
  learningOutcomes: string[];
  interactiveQuestions?: {
    prompt: string;
    answerKey: string;
  }[];
  reinforcementQuiz: QuizQuestion[];
  isCompleted?: boolean;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface TrueFalseItem {
  id: string; // 'a', 'b', 'c', 'd'
  label?: string; // 'a)', 'b)', 'c)', 'd)'
  content: string; // "Hàm số đồng biến trên khoảng..."
  correctAnswer: boolean; // true = Đúng, false = Sai
  explanation?: string;
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  partNumber?: 1 | 2 | 3; // 1: Trắc nghiệm 4 lựa chọn, 2: Trắc nghiệm Đúng/Sai, 3: Trả lời ngắn / Tự luận
  sectionTitle?: string;
  content: string;
  stimulus?: {
    type: 'table' | 'formula' | 'diagram' | 'text' | 'variation_table' | 'graph' | 'sign_table' | 'statistics' | 'geometry' | 'geometry_3d';
    data: string;
    caption?: string;
  };
  options?: string[]; // for multiple_choice
  correctAnswer?: number; // for MCQ (0, 1, 2, 3)
  trueFalseItems?: TrueFalseItem[]; // for true_false (Phần II)
  correctAnswerText?: string; // for short answer
  rubric?: string; // for essay
  points: number;
  difficulty: 'NB' | 'TH' | 'VD' | 'VDC';
  explanation?: string;
  variantCode?: string;
}

export interface ExamVariant {
  code: string;
  title: string;
  baseExamId: string;
  questions: ExamQuestion[];
}

export type GradeColumnType = 'DTX1' | 'DTX2' | 'GIUA_KY' | 'CUOI_KY';

export interface ExamTargetAssignment {
  type: 'class' | 'group' | 'custom_students';
  targetClassId?: string; // e.g. "class-12a1"
  targetClassName?: string; // e.g. "12A1"
  groupName?: string; // e.g. "Nhóm Ôn Thi ĐGNL", "Nhóm Bồi Dưỡng", "Nhóm Phụ Đạo"
  studentIds?: string[]; // IDs of assigned students
  assignedAt?: string;
  dueDate?: string;
  examPassword?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  gradeColumn: GradeColumnType;
  durationMinutes: number;
  isPublished: boolean;
  createdAt: string;
  dueDate: string;
  totalPoints: number;
  questions: ExamQuestion[];
  variants: Record<string, ExamVariant>; // variantCode -> ExamVariant
  assignedCodes: Record<string, string>; // studentId -> variantCode
  targetAssignment?: ExamTargetAssignment;
}

export interface SubmissionAnswer {
  questionId: string;
  type: QuestionType;
  value: string | number | Record<string, boolean>; // option index, text, or true/false map { a: true, b: false }
  attachmentUrl?: string;
  images?: string[]; // Photos of handwritten pages [page1, page2, ...]
}

export interface EssayGradingResult {
  score: number;
  maxPoints: number;
  percentage?: number;
  breakdown: {
    criterion: string;
    score: number;
    maxScore: number;
    comment?: string;
  }[];
  teacherRemarks: string;
  detailedComment?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  comparisonWithKey?: string;
  source?: string;
}

export interface ExamComplaint {
  id: string;
  submissionId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  className?: string;
  variantCode: string;
  createdAt: string;
  questionId?: string;
  questionNumber?: string;
  questionType?: string;
  complaintReason: string;
  studentEvidence?: string;
  status: 'pending' | 'accepted' | 'rejected';
  teacherFeedback?: string;
  adjustedScore?: number;
  originalScore: number;
  reviewedAt?: string;
}

export interface Submission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  variantCode: string;
  submittedAt: string;
  violationsCount: number;
  violationLogs: {
    timestamp: string;
    type: 'tab_switch' | 'window_blur';
    message: string;
  }[];
  answers: Record<string, SubmissionAnswer>;
  mcqScore: number;
  essayScore: number;
  totalScore: number;
  score?: number;
  status: 'pending_ai' | 'ai_graded' | 'confirmed';
  essayGrading?: EssayGradingResult;
  complaintId?: string;
  complaintStatus?: 'pending' | 'accepted' | 'rejected';
  teacherReviewNotes?: string;
}

export interface GradebookRecord {
  studentId: string;
  studentName: string;
  rollNumber: number;
  dtx1?: number;
  dtx2?: number;
  giuaKy?: number;
  cuoiKy?: number;
  averageScore: number;
  highestScore: number;
  history: {
    submissionId: string;
    examId: string;
    examTitle: string;
    variantCode: string;
    column: GradeColumnType;
    score: number;
    submittedAt: string;
  }[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  badgeTitle: string;
  xp: number;
  rank: number;
  perfectExamsCount: number;
}
