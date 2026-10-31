import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Maximize2,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Check,
  RotateCcw,
  Keyboard,
  ArrowLeft,
  ArrowRight,
  Delete,
  Eye,
  CornerDownLeft
} from 'lucide-react';
import { MathVirtualKeyboard } from '../math/MathVirtualKeyboard';
import { MathText } from '../math/MathText';

interface EssaySubmissionProps {
  questionId: string;
  textValue: string;
  imagesValue: string[];
  onTextChange: (val: string) => void;
  onImagesChange: (imgs: string[]) => void;
  onStartPhotoCapture?: () => void;
  onEndPhotoCapture?: () => void;
  disabled?: boolean;
}

/**
 * Client-side image compression using HTML Canvas
 * Resizes max dimension to 1600px and exports as JPEG quality 0.8 (< 800KB)
 */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1600;
        let { width, height } = img;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Lỗi tải ảnh'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc tệp tin'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress a data URL or canvas snapshot
 */
function compressCanvas(canvas: HTMLCanvasElement): string {
  const MAX_DIM = 1600;
  let { width, height } = canvas;

  if (width > height && width > MAX_DIM) {
    height = Math.round((height * MAX_DIM) / width);
    width = MAX_DIM;
  } else if (height > MAX_DIM) {
    width = Math.round((width * MAX_DIM) / height);
    height = MAX_DIM;
  }

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/jpeg', 0.82);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(canvas, 0, 0, width, height);

  return outCanvas.toDataURL('image/jpeg', 0.82);
}

