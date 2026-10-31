import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentHistoryView } from './components/student/StudentHistoryView';
import { StudentComplaintsView } from './components/student/StudentComplaintsView';
import { ExamRoom } from './components/student/ExamRoom';
import { Leaderboard } from './components/student/Leaderboard';
import { StudentLogin } from './components/student/StudentLogin';
import { TeacherDashboard, TeacherMenuTab } from './components/teacher/TeacherDashboard';
import { AuthScreen } from './components/auth/AuthScreen';
import { Footer } from './components/Footer';

const TEACHER_TITLES: Record<TeacherMenuTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Bảng Điều Khiển Giáo Viên',
    subtitle: 'Tổng quan tiến độ dạy học, đề thi trực tuyến và kết quả kiểm tra khối 12',
  },
  classes: {
    title: 'Quản Lý Lớp Học & Học Sinh',
    subtitle: 'Danh sách lớp, tài khoản học sinh và phân bổ mã đề kiểm tra',
  },
  lessons: {
    title: 'Bài Giảng & Giáo Án Điện Tử',
    subtitle: 'Nội dung bài học, tài liệu video, slide và thiết lập khóa/mở bài',
  },
  exams: {
    title: 'Ngân Hàng Đề Thi & Đa Mã Đề',
    subtitle: 'Tổ chức kiểm tra, ma trận chuẩn GDPT 2018 và sinh đa mã đề tương đương',
  },
  grading: {
    title: 'Chấm Thi Trực Tuyến & AI Tự Luận',
    subtitle: 'Chấm trắc nghiệm tự động và phân tích bài làm tự luận bằng AI',
  },
  complaints: {
    title: 'Hộp Thư Phúc Khảo & Khiếu Nại Điểm',
    subtitle: 'Xử lý các đơn khiếu nại chấm sai của học sinh và điều chỉnh điểm số',
  },
  gradebook: {
    title: 'Sổ Điểm Điện Tử',
    subtitle: 'Bảng điểm chi tiết, thống kê phổ điểm và xuất báo cáo',
  },
  ai_config: {
    title: 'Cài Đặt Barem & Trọng Số AI',
    subtitle: 'Thiết lập tiêu chí đánh giá tự luận và quy tắc cộng/trừ điểm',
  },
};

const STUDENT_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Góc Học Tập & Tiến Độ',
    subtitle: 'Theo dõi mục tiêu tuần, bài thi cần làm và tiến độ các môn học',
  },
  lessons: {
    title: 'Kho Bài Giảng & Lý Thuyết Tương Tác',
    subtitle: 'Bài giảng video, slide bài học, mô phỏng toán học Geogebra và câu hỏi ôn tập',
  },
  exam: {
    title: 'Phòng Thi Kiểm Tra Trực Tuyến',
    subtitle: 'Làm bài thi trắc nghiệm và tự luận với công nghệ lưu bài tự động an toàn',
  },
  history: {
    title: 'Lịch Sử Bài Làm & Tra Cứu Điểm Số',
    subtitle: 'Xem lại toàn bộ bài thi đã nộp, lời giải chi tiết và nhận xét của giáo viên',
  },
  complaints: {
    title: 'Hộp Thư Phúc Khảo Điểm Số',
    subtitle: 'Theo dõi đơn khiếu nại điểm thi và gửi yêu cầu phúc khảo nếu hệ thống chấm sai',
  },
  leaderboard: {
    title: 'Bảng Vinh Danh Lớp Học',
    subtitle: 'Top học sinh xuất sắc, chuỗi ngày chăm chỉ và cấp bậc danh hiệu',
  },
};

function MainApp() {
  const { role, currentStudent, isAuthenticated } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [activeStudentTab, setActiveStudentTab] = useState<string>('dashboard');
  const [activeTeacherTab, setActiveTeacherTab] = useState<TeacherMenuTab>('overview');

  // Compute active title and subtitle for top bar
  const currentHeaderInfo =
    role === 'teacher'
      ? TEACHER_TITLES[activeTeacherTab] || { title: 'Cổng Quản Trị Giáo Viên', subtitle: '' }
      : !currentStudent
      ? { title: 'Cổng Học Sinh - Đăng Nhập', subtitle: 'Đăng nhập để vào phòng thi và học bài' }
      : STUDENT_TITLES[activeStudentTab] || { title: 'Hệ Thống Học Trực Tuyến', subtitle: '' };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. LEFT VERTICAL SIDEBAR NAVIGATION */}
      <AppSidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeStudentTab={activeStudentTab}
        setActiveStudentTab={setActiveStudentTab}
        activeTeacherTab={activeTeacherTab}
        setActiveTeacherTab={setActiveTeacherTab}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Navbar Header */}
        <TopNavbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activeTitle={currentHeaderInfo.title}
          activeSubtitle={currentHeaderInfo.subtitle}
          onGoToExam={() => setActiveStudentTab('exam')}
        />

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {role === 'student' ? (
            !currentStudent ? (
              <AuthScreen
                initialRole="student"
                onSuccess={() => setActiveStudentTab('dashboard')}
              />
            ) : (
              <>
                {activeStudentTab === 'dashboard' && (
                  <StudentDashboard
                    onGoToExam={() => setActiveStudentTab('exam')}
                    onGoToHistory={() => setActiveStudentTab('history')}
                    onGoToComplaints={() => setActiveStudentTab('complaints')}
                    onGoToLessons={() => setActiveStudentTab('lessons')}
                    viewMode="overview"
                  />
                )}

                {activeStudentTab === 'lessons' && (
                  <StudentDashboard
                    onGoToExam={() => setActiveStudentTab('exam')}
                    onGoToHistory={() => setActiveStudentTab('history')}
                    onGoToComplaints={() => setActiveStudentTab('complaints')}
                    viewMode="lessons"
                  />
                )}

                {activeStudentTab === 'exam' && (
                  <ExamRoom
                    onBackToDashboard={() => setActiveStudentTab('dashboard')}
                    onGoToHistory={() => setActiveStudentTab('history')}
                  />
                )}

                {activeStudentTab === 'history' && (
                  <StudentHistoryView
                    onBack={() => setActiveStudentTab('dashboard')}
                    onGoToExam={() => setActiveStudentTab('exam')}
                  />
                )}

                {activeStudentTab === 'complaints' && (
                  <StudentComplaintsView
                    onGoToHistory={() => setActiveStudentTab('history')}
                    onGoToExam={() => setActiveStudentTab('exam')}
                  />
                )}

                {activeStudentTab === 'leaderboard' && <Leaderboard />}
              </>
            )
          ) : (
            !isAuthenticated ? (
              <AuthScreen onSuccess={() => {}} />
            ) : (
              <TeacherDashboard
                activeMenu={activeTeacherTab}
                onSelectMenu={setActiveTeacherTab}
                hideSidebar={true}
              />
            )
          )}
        </main>

        {/* Bottom Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

