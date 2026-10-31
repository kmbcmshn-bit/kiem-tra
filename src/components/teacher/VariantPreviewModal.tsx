import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, X, Search, CheckCircle2, User, HelpCircle, Eye, Sparkles, Send } from 'lucide-react';
import { MathText } from '../math/MathText';
import { TextbookVariationTable } from '../math/TextbookVariationTable';
import { TextbookSignTable } from '../math/TextbookSignTable';
import { TextbookGraph } from '../math/TextbookGraph';
import { TextbookStatisticsTable } from '../math/TextbookStatisticsTable';
import { TextbookGeometry, GeometryType } from '../math/TextbookGeometry';
import { getQuestionPartInfo } from '../../utils/examGenerator';

interface VariantPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAssign?: () => void;
}

export const VariantPreviewModal: React.FC<VariantPreviewModalProps> = ({
  isOpen,
  onClose,
  onOpenAssign,
}) => {
  const { exam, students } = useApp();
  const [selectedCode, setSelectedCode] = useState<string>('101');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('large');

  if (!isOpen) return null;

  if (!exam) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Chưa Có Đề Thi Nào</h4>
          <p className="text-slate-500 text-xs">Vui lòng tạo đề thi gốc trước khi xem trước mã đề.</p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const variantList = Object.keys(exam.variants || {});
  const activeVariant = exam.variants[selectedCode] || exam.variants['101'] || Object.values(exam.variants)[0];

  // Find which student gets this code
  const assignedStudentId = Object.keys(exam.assignedCodes || {}).find(
    sId => exam.assignedCodes[sId] === selectedCode
  );
  const assignedStudent = students.find(s => s.id === assignedStudentId);

  const filteredCodes = variantList.filter(c =>
    c.includes(searchQuery) ||
    (students.find(s => exam.assignedCodes?.[s.id] === c)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[85vh] p-6 shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Đối Chiếu & Kiểm Tra {variantList.length} Mã Đề Tương Đương
              </h3>
              <p className="text-xs text-slate-500">
                Mỗi học sinh 1 mã đề • Barem đáp án và số liệu toán học độc lập
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick Action: Giao Đề Cho Lớp / Nhóm */}
            {onOpenAssign && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAssign();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="Giao đề thi này cho lớp hoặc nhóm học sinh"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Giao Đề Cho Lớp</span>
              </button>
            )}

            {/* Font Size Selector for Teacher Preview */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 hidden sm:inline">
                Cỡ chữ:
              </span>
              <button
                type="button"
                onClick={() => setFontSizeLevel('normal')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontSizeLevel === 'normal'
                    ? 'bg-white text-emerald-900 shadow-2xs font-extrabold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cỡ chữ Chuẩn (16px)"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('large')}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontSizeLevel === 'large'
                    ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cỡ chữ Lớn (18px - Khuyên dùng)"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSizeLevel('xlarge')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  fontSizeLevel === 'xlarge'
                    ? 'bg-emerald-700 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cỡ chữ Rất Lớn (20px)"
              >
                A++
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body (Sidebar with codes list + Main preview) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 flex-1 overflow-hidden">
          {/* Left: Code selector (4 Cols) */}
          <div className="md:col-span-4 flex flex-col border-r border-slate-100 pr-4 overflow-hidden">
            <div className="mb-3 relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đề hoặc tên học sinh..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {filteredCodes.map((code) => {
                const isSelected = code === selectedCode;
                const student = students.find(s => exam.assignedCodes?.[s.id] === code);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedCode(code)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                          Mã {code}
                        </span>
                        <span className="truncate">{student ? student.name : 'Chưa gán'}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Exam Variant Content (8 Cols) */}
          <div className="md:col-span-8 overflow-y-auto pr-2 space-y-4">
            {activeVariant ? (
              <>
                {/* Variant Info Banner */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      MÃ ĐỀ: #{selectedCode}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {activeVariant.title}
                    </h4>
                    {/* Class & Student Assignment Check */}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {exam.targetAssignment ? (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                          {exam.targetAssignment.type === 'class'
                            ? `Đề dành cho: Lớp ${exam.targetAssignment.targetClassName || 'đã chọn'}`
                            : exam.targetAssignment.type === 'group'
                            ? `Đề dành cho: ${exam.targetAssignment.groupName}`
                            : `Đề dành cho: ${exam.targetAssignment.studentIds?.length || 0} học sinh`}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          Chưa phân phối cho lớp nào
                        </span>
                      )}

                      {assignedStudent && (
                        <span className="text-xs text-slate-600">
                          • Thí sinh làm mã này: <strong className="text-slate-900">{assignedStudent.name}</strong> ({assignedStudent.className})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenAssign && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenAssign();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>{exam.targetAssignment ? 'Đổi Lớp Giao Đề' : 'Giao Cho Lớp'}</span>
                      </button>
                    )}
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      {activeVariant.questions.length} câu hỏi
                    </span>
                  </div>
                </div>

                {/* Question List for this Variant */}
                <div className="space-y-4">
                  {activeVariant.questions.map((q, idx) => {
                    const partInfo = getQuestionPartInfo(q, idx);
                    const prevQ = idx > 0 ? activeVariant.questions[idx - 1] : null;
                    const prevPartInfo = prevQ ? getQuestionPartInfo(prevQ, idx - 1) : null;
                    const isFirstOfPart = idx === 0 || (prevPartInfo && prevPartInfo.partNumber !== partInfo.partNumber);

                    return (
                      <React.Fragment key={q.id}>
                        {isFirstOfPart && (
                          <div
                            className={`p-3.5 rounded-xl border font-bold text-xs flex items-center justify-between ${
                              partInfo.partNumber === 1
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                : partInfo.partNumber === 2
                                ? 'bg-sky-50 border-sky-200 text-sky-950'
                                : 'bg-amber-50 border-amber-200 text-amber-950'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold ${
                                  partInfo.partNumber === 1
                                    ? 'bg-emerald-700'
                                    : partInfo.partNumber === 2
                                    ? 'bg-sky-700'
                                    : 'bg-amber-700'
                                }`}
                              >
                                {partInfo.partRoman}
                              </span>
                              <span>{partInfo.partTitle}</span>
                            </div>
                            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                              {partInfo.partNumber === 1
                                ? 'Trắc nghiệm 4 lựa chọn'
                                : partInfo.partNumber === 2
                                ? 'Trắc nghiệm Đúng / Sai'
                                : 'Trả lời ngắn / Tự luận'}
                            </span>
                          </div>
                        )}

                        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h5
                              className={`font-bold text-slate-900 leading-relaxed ${
                                fontSizeLevel === 'xlarge'
                                  ? 'text-lg sm:text-xl'
                                  : fontSizeLevel === 'large'
                                  ? 'text-base sm:text-lg'
                                  : 'text-sm sm:text-base'
                              }`}
                            >
                              <span className="text-emerald-700 font-bold mr-1.5">Câu {idx + 1}:</span>
                              <MathText
                                content={q.content}
                                size={fontSizeLevel === 'xlarge' ? 'xl' : fontSizeLevel === 'large' ? 'lg' : 'md'}
                              />
                            </h5>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold shrink-0">
                              {q.points} điểm • {q.difficulty}
                            </span>
                          </div>

                          {/* Textbook diagram only if explicitly requested by question content or stimulus */}
                          {(q.stimulus?.type === 'table' || q.stimulus?.type === 'variation_table' || q.content.toLowerCase().includes('bảng biến thiên')) && (
                            <TextbookVariationTable
                              cValue={2 + (Number(selectedCode) % 5)}
                              data={{
                                xValues: ['-\\infty', '0', '2', '+\\infty'],
                                yPrimeValues: ['+', '0', '-', '0', '+'],
                                caption: q.stimulus?.caption || `Bảng biến thiên cho Mã đề ${selectedCode}`,
                              }}
                              fontSize={fontSizeLevel}
                            />
                          )}
                          {(q.stimulus?.type === 'diagram' || q.stimulus?.type === 'graph' || q.content.toLowerCase().includes('đồ thị')) && (
                            <TextbookGraph
                              cValue={2 + (Number(selectedCode) % 4)}
                              type={q.content.toLowerCase().includes('tiệm cận') ? 'rational' : q.content.toLowerCase().includes('lượng giác') || q.content.toLowerCase().includes('sin') ? 'trig' : 'cubic'}
                              title={q.stimulus?.caption || `Hình minh họa đồ thị hàm số - Mã đề ${selectedCode}`}
                            />
                          )}
                          {(q.stimulus?.type === 'sign_table' || q.content.toLowerCase().includes('bảng xét dấu')) && (
                            <TextbookSignTable
                              data={{
                                variable: 'x',
                                expression: "f'(x)",
                                roots: [{ value: '-\\infty' }, { value: '-1' }, { value: '2' }, { value: '+\\infty' }],
                                signs: ['+', '-', '+'],
                                caption: `Bảng xét dấu đạo hàm cho Mã đề ${selectedCode}`,
                              }}
                            />
                          )}
                          {(q.stimulus?.type === 'statistics' || q.content.toLowerCase().includes('mẫu số liệu ghép nhóm') || q.content.toLowerCase().includes('bảng phân bố tần số') || q.content.toLowerCase().includes('bảng thống kê')) && (
                            <TextbookStatisticsTable
                              title={`Bảng dữ liệu mẫu ghép nhóm cho Mã đề ${selectedCode}`}
                            />
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
                                    title={q.stimulus?.caption || `Hình vẽ hình học chuẩn SGK - Mã đề ${selectedCode}`}
                                  />
                                );
                              })()}
                            </div>
                          )}

                          {/* Options if MCQ (Phần I) */}
                          {q.type === 'multiple_choice' && q.options && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.correctAnswer === oIdx;
                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 overflow-x-auto ${
                                      isCorrect
                                        ? 'bg-emerald-50/90 border-emerald-500 font-bold text-emerald-950 ring-1 ring-emerald-500/30'
                                        : 'bg-slate-50/70 border-slate-200 text-slate-800'
                                    }`}
                                  >
                                    <span
                                      className={`whitespace-nowrap inline-block ${
                                        fontSizeLevel === 'xlarge'
                                          ? 'text-base sm:text-lg'
                                          : fontSizeLevel === 'large'
                                          ? 'text-sm sm:text-base font-medium'
                                          : 'text-xs sm:text-sm'
                                      }`}
                                    >
                                      <MathText
                                        content={opt}
                                        size={fontSizeLevel === 'xlarge' ? 'lg' : fontSizeLevel === 'large' ? 'md' : 'sm'}
                                      />
                                    </span>
                                    {isCorrect && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold shrink-0 ml-1.5 shadow-2xs whitespace-nowrap">
                                        ĐÁP ÁN ĐÚNG
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Options if True / False (Phần II) */}
                          {q.type === 'true_false' && (
                            <div className="space-y-2 pt-1 border border-sky-100 rounded-xl p-3 bg-sky-50/30">
                              <div className="font-bold text-sky-950 text-xs sm:text-sm mb-1">
                                Barem đáp án Đúng / Sai từng khẳng định:
                              </div>
                              <div className="divide-y divide-slate-100">
                                {(q.trueFalseItems || [
                                  { id: 'a', label: 'a)', content: 'Khẳng định a', correctAnswer: true },
                                  { id: 'b', label: 'b)', content: 'Khẳng định b', correctAnswer: false },
                                  { id: 'c', label: 'c)', content: 'Khẳng định c', correctAnswer: true },
                                  { id: 'd', label: 'd)', content: 'Khẳng định d', correctAnswer: false },
                                ]).map((item) => (
                                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                                    <div className="flex items-start gap-2.5 flex-1">
                                      <span className="font-bold text-sky-800 bg-sky-100/60 px-2 py-0.5 rounded text-xs">
                                        {item.label || `${item.id})`}
                                      </span>
                                      <span
                                        className={
                                          fontSizeLevel === 'xlarge'
                                            ? 'text-base sm:text-lg'
                                            : fontSizeLevel === 'large'
                                            ? 'text-sm sm:text-base'
                                            : 'text-xs sm:text-sm'
                                        }
                                      >
                                        <MathText
                                          content={item.content}
                                          size={fontSizeLevel === 'xlarge' ? 'lg' : fontSizeLevel === 'large' ? 'md' : 'sm'}
                                        />
                                      </span>
                                    </div>
                                    <span
                                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold shrink-0 ${
                                        item.correctAnswer
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                                      }`}
                                    >
                                      {item.correctAnswer ? 'ĐÚNG' : 'SAI'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Short Answer Key (Phần III) */}
                          {q.type === 'short_answer' && (
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-950 text-sm border border-emerald-200">
                              <strong>Đáp số chuẩn: </strong>
                              <MathText
                                content={q.correctAnswerText || ''}
                                size={fontSizeLevel === 'xlarge' ? 'lg' : 'md'}
                              />
                            </div>
                          )}

                          {/* Essay Rubric (Phần III) */}
                          {q.type === 'essay' && (
                            <div className="p-3.5 bg-amber-50/80 rounded-xl text-amber-950 text-xs sm:text-sm border border-amber-200 space-y-1.5">
                              <div className="font-bold flex items-center gap-1.5 text-amber-900 text-xs sm:text-sm">
                                <Sparkles className="w-4 h-4" />
                                Barem chấm tự luận (Dành cho AI & Giáo viên):
                              </div>
                              <div className="font-sans whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                                <MathText
                                  content={q.rubric || ''}
                                  size={fontSizeLevel === 'xlarge' ? 'md' : 'sm'}
                                />
                              </div>
                            </div>
                          )}

                          {q.explanation && (
                            <div className="text-slate-700 text-xs sm:text-sm bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                              <strong className="text-slate-900">Lời giải chi tiết: </strong>
                              <MathText
                                content={q.explanation}
                                size={fontSizeLevel === 'xlarge' ? 'md' : 'sm'}
                              />
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Không tìm thấy dữ liệu mã đề này.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
