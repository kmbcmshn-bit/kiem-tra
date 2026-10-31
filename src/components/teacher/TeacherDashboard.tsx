import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lesson, Submission, GradebookRecord, Exam } from '../../types';
import { VariantGeneratorModal } from './VariantGeneratorModal';
import { VariantPreviewModal } from './VariantPreviewModal';
import { GradingModal } from './GradingModal';
import { GradebookHistoryModal } from './GradebookHistoryModal';
import { CreateOrRecreateExamModal } from './CreateOrRecreateExamModal';
import { ClassManagement } from './ClassManagement';
import { AssignExamModal } from './AssignExamModal';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  GraduationCap,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Settings,
  Users,
  Search,
  Filter,
  Download,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Clock,
  PlayCircle,
  FileUp,
  RefreshCw,
  PlusCircle,
  FileText,
  School,
  Send,
  UserCheck,
  MessageSquareQuote,
  Check,
  X,
  Eye,
  Trash2,
  Edit2,
  Save
} from 'lucide-react';

export type TeacherMenuTab =
  | 'overview'
  | 'classes'
  | 'lessons'
  | 'exams'
  | 'grading'
  | 'gradebook'
  | 'complaints'
  | 'ai_config';

export interface TeacherDashboardProps {
  activeMenu?: TeacherMenuTab;
  onSelectMenu?: (menu: TeacherMenuTab) => void;
  hideSidebar?: boolean;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  activeMenu: propActiveMenu,
  onSelectMenu,
  hideSidebar = false,
}) => {
  const {
    classes,
    students,
    lessons,
    updateLesson,
    toggleLessonLock,
    exam,
    updateExam,
    exams,
    selectExam,
    deleteExam,
    submissions,
    addSubmission,
    deleteSubmission,
    updateSubmissionScore,
    gradebook,
    calculationMode,
    setCalculationMode,
    gradeEssayWithAI,
    complaints,
    resolveComplaint,
  } = useApp();

  const [internalMenu, setInternalMenu] = useState<TeacherMenuTab>('overview');

  const activeMenu = propActiveMenu ?? internalMenu;
  const setActiveMenu = (menu: TeacherMenuTab) => {
    setInternalMenu(menu);
    onSelectMenu?.(menu);
  };

  // Complaint review form state
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [complaintReviewNotes, setComplaintReviewNotes] = useState<Record<string, string>>({});
  const [complaintAdjustedScores, setComplaintAdjustedScores] = useState<Record<string, number>>({});
  const [complaintBannerMsg, setComplaintBannerMsg] = useState<string | null>(null);

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isCreateOrRecreateOpen, setIsCreateOrRecreateOpen] = useState<boolean>(false);
  const [createModalTab, setCreateModalTab] = useState<'prompt' | 'matrix_file' | 'recreate'>('prompt');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assignSuccessBanner, setAssignSuccessBanner] = useState<string | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [historyRecord, setHistoryRecord] = useState<GradebookRecord | null>(null);

  // Delete Exam modal state
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  // Gradebook Edit & Delete Score states
  const [selectedGradebookClassId, setSelectedGradebookClassId] = useState<string>('all');
  const [editingScoreStudent, setEditingScoreStudent] = useState<{
    studentId: string;
    studentName: string;
    submissionId?: string;
    currentScore: number;
  } | null>(null);
  const [newScoreVal, setNewScoreVal] = useState<string>('');
  const [scoreTeacherNote, setScoreTeacherNote] = useState<string>('');
  const [scoreToDeleteStudent, setScoreToDeleteStudent] = useState<{
    studentId: string;
    studentName: string;
    submissionId?: string;
  } | null>(null);

  // Search in grading
  const [gradingSearch, setGradingSearch] = useState<string>('');
  const [isBatchGrading, setIsBatchGrading] = useState<boolean>(false);

  // Lesson Edit state
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [gradingClassFilter, setGradingClassFilter] = useState<string>('all');

  // Filtered submissions
  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(gradingSearch.toLowerCase()) ||
      s.variantCode.includes(gradingSearch);
    const studentObj = students.find(st => st.id === s.studentId);
    const matchesClass =
      gradingClassFilter === 'all' ||
      (studentObj && studentObj.classId === gradingClassFilter);
    return matchesSearch && matchesClass;
  });

  // Batch AI Grade all pending essays sequentially
  const handleBatchAIGrading = async () => {
    setIsBatchGrading(true);
    const pendingSubs = submissions.filter(s => s.status === 'pending_ai');
    for (const sub of pendingSubs) {
      await gradeEssayWithAI(sub.id);
      // Brief pause to simulate safe batching
      await new Promise(r => setTimeout(r, 600));
    }
    setIsBatchGrading(false);
  };

  // Active assigned students based on target assignment (Only returns students when class is assigned!)
  const activeAssignedStudents = React.useMemo(() => {
    if (!exam || !exam.targetAssignment) return [];
    if (exam.targetAssignment.type === 'class' && exam.targetAssignment.targetClassId) {
      return students.filter(s => s.classId === exam.targetAssignment?.targetClassId);
    }
    if (exam.targetAssignment.type === 'custom_students' && exam.targetAssignment.studentIds) {
      const set = new Set(exam.targetAssignment.studentIds);
      return students.filter(s => set.has(s.id));
    }
    if (exam.targetAssignment.type === 'group') {
      return students.slice(0, 15);
    }
    return [];
  }, [exam, students]);

  return (
    <div className={`flex flex-col ${hideSidebar ? '' : 'lg:flex-row gap-6'} pb-16`}>
      {/* 1. TEACHER SIDEBAR NAVIGATION (Shown when not controlled by unified layout) */}
      {!hideSidebar && (
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                GV
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Thầy Trịnh Tuấn Kiệt</div>
                <div className="text-[11px] text-emerald-700 font-medium">Tổ Toán - THPT</div>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveMenu('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === 'overview'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Bảng Điều Khiển</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu('classes')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === 'classes'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Quản Lý Lớp & Học Sinh</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                  {students.length} HS
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu('lessons')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === 'lessons'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Bài Giảng & Tiến Độ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu('exams')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === 'exams'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Đề Thi & Đa Mã Đề</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                  {exam ? Object.keys(exam.variants || {}).length : 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu('grading')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === 'grading'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Chấm Thi Thông Minh</span>
                </div>
                {submissions.filter(s => s.status === 'pending_ai').length > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                    {submissions.filter(s => s.status === 'pending_ai').length} chờ
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu('gradebook')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === 'gradebook'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Sổ Điểm Điện Tử</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu('complaints')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeMenu === 'complaints'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquareQuote className="w-4 h-4 text-amber-500" />
                  <span>Hộp Thư Phúc Khảo</span>
                </div>
                {complaints.filter(c => c.status === 'pending').length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeMenu === 'complaints'
                      ? 'bg-white text-amber-900'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {complaints.filter(c => c.status === 'pending').length} chờ
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveMenu('ai_config')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeMenu === 'ai_config'
                    ? 'bg-emerald-50 text-emerald-800 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4 text-emerald-600" />
                <span>Cài Đặt AI & Barem</span>
              </button>
            </nav>
          </div>

          {/* Quick Action Box */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Sparkles className="w-4 h-4" />
              <span>AI Quản Lý Đề Thi</span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Tạo đề theo yêu cầu, bóc tách ma trận từ file Word/PDF/ảnh, hoặc tái tạo đề có sẵn.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setCreateModalTab('prompt');
                  setIsCreateOrRecreateOpen(true);
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tạo / Up Ma Trận / Tái Tạo Đề</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20 flex items-center justify-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tổ Chức Kiểm Tra & Sinh Đa Mã Đề</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. MAIN TEACHER CONTENT AREA */}
      <main className="flex-1 space-y-6">
        {/* VIEW 1: OVERVIEW DASHBOARD */}
        {activeMenu === 'overview' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveMenu('classes')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-300 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-500">Lớp Học & Học Sinh</span>
                <div className="text-2xl font-black text-slate-900">{classes.length} Lớp • {students.length} HS</div>
                <div className="text-[11px] text-emerald-600 font-medium">Bấm để quản lý danh sách & cấp tài khoản</div>
              </div>

              <div
                onClick={() => setActiveMenu('exams')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-300 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-500">Mã Đề Thi Hiện Tại</span>
                <div className="text-2xl font-black text-emerald-700">
                  {exam ? `${Object.keys(exam.variants || {}).length} Mã Đề` : 'Chưa có đề'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {exam
                    ? (Object.keys(exam.variants || {}).length <= 1 ? '1 Đề gốc (Chưa sinh mã đề)' : 'Đã sinh đa mã đề tương đương')
                    : 'Tạo đề gốc bằng 1 trong 3 cách'}
                </div>
              </div>

              <div
                onClick={() => setActiveMenu('grading')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-300 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-500">Số Bài Đã Nộp</span>
                <div className="text-2xl font-black text-teal-700">
                  {submissions.length} / {students.length || 0}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium">
                  {submissions.length > 0 ? 'Tự động chấm trắc nghiệm' : 'Chờ học sinh nộp bài'}
                </div>
              </div>

              <div
                onClick={() => setActiveMenu('grading')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-emerald-300 transition-colors"
              >
                <span className="text-xs font-semibold text-slate-500">Giám Sát Chống Gian Lận</span>
                <div className="text-2xl font-black text-amber-600">
                  {submissions.filter(s => s.violationsCount > 0).length} Cảnh báo
                </div>
                <div className="text-[11px] text-slate-500">Ghi nhận tab-switch & blur</div>
              </div>
            </div>

            {/* Quick Overview Table of Submissions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Bài Làm Nộp Gần Nhất
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đối chiếu mã đề cá nhân hóa và điểm máy chấm tức thì
                  </p>
                </div>
                {submissions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveMenu('grading')}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Xem toàn bộ danh sách</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Chưa có bài thi nào được nộp. Khi học sinh làm bài và nộp bài, kết quả sẽ hiển thị tức thì tại đây.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {submissions.slice(0, 5).map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400 font-bold w-5">{idx + 1}</span>
                        <img src={sub.studentAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <div className="font-semibold text-slate-900">{sub.studentName}</div>
                          <div className="text-[11px] text-slate-500">
                            Mã đề: <strong className="font-mono text-emerald-700">#{sub.variantCode}</strong> • Nộp lúc: {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {sub.violationsCount === 0 ? (
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                            Nghiêm túc (0)
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                            {sub.violationsCount} lần chuyển tab
                          </span>
                        )}

                        <div className="text-right">
                          <div className="font-bold text-sm text-slate-900">{sub.totalScore.toFixed(1)} đ</div>
                          <div className="text-[10px] text-slate-400">
                            {sub.status === 'ai_graded' ? 'AI đã chấm' : sub.status === 'confirmed' ? 'GV đã duyệt' : 'Chờ AI'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setGradingSubmission(sub)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700"
                        >
                          Chấm bài
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: CLASS & STUDENT MANAGEMENT */}
        {activeMenu === 'classes' && <ClassManagement />}

        {/* VIEW 2: LESSONS & PROGRESS MANAGEMENT */}
        {activeMenu === 'lessons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Quản Lý Cây Bài Giảng & Tiến Độ Tiết Học
                </h3>
                <p className="text-xs text-slate-500">
                  Bật/tắt mở khóa tiết, chỉnh sửa nội dung bài giảng, gán link video/slide tài liệu
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        Tiết {lesson.order}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {lesson.durationMinutes} phút
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        lesson.isLocked ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {lesson.isLocked ? 'Đang khóa' : 'Đã mở khóa học'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{lesson.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-1">{lesson.overview}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleLessonLock(lesson.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        lesson.isLocked
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lesson.isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Mở khóa tiết</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Khóa tiết học</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingLesson(lesson)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
                    >
                      Sửa nội dung
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Edit Lesson */}
            {editingLesson && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-900 text-base">
                    Chỉnh Sửa Tiết Học: {editingLesson.title}
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Tiêu đề bài học:</label>
                      <input
                        type="text"
                        value={editingLesson.title}
                        onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Đường dẫn Video bài giảng (YouTube URL):</label>
                      <input
                        type="text"
                        value={editingLesson.videoUrl}
                        onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Tóm tắt nội dung trọng tâm:</label>
                      <textarea
                        rows={3}
                        value={editingLesson.overview}
                        onChange={(e) => setEditingLesson({ ...editingLesson, overview: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingLesson(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateLesson(editingLesson);
                        setEditingLesson(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Lưu Thay Đổi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: EXAM MANAGEMENT & ISOMORPHIC MULTI-TEST CODE ENGINE */}
        {activeMenu === 'exams' && (
          <div className="space-y-6">
            {!exam ? (
              /* Empty Exam State: Prompt Teacher to Create Initial Base Exam */
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl sm:text-2xl">
                    Chưa Có Đề Thi Nào Được Tạo
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Hệ thống hoàn toàn sạch, không có đề mẫu minh họa. Thầy/Cô hãy bắt đầu bằng cách <strong>Tạo 1 Đề Thi Gốc</strong> theo 1 trong 3 phương pháp bên dưới. Sau đó có thể tùy chọn sinh số lượng mã đề tương đương cho học sinh:
                  </p>
                </div>

                {/* 3 CORE REQUESTED CAPABILITIES CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Tạo đề theo yêu cầu */}
                  <div
                    onClick={() => {
                      setCreateModalTab('prompt');
                      setIsCreateOrRecreateOpen(true);
                    }}
                    className="bg-white rounded-2xl border border-emerald-200 hover:border-emerald-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Cách 1: Prompt AI
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        1. Tạo Đề Gốc Theo Yêu Cầu
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Nhập mô tả đề thi, ma trận kiến thức, thời gian và phân bổ mức độ nhận thức (NB, TH, VD).
                      </p>
                    </div>
                    <div className="pt-1 flex items-center text-xs font-bold text-emerald-700 gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Bắt đầu soạn đề</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 2: Theo ma trận up lên từ file */}
                  <div
                    onClick={() => {
                      setCreateModalTab('matrix_file');
                      setIsCreateOrRecreateOpen(true);
                    }}
                    className="bg-white rounded-2xl border border-teal-200 hover:border-teal-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        Cách 2: File Ma Trận
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                        2. Up Ma Trận Từ File / Ảnh
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Tải lên file Excel (.xlsx), Word (.docx), PDF hoặc ảnh chụp ma trận. AI bóc tách ma trận và tạo 1 đề gốc bám sát 100%.
                      </p>
                    </div>
                    <div className="pt-1 flex items-center text-xs font-bold text-teal-700 gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Tải file ma trận</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 3: Tái tạo đề có sẵn */}
                  <div
                    onClick={() => {
                      setCreateModalTab('recreate');
                      setIsCreateOrRecreateOpen(true);
                    }}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Cách 3: Tái Tạo
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        3. Tái Tạo Đề Thi
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Tái tạo mới toàn bộ tham số, số liệu toán học và nghiệm đẹp dựa trên khung ma trận.
                      </p>
                    </div>
                    <div className="pt-1 flex items-center text-xs font-bold text-slate-700 gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Tái tạo số liệu</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Existing Base Exam View */
              <>
                {/* Multi-Exam Switcher Bar */}
                {exams && exams.length > 1 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-2xl shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-300 font-semibold">
                          Kho đề thi ({exams.length} đề):
                        </span>
                        <select
                          value={exam.id}
                          onChange={(e) => selectExam(e.target.value)}
                          className="bg-slate-800 text-emerald-300 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-xs sm:max-w-md truncate"
                        >
                          {exams.map((ex) => {
                            const targetText =
                              ex.targetAssignment?.type === 'class'
                                ? `Lớp ${ex.targetAssignment.targetClassName || classes.find(c => c.id === ex.targetAssignment?.targetClassId)?.name || 'Đã chọn'}`
                                : ex.targetAssignment?.type === 'group'
                                ? ex.targetAssignment.groupName
                                : ex.targetAssignment?.type === 'custom_students'
                                ? `${ex.targetAssignment.studentIds?.length || 0} HS`
                                : 'Chưa giao';
                            return (
                              <option key={ex.id} value={ex.id}>
                                {ex.title} • [{targetText}]
                              </option>
                            );
                          })}
                        </select>
                        <button
                          type="button"
                          onClick={() => setExamToDelete(exam)}
                          className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 transition-colors cursor-pointer"
                          title="Xóa đề thi này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCreateModalTab('prompt');
                        setIsCreateOrRecreateOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Soạn Đề Mới</span>
                    </button>
                  </div>
                )}

                {/* Assignment Success Banner */}
                {assignSuccessBanner && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-950 animate-fadeIn">
                    <div className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>{assignSuccessBanner}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAssignSuccessBanner(null)}
                      className="text-emerald-700 font-bold hover:underline shrink-0 text-xs cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                        Đề Thi Gốc
                      </span>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                        {exam.title}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {exam.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Cột điểm: <strong className="text-slate-800">{exam.gradeColumn}</strong> • Thời gian: <strong className="text-slate-800">{exam.durationMinutes} phút</strong> • Số câu hỏi gốc: <strong>{exam.questions?.length || 0} câu</strong>
                    </p>

                    {/* Target Assignment Status Badge */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-slate-500">
                        Lớp nhận đề:
                      </span>
                      {exam.targetAssignment ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-xs shadow-2xs">
                          {exam.targetAssignment.type === 'class' && <School className="w-3.5 h-3.5 text-emerald-700" />}
                          {exam.targetAssignment.type === 'group' && <Users className="w-3.5 h-3.5 text-emerald-700" />}
                          {exam.targetAssignment.type === 'custom_students' && <UserCheck className="w-3.5 h-3.5 text-emerald-700" />}
                          <span>
                            {exam.targetAssignment.type === 'class'
                              ? `Lớp ${exam.targetAssignment.targetClassName || classes.find(c => c.id === exam.targetAssignment?.targetClassId)?.name || 'Đã chọn'} (${activeAssignedStudents.length} học sinh)`
                              : exam.targetAssignment.type === 'group'
                              ? `${exam.targetAssignment.groupName} (${activeAssignedStudents.length} học sinh)`
                              : `${activeAssignedStudents.length} học sinh được chọn`}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold border border-amber-300 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>Chưa phân phối cho lớp nào</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsAssignModalOpen(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors cursor-pointer text-xs"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{exam.targetAssignment ? 'Đổi Lớp / Nhóm Giao Đề' : 'Giao Đề Này Cho Lớp'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* CORE BUTTON: GIAO ĐỀ CHO LỚP / NHÓM */}
                    <button
                      type="button"
                      onClick={() => setIsAssignModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-emerald-100" />
                      <span>Giao Đề Cho Lớp / Nhóm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsGeneratorOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Tổ Chức Kiểm Tra & Sinh Đa Mã Đề</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Xem Trước {Object.keys(exam.variants || {}).length} Mã Đề</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCreateOrRecreateOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Tạo Đề Gốc Khác</span>
                    </button>

                    {/* DELETE CREATED EXAM BUTTON */}
                    <button
                      type="button"
                      onClick={() => setExamToDelete(exam)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors cursor-pointer"
                      title="Xóa đề thi này khỏi hệ thống"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Xóa Đề Này</span>
                    </button>
                  </div>
                </div>

                {/* Exam Variants Status Notice */}
                {Object.keys(exam.variants || {}).length <= 1 ? (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                        101
                      </div>
                      <div>
                        <div className="font-bold text-amber-900">
                          Hiện tại chỉ có 1 Đề thi gốc (Mã 101)
                        </div>
                        <p className="text-[11px] text-amber-800/80 mt-0.5">
                          Khi sẵn sàng cho học sinh làm bài kiểm tra, Thầy/Cô bấm <strong>"Tổ Chức Kiểm Tra & Sinh Đa Mã Đề"</strong> để hệ thống tự động sửa số liệu, dữ kiện và tạo ra các mã đề tương đương với cùng độ khó cho lớp!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsGeneratorOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs shrink-0 cursor-pointer"
                    >
                      Sinh Mã Đề Kiểm Tra Ngay
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-950">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900">
                          Đã sinh thành công {Object.keys(exam.variants || {}).length} mã đề thi tương tự nhau!
                        </span>
                        <p className="text-[11px] text-emerald-800/80 mt-0.5">
                          Số liệu và nghiệm số giữa các mã đề đã được biến thiên độc lập, bảo toàn 100% độ khó và ma trận kiến thức.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shrink-0 cursor-pointer"
                    >
                      Đối chiếu các mã đề
                    </button>
                  </div>
                )}

                {/* 3 CORE REQUESTED CAPABILITIES CARDS (For Re-creation or Modification) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Tạo đề theo yêu cầu */}
                  <div
                    onClick={() => setIsCreateOrRecreateOpen(true)}
                    className="bg-white rounded-2xl border border-emerald-200 hover:border-emerald-400 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Prompt AI
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        1. Tạo Đề Theo Yêu Cầu
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Soạn đề gốc mới hoàn toàn theo cấu trúc câu hỏi và phân bổ mức độ nhận thức (NB, TH, VD).
                      </p>
                    </div>
                    <div className="pt-1 flex items-center text-xs font-bold text-emerald-700 gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Nhập yêu cầu tạo đề</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 2: Theo ma trận up lên từ file */}
                  <div
                    onClick={() => setIsCreateOrRecreateOpen(true)}
                    className="bg-white rounded-2xl border border-teal-200 hover:border-teal-400 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        File & Ảnh
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                        2. Up Ma Trận Từ File / Ảnh
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Tải lên file Word (.docx), Excel (.xlsx), PDF hoặc ảnh chụp ma trận để tạo đề gốc.
                      </p>
                    </div>
                    <div className="pt-1 flex items-center text-xs font-bold text-teal-700 gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Tải tệp tin ma trận</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 3: Tái tạo đề có sẵn */}
                  <div
                    onClick={() => setIsCreateOrRecreateOpen(true)}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Isomorphic
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        3. Tái Tạo Đề Có Sẵn
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Giữ nguyên 100% khung ma trận đề hiện tại, làm mới toàn bộ số liệu toán học và nghiệm đẹp.
                      </p>
                    </div>
                    <div className="pt-1 flex items-center text-xs font-bold text-slate-700 gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Tái tạo số liệu đề</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Isomorphic Exam Matrix Explanation Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Cơ Chế Phân Bổ 45 Mã Đề Riêng Biệt Cho Học Sinh:</span>
              </div>
              <p className="leading-relaxed">
                Khi học sinh chọn tên vào phòng thi, hệ thống sẽ tự động gán duy nhất 1 mã đề riêng biệt (từ Mã 101 đến Mã 145). Toàn bộ 45 mã đề đều giữ nguyên 100% dạng toán, độ khó nhưng hoán đổi số liệu và đảo phương án ngẫu nhiên.
              </p>
            </div>

            {/* Roster Assignment Table Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <School className="w-4 h-4 text-emerald-600" />
                    <span>
                      {exam?.targetAssignment ? (
                        <>
                          Bảng Phân Phối Mã Đề Cho{' '}
                          {exam.targetAssignment.type === 'class'
                            ? `Lớp ${exam.targetAssignment.targetClassName || classes.find(c => c.id === exam.targetAssignment?.targetClassId)?.name || 'Đã Chọn'}`
                            : exam.targetAssignment.type === 'group'
                            ? exam.targetAssignment.groupName
                            : 'Danh Sách Học Sinh Được Chọn'}{' '}
                          ({activeAssignedStudents.length} Học Sinh)
                        </>
                      ) : (
                        'Phân Phối Mã Đề Cho Học Sinh'
                      )}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {exam?.targetAssignment
                      ? 'Tự động cấp phát mã đề riêng biệt độc lập cho từng học sinh • Bảo toàn 100% độ khó'
                      : 'Đề thi hiện chưa được giao cho lớp nào. Chọn lớp để cấp phát mã đề cá nhân hóa.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{exam?.targetAssignment ? 'Giao Cho Lớp Khác' : 'Chọn Lớp Nhận Đề'}</span>
                  </button>
                </div>
              </div>

              {activeAssignedStudents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                    <School className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800 text-sm">
                      Chưa Phân Phối Đề Cho Lớp Nào
                    </div>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Danh sách học sinh sẽ chỉ hiển thị khi Thầy/Cô chọn lớp nhận đề thi. Bấm nút bên dưới để chọn một trong các lớp Thầy/Cô đang dạy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Chọn Lớp Giao Đề Ngay</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold sticky top-0">
                      <tr>
                        <th className="p-3">STT</th>
                        <th className="p-3">Họ và Tên Học Sinh</th>
                        <th className="p-3">Tên Đăng Nhập / Mã HS</th>
                        <th className="p-3">Mã Đề Được Cấp Phát</th>
                        <th className="p-3">Trạng Thái Đề</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {activeAssignedStudents.map((st, idx) => {
                        const code = exam?.assignedCodes?.[st.id] || String(101 + (idx % Math.max(1, Object.keys(exam?.variants || {}).length)));
                        return (
                          <tr key={st.id} className="hover:bg-slate-50/60">
                            <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                              <img src={st.avatar} alt="" className="w-5 h-5 rounded-full" />
                              <span>{st.name}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                {st.username || st.email}
                              </span>
                              {st.studentCode && (
                                <span className="ml-2 font-mono text-[10px] text-slate-500">
                                  (Mã: {st.studentCode})
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Mã đề #{code}
                              </span>
                            </td>
                            <td className="p-3 text-emerald-700 font-semibold">
                              ✓ Sẵn sàng làm bài
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: SMART GRADING DASHBOARD */}
        {activeMenu === 'grading' && (
          <div className="space-y-4">
            {/* Top Grading Control Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={gradingSearch}
                    onChange={(e) => setGradingSearch(e.target.value)}
                    placeholder="Tìm học sinh hoặc mã đề..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {classes.length > 0 && (
                  <select
                    value={gradingClassFilter}
                    onChange={(e) => setGradingClassFilter(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-emerald-500"
                  >
                    <option value="all">Tất cả các lớp ({classes.length} lớp)</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleBatchAIGrading}
                  disabled={isBatchGrading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBatchGrading ? 'AI Đang Chấm Hàng Loạt...' : 'AI Chấm Tự Luận Hàng Loạt'}</span>
                </button>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-3">STT</th>
                      <th className="p-3">Họ và Tên</th>
                      <th className="p-3">Lớp</th>
                      <th className="p-3">Mã Đề Phát</th>
                      <th className="p-3">Thời Gian Nộp</th>
                      <th className="p-3">Giám Sát Vi Phạm</th>
                      <th className="p-3 text-right">Điểm TN</th>
                      <th className="p-3 text-right">Điểm TL</th>
                      <th className="p-3 text-right">Tổng Điểm</th>
                      <th className="p-3 text-center">Trạng Thái</th>
                      <th className="p-3 text-center">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-8 text-center text-slate-400">
                          Chưa có bài thi nào phù hợp với bộ lọc tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub, idx) => {
                        const stObj = students.find((s) => s.id === sub.studentId);
                        const className = stObj?.className || (classes.length > 0 ? classes[0].name : '');
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                              <img src={sub.studentAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                              <span>{sub.studentName}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                {className}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-emerald-800">
                              #{sub.variantCode}
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')}
                            </td>
                            <td className="p-3">
                              {sub.violationsCount === 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3" /> Nghiêm túc (0)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                  <ShieldAlert className="w-3 h-3" /> {sub.violationsCount} lần chuyển tab
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800">
                              {sub.mcqScore.toFixed(1)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800">
                              {sub.essayScore > 0 ? sub.essayScore.toFixed(1) : '-'}
                            </td>
                            <td className="p-3 text-right font-mono font-black text-emerald-700 text-sm">
                              {sub.totalScore.toFixed(1)}
                            </td>
                            <td className="p-3 text-center">
                              {sub.status === 'confirmed' ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  GV Đã Duyệt
                                </span>
                              ) : sub.status === 'ai_graded' ? (
                                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                                  AI Đã Chấm
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold animate-pulse">
                                  Chờ AI Chấm
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => setGradingSubmission(sub)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors shadow-2xs flex items-center gap-1 mx-auto cursor-pointer"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Xem bài làm & Lời giải</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: ELECTRONIC GRADEBOOK & STATS */}
        {activeMenu === 'gradebook' && (
          <div className="space-y-4">
            {/* Top Gradebook Control Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-bold text-slate-900 text-base">
                    Sổ Điểm Điện Tử Chuẩn GDPT 2018
                  </h3>
                  <select
                    value={selectedGradebookClassId}
                    onChange={(e) => setSelectedGradebookClassId(e.target.value)}
                    className="bg-emerald-50 text-emerald-950 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="all">Tất Cả Các Lớp ({classes.length} lớp)</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        Lớp {c.name} ({students.filter(s => s.classId === c.id).length} HS)
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500">
                  Thầy/Cô có thể nhấp vào ô điểm để xem chi tiết lịch sử nộp bài, hoặc bấm <strong>"Sửa"</strong> / <strong>"Xóa điểm"</strong> nếu thấy điểm số chưa hợp lý và muốn thay đổi.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <span className="text-slate-500 text-[11px] px-2">Quy đổi:</span>
                <button
                  type="button"
                  onClick={() => setCalculationMode('average')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    calculationMode === 'average'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Trung Bình Cộng
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationMode('highest')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    calculationMode === 'highest'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lấy Bài Cao Nhất
                </button>
              </div>
            </div>

            {/* Gradebook Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-12 text-center">STT</th>
                      <th className="p-3">Họ và Tên Học Sinh</th>
                      <th className="p-3 text-center">ĐTX1 (Hệ số 1)</th>
                      <th className="p-3 text-center">ĐTX2 (Hệ số 1)</th>
                      <th className="p-3 text-center">Giữa Kỳ (Hệ số 2)</th>
                      <th className="p-3 text-center">Cuối Kỳ (Hệ số 3)</th>
                      <th className="p-3 text-center bg-emerald-50 text-emerald-950 font-bold">
                        {calculationMode === 'average' ? 'Điểm TB Học Kỳ' : 'Điểm Cao Nhất'}
                      </th>
                      <th className="p-3 text-center w-28">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gradebook
                      .filter(record => {
                        if (selectedGradebookClassId === 'all') return true;
                        const st = students.find(s => s.id === record.studentId);
                        return st?.classId === selectedGradebookClassId;
                      })
                      .map((record) => (
                        <tr key={record.studentId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-mono">
                            {record.rollNumber}
                          </td>
                          <td className="p-3 font-semibold text-slate-900">
                            {record.studentName}
                          </td>

                          {/* Interactive Grade Cells: click to view history */}
                          <td
                            onClick={() => setHistoryRecord(record)}
                            className="p-3 text-center font-mono font-bold text-emerald-800 hover:bg-emerald-50 cursor-pointer transition-colors"
                            title="Bấm để xem lịch sử nộp bài"
                          >
                            <span className="px-2 py-0.5 rounded bg-slate-50 hover:bg-emerald-100">
                              {record.dtx1 !== undefined ? record.dtx1.toFixed(1) : '-'}
                            </span>
                          </td>

                          <td
                            onClick={() => setHistoryRecord(record)}
                            className="p-3 text-center font-mono font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Bấm để xem lịch sử nộp bài"
                          >
                            <span className="px-2 py-0.5 rounded bg-slate-50">
                              {record.dtx2 !== undefined ? record.dtx2.toFixed(1) : '-'}
                            </span>
                          </td>

                          <td
                            onClick={() => setHistoryRecord(record)}
                            className="p-3 text-center font-mono font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Bấm để xem lịch sử nộp bài"
                          >
                            <span className="px-2 py-0.5 rounded bg-slate-50">
                              {record.giuaKy !== undefined ? record.giuaKy.toFixed(1) : '-'}
                            </span>
                          </td>

                          <td
                            onClick={() => setHistoryRecord(record)}
                            className="p-3 text-center font-mono font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Bấm để xem lịch sử nộp bài"
                          >
                            <span className="px-2 py-0.5 rounded bg-slate-50">
                              {record.cuoiKy !== undefined ? record.cuoiKy.toFixed(1) : '-'}
                            </span>
                          </td>

                          <td className="p-3 text-center font-mono font-black text-emerald-800 bg-emerald-50/50 text-sm">
                            {calculationMode === 'average' ? record.averageScore.toFixed(1) : record.highestScore.toFixed(1)}
                          </td>

                          {/* Actions: Edit & Delete Score */}
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const sub = submissions.find(
                                    s => s.studentId === record.studentId && (exam ? s.examId === exam.id : true)
                                  );
                                  setEditingScoreStudent({
                                    studentId: record.studentId,
                                    studentName: record.studentName,
                                    submissionId: sub?.id,
                                    currentScore: record.dtx1 || 0,
                                  });
                                  setNewScoreVal(String(record.dtx1 !== undefined ? record.dtx1 : 0));
                                  setScoreTeacherNote('');
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1"
                                title="Sửa điểm học sinh này"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const sub = submissions.find(
                                    s => s.studentId === record.studentId && (exam ? s.examId === exam.id : true)
                                  );
                                  setScoreToDeleteStudent({
                                    studentId: record.studentId,
                                    studentName: record.studentName,
                                    submissionId: sub?.id,
                                  });
                                }}
                                className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                title="Xóa điểm học sinh này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: AI CONFIGURATION */}
        {activeMenu === 'ai_config' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Cài Đặt Mô Hình AI & Cấu Hình Barem Chấm Tự Động
              </h3>
              <p className="text-xs text-slate-500">
                Tích hợp Google Gemini API (@google/genai SDK) qua server-side an toàn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                <span className="text-xs font-bold text-emerald-900 block">
                  Mô Hình AI Đang Sử Dụng:
                </span>
                <div className="font-mono text-xs font-bold text-emerald-800 bg-white p-2 rounded-lg border border-emerald-200">
                  models/gemini-3.8-flash (Tốc độ cao & tối ưu suy luận giáo dục)
                </div>
                <p className="text-[11px] text-emerald-950">
                  Tự động điều chỉnh nhiệt độ (temperature: 0.2) để đảm bảo độ chính xác barem toán học cao nhất.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Cơ chế chống nghẽn API (Rate-limit Safe):
                </span>
                <div className="text-xs text-slate-600 leading-relaxed">
                  Áp dụng xử lý hàng đợi tuần tự (Sequential batching) và cache template toán học tương đương khi tạo từ 40-50 mã đề đồng thời.
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Khung Barem Đánh Giá Chuẩn Tự Luận
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
                <div>1. Đặt ẩn phụ, tìm tập xác định & điều kiện bài toán: <strong>0.5 điểm</strong></div>
                <div>2. Thiết lập hàm số, tính đạo hàm và lập bảng biến thiên: <strong>0.75 điểm</strong></div>
                <div>3. Đối chiếu điều kiện, biện luận và kết luận đáp số: <strong>0.75 điểm</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: COMPLAINTS & APPEALS MANAGEMENT */}
        {activeMenu === 'complaints' && (
          <div className="space-y-4">
            {/* Top Control Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <MessageSquareQuote className="w-5 h-5 text-amber-600" />
                    <span>Hộp Thư Khiếu Nại & Phúc Khảo Điểm Thi</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {complaints.filter(c => c.status === 'pending').length} đơn chờ duyệt
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Xem xét các ý kiến phúc khảo của học sinh, kiểm tra lại bài làm và điều chỉnh điểm số nếu ứng dụng hoặc AI chấm sót bước giải.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setComplaintFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    complaintFilter === 'all'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({complaints.length})
                </button>
                <button
                  type="button"
                  onClick={() => setComplaintFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    complaintFilter === 'pending'
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chờ xem xét ({complaints.filter(c => c.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setComplaintFilter('accepted')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    complaintFilter === 'accepted'
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đã chấp thuận ({complaints.filter(c => c.status === 'accepted').length})
                </button>
                <button
                  type="button"
                  onClick={() => setComplaintFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    complaintFilter === 'rejected'
                      ? 'bg-slate-700 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Đã từ chối ({complaints.filter(c => c.status === 'rejected').length})
                </button>
              </div>
            </div>

            {complaintBannerMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{complaintBannerMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setComplaintBannerMsg(null)}
                  className="p-1 hover:bg-emerald-200/60 rounded text-emerald-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Complaints List */}
            {complaints.filter(c => complaintFilter === 'all' || c.status === complaintFilter).length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <MessageSquareQuote className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">
                  Không Có Đơn Khiếu Nại Nào
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hiện tại không có học sinh nào gửi đơn khiếu nại hoặc phúc khảo trong danh mục này.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints
                  .filter(c => complaintFilter === 'all' || c.status === complaintFilter)
                  .map((comp) => {
                    const targetSub = submissions.find(s => s.id === comp.submissionId);
                    const currentScore = comp.originalScore;
                    const defaultAdjust = comp.adjustedScore !== undefined ? comp.adjustedScore : +(Math.min(10, currentScore + 0.5).toFixed(2));
                    const adjustedVal = complaintAdjustedScores[comp.id] !== undefined ? complaintAdjustedScores[comp.id] : defaultAdjust;
                    const currentNote = complaintReviewNotes[comp.id] !== undefined
                      ? complaintReviewNotes[comp.id]
                      : comp.teacherFeedback || '';

                    return (
                      <div
                        key={comp.id}
                        className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                          comp.status === 'pending'
                            ? 'border-amber-300 ring-1 ring-amber-300/40 bg-gradient-to-b from-amber-50/20 to-white'
                            : comp.status === 'accepted'
                            ? 'border-emerald-200 hover:border-emerald-300'
                            : 'border-slate-200 opacity-90'
                        }`}
                      >
                        {/* Complaint Card Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={comp.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                            />
                            <div>
                              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <span>{comp.studentName}</span>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                                  Lớp {comp.className || (classes.length > 0 ? classes[0].name : '')}
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Mã đề #{comp.variantCode}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {comp.examTitle} • Gửi lúc: {new Date(comp.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              comp.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : comp.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                            }`}>
                              {comp.status === 'accepted'
                                ? 'Đã Chấp Thuận (+điểm)'
                                : comp.status === 'rejected'
                                ? 'Đã Từ Chối'
                                : 'Đang Chờ Thầy/Cô Xem Xét'}
                            </span>

                            {targetSub && (
                              <button
                                type="button"
                                onClick={() => setGradingSubmission(targetSub)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Mở Bài Làm</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Complaint Content */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                          <div className="md:col-span-8 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
                                Phần khiếu nại: {comp.questionNumber || 'Toàn bài thi'}
                              </span>
                              <span className="text-slate-500 font-semibold">
                                Điểm ban đầu: <strong className="text-slate-800">{comp.originalScore} đ</strong>
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                              <div className="font-bold text-slate-800">Lý do học sinh khiếu nại:</div>
                              <p className="text-slate-700 leading-relaxed italic">
                                "{comp.complaintReason}"
                              </p>
                            </div>

                            {comp.studentEvidence && (
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                <div className="font-bold text-slate-800">Dẫn chứng học sinh bổ sung:</div>
                                <p className="text-slate-600 leading-relaxed">
                                  {comp.studentEvidence}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Teacher Action Box */}
                          <div className="md:col-span-4 bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3 flex flex-col justify-between">
                            {comp.status === 'pending' ? (
                              <>
                                <div className="space-y-2">
                                  <label className="font-bold text-slate-800 block text-xs">
                                    Xử lý phúc khảo của Thầy/Cô:
                                  </label>
                                  <div>
                                    <span className="text-[11px] text-slate-600 block mb-1">
                                      Điểm số sau điều chỉnh (Tối đa 10đ):
                                    </span>
                                    <input
                                      type="number"
                                      step="0.25"
                                      min="0"
                                      max="10"
                                      value={adjustedVal}
                                      onChange={(e) => {
                                        const v = parseFloat(e.target.value) || 0;
                                        setComplaintAdjustedScores(prev => ({ ...prev, [comp.id]: v }));
                                      }}
                                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                  </div>

                                  <div>
                                    <span className="text-[11px] text-slate-600 block mb-1">
                                      Lời nhận xét / Lời phê cho học sinh:
                                    </span>
                                    <textarea
                                      rows={2}
                                      value={currentNote}
                                      onChange={(e) => setComplaintReviewNotes(prev => ({ ...prev, [comp.id]: e.target.value }))}
                                      placeholder="Ví dụ: Thầy đã xem lại bài, em tính đúng đạo hàm, cộng thêm 0.5đ..."
                                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      resolveComplaint(
                                        comp.id,
                                        'rejected',
                                        comp.originalScore,
                                        currentNote || 'Giáo viên đã kiểm tra lại, bài làm chưa đáp ứng đủ yêu cầu theo barem chuẩn.'
                                      );
                                      setComplaintBannerMsg(`Đã từ chối khiếu nại của học sinh ${comp.studentName}.`);
                                    }}
                                    className="flex-1 py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                  >
                                    Từ chối
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      resolveComplaint(
                                        comp.id,
                                        'accepted',
                                        adjustedVal,
                                        currentNote || `Thầy/Cô đã phúc khảo và chấp thuận cộng điểm lên ${adjustedVal}đ.`
                                      );
                                      setComplaintBannerMsg(`Đã chấp thuận phúc khảo cho học sinh ${comp.studentName}! Điểm mới: ${adjustedVal} đ.`);
                                    }}
                                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Cộng điểm</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <div className="font-bold text-slate-800 flex items-center justify-between">
                                  <span>Kết quả đã xử lý:</span>
                                  <span className={`text-xs ${comp.status === 'accepted' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    {comp.status === 'accepted' ? `Điểm mới: ${comp.adjustedScore || comp.originalScore} đ` : 'Giữ nguyên điểm'}
                                  </span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                                  <strong>Lời phê:</strong> "{comp.teacherFeedback || 'Đã xử lý'}"
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    resolveComplaint(comp.id, 'pending');
                                    setComplaintBannerMsg(`Đã mở lại đơn khiếu nại của ${comp.studentName} để xem xét lại.`);
                                  }}
                                  className="w-full text-center py-1.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-700 underline cursor-pointer"
                                >
                                  Mở lại đơn để xem xét lại
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALS */}
      <VariantGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenAssign={() => setIsAssignModalOpen(true)}
      />

      <VariantPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onOpenAssign={() => setIsAssignModalOpen(true)}
      />

      <GradingModal
        submission={gradingSubmission}
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
      />

      <GradebookHistoryModal
        record={historyRecord}
        isOpen={!!historyRecord}
        onClose={() => setHistoryRecord(null)}
        onViewSubmission={(sub) => {
          setHistoryRecord(null);
          setGradingSubmission(sub);
        }}
      />

      <CreateOrRecreateExamModal
        isOpen={isCreateOrRecreateOpen}
        onClose={() => setIsCreateOrRecreateOpen(false)}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenAssign={() => setIsAssignModalOpen(true)}
        initialTab={createModalTab}
      />

      <AssignExamModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        exam={exam}
        onAssignSuccess={(msg) => setAssignSuccessBanner(msg)}
      />

      {/* CONFIRM DELETE EXAM MODAL */}
      {examToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Đề Thi?</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Thầy/Cô có chắc chắn muốn xóa đề thi <strong>"{examToDelete.title}"</strong> không? Toàn bộ các mã đề và dữ liệu bài làm liên quan của đề thi này sẽ bị xóa khỏi hệ thống.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExam(examToDelete.id);
                  setExamToDelete(null);
                  setAssignSuccessBanner(`Đã xóa đề thi "${examToDelete.title}" thành công.`);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT SCORE MODAL */}
      {editingScoreStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Điều Chỉnh Điểm Số: {editingScoreStudent.studentName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cập nhật điểm trong sổ điểm điện tử
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingScoreStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Điểm số mới (Thang điểm 10):
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={newScoreVal}
                  onChange={(e) => setNewScoreVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-base text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ví dụ: 8.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Lý do điều chỉnh / Ghi chú của giáo viên:
                </label>
                <textarea
                  rows={3}
                  value={scoreTeacherNote}
                  onChange={(e) => setScoreTeacherNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-xs"
                  placeholder="Ví dụ: Đã chấm lại phần tự luận, bổ sung điểm do lời giải chính xác..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingScoreStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const num = parseFloat(newScoreVal);
                  if (isNaN(num) || num < 0 || num > 10) {
                    alert('Vui lòng nhập điểm hợp lệ từ 0 đến 10!');
                    return;
                  }
                  if (editingScoreStudent.submissionId) {
                    updateSubmissionScore(editingScoreStudent.submissionId, num, scoreTeacherNote);
                  } else {
                    const newSub: Submission = {
                      id: `sub-manual-${editingScoreStudent.studentId}-${Date.now()}`,
                      examId: exam?.id || 'exam-custom',
                      examTitle: exam?.title || 'Bài kiểm tra',
                      studentId: editingScoreStudent.studentId,
                      studentName: editingScoreStudent.studentName,
                      studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
                      variantCode: '101',
                      submittedAt: new Date().toISOString(),
                      violationsCount: 0,
                      violationLogs: [],
                      answers: {},
                      mcqScore: +(num * 0.8).toFixed(1),
                      essayScore: +(num * 0.2).toFixed(1),
                      totalScore: num,
                      status: 'confirmed',
                      teacherReviewNotes: scoreTeacherNote || 'Điểm do giáo viên điều chỉnh trực tiếp trên bảng điểm.',
                    };
                    addSubmission(newSub);
                  }
                  setEditingScoreStudent(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu Điểm Số</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE STUDENT SCORE MODAL */}
      {scoreToDeleteStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Điểm Học Sinh?</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Thầy/Cô có chắc chắn muốn xóa điểm bài thi của học sinh <strong>"{scoreToDeleteStudent.studentName}"</strong>? Dữ liệu bài làm và điểm số sẽ được xóa khỏi bảng điểm để học sinh có thể làm lại hoặc cập nhật điểm mới.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScoreToDeleteStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (scoreToDeleteStudent.submissionId) {
                    deleteSubmission(scoreToDeleteStudent.submissionId);
                  } else {
                    const targetSubs = submissions.filter(
                      s => s.studentId === scoreToDeleteStudent.studentId && (exam ? s.examId === exam.id : true)
                    );
                    targetSubs.forEach(s => deleteSubmission(s.id));
                  }
                  setScoreToDeleteStudent(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Xác Nhận Xóa Điểm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
