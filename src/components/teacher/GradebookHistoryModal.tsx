import React from 'react';
import { GradebookRecord, Submission } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, History, Calendar, FileText, CheckCircle2, Award, Sparkles, ExternalLink } from 'lucide-react';

interface GradebookHistoryModalProps {
  record: GradebookRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onViewSubmission?: (sub: Submission) => void;
}

export const GradebookHistoryModal: React.FC<GradebookHistoryModalProps> = ({
  record,
  isOpen,
  onClose,
  onViewSubmission,
}) => {
  const { submissions } = useApp();
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Lịch Sử Điểm & Bài Làm: {record.studentName}
              </h3>
              <p className="text-xs text-slate-500">
                Số thứ tự: #{record.rollNumber} • Điểm TB: <strong className="text-emerald-700">{record.averageScore}</strong> • Điểm cao nhất: <strong className="text-emerald-700">{record.highestScore}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Các bài tập & bài kiểm tra đã nộp trong kỳ:
          </div>

          {record.history.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có dữ liệu bài nộp nào.
            </div>
          ) : (
            record.history.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.examTitle}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Mã #{item.variantCode}
                    </span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.submittedAt}
                    </span>
                    <span>Cột: <strong className="text-slate-700">{item.column}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-700">
                      {item.score.toFixed(1)} đ
                    </div>
                    <span className="text-[10px] text-slate-400">Hệ số 1.0</span>
                  </div>

                  {onViewSubmission && (
                    <button
                      type="button"
                      onClick={() => {
                        const matched = submissions.find(
                          (s) =>
                            s.studentId === record.studentId &&
                            (s.variantCode === item.variantCode || s.examTitle === item.examTitle)
                        );
                        if (matched) {
                          onViewSubmission(matched);
                        } else {
                          const syntheticSub: Submission = {
                            id: item.submissionId || `sub-hist-${record.studentId}-${idx}`,
                            examId: item.examId || 'exam-custom',
                            examTitle: item.examTitle,
                            studentId: record.studentId,
                            studentName: record.studentName,
                            studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
                            variantCode: item.variantCode,
                            submittedAt: item.submittedAt,
                            violationsCount: 0,
                            violationLogs: [],
                            answers: {},
                            mcqScore: +(item.score * 0.8).toFixed(1),
                            essayScore: +(item.score * 0.2).toFixed(1),
                            totalScore: item.score,
                            status: 'confirmed',
                          };
                          onViewSubmission(syntheticSub);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Xem bài làm và lời giải chi tiết"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Xem bài làm</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Dữ liệu đồng bộ trực tiếp từ Sổ điểm điện tử môn Toán học GDPT 2018
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
