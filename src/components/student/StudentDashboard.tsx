import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lesson, QuizQuestion } from '../../types';
import confetti from 'canvas-confetti';
import { MathText } from '../math/MathText';
import { TextbookVariationTable } from '../math/TextbookVariationTable';
import { TextbookGraph } from '../math/TextbookGraph';
import {
  BookOpen,
  PlayCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  XCircle,
  Award,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface StudentDashboardProps {
  onGoToExam: () => void;
  onGoToHistory?: () => void;
  onGoToComplaints?: () => void;
  onGoToLessons?: () => void;
  viewMode?: 'all' | 'overview' | 'lessons';
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onGoToExam,
  onGoToHistory,
  onGoToComplaints,
  onGoToLessons,
  viewMode = 'all',
}) => {
  const { currentStudent, lessons, exam, addStudentXP, submissions, teacherProfile, checkActiveExamDraft } = useApp();
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessons[0]?.id || 'l1');
  const [activeLessonTab, setActiveLessonTab] = useState<'video' | 'slide' | 'interactive' | 'quiz'>('video');

  // Quiz state for selected lesson
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});

  const studentId = currentStudent?.id || '';
  const assignedCode = (exam && studentId) ? (exam.assignedCodes[studentId] || '101') : '101';
  const selectedLesson = lessons.find(l => l.id === selectedLessonId) || lessons[0];

  const studentSubmissions = submissions.filter(s => s.studentId === studentId);
  const activeDraftInfo = currentStudent ? checkActiveExamDraft(currentStudent.id) : null;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted[questionId]) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuizQuestion = (q: QuizQuestion) => {
    const selected = quizAnswers[q.id];
    if (selected === undefined || !currentStudent) return;

    setQuizSubmitted(prev => ({ ...prev, [q.id]: true }));

    if (selected === q.correctIndex) {
      // Award XP
      addStudentXP(currentStudent.id, q.xpReward);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b']
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 0. ACTIVE UNFINISHED EXAM BANNER (Auto-save resume) */}
      {activeDraftInfo && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white p-5 shadow-lg border border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <Clock className="w-6 h-6 animate-pulse text-white" />
            </div>
            <div className="space-y-0.5">
              <div className="font-extrabold text-sm sm:text-base flex flex-wrap items-center gap-2">
                <span>BÀI KIỂM TRA ĐANG LÀM DỞ CỦA EM</span>
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-bold uppercase tracking-wider">
                  Đã tự động lưu nháp
                </span>
              </div>
              <p className="text-xs text-amber-50 leading-relaxed">
                Hệ thống đã lưu lại các câu trả lời ({Object.keys(activeDraftInfo.draft.answers || {}).length} câu) và thời gian làm bài trước khi em thoát. Bấm để tiếp tục làm bài thi ngay!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToExam}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-amber-900 font-extrabold text-xs shadow-md hover:bg-amber-50 hover:scale-102 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Tiếp Tục Làm Bài Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. NOTIFICATION BANNER FROM TEACHER */}
      {exam ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 shadow-lg border border-emerald-700/50">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Thông báo kiểm tra trực tuyến • {teacherProfile?.name || 'Giáo Viên'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {exam.title}
              </h2>
              <p className="text-sm text-emerald-100/90 leading-relaxed">
                Phòng thi đang mở cho học sinh làm bài ({currentStudent?.name}{currentStudent?.className ? ` • Lớp ${currentStudent.className}` : ''}). Đề thi bám sát chương trình GDPT 2018 với 3 phần: Trắc nghiệm nhiều lựa chọn, Trắc nghiệm Đúng/Sai, Trả lời ngắn & Tự luận.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-emerald-200/80">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-emerald-300" /> Thời gian: {exam.durationMinutes} phút
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-300" /> Cột điểm: {exam.gradeColumn}
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-emerald-300" /> Hạn chót: {exam.dueDate ? new Date(exam.dueDate).toLocaleDateString('vi-VN') : 'Sắp tới'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              {onGoToHistory && studentSubmissions.length > 0 && (
                <button
                  type="button"
                  onClick={onGoToHistory}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Xem Lịch Sử & Điểm Số ({studentSubmissions.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={onGoToExam}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-900 font-bold text-sm shadow-lg shadow-emerald-950/20 hover:from-emerald-300 hover:to-teal-200 hover:scale-102 transition-all active:scale-98 cursor-pointer"
              >
                <span>Vào Phòng Thi Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">
              Chào mừng {currentStudent?.name} ({currentStudent?.className || 'Lớp học'})
            </h3>
            <p className="text-xs text-slate-500">
              Hiện tại chưa có bài kiểm tra trực tuyến nào được phát hành. Thầy/Cô sẽ mở đề kiểm tra khi đến giờ làm bài.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 shrink-0">
            Học tập & Ôn tập
          </span>
        </div>
      )}

      {/* 1.5 QUICK ACCESS HUB (When on overview mode) */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={onGoToLessons}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-sm">Kho Bài Giảng</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Video, slide & mô phỏng đồ thị</div>
          </div>

          <div
            onClick={onGoToExam}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-sm">Phòng Thi Trực Tuyến</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {exam ? `Đề đang mở • Mã #${assignedCode}` : 'Làm bài kiểm tra'}
            </div>
          </div>

          <div
            onClick={onGoToHistory}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-sm">Lịch Sử & Lời Giải</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{studentSubmissions.length} bài đã nộp</div>
          </div>

          <div
            onClick={onGoToComplaints}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-sm">Phúc Khảo Điểm Số</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Khiếu nại nếu chấm sai</div>
          </div>
        </div>
      )}

      {/* When on dedicated lessons view, show header banner */}
      {viewMode === 'lessons' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Kho Học Liệu & Bài Giảng Trực Tuyến GDPT 2018
              </h2>
              <p className="text-xs text-slate-500">
                Toán 12 • Giải Tích & Hình Học Không Gian • Tự học & bài tập rèn luyện tương tác
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            {lessons.length} Tiết học
          </span>
        </div>
      )}

      {/* 2. MAIN LESSON & TOPIC SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lesson Tree / Topic List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Tiến Độ Bài Học</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Toán 12 • GDPT 2018
              </span>
            </div>

            <div className="space-y-2">
              {lessons.map((lesson) => {
                const isSelected = lesson.id === selectedLessonId;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      if (!lesson.isLocked) setSelectedLessonId(lesson.id);
                    }}
                    disabled={lesson.isLocked}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                        : lesson.isLocked
                        ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Tiết {lesson.order}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.durationMinutes}p
                        </span>
                      </div>
                      <h4 className={`text-sm font-semibold leading-snug ${
                        isSelected ? 'text-emerald-950 font-bold' : 'text-slate-800'
                      }`}>
                        {lesson.title}
                      </h4>
                    </div>

                    <div className="shrink-0 mt-1">
                      {lesson.isLocked ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Study Stat Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-2xl p-5 border border-emerald-100">
            <h4 className="font-bold text-sm text-emerald-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Mục tiêu tuần này</span>
            </h4>
            <p className="text-xs text-emerald-800/80 leading-relaxed mb-3">
              Hoàn thành 3 bài giảng và đạt tối thiểu 8.0 bài kiểm tra ĐTX1 để mở khóa huy hiệu <span className="font-bold">"Bậc Thầy Giải Tích"</span>.
            </p>
            <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '75%' }} />
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700 font-medium mt-1">
              <span>Đã hoàn thành 3/4 mục tiêu</span>
              <span>75%</span>
            </div>
          </div>
        </div>

        {/* Right: Lesson Detailed Viewer (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Lesson Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/40">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                {selectedLesson.chapter}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {selectedLesson.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedLesson.overview}
              </p>

              {/* Learning Outcomes */}
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedLesson.learningOutcomes.map((outcome, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{outcome}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Tabs for Lesson: Video | Slide | Interactive Q&A | Quiz */}
            <div className="flex border-b border-slate-100 px-5 bg-white">
              <button
                type="button"
                onClick={() => setActiveLessonTab('video')}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  activeLessonTab === 'video'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Video Bài Giảng</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLessonTab('slide')}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  activeLessonTab === 'slide'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Tài Liệu & Slide</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLessonTab('interactive')}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  activeLessonTab === 'interactive'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Câu Hỏi Tương Tác</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLessonTab('quiz')}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                  activeLessonTab === 'quiz'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Bài Tập Củng Cố (+XP)</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5">
              {/* TAB 1: VIDEO PLAYER */}
              {activeLessonTab === 'video' && (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
                    <iframe
                      className="w-full h-full"
                      src={selectedLesson.videoUrl}
                      title={selectedLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Thời lượng xem đề xuất: {selectedLesson.durationMinutes} phút
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                      Chất lượng HD 1080p
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: SLIDE / TÀI LIỆU */}
              {activeLessonTab === 'slide' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 text-slate-800 space-y-4">
                    <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                      <h4 className="font-bold text-emerald-900 text-base">
                        Khung Lý Thuyết Trọng Tâm: {selectedLesson.title}
                      </h4>
                      <span className="text-xs text-slate-500">Tài liệu SGK Toán 12 Mới</span>
                    </div>

                    <div className="space-y-4 text-sm leading-relaxed">
                      <div className="p-3.5 bg-emerald-50/70 border-l-4 border-emerald-600 rounded-r-lg space-y-1.5">
                        <strong className="text-emerald-950 font-semibold block">1. Định lý mở rộng về tính đơn điệu (SGK GDPT 2018):</strong>
                        <p className="text-xs text-slate-800">
                          Cho hàm số <MathText content="$y = f(x)$" /> có đạo hàm trên khoảng <MathText content="$K$" />:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs pl-1">
                          <li>
                            Nếu <MathText content="$f'(x) \ge 0, \forall x \in K$" /> và <MathText content="$f'(x) = 0$" /> chỉ tại một số hữu hạn điểm thì <MathText content="$f(x)$" /> đồng biến trên <MathText content="$K$" />.
                          </li>
                          <li>
                            Nếu <MathText content="$f'(x) \le 0, \forall x \in K$" /> và <MathText content="$f'(x) = 0$" /> chỉ tại một số hữu hạn điểm thì <MathText content="$f(x)$" /> nghịch biến trên <MathText content="$K$" />.
                          </li>
                        </ul>
                      </div>

                      {/* Embedded Textbook Variation Table & Graph */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextbookVariationTable
                          cValue={2}
                          data={{
                            xValues: ['-\\infty', '0', '2', '+\\infty'],
                            yPrimeValues: ['+', '0', '-', '0', '+'],
                            caption: 'Bảng biến thiên mẫu hàm số bậc ba y = x^3 - 3x^2 + 2',
                          }}
                        />
                        <TextbookGraph
                          cValue={2}
                          title="Đồ thị hàm số chuẩn SGK y = x^3 - 3x^2 + 2"
                        />
                      </div>

                      <div className="p-3 bg-slate-100 rounded-lg">
                        <strong className="text-slate-900 font-semibold block mb-1">2. Quy trình 4 bước lập bảng biến thiên & khảo sát:</strong>
                        <ol className="list-decimal list-inside text-xs space-y-1.5 text-slate-700 pl-1">
                          <li>Tìm tập xác định <MathText content="$D$" /> của hàm số.</li>
                          <li>Tính đạo hàm <MathText content="$f'(x)$" />. Tìm các điểm <MathText content="$x_i$" /> mà tại đó <MathText content="$f'(x) = 0$" /> hoặc đạo hàm không xác định.</li>
                          <li>Lập bảng biến thiên thể hiện các dấu <MathText content="$+$" />, <MathText content="$-$" /> và mũi tên chiều biến thiên.</li>
                          <li>Kết luận các khoảng đồng biến, nghịch biến và các điểm cực trị <MathText content="$(x_{CĐ}, y_{CĐ})$" />, <MathText content="$(x_{CT}, y_{CT})$" />.</li>
                        </ol>
                      </div>

                      <div className="p-3.5 bg-amber-50/80 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-900 space-y-1">
                        <strong>Lưu ý sai lầm thường gặp khi làm bài thi trắc nghiệm:</strong>
                        <p>
                          Khi hàm phân thức <MathText content="$y = \frac{ax+b}{cx+d}$" /> có <MathText content="$f'(x) > 0$" />, ta kết luận hàm số đồng biến trên từng khoảng <MathText content="$(-\infty; -\frac{d}{c})$" /> và <MathText content="$(-\frac{d}{c}; +\infty)$" />.
                          <span className="font-bold text-rose-700 block mt-0.5">
                            TUYỆT ĐỐI KHÔNG viết: đồng biến trên <MathText content="$(-\infty; -\frac{d}{c}) \cup (-\frac{d}{c}; +\infty)$" /> hoặc <MathText content="$\mathbb{R} \setminus \{-\frac{d}{c}\}$" />.
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INTERACTIVE QUESTIONS */}
              {activeLessonTab === 'interactive' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Suy nghĩ và trả lời trước khi nhấp xem đáp án chuẩn từ Thầy Trịnh Tuấn Kiệt:
                  </p>
                  {(selectedLesson.interactiveQuestions || []).map((q, idx) => {
                    const isRevealed = revealedHints[idx];
                    return (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-sm font-medium text-slate-800">{q.prompt}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRevealedHints(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                          >
                            {isRevealed ? 'Ẩn đáp án' : 'Xem đáp án'}
                          </button>
                        </div>

                        {isRevealed && (
                          <div className="mt-2 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-900 border border-emerald-100 flex items-start gap-2 animate-fadeIn">
                            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Đáp án chuẩn: </span>
                              {q.answerKey}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 4: REINFORCEMENT QUIZ (+XP) */}
              {activeLessonTab === 'quiz' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                    <span className="flex items-center gap-2 font-semibold">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Làm đúng mỗi câu sẽ được cộng ngay 50 - 100 XP vào tài khoản học sinh!
                    </span>
                    <span className="font-bold text-amber-800">
                      {selectedLesson.reinforcementQuiz.length} câu hỏi
                    </span>
                  </div>

                  {selectedLesson.reinforcementQuiz.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Tiết học này chưa mở bộ câu hỏi củng cố.
                    </div>
                  ) : (
                    selectedLesson.reinforcementQuiz.map((q, qIndex) => {
                      const selectedOpt = quizAnswers[q.id];
                      const isSubmitted = quizSubmitted[q.id];
                      const isCorrect = selectedOpt === q.correctIndex;

                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-slate-900 text-sm leading-relaxed">
                              <span className="text-emerald-700 font-bold mr-2">Câu {qIndex + 1}:</span>
                              <MathText content={q.question} />
                            </h4>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 shrink-0">
                              +{q.xpReward} XP
                            </span>
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {q.options.map((opt, optIdx) => {
                              const isThisSelected = selectedOpt === optIdx;
                              let btnClass = 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-emerald-300 hover:bg-slate-100/60';

                              if (isSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                                } else if (isThisSelected && !isCorrect) {
                                  btnClass = 'border-rose-400 bg-rose-50 text-rose-900 ring-1 ring-rose-400';
                                }
                              } else if (isThisSelected) {
                                btnClass = 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-semibold ring-2 ring-emerald-500/20';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectOption(q.id, optIdx)}
                                  disabled={isSubmitted}
                                  className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnClass}`}
                                >
                                  <span><MathText content={opt} /></span>
                                  {isSubmitted && optIdx === q.correctIndex && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                                  )}
                                  {isSubmitted && isThisSelected && !isCorrect && (
                                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Submit Button or Result Explanation */}
                          {!isSubmitted ? (
                            <div className="pt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleSubmitQuizQuestion(q)}
                                disabled={selectedOpt === undefined}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  selectedOpt !== undefined
                                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                Kiểm Tra Đáp Án
                              </button>
                            </div>
                          ) : (
                            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                              isCorrect ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
                            }`}>
                              <div className="font-bold flex items-center gap-1.5 mb-1">
                                {isCorrect ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Chính xác! Bạn nhận được +{q.xpReward} XP.</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-rose-600" />
                                    <span>Chưa chính xác. Đáp án đúng là {String.fromCharCode(65 + q.correctIndex)}.</span>
                                  </>
                                )}
                              </div>
                              <div className="text-slate-700 mt-1 leading-relaxed">
                                <span className="font-semibold">Lời giải chi tiết: </span>
                                <MathText content={q.explanation} />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
