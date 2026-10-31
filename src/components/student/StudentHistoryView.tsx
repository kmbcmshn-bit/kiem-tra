import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Submission, ExamVariant, ExamQuestion } from '../../types';
import { MathText } from '../math/MathText';
import { TextbookVariationTable } from '../math/TextbookVariationTable';
import { TextbookGraph } from '../math/TextbookGraph';
import { TextbookSignTable } from '../math/TextbookSignTable';
import { TextbookStatisticsTable } from '../math/TextbookStatisticsTable';
import { TextbookGeometry, GeometryType } from '../math/TextbookGeometry';
import { getQuestionPartInfo } from '../../utils/examGenerator';
import {
  FileCheck,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  RefreshCw,
  AlertTriangle,
  MessageSquareQuote,
  Send,
  X
} from 'lucide-react';

interface StudentHistoryViewProps {
  onBack: () => void;
  onGoToExam?: () => void;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({ onBack, onGoToExam }) => {
  const { currentStudent, submissions, exam, exams, gradeEssayWithAI, complaints, submitComplaint } = useApp();
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [isAIGradingHistory, setIsAIGradingHistory] = useState<boolean>(false);

  // Complaint Modal states
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState<boolean>(false);
  const [complaintTargetSub, setComplaintTargetSub] = useState<Submission | null>(null);
  const [complaintQuestionId, setComplaintQuestionId] = useState<string>('all');
  const [complaintReason, setComplaintReason] = useState<string>('');
  const [complaintEvidence, setComplaintEvidence] = useState<string>('');
  const [complaintSuccessMsg, setComplaintSuccessMsg] = useState<string>('');

  const handleTriggerAIGrade = async (subId: string) => {
    setIsAIGradingHistory(true);
    try {
      const res = await gradeEssayWithAI(subId);
      if (res.success && res.data) {
        setSelectedSub(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            essayScore: res.data!.score,
            totalScore: +(prev.mcqScore + res.data!.score).toFixed(2),
            status: 'ai_graded',
            essayGrading: res.data,
          };
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAIGradingHistory(false);
    }
  };

  if (!currentStudent) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
        Vui lòng đăng nhập tài khoản học sinh để xem lịch sử làm bài.
      </div>
    );
  }

  // Get submissions of this student
  const studentSubmissions = submissions.filter(s => s.studentId === currentStudent.id);

