import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  Key,
  User,
  School,
  Mail,
  Phone,
  BookOpen,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCheck2,
  HelpCircle
} from 'lucide-react';

interface AuthModalProps {
  onSuccess?: () => void;
  initialRole?: UserRole;
}

export const AuthScreen: React.FC<AuthModalProps> = ({ onSuccess, initialRole }) => {
  const {
    role,
    setRole,
    classes,
    students,
    studentLogin,
    setCurrentStudentId,
    teacherProfile,
    teacherLogin,
    teacherRegister,
    isAuthenticated,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || role || 'student');

  React.useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Student Login Form state (No class selection needed: username/code auto-identifies class)
  const [studentUsername, setStudentUsername] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState<string>('');

  // Teacher Login Form state (Supports username or email)
  const [teacherAccount, setTeacherAccount] = useState<string>(teacherProfile?.username || teacherProfile?.email || 'tuankiet');
  const [teacherPassword, setTeacherPassword] = useState<string>('123456');

  // Teacher Register Form state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regSchool, setRegSchool] = useState<string>('THPT Võ Thị Sáu');
  const [regSubject, setRegSubject] = useState<string>('Toán học THPT');
  const [regPhone, setRegPhone] = useState<string>('');

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Handle Student Login
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!studentUsername.trim()) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập, Mã học sinh (vnEdu) hoặc Họ và tên của em.');
      return;
    }

    const res = studentLogin(studentUsername.trim(), studentPassword.trim());
    if (res.success && res.student) {
      setSuccessMsg(`Đăng nhập thành công! Chào mừng em ${res.student.name} (Lớp ${res.student.className}).`);
      setRole('student');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMsg(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  // Handle Teacher Login (Supports username or email)
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!teacherAccount.trim()) {
      setErrorMsg('Vui lòng nhập Tên đăng nhập hoặc Email của Giáo viên.');
      return;
    }

    const res = teacherLogin(teacherAccount.trim(), teacherPassword.trim());
    if (res.success) {
      setSuccessMsg(`Đăng nhập thành công! Chào mừng ${res.teacher.name}.`);
      setRole('teacher');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setErrorMsg(res.message || 'Mật khẩu hoặc tên đăng nhập/email giáo viên chưa đúng.');
    }
  };

  // Handle Teacher Register
  const handleTeacherRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ Họ và tên cùng Email của Giáo viên.');
      return;
    }

    const res = teacherRegister({
      name: regName.trim(),
      email: regEmail.trim(),
      username: regUsername.trim() || regEmail.trim().split('@')[0],
      phone: regPhone.trim(),
      schoolName: regSchool.trim() || 'THPT',
      subject: regSubject.trim() || 'Toán học',
    }, regPassword.trim() || '123456');

    if (res.success) {
      setSuccessMsg(`Đăng ký tài khoản Giáo viên thành công! Chào mừng Thầy/Cô ${res.teacher.name}.`);
      setRole('teacher');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 600);
    } else {
      setErrorMsg(res.message || 'Đăng ký không thành công.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 animate-fadeIn">
      {/* Brand Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
          <GraduationCap className="w-9 h-9 stroke-[2.2]" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            LMS EduSmart GDPT 2018
          </h1>
          <span className="px-2 py-0.5 text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
            Trực Tuyến
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Cổng Đăng Ký & Đăng Nhập dành cho Giáo Viên và Học Sinh làm bài kiểm tra Đa mã đề AI
        </p>
      </div>

      {/* Main Auth Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Role Selector Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-100 text-sm font-bold bg-slate-50/70">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('student');
              setRole('student');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-4 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              selectedRole === 'student'
                ? 'bg-white border-emerald-600 text-emerald-800 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Dành Cho Học Sinh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('teacher');
              setRole('teacher');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-4 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
              selectedRole === 'teacher'
                ? 'bg-white border-emerald-700 text-emerald-900 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Dành Cho Giáo Viên (Admin)</span>
          </button>
        </div>

        {/* Feedback alert */}
        {errorMsg && (
          <div className="m-6 mb-0 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-6 mb-0 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ROLE 1: STUDENT VIEW (Clean single-column login form, no quick-select account list) */}
        {selectedRole === 'student' && (
          <div className="p-6 sm:p-10 max-w-lg mx-auto space-y-5">
            <div className="border-b border-slate-100 pb-3 text-center">
              <h3 className="font-bold text-slate-900 text-lg flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5 text-emerald-600" />
                <span>Đăng Nhập Tài Khoản Học Sinh</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Nhập Tên đăng nhập, Mã học sinh (vnEdu) hoặc Họ tên cùng Mật khẩu do Thầy/Cô cấp
              </p>
            </div>

            <form onSubmit={handleStudentLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên đăng nhập, Mã học sinh (vnEdu) hoặc Họ và tên:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={studentUsername}
                    onChange={(e) => setStudentUsername(e.target.value)}
                    placeholder="Ví dụ: tranan11a1vts2627 hoặc Trần Thái An..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Hệ thống tự động nhận diện chính xác lớp học của em qua cấu trúc Tên đăng nhập / Mã học sinh.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mật khẩu:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Mật khẩu do Thầy/Cô cấp (mặc định: 123456)..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Mật khẩu mặc định do Giáo viên cấp là: <strong>123456</strong>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Vào Hệ Thống</span>
              </button>
            </form>

            {/* Hint box */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tài khoản học sinh trải nghiệm mẫu:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Em có thể nhập: Tên đăng nhập <strong>tranan11a1vts2627</strong> (hoặc họ tên <strong>Trần Thái An</strong>), Mật khẩu: <strong>123456</strong> để đăng nhập ngay mà không cần chọn lớp.
              </p>
            </div>
          </div>
        )}

        {/* ROLE 2: TEACHER VIEW (Login & Register Tabs) */}
        {selectedRole === 'teacher' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Teacher Sub-tabs: Login or Register */}
            <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 rounded-xl max-w-xs mx-auto border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Nhập Giáo Viên
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Đăng Ký Giáo Viên Mới
              </button>
            </div>

            {/* TAB 1: TEACHER LOGIN */}
            {activeTab === 'login' && (
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">
                    Đăng Nhập Quản Trị Giáo Viên
                  </h3>
                  <p className="text-xs text-slate-500">
                    Quản lý lớp học, up file danh sách, tạo đề & giám sát học sinh làm bài
                  </p>
                </div>

                <form onSubmit={handleTeacherLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tên đăng nhập hoặc Email của Giáo viên:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={teacherAccount}
                        onChange={(e) => setTeacherAccount(e.target.value)}
                        placeholder="Ví dụ: tuankiet hoặc tuankiet.toan@edusmart.edu.vn"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      * Đăng nhập linh hoạt bằng <strong>Tên đăng nhập</strong> (ví dụ: <code className="text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.5 rounded">tuankiet</code>) hoặc <strong>Email</strong>
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Mật khẩu:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        placeholder="Nhập mật khẩu giáo viên (mặc định: 123456)..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-xs shadow-md shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Đăng Nhập Vào Bảng Quản Trị Giáo Viên</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: TEACHER REGISTER */}
            {activeTab === 'register' && (
              <div className="max-w-lg mx-auto space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">
                    Đăng Ký Tài Khoản Giáo Viên Mới
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khởi tạo phòng dạy học, tạo lớp học và tải danh sách học sinh
                  </p>
                </div>

                <form onSubmit={handleTeacherRegister} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Họ và tên Giáo viên *:
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Thầy / Cô Nguyễn Văn A..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Email liên hệ *:
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="giaovien@school.edu.vn..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Tên đăng nhập (tùy chọn):
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Ví dụ: tuankiet..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Trường học công tác:
                      </label>
                      <input
                        type="text"
                        value={regSchool}
                        onChange={(e) => setRegSchool(e.target.value)}
                        placeholder="THPT Võ Thị Sáu..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Môn học giảng dạy:
                      </label>
                      <input
                        type="text"
                        value={regSubject}
                        onChange={(e) => setRegSubject(e.target.value)}
                        placeholder="Toán học THPT..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Số điện thoại:
                      </label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0908xxxxxx..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Mật khẩu đăng nhập *:
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Hoàn Tất Đăng Ký Tài Khoản Giáo Viên</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
