import React, { useState } from 'react';
import { MathText } from './MathText';

export interface SignTableData {
  variable?: string;
  expression?: string;
  roots?: { value: string; isUndefined?: boolean }[];
  signs?: string[]; // e.g. ['+', '-', '+']
  caption?: string;
}

export const TextbookSignTable: React.FC<{
  data?: SignTableData;
  cValue?: number;
}> = ({ data, cValue = 0 }) => {
  const [preset, setPreset] = useState<'quadratic' | 'rational' | 'linear'>('quadratic');

  const variable = data?.variable || 'x';
  const expression = data?.expression || (preset === 'rational' ? "y' = \\frac{3}{(x+1)^2}" : "f'(x)");
  
  let roots = data?.roots;
  let signs = data?.signs;

  if (!roots || !signs) {
    if (preset === 'quadratic') {
      roots = [
        { value: '-\\infty' },
        { value: '-1' },
        { value: '2' },
        { value: '+\\infty' },
      ];
      signs = ['+', '-', '+'];
    } else if (preset === 'rational') {
      roots = [
        { value: '-\\infty' },
        { value: '-1', isUndefined: true },
        { value: '+\\infty' },
      ];
      signs = ['+', '+'];
    } else {
      roots = [
        { value: '-\\infty' },
        { value: '1' },
        { value: '+\\infty' },
      ];
      signs = ['-', '+'];
    }
  }

  const caption = data?.caption || `Bảng xét dấu đạo hàm ${expression} chuẩn SGK`;

  return (
    <div className="my-4 overflow-x-auto rounded-2xl border-2 border-slate-700 bg-white p-4 shadow-sm font-serif">
      <div className="text-center font-sans font-bold text-sm text-slate-800 pb-2 border-b border-slate-300 mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-emerald-950 tracking-wide uppercase text-xs sm:text-sm font-extrabold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs" />
          Bảng Xét Dấu Chuẩn SGK (GDPT 2018)
        </span>
        <div className="flex items-center gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => setPreset('quadratic')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              preset === 'quadratic' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Đổi dấu (+ - +)
          </button>
          <button
            type="button"
            onClick={() => setPreset('rational')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              preset === 'rational' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Phân thức (+ || +)
          </button>
        </div>
      </div>

      <div className="min-w-[420px] select-none border-2 border-slate-800 rounded-lg overflow-hidden bg-white">
        {/* ROW 1: Variable x */}
        <div className="flex border-b-2 border-slate-800 bg-slate-100/80">
          <div className="w-24 py-2.5 px-4 border-r-2 border-slate-800 font-extrabold italic text-slate-950 flex items-center justify-center shrink-0 text-base">
            <MathText content={`$${variable}$`} size="lg" />
          </div>
          <div className="flex-1 flex justify-between items-center px-6 py-2.5 font-bold text-slate-900 text-sm sm:text-base">
            {roots.map((r, idx) => (
              <span key={idx} className="font-bold px-2">
                <MathText content={`$${r.value}$`} size="lg" />
              </span>
            ))}
          </div>
        </div>

        {/* ROW 2: Sign of expression */}
        <div className="flex bg-white">
          <div className="w-24 py-3 px-4 border-r-2 border-slate-800 font-extrabold italic text-slate-950 flex items-center justify-center bg-slate-100/80 shrink-0 text-base">
            <MathText content={`$${expression}$`} size="lg" />
          </div>
          <div className="flex-1 flex items-center px-4 py-2">
            {/* Alternating Sign and Root zero/double-bar */}
            {signs.map((sign, idx) => {
              const rootAfter = roots?.[idx + 1];
              const isLast = idx === signs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {/* Sign interval */}
                  <div className="flex-1 text-center font-black text-xl py-1">
                    <span
                      className={`inline-block px-3 py-0.5 rounded ${
                        sign === '+'
                          ? 'text-emerald-700 bg-emerald-50/70 border border-emerald-200'
                          : sign === '-'
                          ? 'text-rose-700 bg-rose-50/70 border border-rose-200'
                          : 'text-slate-900'
                      }`}
                    >
                      {sign}
                    </span>
                  </div>

                  {/* Intermediary root delimiter (0 or ||) */}
                  {!isLast && rootAfter && (
                    <div className="w-8 text-center text-slate-900 font-bold text-sm shrink-0">
                      {rootAfter.isUndefined ? (
                        <span className="text-slate-800 font-mono font-black tracking-tighter text-base px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                          ||
                        </span>
                      ) : (
                        <span className="text-slate-800 font-serif text-base font-bold">0</span>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center font-sans text-xs text-slate-600 italic mt-2.5">
        <span>* {caption}</span>
      </div>
    </div>
  );
};
