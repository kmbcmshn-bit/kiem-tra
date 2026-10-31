import React from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherMenuTab } from '../teacher/TeacherDashboard';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  FileCheck,
  Layers,
  Settings,
  Users,
  Trophy,
  MessageSquareQuote,
  Flame,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  Clock,
  Award,
  ChevronRight,
  School,
  X
} from 'lucide-react';

interface AppSidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeStudentTab: string;
  setActiveStudentTab: (tab: string) => void;
  activeTeacherTab: TeacherMenuTab;
  setActiveTeacherTab: (tab: TeacherMenuTab) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  activeStudentTab,
  setActiveStudentTab,
  activeTeacherTab,
  setActiveTeacherTab,
}) => {
  const {
    role,
    setRole,
    currentStudent,
    setCurrentStudentId,
    students,
    studentLogout,
    teacherProfile,
    teacherLogout,
    isAuthenticated,
    exam,
    submissions,
    complaints,
    checkActiveExamDraft,
  } = useApp();

  const studentId = currentStudent?.id || '';
  const assignedCode = (exam && studentId) ? (exam.assignedCodes[studentId] || '101') : '101';
  const hasDraft = studentId ? !!checkActiveExamDraft(studentId) : false;
  const mySubmissionsCount = studentId ? submissions.filter(s => s.studentId === studentId).length : 0;
  const myComplaintsCount = studentId ? complaints.filter(c => c.studentId === studentId).length : 0;

  // Teacher pending badges
  const pendingGradingCount = submissions.filter(s => s.status === 'pending_ai').length;
  const pendingComplaintsCount = complaints.filter(c => c.status === 'pending').length;

  const xpPercent = currentStudent
    ? Math.min(100, Math.round((currentStudent.xp / currentStudent.xpToNextLevel) * 100))
    : 0;

  const handleStudentNav = (tab: string) => {
    setActiveStudentTab(tab);
    onCloseMobile();
  };

  const handleTeacherNav = (tab: TeacherMenuTab) => {
    setActiveTeacherTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 shadow-lg lg:shadow-none flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 1. Header & Logo */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 bg-clip-text text-transparent">
                  LMS EduSmart
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                  2018
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                {role === 'teacher' ? 'Cổng Giáo Viên' : 'Cổng Học Sinh'}
              </p>
            </div>
          </div>

          {/* Close on mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Single Role Banner (Displays only the current logged-in portal) */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          {role === 'teacher' ? (
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-emerald-950">Cổng Giáo Viên</span>
              </div>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-emerald-950">Cổng Học Sinh</span>
              </div>
              {currentStudent ? (
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                  {currentStudent.className || 'Học sinh'}
                </span>
              ) : (
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                  Chưa đăng nhập
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-xs font-medium scrollbar-thin">
          {/* ================= TEACHER MENU ================= */}
          {role === 'teacher' && (
            <div className="space-y-4">
              {/* Category: Tổ chức & Giảng dạy */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tổ Chức & Giảng Dạy
                </div>

                <button
                  type="button"
                  onClick={() => handleTeacherNav('overview')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTeacherTab === 'overview'
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeTeacherTab === 'overview' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">Bảng Điều Khiển</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherNav('classes')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTeacherTab === 'classes'
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 ${activeTeacherTab === 'classes' ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>Lớp & Học Sinh</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md font-mono font-semibold">
                    {students.length} HS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherNav('lessons')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTeacherTab === 'lessons'
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 ${activeTeacherTab === 'lessons' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">Bài Giảng & Giáo Án</span>
                </button>
              </div>

              {/* Category: Khảo thí & Chấm thi */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Khảo Thí & Chấm Điểm
                </div>

                <button
                  type="button"
                  onClick={() => handleTeacherNav('exams')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTeacherTab === 'exams'
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4 h-4 ${activeTeacherTab === 'exams' ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>Đề Thi & Đa Mã Đề</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-mono font-bold">
                    {exam ? Object.keys(exam.variants || {}).length : 0} mã
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherNav('grading')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTeacherTab === 'grading'
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileCheck2 className={`w-4 h-4 ${activeTeacherTab === 'grading' ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>Chấm Thi AI & Tự Luận</span>
                  </div>
                  {pendingGradingCount > 0 && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md font-bold">
                      {pendingGradingCount} bài
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherNav('complaints')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTeacherTab === 'complaints'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquareQuote className={`w-4 h-4 ${activeTeacherTab === 'complaints' ? 'text-white' : 'text-amber-500'}`} />
                    <span>Hộp Thư Phúc Khảo</span>
                  </div>
                  {pendingComplaintsCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTeacherTab === 'complaints'
                        ? 'bg-white text-amber-900'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {pendingComplaintsCount} đơn mới
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTeacherNav('gradebook')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTeacherTab === 'gradebook'
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className={`w-4 h-4 ${activeTeacherTab === 'gradebook' ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>Sổ Điểm Điện Tử</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md font-mono">
                    {submissions.length} bài
                  </span>
                </button>
              </div>

              {/* Category: Cấu hình */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cấu Hình
                </div>

                <button
                  type="button"
                  onClick={() => handleTeacherNav('ai_config')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTeacherTab === 'ai_config'
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className={`w-4 h-4 ${activeTeacherTab === 'ai_config' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">Cài Đặt AI & Barem Điểm</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STUDENT MENU ================= */}
          {role === 'student' && (
            <div className="space-y-4">
              {!currentStudent ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800 text-xs">Cổng Học Sinh</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Vui lòng đăng nhập tài khoản học sinh ở khung bên phải để làm bài thi và tra cứu điểm số.
                  </p>
                </div>
              ) : (
                <>
                  {/* Category: Học tập & Rèn luyện */}
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Học Tập & Rèn Luyện
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStudentNav('dashboard')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        activeStudentTab === 'dashboard'
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className={`w-4 h-4 ${activeStudentTab === 'dashboard' ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span className="flex-1 text-left">Góc Học Tập & Tiến Độ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStudentNav('lessons')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        activeStudentTab === 'lessons'
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className={`w-4 h-4 ${activeStudentTab === 'lessons' ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span className="flex-1 text-left">Bài Giảng & Ôn Tập</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStudentNav('exam')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        activeStudentTab === 'exam'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : hasDraft
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className={`w-4 h-4 ${activeStudentTab === 'exam' ? 'text-white' : hasDraft ? 'text-amber-600' : 'text-emerald-600'}`} />
                        <span>Phòng Thi Trực Tuyến</span>
                      </div>
                      {hasDraft ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white animate-pulse">
                          Đang làm dở
                        </span>
                      ) : exam ? (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                          activeStudentTab === 'exam' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          Mã #{assignedCode}
                        </span>
                      ) : null}
                    </button>
                  </div>

                  {/* Category: Kết quả & Phúc khảo */}
                  <div className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kết Quả & Phúc Khảo
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStudentNav('history')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        activeStudentTab === 'history'
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck className={`w-4 h-4 ${activeStudentTab === 'history' ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span>Lịch Sử & Điểm Số</span>
                      </div>
                      {mySubmissionsCount > 0 && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md font-bold">
                          {mySubmissionsCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStudentNav('complaints')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        activeStudentTab === 'complaints'
                          ? 'bg-amber-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquareQuote className={`w-4 h-4 ${activeStudentTab === 'complaints' ? 'text-white' : 'text-amber-500'}`} />
                        <span>Phúc Khảo Điểm Số</span>
                      </div>
                      {myComplaintsCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                          activeStudentTab === 'complaints'
                            ? 'bg-white text-amber-900'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {myComplaintsCount} đơn
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStudentNav('leaderboard')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        activeStudentTab === 'leaderboard'
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Trophy className={`w-4 h-4 ${activeStudentTab === 'leaderboard' ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span className="flex-1 text-left">Bảng Vinh Danh Lớp</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 4. Bottom User Profile Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          {role === 'teacher' && isAuthenticated && (
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={teacherProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-600/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-xs truncate">
                    {teacherProfile?.name || 'Thầy Trịnh Tuấn Kiệt'}
                  </div>
                  <div className="text-[10px] text-emerald-700 truncate">
                    {teacherProfile?.schoolName || 'THPT Võ Thị Sáu'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={teacherLogout}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất Giáo viên</span>
              </button>
            </div>
          )}

          {role === 'student' && currentStudent && (
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={currentStudent.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {currentStudent.name}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium truncate">
                      {currentStudent.className ? `Lớp ${currentStudent.className}` : 'Học Sinh'} • Cấp {currentStudent.level}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{currentStudent.streakDays}d</span>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{currentStudent.badgeTitle}</span>
                  <span className="font-mono">{currentStudent.xp}/{currentStudent.xpToNextLevel} XP</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              {/* Student Switcher / Logout */}
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <div className="relative group">
                  <button
                    type="button"
                    className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Đổi tài khoản</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-full left-0 mb-1 w-56 max-h-56 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 hidden group-hover:block z-50">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                      Chọn học sinh khác
                    </div>
                    {students.slice(0, 15).map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCurrentStudentId(st.id)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                          st.id === currentStudent.id
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{st.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{st.className}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={studentLogout}
                  className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}

          {role === 'student' && !currentStudent && (
            <div className="text-center py-1">
              <span className="text-[11px] text-slate-400">Học sinh chưa đăng nhập</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
