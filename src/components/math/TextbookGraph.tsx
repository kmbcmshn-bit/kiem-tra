import React, { useState } from 'react';
import { MathText } from './MathText';

export interface TextbookGraphProps {
  cValue?: number;
  type?: 'cubic' | 'rational' | 'quartic' | 'trig' | 'oblique_rational';
  title?: string;
}

export const TextbookGraph: React.FC<TextbookGraphProps> = ({
  cValue = 2,
  type = 'quartic',
  title = 'Hình minh họa. Đồ thị hàm số trong hệ trục tọa độ Oxy chuẩn SGK',
}) => {
  const [graphType, setGraphType] = useState<'cubic' | 'rational' | 'quartic' | 'trig' | 'oblique_rational'>(type);

  // SVG dimensions
  const width = 420;
  const height = 280;
  const originX = 180;
  const originY = 150;
  const scale = 32; // 32 px = 1 unit

  // Points for Cubic: y = x^3 - 3x^2 + cValue
  const cubicPoints: [number, number][] = [];
  for (let x = -1.1; x <= 3.2; x += 0.04) {
    const yVal = Math.pow(x, 3) - 3 * Math.pow(x, 2) + cValue;
    const svgX = originX + x * scale;
    const svgY = originY - yVal * scale * 0.55;
    cubicPoints.push([svgX, svgY]);
  }
  const cubicPath = cubicPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  // Extrema for Cubic
  const peakX = originX;
  const peakY = originY - cValue * scale * 0.55;
  const valleyX = originX + 2 * scale;
  const valleyY = originY - (cValue - 4) * scale * 0.55;

  // Points for Rational: y = (x + 1)/(x - 2)
  const ratLeftPoints: [number, number][] = [];
  for (let x = -4.5; x <= 1.75; x += 0.05) {
    const yVal = (x + 1) / (x - 2);
    const svgX = originX + x * scale;
    const svgY = originY - yVal * scale;
    if (svgY >= -25 && svgY <= height + 25) {
      ratLeftPoints.push([svgX, svgY]);
    }
  }
  const ratLeftPath = ratLeftPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  const ratRightPoints: [number, number][] = [];
  for (let x = 2.25; x <= 6.8; x += 0.05) {
    const yVal = (x + 1) / (x - 2);
    const svgX = originX + x * scale;
    const svgY = originY - yVal * scale;
    if (svgY >= -25 && svgY <= height + 25) {
      ratRightPoints.push([svgX, svgY]);
    }
  }
  const ratRightPath = ratRightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  const asympX = originX + 2 * scale; // vertical asymptote x = 2
  const asympY = originY - 1 * scale; // horizontal asymptote y = 1

  // Points for Quartic W-curve: y = x^4 - 2x^2 (Matching Đề 10 Câu 1 trong PDF)
  const quarticPoints: [number, number][] = [];
  for (let x = -1.6; x <= 1.6; x += 0.03) {
    const yVal = Math.pow(x, 4) - 2 * Math.pow(x, 2);
    const svgX = originX + x * scale * 1.5;
    const svgY = originY - yVal * scale * 1.4;
    if (svgY >= -20 && svgY <= height + 20) {
      quarticPoints.push([svgX, svgY]);
    }
  }
  const quarticPath = quarticPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  // Points for Oblique Rational: y = (x^2 + 2x + 2)/(x + 1) (Matching Đề 10 Câu 4 trong PDF)
  const oblLeftPoints: [number, number][] = [];
  for (let x = -4.5; x <= -1.15; x += 0.04) {
    const yVal = (x * x + 2 * x + 2) / (x + 1);
    const svgX = originX + x * scale;
    const svgY = originY - yVal * scale * 0.7;
    if (svgY >= -20 && svgY <= height + 20) {
      oblLeftPoints.push([svgX, svgY]);
    }
  }
  const oblLeftPath = oblLeftPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  const oblRightPoints: [number, number][] = [];
  for (let x = -0.85; x <= 3.5; x += 0.04) {
    const yVal = (x * x + 2 * x + 2) / (x + 1);
    const svgX = originX + x * scale;
    const svgY = originY - yVal * scale * 0.7;
    if (svgY >= -20 && svgY <= height + 20) {
      oblRightPoints.push([svgX, svgY]);
    }
  }
  const oblRightPath = oblRightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  // Points for Trigonometric: y = sin(x) with pi units
  const trigPoints: [number, number][] = [];
  const trigPiScale = 65;
  for (let x = -3.5; x <= 3.5; x += 0.05) {
    const yVal = Math.sin(x);
    const svgX = originX + (x / Math.PI) * trigPiScale;
    const svgY = originY - yVal * scale * 1.5;
    trigPoints.push([svgX, svgY]);
  }
  const trigPath = trigPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

  return (
    <div className="my-4 rounded-2xl border-2 border-slate-700 bg-white p-4 shadow-sm font-serif">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm pb-2 border-b border-slate-300 mb-3 font-sans">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs" />
            Đồ Thị Tọa Độ Chuẩn SGK (Oxy)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1 font-sans">
          <button
            type="button"
            onClick={() => setGraphType('quartic')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              graphType === 'quartic'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Trùng Phương W (Đề 10 Câu 1)
          </button>
          <button
            type="button"
            onClick={() => setGraphType('oblique_rational')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              graphType === 'oblique_rational'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tiệm Cận Xiên (Đề 10 Câu 4)
          </button>
          <button
            type="button"
            onClick={() => setGraphType('rational')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              graphType === 'rational'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Phân Thức Bậc 1/1
          </button>
          <button
            type="button"
            onClick={() => setGraphType('cubic')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              graphType === 'cubic'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hàm Bậc 3
          </button>
          <button
            type="button"
            onClick={() => setGraphType('trig')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              graphType === 'trig'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Lượng Giác (π)
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex justify-center bg-slate-50/90 rounded-xl p-2 overflow-x-auto border border-slate-300">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="select-none font-serif text-sm overflow-visible"
        >
          {/* Subtle Grid */}
          <defs>
            <pattern id="book-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
            <marker id="axis-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f172a" />
            </marker>
          </defs>

          <rect width={width} height={height} fill="url(#book-grid)" />

          {/* AXES: Ox and Oy */}
          <line
            x1="15"
            y1={originY}
            x2={width - 15}
            y2={originY}
            stroke="#0f172a"
            strokeWidth="2"
            markerEnd="url(#axis-arrow)"
          />
          <line
            x1={originX}
            y1={height - 15}
            x2={originX}
            y2="15"
            stroke="#0f172a"
            strokeWidth="2"
            markerEnd="url(#axis-arrow)"
          />

          {/* Labels for Ox, Oy and O */}
          <text x={width - 10} y={originY + 18} fontSize="14" fontStyle="italic" fontWeight="bold" fill="#0f172a">
            x
          </text>
          <text x={originX - 18} y="16" fontSize="14" fontStyle="italic" fontWeight="bold" fill="#0f172a">
            y
          </text>
          <text x={originX - 16} y={originY + 16} fontSize="12" fontStyle="italic" fill="#334155" fontWeight="bold">
            O
          </text>

          {/* Regular ticks if not trig */}
          {graphType !== 'trig' && (
            <>
              {[-3, -2, -1, 1, 2, 3, 4].map((tick) => {
                const tx = originX + tick * scale;
                if (tx < 20 || tx > width - 25) return null;
                return (
                  <g key={`x-${tick}`}>
                    <line x1={tx} y1={originY - 3} x2={tx} y2={originY + 3} stroke="#334155" strokeWidth="1.4" />
                    <text x={tx} y={originY + 15} fontSize="10" fill="#334155" textAnchor="middle" fontWeight="bold">
                      {tick}
                    </text>
                  </g>
                );
              })}

              {[-2, -1, 1, 2, 3].map((tick) => {
                const ty = originY - tick * scale;
                if (ty < 25 || ty > height - 25) return null;
                return (
                  <g key={`y-${tick}`}>
                    <line x1={originX - 3} y1={ty} x2={originX + 3} y2={ty} stroke="#334155" strokeWidth="1.4" />
                    <text x={originX - 10} y={ty + 4} fontSize="10" fill="#334155" textAnchor="end" fontWeight="bold">
                      {tick}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* GRAPH TYPE 1: CUBIC */}
          {graphType === 'cubic' && (
            <>
              {/* Dashed projections */}
              <line x1={valleyX} y1={originY} x2={valleyX} y2={valleyY} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1={originX} y1={valleyY} x2={valleyX} y2={valleyY} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Curve */}
              <path d={cubicPath} fill="none" stroke="#047857" strokeWidth="2.8" strokeLinecap="round" />

              {/* Extremum Points */}
              <circle cx={peakX} cy={peakY} r="4.5" fill="#047857" stroke="#ffffff" strokeWidth="2" />
              <circle cx={valleyX} cy={valleyY} r="4.5" fill="#b91c1c" stroke="#ffffff" strokeWidth="2" />

              {/* Point Coordinates text */}
              <text x={peakX + 6} y={peakY - 6} fontSize="11" fontWeight="bold" fill="#047857">
                CĐ(0; {cValue})
              </text>
              <text x={valleyX + 6} y={valleyY + 14} fontSize="11" fontWeight="bold" fill="#b91c1c">
                CT(2; {cValue - 4})
              </text>
            </>
          )}

          {/* GRAPH TYPE 2: RATIONAL WITH ASYMPTOTES */}
          {graphType === 'rational' && (
            <>
              {/* Vertical Asymptote x = 2 */}
              <line x1={asympX} y1="15" x2={asympX} y2={height - 15} stroke="#dc2626" strokeWidth="1.8" strokeDasharray="4 3" />
              <text x={asympX + 6} y="28" fontSize="11" fontWeight="bold" fill="#dc2626">
                x = 2
              </text>

              {/* Horizontal Asymptote y = 1 */}
              <line x1="15" y1={asympY} x2={width - 15} y2={asympY} stroke="#dc2626" strokeWidth="1.8" strokeDasharray="4 3" />
              <text x={width - 40} y={asympY - 6} fontSize="11" fontWeight="bold" fill="#dc2626">
                y = 1
              </text>

              {/* Two Hyperbola Branches */}
              <path d={ratLeftPath} fill="none" stroke="#047857" strokeWidth="2.8" strokeLinecap="round" />
              <path d={ratRightPath} fill="none" stroke="#047857" strokeWidth="2.8" strokeLinecap="round" />

              {/* Center of symmetry I(2; 1) */}
              <circle cx={asympX} cy={asympY} r="4" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
              <text x={asympX + 8} y={asympY - 8} fontSize="10" fontWeight="bold" fill="#dc2626">
                I(2; 1)
              </text>
            </>
          )}

          {/* GRAPH TYPE 3: QUARTIC */}
          {graphType === 'quartic' && (
            <>
              <path d={quarticPath} fill="none" stroke="#047857" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx={originX} cy={originY - 1 * scale * 0.8} r="4" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={originX - 1 * scale * 1.3} cy={originY} r="4" fill="#b91c1c" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={originX + 1 * scale * 1.3} cy={originY} r="4" fill="#b91c1c" stroke="#ffffff" strokeWidth="1.5" />
              <text x={originX + 6} y={originY - 1 * scale * 0.8 - 4} fontSize="10" fontWeight="bold" fill="#047857">
                CĐ(0; 1)
              </text>
              <text x={originX + 1 * scale * 1.3 - 10} y={originY + 16} fontSize="10" fontWeight="bold" fill="#b91c1c">
                CT(1; 0)
              </text>
              <text x={originX - 1 * scale * 1.3 - 24} y={originY + 16} fontSize="10" fontWeight="bold" fill="#b91c1c">
                CT(-1; 0)
              </text>
            </>
          )}

          {/* GRAPH TYPE 4: TRIGONOMETRIC WAVE WITH PI LABELS */}
          {graphType === 'trig' && (
            <>
              {/* Ticks with proper mathematical PI: -pi, -pi/2, pi/2, pi */}
              {[
                { val: -1, label: '-π', x: originX - trigPiScale },
                { val: -0.5, label: '-π/2', x: originX - trigPiScale / 2 },
                { val: 0.5, label: 'π/2', x: originX + trigPiScale / 2 },
                { val: 1, label: 'π', x: originX + trigPiScale },
                { val: 1.5, label: '3π/2', x: originX + (trigPiScale * 3) / 2 },
                { val: 2, label: '2π', x: originX + trigPiScale * 2 },
              ].map((item, idx) => {
                if (item.x < 20 || item.x > width - 25) return null;
                return (
                  <g key={`trig-x-${idx}`}>
                    <line x1={item.x} y1={originY - 4} x2={item.x} y2={originY + 4} stroke="#334155" strokeWidth="1.4" />
                    <text x={item.x} y={originY + 16} fontSize="11" fill="#0f172a" textAnchor="middle" fontWeight="bold">
                      {item.label}
                    </text>
                  </g>
                );
              })}

              {/* Y ticks at 1 and -1 */}
              <line x1={originX - 4} y1={originY - scale * 1.5} x2={originX + 4} y2={originY - scale * 1.5} stroke="#334155" strokeWidth="1.4" />
              <text x={originX - 10} y={originY - scale * 1.5 + 4} fontSize="10" fill="#0f172a" textAnchor="end" fontWeight="bold">
                1
              </text>
              <line x1={originX - 4} y1={originY + scale * 1.5} x2={originX + 4} y2={originY + scale * 1.5} stroke="#334155" strokeWidth="1.4" />
              <text x={originX - 10} y={originY + scale * 1.5 + 4} fontSize="10" fill="#0f172a" textAnchor="end" fontWeight="bold">
                -1
              </text>

              {/* Sine Wave */}
              <path d={trigPath} fill="none" stroke="#047857" strokeWidth="2.8" strokeLinecap="round" />

              {/* Peak and valley points */}
              <circle cx={originX + trigPiScale / 2} cy={originY - scale * 1.5} r="4" fill="#047857" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={originX - trigPiScale / 2} cy={originY + scale * 1.5} r="4" fill="#b91c1c" stroke="#ffffff" strokeWidth="1.5" />
            </>
          )}
        </svg>
      </div>

      <div className="text-center font-sans text-xs sm:text-sm text-slate-800 font-medium mt-3 flex items-center justify-center gap-2">
        <MathText
          size="md"
          content={
            graphType === 'cubic'
              ? `$y = x^3 - 3x^2 + ${cValue}$`
              : graphType === 'rational'
              ? '$y = \\frac{x + 1}{x - 2}$'
              : graphType === 'quartic'
              ? '$y = x^4 - 2x^2 + 1$'
              : '$y = \\sin x$'
          }
        />
        <span>• {title}</span>
      </div>
    </div>
  );
};
