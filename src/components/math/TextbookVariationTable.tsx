import React, { useState } from 'react';
import { MathText } from './MathText';

export interface VariationTableData {
  type?: 'cubic' | 'rational' | 'quartic' | 'asymptote_two' | 'custom';
  xValues?: string[];
  yPrimeValues?: string[]; // signs or zeros
  yValues?: {
    start?: string;
    peak?: string;
    valley?: string;
    end?: string;
    asymptoteX?: string;
    asymptoteY?: string;
  };
  caption?: string;
}

export const TextbookVariationTable: React.FC<{
  data?: VariationTableData;
  cValue?: number;
  type?: 'cubic' | 'rational' | 'quartic' | 'asymptote_two';
  fontSize?: 'normal' | 'large' | 'xlarge';
}> = ({ data, cValue = 2, type, fontSize = 'large' }) => {
  const initialType: 'cubic' | 'rational' | 'quartic' | 'asymptote_two' =
    type || (data?.type && data.type !== 'custom' ? data.type : 'cubic');
  const [activeType, setActiveType] = useState<'cubic' | 'rational' | 'quartic' | 'asymptote_two'>(initialType);

  const isRational = activeType === 'rational';
  const isQuartic = activeType === 'quartic';
  const isCubic = activeType === 'cubic';
  const isAsymptoteTwo = activeType === 'asymptote_two';

  const yPeak = data?.yValues?.peak || `${cValue}`;
  const yValley = data?.yValues?.valley || `${cValue - 4}`;

  let xValues = data?.xValues;
  if (!xValues) {
    if (isAsymptoteTwo) xValues = ['-\\infty', '-1', '1', '+\\infty'];
    else if (isRational) xValues = ['-\\infty', '2', '+\\infty'];
    else if (isQuartic) xValues = ['-\\infty', '-1', '0', '1', '+\\infty'];
    else xValues = ['-\\infty', '0', '2', '+\\infty'];
  }

  const caption =
    data?.caption ||
    (isAsymptoteTwo
      ? 'Bảng biến thiên hàm phân thức có 2 đường tiệm cận đứng x = -1 và x = 1 (Chuẩn Đề 10 - Câu 3)'
      : isRational
      ? 'Bảng biến thiên hàm phân thức y = (ax+b)/(cx+d)'
      : isQuartic
      ? 'Bảng biến thiên hàm số trùng phương y = ax^4 + bx^2 + c'
      : 'Bảng biến thiên hàm số bậc ba y = ax^3 + bx^2 + cx + d');

  return (
    <div className="my-4 overflow-x-auto rounded-2xl border-2 border-slate-700 bg-white p-4 shadow-sm font-serif">
      {/* Header bar */}
      <div className="text-center font-sans font-bold text-sm text-slate-800 pb-2 border-b border-slate-300 mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-emerald-950 tracking-wide uppercase text-xs sm:text-sm font-extrabold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs" />
          Bảng Biến Thiên Chuẩn SGK (GDPT 2018)
        </span>
        <div className="flex items-center gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => setActiveType('cubic')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              isCubic ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hàm Bậc 3
          </button>
          <button
            type="button"
            onClick={() => setActiveType('rational')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              isRational ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Phân Thức (1 Tiệm Cận)
          </button>
          <button
            type="button"
            onClick={() => setActiveType('asymptote_two')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              isAsymptoteTwo ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            2 Tiệm Cận (Đề 10 Câu 3)
          </button>
          <button
            type="button"
            onClick={() => setActiveType('quartic')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              isQuartic ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Trùng Phương
          </button>
        </div>
      </div>

      <div className="min-w-[500px] select-none border-2 border-slate-800 rounded-lg overflow-hidden bg-white">
        {/* ROW 1: x */}
        <div className="flex border-b-2 border-slate-800 bg-slate-100/80">
          <div className="w-20 py-2.5 px-4 border-r-2 border-slate-800 font-extrabold italic text-slate-950 flex items-center justify-center shrink-0 text-base">
            <MathText content="$x$" size="lg" />
          </div>
          <div className="flex-1 flex justify-between items-center px-8 py-2.5 font-bold text-slate-900 text-sm sm:text-base">
            {xValues.map((x, idx) => (
              <span key={idx} className="font-bold px-1">
                <MathText content={`$${x}$`} size="lg" />
              </span>
            ))}
          </div>
        </div>

        {/* ROW 2: y' (f'(x)) */}
        <div className="flex border-b-2 border-slate-800 bg-white">
          <div className="w-20 py-2.5 px-4 border-r-2 border-slate-800 font-extrabold italic text-slate-950 flex items-center justify-center bg-slate-100/80 shrink-0 text-base">
            <MathText content="$y'$" size="lg" />
          </div>
          <div className="flex-1 flex items-center px-4 py-2 font-bold">
            {isAsymptoteTwo ? (
              <div className="w-full flex items-center justify-around text-lg">
                <span className="text-emerald-700 font-black text-xl">+</span>
                <span className="text-slate-800 font-mono font-black tracking-tighter text-base px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                  ||
                </span>
                <span className="text-emerald-700 font-black text-xl">+</span>
                <span className="text-slate-800 font-mono font-black tracking-tighter text-base px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                  ||
                </span>
                <span className="text-rose-700 font-black text-xl">-</span>
              </div>
            ) : isRational ? (
              <div className="w-full flex items-center justify-around text-lg">
                <span className="text-emerald-700 font-black text-xl">+</span>
                <span className="text-slate-800 font-mono font-black tracking-tighter text-base px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                  ||
                </span>
                <span className="text-emerald-700 font-black text-xl">+</span>
              </div>
            ) : isQuartic ? (
              <div className="w-full flex items-center justify-between px-6 font-bold text-base">
                <span className="text-rose-700 font-black text-lg">-</span>
                <span className="text-slate-800 font-serif text-sm">0</span>
                <span className="text-emerald-700 font-black text-lg">+</span>
                <span className="text-slate-800 font-serif text-sm">0</span>
                <span className="text-rose-700 font-black text-lg">-</span>
                <span className="text-slate-800 font-serif text-sm">0</span>
                <span className="text-emerald-700 font-black text-lg">+</span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between px-8 font-bold text-base">
                <span className="text-emerald-700 font-black text-lg">+</span>
                <span className="text-slate-800 font-serif text-sm">0</span>
                <span className="text-rose-700 font-black text-lg">-</span>
                <span className="text-slate-800 font-serif text-sm">0</span>
                <span className="text-emerald-700 font-black text-lg">+</span>
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: y (f(x)) with vector arrows & double bar if rational */}
        <div className="flex min-h-[120px] bg-white">
          <div className="w-20 border-r-2 border-slate-800 font-extrabold italic text-slate-950 flex items-center justify-center bg-slate-100/80 shrink-0 text-base">
            <MathText content="$y$" size="lg" />
          </div>

          <div className="flex-1 relative p-3 h-32 flex items-center justify-between">
            {isAsymptoteTwo ? (
              // 2 Asymptotes (x = -1, x = 1) from PDF page 1 Câu 3
              <div className="w-full flex items-center justify-between h-full px-2 relative">
                {/* Branch 1: -inf -> +inf */}
                <div className="flex-1 flex flex-col justify-between items-center h-full relative pr-2">
                  <div className="absolute top-1 right-2 text-xs sm:text-sm font-bold text-emerald-800">
                    <MathText content="$+\\infty$" size="sm" />
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 120 70" preserveAspectRatio="none">
                    <defs>
                      <marker id="arrow-asymp1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#047857" />
                      </marker>
                    </defs>
                    <line x1="15" y1="58" x2="105" y2="14" stroke="#047857" strokeWidth="2.5" markerEnd="url(#arrow-asymp1)" />
                  </svg>
                  <div className="absolute bottom-1 left-2 text-xs sm:text-sm font-bold text-emerald-800">
                    <MathText content="$-\\infty$" size="sm" />
                  </div>
                </div>

                {/* Double vertical line at x = -1 */}
                <div className="h-full flex items-center justify-center px-2 border-x-2 border-slate-800 bg-slate-100/60">
                  <span className="text-slate-800 font-mono font-black tracking-tighter text-base select-none">||</span>
                </div>

                {/* Branch 2: -inf -> +inf */}
                <div className="flex-1 flex flex-col justify-between items-center h-full relative px-2">
                  <div className="absolute top-1 right-2 text-xs sm:text-sm font-bold text-emerald-800">
                    <MathText content="$+\\infty$" size="sm" />
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 120 70" preserveAspectRatio="none">
                    <defs>
                      <marker id="arrow-asymp2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#047857" />
                      </marker>
                    </defs>
                    <line x1="15" y1="58" x2="105" y2="14" stroke="#047857" strokeWidth="2.5" markerEnd="url(#arrow-asymp2)" />
                  </svg>
                  <div className="absolute bottom-1 left-2 text-xs sm:text-sm font-bold text-emerald-800">
                    <MathText content="$-\\infty$" size="sm" />
                  </div>
                </div>

                {/* Double vertical line at x = 1 */}
                <div className="h-full flex items-center justify-center px-2 border-x-2 border-slate-800 bg-slate-100/60">
                  <span className="text-slate-800 font-mono font-black tracking-tighter text-base select-none">||</span>
                </div>

                {/* Branch 3: +inf -> 1 */}
                <div className="flex-1 flex flex-col justify-between items-center h-full relative pl-2">
                  <div className="absolute top-1 left-2 text-xs sm:text-sm font-bold text-emerald-800">
                    <MathText content="$+\\infty$" size="sm" />
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 120 70" preserveAspectRatio="none">
                    <defs>
                      <marker id="arrow-asymp3" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#b91c1c" />
                      </marker>
                    </defs>
                    <line x1="15" y1="14" x2="105" y2="58" stroke="#b91c1c" strokeWidth="2.5" markerEnd="url(#arrow-asymp3)" />
                  </svg>
                  <div className="absolute bottom-1 right-2 text-xs sm:text-sm font-bold text-slate-800">
                    <MathText content="$1$" size="sm" />
                  </div>
                </div>
              </div>
            ) : isRational ? (
              // Rational function: two increasing branches separated by double vertical asymptote line
              <div className="w-full flex items-center justify-between h-full px-4 relative">
                {/* Branch 1: from y_0 up to +inf */}
                <div className="flex-1 flex flex-col justify-between items-center h-full relative pr-4">
                  <div className="absolute top-1 right-6 text-xs sm:text-sm font-bold text-emerald-800">
                    <MathText content="$+\\infty$" size="md" />
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 160 70" preserveAspectRatio="none">
                    <defs>
                      <marker id="arrow-rat1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#047857" />
                      </marker>
                    </defs>
                    <line x1="20" y1="58" x2="135" y2="14" stroke="#047857" strokeWidth="2.5" markerEnd="url(#arrow-rat1)" />
                  </svg>
                  <div className="absolute bottom-1 left-3 text-xs sm:text-sm font-bold text-slate-800">
                    <MathText content="$1$" size="md" />
                  </div>
                </div>

                {/* Double vertical line at asymptote */}
                <div className="h-full flex items-center justify-center px-4 border-x-2 border-slate-800 bg-slate-100/60">
                  <span className="text-slate-800 font-mono font-black tracking-tighter text-lg select-none">||</span>
                </div>

                {/* Branch 2: from -inf up to y_0 */}
                <div className="flex-1 flex flex-col justify-between items-center h-full relative pl-4">
                  <div className="absolute top-1 right-3 text-xs sm:text-sm font-bold text-slate-800">
                    <MathText content="$1$" size="md" />
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 160 70" preserveAspectRatio="none">
                    <defs>
                      <marker id="arrow-rat2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#047857" />
                      </marker>
                    </defs>
                    <line x1="20" y1="58" x2="135" y2="14" stroke="#047857" strokeWidth="2.5" markerEnd="url(#arrow-rat2)" />
                  </svg>
                  <div className="absolute bottom-1 left-6 text-xs sm:text-sm font-bold text-emerald-800">
                    <MathText content="$-\\infty$" size="md" />
                  </div>
                </div>
              </div>
            ) : isQuartic ? (
              // Quartic function: W-shape (-inf -> valley1 -> peak -> valley2 -> +inf)
              <div className="w-full h-full relative">
                <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 90">
                  <defs>
                    <marker id="arrow-q-up" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#047857" />
                    </marker>
                    <marker id="arrow-q-down" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#b91c1c" />
                    </marker>
                  </defs>
                  {/* branch 1 down */}
                  <line x1="25" y1="20" x2="115" y2="72" stroke="#b91c1c" strokeWidth="2.5" markerEnd="url(#arrow-q-down)" />
                  {/* branch 2 up */}
                  <line x1="145" y1="72" x2="235" y2="20" stroke="#047857" strokeWidth="2.5" markerEnd="url(#arrow-q-up)" />
                  {/* branch 3 down */}
                  <line x1="265" y1="20" x2="355" y2="72" stroke="#b91c1c" strokeWidth="2.5" markerEnd="url(#arrow-q-down)" />
                  {/* branch 4 up */}
                  <line x1="385" y1="72" x2="475" y2="20" stroke="#047857" strokeWidth="2.5" markerEnd="url(#arrow-q-up)" />
                </svg>

                <div className="absolute left-2 top-2 text-xs sm:text-sm text-slate-800 font-bold">
                  <MathText content="$+\\infty$" size="md" />
                </div>
                <div className="absolute left-[24%] bottom-2 -translate-x-1/2 text-center">
                  <span className="text-xs sm:text-sm font-extrabold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                    <MathText content={`$${cValue - 1}$`} size="md" />
                  </span>
                  <div className="text-[10px] text-slate-600 font-sans mt-0.5 font-bold">Cực tiểu</div>
                </div>
                <div className="absolute left-[50%] top-2 -translate-x-1/2 text-center">
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    <MathText content={`$${cValue}$`} size="md" />
                  </span>
                  <div className="text-[10px] text-slate-600 font-sans mt-0.5 font-bold">Cực đại</div>
                </div>
                <div className="absolute left-[76%] bottom-2 -translate-x-1/2 text-center">
                  <span className="text-xs sm:text-sm font-extrabold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                    <MathText content={`$${cValue - 1}$`} size="md" />
                  </span>
                  <div className="text-[10px] text-slate-600 font-sans mt-0.5 font-bold">Cực tiểu</div>
                </div>
                <div className="absolute right-2 top-2 text-xs sm:text-sm text-slate-800 font-bold">
                  <MathText content="$+\\infty$" size="md" />
                </div>
              </div>
            ) : (
              // Cubic function: smooth vector arrows -inf -> peak -> valley -> +inf
              <div className="w-full h-full relative">
                <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 420 90">
                  <defs>
                    <marker id="arrow-up" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#047857" />
                    </marker>
                    <marker id="arrow-down" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#b91c1c" />
                    </marker>
                  </defs>

                  {/* Branch 1: -inf up to peak */}
                  <line x1="25" y1="72" x2="140" y2="18" stroke="#047857" strokeWidth="2.5" markerEnd="url(#arrow-up)" />

                  {/* Branch 2: peak down to valley */}
                  <line x1="170" y1="18" x2="280" y2="72" stroke="#b91c1c" strokeWidth="2.5" markerEnd="url(#arrow-down)" />

                  {/* Branch 3: valley up to +inf */}
                  <line x1="310" y1="72" x2="400" y2="18" stroke="#047857" strokeWidth="2.5" markerEnd="url(#arrow-up)" />
                </svg>

                {/* Values positioning */}
                <div className="absolute left-2 bottom-2 text-xs sm:text-sm text-slate-800 font-bold">
                  <MathText content="$-\\infty$" size="md" />
                </div>

                <div className="absolute left-[36%] top-2 text-center -translate-x-1/2">
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    <MathText content={`$${yPeak}$`} size="md" />
                  </span>
                  <div className="text-[10px] text-emerald-900 font-sans mt-0.5 font-bold">Cực đại</div>
                </div>

                <div className="absolute left-[70%] bottom-2 text-center -translate-x-1/2">
                  <span className="text-xs sm:text-sm font-extrabold text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                    <MathText content={`$${yValley}$`} size="md" />
                  </span>
                  <div className="text-[10px] text-rose-900 font-sans mt-0.5 font-bold">Cực tiểu</div>
                </div>

                <div className="absolute right-2 top-2 text-xs sm:text-sm text-slate-800 font-bold">
                  <MathText content="$+\\infty$" size="md" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center font-sans text-xs text-slate-600 italic mt-2.5">
        <span>* {caption}</span>
      </div>
    </div>
  );
};
