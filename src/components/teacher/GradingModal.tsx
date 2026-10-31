import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Submission, EssayGradingResult, ExamQuestion, ExamVariant } from '../../types';
import { MathText } from '../math/MathText';
import { TextbookVariationTable } from '../math/TextbookVariationTable';
import { TextbookGraph } from '../math/TextbookGraph';
import { TextbookSignTable } from '../math/TextbookSignTable';
import { TextbookStatisticsTable } from '../math/TextbookStatisticsTable';
import { TextbookGeometry, GeometryType } from '../math/TextbookGeometry';
import { getQuestionPartInfo } from '../../utils/examGenerator';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  FileText,
  User,
  ShieldAlert,
  Save,
  RefreshCw,
  Edit3,
  Camera,
  Maximize2,
  Image as ImageIcon,
  Award,
  Layers,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface GradingModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GradingModal: React.FC<GradingModalProps> = ({
  submission,
  isOpen,
  onClose,
}) => {
  const { exam, exams, gradeEssayWithAI, updateSubmission } = useApp();
  const [activeTab, setActiveTab] = useState<'all_questions' | 'essay'>('all_questions');
  const [isAIGrading, setIsAIGrading] = useState<boolean>(false);
  const [currentGrading, setCurrentGrading] = useState<EssayGradingResult | null>(
    submission?.essayGrading || null
  );
  const [essayScoreInput, setEssayScoreInput] = useState<number>(submission?.essayScore || 0);
  const [teacherRemarksInput, setTeacherRemarksInput] = useState<string>(
    submission?.essayGrading?.teacherRemarks || submission?.essayGrading?.detailedComment || ''
  );
  const [isEditingScore, setIsEditingScore] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; index: number } | null>(null);

  if (!isOpen || !submission) return null;

  const matchedExam = (exams && exams.find(e => e.id === submission.examId)) || exam;
  const variant: ExamVariant | undefined = matchedExam
    ? (matchedExam.variants?.[submission.variantCode] || matchedExam.variants?.['101'] || (matchedExam.variants ? Object.values(matchedExam.variants)[0] : undefined))
    : undefined;
  const questions: ExamQuestion[] = variant?.questions || matchedExam?.questions || [];
  const essayQuestion = questions.find(q => q.type === 'essay');
  const answerItem = submission.answers[essayQuestion?.id || ''];
  const studentEssayAnswer = (answerItem?.value as string) || '';

  // Extract handwritten paper solution photos
  const studentImages: string[] = answerItem?.images || [];
  if (studentImages.length === 0) {
    Object.values(submission.answers).forEach(ans => {
      if (ans && Array.isArray(ans.images) && ans.images.length > 0) {
        studentImages.push(...ans.images);
      }
    });
  }

  const handleCallAI = async () => {
    setIsAIGrading(true);
    try {
      const res = await gradeEssayWithAI(submission.id);
      if (res.success && res.data) {
        setEssayScoreInput(res.data.score);
        setTeacherRemarksInput(res.data.detailedComment || res.data.teacherRemarks);
        setCurrentGrading(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAIGrading(false);
    }
  };

  const handleSaveConfirmed = () => {
    const newTotal = +(submission.mcqScore + Number(essayScoreInput)).toFixed(2);
    const updated: Submission = {
      ...submission,
      essayScore: Number(essayScoreInput),
      totalScore: newTotal,
      status: 'confirmed',
      essayGrading: currentGrading ? {
        ...currentGrading,
        score: Number(essayScoreInput),
        teacherRemarks: teacherRemarksInput || currentGrading.teacherRemarks,
        source: 'teacher_confirmed'
      } : {
        score: Number(essayScoreInput),
        maxPoints: essayQuestion?.points || 2.0,
        breakdown: submission.essayGrading?.breakdown || [
          { criterion: 'Ý tưởng & Đặt bài toán', score: +(Number(essayScoreInput) * 0.4).toFixed(2), maxScore: 0.8 },
          { criterion: 'Biến đổi đạo hàm & Lập luận', score: +(Number(essayScoreInput) * 0.6).toFixed(2), maxScore: 1.2 }
        ],
        teacherRemarks: teacherRemarksInput || 'Giáo viên đã duyệt kết quả bài làm.',
        source: 'teacher_confirmed'
      }
    };
    updateSubmission(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] p-6 shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={submission.studentAvatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Chấm Thi: {submission.studentName}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Mã đề #{submission.variantCode}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Nộp lúc: {new Date(submission.submittedAt).toLocaleTimeString('vi-VN')} • {new Date(submission.submittedAt).toLocaleDateString('vi-VN')}
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

        {/* Tab Switcher: Full Review vs Essay/AI Vision */}
        <div className="flex border-b border-slate-200 mt-2 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all_questions')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'all_questions'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Toàn Bộ Bài Làm & Lời Giải Chi Tiết ({questions.length} câu)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('essay')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'essay'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Chấm Tự Luận & Ảnh Viết Tay (AI Vision)</span>
            {studentImages.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                📷 {studentImages.length}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Status & Anti-cheat Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px]">Điểm Trắc Nghiệm (Máy chấm):</span>
              <span className="text-lg font-bold text-emerald-700">
                {submission.mcqScore.toFixed(1)} / 8.0 đ
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[11px]">Điểm Tự Luận:</span>
              <span className="text-lg font-bold text-slate-800">
                {essayScoreInput.toFixed(1)} / {essayQuestion?.points || 2.0} đ
              </span>
            </div>

            <div className={`p-3 rounded-xl border text-xs ${
              submission.violationsCount === 0
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-300 text-amber-900'
            }`}>
              <span className="block text-[11px] font-semibold">Giám sát vi phạm (Tab-Switch):</span>
              <div className="flex items-center gap-1.5 font-bold mt-0.5">
                <ShieldAlert className="w-4 h-4" />
                <span>
                  {submission.violationsCount === 0
                    ? 'Nghiêm túc 0 vi phạm'
                    : `${submission.violationsCount} lần rời cửa sổ`}
                </span>
              </div>
            </div>
          </div>

          {/* Violation Logs if any */}
          {submission.violationLogs.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
              <div className="font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Nhật ký vi phạm chống gian lận:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-rose-700 text-[11px]">
                {submission.violationLogs.map((log, idx) => (
                  <li key={idx}>[{log.timestamp}] {log.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 1: ALL QUESTIONS REVIEW & FULL EXPLANATIONS */}
          {activeTab === 'all_questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Chi Tiết Toàn Bộ Câu Hỏi, Bài Làm Của Thí Sinh & Lời Giải Chuẩn:</span>
                </h4>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-full font-mono">
                  Mã đề #{submission.variantCode}
                </span>
              </div>

              {questions.map((q, idx) => {
                const partInfo = getQuestionPartInfo(q, idx);
                const studentAnsItem = submission.answers[q.id];
                const studentValue = studentAnsItem?.value;

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
                  <div key={q.id} className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3.5 text-xs">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800">
                          {partInfo.partRoman}: {q.type === 'multiple_choice' ? 'Trắc nghiệm 4 lựa chọn' : q.type === 'true_false' ? 'Trắc nghiệm Đúng / Sai' : q.type === 'short_answer' ? 'Trả lời ngắn' : 'Tự luận'}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {q.points} điểm
                        </span>
                      </div>

                      {q.type !== 'essay' ? (
                        <div className="flex items-center gap-1.5 font-bold">
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-300 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Làm đúng (+{q.points}đ)</span>
                            </span>
                          ) : partialStatus ? (
                            <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-300 text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{partialStatus}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-300 text-[11px]">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Chưa đúng (0đ)</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-300 text-[11px]">
                          Đạt {essayScoreInput.toFixed(1)} / {q.points} điểm
                        </span>
                      )}
                    </div>

                    {/* Question text */}
                    <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                      <MathText content={q.content} size="md" />
                    </div>

                    {/* Stimulus */}
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

                    {/* MCQ Options */}
                    {q.type === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = studentValue === optIdx;
                          const isTheCorrect = optIdx === q.correctAnswer;
                          let optBorder = 'border-slate-200 bg-white text-slate-700';

                          if (isSelected && isTheCorrect) {
                            optBorder = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500';
                          } else if (isSelected && !isTheCorrect) {
                            optBorder = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                          } else if (isTheCorrect) {
                            optBorder = 'border-emerald-400 bg-emerald-50/70 text-emerald-900 font-bold';
                          }

                          return (
                            <div key={optIdx} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${optBorder}`}>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span><MathText content={opt} /></span>
                              </div>
                              {isSelected && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-200 text-slate-800">
                                  {isTheCorrect ? 'Thí sinh chọn (Đúng)' : 'Thí sinh chọn (Sai)'}
                                </span>
                              )}
                              {!isSelected && isTheCorrect && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-200 text-emerald-900">
                                  Đáp án đúng
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True / False Sub-items */}
                    {q.type === 'true_false' && q.trueFalseItems && (
                      <div className="space-y-2 pt-1">
                        {q.trueFalseItems.map((item, itemIdx) => {
                          const studentTF = (studentValue || {}) as Record<string, boolean>;
                          const answered = studentTF[item.id];
                          const isItemCorrect = answered !== undefined && answered === item.correctAnswer;

                          return (
                            <div key={item.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-700">{item.label || `${String.fromCharCode(97 + itemIdx)})`}</span>
                                <span><MathText content={item.content} /></span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  answered === true ? 'bg-emerald-100 text-emerald-800' : answered === false ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  Học sinh: {answered === true ? 'Đúng' : answered === false ? 'Sai' : 'Chưa chọn'}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                                  Đáp án: {item.correctAnswer ? 'Đúng' : 'Sai'}
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
                    )}

                    {/* Short Answer */}
                    {q.type === 'short_answer' && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-500 text-[11px] block">Câu trả lời của thí sinh:</span>
                          <span className={`font-mono font-bold text-sm ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {studentValue ? String(studentValue) : '(Bỏ trống)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-[11px] block">Đáp án chuẩn của đề:</span>
                          <span className="font-mono font-bold text-sm text-emerald-800">
                            {q.correctAnswerText || '---'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Essay in Questions view */}
                    {q.type === 'essay' && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">Bài làm tự luận:</span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('essay')}
                            className="text-emerald-700 hover:underline font-bold text-[11px]"
                          >
                            Chuyển sang tab Chấm Tự Luận & Xem Ảnh Chi Tiết →
                          </button>
                        </div>
                        {studentImages.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              📷 {studentImages.length} ảnh bài làm viết tay
                            </span>
                            <span className="text-[11px] text-slate-500">(Bấm tab Chấm Tự Luận để chấm điểm và phóng to ảnh)</span>
                          </div>
                        )}
                        {studentEssayAnswer && (
                          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap max-h-28 overflow-y-auto">
                            {studentEssayAnswer}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation Box */}
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lời giải chi tiết chuẩn SGK GDPT 2018:</span>
                      </div>
                      <div className="text-slate-800 leading-relaxed text-xs">
                        <MathText content={q.explanation || 'Đang cập nhật lời giải chi tiết.'} size="md" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ESSAY QUESTIONS & AI VISION GRADING */}
          {activeTab === 'essay' && (
            <div className="space-y-4">
              {/* Section: Essay Question & Rubric */}
          {essayQuestion && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Câu hỏi Tự Luận (Mã đề #{submission.variantCode})
                </h4>
                <span className="text-xs font-semibold text-emerald-700">
                  Tối đa {essayQuestion.points} điểm
                </span>
              </div>
              <div className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed">
                <MathText content={essayQuestion.content} size="lg" />
              </div>

              {/* Rubric for this specific variant */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-950">
                <strong className="block mb-1 text-amber-900 font-bold">Barem đáp án chuẩn của Mã {submission.variantCode}:</strong>
                <div className="font-sans whitespace-pre-wrap leading-relaxed">
                  <MathText content={essayQuestion.rubric || ''} size="md" />
                </div>
              </div>

              {/* Standard Model Solution */}
              {essayQuestion.explanation && (
                <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs sm:text-sm text-emerald-950">
                  <strong className="block mb-1 text-emerald-900 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Đáp án chuẩn & Lời giải mẫu SGK (Mã đề #{submission.variantCode}):
                  </strong>
                  <div className="leading-relaxed">
                    <MathText content={essayQuestion.explanation} size="md" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Student's Actual Answer (Handwritten Photos + Text) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Bài Làm Thí Sinh Đã Nộp:</span>
              </h4>
              <div className="flex items-center gap-2">
                {studentImages.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    📷 {studentImages.length} trang ảnh viết tay
                  </span>
                )}
                {studentEssayAnswer && (
                  <span className="text-[11px] font-normal text-slate-500">
                    {studentEssayAnswer.length} ký tự văn bản
                  </span>
                )}
              </div>
            </div>

            {/* Handwritten Paper Photos Thumbnail Grid */}
            {studentImages.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Ảnh chụp bài làm viết tay trên giấy của học sinh (Nhấp vào ảnh để phóng to toàn màn hình):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {studentImages.map((imgUrl, imgIdx) => (
                    <div
                      key={imgIdx}
                      onClick={() => setLightboxImage({ url: imgUrl, index: imgIdx })}
                      className="relative group rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-slate-900 aspect-3/4 shadow-xs cursor-pointer hover:shadow-md transition-all"
                    >
                      <img
                        src={imgUrl}
                        alt={`Trang bài làm ${imgIdx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Trang {imgIdx + 1}
                      </div>
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-900 font-bold text-xs flex items-center gap-1 shadow">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Xem phóng to</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Solution (if present) */}
            {studentEssayAnswer && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Nội dung soạn thảo văn bản:
                </span>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                  {studentEssayAnswer}
                </div>
              </div>
            )}

            {!studentEssayAnswer && studentImages.length === 0 && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 italic text-center">
                Học sinh chưa nộp bài làm tự luận (không có ảnh bài làm và không nhập văn bản).
              </div>
            )}
          </div>

          {/* AI Auto-Grading Block (Gemini Vision + Text Rubric Matching) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>
                    {studentImages.length > 0
                      ? 'Trợ Lý Chấm Điểm Gemini Vision (Đọc Ảnh Viết Tay & Barem)'
                      : 'Trợ Lý Chấm Điểm AI (Gemini 3.8 Flash)'}
                  </span>
                </h4>
                <p className="text-xs text-slate-600">
                  {studentImages.length > 0
                    ? `Quét và phân tích ${studentImages.length} trang ảnh chụp bài làm viết tay của học sinh, đối chiếu từng bước barem.`
                    : 'Đối chiếu bài giải của học sinh với barem đáp án riêng của mã đề này.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCallAI}
                disabled={isAIGrading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAIGrading ? 'animate-spin' : ''}`} />
                <span>
                  {isAIGrading
                    ? studentImages.length > 0
                      ? 'Vision Đang Quét Ảnh...'
                      : 'AI Đang Chấm...'
                    : studentImages.length > 0
                    ? 'AI Vision Chấm Bài Viết Tay'
                    : 'AI Chấm Gợi Ý'}
                </span>
              </button>
            </div>

            {/* Comprehensive AI Evaluation Display if graded */}
            {(currentGrading || submission.essayGrading) && (() => {
              const grading = currentGrading || submission.essayGrading!;
              return (
                <div className="space-y-3 pt-2">
                  {/* Score & Source banner */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-300">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="font-bold text-xs text-slate-800">
                          Kết Quả Phân Tích & Chấm Điểm Của AI:
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {grading.source === 'gemini_vision'
                            ? 'Gemini Vision (Nhận dạng chữ viết tay & ảnh chụp)'
                            : grading.source === 'gemini_ai'
                            ? 'Gemini AI (Phân tích văn bản bám sát đáp án chuẩn)'
                            : 'Mô phỏng phân tích sư phạm'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-700 font-mono">
                        {grading.score} / {grading.maxPoints} đ
                      </div>
                      {grading.percentage !== undefined && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Đạt {grading.percentage}% chuẩn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Comparison With Standard Key */}
                  {grading.comparisonWithKey && (
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-1">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đối Chiếu Chi Tiết Với Đáp Án Chuẩn SGK:</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed text-xs">
                        {grading.comparisonWithKey}
                      </p>
                    </div>
                  )}

                  {/* Detailed Comments */}
                  {grading.detailedComment && (
                    <div className="p-3.5 rounded-xl bg-emerald-100/40 border border-emerald-200 space-y-1">
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lời Nhận Xét Chi Tiết Của AI:</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed text-xs italic">
                        "{grading.detailedComment}"
                      </p>
                    </div>
                  )}

                  {/* Step-by-step breakdown */}
                  {grading.breakdown && grading.breakdown.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-800 block">
                        Chi tiết điểm từng tiêu chí theo barem:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {grading.breakdown.map((item, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-800 text-[11px] truncate" title={item.criterion}>
                                {item.criterion}
                              </span>
                              <span className="font-bold text-emerald-700 text-xs font-mono">
                                {item.score} / {item.maxScore} đ
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {grading.strengths && grading.strengths.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                        <span className="font-bold text-emerald-900 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Ưu điểm / Các bước làm đúng:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-700">
                          {grading.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {grading.weaknesses && grading.weaknesses.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                        <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Hạn chế / Điểm cần khắc phục:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-700">
                          {grading.weaknesses.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Suggestions if any */}
                  {grading.suggestions && grading.suggestions.length > 0 && (
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
                      <span className="font-bold text-sky-950 text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        Lời khuyên sư phạm để học sinh tiến bộ:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-700">
                        {grading.suggestions.map((sug, idx) => (
                          <li key={idx}>{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Score & Teacher remarks adjustment */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điểm Tự Luận Chốt & Lời Phê Sư Phạm:</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Điểm tự luận:</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max={essayQuestion?.points || 2.0}
                    value={essayScoreInput}
                    onChange={(e) => setEssayScoreInput(Number(e.target.value))}
                    className="w-20 px-2 py-1 text-center font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg text-sm"
                  />
                  <span className="text-xs text-slate-500">/ {essayQuestion?.points || 2.0} đ</span>
                </div>
              </div>

              <textarea
                rows={3}
                value={teacherRemarksInput}
                onChange={(e) => setTeacherRemarksInput(e.target.value)}
                placeholder="Nhập lời phê của giáo viên dành cho bài làm..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
          <div className="text-xs text-slate-500">
            Tổng điểm đề xuất: <strong className="text-emerald-700 font-bold text-sm">{+(submission.mcqScore + Number(essayScoreInput)).toFixed(2)}</strong> / 10.0 đ
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveConfirmed}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Xác Nhận Điểm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Teacher Zooming Handwritten Work */}
      {lightboxImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-white pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  Trang bài làm {lightboxImage.index + 1} - {submission.studentName}
                </span>
                <span className="text-xs text-slate-400">
                  (Mã đề #{submission.variantCode})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-auto max-h-[82vh] rounded-xl border border-slate-700 bg-black flex items-center justify-center p-1 w-full">
              <img
                src={lightboxImage.url}
                alt={`Trang ${lightboxImage.index + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
            </div>

            <div className="text-center text-xs text-slate-400 pt-2">
              Bấm nút X hoặc phím Esc để đóng ảnh phóng to
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
