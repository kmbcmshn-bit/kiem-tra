import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamQuestion, Submission } from '../../types';
import confetti from 'canvas-confetti';
import { MathText } from '../math/MathText';
import { TextbookVariationTable } from '../math/TextbookVariationTable';
import { TextbookSignTable } from '../math/TextbookSignTable';
import { TextbookGraph } from '../math/TextbookGraph';
import { TextbookStatisticsTable } from '../math/TextbookStatisticsTable';
import { TextbookGeometry, GeometryType } from '../math/TextbookGeometry';
import { EssaySubmission } from './EssaySubmission';
import { getQuestionPartInfo } from '../../utils/examGenerator';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Send,
  FileCheck,
  Eye,
  Lock,
  Sparkles,
  HelpCircle,
  Upload,
  ArrowLeft,
  Info,
  Table,
  LineChart,
  BarChart3,
  RefreshCw,
  MessageSquareQuote,
  Save,
  Check,
  X,
  Keyboard,
  Calculator,
  CornerDownLeft
} from 'lucide-react';
import { MathVirtualKeyboard } from '../math/MathVirtualKeyboard';

interface ExamRoomProps {
  onBackToDashboard: () => void;
  onGoToHistory?: () => void;
}

export const ExamRoom: React.FC<ExamRoomProps> = ({ onBackToDashboard, onGoToHistory }) => {
  const {
    currentStudent,
    exam,
    submissions,
    addSubmission,
    addStudentXP,
    gradeEssayWithAI,
    saveActiveExamDraft,
    getActiveExamDraft,
    clearActiveExamDraft,
    submitComplaint,
    complaints,
  } = useApp();
  const [isAIGrading, setIsAIGrading] = useState<boolean>(false);

  if (!exam || !currentStudent) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-lg">
            Hiện Chưa Có Đề Thi Nào
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Giáo viên chưa tạo hoặc chưa phát hành đề thi trên hệ thống. Vui lòng quay lại Góc học tập hoặc liên hệ Thầy/Cô để biết thời gian mở phòng thi.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            Quay Lại Góc Học Tập
          </button>
        </div>
      </div>
    );
  }

  // Determine assigned variant code
  const assignedCode = exam.assignedCodes?.[currentStudent.id] || Object.keys(exam.variants || {})[0] || '101';
  const variant = exam.variants?.[assignedCode] || exam.variants?.['101'] || {
    code: assignedCode,
    title: exam.title,
    baseExamId: exam.id,
    questions: exam.questions || [],
  };

  const existingSubmission = submissions.find(
    s => s.examId === exam.id && s.studentId === currentStudent.id
  );

  // Check for saved draft if not submitted yet
  const [restoredBanner, setRestoredBanner] = useState<string | null>(() => {
    if (!existingSubmission && currentStudent && exam) {
      const draft = getActiveExamDraft(currentStudent.id, exam.id);
      if (draft && draft.answers && Object.keys(draft.answers).length > 0) {
        return `Đã khôi phục bài thi đang làm dở của em (${Object.keys(draft.answers).length} câu đã trả lời, thời gian còn lại: ${Math.floor((draft.timeLeftSeconds || 0) / 60)} phút). Em tiếp tục làm bài bình thường!`;
      }
    }
    return null;
  });

  // Complaint Modal states
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState<boolean>(false);
  const [complaintQuestionId, setComplaintQuestionId] = useState<string>('all');
  const [complaintReason, setComplaintReason] = useState<string>('');
  const [complaintEvidence, setComplaintEvidence] = useState<string>('');
  const [complaintSuccessMsg, setComplaintSuccessMsg] = useState<string>('');

  // Exam state
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    if (existingSubmission) return existingSubmission.answers || {};
    if (currentStudent && exam) {
      const draft = getActiveExamDraft(currentStudent.id, exam.id);
      if (draft && draft.answers) return draft.answers;
    }
    return {};
  });

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    if (existingSubmission) return 0;
    if (currentStudent && exam) {
      const draft = getActiveExamDraft(currentStudent.id, exam.id);
      if (draft && typeof draft.timeLeftSeconds === 'number' && draft.timeLeftSeconds > 0) {
        return draft.timeLeftSeconds;
      }
    }
    return exam.durationMinutes * 60;
  });

  const [isSubmitted, setIsSubmitted] = useState(!!existingSubmission);
  const [submissionResult, setSubmissionResult] = useState<Submission | null>(existingSubmission || null);
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Virtual Math Keyboard state
  const [activeKeyboardTarget, setActiveKeyboardTarget] = useState<{
    questionId: string;
    questionIndex: number;
    title: string;
  } | null>(null);
  const [isKeyboardDrawerOpen, setIsKeyboardDrawerOpen] = useState<boolean>(false);
  const shortAnswerInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Helper to insert math symbol directly into short answer input
  const insertSymbolIntoShortAnswer = (questionId: string, symbol: string) => {
    const inputEl = shortAnswerInputRefs.current[questionId];
    const currentVal = answers[questionId]?.value || '';
    if (!inputEl) {
      handleAnswerChange(questionId, 'short_answer', currentVal + symbol);
      return;
    }
    const start = inputEl.selectionStart ?? currentVal.length;
    const end = inputEl.selectionEnd ?? currentVal.length;
    const newVal = currentVal.substring(0, start) + symbol + currentVal.substring(end);
    handleAnswerChange(questionId, 'short_answer', newVal);
    setTimeout(() => {
      inputEl.focus();
      const pos = start + symbol.length;
      inputEl.setSelectionRange(pos, pos);
    }, 0);
  };

  // Anti-cheat monitoring state
  const [violationsCount, setViolationsCount] = useState<number>(() => {
    if (existingSubmission) return existingSubmission.violationsCount || 0;
    if (currentStudent && exam) {
      const draft = getActiveExamDraft(currentStudent.id, exam.id);
      if (draft && typeof draft.violationsCount === 'number') {
        return draft.violationsCount;
      }
    }
    return 0;
  });

  const [violationLogs, setViolationLogs] = useState<{ timestamp: string; type: 'tab_switch' | 'window_blur'; message: string }[]>(() => {
    if (existingSubmission) return existingSubmission.violationLogs || [];
    if (currentStudent && exam) {
      const draft = getActiveExamDraft(currentStudent.id, exam.id);
      if (draft && draft.violationLogs) {
        return draft.violationLogs;
      }
    }
    return [];
  });

  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [isLockedByAntiCheat, setIsLockedByAntiCheat] = useState<boolean>((existingSubmission?.violationsCount ?? 0) >= 3);

  // Selected question in focus
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(() => {
    if (currentStudent && exam && !existingSubmission) {
      const draft = getActiveExamDraft(currentStudent.id, exam.id);
      if (draft && typeof draft.selectedQuestionIndex === 'number') {
        return draft.selectedQuestionIndex;
      }
    }
    return 0;
  });

  // Auto-save draft on answers change or navigation
  useEffect(() => {
    if (isSubmitted || !currentStudent || !exam) return;
    saveActiveExamDraft(currentStudent.id, exam.id, {
      answers,
      timeLeftSeconds,
      selectedQuestionIndex,
      violationsCount,
      violationLogs,
      variantCode: assignedCode,
    });
  }, [answers, selectedQuestionIndex, violationsCount, isSubmitted]);

  // Periodic draft save for timer
  useEffect(() => {
    if (isSubmitted || !currentStudent || !exam) return;
    const interval = setInterval(() => {
      saveActiveExamDraft(currentStudent.id, exam.id, {
        answers,
        timeLeftSeconds,
        selectedQuestionIndex,
        violationsCount,
        violationLogs,
        variantCode: assignedCode,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [answers, timeLeftSeconds, selectedQuestionIndex, violationsCount, isSubmitted]);

  // Active stimulus question
  const currentQ = variant.questions[selectedQuestionIndex] || variant.questions[0];
  const currentQRef = useRef(currentQ);
  currentQRef.current = currentQ;

  // Anti-cheat exemption for handwritten photo capture / Essay question
  const [isPhotoCaptureActive, setIsPhotoCaptureActive] = useState<boolean>(false);
  const isExemptFromAntiCheatRef = useRef<boolean>(false);
  const exemptionUntilRef = useRef<number>(0);

  const startPhotoCaptureExemption = () => {
    setIsPhotoCaptureActive(true);
    isExemptFromAntiCheatRef.current = true;
    exemptionUntilRef.current = Date.now() + 10 * 60 * 1000; // 10 minutes grace period
  };

  const endPhotoCaptureExemption = () => {
    exemptionUntilRef.current = Date.now() + 60 * 1000; // 60s extra buffer
    setTimeout(() => {
      setIsPhotoCaptureActive(false);
      isExemptFromAntiCheatRef.current = false;
    }, 60000);
  };

  // Ref to track submitted state in event listeners without re-binding
  const isSubmittedRef = useRef(isSubmitted);
  isSubmittedRef.current = isSubmitted;

  const violationsCountRef = useRef(violationsCount);
  violationsCountRef.current = violationsCount;

  // Anti-cheat Event Listeners: visibilitychange and blur
  useEffect(() => {
    if (isSubmitted) return;

    const handleViolation = (type: 'tab_switch' | 'window_blur') => {
      if (isSubmittedRef.current) return;

      // DO NOT count violation if student is on Essay question, in photo capture mode, or within exemption window
      const isEssayQuestion = currentQRef.current?.type === 'essay';
      const isExempt =
        isExemptFromAntiCheatRef.current ||
        isEssayQuestion ||
        Date.now() < exemptionUntilRef.current;

      if (isExempt) {
        // Exemption active - do not register violation!
        return;
      }

      const newCount = violationsCountRef.current + 1;
      setViolationsCount(newCount);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN');
      const logMsg =
        type === 'tab_switch'
          ? `Chuyển tab trình duyệt trong lúc làm bài (Lần ${newCount}/3).`
          : `Nhấp chuột rời khỏi cửa sổ làm bài thi (Lần ${newCount}/3).`;

      setViolationLogs(prev => [...prev, { timestamp: timeStr, type, message: logMsg }]);

      if (newCount === 1) {
        setWarningMessage('Cảnh báo vi phạm lần 1/3: Bạn vừa rời khỏi cửa sổ làm bài thi. Vui lòng tập trung, mọi hành vi chuyển tab đều được giám sát và lưu lại!');
        setShowWarningModal(true);
      } else if (newCount === 2) {
        setWarningMessage('CẢNH BÁO NGHIÊM KHẮC LẦN 2/3! Nếu bạn tiếp tục chuyển tab hoặc rời khỏi cửa sổ một lần nữa, hệ thống sẽ TỰ ĐỘNG THU BÀI NGAY LẬP TỨC!');
        setShowWarningModal(true);
      } else if (newCount >= 3) {
        setIsLockedByAntiCheat(true);
        setWarningMessage('VI PHẠM QUY CHẾ THI LẦN 3/3! Hệ thống đã tự động khóa bài làm và thu bài nộp cưỡng bức về phía giáo viên!');
        setShowWarningModal(true);
        // Auto-submit immediately
        handleAutoSubmit(newCount);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('tab_switch');
      }
    };

    const onWindowBlur = () => {
      handleViolation('window_blur');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [isSubmitted]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || isLockedByAntiCheat) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit(violationsCountRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isLockedByAntiCheat]);

  // Answer handler
  const handleAnswerChange = (qId: string, type: ExamQuestion['type'], val: any, images?: string[]) => {
    if (isSubmitted || isLockedByAntiCheat) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: {
        questionId: qId,
        type,
        value: val,
        images: images !== undefined ? images : prev[qId]?.images || [],
      },
    }));
  };

  // Auto-submit or manual submit
  const handleAutoSubmit = (violationC: number = violationsCount) => {
    if (isSubmitted) return;
    doSubmit(violationC);
  };

  const doSubmit = (vCount: number) => {
    // Grade MCQ & True/False automatically according to this variant's answer keys
    let mcqEarned = 0;
    variant.questions.forEach(q => {
      if (q.type === 'multiple_choice') {
        const studentAns = answers[q.id]?.value;
        if (studentAns !== undefined && studentAns === q.correctAnswer) {
          mcqEarned += q.points;
        }
      } else if (q.type === 'true_false') {
        const studentAns = (answers[q.id]?.value || {}) as Record<string, boolean>;
        const items = q.trueFalseItems || [];
        let correctCount = 0;
        items.forEach(it => {
          if (studentAns[it.id] !== undefined && studentAns[it.id] === it.correctAnswer) {
            correctCount++;
          }
        });
        // Quy chế tính điểm trắc nghiệm Đúng/Sai chuẩn Bộ GD&ĐT:
        // Đúng 1 ý: 0.1 điểm (10% số điểm của câu)
        // Đúng 2 ý: 0.25 điểm (25% số điểm của câu)
        // Đúng 3 ý: 0.5 điểm (50% số điểm của câu)
        // Đúng 4 ý: 1.0 điểm (100% số điểm của câu)
        let ratio = 0;
        if (correctCount === 1) ratio = 0.1;
        else if (correctCount === 2) ratio = 0.25;
        else if (correctCount === 3) ratio = 0.5;
        else if (correctCount >= 4) ratio = 1.0;

        mcqEarned += +(q.points * ratio).toFixed(2);
      } else if (q.type === 'short_answer') {
        const studentAns = String(answers[q.id]?.value || '').trim().toLowerCase();
        const expected = String(q.correctAnswerText || '').trim().toLowerCase();
        if (studentAns === expected) {
          mcqEarned += q.points;
        }
      }
    });

    const newSub: Submission = {
      id: `sub-${currentStudent.id}-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentAvatar: currentStudent.avatar,
      variantCode: assignedCode,
      submittedAt: new Date().toISOString(),
      violationsCount: vCount,
      violationLogs,
      answers,
      mcqScore: mcqEarned,
      essayScore: 0,
      totalScore: mcqEarned,
      status: 'pending_ai',
    };

    addSubmission(newSub);
    setSubmissionResult(newSub);
    setIsSubmitted(true);
    clearActiveExamDraft(currentStudent.id, exam.id);

    // Auto trigger AI grading for essay question
    const hasEssay = variant.questions.some((q: ExamQuestion) => q.type === 'essay');
    if (hasEssay) {
      setIsAIGrading(true);
      gradeEssayWithAI(newSub.id)
        .then((res) => {
          setIsAIGrading(false);
          if (res.success && res.data) {
            setSubmissionResult(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                essayScore: res.data!.score,
                totalScore: +(prev.mcqScore + res.data!.score).toFixed(2),
                status: 'ai_graded',
                essayGrading: res.data,
              };
            });
          }
        })
        .catch(() => {
          setIsAIGrading(false);
        });
    }

    // Award XP for completing test
    addStudentXP(currentStudent.id, 200 + Math.round(mcqEarned * 20));

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* EXAM ROOM HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang học tập</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {exam.title}
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              {exam.subject}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              MÃ ĐỀ CÁ NHÂN HÓA: ĐỀ #{assignedCode}
            </span>
            <span>Thí sinh: <strong className="text-slate-900">{currentStudent.name}</strong></span>
            <span>Cột điểm: <strong className="text-slate-900">{exam.gradeColumn}</strong></span>
            {!isSubmitted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                <Save className="w-3 h-3 text-emerald-600" />
                <span>Tự động lưu nháp liên tục</span>
              </span>
            )}
          </div>
        </div>

        {/* Right side: Timer & Anti-cheat status */}
        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto justify-between">
          {!isSubmitted && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-mono font-bold ${
              timeLeftSeconds < 300
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-slate-900 text-white border-slate-800'
            }`}>
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          )}

          {/* Anti-cheat status indicator & Essay photo exemption badge */}
          <div className="flex flex-col items-end gap-1.5">
            {(currentQ.type === 'essay' || isPhotoCaptureActive) && !isSubmitted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-300 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>📷 Phần Tự luận: Miễn trừ vi phạm để chụp ảnh bài làm</span>
              </span>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              violationsCount === 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : violationsCount < 3
                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>
                Giám sát vi phạm: {violationsCount}/3 lần
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restored Session Banner */}
      {restoredBanner && !isSubmitted && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{restoredBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setRestoredBanner(null)}
            className="p-1 hover:bg-amber-200/60 rounded-lg text-amber-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* RESULT VIEW (If already submitted) */}
      {isSubmitted && submissionResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Đã Nộp Bài Thi Thành Công!
            </h3>
            <p className="text-xs text-slate-600">
              Bài thi Mã đề <strong className="text-emerald-700">#{assignedCode}</strong> của thí sinh <strong>{currentStudent.name}</strong> đã được ghi nhận vào cơ sở dữ liệu.
            </p>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Điểm Trắc Nghiệm</div>
                <div className="text-xl font-bold text-emerald-700">
                  {submissionResult.mcqScore.toFixed(1)} đ
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Điểm Tự Luận (AI)</div>
                <div className="text-xl font-bold text-slate-700">
                  {isAIGrading ? (
                    <span className="text-xs text-emerald-600 flex items-center justify-center gap-1 font-semibold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Đang chấm...
                    </span>
                  ) : submissionResult.essayScore > 0 || submissionResult.essayGrading ? (
                    <span className="text-emerald-700">
                      {submissionResult.essayScore.toFixed(2)} đ
                    </span>
                  ) : (
                    'Chờ AI chấm'
                  )}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Tổng Điểm Tạm Tính</div>
                <div className="text-xl font-bold text-emerald-800">
                  {submissionResult.totalScore.toFixed(2)} / 10.0 đ
                </div>
              </div>
            </div>

            {/* AI Grading Status Banner */}
            {isAIGrading && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="text-left space-y-0.5">
                  <div className="font-bold text-emerald-950">
                    Trợ Lý AI Đang Phân Tích Bài Làm & Đối Chiếu Đáp Án Chuẩn...
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Hệ thống đang quét các bước giải, đối chiếu điều kiện, đạo hàm và kết luận đáp số với lời giải chuẩn SGK.
                  </p>
                </div>
              </div>
            )}

            {/* Comprehensive AI Essay Analysis Card */}
            {submissionResult.essayGrading && (
              <div className="text-left p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border-2 border-emerald-300/80 text-xs space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-950">
                        Kết Quả AI Chấm Điểm Tự Luận & Đối Chiếu Đáp Án Chuẩn
                      </h4>
                      <span className="text-[11px] text-emerald-700">
                        {submissionResult.essayGrading.source === 'gemini_vision'
                          ? 'Đã phân tích ảnh chụp bài làm viết tay qua Gemini Vision'
                          : 'Đã phân tích nội dung lời giải chi tiết qua Gemini AI'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-800 font-mono">
                      {submissionResult.essayGrading.score} / {submissionResult.essayGrading.maxPoints} đ
                    </div>
                    {submissionResult.essayGrading.percentage !== undefined && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Đạt {submissionResult.essayGrading.percentage}% chuẩn
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Comparison Against Standard Solution */}
                {submissionResult.essayGrading.comparisonWithKey && (
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Phân Tích Đối Chiếu Với Đáp Án Chuẩn SGK:</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed text-xs">
                      {submissionResult.essayGrading.comparisonWithKey}
                    </p>
                  </div>
                )}

                {/* Detailed Pedagogical Comment */}
                {submissionResult.essayGrading.detailedComment && (
                  <div className="p-3.5 rounded-xl bg-emerald-100/40 border border-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lời Nhận Xét Chi Tiết Của AI & Thầy Cô:</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed italic text-xs">
                      "{submissionResult.essayGrading.detailedComment}"
                    </p>
                  </div>
                )}

                {/* Step-by-step breakdown */}
                {submissionResult.essayGrading.breakdown && submissionResult.essayGrading.breakdown.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-800 text-[11px] block">
                      Chi Tiết Điểm Từng Tiêu Chí Theo Barem:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {submissionResult.essayGrading.breakdown.map((item, bIdx) => (
                        <div key={bIdx} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 text-left">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-[11px] truncate" title={item.criterion}>
                              {item.criterion}
                            </span>
                            <span className="font-mono font-bold text-emerald-700 text-xs">
                              {item.score}/{item.maxScore}đ
                            </span>
                          </div>
                          {item.comment && (
                            <p className="text-[10px] text-slate-600 leading-tight">
                              {item.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {submissionResult.essayGrading.strengths && submissionResult.essayGrading.strengths.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                      <span className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Điểm em làm đúng:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                        {submissionResult.essayGrading.strengths.map((str, sIdx) => (
                          <li key={sIdx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {submissionResult.essayGrading.weaknesses && submissionResult.essayGrading.weaknesses.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Điểm cần rút kinh nghiệm:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                        {submissionResult.essayGrading.weaknesses.map((wk, wIdx) => (
                          <li key={wIdx}>{wk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Complaint status if exists */}
            {submissionResult && (() => {
              const activeComplaint = complaints.find(c => c.submissionId === submissionResult.id);
              if (!activeComplaint) return null;
              return (
                <div className={`p-4 rounded-xl text-xs text-left border flex items-start gap-3 ${
                  activeComplaint.status === 'accepted'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : activeComplaint.status === 'rejected'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}>
                  <MessageSquareQuote className="w-5 h-5 shrink-0 mt-0.5 text-amber-700" />
                  <div className="space-y-1 w-full">
                    <div className="font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>Đơn Khiếu Nại & Phúc Khảo:</span>
                        <span className="font-semibold text-slate-600">({activeComplaint.questionNumber || 'Toàn bài'})</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                        activeComplaint.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : activeComplaint.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {activeComplaint.status === 'accepted'
                          ? 'Đã Chấp Thuận (+điểm)'
                          : activeComplaint.status === 'rejected'
                          ? 'Đã Phản Hồi (Giữ nguyên)'
                          : 'Đang Chờ Thầy/Cô Xem Xét'}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>Lý do:</strong> {activeComplaint.complaintReason}
                    </p>
                    {activeComplaint.teacherFeedback && (
                      <div className="text-emerald-950 bg-white/80 p-2.5 rounded-lg border border-emerald-200 mt-1 space-y-0.5">
                        <div className="font-bold text-[11px] text-emerald-800">Lời phê của Giáo viên:</div>
                        <p className="italic">"{activeComplaint.teacherFeedback}"</p>
                        {activeComplaint.adjustedScore !== undefined && (
                          <div className="font-bold text-emerald-700 text-xs pt-0.5">
                            Điểm cập nhật mới: {activeComplaint.adjustedScore.toFixed(2)} điểm
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
              >
                Quay lại Bảng Điều Khiển
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsComplaintModalOpen(true);
                  setComplaintSuccessMsg('');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <MessageSquareQuote className="w-4 h-4 text-amber-700" />
                <span>Khiếu Nại Chấm Điểm Nếu Sai</span>
              </button>

              {onGoToHistory && (
                <button
                  type="button"
                  onClick={onGoToHistory}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Xem Chi Tiết Bài Làm & Lời Giải Chuẩn</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXAM WORKSPACE - DIRECT IN-QUESTION MATHEMATICAL VISUALS */}
      {!isSubmitted && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quick Question Navigator Bar - Organized by 3 Parts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 sticky top-4 z-20 backdrop-blur-md bg-white/95">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Cấu trúc 3 Phần (GDPT 2018):</span>
                </span>

                {/* Font Size Selector Toolbar */}
                <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 hidden sm:inline">
                    Cỡ chữ:
                  </span>
                  <button
                    type="button"
                    onClick={() => setFontSizeLevel('normal')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      fontSizeLevel === 'normal'
                        ? 'bg-white text-emerald-900 shadow-2xs font-extrabold border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Cỡ chữ Chuẩn (16px)"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSizeLevel('large')}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      fontSizeLevel === 'large'
                        ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Cỡ chữ Lớn (18px - Khuyên dùng)"
                  >
                    A+
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSizeLevel('xlarge')}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      fontSizeLevel === 'xlarge'
                        ? 'bg-emerald-700 text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Cỡ chữ Rất Lớn (20px)"
                  >
                    A++
                  </button>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-600 flex items-center gap-3">
                <span>
                  Đã làm: <strong className="text-emerald-700">{Object.keys(answers).length}</strong>/{variant.questions.length} câu
                </span>
                <button
                  type="button"
                  onClick={() => doSubmit(violationsCount)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Nộp bài</span>
                </button>
              </div>
            </div>

            {/* Segmented Question Numbers by 3 Parts */}
            <div className="flex flex-wrap items-center gap-4 text-xs overflow-x-auto pb-1">
              {/* Part 1 Group */}
              <div className="flex items-center gap-1.5 bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-200/60">
                <span className="text-[11px] font-bold text-emerald-800 px-1">Phần I (Trắc nghiệm):</span>
                {variant.questions.map((q, idx) => {
                  const info = getQuestionPartInfo(q, idx);
                  if (info.partNumber !== 1) return null;
                  const isAnswered = answers[q.id]?.value !== undefined;
                  const isSelected = selectedQuestionIndex === idx;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setSelectedQuestionIndex(idx);
                        const el = document.getElementById(`question-card-${idx}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/30 scale-105'
                          : isAnswered
                          ? 'bg-emerald-200 text-emerald-950 font-bold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Part 2 Group */}
              <div className="flex items-center gap-1.5 bg-sky-50/70 p-1.5 rounded-xl border border-sky-200/60">
                <span className="text-[11px] font-bold text-sky-800 px-1">Phần II (Đúng/Sai):</span>
                {variant.questions.map((q, idx) => {
                  const info = getQuestionPartInfo(q, idx);
                  if (info.partNumber !== 2) return null;
                  const isAnswered = answers[q.id]?.value !== undefined;
                  const isSelected = selectedQuestionIndex === idx;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setSelectedQuestionIndex(idx);
                        const el = document.getElementById(`question-card-${idx}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-sky-700 text-white shadow-xs ring-2 ring-sky-600/30 scale-105'
                          : isAnswered
                          ? 'bg-sky-200 text-sky-950 font-bold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Part 3 Group */}
              <div className="flex items-center gap-1.5 bg-amber-50/70 p-1.5 rounded-xl border border-amber-200/60">
                <span className="text-[11px] font-bold text-amber-800 px-1">Phần III (Tự luận / Trả lời ngắn):</span>
                {variant.questions.map((q, idx) => {
                  const info = getQuestionPartInfo(q, idx);
                  if (info.partNumber !== 3) return null;
                  const isAnswered = answers[q.id]?.value !== undefined;
                  const isSelected = selectedQuestionIndex === idx;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setSelectedQuestionIndex(idx);
                        const el = document.getElementById(`question-card-${idx}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-amber-700 text-white shadow-xs ring-2 ring-amber-600/30 scale-105'
                          : isAnswered
                          ? 'bg-amber-200 text-amber-950 font-bold'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Questions Detailed Body */}
          <div className="space-y-6">
            {variant.questions.map((q, qIndex) => {
              const isCurrent = selectedQuestionIndex === qIndex;
              const currentAnswer = answers[q.id]?.value;
              const partInfo = getQuestionPartInfo(q, qIndex);

              // Check if this question is the first of its part to display Section Banner
              const prevQ = qIndex > 0 ? variant.questions[qIndex - 1] : null;
              const prevPartInfo = prevQ ? getQuestionPartInfo(prevQ, qIndex - 1) : null;
              const isFirstOfPart = qIndex === 0 || (prevPartInfo && prevPartInfo.partNumber !== partInfo.partNumber);

              return (
                <React.Fragment key={q.id}>
                  {/* Distinct Section Banner for Parts */}
                  {isFirstOfPart && (
                    <div
                      className={`p-4 rounded-2xl border shadow-xs space-y-1 ${
                        partInfo.partNumber === 1
                          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border-emerald-300'
                          : partInfo.partNumber === 2
                          ? 'bg-gradient-to-r from-sky-50 via-indigo-50 to-slate-50 border-sky-300'
                          : 'bg-gradient-to-r from-amber-50 via-orange-50 to-slate-50 border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-white text-xs font-bold ${
                            partInfo.partNumber === 1
                              ? 'bg-emerald-700'
                              : partInfo.partNumber === 2
                              ? 'bg-sky-700'
                              : 'bg-amber-700'
                          }`}
                        >
                          {partInfo.partRoman}
                        </span>
                        <span
                          className={
                            partInfo.partNumber === 1
                              ? 'text-emerald-950 font-extrabold'
                              : partInfo.partNumber === 2
                              ? 'text-sky-950 font-extrabold'
                              : 'text-amber-950 font-extrabold'
                          }
                        >
                          {partInfo.partTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 pl-1 leading-relaxed">
                        {partInfo.partDescription}
                      </p>
                    </div>
                  )}

                  <div
                    id={`question-card-${qIndex}`}
                    className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-xs space-y-4 ${
                      isCurrent
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                            Câu {qIndex + 1}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              partInfo.partNumber === 1
                                ? 'bg-emerald-100 text-emerald-800'
                                : partInfo.partNumber === 2
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {partInfo.partRoman}: {q.type === 'multiple_choice'
                              ? 'Trắc nghiệm 4 lựa chọn'
                              : q.type === 'true_false'
                              ? 'Trắc nghiệm Đúng / Sai'
                              : q.type === 'short_answer'
                              ? 'Trả lời ngắn'
                              : 'Tự luận viết tay'}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {q.points} điểm
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Mã đề #{assignedCode}
                          </span>
                        </div>
                        <h4
                          className={`font-bold text-slate-900 leading-relaxed pt-1 ${
                            fontSizeLevel === 'xlarge'
                              ? 'text-xl sm:text-2xl'
                              : fontSizeLevel === 'large'
                              ? 'text-lg sm:text-xl'
                              : 'text-base sm:text-lg'
                          }`}
                        >
                          <MathText
                            content={q.content}
                            size={fontSizeLevel === 'xlarge' ? 'xl' : fontSizeLevel === 'large' ? 'lg' : 'md'}
                          />
                        </h4>
                      </div>
                    </div>

                    {/* BẢNG BIẾN THIÊN, ĐỒ THỊ, BẢNG XÉT DẤU, BẢNG THỐNG KÊ HIỂN THỊ CHUẨN SGK GDPT 2018 */}
                    {(q.stimulus?.type === 'table' || q.stimulus?.type === 'variation_table' || q.content.toLowerCase().includes('bảng biến thiên')) && (
                      <div className="my-3">
                        <TextbookVariationTable
                          cValue={2 + (Number(assignedCode) % 6)}
                          data={{
                            xValues: ['-\\infty', '0', '2', '+\\infty'],
                            yPrimeValues: ['+', '0', '-', '0', '+'],
                            caption: q.stimulus?.caption || `Bảng biến thiên tương ứng câu hỏi ${qIndex + 1} (Mã đề #${assignedCode})`,
                          }}
                          fontSize={fontSizeLevel}
                        />
                      </div>
                    )}

                    {(q.stimulus?.type === 'diagram' || q.stimulus?.type === 'graph' || q.content.toLowerCase().includes('đồ thị')) && (
                      <div className="my-3">
                        <TextbookGraph
                          cValue={2 + (Number(assignedCode) % 4)}
                          type={q.content.toLowerCase().includes('tiệm cận') ? 'rational' : q.content.toLowerCase().includes('lượng giác') || q.content.toLowerCase().includes('sin') ? 'trig' : 'cubic'}
                          title={q.stimulus?.caption || `Đồ thị hàm số tương ứng câu hỏi ${qIndex + 1} (Mã đề #${assignedCode})`}
                        />
                      </div>
                    )}

                    {(q.stimulus?.type === 'sign_table' || q.content.toLowerCase().includes('bảng xét dấu')) && (
                      <div className="my-3">
                        <TextbookSignTable
                          data={{
                            variable: 'x',
                            expression: "f'(x)",
                            roots: [
                              { value: '-\\infty' },
                              { value: '-1' },
                              { value: '2' },
                              { value: '+\\infty' },
                            ],
                            signs: ['+', '-', '+'],
                            caption: `Bảng xét dấu đạo hàm f'(x) tương ứng câu hỏi ${qIndex + 1} (Mã đề #${assignedCode})`,
                          }}
                        />
                      </div>
                    )}

                    {(q.stimulus?.type === 'statistics' || q.content.toLowerCase().includes('bảng thống kê') || q.content.toLowerCase().includes('mẫu số liệu ghép nhóm') || q.content.toLowerCase().includes('bảng phân bố tần số')) && (
                      <div className="my-3">
                        <TextbookStatisticsTable
                          title={`Bảng dữ liệu mẫu ghép nhóm tương ứng câu hỏi ${qIndex + 1} (Mã đề #${assignedCode})`}
                        />
                      </div>
                    )}

                    {(q.stimulus?.type === 'geometry' || q.stimulus?.type === 'geometry_3d' || q.content.toLowerCase().includes('hình chóp') || q.content.toLowerCase().includes('lăng trụ') || q.content.toLowerCase().includes('hình hộp') || q.content.toLowerCase().includes('hình nón') || q.content.toLowerCase().includes('hình trụ') || q.content.toLowerCase().includes('mặt cầu')) && (
                      <div className="my-3">
                        {(() => {
                          const c = q.content.toLowerCase();
                          let geomType: GeometryType = 'pyramid_quad';
                          if (c.includes('lăng trụ')) geomType = 'prism_triangle';
                          else if (c.includes('chóp') && (c.includes('tam giác') || c.includes('s.abc'))) geomType = 'pyramid_triangle';
                          else if (c.includes('chóp')) geomType = 'pyramid_quad';
                          else if (c.includes('hộp') || c.includes('lập phương')) geomType = 'cuboid';
                          else if (c.includes('nón')) geomType = 'cone';
                          else if (c.includes('trụ')) geomType = 'cylinder';
                          else if (c.includes('cầu')) geomType = 'sphere';
                          else if (c.includes('tam giác')) geomType = 'triangle_plane';
                          else if (c.includes('đường tròn')) geomType = 'circle_plane';
                          return (
                            <TextbookGeometry
                              type={geomType}
                              title={q.stimulus?.caption || `Hình vẽ hình học chuẩn SGK cho câu hỏi ${qIndex + 1}`}
                            />
                          );
                        })()}
                      </div>
                    )}

                    {/* Question Input Type 1: Multiple Choice (Phần I) */}
                    {q.type === 'multiple_choice' && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                          Chọn một phương án đúng (A, B, C hoặc D):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options?.map((opt, optIdx) => {
                            const isChecked = currentAnswer === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleAnswerChange(q.id, 'multiple_choice', optIdx)}
                                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-600 shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300 hover:bg-slate-50'
                                }`}
                              >
                                <span
                                  className={`flex-1 pr-2 ${
                                    fontSizeLevel === 'xlarge'
                                      ? 'text-lg sm:text-xl'
                                      : fontSizeLevel === 'large'
                                      ? 'text-base sm:text-lg font-medium'
                                      : 'text-sm sm:text-base'
                                  }`}
                                >
                                  <MathText
                                    content={opt}
                                    size={fontSizeLevel === 'xlarge' ? 'lg' : fontSizeLevel === 'large' ? 'md' : 'sm'}
                                  />
                                </span>
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isChecked
                                      ? 'border-emerald-600 bg-emerald-600 text-white'
                                      : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Question Input Type 2: True / False (Phần II - Mỗi câu gồm 4 ý a, b, c, d) */}
                    {q.type === 'true_false' && (
                      <div className="space-y-3 pt-2">
                        <div className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-between">
                          <span>Thí sinh chọn [Đúng] hoặc [Sai] cho từng khẳng định bên dưới:</span>
                          <span className="text-xs text-sky-800 font-bold bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                            Đã làm: {Object.keys(currentAnswer || {}).length} / {(q.trueFalseItems || []).length || 4} ý
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                          {((q.trueFalseItems && q.trueFalseItems.length > 0) ? q.trueFalseItems : [
                            { id: 'a', label: 'a)', content: 'Khẳng định ý a...', correctAnswer: true },
                            { id: 'b', label: 'b)', content: 'Khẳng định ý b...', correctAnswer: false },
                            { id: 'c', label: 'c)', content: 'Khẳng định ý c...', correctAnswer: true },
                            { id: 'd', label: 'd)', content: 'Khẳng định ý d...', correctAnswer: false },
                          ]).map((item) => {
                            const itemVal = (currentAnswer || {})[item.id];
                            return (
                              <div
                                key={item.id}
                                className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <span className="font-bold text-sky-800 shrink-0 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 text-sm">
                                    {item.label || `${item.id})`}
                                  </span>
                                  <div
                                    className={`leading-relaxed pt-0.5 flex-1 ${
                                      fontSizeLevel === 'xlarge'
                                        ? 'text-lg sm:text-xl font-medium'
                                        : fontSizeLevel === 'large'
                                        ? 'text-base sm:text-lg font-medium'
                                        : 'text-sm sm:text-base'
                                    }`}
                                  >
                                    <MathText
                                      content={item.content}
                                      size={fontSizeLevel === 'xlarge' ? 'lg' : fontSizeLevel === 'large' ? 'md' : 'sm'}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = { ...(currentAnswer || {}), [item.id]: true };
                                      handleAnswerChange(q.id, 'true_false', updated);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                      itemVal === true
                                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30 scale-105'
                                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                                    }`}
                                  >
                                    Đúng
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = { ...(currentAnswer || {}), [item.id]: false };
                                      handleAnswerChange(q.id, 'true_false', updated);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                      itemVal === false
                                        ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/30 scale-105'
                                        : 'bg-slate-100 hover:bg-rose-50 text-slate-700 border border-slate-200'
                                    }`}
                                  >
                                    Sai
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Question Input Type 3: Short Answer (Phần III) */}
                    {q.type === 'short_answer' && (
                      <div className="pt-2 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-semibold text-slate-700 block">
                            Nhập kết quả số hoặc biểu thức ngắn gọn:
                          </label>
                          <span className="text-[11px] text-slate-500">
                            Hỗ trợ số nguyên, phân số, số thập phân, π, e, căn...
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <div className="relative flex-1 min-w-[220px] max-w-md">
                            <input
                              ref={(el) => {
                                shortAnswerInputRefs.current[q.id] = el;
                              }}
                              type="text"
                              value={currentAnswer || ''}
                              onFocus={() => {
                                setActiveKeyboardTarget({
                                  questionId: q.id,
                                  questionIndex: qIndex,
                                  title: `Câu ${qIndex + 1} (Trả lời ngắn)`,
                                });
                              }}
                              onChange={(e) => handleAnswerChange(q.id, 'short_answer', e.target.value)}
                              placeholder="Ví dụ: 5, -2/3, π/2, √3 hoặc e^2"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono bg-white shadow-2xs"
                            />
                          </div>

                          {/* Button to open full math virtual keyboard */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveKeyboardTarget({
                                questionId: q.id,
                                questionIndex: qIndex,
                                title: `Câu ${qIndex + 1} (Trả lời ngắn)`,
                              });
                              setIsKeyboardDrawerOpen(true);
                              shortAnswerInputRefs.current[q.id]?.focus();
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              isKeyboardDrawerOpen && activeKeyboardTarget?.questionId === q.id
                                ? 'bg-emerald-700 text-white ring-2 ring-emerald-500/40'
                                : 'bg-slate-800 hover:bg-slate-900 text-slate-100 hover:text-white border border-slate-700'
                            }`}
                            title="Mở bàn phím ảo toán học có đầy đủ π, e, số mũ, căn, điều hướng"
                          >
                            <Keyboard className="w-4 h-4 text-emerald-400" />
                            <span>Bàn phím toán</span>
                          </button>

                          {currentAnswer && (
                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhập đáp số
                            </span>
                          )}
                        </div>

                        {/* Quick Symbols Strip for instant 1-click insertion */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1 shrink-0">
                            Chèn nhanh:
                          </span>
                          {[
                            { label: 'π', val: 'π', highlight: true, title: 'Số Pi' },
                            { label: 'e', val: 'e', highlight: true, title: 'Số Euler' },
                            { label: '√', val: '√', title: 'Căn bậc hai' },
                            { label: 'x²', val: '²', title: 'Bình phương' },
                            { label: 'x³', val: '³', title: 'Lập phương' },
                            { label: '^', val: '^', title: 'Mũ' },
                            { label: '/', val: '/', title: 'Phân số / chia' },
                            { label: '±', val: '±', title: 'Cộng trừ' },
                            { label: '(', val: '(', title: 'Mở ngoặc' },
                            { label: ')', val: ')', title: 'Đóng ngoặc' },
                            { label: '=', val: '=', title: 'Bằng' },
                            { label: '-', val: '-', title: 'Dấu trừ' },
                          ].map((sym, symIdx) => (
                            <button
                              key={symIdx}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => insertSymbolIntoShortAnswer(q.id, sym.val)}
                              title={sym.title}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95 ${
                                sym.highlight
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-serif'
                                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {sym.label}
                            </button>
                          ))}
                        </div>

                        {/* KaTeX Live Math Preview if current answer is not empty */}
                        {currentAnswer && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                            <span className="text-[11px] font-medium text-slate-500 shrink-0">
                              Hiển thị công thức:
                            </span>
                            <div className="font-mono text-emerald-800 font-bold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                              <MathText content={currentAnswer} inline size="md" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Input Type 4: Essay with Camera & Text (Phần III) */}
                    {q.type === 'essay' && (
                      <EssaySubmission
                        questionId={q.id}
                        textValue={currentAnswer || ''}
                        imagesValue={answers[q.id]?.images || []}
                        onTextChange={(val) => handleAnswerChange(q.id, 'essay', val)}
                        onImagesChange={(imgs) => handleAnswerChange(q.id, 'essay', currentAnswer || '', imgs)}
                        onStartPhotoCapture={startPhotoCaptureExemption}
                        onEndPhotoCapture={endPhotoCaptureExemption}
                        disabled={isSubmitted || isLockedByAntiCheat}
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Bottom Submit Action */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 text-center sm:text-left">
              Đã hoàn thành <strong className="text-emerald-700 text-sm">{Object.keys(answers).length}</strong> / {variant.questions.length} câu hỏi của Đề thi #{assignedCode}.
            </div>

            <button
              type="button"
              onClick={() => doSubmit(violationsCount)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Nộp Bài Thi Ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* ANTI-CHEAT WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 text-center">
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
              violationsCount >= 3 ? 'bg-rose-100 text-rose-600 animate-bounce' : 'bg-amber-100 text-amber-600'
            }`}>
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {violationsCount >= 3 ? 'ĐÃ KHÓA BÀI THI - THU BÀI TỰ ĐỘNG' : 'CẢNH BÁO VI PHẠM QUY CHẾ THI!'}
              </h3>
              <div className="text-xs font-bold text-rose-600">
                Hệ thống ghi nhận vi phạm: {violationsCount}/3 lần
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {warningMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                violationsCount >= 3
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {violationsCount >= 3 ? 'Đã hiểu và xác nhận nộp bài' : 'Tôi cam kết tập trung làm bài thi'}
            </button>
          </div>
        </div>
      )}

      {/* COMPLAINT / APPEAL MODAL */}
      {isComplaintModalOpen && submissionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-900">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Đơn Khiếu Nại & Phúc Khảo Điểm</h3>
                  <p className="text-[11px] text-slate-500">Gửi trực tiếp đến Thầy/Cô để chấm phúc khảo lại</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComplaintModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {complaintSuccessMsg ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-900 text-xs space-y-3 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div className="font-bold text-base text-emerald-950">{complaintSuccessMsg}</div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Thầy/Cô đã nhận được thông báo khiếu nại của em. Thầy/Cô sẽ đối chiếu lại bài làm với đáp án chuẩn và phản hồi trực tiếp vào tài khoản của em.
                </p>
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Đã Hiểu & Đóng
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!complaintReason.trim()) return;

                  const qObj = variant.questions.find(q => q.id === complaintQuestionId);
                  const qNum = qObj ? `Câu ${variant.questions.indexOf(qObj) + 1} (${qObj.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm'})` : 'Toàn bộ bài thi';

                  submitComplaint({
                    submissionId: submissionResult.id,
                    examId: exam.id,
                    examTitle: exam.title,
                    studentId: currentStudent.id,
                    studentName: currentStudent.name,
                    studentAvatar: currentStudent.avatar,
                    className: currentStudent.className || 'Toán THPT',
                    variantCode: assignedCode,
                    questionId: complaintQuestionId === 'all' ? undefined : complaintQuestionId,
                    questionNumber: qNum,
                    questionType: qObj?.type || 'general',
                    complaintReason: complaintReason.trim(),
                    studentEvidence: complaintEvidence.trim(),
                    originalScore: submissionResult.totalScore,
                  });

                  setComplaintSuccessMsg('Gửi đơn khiếu nại thành công! Thầy/Cô sẽ xem xét và phản hồi sớm nhất.');
                  setComplaintReason('');
                  setComplaintEvidence('');
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Chọn phần thi hoặc câu hỏi em thấy chấm chưa đúng:
                  </label>
                  <select
                    value={complaintQuestionId}
                    onChange={(e) => setComplaintQuestionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="all">Toàn bộ bài thi (Tổng điểm chung)</option>
                    {variant.questions.map((q, idx) => (
                      <option key={q.id} value={q.id}>
                        Câu {idx + 1} ({q.type === 'essay' ? 'Tự luận viết tay' : q.type === 'multiple_choice' ? 'Trắc nghiệm 4 lựa chọn' : q.type === 'true_false' ? 'Trắc nghiệm Đúng/Sai' : 'Trả lời ngắn'}) - {q.points} điểm
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Lý do khiếu nại chi tiết <span className="text-red-500">*</span>:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={complaintReason}
                    onChange={(e) => setComplaintReason(e.target.value)}
                    placeholder="Ví dụ: AI chấm bài tự luận chưa nhận diện được bước giải tính đạo hàm ở dòng thứ 3 trong ảnh chụp; hoặc đáp án câu trắc nghiệm em tính ra kết quả..."
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Dẫn chứng hoặc giải thích thêm của em:
                  </label>
                  <textarea
                    rows={2}
                    value={complaintEvidence}
                    onChange={(e) => setComplaintEvidence(e.target.value)}
                    placeholder="Em đã làm theo đúng công thức SGK trang... Kết quả em tính ra là..."
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsComplaintModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Đơn Phúc Khảo Cho Thầy/Cô</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FLOATING VIRTUAL MATH KEYBOARD TOGGLE BUTTON */}
      {!isSubmitted && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            type="button"
            onClick={() => {
              setIsKeyboardDrawerOpen((prev) => !prev);
              if (!activeKeyboardTarget) {
                const firstShortQ = variant.questions.find((q) => q.type === 'short_answer');
                if (firstShortQ) {
                  const idx = variant.questions.indexOf(firstShortQ);
                  setActiveKeyboardTarget({
                    questionId: firstShortQ.id,
                    questionIndex: idx,
                    title: `Câu ${idx + 1} (Trả lời ngắn)`,
                  });
                  shortAnswerInputRefs.current[firstShortQ.id]?.focus();
                }
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl transition-all cursor-pointer font-bold text-xs ${
              isKeyboardDrawerOpen
                ? 'bg-slate-900 text-emerald-400 border border-emerald-500/50 ring-2 ring-emerald-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-105 active:scale-95'
            }`}
            title="Bật/Tắt bàn phím ký hiệu toán học ảo"
          >
            <Keyboard className="w-4 h-4" />
            <span>{isKeyboardDrawerOpen ? 'Đóng Bàn Phím Toán' : 'Bàn Phím Ký Hiệu Toán (π, e...)'}</span>
          </button>
        </div>
      )}

      {/* DOCKED VIRTUAL MATH KEYBOARD */}
      {!isSubmitted && isKeyboardDrawerOpen && activeKeyboardTarget && (
        <MathVirtualKeyboard
          targetInput={shortAnswerInputRefs.current[activeKeyboardTarget.questionId]}
          currentValue={answers[activeKeyboardTarget.questionId]?.value || ''}
          onChange={(newVal) =>
            handleAnswerChange(activeKeyboardTarget.questionId, 'short_answer', newVal)
          }
          activeContextTitle={activeKeyboardTarget.title}
          isOpen={isKeyboardDrawerOpen}
          onClose={() => setIsKeyboardDrawerOpen(false)}
          layoutMode="docked"
        />
      )}
    </div>
  );
};
