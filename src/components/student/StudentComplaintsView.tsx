import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamComplaint, Submission } from '../../types';
import {
  MessageSquareQuote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  PlusCircle,
  FileCheck,
  Award,
  ChevronRight,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  Check
} from 'lucide-react';

interface StudentComplaintsViewProps {
  onGoToHistory: () => void;
  onGoToExam: () => void;
}

export const StudentComplaintsView: React.FC<StudentComplaintsViewProps> = ({
  onGoToHistory,
  onGoToExam,
}) => {
  const { currentStudent, submissions, complaints, submitComplaint } = useApp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');
  const [questionRef, setQuestionRef] = useState<string>('all');
  const [reason, setReason] = useState<string>('');
  const [studentArgument, setStudentArgument] = useState<string>('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        Vui lòng đăng nhập để xem thông tin phúc khảo và khiếu nại điểm số.
      </div>
    );
  }

  // Student's submissions and complaints
  const studentSubmissions = submissions.filter(s => s.studentId === currentStudent.id);
  const studentComplaints = complaints.filter(c => c.studentId === currentStudent.id);

  const pendingComplaints = studentComplaints.filter(c => c.status === 'pending');
  const acceptedComplaints = studentComplaints.filter(c => c.status === 'accepted');
  const rejectedComplaints = studentComplaints.filter(c => c.status === 'rejected');

  const handleSubmitNewComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionId) {
      alert('Vui lòng chọn bài thi em muốn khiếu nại.');
      return;
    }
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do khiếu nại.');
      return;
    }

    const sub = submissions.find(s => s.id === selectedSubmissionId);
    if (!sub) return;

    submitComplaint({
      submissionId: sub.id,
      examId: sub.examId,
      examTitle: sub.examTitle,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      studentAvatar: currentStudent.avatar,
      className: currentStudent.className,
      variantCode: sub.variantCode,
      questionId: questionRef === 'all' ? undefined : questionRef,
      questionNumber: questionRef === 'all' ? 'Toàn bộ bài thi' : `Câu ${questionRef}`,
      complaintReason: reason.trim(),
      studentEvidence: studentArgument.trim() || undefined,
      originalScore: sub.totalScore,
    });

    setSuccessBanner('Đã gửi đơn phúc khảo thành công! Giáo viên sẽ nhận được thông báo và chấm lại bài cho em.');
    setIsModalOpen(false);
    setSelectedSubmissionId('');
    setQuestionRef('all');
    setReason('');
    setStudentArgument('');

    setTimeout(() => {
      setSuccessBanner(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* 1. Header & Quick Intro */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Hộp Thư Phúc Khảo & Khiếu Nại Điểm Thi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Nếu em phát hiện ứng dụng hoặc AI chấm sai câu trắc nghiệm hay bài tự luận, em có thể gửi yêu cầu phúc khảo. Thầy/Cô bộ môn sẽ trực tiếp xem lại bài thi và điều chỉnh điểm số chính xác cho em.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (studentSubmissions.length === 0) {
              alert('Em chưa có bài thi nào đã nộp để khiếu nại. Hãy làm bài thi trước nhé!');
              return;
            }
            setSelectedSubmissionId(studentSubmissions[0].id);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Gửi Đơn Phúc Khảo Mới</span>
        </button>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">{successBanner}</div>
        </div>
      )}

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">Tổng số đơn gửi</div>
          <div className="text-2xl font-black text-slate-800">{studentComplaints.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Tất cả bài thi</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-xs font-medium text-amber-800 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Đang chờ duyệt</span>
          </div>
          <div className="text-2xl font-black text-amber-700">{pendingComplaints.length}</div>
          <div className="text-[11px] text-amber-600 mt-1">Giáo viên đang xử lý</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-xs font-medium text-emerald-800 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã chấp thuận</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{acceptedComplaints.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Đã được nâng điểm</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Giữ nguyên điểm</span>
          </div>
          <div className="text-2xl font-black text-slate-600">{rejectedComplaints.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Có nhận xét của GV</div>
        </div>
      </div>

      {/* 3. Complaints List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>Danh Sách Đơn Khiếu Nại Của Em ({studentComplaints.length})</span>
        </h3>

        {studentComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-700 text-sm">Em chưa gửi đơn khiếu nại nào</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Nếu em thấy câu hỏi trắc nghiệm hoặc bài tự luận được chấm chưa thoả đáng so với cách giải của mình, hãy gửi đơn phúc khảo để Thầy/Cô kiểm tra lại nhé.
            </p>
            {studentSubmissions.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedSubmissionId(studentSubmissions[0].id);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo Đơn Phúc Khảo Ngay</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToExam}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Vào Làm Bài Thi Để Có Điểm</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {studentComplaints.map(complaint => {
              const isPending = complaint.status === 'pending';
              const isAccepted = complaint.status === 'accepted';
              const isRejected = complaint.status === 'rejected';

              return (
                <div
                  key={complaint.id}
                  className={`bg-white rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
                    isPending
                      ? 'border-amber-300 ring-1 ring-amber-100'
                      : isAccepted
                      ? 'border-emerald-300 ring-1 ring-emerald-100'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Complaint Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {complaint.examTitle}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                          Mã đề #{complaint.variantCode}
                        </span>
                        {complaint.questionNumber && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            {complaint.questionNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Gửi lúc: {new Date(complaint.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang chờ giáo viên duyệt</span>
                        </span>
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã chấp thuận & Nâng điểm</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Đã xem xét • Giữ nguyên điểm</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Complaint Body */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Student reason */}
                    <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5 border border-slate-100 text-xs">
                      <div className="font-bold text-slate-700 flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nội dung khiếu nại của em:</span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {complaint.complaintReason}
                      </p>
                      {complaint.studentEvidence && (
                        <div className="pt-1 text-[11px] text-slate-500 border-t border-slate-200">
                          <span className="font-semibold text-slate-600">Lập luận / Cách giải:</span> {complaint.studentEvidence}
                        </div>
                      )}
                      <div className="pt-1 text-[11px] text-slate-600 font-semibold">
                        Điểm ban đầu: <strong className="text-slate-900 font-bold">{complaint.originalScore.toFixed(2)}đ</strong>
                      </div>
                    </div>

                    {/* Teacher Feedback / Outcome */}
                    <div className={`rounded-xl p-3.5 space-y-1.5 border text-xs ${
                      isAccepted
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : isRejected
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}>
                      <div className="font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Phản hồi từ Thầy/Cô:</span>
                        </span>
                        {complaint.reviewedAt && (
                          <span className="text-[10px] text-slate-500 font-normal">
                            {new Date(complaint.reviewedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>

                      {complaint.teacherFeedback ? (
                        <p className="text-slate-800 font-medium leading-relaxed italic">
                          "{complaint.teacherFeedback}"
                        </p>
                      ) : (
                        <p className="text-slate-500 italic">
                          Thầy/Cô đang mở lại bài thi và các bước lập luận của em để đối chiếu đáp án chuẩn.
                        </p>
                      )}

                      {/* Score Adjustment */}
                      {isAccepted && complaint.adjustedScore !== undefined && (
                        <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-900">Điểm sau phúc khảo:</span>
                          <span className="text-sm bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg shadow-2xs font-black">
                            {complaint.adjustedScore.toFixed(2)} / 10.0 đ
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Link to history */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={onGoToHistory}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem lại toàn bộ bài thi này trong Lịch Sử</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL: CREATE COMPLAINT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Gửi Đơn Phúc Khảo Điểm Thi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewComplaint} className="space-y-4 text-xs">
              {/* Submission selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn bài kiểm tra cần khiếu nại:
                </label>
                <select
                  value={selectedSubmissionId}
                  onChange={e => setSelectedSubmissionId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                >
                  {studentSubmissions.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.examTitle} (Mã #{sub.variantCode}) - Điểm: {sub.totalScore.toFixed(2)}đ - {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Reference */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Câu hỏi cần xem xét lại:
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Câu 4 phần II Đúng/Sai, hoặc Câu 2 Tự luận..."
                  value={questionRef}
                  onChange={e => setQuestionRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do khiếu nại:
                </label>
                <textarea
                  rows={3}
                  placeholder="Giải thích ngắn gọn vì sao em cho rằng bài của mình đúng hoặc AI chấm điểm chưa chính xác..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                  required
                />
              </div>

              {/* Argument & steps */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cách giải / Dẫn chứng toán học của em:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi các bước lập luận, công thức, hoặc kết quả em đã tính ra để Thầy/Cô dễ dàng đối chiếu..."
                  value={studentArgument}
                  onChange={e => setStudentArgument(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Modal footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Cho Giáo Viên</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