export const EssaySubmission: React.FC<EssaySubmissionProps> = ({
  questionId,
  textValue,
  imagesValue = [],
  onTextChange,
  onImagesChange,
  onStartPhotoCapture,
  onEndPhotoCapture,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'text'>('camera');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; index: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Live Camera states
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

  // Quick helper to insert text at cursor in essay textarea
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onTextChange(textValue + textToInsert);
      return;
    }
    const start = textarea.selectionStart ?? textValue.length;
    const end = textarea.selectionEnd ?? textValue.length;
    const newVal = textValue.substring(0, start) + textToInsert + textValue.substring(end);
    onTextChange(newVal);
    setTimeout(() => {
      textarea.focus();
      const pos = start + textToInsert.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  // Helper for arrow keys
  const moveCursorLeft = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = Math.max(0, (textarea.selectionStart ?? 0) - 1);
    textarea.focus();
    textarea.setSelectionRange(pos, pos);
  };

  const moveCursorRight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = Math.min(textValue.length, (textarea.selectionStart ?? 0) + 1);
    textarea.focus();
    textarea.setSelectionRange(pos, pos);
  };

  const deleteAtCursor = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      if (textValue.length > 0) onTextChange(textValue.slice(0, -1));
      return;
    }
    const start = textarea.selectionStart ?? textValue.length;
    const end = textarea.selectionEnd ?? textValue.length;
    if (start !== end) {
      const newVal = textValue.substring(0, start) + textValue.substring(end);
      onTextChange(newVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start);
      }, 0);
    } else if (start > 0) {
      const newVal = textValue.substring(0, start - 1) + textValue.substring(start);
      onTextChange(newVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start - 1, start - 1);
      }, 0);
    }
  };

  // Stop camera stream safely
  const stopLiveCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Close live camera modal
  const handleCloseLiveCamera = () => {
    stopLiveCameraStream();
    setIsLiveCameraOpen(false);
    setCapturedSnapshot(null);
    setCameraError(null);
    onEndPhotoCapture?.();
  };

  // Start live camera stream
  const startCameraStream = async (targetFacing: 'environment' | 'user' = facingMode) => {
    onStartPhotoCapture?.();
    setCameraError(null);
    setCapturedSnapshot(null);

    // Stop existing stream first
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ mở camera trực tiếp.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Live camera error, fallback to file picker:', err);
      setCameraError(err.message || 'Không thể mở camera.');
      // Fallback: trigger file input
      setTimeout(() => {
        cameraInputRef.current?.click();
      }, 300);
    }
  };

  // Open live camera viewfinder modal
  const handleOpenLiveCamera = () => {
    if (disabled || isProcessing) return;
    onStartPhotoCapture?.();
    setIsLiveCameraOpen(true);
    startCameraStream(facingMode);
  };

  // Toggle front/back camera
  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCameraStream(nextFacing);
  };

  // Take photo from live video feed
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Trigger visual shutter flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 180);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const compressed = compressCanvas(canvas);
    setCapturedSnapshot(compressed);
  };

  // Retake photo
  const handleRetakeSnapshot = () => {
    setCapturedSnapshot(null);
  };

  // Confirm photo and save
  const handleConfirmSnapshot = (andTakeNext: boolean = false) => {
    if (!capturedSnapshot) return;
    const newImages = [...imagesValue, capturedSnapshot];
    onImagesChange(newImages);

    if (andTakeNext) {
      setCapturedSnapshot(null);
      // Keep camera stream open for next page
    } else {
      handleCloseLiveCamera();
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopLiveCameraStream();
    };
  }, []);

  // Sync video ref when stream changes
  useEffect(() => {
    if (isLiveCameraOpen && videoRef.current && cameraStream && !capturedSnapshot) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [isLiveCameraOpen, cameraStream, capturedSnapshot]);

  // Handle image files from file picker fallback
  const handleFiles = async (files: FileList | null) => {
    onStartPhotoCapture?.();
    if (!files || files.length === 0 || disabled) return;
    setIsProcessing(true);

    try {
      const compressedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file);
          compressedList.push(compressed);
        }
      }

      onImagesChange([...imagesValue, ...compressedList]);
    } catch (err) {
      console.error('Lỗi xử lý ảnh bài làm:', err);
    } finally {
      setIsProcessing(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
      onEndPhotoCapture?.();
    }
  };

  // Remove a specific page
  const handleRemoveImage = (indexToRemove: number) => {
    if (disabled) return;
    const updated = imagesValue.filter((_, idx) => idx !== indexToRemove);
    onImagesChange(updated);
  };

  return (
    <div className="space-y-3 pt-2">
      {/* Method Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nộp bài viết tay trên giấy ({imagesValue.length} trang)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Soạn thảo trực tiếp</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
          {imagesValue.length > 0
            ? `Đã chụp ${imagesValue.length} trang bài thi`
            : textValue
            ? 'Đã nhập văn bản'
            : 'Chưa có bài nộp'}
        </span>
      </div>

      {/* TAB 1: HANDWRITTEN PAPER PHOTO CAPTURE & GALLERY */}
      {activeTab === 'camera' && (
        <div className="space-y-3">
          {/* Action Upload & Camera Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* PRIMARY BUTTON: Direct Live Camera Trigger */}
            <button
              type="button"
              onClick={handleOpenLiveCamera}
              disabled={disabled || isProcessing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 active:scale-98 transition-all cursor-pointer ${
                disabled || isProcessing ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>📷 Bật Camera Chụp Bài Làm Trực Tiếp</span>
            </button>

            {/* Hidden Input 1: Fallback camera picker */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              disabled={disabled || isProcessing}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              id={`camera-input-${questionId}`}
            />

            {/* SECONDARY BUTTON: Choose from device/gallery */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={disabled || isProcessing}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              id={`file-input-${questionId}`}
            />
            <label
              htmlFor={`file-input-${questionId}`}
              onClick={() => onStartPhotoCapture?.()}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer ${
                disabled || isProcessing ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>📁 Chọn ảnh từ thiết bị</span>
            </label>

            {isProcessing && (
              <span className="text-xs text-emerald-700 animate-pulse font-medium">
                Đang nén và tối ưu hóa ảnh...
              </span>
            )}
          </div>

          {/* Reassurance banner: Anti-cheat exempted while taking photo */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="leading-relaxed">
              <strong>Bảo lưu quy chế:</strong> Khi bật camera hoặc chụp ảnh bài làm trên giấy, hệ thống <strong>tự động miễn trừ</strong> và <strong>không tính vi phạm thoát ứng dụng</strong> để các em yên tâm chụp ảnh bài làm.
            </p>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Mẹo: Đặt giấy nháp/bài thi phẳng trên bàn có đủ ánh sáng. Hệ thống tự động nén dưới 1MB và tối ưu độ nét cho chữ viết tay.
          </p>

          {/* Thumbnail Grid */}
          {imagesValue.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
              {imagesValue.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-slate-900 aspect-3/4 shadow-sm"
                >
                  <img
                    src={imgUrl}
                    alt={`Trang bài làm ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />

                  {/* Header Badge */}
                  <div className="absolute top-2 left-2 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Trang {idx + 1}
                  </div>

                  {/* Action Overlays */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLightboxImage({ url: imgUrl, index: idx })}
                      className="p-2 rounded-full bg-white/90 text-slate-900 hover:bg-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Xem phóng to ảnh"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2 rounded-full bg-red-600/90 text-white hover:bg-red-600 shadow-md transition-transform hover:scale-110 cursor-pointer"
                        title="Xóa trang này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={handleOpenLiveCamera}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-700">
                Chưa có ảnh bài làm nào được tải lên
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Bấm vào <strong className="text-emerald-700">📷 Bật Camera Chụp Bài Làm Trực Tiếp</strong> để mở máy ảnh chụp ngay trang bài thi viết tay hoặc chọn ảnh có sẵn từ thiết bị.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIRECT TEXT EDITOR WITH MATH VIRTUAL KEYBOARD */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          {/* Quick Math Toolbar */}
          <div className="bg-slate-900 text-white p-2.5 rounded-2xl border border-slate-700/80 shadow-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4" />
                  <span>Ký hiệu toán học nhanh:</span>
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Chèn trực tiếp tại vị trí con trỏ
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Navigation arrow keys */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={moveCursorLeft}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Di chuyển con trỏ sang trái"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Trái</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={moveCursorRight}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Di chuyển con trỏ sang phải"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Phải</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={deleteAtCursor}
                  className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-rose-800/40"
                  title="Xóa ký tự trước con trỏ"
                >
                  <Delete className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Xóa</span>
                </button>

                {/* Toggle Full Keyboard Button */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isKeyboardOpen
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                      : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{isKeyboardOpen ? 'Đóng bàn phím' : 'Mở bàn phím ảo đầy đủ'}</span>
                </button>
              </div>
            </div>

            {/* Quick Math Symbols Strip */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { label: 'π', val: 'π', highlight: true, title: 'Số Pi' },
                { label: 'e', val: 'e', highlight: true, title: 'Số Euler' },
                { label: 'x²', val: '²', title: 'Bình phương' },
                { label: 'x³', val: '³', title: 'Lập phương' },
                { label: 'xⁿ', val: '^', title: 'Số mũ' },
                { label: '√x', val: '√', title: 'Căn bậc hai' },
                { label: '∛', val: '∛', title: 'Căn bậc ba' },
                { label: '/', val: '/', title: 'Phân số / chia' },
                { label: '±', val: '±', title: 'Cộng trừ' },
                { label: '≤', val: '≤', title: 'Nhỏ hơn hoặc bằng' },
                { label: '≥', val: '≥', title: 'Lớn hơn hoặc bằng' },
                { label: '∞', val: '∞', title: 'Vô cực' },
                { label: "f'(x)", val: "f'(x)", title: 'Đạo hàm f(x)' },
                { label: "y'", val: "y'", title: 'Đạo hàm y' },
                { label: 'lim', val: 'lim ', title: 'Giới hạn' },
                { label: '∫', val: '∫', title: 'Tích phân' },
                { label: 'dx', val: 'dx', title: 'Vi phân dx' },
                { label: '(', val: '(', title: 'Mở ngoặc' },
                { label: ')', val: ')', title: 'Đóng ngoặc' },
                { label: '=', val: '=', title: 'Dấu bằng' },
                { label: '≠', val: '≠', title: 'Khác' },
                { label: '↵ Xuống dòng', val: '\n', title: 'Xuống dòng' },
              ].map((sym, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertTextAtCursor(sym.val)}
                  title={sym.title}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
                    sym.highlight
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-1 ring-emerald-400 font-serif'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  {sym.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={disabled}
            rows={6}
            placeholder="Nhập lời giải hoặc câu trả lời tự luận chi tiết tại đây (hỗ trợ các ký hiệu π, e, số mũ, căn bậc hai, đạo hàm, phân số...)..."
            className="w-full p-4 rounded-2xl border border-slate-300 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-sans leading-relaxed bg-white shadow-2xs"
          />

          {/* KaTeX Live Math Preview if text exists */}
          {textValue.trim() && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xem trước kết quả công thức tự luận (KaTeX):</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-900 text-sm overflow-x-auto">
                <MathText content={textValue} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Đã nhập: <strong className="text-slate-800">{textValue.length}</strong> ký tự</span>
            <span>Học sinh có thể kết hợp cả chữ viết tay chụp ảnh và văn bản soạn thảo</span>
          </div>

          {/* Full Virtual Math Keyboard when toggled open */}
          {isKeyboardOpen && (
            <MathVirtualKeyboard
              targetInput={textareaRef.current}
              currentValue={textValue}
              onChange={onTextChange}
              activeContextTitle="Câu tự luận (Bài làm chi tiết)"
              isOpen={isKeyboardOpen}
              onClose={() => setIsKeyboardOpen(false)}
              layoutMode="inline"
            />
          )}
        </div>
      )}

      {/* LIVE CAMERA VIEWFINDER MODAL */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-fadeIn">
          {/* Top Header */}
          <div className="w-full max-w-2xl flex items-center justify-between text-white pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Máy Ảnh Chụp Bài Làm Trực Tiếp</h3>
                <p className="text-[11px] text-emerald-300">
                  {capturedSnapshot ? 'Xem lại ảnh vừa chụp' : 'Căn chỉnh bài viết tay trong khung hình và bấm Chụp'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseLiveCamera}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Đóng camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Viewfinder / Preview */}
          <div className="relative w-full max-w-2xl flex-1 flex items-center justify-center my-3 overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-2xl">
            {/* White flash on shutter click */}
            {isShutterFlashing && (
              <div className="absolute inset-0 bg-white z-30 pointer-events-none animate-ping opacity-90" />
            )}

            {capturedSnapshot ? (
              /* Captured Photo Review */
              <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center bg-black">
                <img
                  src={capturedSnapshot}
                  alt="Ảnh bài làm vừa chụp"
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold backdrop-blur-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ảnh đã sẵn sàng
                </div>
              </div>
            ) : (
              /* Live Camera Stream */
              <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full max-h-[70vh] object-contain"
                />

                {/* Framing guides (4 green corners like scanner) */}
                <div className="absolute inset-6 sm:inset-10 pointer-events-none border border-emerald-500/30 rounded-xl">
                  {/* Top-left */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  {/* Top-right */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  {/* Bottom-left */}
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  {/* Bottom-right */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  <div className="absolute bottom-3 inset-x-0 text-center">
                    <span className="inline-block bg-black/60 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full border border-white/10 font-medium">
                      📐 Đặt bài làm ngay ngắn trong khung hình
                    </span>
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <p className="text-sm font-semibold">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Mở tệp ảnh từ máy
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Control Bar */}
          <div className="w-full max-w-2xl flex items-center justify-between text-white pt-2">
            {capturedSnapshot ? (
              /* Review Actions */
              <div className="w-full flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRetakeSnapshot}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chụp Lại</span>
                </button>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => handleConfirmSnapshot(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-xs transition-colors cursor-pointer"
                    title="Lưu trang này và chụp thêm trang tiếp theo"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Lưu & Chụp Thêm Trang Tiếp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmSnapshot(false)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Hoàn Tất & Nạp Bài</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Live Camera Capture Controls */
              <div className="w-full flex items-center justify-between">
                {/* Switch camera button */}
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                  title="Đổi camera trước / sau"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {facingMode === 'environment' ? 'Camera Sau' : 'Camera Trước'}
                  </span>
                </button>

                {/* Central Giant Shutter Button */}
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="relative group p-1.5 rounded-full bg-white hover:bg-emerald-400 transition-transform active:scale-95 shadow-xl cursor-pointer"
                  title="Bấm để chụp ảnh"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-slate-950 bg-emerald-600 flex items-center justify-center text-white shadow-inner">
                    <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                </button>

                {/* Fallback upload button */}
                <button
                  type="button"
                  onClick={() => {
                    handleCloseLiveCamera();
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                  title="Tải ảnh có sẵn"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Chọn Tệp Ảnh</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={lightboxImage.url}
              alt={`Xem trang ${lightboxImage.index + 1}`}
              className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl border border-white/20"
            />

            <div className="mt-3 text-white text-xs font-semibold flex items-center gap-2">
              <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                Trang {lightboxImage.index + 1} / {imagesValue.length}
              </span>
              <span>• Bài làm viết tay</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
