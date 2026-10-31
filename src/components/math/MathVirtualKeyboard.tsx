import React, { useState } from 'react';
import {
  Keyboard,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  ArrowRight,
  Delete,
  CornerDownLeft,
  RotateCcw,
  Sparkles,
  Calculator,
  Compass,
  Sigma,
  BookOpen,
  Eye,
  SlidersHorizontal,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { MathText } from './MathText';

export type MathKeyboardCategory = 'basic' | 'algebra' | 'calculus' | 'geometry';

export interface MathVirtualKeyboardProps {
  /** Target input or textarea element currently active */
  targetInput?: HTMLInputElement | HTMLTextAreaElement | null;
  /** Current value of the active field */
  currentValue?: string;
  /** Callback when value changes */
  onChange?: (newValue: string) => void;
  /** Title or context of what is currently being edited (e.g., 'Câu 13 (Trả lời ngắn)') */
  activeContextTitle?: string;
  /** Whether the keyboard is open */
  isOpen: boolean;
  /** Callback to toggle/close keyboard */
  onClose: () => void;
  /** Optional mode: docked at bottom or inline */
  layoutMode?: 'docked' | 'inline';
}

export const MathVirtualKeyboard: React.FC<MathVirtualKeyboardProps> = ({
  targetInput,
  currentValue = '',
  onChange,
  activeContextTitle,
  isOpen,
  onClose,
  layoutMode = 'docked',
}) => {
  const [activeCategory, setActiveCategory] = useState<MathKeyboardCategory>('basic');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  if (!isOpen) return null;

  // Helper to insert text at current cursor position in target input/textarea
  const insertText = (textToInsert: string) => {
    if (!targetInput) {
      // Fallback: append to currentValue if no DOM ref
      const updated = currentValue + textToInsert;
      onChange?.(updated);
      return;
    }

    // Save history for undo
    setHistoryStack((prev) => [...prev.slice(-10), targetInput.value]);

    const start = targetInput.selectionStart ?? targetInput.value.length;
    const end = targetInput.selectionEnd ?? targetInput.value.length;
    const val = targetInput.value;

    const newVal = val.substring(0, start) + textToInsert + val.substring(end);
    onChange?.(newVal);

    // Maintain focus and restore cursor position right after inserted text
    setTimeout(() => {
      targetInput.focus();
      const newPos = start + textToInsert.length;
      targetInput.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Helper for Navigation: Cursor Left
  const handleMoveCursorLeft = () => {
    if (!targetInput) return;
    const start = targetInput.selectionStart ?? 0;
    const newPos = Math.max(0, start - 1);
    targetInput.focus();
    targetInput.setSelectionRange(newPos, newPos);
  };

  // Helper for Navigation: Cursor Right
  const handleMoveCursorRight = () => {
    if (!targetInput) return;
    const start = targetInput.selectionStart ?? 0;
    const newPos = Math.min(targetInput.value.length, start + 1);
    targetInput.focus();
    targetInput.setSelectionRange(newPos, newPos);
  };

  // Helper for Navigation: Move to Beginning (Home)
  const handleMoveToStart = () => {
    if (!targetInput) return;
    targetInput.focus();
    targetInput.setSelectionRange(0, 0);
  };

  // Helper for Navigation: Move to End (End)
  const handleMoveToEnd = () => {
    if (!targetInput) return;
    const len = targetInput.value.length;
    targetInput.focus();
    targetInput.setSelectionRange(len, len);
  };

  // Helper for Backspace
  const handleBackspace = () => {
    if (!targetInput) {
      if (currentValue.length > 0) {
        onChange?.(currentValue.slice(0, -1));
      }
      return;
    }

    setHistoryStack((prev) => [...prev.slice(-10), targetInput.value]);

    const start = targetInput.selectionStart ?? targetInput.value.length;
    const end = targetInput.selectionEnd ?? targetInput.value.length;
    const val = targetInput.value;

    if (start !== end) {
      // Delete selection
      const newVal = val.substring(0, start) + val.substring(end);
      onChange?.(newVal);
      setTimeout(() => {
        targetInput.focus();
        targetInput.setSelectionRange(start, start);
      }, 0);
    } else if (start > 0) {
      // Check if deleting a symbol or command before cursor
      const newVal = val.substring(0, start - 1) + val.substring(start);
      onChange?.(newVal);
      setTimeout(() => {
        targetInput.focus();
        targetInput.setSelectionRange(start - 1, start - 1);
      }, 0);
    }
  };

  // Helper for Clear All
  const handleClearAll = () => {
    if (targetInput) {
      setHistoryStack((prev) => [...prev.slice(-10), targetInput.value]);
    }
    onChange?.('');
    if (targetInput) {
      targetInput.focus();
      targetInput.setSelectionRange(0, 0);
    }
  };

  // Helper for Undo
  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const prevVal = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    onChange?.(prevVal);
  };

  // Prevent button click from taking away focus from targetInput
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Key Definition Lists
  // 1. Basic Quick Bar (always shown on top of the keyboard)
  const quickKeys = [
    { label: 'π', insert: 'π', tooltip: 'Số Pi (3.14159...)', highlight: true },
    { label: 'e', insert: 'e', tooltip: 'Số Euler e (2.71828...)', highlight: true },
    { label: 'x²', insert: '²', tooltip: 'Bình phương' },
    { label: 'x³', insert: '³', tooltip: 'Lập phương' },
    { label: 'xⁿ', insert: '^', tooltip: 'Số mũ lũy thừa' },
    { label: '√', insert: '√', tooltip: 'Căn bậc hai' },
    { label: '/', insert: '/', tooltip: 'Dấu phân số / chia' },
    { label: '±', insert: '±', tooltip: 'Cộng trừ' },
    { label: '(', insert: '(', tooltip: 'Mở ngoặc' },
    { label: ')', insert: ')', tooltip: 'Đóng ngoặc' },
    { label: '=', insert: '=', tooltip: 'Dấu bằng' },
    { label: '≠', insert: '≠', tooltip: 'Khác' },
    { label: '≤', insert: '≤', tooltip: 'Nhỏ hơn hoặc bằng' },
    { label: '≥', insert: '≥', tooltip: 'Lớn hơn hoặc bằng' },
    { label: '∞', insert: '∞', tooltip: 'Vô cực' },
  ];

  // 2. Numerical & Basic Operators
  const numberPad = [
    ['7', '8', '9', '+', 'π'],
    ['4', '5', '6', '-', 'e'],
    ['1', '2', '3', '×', '√'],
    ['0', '.', ',', '÷', '='],
  ];

  // 3. Algebra & Variables
  const algebraKeys = [
    { label: 'x', insert: 'x' },
    { label: 'y', insert: 'y' },
    { label: 'z', insert: 'z' },
    { label: 't', insert: 't' },
    { label: 'n', insert: 'n' },
    { label: 'k', insert: 'k' },
    { label: 'x₁', insert: 'x₁' },
    { label: 'x₂', insert: 'x₂' },
    { label: 'x₀', insert: 'x₀' },
    { label: 'y₀', insert: 'y₀' },
    { label: 'f(x)', insert: 'f(x)' },
    { label: "f'(x)", insert: "f'(x)" },
    { label: "y'", insert: "y'" },
    { label: '|x|', insert: '|x|' },
    { label: 'eˣ', insert: 'e^' },
    { label: 'ln', insert: 'ln(' },
    { label: 'log', insert: 'log(' },
    { label: 'log₂', insert: 'log₂(' },
    { label: 'sin', insert: 'sin(' },
    { label: 'cos', insert: 'cos(' },
    { label: 'tan', insert: 'tan(' },
    { label: 'cot', insert: 'cot(' },
    { label: '∛', insert: '∛' },
    { label: '⁻¹', insert: '⁻¹' },
  ];

  // 4. Calculus & Sets
  const calculusKeys = [
    { label: 'lim', insert: 'lim ' },
    { label: 'x→0', insert: 'x→0' },
    { label: 'x→∞', insert: 'x→+∞' },
    { label: '∫', insert: '∫' },
    { label: 'dx', insert: 'dx' },
    { label: 'dt', insert: 'dt' },
    { label: '∑', insert: '∑' },
    { label: '∆', insert: '∆' },
    { label: '∈', insert: '∈' },
    { label: '∉', insert: '∉' },
    { label: '⊂', insert: '⊂' },
    { label: '∪', insert: '∪' },
    { label: '∩', insert: '∩' },
    { label: '∅', insert: '∅' },
    { label: '∀', insert: '∀' },
    { label: '∃', insert: '∃' },
    { label: '⇒', insert: '⇒' },
    { label: '⇔', insert: '⇔' },
    { label: 'ℝ', insert: 'ℝ' },
    { label: 'ℤ', insert: 'ℤ' },
    { label: 'ℕ', insert: 'ℕ' },
    { label: 'ℚ', insert: 'ℚ' },
    { label: '[-∞; +∞]', insert: '(-∞; +∞)' },
    { label: 'D = ℝ', insert: 'D = ℝ' },
  ];

  // 5. Geometry & Angles
  const geometryKeys = [
    { label: '° (Độ)', insert: '°' },
    { label: '∠ (Góc)', insert: '∠' },
    { label: '⊥ (Vuông)', insert: '⊥' },
    { label: '∥ (Song song)', insert: '∥' },
    { label: '→ (Vectơ)', insert: '→' },
    { label: 'vec{u}', insert: 'vec(u)' },
    { label: 'vec{v}', insert: 'vec(v)' },
    { label: 'AB', insert: 'AB' },
    { label: 'π/6 (30°)', insert: 'π/6' },
    { label: 'π/4 (45°)', insert: 'π/4' },
    { label: 'π/3 (60°)', insert: 'π/3' },
    { label: 'π/2 (90°)', insert: 'π/2' },
    { label: 'π (180°)', insert: 'π' },
    { label: '2π (360°)', insert: '2π' },
    { label: 'k2π', insert: 'k2π' },
    { label: 'kπ', insert: 'kπ' },
    { label: '(x; y; z)', insert: '(x; y; z)' },
    { label: 'O(0;0;0)', insert: '(0; 0; 0)' },
  ];

  return (
    <div
      className={`transition-all duration-200 z-50 ${
        layoutMode === 'docked'
          ? 'fixed bottom-0 left-0 right-0 max-w-4xl mx-auto px-2 sm:px-4 pb-2 sm:pb-3'
          : 'w-full my-3'
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl sm:rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden ring-1 ring-emerald-500/20">
        {/* HEADER BAR */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>Bàn Phím Ký Hiệu Toán Học</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  π, e, căn, số mũ, điều hướng
                </span>
              </span>
              {activeContextTitle && (
                <p className="text-[11px] text-emerald-400 font-medium truncate">
                  Đang nhập cho: <strong className="text-white">{activeContextTitle}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Undo Button */}
            {historyStack.length > 0 && (
              <button
                type="button"
                onMouseDown={handleButtonMouseDown}
                onClick={handleUndo}
                className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Hoàn tác thao tác vừa nhập"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hoàn tác</span>
              </button>
            )}

            {/* Toggle Minimized */}
            <button
              type="button"
              onMouseDown={handleButtonMouseDown}
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title={isMinimized ? 'Mở rộng bàn phím' : 'Thu nhỏ bàn phím'}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onMouseDown={handleButtonMouseDown}
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Đóng bàn phím ảo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LIVE MATH PREVIEW BAR */}
        {currentValue && (
          <div className="px-3 sm:px-4 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium text-[11px]">Xem trước công thức:</span>
            </div>
            <div className="flex-1 overflow-x-auto text-emerald-300 font-mono text-center py-0.5 max-h-12 flex items-center justify-center">
              <MathText content={currentValue} inline size="md" />
            </div>
            <div className="text-[10px] text-slate-400 shrink-0 font-mono">
              {currentValue.length} ký tự
            </div>
          </div>
        )}

        {/* CONTENT (HIDDEN IF MINIMIZED) */}
        {!isMinimized && (
          <div className="p-2 sm:p-3 space-y-2 sm:space-y-2.5">
            {/* QUICK SYMBOLS STRIP (Always visible) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
              {quickKeys.map((k, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={handleButtonMouseDown}
                  onClick={() => insertText(k.insert)}
                  title={k.tooltip}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                    k.highlight
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 ring-1 ring-emerald-400/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>

            {/* CATEGORY SWITCHER TABS */}
            <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onMouseDown={handleButtonMouseDown}
                  onClick={() => setActiveCategory('basic')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === 'basic'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Số & Phép tính</span>
                </button>

                <button
                  type="button"
                  onMouseDown={handleButtonMouseDown}
                  onClick={() => setActiveCategory('algebra')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === 'algebra'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Đại số & Hàm số</span>
                </button>

                <button
                  type="button"
                  onMouseDown={handleButtonMouseDown}
                  onClick={() => setActiveCategory('calculus')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === 'calculus'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sigma className="w-3.5 h-3.5" />
                  <span>Giải tích & Tập hợp</span>
                </button>

                <button
                  type="button"
                  onMouseDown={handleButtonMouseDown}
                  onClick={() => setActiveCategory('geometry')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCategory === 'geometry'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Hình học & Góc</span>
                </button>
              </div>

              {/* Clear button */}
              <button
                type="button"
                onMouseDown={handleButtonMouseDown}
                onClick={handleClearAll}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
              >
                Xóa tất cả
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* CATEGORY: BASIC NUMBER PAD */}
              {activeCategory === 'basic' && (
                <div className="sm:col-span-8 grid grid-cols-5 gap-1 sm:gap-1.5">
                  {numberPad.flat().map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={handleButtonMouseDown}
                      onClick={() => insertText(btn === '×' ? '*' : btn === '÷' ? '/' : btn)}
                      className={`h-9 sm:h-10 rounded-xl text-sm sm:text-base font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs ${
                        btn === 'π' || btn === 'e'
                          ? 'bg-emerald-600/40 text-emerald-200 hover:bg-emerald-600/60 border border-emerald-500/40 font-serif'
                          : ['+', '-', '×', '÷', '='].includes(btn)
                          ? 'bg-teal-900/40 text-teal-300 hover:bg-teal-900/60 border border-teal-700/50'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/70 font-mono'
                      }`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY: ALGEBRA */}
              {activeCategory === 'algebra' && (
                <div className="sm:col-span-8 grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-1.5">
                  {algebraKeys.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={handleButtonMouseDown}
                      onClick={() => insertText(item.insert)}
                      className="h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY: CALCULUS */}
              {activeCategory === 'calculus' && (
                <div className="sm:col-span-8 grid grid-cols-4 sm:grid-cols-6 gap-1 sm:gap-1.5">
                  {calculusKeys.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={handleButtonMouseDown}
                      onClick={() => insertText(item.insert)}
                      className="h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* CATEGORY: GEOMETRY */}
              {activeCategory === 'geometry' && (
                <div className="sm:col-span-8 grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5">
                  {geometryKeys.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={handleButtonMouseDown}
                      onClick={() => insertText(item.insert)}
                      className="h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {/* NAVIGATION & ACTION PANEL (Takes 4 cols on right for quick controls) */}
              <div className="sm:col-span-4 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80 flex flex-col justify-between gap-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
                  <span>Điều hướng con trỏ</span>
                  <span className="text-[9px] text-emerald-400">Trái/Phải</span>
                </div>

                {/* ARROW KEYS ROW */}
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onMouseDown={handleButtonMouseDown}
                    onClick={handleMoveToStart}
                    className="h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors"
                    title="Về đầu dòng (Home)"
                  >
                    Đầu
                  </button>

                  <button
                    type="button"
                    onMouseDown={handleButtonMouseDown}
                    onClick={handleMoveCursorLeft}
                    className="h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-400 font-bold flex items-center justify-center cursor-pointer transition-colors"
                    title="Sang trái (Cursor Left)"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onMouseDown={handleButtonMouseDown}
                    onClick={handleMoveCursorRight}
                    className="h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-400 font-bold flex items-center justify-center cursor-pointer transition-colors"
                    title="Sang phải (Cursor Right)"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onMouseDown={handleButtonMouseDown}
                    onClick={handleMoveToEnd}
                    className="h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors"
                    title="Về cuối dòng (End)"
                  >
                    Cuối
                  </button>
                </div>

                {/* EDITING ACTION ROW */}
                <div className="grid grid-cols-3 gap-1">
                  {/* Space */}
                  <button
                    type="button"
                    onMouseDown={handleButtonMouseDown}
                    onClick={() => insertText(' ')}
                    className="h-9 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                    title="Dấu cách (Space)"
                  >
                    Dấu cách
                  </button>

                  {/* Backspace */}
                  <button
                    type="button"
                    onMouseDown={handleButtonMouseDown}
                    onClick={handleBackspace}
                    className="h-9 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-rose-700/50"
                    title="Xóa lùi (Backspace)"
                  >
                    <Delete className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>

                  {/* Enter / Newline (Essential for multi-line essays) */}
                  <button
                    type="button"
                    onMouseDown={handleButtonMouseDown}
                    onClick={() => insertText('\n')}
                    className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Xuống dòng mới (Enter)"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    <span>↵</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
