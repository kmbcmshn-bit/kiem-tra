import React from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Sparkles,
  Trophy,
  Flame,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  Award,
  BellRing,
  FileCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    role,
    setRole,
    students,
    currentStudent,
    setCurrentStudentId,
    exam,
    studentLogout,
    teacherProfile,
    teacherLogout,
    submissions,
    isAuthenticated,
    checkActiveExamDraft,
  } = useApp();

  const assignedCode = (exam && currentStudent) ? (exam.assignedCodes[currentStudent.id] || '101') : '101';
  const xpPercent = currentStudent
    ? Math.min(100, Math.round((currentStudent.xp / currentStudent.xpToNextLevel) * 100))
    : 0;

  const mySubmissionsCount = currentStudent
    ? submissions.filter(s => s.studentId === currentStudent.id).length
    : 0;

  const hasDraft = currentStudent ? !!checkActiveExamDraft(currentStudent.id) : false;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-900 bg-clip-text text-transparent">
                  LMS EduSmart
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Hệ thống Tự học & Kiểm tra Đa mã đề AI • {teacherProfile?.name || 'Giáo Viên'}
              </p>
            </div>
          </div>

          {/* Role Toggle Switcher */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  role === 'student'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Học Sinh</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  role === 'teacher'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Giáo Viên (Admin)</span>
              </button>
            </div>

            {/* If Student Role: Show Student Selector & Gamification status */}
            {role === 'student' && currentStudent && (
              <div className="flex items-center gap-3">
                {/* Student Selector Dropdown */}
                <div className="relative group">
                  <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors cursor-pointer text-xs font-medium text-slate-700">
                    <img
                      src={currentStudent.avatar}
                      alt={currentStudent.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div className="text-left hidden md:block">
                      <div className="font-semibold text-slate-800 leading-tight">
                        {currentStudent.name}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">
                        {currentStudent.className || 'Lớp'} • Mã: #{assignedCode}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  </div>

                  {/* Dropdown list of students */}
                  <div className="absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 hidden group-hover:block z-50">
                    <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Đổi tài khoản học sinh</span>
                      <button
                        type="button"
                        onClick={studentLogout}
                        className="text-red-600 hover:underline font-normal text-[10px]"
                      >
                        Đăng xuất
                      </button>
                    </div>
                    {students.slice(0, 20).map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCurrentStudentId(st.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg text-left transition-colors ${
                          st.id === currentStudent.id
                            ? 'bg-emerald-50 text-emerald-800 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img src={st.avatar} alt="" className="w-5 h-5 rounded-full" />
                          <span className="truncate">{st.name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-mono">
                          {st.className || 'Lớp'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gamification Bar */}
                <div className="hidden lg:flex items-center gap-4 bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentStudent.level}
                    </div>
                    <div className="leading-tight">
                      <div className="text-[11px] font-bold text-emerald-900 truncate max-w-[110px]">
                        {currentStudent.badgeTitle}
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        {currentStudent.xp} / {currentStudent.xpToNextLevel} XP
                      </div>
                    </div>
                  </div>

                  {/* XP Bar */}
                  <div className="w-20 bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                    <span>{currentStudent.streakDays}d</span>
                  </div>
                </div>
              </div>
            )}

            {/* If Teacher Role: Show Teacher Badge & Logout */}
            {role === 'teacher' && isAuthenticated && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs">
                  <img
                    src={teacherProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-600/30"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-emerald-950 leading-tight">
                      {teacherProfile?.name || 'Thầy Trịnh Tuấn Kiệt'}
                    </div>
                    <div className="text-[10px] text-emerald-700">
                      {teacherProfile?.schoolName || 'THPT Võ Thị Sáu'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={teacherLogout}
                    className="ml-1 text-[11px] font-bold text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Đăng xuất giáo viên"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Sub-Navigation Tabs */}
        {role === 'student' && currentStudent && (
          <nav className="flex space-x-2 sm:space-x-4 border-t border-slate-100 pt-1 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Góc Học Tập & Tiết Học</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exam')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors relative ${
                activeTab === 'exam'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : hasDraft
                  ? 'text-amber-900 bg-amber-100 hover:bg-amber-200 ring-1 ring-amber-400 font-bold'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Phòng Thi Kiểm Tra {exam ? `(Mã ${assignedCode})` : '(Chưa có đề)'}</span>
              {hasDraft ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white animate-pulse">
                  Đang làm dở
                </span>
              ) : exam ? (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Lịch Sử & Điểm Số</span>
              {mySubmissionsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {mySubmissionsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Bảng Vinh Danh Lớp</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
