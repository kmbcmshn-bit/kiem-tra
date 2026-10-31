import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Users, CheckCircle2, AlertCircle, RefreshCw, X, Layers, Cpu, School, Send } from 'lucide-react';

interface VariantGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: () => void;
  onOpenAssign?: () => void;
  onOpenCreateExam?: () => void;
}

export const VariantGeneratorModal: React.FC<VariantGeneratorModalProps> = ({
  isOpen,
  onClose,
  onOpenPreview,
  onOpenAssign,
  onOpenCreateExam,
}) => {
  const { exam, generateClassVariants, students, classes } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const classStudents = selectedClassId
    ? students.filter(s => s.classId === selectedClassId)
    : students;

  const defaultSize = classStudents.length > 0 ? classStudents.length : 4;
  const [variantCount, setVariantCount] = useState<number>(defaultSize);
  const [generationStrategy, setGenerationStrategy] = useState<'class_size' | 'custom'>(
    classStudents.length > 0 ? 'class_size' : 'custom'
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartGeneration = async () => {
    const finalCount = generationStrategy === 'class_size' && classStudents.length > 0
      ? classStudents.length
      : variantCount;

    setIsGenerating(true);
    setProgress(10);
    setStatusMessage('Đang phân tích khung ma trận kiến thức đề gốc...');

    const batchInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) {
          clearInterval(batchInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 400);

    setTimeout(() => {
      setStatusMessage('AI đang hoán đổi số liệu, dữ kiện hàm số & tạo nghiệm đẹp...');
    }, 1000);

    setTimeout(() => {
      setStatusMessage('Đang bảo toàn độ khó & tự động tính lại đáp án, barem từng mã...');
    }, 1800);

    setErrorMessage(null);
    try {
      const res = await generateClassVariants(finalCount, selectedClassId || undefined);
      clearInterval(batchInterval);
      setProgress(100);
      setIsGenerating(false);
      if (res.success) {
        setSuccessInfo(res.message);
      } else {
        setErrorMessage(res.message || 'Có lỗi xảy ra khi tạo bộ mã đề.');
      }
    } catch (err: any) {
      clearInterval(batchInterval);
      setIsGenerating(false);
      setErrorMessage('Có lỗi xảy ra khi tạo bộ mã đề.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Tổ Chức Kiểm Tra & Sinh Đa Mã Đề Tương Tự
              </h3>
              <p className="text-xs text-slate-500">
                Sửa số liệu, dữ kiện câu hỏi • Đảm bảo tương đồng 100% về độ khó
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

        {/* Configuration Body */}
        {!exam ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h4 className="font-bold text-slate-900 text-base">Chưa Có Đề Thi Gốc Trong Hệ Thống</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Để tổ chức kiểm tra và sinh các mã đề tương đương cho học sinh, Thầy/Cô cần tạo 1 đề thi gốc trước bằng AI (theo yêu cầu, tải lên file ma trận hoặc tái tạo).
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateExam?.();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Tạo Đề Thi Gốc Ngay</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : !successInfo ? (
          <div className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {/* Isomorphic Principles Info Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Nguyên tắc tạo các mã đề tương đương (Isomorphic Exam):</span>
              </div>
              <p>
                1. <strong>Bảo toàn tuyệt đối độ khó:</strong> Cùng dạng toán, cùng cấp độ nhận thức (NB, TH, VD, VDC) ở từng vị trí câu hỏi.
              </p>
              <p>
                2. <strong>Biến thiên số liệu:</strong> Tự động sửa hệ số hàm số, tọa độ điểm Oxyz, số đo hình học với nghiệm nguyên đẹp chuẩn SGK.
              </p>
              <p>
                3. <strong>Tự động tính lại đáp án:</strong> Đảo vị trí phương án đúng A, B, C, D giữa các mã đề để triệt tiêu gian lận nhìn bài.
              </p>
            </div>

            {/* Step 1: Select Target Class */}
            {classes.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-emerald-600" />
                    <span>Chọn lớp học làm bài kiểm tra:</span>
                  </span>
                  <span className="text-emerald-700 font-semibold font-mono">
                    Sĩ số: {classStudents.length} học sinh
                  </span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    const count = students.filter(s => s.classId === e.target.value).length;
                    if (count > 0) setVariantCount(count);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Tất cả học sinh ({students.length} em)</option>
                  {classes.map(c => {
                    const cnt = students.filter(s => s.classId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.grade} • Sĩ số: {cnt} học sinh)
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Step 2: Choose Number of Variants */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-800 block">
                Tùy chọn số lượng mã đề thi tương đương muốn sinh:
              </label>

              {classStudents.length > 0 && (
                <div
                  onClick={() => {
                    setGenerationStrategy('class_size');
                    setVariantCount(classStudents.length);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    generationStrategy === 'class_size'
                      ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400/50'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs flex items-center gap-2">
                      <input
                        type="radio"
                        checked={generationStrategy === 'class_size'}
                        onChange={() => setGenerationStrategy('class_size')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tạo số mã đề bằng đúng sĩ số lớp ({classStudents.length} mã đề)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 ml-5">
                      Mỗi học sinh trong lớp nhận 1 mã đề riêng biệt (từ Mã 101 đến Mã {100 + classStudents.length}).
                    </p>
                  </div>
                  <span className="font-bold font-mono text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {classStudents.length} mã
                  </span>
                </div>
              )}

              <div
                onClick={() => setGenerationStrategy('custom')}
                className={`p-3 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  generationStrategy === 'custom'
                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400/50'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <input
                      type="radio"
                      checked={generationStrategy === 'custom'}
                      onChange={() => setGenerationStrategy('custom')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Chọn số lượng mã đề cố định (phân phối đều cho cả lớp)</span>
                  </div>
                  <span className="font-bold font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {variantCount} mã đề
                  </span>
                </div>

                {generationStrategy === 'custom' && (
                  <div className="pl-5 space-y-2 pt-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={variantCount}
                        onChange={(e) => setVariantCount(Math.max(1, Math.min(60, Number(e.target.value) || 4)))}
                        disabled={isGenerating}
                        className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-xs focus:border-emerald-500 bg-white font-mono"
                      />
                      <span className="text-xs text-slate-600">
                        mã đề (hệ thống sẽ chia đều luân phiên cho học sinh)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400">Chọn nhanh:</span>
                      {[2, 4, 8, 12, 24, 40].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVariantCount(preset);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            variantCount === preset
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {preset} mã
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar (if generating) */}
            {isGenerating && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    {statusMessage}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleStartGeneration}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Khởi Chạy Sinh {generationStrategy === 'class_size' ? classStudents.length : variantCount} Mã Đề</span>
              </button>
            </div>
          </div>
        ) : (
          /* Success Result View */
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-base">
                Hoàn Tất Tạo Bộ Mã Đề Tương Tự!
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {successInfo}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono">
              Tổng số mã đề hiện có: <strong className="text-emerald-700">{exam ? Object.keys(exam.variants).length : 0}</strong> mã • Đã phân phối cho học sinh
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onOpenAssign && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAssign();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-100" />
                  <span>Giao Đề Cho Lớp / Nhóm Ngay</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPreview();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 shadow-2xs transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Xem Trước Danh Sách Mã Đề</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
