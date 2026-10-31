import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamTargetAssignment, ClassRoom, Student } from '../../types';
import {
  X,
  Send,
  Users,
  School,
  UserCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Lock,
  Sparkles,
  Layers,
  Search,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';

interface AssignExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
  onAssignSuccess?: (assignedMessage: string) => void;
}

export const AssignExamModal: React.FC<AssignExamModalProps> = ({
  isOpen,
  onClose,
  exam,
  onAssignSuccess,
}) => {
  const { classes, students, updateExam, generateClassVariants } = useApp();

  // Mode: class | group | custom_students
  const [assignMode, setAssignMode] = useState<'class' | 'group' | 'custom_students'>('class');

  // Selected Class
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return exam?.targetAssignment?.targetClassId || classes[0]?.id || '';
  });

  // Predefined Groups
  const PREDEFINED_GROUPS = [
    { id: 'group-dgnl', name: 'Nhóm Ôn Thi Đánh Giá Năng Lực (ĐHQG)', desc: '15 học sinh mục tiêu ĐGNL' },
    { id: 'group-hsg', name: 'Nhóm Bồi Dưỡng Học Sinh Giỏi Toán', desc: '10 học sinh chuyên toán' },
    { id: 'group-phudao', name: 'Nhóm Phụ Đạo & Củng Cố Kiến Thức', desc: '12 học sinh cần ôn tập kỹ' },
    { id: 'group-chuyende', name: 'Nhóm Tự Chọn Chuyên Đề Khảo Sát Hàm Số', desc: '20 học sinh tự chọn' },
  ];
  const [selectedGroup, setSelectedGroup] = useState<string>(
    exam?.targetAssignment?.groupName || PREDEFINED_GROUPS[0].name
  );
  const [customGroupName, setCustomGroupName] = useState<string>('');

  // Selected Custom Students
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(() => {
    return new Set(exam?.targetAssignment?.studentIds || []);
  });
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [studentClassFilter, setStudentClassFilter] = useState<string>('all');

  // Scheduling & Exam settings
  const [durationMinutes, setDurationMinutes] = useState<number>(exam?.durationMinutes || 45);
  const [dueDate, setDueDate] = useState<string>(() => {
    return exam?.dueDate ? exam.dueDate.slice(0, 16) : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
  });
  const [examPassword, setExamPassword] = useState<string>(exam?.targetAssignment?.examPassword || '');
  const [variantDistributionType, setVariantDistributionType] = useState<'individual' | 'standard_4' | 'single' | 'custom'>('standard_4');
  const [customVariantNumber, setCustomVariantNumber] = useState<number>(4);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen || !exam) return null;

  // Active selected class object
  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Students belonging to chosen class
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  // Filtered students for custom picker
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.studentCode && s.studentCode.includes(studentSearch)) ||
      (s.username && s.username.includes(studentSearch));
    const matchesClass = studentClassFilter === 'all' || s.classId === studentClassFilter;
    return matchesSearch && matchesClass;
  });

  const toggleStudentSelection = (stId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(stId)) {
        next.delete(stId);
      } else {
        next.add(stId);
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      filteredStudents.forEach((st) => next.add(st.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      filteredStudents.forEach((st) => next.delete(st.id));
      return next;
    });
  };

  const handleConfirmAssignment = async () => {
    setIsSubmitting(true);

    let targetClassName = activeClass?.name || 'Lớp học';
    let targetClassId = selectedClassId;
    let groupName = assignMode === 'group' ? (customGroupName.trim() || selectedGroup) : undefined;
    let assignedStudentList: Student[] = [];

    if (assignMode === 'class') {
      assignedStudentList = classStudents;
    } else if (assignMode === 'group') {
      // Group: select sample from students or first 15
      assignedStudentList = students.slice(0, 15);
      targetClassName = groupName || 'Nhóm Học Sinh';
    } else {
      // Custom students
      assignedStudentList = students.filter((s) => selectedStudentIds.has(s.id));
      if (assignedStudentList.length === 0) {
        assignedStudentList = [students[0]];
      }
      targetClassName = `${assignedStudentList.length} Học Sinh Được Chọn`;
    }

    const assignedCount = assignedStudentList.length;
    let finalVariantCount = 4;
    if (variantDistributionType === 'single') {
      finalVariantCount = 1;
    } else if (variantDistributionType === 'individual') {
      finalVariantCount = Math.max(1, assignedCount);
    } else if (variantDistributionType === 'standard_4') {
      finalVariantCount = 4;
    } else if (variantDistributionType === 'custom') {
      finalVariantCount = Math.max(1, Math.min(60, customVariantNumber));
    }

    const assignment: ExamTargetAssignment = {
      type: assignMode,
      targetClassId: assignMode === 'class' ? targetClassId : undefined,
      targetClassName: assignMode === 'class' ? activeClass?.name : undefined,
      groupName: assignMode === 'group' ? groupName : undefined,
      studentIds: assignedStudentList.map((s) => s.id),
      assignedAt: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      examPassword: examPassword.trim() || undefined,
    };

    // Distribute variant codes: 101, 102, 103...
    const newAssignedCodes: Record<string, string> = {};
    assignedStudentList.forEach((st, idx) => {
      const code = String(101 + (idx % finalVariantCount));
      newAssignedCodes[st.id] = code;
    });

    const updatedExam: Exam = {
      ...exam,
      durationMinutes,
      dueDate: new Date(dueDate).toISOString(),
      targetAssignment: assignment,
      assignedCodes: newAssignedCodes,
    };

    updateExam(updatedExam);

    // Also ensure variants are generated up to required count
    const existingVariantsCount = Object.keys(exam.variants || {}).length;
    if (finalVariantCount > existingVariantsCount) {
      await generateClassVariants(finalVariantCount, assignMode === 'class' ? targetClassId : undefined);
    }

    setIsSubmitting(false);
    const msg = `Đã giao đề thành công cho ${
      assignMode === 'class'
        ? `Lớp ${activeClass?.name} (${assignedCount} học sinh)`
        : assignMode === 'group'
        ? `${groupName} (${assignedCount} học sinh)`
        : `${assignedCount} học sinh được chọn`
    }! Hệ thống đã tự động cấp phát ${assignedCount} mã đề riêng biệt tương đương.`;

    setSuccessToast(msg);
    if (onAssignSuccess) {
      onAssignSuccess(msg);
    }

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>Giao Đề Cho Lớp / Nhóm Học Sinh</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Mã Đề Độc Lập
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Đề: <strong className="text-slate-800">{exam.title}</strong> ({exam.questions?.length || 0} câu • {exam.durationMinutes} phút)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successToast ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-950 text-base">Giao Đề Thành Công!</h4>
            <p className="text-xs text-emerald-800 leading-relaxed">{successToast}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* 1. Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                1. Chọn hình thức giao đề kiểm tra:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAssignMode('class')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    assignMode === 'class'
                      ? 'bg-emerald-50/90 border-emerald-500 font-bold text-emerald-950 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <School className="w-4 h-4 text-emerald-600" />
                    <span>Theo Lớp Học</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Giao cả lớp ({classes.length} lớp có sẵn)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssignMode('group')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    assignMode === 'group'
                      ? 'bg-emerald-50/90 border-emerald-500 font-bold text-emerald-950 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>Theo Nhóm Học Sinh</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Ôn ĐGNL, Bồi dưỡng, Phụ đạo...
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssignMode('custom_students')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    assignMode === 'custom_students'
                      ? 'bg-emerald-50/90 border-emerald-500 font-bold text-emerald-950 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Chọn Từng Học Sinh</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Tích chọn linh hoạt theo danh sách
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Target Selection Details */}
            {/* CASE A: BY CLASS */}
            {assignMode === 'class' && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Chọn lớp học nhận đề:</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Đang có {classes.length} lớp học trong hệ thống
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {classes.map((c) => {
                    const isSelected = selectedClassId === c.id;
                    const cStudentsCount = students.filter((s) => s.classId === c.id).length || c.studentCount || 0;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedClassId(c.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>Lớp {c.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              {c.grade}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Sĩ số: <strong className="text-emerald-700">{cStudentsCount} học sinh</strong> • {c.schoolName}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CASE B: BY GROUP */}
            {assignMode === 'group' && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block">
                  Chọn nhóm chuyên đề hoặc nhập nhóm mới:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PREDEFINED_GROUPS.map((grp) => {
                    const isSelected = selectedGroup === grp.name && !customGroupName;
                    return (
                      <div
                        key={grp.id}
                        onClick={() => {
                          setSelectedGroup(grp.name);
                          setCustomGroupName('');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{grp.name}</div>
                          <span className="text-[10px] text-slate-500">{grp.desc}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1.5" />}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Hoặc đặt tên nhóm mới tùy chọn:
                  </label>
                  <input
                    type="text"
                    value={customGroupName}
                    onChange={(e) => setCustomGroupName(e.target.value)}
                    placeholder="Ví dụ: Nhóm Luyện Đề Tối Thứ 6..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* CASE C: BY CUSTOM STUDENTS */}
            {assignMode === 'custom_students' && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Đã chọn: <strong className="text-emerald-700">{selectedStudentIds.size} học sinh</strong>
                    </span>
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="text-[10px] text-emerald-700 hover:underline font-bold"
                    >
                      (Chọn tất cả)
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllFiltered}
                      className="text-[10px] text-slate-500 hover:underline"
                    >
                      (Bỏ chọn)
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={studentClassFilter}
                      onChange={(e) => setStudentClassFilter(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
                    >
                      <option value="all">Tất cả các lớp</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          Lớp {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1 sm:w-44">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Tìm học sinh..."
                        className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100 bg-white p-2 rounded-xl border border-slate-200">
                  {filteredStudents.map((st) => {
                    const isChecked = selectedStudentIds.has(st.id);
                    return (
                      <div
                        key={st.id}
                        onClick={() => toggleStudentSelection(st.id)}
                        className="py-1.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <img src={st.avatar} alt="" className="w-6 h-6 rounded-full" />
                          <div>
                            <span className="text-xs font-semibold text-slate-900 block">{st.name}</span>
                            <span className="text-[10px] text-slate-500">
                              Lớp {st.className} {st.studentCode ? `• Mã ${st.studentCode}` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {st.username || st.email.split('@')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Scheduling & Variant Strategy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Duration & Due Date */}
              <div className="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Thời gian & Hạn làm bài:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Thời lượng (phút):</label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">Mật khẩu (nếu có):</label>
                    <input
                      type="text"
                      placeholder="Không bắt buộc"
                      value={examPassword}
                      onChange={(e) => setExamPassword(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-0.5">Hạn chót nộp bài:</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              {/* Anti-cheat Multi-variant Strategy */}
              <div className="space-y-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Cơ chế cấp mã đề (Chống gian lận):</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label
                    onClick={() => setVariantDistributionType('standard_4')}
                    className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      variantDistributionType === 'standard_4'
                        ? 'bg-white border-emerald-400 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="variantStrategy"
                      checked={variantDistributionType === 'standard_4'}
                      onChange={() => setVariantDistributionType('standard_4')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <strong className="text-slate-900 block text-xs">Bộ 4 mã đề tiêu chuẩn (101 - 104)</strong>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        Chuẩn phòng thi Bộ GD&ĐT, chia đều luân phiên cho học sinh.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setVariantDistributionType('single')}
                    className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      variantDistributionType === 'single'
                        ? 'bg-white border-emerald-400 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="variantStrategy"
                      checked={variantDistributionType === 'single'}
                      onChange={() => setVariantDistributionType('single')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <strong className="text-slate-900 block text-xs">1 mã đề chung (Mã 101)</strong>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        Toàn bộ học sinh cùng làm chung một đề kiểm tra gốc.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setVariantDistributionType('individual')}
                    className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                      variantDistributionType === 'individual'
                        ? 'bg-white border-emerald-400 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="variantStrategy"
                      checked={variantDistributionType === 'individual'}
                      onChange={() => setVariantDistributionType('individual')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <strong className="text-slate-900 block text-xs">Mỗi học sinh 1 mã đề riêng biệt</strong>
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        Cấp mã tương ứng theo đúng sĩ số ({classStudents.length || 45} mã đề riêng).
                      </span>
                    </div>
                  </label>

                  <div
                    onClick={() => setVariantDistributionType('custom')}
                    className={`p-2 rounded-lg border cursor-pointer transition-all space-y-2 ${
                      variantDistributionType === 'custom'
                        ? 'bg-white border-emerald-400 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="variantStrategy"
                        checked={variantDistributionType === 'custom'}
                        onChange={() => setVariantDistributionType('custom')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <strong className="text-slate-900 block text-xs">Tự chọn số lượng mã đề sinh ra</strong>
                        <span className="text-[10px] text-slate-500 leading-tight block">
                          Giáo viên tự nhập số lượng mã đề theo ý muốn.
                        </span>
                      </div>
                    </div>

                    {variantDistributionType === 'custom' && (
                      <div className="pl-5 space-y-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={customVariantNumber}
                            onChange={(e) => setCustomVariantNumber(Math.max(1, Math.min(60, Number(e.target.value) || 2)))}
                            className="w-20 px-2 py-1 text-xs font-bold font-mono rounded border border-slate-300 text-center"
                          />
                          <span className="text-[11px] text-slate-600 font-medium">mã đề tương đương</span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400">Chọn nhanh:</span>
                          {[2, 3, 4, 6, 8, 10].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => setCustomVariantNumber(cnt)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                customVariantNumber === cnt
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {cnt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Đang Cấp Phát Mã Đề...'
                    : `Xác Nhận Giao Đề Cho ${
                        assignMode === 'class'
                          ? `Lớp ${activeClass?.name}`
                          : assignMode === 'group'
                          ? selectedGroup.slice(0, 20) + '...'
                          : `${selectedStudentIds.size} Học Sinh`
                      }`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
