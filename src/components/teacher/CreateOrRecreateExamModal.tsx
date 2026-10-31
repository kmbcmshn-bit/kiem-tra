import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { extractTextFromFile, analyzeMatrixStructure, ParsedMatrixResult } from '../../utils/matrixParser';
import {
  X,
  Sparkles,
  Upload,
  FileText,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  Sliders,
  HelpCircle,
  Clock,
  BookOpen,
  FileUp,
  AlertCircle,
  School,
  Send
} from 'lucide-react';

interface CreateOrRecreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreview: () => void;
  onOpenAssign?: () => void;
  initialTab?: 'prompt' | 'matrix_file' | 'recreate';
}

export const CreateOrRecreateExamModal: React.FC<CreateOrRecreateExamModalProps> = ({
  isOpen,
  onClose,
  onOpenPreview,
  onOpenAssign,
  initialTab = 'prompt',
}) => {
  const {
    exam,
    generateExamFromCustomPrompt,
    parseMatrixFromFile,
    recreateExistingExam,
    classes,
    students,
    updateExam,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'prompt' | 'matrix_file' | 'recreate'>(initialTab);
  const [targetClassId, setTargetClassId] = useState<string>(() => classes[0]?.id || '');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Tab 1: Custom Prompt state
  const [customPrompt, setCustomPrompt] = useState<string>(
    'Tạo đề kiểm tra 20 phút môn Toán 12 về Ứng dụng đạo hàm: gồm 3 câu trắc nghiệm (Cực trị, Tiệm cận đứng/ngang, Tính đơn điệu), 1 câu trả lời ngắn tìm GTLN, 1 câu tự luận bài toán thực tế tối ưu hóa diện tích/chi phí với số liệu và nghiệm đẹp.'
  );
  const [subject, setSubject] = useState<string>('Toán học 12');
  const [gradeColumn, setGradeColumn] = useState<string>('DTX1');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);

  // Tab 2: Upload Matrix File state
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    base64: string;
    previewUrl?: string;
    extractedText?: string;
    parsedStructure?: ParsedMatrixResult | null;
  } | null>(null);
  const [fileInstructions, setFileInstructions] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: Recreate Existing state
  const [recreateInstruction, setRecreateInstruction] = useState<string>(
    'Giữ nguyên 100% khung ma trận kiến thức, hoán đổi tham số hàm số bậc 3 và phân thức, đảm bảo nghiệm nguyên đẹp và các phương án gây nhiễu hợp lý.'
  );

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [successResult, setSuccessResult] = useState<string | null>(null);
  const [errorResult, setErrorResult] = useState<string | null>(null);

  if (!isOpen) return null;

  // File Upload Handler (Excel, Word, PDF, text)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage(`Đang đọc cấu trúc file "${file.name}"...`);

    try {
      const extracted = await extractTextFromFile(file);
      let parsedStructure: ParsedMatrixResult | null = null;
      if (extracted && extracted.trim().length > 0) {
        parsedStructure = analyzeMatrixStructure(extracted, file.name);
      }

      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        // Extract pure base64
        const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
        let resolvedMime = file.type;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!resolvedMime) {
          if (ext === 'pdf') resolvedMime = 'application/pdf';
          else if (ext === 'docx') resolvedMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          else if (ext === 'xlsx') resolvedMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          else if (ext === 'png') resolvedMime = 'image/png';
          else if (ext === 'jpg' || ext === 'jpeg') resolvedMime = 'image/jpeg';
          else resolvedMime = 'application/octet-stream';
        }

        setUploadedFile({
          name: file.name,
          size: file.size,
          type: resolvedMime,
          base64: base64Data,
          previewUrl: resolvedMime.startsWith('image/') ? resultStr : undefined,
          extractedText: extracted,
          parsedStructure,
        });

        if (parsedStructure?.matrixSummary) {
          setFileInstructions(parsedStructure.matrixSummary);
        }

        setIsLoading(false);
        setStatusMessage('');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('Lỗi đọc file ma trận:', err);
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Sample Matrix Preset
  const handleSelectSampleMatrix = (type: 'matrix_dtx1' | 'matrix_giuaky') => {
    if (type === 'matrix_dtx1') {
      const sampleText = `MA TRẬN ĐẶC TẢ ĐỀ KIỂM TRA MÔN TOÁN 12 - ĐTX1
Phần I: 3 câu trắc nghiệm nhiều phương án lựa chọn:
- Câu 1 (NB): Tính đơn điệu của hàm số bậc 3.
- Câu 2 (NB): Điểm cực trị của hàm số.
- Câu 3 (TH): Đường tiệm cận đứng và tiệm cận ngang của đồ thị hàm phân thức bậc nhất trên bậc nhất.
Phần II: 1 câu trả lời ngắn:
- Câu 4 (VD): Tìm giá trị lớn nhất và nhỏ nhất của hàm số trên một đoạn.
Phần III: 1 câu tự luận:
- Câu 5 (VDC): Ứng dụng đạo hàm giải quyết bài toán thực tế tối ưu hóa hình học/chi phí sản xuất.`;
      const struct = analyzeMatrixStructure(sampleText, 'Ma_tran_dac_ta_Toan_12_DTX1.docx');
      setUploadedFile({
        name: 'Ma_tran_dac_ta_Toan_12_DTX1.docx',
        size: 24500,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        base64: 'UEsDBBQABgAIAAAAIQDfp...',
        extractedText: sampleText,
        parsedStructure: struct,
      });
      setFileInstructions(struct.matrixSummary);
    } else {
      const sampleText = `MA TRẬN ĐẶC TẢ ĐỀ THI GIỮA KỲ 1 TOÁN 12:
Phần I: 3 câu trắc nghiệm:
- Câu 1: Khảo sát sự biến thiên hàm số (Nhận biết)
- Câu 2: Đường tiệm cận của đồ thị hàm số (Thông hiểu)
- Câu 3: Vectơ trong không gian (Thông hiểu)
Phần II: 1 câu trả lời ngắn:
- Câu 4: Bài toán tọa độ vectơ trong không gian Oxyz (Vận dụng)
Phần III: 1 câu tự luận:
- Câu 5: Mô hình toán học thực tế tối ưu thể tích khối hộp/hình trụ (Vận dụng cao)`;
      const struct = analyzeMatrixStructure(sampleText, 'De_thi_va_ma_tran_Giuaky1_Toan12.pdf');
      setUploadedFile({
        name: 'De_thi_va_ma_tran_Giuaky1_Toan12.pdf',
        size: 58200,
        type: 'application/pdf',
        base64: 'JVBERi0xLjQKJeLjz9MK...',
        extractedText: sampleText,
        parsedStructure: struct,
      });
      setFileInstructions(struct.matrixSummary);
    }
  };

  // Action: Generate by Prompt
  const handleGeneratePrompt = async () => {
    setIsLoading(true);
    setStatusMessage('Gemini AI đang phân tích yêu cầu và biên soạn câu hỏi...');
    setSuccessResult(null);
    setErrorResult(null);

    try {
      const res = await generateExamFromCustomPrompt(customPrompt, {
        subject,
        gradeColumn,
        durationMinutes,
        totalPoints: 10.0,
        targetClassId,
      });

      setIsLoading(false);
      if (res && res.success) {
        setSuccessResult(res.message);
      } else {
        setErrorResult(res?.message || 'Có lỗi xảy ra khi tạo đề thi.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorResult(err?.message || 'Lỗi kết nối khi tạo đề thi.');
    }
  };

  // Action: Parse Matrix from File
  const handleParseFile = async () => {
    if (!uploadedFile) return;
    setStatusMessage('Đang phân tích tệp PDF & bóc tách ma trận chuẩn BGD...');
    setSuccessResult(null);
    setErrorResult(null);

    try {
      setIsAnalyzing(true);
      const res = await parseMatrixFromFile(
        uploadedFile.base64,
        uploadedFile.type,
        uploadedFile.name,
        uploadedFile.extractedText,
        uploadedFile.parsedStructure?.matrixSummary || fileInstructions,
        {
          targetClassId,
          subject,
          gradeColumn,
          durationMinutes,
          totalPoints: 10.0,
        }
      );

      if (res && res.success) {
        setSuccessResult(res.message);
        setTimeout(() => {
          onOpenPreview();
        }, 1200);
      } else {
        const errMsg = res?.message || 'Có lỗi xảy ra khi bóc tách ma trận.';
        setErrorResult(errMsg);
        alert('Lỗi xử lý file: ' + errMsg);
      }
    } catch (err: any) {
      console.error(err);
      alert('Lỗi xử lý file: ' + (err?.message || 'Lỗi kết nối khi bóc tách ma trận.'));
      setErrorResult(err?.message || 'Lỗi kết nối khi bóc tách ma trận.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Action: Recreate Existing Exam
  const handleRecreate = async () => {
    setIsLoading(true);
    setStatusMessage('Gemini AI đang phân tích đề gốc và tái tạo số liệu bài toán...');
    setSuccessResult(null);
    setErrorResult(null);

    try {
      const res = await recreateExistingExam(recreateInstruction, {
        targetClassId,
        subject,
        gradeColumn,
        durationMinutes,
        totalPoints: 10.0,
      });

      setIsLoading(false);
      if (res && res.success) {
        setSuccessResult(res.message);
      } else {
        setErrorResult(res?.message || 'Có lỗi xảy ra khi tái tạo đề thi.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorResult(err?.message || 'Lỗi kết nối khi tái tạo đề thi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] p-6 shadow-2xl border border-slate-200 flex flex-col relative overflow-hidden">
        {/* Visual Loading Overlay when Analyzing Multimodal File */}
        {isAnalyzing && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 text-white space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="text-center space-y-1.5 max-w-md">
              <h4 className="font-bold text-base text-emerald-300">
                Đang phân tích tệp PDF & bóc tách ma trận chuẩn BGD...
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hệ thống AI Multimodal đang trích xuất dữ liệu nhị phân, bóc tách cấu trúc ma trận chuẩn 3 phần GDPT 2018 và tự động biên soạn đề thi.
              </p>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Tạo Đề Mới & Tái Tạo Đề Thi Bằng AI
              </h3>
              <p className="text-xs text-slate-500">
                Tạo theo yêu cầu • Nhập từ ma trận File/Ảnh (.doc, .docx, PDF) • Tái tạo đề có sẵn
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

        {/* Success View */}
        {successResult ? (
          <div className="py-8 px-4 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5 max-w-lg mx-auto">
              <h4 className="text-lg font-bold text-slate-900">
                Thiết Lập Đề Thi Mới Thành Công!
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {successResult}
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium inline-block max-w-md">
              Đề thi gốc: <strong className="text-emerald-900">{exam?.title || 'Đề thi mới'}</strong>.
              <p className="text-[11px] text-slate-500 mt-1">
                Đề gốc đã được thiết lập thành công. Khi đến giờ kiểm tra, Thầy/Cô hãy chọn "Tổ chức kiểm tra / Sinh đa mã đề" để tùy ý chọn số lượng mã đề tương đương cho học sinh làm bài.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
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
                <span>Xem Trước Đề Gốc Vừa Tạo</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        ) : (
          /* Normal Tab Content */
          <>
            {/* 2-Step Process Explanatory Bar */}
            <div className="mt-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/70 rounded-xl border border-emerald-200 text-xs shrink-0 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black shrink-0">
                    1
                  </span>
                  <span>Bước 1: Tạo 1 Đề Thi Gốc Chuẩn Khung Ma Trận (chọn 1 trong 3 cách bên dưới)</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-7 leading-relaxed">
                  Đề gốc sẽ được khởi tạo với mã <strong className="font-mono text-emerald-800">101</strong>. Sau khi duyệt xong đề gốc, khi tổ chức kiểm tra Thầy/Cô chọn <strong className="text-emerald-800">"Tổ chức kiểm tra / Sinh đa mã đề"</strong> để tùy ý sinh 2, 4, 8 hoặc theo sĩ số lớp với các số liệu tương tự và độ khó tương đồng.
                </p>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('prompt')}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'prompt'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>1. Tạo Đề Theo Yêu Cầu</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('matrix_file')}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'matrix_file'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>2. Tải Lên Ma Trận (DOC, PDF, Ảnh)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('recreate')}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === 'recreate'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>3. Tái Tạo Đề Có Sẵn</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* TAB 1: GENERATE BY PROMPT */}
              {activeTab === 'prompt' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Môn học & Khối lớp:</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Cột điểm áp dụng:</label>
                      <select
                        value={gradeColumn}
                        onChange={(e) => setGradeColumn(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        <option value="DTX1">Kiểm tra thường xuyên ĐTX1</option>
                        <option value="DTX2">Kiểm tra thường xuyên ĐTX2</option>
                        <option value="GIUA_KY">Kiểm tra Giữa kỳ (Hệ số 2)</option>
                        <option value="CUOI_KY">Kiểm tra Cuối kỳ (Hệ số 3)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Thời gian làm bài:</label>
                      <select
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        <option value={15}>15 phút</option>
                        <option value={20}>20 phút</option>
                        <option value={45}>45 phút (1 tiết)</option>
                        <option value={90}>90 phút</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Giao cho Lớp học:</label>
                      <select
                        value={targetClassId}
                        onChange={(e) => setTargetClassId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-emerald-300 text-xs bg-emerald-50/50 font-bold text-emerald-900"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            Lớp {c.name} ({c.grade})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Mô tả chi tiết yêu cầu đề kiểm tra:</span>
                      <span className="text-slate-400 font-normal">Hỗ trợ phân bổ mức độ nhận thức (NB, TH, VD, VDC)</span>
                    </label>
                    <textarea
                      rows={5}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ví dụ: Tạo đề kiểm tra 20 phút về cực trị hàm số và đường tiệm cận, gồm 3 câu trắc nghiệm, 1 câu điền số, 1 câu tự luận..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Gợi ý mẫu đề nhanh:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCustomPrompt(
                            'Tạo đề kiểm tra 15 phút về Cực trị và Khảo sát sự biến thiên hàm số bậc 3, gồm 3 câu trắc nghiệm 4 lựa chọn, 1 câu trả lời ngắn, 1 câu tự luận tìm GTLN-GTNN.'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-medium"
                      >
                        + Đề 15p: Cực trị & Biến thiên hàm bậc 3
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomPrompt(
                            'Tạo đề kiểm tra 45 phút ĐTX2: Khảo sát hàm số, đường tiệm cận và 1 câu bài toán thực tế tối ưu hóa kích thước chi phí sản xuất (VDC).'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-medium"
                      >
                        + Đề 45p: Tiệm cận & Tối ưu hóa thực tế
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD MATRIX FILE */}
              {activeTab === 'matrix_file' && (
                <div className="space-y-4 text-xs">
                  {/* File Upload Drop Area */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.doc,.docx,.pdf,image/png,image/jpeg,image/webp,.txt,.csv"
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 hover:bg-emerald-50 text-center cursor-pointer transition-colors space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">
                        Nhấp để tải lên tệp ma trận đề (Excel .xlsx, Word .docx, PDF hoặc Ảnh)
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Hỗ trợ bảng tính Excel (.xlsx, .xls), văn bản Word (.docx), PDF và ảnh chụp ma trận
                      </span>
                    </div>
                  </div>

                  {/* Show Selected File Info & Parsed Structure */}
                  {uploadedFile && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 truncate">
                          {uploadedFile.previewUrl ? (
                            <img
                              src={uploadedFile.previewUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase">
                              {uploadedFile.name.split('.').pop() || 'FILE'}
                            </div>
                          )}
                          <div className="truncate">
                            <div className="font-bold text-slate-900 truncate">{uploadedFile.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {(uploadedFile.size / 1024).toFixed(1)} KB • Bám sát 100% ma trận
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
                        >
                          Xóa file
                        </button>
                      </div>

                      {/* Dynamic Structure Breakdown Card */}
                      {uploadedFile.parsedStructure && (
                        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Cấu Trúc Ma Trận Đã Bóc Tách (Tổng {uploadedFile.parsedStructure.totalQuestions} câu):
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                              Bỏ hoàn toàn đề mẫu tĩnh
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                            {uploadedFile.parsedStructure.sections.map((sec, sIdx) => (
                              <div key={sIdx} className="p-2 rounded-lg bg-white border border-emerald-200">
                                <div className="font-bold text-slate-800">{sec.sectionName}</div>
                                <div className="text-emerald-700 font-semibold mt-0.5">{sec.questionCount} câu hỏi</div>
                                <div className="text-slate-500 text-[10px] mt-0.5 truncate">
                                  {sec.topics.join(', ') || 'Theo phân bổ ma trận'}
                                </div>
                              </div>
                            ))}
                          </div>

                          {uploadedFile.parsedStructure.detectedTopics.length > 0 && (
                            <div className="text-[11px] text-slate-600 pt-1">
                              <strong>Chuyên đề phát hiện:</strong> {uploadedFile.parsedStructure.detectedTopics.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sample Matrix Shortcuts */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-800 text-xs block">
                      Hoặc chọn thử nghiệm nhanh Ma Trận Mẫu (GDPT 2018):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectSampleMatrix('matrix_dtx1')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 font-medium text-xs shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ma trận ĐTX1 (Word mẫu)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectSampleMatrix('matrix_giuaky')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 font-medium text-xs shadow-2xs"
                      >
                        <FileCode className="w-3.5 h-3.5 text-teal-600" />
                        <span>Ma trận Đề Giữa Kỳ 1 (PDF mẫu)</span>
                      </button>
                    </div>
                  </div>

                  {/* Extra Prompt Instruction */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Ghi chú thêm cho AI khi bóc tách ma trận (Tùy chọn):
                    </label>
                    <textarea
                      rows={2}
                      value={fileInstructions}
                      onChange={(e) => setFileInstructions(e.target.value)}
                      placeholder="Ví dụ: Giữ nguyên số câu hỏi, chú trọng các dạng toán bảng biến thiên..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: RECREATE EXISTING EXAM */}
              {activeTab === 'recreate' && (
                <div className="space-y-4 text-xs">
                  {exam ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-slate-500 text-[11px] font-semibold uppercase">Đề thi gốc đang áp dụng:</div>
                      <h4 className="font-bold text-slate-900 text-sm">{exam.title}</h4>
                      <div className="flex flex-wrap gap-3 text-slate-600 text-[11px]">
                        <span>Số lượng câu hỏi: <strong>{exam.questions.length} câu</strong></span>
                        <span>Môn học: <strong>{exam.subject}</strong></span>
                        <span>Cột điểm: <strong>{exam.gradeColumn}</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      Chưa có đề thi gốc trong hệ thống để tái tạo. Vui lòng chuyển sang <strong>Cách 1 (Prompt AI)</strong> hoặc <strong>Cách 2 (Tải lên Ma trận từ File)</strong> để tạo đề gốc trước.
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1 leading-relaxed">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Cơ chế Tái Tạo Đề Thi (Isomorphic Re-generation):</span>
                    </div>
                    <p>
                      AI sẽ giữ nguyên 100% khung ma trận kiến thức và tỷ lệ câu hỏi (Nhận biết, Thông hiểu, Vận dụng). Toàn bộ hệ số, nghiệm số và các phương án gây nhiễu sẽ được làm mới hoàn toàn.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Yêu cầu tái tạo chi tiết:
                    </label>
                    <textarea
                      rows={4}
                      value={recreateInstruction}
                      onChange={(e) => setRecreateInstruction(e.target.value)}
                      placeholder="Nhập yêu cầu tái tạo..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* Loading progress indicator */}
              {isLoading && (
                <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                  <span className="font-semibold">{statusMessage}</span>
                </div>
              )}

              {/* Error indicator */}
              {errorResult && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3 text-xs text-red-900 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Không thể tạo đề thi</div>
                    <p className="text-[11px] text-red-700">{errorResult}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
              <span className="text-[11px] text-slate-400">
                Tích hợp mô hình Gemini 3.8 Flash • Xử lý đa phương thức (Multimodal)
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>

                {activeTab === 'prompt' && (
                  <button
                    type="button"
                    onClick={handleGeneratePrompt}
                    disabled={isLoading || !customPrompt.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Tạo Đề Theo Yêu Cầu</span>
                  </button>
                )}

                {activeTab === 'matrix_file' && (
                  <button
                    type="button"
                    onClick={handleParseFile}
                    disabled={isLoading || isAnalyzing || !uploadedFile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang bóc tách ma trận...</span>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-4 h-4" />
                        <span>🤖 AI Bóc Tách Ma Trận File</span>
                      </>
                    )}
                  </button>
                )}

                {activeTab === 'recreate' && (
                  <button
                    type="button"
                    onClick={handleRecreate}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>AI Tái Tạo Đề Có Sẵn</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
