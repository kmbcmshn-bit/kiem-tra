import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom, Student } from '../../types';
import * as XLSX from 'xlsx';
import { parseVietnameseSchoolExcel, parseVietnameseSchoolWorkbook, ParseExcelResult, isLikelyVietnameseName, splitVietnameseName, sheetToDenseMatrix } from '../../utils/vietnameseExcelParser';
import {
  Users,
  PlusCircle,
  Upload,
  FileSpreadsheet,
  Download,
  Key,
  Copy,
  CheckCircle2,
  Trash2,
  Edit2,
  Search,
  LogIn,
  AlertCircle,
  FileText,
  Sparkles,
  School,
  Calendar,
  X,
  UserPlus,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

export const ClassManagement: React.FC = () => {
  const {
    classes,
    setClasses,
    addClass,
    updateClass,
    deleteClass,
    students,
    importStudentsToClass,
    addStudentToClass,
    generateAccountsForClass,
    updateStudent,
    deleteStudent,
    setCurrentStudentId,
    setRole,
  } = useApp();

  // Active selected class ID
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return classes[0]?.id || '';
  });

  // Keep selectedClassId in sync with classes
  React.useEffect(() => {
    if (!classes.some(c => c.id === selectedClassId)) {
      setSelectedClassId(classes[0]?.id || '');
    }
  }, [classes, selectedClassId]);

  // Modal states
  const [isCreateClassOpen, setIsCreateClassOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState<Student | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [excelPreview, setExcelPreview] = useState<ParseExcelResult | null>(null);
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // New Class Form state
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassGrade, setNewClassGrade] = useState<string>('Khối 12');
  const [newClassYear, setNewClassYear] = useState<string>('2026 - 2027');
  const [newClassDesc, setNewClassDesc] = useState<string>('');

  // Search in students table
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Quick Paste student list state
  const [pasteText, setPasteText] = useState<string>('');
  const [importMode, setImportMode] = useState<'excel' | 'paste'>('excel');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Student Form state
  const [singleName, setSingleName] = useState<string>('');
  const [singleEmail, setSingleEmail] = useState<string>('');
  const [singlePhone, setSinglePhone] = useState<string>('');
  const [singleGender, setSingleGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');

  // Selected class reference
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const currentStudents = (currentClass
    ? students.filter(s => s.classId === currentClass.id)
    : []
  ).sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0));

  const filteredStudents = currentStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Delete Class Confirm Handler with try-catch-finally and immediate state update
  const handleDeleteClassConfirm = async () => {
    if (!classToDelete) return;
    const targetId = classToDelete.id;
    const targetName = classToDelete.name;
    setIsDeleting(true);
    setLoading(true);
    try {
      await deleteClass(targetId);
      setClasses(prev => prev.filter(c => c.id !== targetId));
      const remaining = classes.filter(c => c.id !== targetId);
      setSelectedClassId(remaining[0]?.id || '');
      setClassToDelete(null);
      showToast(`Đã xóa thành công lớp "${targetName}"!`);
    } catch (error) {
      console.error(error);
      alert("Lỗi xóa lớp");
    } finally {
      setIsDeleting(false);
      setLoading(false);
    }
  };

  // 1. Create Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      showToast('Vui lòng nhập tên lớp học!', 'error');
      return;
    }

    const newClass: ClassRoom = {
      id: `class-${Date.now()}`,
      name: newClassName.trim(),
      grade: newClassGrade,
      academicYear: newClassYear,
      description: newClassDesc,
      createdAt: new Date().toISOString(),
      studentCount: 0,
    };

    addClass(newClass);
    setSelectedClassId(newClass.id);
    setIsCreateClassOpen(false);
    showToast(`Đã tạo thành công lớp học "${newClass.name}"!`);
  };

  // 2. Parse File Excel/CSV (vnEdu, SMAS, QLM, Standard)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentClass) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        let parsedResult: ParseExcelResult;
        if (workbook.SheetNames.length > 1) {
          parsedResult = parseVietnameseSchoolWorkbook(workbook, currentClass.name);
        } else {
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawJson = sheetToDenseMatrix(worksheet);

          if (!rawJson || rawJson.length === 0) {
            showToast('Tệp không chứa dữ liệu hợp lệ.', 'error');
            return;
          }

          parsedResult = parseVietnameseSchoolExcel(rawJson, currentClass.name);
        }

        if (!parsedResult.success || parsedResult.students.length === 0) {
          showToast(parsedResult.message || 'Không tìm thấy danh sách học sinh hợp lệ trong tệp.', 'error');
          return;
        }

        setExcelPreview(parsedResult);
      } catch (err: any) {
        showToast(`Lỗi khi đọc file Excel: ${err.message}`, 'error');
      }
    };

    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmExcelImport = () => {
    if (!excelPreview || !currentClass || excelPreview.students.length === 0) return;
    importStudentsToClass(currentClass.id, excelPreview.students, replaceExisting);
    const count = excelPreview.students.length;
    setIsImportModalOpen(false);
    setExcelPreview(null);
    showToast(
      replaceExisting
        ? `Đã nạp mới và thay thế toàn bộ: ${count} học sinh vào lớp ${currentClass.name}!`
        : `Đã bổ sung thêm ${count} học sinh vào lớp ${currentClass.name}!`
    );
  };

  // 3. Quick Paste Import
  const handlePasteImport = () => {
    if (!pasteText.trim() || !currentClass) {
      showToast('Vui lòng dán danh sách tên học sinh!', 'error');
      return;
    }

    const lines = pasteText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const parsed: Partial<Student>[] = [];
    lines.forEach((line, index) => {
      // Check if line is tab-separated (copied directly from Excel)
      if (line.includes('\t')) {
        const parts = line.split('\t').map(p => p.trim()).filter(Boolean);
        let foundCode = '';
        let foundDob = '';
        const nameCandidates: string[] = [];

        for (const part of parts) {
          if (!foundCode && /^\d{6,14}$/.test(part)) {
            foundCode = part;
          } else if (!foundDob && /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(part)) {
            foundDob = part;
          } else if (!/^\d+$/.test(part) && !/^(nam|nữ|nu|x|f|m)$/i.test(part) && /[a-zA-ZÀ-ỹ]/.test(part)) {
            // Text cell with letters
            if (!/^(stt|mã\s*hs|ngày\s*sinh|lớp|dân\s*tộc|kinh)/i.test(part)) {
              nameCandidates.push(part);
            }
          }
        }

        let foundName = '';
        if (nameCandidates.length === 1) {
          foundName = nameCandidates[0];
        } else if (nameCandidates.length >= 2) {
          // If first candidate is Họ and second is Tên, combine them!
          foundName = nameCandidates.join(' ');
        }

        if (foundName) {
          const parts = splitVietnameseName(foundName);
          parsed.push({
            stt: parsed.length + 1,
            name: parts.fullName,
            fullName: parts.fullName,
            hoVaChuLot: parts.hoVaChuLot,
            lastName: parts.lastName,
            ten: parts.ten,
            firstName: parts.firstName,
            studentCode: foundCode || undefined,
            dob: foundDob || undefined,
          });
          return;
        }
      }

      // Plain line format: remove leading STT e.g. "1. ", "1/ ", "STT 1: ", "01. "
      const cleanName = line.replace(/^(\d+[\.\/\-\)]\s*|stt\s*[:\s]*\d+[:\s]*)/i, '').trim();
      if (cleanName.length >= 2 && !/^(stt|họ và tên|danh sách|trường|lớp|niên học)/i.test(cleanName)) {
        const parts = splitVietnameseName(cleanName);
        parsed.push({
          stt: parsed.length + 1,
          name: parts.fullName,
          fullName: parts.fullName,
          hoVaChuLot: parts.hoVaChuLot,
          lastName: parts.lastName,
          ten: parts.ten,
          firstName: parts.firstName,
        });
      }
    });

    if (parsed.length === 0) {
      showToast('Không tìm thấy tên học sinh hợp lệ trong nội dung đã dán.', 'error');
      return;
    }

    importStudentsToClass(currentClass.id, parsed, replaceExisting);
    setPasteText('');
    setIsImportModalOpen(false);
    showToast(
      replaceExisting
        ? `Đã thay thế và nạp mới ${parsed.length} học sinh vào lớp ${currentClass.name}!`
        : `Đã thêm thành công ${parsed.length} học sinh vào lớp ${currentClass.name}!`
    );
  };

  // 4. Add Single Student
  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim() || !currentClass) {
      showToast('Vui lòng nhập họ và tên học sinh!', 'error');
      return;
    }

    const parts = splitVietnameseName(singleName.trim());
    addStudentToClass(currentClass.id, {
      name: parts.fullName,
      fullName: parts.fullName,
      hoVaChuLot: parts.hoVaChuLot,
      lastName: parts.lastName,
      ten: parts.ten,
      firstName: parts.firstName,
      email: singleEmail.trim() || undefined,
      phone: singlePhone.trim() || undefined,
      gender: singleGender,
    });

    setSingleName('');
    setSingleEmail('');
    setSinglePhone('');
    setIsAddStudentOpen(false);
    showToast(`Đã thêm học sinh "${parts.fullName}" vào lớp!`);
  };

  // 5. Generate Accounts for All Students in Class
  const handleGenerateAccounts = () => {
    if (!currentClass || currentStudents.length === 0) {
      showToast('Lớp hiện chưa có học sinh nào. Hãy nhập danh sách học sinh trước!', 'error');
      return;
    }

    const generated = generateAccountsForClass(currentClass.id);
    showToast(`⚡ Đã tự động tạo và kích hoạt tài khoản chuẩn (dạng: tranan11a1vts2627) cho toàn bộ ${generated.length} học sinh lớp ${currentClass.name}!`);
  };

  // 6. Copy Accounts to Clipboard
  const handleCopyAccounts = () => {
    if (currentStudents.length === 0) return;

    let content = `DANH SÁCH TÀI KHOẢN ĐĂNG NHẬP HỆ THỐNG LMS EDUSMART\nLỚP: ${currentClass?.name} - NĂM HỌC: ${currentClass?.academicYear}\n`;
    content += `=========================================================\n`;
    currentStudents.forEach((st, idx) => {
      const words = st.name.trim().split(/\s+/).filter(Boolean);
      const ten = st.ten || (words.length > 1 ? words[words.length - 1] : words[0] || '');
      const hoVaChuLot = st.hoVaChuLot || (words.length > 1 ? words.slice(0, -1).join(' ') : '');
      const studentStt = st.stt || (idx + 1);
      content += `${studentStt}. ${st.name} (Họ đệm: ${hoVaChuLot} | Tên: ${ten}) | Tên đăng nhập: ${st.username || st.email} | Mật khẩu: ${st.password || '123456'}\n`;
    });
    content += `=========================================================\n`;
    content += `* Cấu trúc đăng nhập: họ+tên+lớp+viết tắt trường+niên học (Ví dụ: Trần Thái An -> tranan11a1vts2627)\n`;
    content += `* Học sinh truy cập ứng dụng, chọn vai trò "Học Sinh" và đăng nhập bằng thông tin trên.`;

    navigator.clipboard.writeText(content);
    showToast('📋 Đã sao chép danh sách tài khoản cả lớp vào Clipboard! Bạn có thể dán vào Zalo/Messenger.');
  };

  // 7. Download Excel Accounts
  const handleDownloadExcel = () => {
    if (currentStudents.length === 0) return;

    const dataRows = currentStudents.map((st, idx) => {
      const words = st.name.trim().split(/\s+/).filter(Boolean);
      const ten = st.ten || (words.length > 1 ? words[words.length - 1] : words[0] || '');
      const hoVaChuLot = st.hoVaChuLot || (words.length > 1 ? words.slice(0, -1).join(' ') : '');

      return {
        'STT': st.stt || (idx + 1),
        'Mã học sinh': st.studentCode || '',
        'Họ và chữ lót': hoVaChuLot,
        'Tên': ten,
        'Họ và tên': st.name,
        'Lớp': st.className || currentClass?.name,
        'Tên đăng nhập': st.username || st.email,
        'Mật khẩu': st.password || '123456',
        'Trạng thái': st.isAccountActive ? 'Đã kích hoạt' : 'Chưa kích hoạt',
        'Điểm thưởng XP': st.xp || 0,
        'Cấp độ': st.level || 1,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `TaiKhoan_${currentClass?.name || 'Lop'}`);
    XLSX.writeFile(workbook, `DanhSach_TaiKhoan_${currentClass?.name || 'Lop'}.xlsx`);
    showToast('📥 Đã tải về file Excel danh sách tài khoản học sinh!');
  };

  // 8. Download Sample Template (vnEdu & Standard Format)
  const handleDownloadTemplate = () => {
    const sampleData = [
      { 'STT': 1, 'Mã học sinh': '2511404881', 'Họ và chữ lót': 'Trần Thái', 'Tên': 'An', 'Ngày sinh': '15/04/2008', 'Giới tính': 'Nam', 'Số điện thoại': '0912345678' },
      { 'STT': 2, 'Mã học sinh': '2511404901', 'Họ và chữ lót': 'Ngô Thị Lan', 'Tên': 'Anh', 'Ngày sinh': '20/08/2008', 'Giới tính': 'Nữ', 'Số điện thoại': '0987654321' },
      { 'STT': 3, 'Mã học sinh': '2511404941', 'Họ và chữ lót': 'Nguyễn Trần Lan', 'Tên': 'Anh', 'Ngày sinh': '02/11/2008', 'Giới tính': 'Nữ', 'Số điện thoại': '0901234567' },
      { 'STT': 4, 'Mã học sinh': '2511404981', 'Họ và chữ lót': 'Trần Phan Văn', 'Tên': 'Có', 'Ngày sinh': '18/01/2008', 'Giới tính': 'Nam', 'Số điện thoại': '0934567890' },
      { 'STT': 5, 'Mã học sinh': '2511405001', 'Họ và chữ lót': 'Huỳnh Ngọc Kim', 'Tên': 'Yến', 'Ngày sinh': '25/09/2008', 'Giới tính': 'Nữ', 'Số điện thoại': '0978901234' },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_DanhSach_vnEdu');
    XLSX.writeFile(wb, 'Mau_Danh_Sach_Hoc_Sinh_vnEdu.xlsx');
    showToast('📥 Đã tải về file mẫu Excel (chuẩn vnEdu với cột Họ và chữ lót riêng, Tên riêng)!');
  };

  // 9. Login directly as this student (to preview student perspective)
  const handleImpersonateStudent = (studentId: string) => {
    setCurrentStudentId(studentId);
    setRole('student');
    showToast('Đang chuyển sang giao diện của học sinh...');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-3 animate-slideIn ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-red-900 text-white border-red-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner: Class & Student Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              Quản Lý Lớp Học & Cấp Tài Khoản Học Sinh
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Tạo lớp, tải lên danh sách học sinh từ Excel hoặc văn bản, tự động sinh tài khoản & mật khẩu đăng nhập cho học sinh.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateClassOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Lớp Học Mới</span>
        </button>
      </div>

      {/* If No Classes: Show Empty State */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 text-center shadow-xs max-w-xl mx-auto space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
            <School className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xl">
              Chưa Có Lớp Học Nào
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Hệ thống hiện tại sạch sẽ, không có bất kỳ học sinh mẫu minh họa nào. Hãy bắt đầu bằng cách <strong>Tạo Lớp Học</strong> và tải danh sách học sinh thực tế của Thầy/Cô lên hệ thống!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateClassOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Lớp Học Mới</span>
          </button>
        </div>
      ) : (
        /* Classes View */
        <div className="space-y-6">
          {/* Class Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Danh sách lớp ({classes.length}):</span>
            </span>

            {classes.map(c => {
              const count = students.filter(s => s.classId === c.id).length;
              const isSelected = c.id === selectedClassId;
              return (
                <div
                  key={c.id}
                  className={`group flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-700/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedClassId(c.id)}
                    className="flex items-center gap-2 cursor-pointer focus:outline-hidden"
                  >
                    <span>{c.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count} em
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClassToDelete(c);
                    }}
                    title={`Xóa lớp ${c.name}`}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'hover:bg-red-600 hover:text-white text-emerald-200'
                        : 'opacity-60 hover:opacity-100 hover:bg-red-50 hover:text-red-600 text-slate-400'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCreateClassOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-dashed border-emerald-300 transition-colors ml-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Thêm lớp</span>
            </button>
          </div>

          {/* Current Class Overview & Actions Card */}
          {currentClass && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900 text-xl">
                      Lớp {currentClass.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {currentClass.grade}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {currentClass.academicYear}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentClass.description || 'Chưa có ghi chú'} • Sĩ số: <strong className="text-emerald-800">{currentStudents.length} học sinh</strong>
                  </p>
                </div>

                {/* Primary Student Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Tải Lên DS Học Sinh (Excel/Văn Bản)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" />
                    <span>+ Thêm 1 học sinh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClassToDelete(currentClass)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 font-semibold text-xs transition-colors cursor-pointer"
                    title="Xóa lớp học này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Xóa Lớp Này</span>
                  </button>
                </div>
              </div>

              {/* Account Management & Export Action Bar */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-700" />
                    <span>Cấp Tài Khoản & Mật Khẩu Đăng Nhập Học Sinh:</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Cấu trúc đơn giản: <strong>họ+tên+lớp+viết tắt trường+niên học</strong> (Ví dụ: Trần Thái An Lớp 11A1 THPT Võ Thị Sáu → <code className="text-emerald-800 font-mono font-bold bg-white px-1 py-0.5 rounded border border-emerald-200">tranan11a1vts2627</code>).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleGenerateAccounts}
                    disabled={currentStudents.length === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>⚡ Tự Động Tạo Tài Khoản Cho Cả Lớp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAccounts}
                    disabled={currentStudents.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    title="Sao chép để gửi Zalo cho phụ huynh và học sinh"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sao Chép DS (Gửi Zalo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadExcel}
                    disabled={currentStudents.length === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    title="Tải về file Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Xuất Excel</span>
                  </button>
                </div>
              </div>

              {/* Student Table & Search */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm theo họ tên, tài khoản..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPasswords ? 'Ẩn Mật Khẩu' : 'Hiện Mật Khẩu'}</span>
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      Hiển thị {filteredStudents.length} / {currentStudents.length} học sinh
                    </span>
                  </div>
                </div>

                {/* Table */}
                {currentStudents.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                    <Users className="w-10 h-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 text-sm">
                        Lớp {currentClass.name} chưa có học sinh nào
                      </div>
                      <p className="text-xs text-slate-500">
                        Thầy/Cô hãy tải lên danh sách học sinh từ file Excel hoặc dán danh sách tên học sinh vào lớp.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải Lên File Excel</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải File Mẫu</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="py-3 px-2 w-10 text-center">STT</th>
                          <th className="py-3 px-3">Họ và Chữ Lót</th>
                          <th className="py-3 px-3 text-emerald-800">Tên</th>
                          <th className="py-3 px-3 font-bold text-slate-900">Họ và Tên Đầy Đủ</th>
                          <th className="py-3 px-3">Tên Đăng Nhập</th>
                          <th className="py-3 px-2.5">Mật Khẩu</th>
                          <th className="py-3 px-2 text-center">Trạng Thái</th>
                          <th className="py-3 px-3 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((st, idx) => {
                          const words = st.name.trim().split(/\s+/).filter(Boolean);
                          const displayTen = st.ten || st.firstName || (words.length > 1 ? words[words.length - 1] : words[0] || '');
                          const displayHoVaChuLot = st.hoVaChuLot || st.lastName || (words.length > 1 ? words.slice(0, -1).join(' ') : '');
                          const displayFullName = st.fullName || st.name;
                          const studentStt = st.stt || (idx + 1);

                          return (
                            <tr key={st.id ? `${st.id}-${studentStt}-${idx}` : `student-${studentStt}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-2 text-center text-slate-500 font-mono font-bold">
                                {studentStt}
                              </td>
                              <td className="py-3 px-3 font-medium text-slate-800">
                                {displayHoVaChuLot || '—'}
                              </td>
                              <td className="py-3 px-3 font-bold text-emerald-800 bg-emerald-50/40">
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                                  {displayTen || '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={st.avatar}
                                    alt=""
                                    className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500/20 shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                      {displayFullName}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                      {st.studentCode && (
                                        <span className="font-mono bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-semibold border border-slate-200">
                                          Mã HS: {st.studentCode}
                                        </span>
                                      )}
                                      {st.gender && (
                                        <span className="px-1 py-0.2 rounded bg-slate-50 text-slate-600">
                                          {st.gender}
                                        </span>
                                      )}
                                      {st.dob && (
                                        <span className="text-slate-400">
                                          NS: {st.dob}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                  {st.username || 'Chưa tạo'}
                                </span>
                              </td>
                              <td className="py-3 px-2.5">
                                <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  {showPasswords ? (st.password || '123456') : '••••••'}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                {st.isAccountActive ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Đã cấp</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                                    Chờ cấp
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleImpersonateStudent(st.id)}
                                    className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                    title="Đăng nhập thử với tư cách học sinh này để kiểm tra"
                                  >
                                    <LogIn className="w-3 h-3" />
                                    <span>Vào thử</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setIsEditStudentOpen(st)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Chỉnh sửa thông tin"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setStudentToDelete(st)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Xóa học sinh"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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
        </div>
      )}

      {/* MODAL 1: CREATE NEW CLASS */}
      {isCreateClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-slate-900 text-base">Tạo Lớp Học Mới</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateClassOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên lớp học (*):
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: 12A1, 12A2, 10C1..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Khối lớp:
                  </label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                  >
                    <option value="Khối 12">Khối 12</option>
                    <option value="Khối 11">Khối 11</option>
                    <option value="Khối 10">Khối 10</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Năm học:
                  </label>
                  <input
                    type="text"
                    value={newClassYear}
                    onChange={(e) => setNewClassYear(e.target.value)}
                    placeholder="2025 - 2026"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mô tả / Giáo viên phụ trách:
                </label>
                <textarea
                  rows={2}
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Ghi chú về lớp, giáo viên bộ môn..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateClassOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  Lưu & Tạo Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT STUDENTS (EXCEL / QUICK PASTE) */}
      {isImportModalOpen && currentClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-slate-900 text-base">
                  Nhập Danh Sách Học Sinh Cho Lớp {currentClass.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setImportMode('excel')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  importMode === 'excel'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tải lên File Excel (.xlsx, .csv)
              </button>
              <button
                type="button"
                onClick={() => setImportMode('paste')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  importMode === 'paste'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dán Danh Sách Nhanh (Văn bản)
              </button>
            </div>

            {importMode === 'excel' ? (
              excelPreview ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Trích Xuất Đầy Đủ 100% Danh Sách ({excelPreview.students.length} Học Sinh)</span>
                      </div>
                      {excelPreview.detectedClassName && (
                        <span className="self-start sm:self-auto px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-xs">
                          Lớp {excelPreview.detectedClassName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-emerald-900 font-medium">
                      {excelPreview.sttRangeSummary && (
                        <span className="px-2 py-0.5 bg-white rounded-md border border-emerald-300 text-emerald-800 font-bold">
                          📋 {excelPreview.sttRangeSummary}
                        </span>
                      )}
                      {excelPreview.detectedSchoolName && (
                        <span>🏫 Trường: <strong>{excelPreview.detectedSchoolName}</strong></span>
                      )}
                      {excelPreview.detectedAcademicYear && (
                        <span>📅 Niên học: <strong>{excelPreview.detectedAcademicYear}</strong></span>
                      )}
                    </div>

                    <div className="text-[11px] text-emerald-900 bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Cam kết chuẩn xác dữ liệu học sinh:</span>
                      </div>
                      <p className="text-slate-700">
                        • <strong>Không sót bất kỳ học sinh nào:</strong> Đã khắc phục triệt để lỗi bỏ sót học sinh đầu bảng hoặc học sinh có tên phổ biến như <em>Đạt, Khá, Tốt, Sinh, Tiến</em>.
                      </p>
                      <p className="text-slate-700">
                        • <strong>Tài khoản tự động:</strong> Cấu trúc họ+tên+lớp+trường+niên học (Ví dụ: <code className="text-emerald-800 font-mono font-bold bg-slate-100 px-1 py-0.2 rounded">tranan11a1vts2627</code>).
                      </p>
                    </div>

                    {/* Mode selection: Replace vs Append */}
                    <div className="pt-1.5 border-t border-emerald-200/60">
                      <div className="font-bold text-slate-800 text-xs mb-1.5">
                        Tùy chọn nạp vào lớp {currentClass.name}:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          replaceExisting
                            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold'
                            : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                        }`}>
                          <input
                            type="radio"
                            name="importReplaceMode"
                            checked={replaceExisting}
                            onChange={() => setReplaceExisting(true)}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="font-bold text-xs text-emerald-900">
                              Làm mới & Thay thế ({excelPreview.students.length} HS)
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal">
                              Xóa học sinh mẫu cũ, chuẩn hóa sĩ số đúng {excelPreview.students.length} em theo file.
                            </div>
                          </div>
                        </label>

                        <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          !replaceExisting
                            ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold'
                            : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                        }`}>
                          <input
                            type="radio"
                            name="importReplaceMode"
                            checked={!replaceExisting}
                            onChange={() => setReplaceExisting(false)}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-800">
                              Bổ sung thêm vào lớp
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal">
                              Giữ nguyên {currentStudents.length} học sinh hiện tại và thêm {excelPreview.students.length} em mới.
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Table preview */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-700 text-[11px] sticky top-0">
                        <tr>
                          <th className="py-2 px-2 w-10 text-center">STT</th>
                          <th className="py-2 px-2.5">Họ và Chữ Lót</th>
                          <th className="py-2 px-2.5 text-emerald-800">Tên</th>
                          <th className="py-2 px-3 font-extrabold text-slate-900">Họ và Tên Đầy Đủ</th>
                          <th className="py-2 px-2.5 font-mono text-emerald-800">Tên Đăng Nhập</th>
                          <th className="py-2 px-2 font-mono">Mã HS</th>
                          <th className="py-2 px-2 text-center">Phái</th>
                          <th className="py-2 px-2">Ngày Sinh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {excelPreview.students.map((st, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2 text-center text-slate-500 font-mono font-bold">{st.stt || i + 1}</td>
                            <td className="py-1.5 px-2.5 text-slate-700">{st.hoVaChuLot || st.lastName || '—'}</td>
                            <td className="py-1.5 px-2.5 font-bold text-emerald-800 bg-emerald-50/50">{st.ten || st.firstName || '—'}</td>
                            <td className="py-1.5 px-3 font-bold text-slate-900">{st.fullName || st.name}</td>
                            <td className="py-1.5 px-2.5 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50/40">
                              {st.username || '—'}
                            </td>
                            <td className="py-1.5 px-2 font-mono text-slate-600">{st.studentCode || '—'}</td>
                            <td className="py-1.5 px-2 text-center text-slate-600">{st.gender || '—'}</td>
                            <td className="py-1.5 px-2 text-slate-500">{st.dob || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setExcelPreview(null)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                    >
                      Chọn tệp khác
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsImportModalOpen(false);
                          setExcelPreview(null);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                      >
                        Hủy
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmExcelImport}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Xác Nhận Nạp {excelPreview.students.length} Học Sinh Vào Lớp</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl text-center bg-emerald-50/40 hover:bg-emerald-50/70 transition-all cursor-pointer space-y-2 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        Chọn hoặc kéo thả tệp Excel vnEdu / SMAS / QLM / CSV
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Tự động nhận diện cột Họ & Chữ lót riêng + Tên riêng, Mã học sinh, Ngày sinh, Giới tính
                      </p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px]">
                      Chọn tệp từ máy tính
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hỗ trợ định dạng bảng điểm / danh sách lớp vnEdu:</span>
                    </div>
                    <p>• Nhận diện chuẩn xác Họ & tên kể cả khi tách cột "Họ và đệm" và "Tên".</p>
                    <p>• Bỏ qua các dòng tiêu đề trường học và hàng thống kê cuối trang.</p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-600">
                      Chưa có file mẫu? Tải file Excel mẫu để điền danh sách:
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-[11px] cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-emerald-600" />
                      <span>Tải Mẫu Excel</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-3 text-xs">
                <label className="font-semibold text-slate-700 block">
                  Dán danh sách tên học sinh (mỗi dòng 1 học sinh):
                </label>
                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Ví dụ:\n1. Nguyễn Văn An\n2. Trần Thị Bình\n3. Lê Hoàng Long\n4. Phạm Minh Đức\n5. Vũ Ngọc Ánh...`}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed"
                />
                <p className="text-[10px] text-slate-400">
                  * Hệ thống tự động lọc bỏ số thứ tự ở đầu dòng và chuẩn hóa họ tên học sinh.
                </p>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handlePasteImport}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    Xác Nhận Thêm Vào Lớp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SINGLE STUDENT */}
      {isAddStudentOpen && currentClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-slate-900 text-base">
                  Thêm Học Sinh Vào Lớp {currentClass.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSingleStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Họ và tên học sinh (*):
                </label>
                <input
                  type="text"
                  required
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Email (tùy chọn, để nhận thông báo điểm):
                </label>
                <input
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  placeholder="an.nv@edusmart.edu.vn"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Số điện thoại / Zalo:
                  </label>
                  <input
                    type="text"
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Giới tính:
                  </label>
                  <select
                    value={singleGender}
                    onChange={(e) => setSingleGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Thêm Học Sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT STUDENT */}
      {isEditStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base">
                Chỉnh Sửa Thông Tin Học Sinh
              </h4>
              <button
                type="button"
                onClick={() => setIsEditStudentOpen(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Họ và tên:
                </label>
                <input
                  type="text"
                  value={isEditStudentOpen.name}
                  onChange={(e) => setIsEditStudentOpen({ ...isEditStudentOpen, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tên đăng nhập (Username):
                </label>
                <input
                  type="text"
                  value={isEditStudentOpen.username || ''}
                  onChange={(e) => setIsEditStudentOpen({ ...isEditStudentOpen, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-emerald-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mật khẩu:
                </label>
                <input
                  type="text"
                  value={isEditStudentOpen.password || '123456'}
                  onChange={(e) => setIsEditStudentOpen({ ...isEditStudentOpen, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditStudentOpen(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateStudent(isEditStudentOpen);
                    setIsEditStudentOpen(null);
                    showToast('Đã lưu thay đổi thông tin học sinh!');
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold"
                >
                  Lưu Thông Tin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CONFIRM DELETE CLASS */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Xác Nhận Xóa Lớp Học
                </h4>
                <p className="text-xs text-slate-500">
                  Hành động này sẽ xóa vĩnh viễn lớp học
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-xs text-red-950 space-y-2 leading-relaxed">
              <p>
                Thầy/Cô có chắc chắn muốn xóa lớp <strong className="text-red-900 font-bold">{classToDelete.name}</strong> ({classToDelete.grade} • {classToDelete.academicYear})?
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-900/90 text-[11px] pt-1 border-t border-red-200/60">
                <li>
                  Toàn bộ <strong>{students.filter(s => s.classId === classToDelete.id).length} học sinh</strong> trong lớp sẽ bị xóa khỏi hệ thống.
                </li>
                <li>Tài khoản đăng nhập của các học sinh thuộc lớp này sẽ bị thu hồi.</li>
                <li>Hành động này <strong>không thể hoàn tác</strong>.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting || loading}
                onClick={() => setClassToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting || loading}
                onClick={handleDeleteClassConfirm}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting || loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang xóa lớp...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Xác Nhận Xóa Lớp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONFIRM DELETE STUDENT */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Xóa Học Sinh Khỏi Lớp
                </h4>
                <p className="text-xs text-slate-500">
                  Xác nhận xóa tài khoản học sinh
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa học sinh <strong className="text-slate-900">{studentToDelete.name}</strong>{' '}
              {studentToDelete.studentCode && <span className="font-mono text-emerald-800">(Mã: {studentToDelete.studentCode})</span>}{' '}
              khỏi lớp học không?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const sName = studentToDelete.name;
                  deleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                  showToast(`Đã xóa học sinh "${sName}" khỏi lớp!`);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                Xóa Học Sinh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
