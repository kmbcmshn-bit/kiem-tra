import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  GraduationCap,
  Sparkles,
  Flame,
  Award,
  Clock,
  ShieldCheck,
  UserCheck,
  BellRing
} from 'lucide-react';

interface TopNavbarProps {
  onOpenMobileSidebar: () => void;
  activeTitle: string;
  activeSubtitle?: string;
  onGoToExam?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenMobileSidebar,
  activeTitle,
  activeSubtitle,
  onGoToExam,
}) => {
  const {
    role,
    setRole,
    currentStudent,
    teacherProfile,
    exam,
    checkActiveExamDraft,
  } = useApp();

  const studentId = currentStudent?.id || '';
  const assignedCode = (exam && studentId) ? (exam.assignedCodes[studentId] || '101') : '101';
  const hasDraft = studentId ? !!checkActiveExamDraft(studentId) : false;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle + Breadcrumbs Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{activeTitle}</span>
          </h1>
          {activeSubtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">
              {activeSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Quick Context Badges */}
      <div className="flex items-center gap-3">
        {/* Student badges */}
        {role === 'student' && currentStudent && (
          <div className="flex items-center gap-2 sm:gap-3">
            {hasDraft && onGoToExam && (
              <button
                type="button"
                onClick={onGoToExam}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-200 transition-colors animate-pulse cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Bài thi đang dở: Tiếp tục</span>
                <span className="sm:hidden">Làm tiếp</span>
              </button>
            )}

            {exam && !hasDraft && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Mã Đề #{assignedCode}</span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{currentStudent.streakDays}d Streak</span>
            </div>
          </div>
        )}

        {/* Teacher badges */}
        {role === 'teacher' && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{teacherProfile?.schoolName || 'THPT GDPT 2018'}</span>
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