  // If a submission is selected, show the full detailed review with explanations & solutions
  if (selectedSub) {
    // Find matching exam and variant
    const matchedExam = (exams && exams.find(e => e.id === selectedSub.examId)) || exam;
    const variant: ExamVariant | undefined = matchedExam?.variants?.[selectedSub.variantCode] ||
      matchedExam?.variants?.['101'] ||
      (matchedExam?.variants ? Object.values(matchedExam.variants)[0] : undefined);

    const questions: ExamQuestion[] = variant?.questions || matchedExam?.questions || [];

    return (
      <div className="space-y-6 pb-16 animate-fadeIn">
        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => setSelectedSub(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Danh Sách Lịch Sử Bài Làm</span>
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Chi Tiết Bài Làm & Lời Giải: {selectedSub.examTitle}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                Mã Đề #{selectedSub.variantCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
              <span>Học sinh: <strong className="text-slate-800">{selectedSub.studentName}</strong></span>
              <span>• Nộp bài: {new Date(selectedSub.submittedAt).toLocaleString('vi-VN')}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Tổng Điểm</div>
              <div className="text-2xl font-black text-emerald-700">
                {selectedSub.totalScore.toFixed(1)} / 10.0 đ
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Score Breakdown summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-medium">Điểm Trắc Nghiệm (Phần I, II, III)</span>
            <div className="text-xl font-bold text-emerald-700">
              {selectedSub.mcqScore.toFixed(1)} đ
            </div>
            <p className="text-[11px] text-slate-400">Máy tự động chấm theo biểu điểm chuẩn</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-medium">Điểm Tự Luận Viết Tay</span>
            <div className="text-xl font-bold text-teal-700">
              {selectedSub.essayScore > 0 ? `${selectedSub.essayScore.toFixed(1)} đ` : 'Đang xử lý / 0 đ'}
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedSub.status === 'confirmed' ? 'Giáo viên đã duyệt bài' : selectedSub.status === 'ai_graded' ? 'AI đã chấm' : 'Chờ giáo viên duyệt'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs text-slate-500 font-medium">Kỷ Luật Phòng Thi</span>
            <div className={`text-xl font-bold ${selectedSub.violationsCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {selectedSub.violationsCount === 0 ? 'Trung thực (0 vi phạm)' : `${selectedSub.violationsCount} lần chuyển tab`}
            </div>
            <p className="text-[11px] text-slate-400">Hệ thống giám sát chống gian lận</p>
          </div>
        </div>

        {/* Complaint / Appeal Action & Status */}
        {(() => {
          const matchedComplaint = complaints.find(c => c.submissionId === selectedSub.id);
          return (
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    Phúc Khảo & Khiếu Nại Chấm Điểm
                  </span>
                  {matchedComplaint && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${
                      matchedComplaint.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : matchedComplaint.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {matchedComplaint.status === 'accepted'
                        ? 'Đã Chấp Thuận (+điểm)'
                        : matchedComplaint.status === 'rejected'
                        ? 'Đã Phản Hồi (Giữ nguyên)'
                        : 'Đang Chờ Giáo Viên Duyệt'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {matchedComplaint
                    ? `Em đã gửi khiếu nại: "${matchedComplaint.complaintReason}". ${matchedComplaint.teacherFeedback ? `Lời phê: "${matchedComplaint.teacherFeedback}"` : 'Thầy/Cô đang đối chiếu lại bài làm.'}`
                    : 'Nếu em thấy ứng dụng chấm sót bước giải, bài tự luận bị trừ điểm oan hoặc đáp án chưa thỏa đáng, em có thể gửi đơn phúc khảo để Thầy/Cô chấm lại.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setComplaintTargetSub(selectedSub);
                  setIsComplaintModalOpen(true);
                  setComplaintSuccessMsg('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageSquareQuote className="w-3.5 h-3.5 text-amber-700" />
                <span>{matchedComplaint ? 'Xem / Gửi Bổ Sung Khiếu Nại' : 'Gửi Đơn Khiếu Nại Chấm Sai'}</span>
              </button>
            </div>
          );
        })()}

        {/* Teacher / AI Remarks if any */}
        {selectedSub.essayGrading && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Nhận xét & Lời phê của Giáo viên:</span>
            </div>
            <p className="text-slate-800 leading-relaxed italic text-sm">
              "{selectedSub.essayGrading.teacherRemarks}"
            </p>
          </div>
        )}

        {/* Detailed Question Review & Solution */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Chi Tiết Từng Câu Hỏi, Bài Làm Của Em & Lời Giải Chuẩn SGK:
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
              {questions.length} câu hỏi
            </span>
          </div>

          {questions.map((q, idx) => {
            const partInfo = getQuestionPartInfo(q, idx);
            const studentAnsItem = selectedSub.answers[q.id];
            const studentValue = studentAnsItem?.value;

            // Determine correctness
            let isCorrect = false;
            let partialStatus = '';

            if (q.type === 'multiple_choice') {
              isCorrect = studentValue !== undefined && studentValue === q.correctAnswer;
            } else if (q.type === 'true_false') {
              const studentTF = (studentValue || {}) as Record<string, boolean>;
              const items = q.trueFalseItems || [];
              let c = 0;
              items.forEach(it => {
                if (studentTF[it.id] !== undefined && studentTF[it.id] === it.correctAnswer) {
                  c++;
                }
              });
              isCorrect = c === 4;
              partialStatus = `Đúng ${c}/4 ý`;
            } else if (q.type === 'short_answer') {
              const cleanA = String(studentValue || '').trim().toLowerCase();
              const cleanExp = String(q.correctAnswerText || '').trim().toLowerCase();
              isCorrect = cleanA === cleanExp;
            }

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {partInfo.partRoman}: {q.type === 'multiple_choice' ? 'Trắc nghiệm 4 phương án' : q.type === 'true_false' ? 'Trắc nghiệm Đúng / Sai' : q.type === 'short_answer' ? 'Trả lời ngắn' : 'Tự luận giải tay'}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {q.points} điểm
                    </span>
                  </div>

                  {q.type !== 'essay' ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Làm đúng (+{q.points}đ)</span>
                        </span>
                      ) : partialStatus ? (
                        <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-300">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{partialStatus}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-300">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Chưa chính xác (0đ)</span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                      Đạt {selectedSub.essayScore.toFixed(1)} / {q.points} điểm
                    </span>
                  )}
                </div>

                {/* Question Content */}
                <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  <MathText content={q.content} size="lg" />
                </div>

                {/* Question Stimulus if any */}
                {(q.stimulus?.type === 'graph' || q.stimulus?.type === 'diagram') && (
                  <div className="my-2">
                    <TextbookGraph title={q.stimulus.caption || 'Đồ thị hàm số'} />
                  </div>
                )}
                {(q.stimulus?.type === 'variation_table' || q.stimulus?.type === 'table') && (
                  <div className="my-2">
                    <TextbookVariationTable />
                  </div>
                )}
                {q.stimulus?.type === 'sign_table' && (
                  <div className="my-2">
                    <TextbookSignTable />
                  </div>
                )}
                {(q.stimulus?.type === 'statistics' || q.content.toLowerCase().includes('mẫu số liệu ghép nhóm') || q.content.toLowerCase().includes('bảng phân bố tần số') || q.content.toLowerCase().includes('bảng thống kê')) && (
                  <div className="my-2">
                    <TextbookStatisticsTable />
                  </div>
                )}
                {(q.stimulus?.type === 'geometry' || q.stimulus?.type === 'geometry_3d' || q.content.toLowerCase().includes('hình chóp') || q.content.toLowerCase().includes('lăng trụ') || q.content.toLowerCase().includes('hình hộp') || q.content.toLowerCase().includes('hình nón') || q.content.toLowerCase().includes('hình trụ') || q.content.toLowerCase().includes('mặt cầu')) && (
                  <div className="my-2">
                    {(() => {
                      const c = q.content.toLowerCase();
                      let geomType: GeometryType = 'pyramid_quad';
                      if (c.includes('lăng trụ')) geomType = 'prism_triangle';
                      else if (c.includes('chóp') && (c.includes('tam giác') || c.includes('s.abc'))) geomType = 'pyramid_triangle';
                      else if (c.includes('chóp')) geomType = 'pyramid_quad';
                      else if (c.includes('hộp') || c.includes('lập phương')) geomType = 'cuboid';
                      else if (c.includes('nón')) geomType = 'cone';
                      else if (c.includes('trụ')) geomType = 'cylinder';
                      else if (c.includes('cầu')) geomType = 'sphere';
                      else if (c.includes('tam giác')) geomType = 'triangle_plane';
                      else if (c.includes('đường tròn')) geomType = 'circle_plane';
                      return (
                        <TextbookGeometry
                          type={geomType}
                          title={q.stimulus?.caption || 'Hình vẽ toán học chuẩn SGK'}
                        />
                      );
                    })()}
                  </div>
                )}

                {/* Multiple Choice Options Comparison */}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-semibold text-slate-500">Các phương án lựa chọn:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isStudentPick = studentValue === oIdx;
                        const isTheCorrectAns = q.correctAnswer === oIdx;

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium ${
                              isTheCorrectAns
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                                : isStudentPick && !isTheCorrectAns
                                ? 'bg-rose-50 border-rose-400 text-rose-950 line-through'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="whitespace-nowrap inline-block">
                              <MathText content={opt} size="md" />
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {isStudentPick && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isTheCorrectAns ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                }`}>
                                  EM CHỌN
                                </span>
                              )}
                              {isTheCorrectAns && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                  ĐÁP ÁN ĐÚNG
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* True / False breakdown */}
                {q.type === 'true_false' && (
                  <div className="space-y-2 pt-1 border border-sky-100 rounded-xl p-3 bg-sky-50/30">
                    <div className="font-bold text-sky-950 text-xs mb-1">
                      Kết quả đối chiếu từng khẳng định:
                    </div>
                    <div className="divide-y divide-slate-100">
                      {(q.trueFalseItems || []).map((item) => {
                        const studentPick = ((studentValue || {}) as Record<string, boolean>)[item.id];
                        const isItemCorrect = studentPick !== undefined && studentPick === item.correctAnswer;

                        return (
                          <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                            <div className="flex items-start gap-2 flex-1">
                              <span className="font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded text-xs shrink-0">
                                {item.label || `${item.id})`}
                              </span>
                              <span className="text-slate-800 font-medium">
                                <MathText content={item.content} size="md" />
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 text-xs">
                              <span className="text-slate-500">
                                Em chọn: <strong className={studentPick ? 'text-emerald-700' : 'text-rose-700'}>
                                  {studentPick === undefined ? 'Bỏ trống' : studentPick ? 'ĐÚNG' : 'SAI'}
                                </strong>
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-emerald-700 font-bold">
                                Đáp án: {item.correctAnswer ? 'ĐÚNG' : 'SAI'}
                              </span>
                              {isItemCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Short answer comparison */}
                {q.type === 'short_answer' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Đáp án em đã điền:</span>
                      <strong className={`font-mono text-sm ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {studentValue !== undefined && String(studentValue).trim() !== '' ? String(studentValue) : '(Bỏ trống)'}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Đáp án chuẩn của đề:</span>
                      <strong className="font-mono text-sm text-emerald-700">
                        {q.correctAnswerText || 'Đang cập nhật'}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Essay Handwritten photos & Student response */}
                {q.type === 'essay' && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Bài làm của em đã nộp:</span>
                    </div>

                    {/* Photos */}
                    {studentAnsItem?.images && studentAnsItem.images.length > 0 ? (
                      <div>
                        <div className="text-xs text-slate-500 mb-2">
                          Ảnh bài làm viết tay ({studentAnsItem.images.length} trang ảnh):
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {studentAnsItem.images.map((img, iIdx) => (
                            <img
                              key={iIdx}
                              src={img}
                              alt={`Trang ${iIdx + 1}`}
                              className="w-32 h-32 object-cover rounded-xl border border-slate-300 shadow-2xs hover:scale-105 transition-transform"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        {typeof studentValue === 'string' && studentValue.trim()
                          ? `Nội dung đã nộp: "${studentValue}"`
                          : 'Học sinh chưa tải ảnh bài làm lên.'}
                      </p>
                    )}

                    {/* Rubric */}
                    {q.rubric && (
                      <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                        <span className="font-bold text-slate-700 block mb-1">Barem chấm điểm chuẩn:</span>
                        <div className="whitespace-pre-line text-slate-600 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                          {q.rubric}
                        </div>
                      </div>
                    )}

                    {/* AI Grading & Comparison Results */}
                    {selectedSub.essayGrading ? (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border border-emerald-300 space-y-3.5 text-xs">
                        <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-emerald-600 text-white">
                              <Sparkles className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <h5 className="font-bold text-emerald-950 text-xs">
                                Kết Quả AI Chấm Tự Luận & Đối Chiếu Đáp Án Chuẩn
                              </h5>
                              <span className="text-[10px] text-emerald-700">
                                {selectedSub.essayGrading.source === 'gemini_vision'
                                  ? 'Đã đọc và đối chiếu ảnh bài làm viết tay qua Gemini Vision'
                                  : 'Đã phân tích văn bản bài làm qua Gemini AI'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-emerald-800 font-mono">
                              {selectedSub.essayGrading.score} / {selectedSub.essayGrading.maxPoints} đ
                            </div>
                            {selectedSub.essayGrading.percentage !== undefined && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Đạt {selectedSub.essayGrading.percentage}% chuẩn
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct Comparison with Standard Key */}
                        {selectedSub.essayGrading.comparisonWithKey && (
                          <div className="p-3 rounded-lg bg-white border border-emerald-200 space-y-1">
                            <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-[11px]">
                              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Phân Tích Đối Chiếu Với Đáp Án Chuẩn SGK:</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed text-xs">
                              {selectedSub.essayGrading.comparisonWithKey}
                            </p>
                          </div>
                        )}

                        {/* Detailed Comments */}
                        {selectedSub.essayGrading.detailedComment && (
                          <div className="p-3 rounded-lg bg-emerald-100/50 border border-emerald-200 space-y-1">
                            <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Lời Nhận Xét Chi Tiết Của AI:</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed italic text-xs">
                              "{selectedSub.essayGrading.detailedComment}"
                            </p>
                          </div>
                        )}

                        {/* Criteria Breakdown */}
                        {selectedSub.essayGrading.breakdown && selectedSub.essayGrading.breakdown.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="font-bold text-slate-800 text-[11px] block">
                              Điểm thành phần từng bước theo barem:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {selectedSub.essayGrading.breakdown.map((item, bIdx) => (
                                <div key={bIdx} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800 text-[11px] truncate" title={item.criterion}>
                                      {item.criterion}
                                    </span>
                                    <span className="font-mono font-bold text-emerald-700 text-xs">
                                      {item.score}/{item.maxScore}đ
                                    </span>
                                  </div>
                                  {item.comment && (
                                    <p className="text-[10px] text-slate-600 leading-tight">
                                      {item.comment}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {selectedSub.essayGrading.strengths && selectedSub.essayGrading.strengths.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                              <span className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Điểm em làm đúng:
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                                {selectedSub.essayGrading.strengths.map((str, sIdx) => (
                                  <li key={sIdx}>{str}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedSub.essayGrading.weaknesses && selectedSub.essayGrading.weaknesses.length > 0 && (
                            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                              <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                Điểm cần rút kinh nghiệm:
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                                {selectedSub.essayGrading.weaknesses.map((wk, wIdx) => (
                                  <li key={wIdx}>{wk}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Pedagogical Suggestions */}
                        {selectedSub.essayGrading.suggestions && selectedSub.essayGrading.suggestions.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 space-y-1">
                            <span className="font-bold text-sky-950 text-[11px] flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                              Lời khuyên để đạt điểm tuyệt đối:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                              {selectedSub.essayGrading.suggestions.map((sug, sgIdx) => (
                                <li key={sgIdx}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-600">
                          <span className="font-bold text-slate-800 block">Bài tự luận đang chờ chấm</span>
                          <span>Em có thể bấm nút bên cạnh để hệ thống AI phân tích và chấm điểm ngay.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTriggerAIGrade(selectedSub.id)}
                          disabled={isAIGradingHistory}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isAIGradingHistory ? 'animate-spin' : ''}`} />
                          <span>{isAIGradingHistory ? 'AI Đang Chấm...' : 'Yêu Cầu AI Chấm Điểm Ngay'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Detailed Explanation / Lời giải chi tiết */}
                {q.explanation && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900 text-xs uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lời giải chi tiết chuẩn SGK:</span>
                    </div>
                    <div className="leading-relaxed">
                      <MathText content={q.explanation} size="md" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // List of all submissions of the current student
  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Góc Học Tập</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Lịch Sử Làm Bài & Điểm Số Của Em
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Học sinh: <strong className="text-slate-800">{currentStudent.name}</strong> • Lớp: <strong className="text-slate-800">{currentStudent.className}</strong>
          </p>
        </div>

        {onGoToExam && exam && (
          <button
            type="button"
            onClick={onGoToExam}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Vào Phòng Thi Làm Bài</span>
          </button>
        )}
      </div>

      {studentSubmissions.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <FileCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-lg">
              Em Chưa Làm Bài Kiểm Tra Nào
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Các bài kiểm tra em đã làm sẽ được lưu vĩnh viễn trên hệ thống. Sau khi nộp bài, em có thể xem lại điểm, xem lại bài làm của mình và đọc lời giải chi tiết tại đây.
            </p>
          </div>

          {onGoToExam && exam && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onGoToExam}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Vào Làm Bài Kiểm Tra Ngay
              </button>
            </div>
          )}
        </div>
      ) : (
        /* List of student's submissions */
        <div className="space-y-3">
          {studentSubmissions.map((sub, idx) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Mã đề #{sub.variantCode}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    {sub.examTitle}
                  </h4>
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pl-8">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nộp lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Trắc nghiệm: <strong className="text-emerald-700">{sub.mcqScore.toFixed(1)}đ</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Tự luận: <strong className="text-teal-700">{sub.essayScore.toFixed(1)}đ</strong>
                  </span>
                  <span>•</span>
                  <span className={sub.violationsCount === 0 ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                    {sub.violationsCount === 0 ? 'Trung thực (0 vi phạm)' : `${sub.violationsCount} lần chuyển tab`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 pl-8 sm:pl-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Tổng Điểm</div>
                  <div className="text-2xl font-black text-emerald-700">
                    {sub.totalScore.toFixed(1)} đ
                  </div>
                </div>

                {/* Complaint Status / Button */}
                {(() => {
                  const subComplaint = complaints.find(c => c.submissionId === sub.id);
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setComplaintTargetSub(sub);
                        setIsComplaintModalOpen(true);
                        setComplaintSuccessMsg('');
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                        subComplaint
                          ? subComplaint.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : subComplaint.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-slate-200 hover:border-amber-300'
                      }`}
                      title="Khiếu nại nếu kết quả chấm có sai sót"
                    >
                      <MessageSquareQuote className="w-3.5 h-3.5 text-amber-700" />
                      <span className="hidden sm:inline">
                        {subComplaint
                          ? subComplaint.status === 'accepted'
                            ? 'Đã phúc khảo (+)'
                            : subComplaint.status === 'rejected'
                            ? 'Đã trả lời'
                            : 'Đang phúc khảo'
                          : 'Khiếu nại'}
                      </span>
                    </button>
                  );
                })()}

                <button
                  type="button"
                  onClick={() => setSelectedSub(sub)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Xem Chi Tiết & Lời Giải</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLAINT MODAL */}
      {isComplaintModalOpen && complaintTargetSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-900">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Đơn Khiếu Nại & Phúc Khảo Điểm</h3>
                  <p className="text-[11px] text-slate-500">Mã đề #{complaintTargetSub.variantCode} • {complaintTargetSub.examTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsComplaintModalOpen(false);
                  setComplaintTargetSub(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {complaintSuccessMsg ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-900 text-xs space-y-3 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div className="font-bold text-base text-emerald-950">{complaintSuccessMsg}</div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Thầy/Cô đã nhận được thông báo khiếu nại của em. Thầy/Cô sẽ đối chiếu lại bài làm với đáp án chuẩn và cập nhật điểm phúc khảo vào sổ điểm.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsComplaintModalOpen(false);
                    setComplaintTargetSub(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Đã Hiểu & Đóng
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!complaintReason.trim()) return;

                  submitComplaint({
                    submissionId: complaintTargetSub.id,
                    examId: complaintTargetSub.examId,
                    examTitle: complaintTargetSub.examTitle,
                    studentId: currentStudent.id,
                    studentName: currentStudent.name,
                    studentAvatar: currentStudent.avatar,
                    className: currentStudent.className || 'Toán THPT',
                    variantCode: complaintTargetSub.variantCode,
                    questionId: complaintQuestionId === 'all' ? undefined : complaintQuestionId,
                    questionNumber: complaintQuestionId === 'all' ? 'Toàn bài thi' : complaintQuestionId === 'essay' ? 'Phần Tự luận viết tay' : complaintQuestionId,
                    complaintReason: complaintReason.trim(),
                    studentEvidence: complaintEvidence.trim(),
                    originalScore: complaintTargetSub.totalScore,
                  });

                  setComplaintSuccessMsg('Gửi đơn khiếu nại thành công! Thầy/Cô sẽ xem xét và phản hồi sớm nhất.');
                  setComplaintReason('');
                  setComplaintEvidence('');
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Chọn phần thi hoặc câu hỏi em thấy chấm chưa đúng:
                  </label>
                  <select
                    value={complaintQuestionId}
                    onChange={(e) => setComplaintQuestionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="all">Toàn bộ bài thi (Tổng điểm chung {complaintTargetSub.totalScore}đ)</option>
                    <option value="essay">Phần Tự luận viết tay (Hiện tại: {complaintTargetSub.essayScore}đ)</option>
                    <option value="mcq">Phần Trắc nghiệm (Hiện tại: {complaintTargetSub.mcqScore}đ)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Lý do khiếu nại chi tiết <span className="text-red-500">*</span>:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={complaintReason}
                    onChange={(e) => setComplaintReason(e.target.value)}
                    placeholder="Ví dụ: AI chấm bài tự luận chưa nhận diện được bước giải tính đạo hàm ở dòng 3 của ảnh chụp bài làm; hoặc đáp án câu trắc nghiệm em tính ra kết quả..."
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Dẫn chứng hoặc giải thích thêm của em:
                  </label>
                  <textarea
                    rows={2}
                    value={complaintEvidence}
                    onChange={(e) => setComplaintEvidence(e.target.value)}
                    placeholder="Em đã làm theo đúng công thức SGK trang... Kết quả em tính ra là..."
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsComplaintModalOpen(false);
                      setComplaintTargetSub(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Đơn Phúc Khảo Cho Thầy/Cô</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
