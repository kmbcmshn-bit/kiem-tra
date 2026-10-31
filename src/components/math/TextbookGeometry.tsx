import React, { useState } from 'react';
import { MathText } from './MathText';
import { Box, Shapes, Eye, Compass, Layers } from 'lucide-react';

export type GeometryType =
  | 'pyramid_triangle' // Hình chóp S.ABC
  | 'pyramid_quad' // Hình chóp S.ABCD
  | 'prism_triangle' // Hình lăng trụ tam giác ABC.A'B'C'
  | 'cuboid' // Hình hộp chữ nhật ABCD.A'B'C'D'
  | 'cone' // Hình nón
  | 'cylinder' // Hình trụ
  | 'sphere' // Mặt cầu
  | 'triangle_plane' // Tam giác phẳng có đường cao AH
  | 'circle_plane'; // Đường tròn & tiếp tuyến

interface TextbookGeometryProps {
  type?: GeometryType;
  title?: string;
  caption?: string;
}

export const TextbookGeometry: React.FC<TextbookGeometryProps> = ({
  type = 'pyramid_quad',
  title,
  caption,
}) => {
  const [activeType, setActiveType] = useState<GeometryType>(type);

  return (
    <div className="my-4 rounded-2xl border-2 border-slate-700 bg-white p-4 shadow-sm font-serif">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm pb-2 border-b border-slate-300 mb-3 font-sans">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs" />
            Hình Vẽ Toán Học Chuẩn SGK (GDPT 2018)
          </span>
        </div>

        {/* Quick Type Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1 font-sans">
          <button
            type="button"
            onClick={() => setActiveType('pyramid_quad')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              activeType === 'pyramid_quad'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Chóp S.ABCD
          </button>

          <button
            type="button"
            onClick={() => setActiveType('pyramid_triangle')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              activeType === 'pyramid_triangle'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Chóp S.ABC
          </button>

          <button
            type="button"
            onClick={() => setActiveType('cuboid')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              activeType === 'cuboid'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hình Hộp / Lập Phương
          </button>

          <button
            type="button"
            onClick={() => setActiveType('prism_triangle')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              activeType === 'prism_triangle'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Lăng Trụ Tam Giác
          </button>

          <button
            type="button"
            onClick={() => setActiveType('cone')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              activeType === 'cone'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hình Nón / Trụ
          </button>

          <button
            type="button"
            onClick={() => setActiveType('triangle_plane')}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
              activeType === 'triangle_plane'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hình Phẳng
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-xl border border-slate-200">
        {/* 1. HÌNH CHÓP S.ABCD */}
        {activeType === 'pyramid_quad' && (
          <svg className="w-full max-w-[420px] h-[300px]" viewBox="0 0 420 300">
            {/* Background plane shading for base */}
            <polygon points="120,200 280,200 360,250 200,250" fill="#f1f5f9" opacity="0.6" />

            {/* Hidden lines (dashed) */}
            {/* AD */}
            <line x1="120" y1="200" x2="280" y2="200" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            {/* AB */}
            <line x1="120" y1="200" x2="200" y2="250" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            {/* SA */}
            <line x1="220" y1="40" x2="120" y2="200" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            {/* SO (altitude) */}
            <line x1="220" y1="40" x2="240" y2="225" stroke="#047857" strokeWidth="1.8" strokeDasharray="4,4" />
            {/* Diagonals AC, BD (dashed) */}
            <line x1="120" y1="200" x2="360" y2="250" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,3" />
            <line x1="200" y1="250" x2="280" y2="200" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* Visible lines (solid) */}
            {/* BC */}
            <line x1="200" y1="250" x2="360" y2="250" stroke="#1e293b" strokeWidth="2.2" />
            {/* CD */}
            <line x1="360" y1="250" x2="280" y2="200" stroke="#1e293b" strokeWidth="2.2" />
            {/* SB */}
            <line x1="220" y1="40" x2="200" y2="250" stroke="#1e293b" strokeWidth="2.2" />
            {/* SC */}
            <line x1="220" y1="40" x2="360" y2="250" stroke="#1e293b" strokeWidth="2.2" />
            {/* SD */}
            <line x1="220" y1="40" x2="280" y2="200" stroke="#1e293b" strokeWidth="2.2" />

            {/* Right angle mark at O */}
            <polygon points="240,215 246,218 246,225 240,225" fill="none" stroke="#047857" strokeWidth="1.5" />

            {/* Vertex points */}
            <circle cx="220" cy="40" r="3.5" fill="#1e293b" />
            <circle cx="120" cy="200" r="3" fill="#1e293b" />
            <circle cx="200" cy="250" r="3" fill="#1e293b" />
            <circle cx="360" cy="250" r="3" fill="#1e293b" />
            <circle cx="280" cy="200" r="3" fill="#1e293b" />
            <circle cx="240" cy="225" r="2.5" fill="#047857" />

            {/* Vertex labels */}
            <text x="215" y="28" fontFamily="serif" fontSize="16" fontWeight="bold" fill="#0f172a">S</text>
            <text x="100" y="205" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0f172a">A</text>
            <text x="190" y="272" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0f172a">B</text>
            <text x="370" y="260" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0f172a">C</text>
            <text x="290" y="200" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0f172a">D</text>
            <text x="245" y="240" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#047857">O</text>
          </svg>
        )}

        {/* 2. HÌNH CHÓP S.ABC */}
        {activeType === 'pyramid_triangle' && (
          <svg className="w-full max-w-[420px] h-[300px]" viewBox="0 0 420 300">
            {/* Base shading */}
            <polygon points="110,220 330,220 200,265" fill="#f8fafc" opacity="0.6" />

            {/* Hidden lines (dashed) */}
            {/* AC */}
            <line x1="110" y1="220" x2="330" y2="220" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            {/* SH (altitude from S to base) */}
            <line x1="210" y1="45" x2="210" y2="235" stroke="#047857" strokeWidth="1.8" strokeDasharray="4,4" />
            {/* Median or altitude in base */}
            <line x1="110" y1="220" x2="265" y2="242" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* Visible lines */}
            {/* AB */}
            <line x1="110" y1="220" x2="200" y2="265" stroke="#1e293b" strokeWidth="2.2" />
            {/* BC */}
            <line x1="200" y1="265" x2="330" y2="220" stroke="#1e293b" strokeWidth="2.2" />
            {/* SA */}
            <line x1="210" y1="45" x2="110" y2="220" stroke="#1e293b" strokeWidth="2.2" />
            {/* SB */}
            <line x1="210" y1="45" x2="200" y2="265" stroke="#1e293b" strokeWidth="2.2" />
            {/* SC */}
            <line x1="210" y1="45" x2="330" y2="220" stroke="#1e293b" strokeWidth="2.2" />

            {/* Right angle at H */}
            <polygon points="210,225 218,225 218,235 210,235" fill="none" stroke="#047857" strokeWidth="1.5" />

            {/* Vertices */}
            <circle cx="210" cy="45" r="3.5" fill="#1e293b" />
            <circle cx="110" cy="220" r="3" fill="#1e293b" />
            <circle cx="200" cy="265" r="3" fill="#1e293b" />
            <circle cx="330" cy="220" r="3" fill="#1e293b" />
            <circle cx="210" cy="235" r="2.5" fill="#047857" />

            {/* Labels */}
            <text x="205" y="32" fontFamily="serif" fontSize="16" fontWeight="bold" fill="#0f172a">S</text>
            <text x="92" y="226" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0f172a">A</text>
            <text x="195" y="285" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0f172a">B</text>
            <text x="340" y="226" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#0f172a">C</text>
            <text x="215" y="250" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#047857">H</text>
          </svg>
        )}

        {/* 3. HÌNH HỘP CHỮ NHẬT / LẬP PHƯƠNG ABCD.A'B'C'D' */}
        {activeType === 'cuboid' && (
          <svg className="w-full max-w-[420px] h-[300px]" viewBox="0 0 420 300">
            {/* Hidden lines behind */}
            {/* A-D */}
            <line x1="120" y1="180" x2="280" y2="180" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            {/* A-B */}
            <line x1="120" y1="180" x2="160" y2="245" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            {/* A-A' */}
            <line x1="120" y1="180" x2="120" y2="70" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            {/* Spatial diagonal B-D' (dashed) */}
            <line x1="160" y1="245" x2="280" y2="70" stroke="#047857" strokeWidth="1.6" strokeDasharray="4,4" />

            {/* Front & Visible base lines */}
            {/* B-C */}
            <line x1="160" y1="245" x2="320" y2="245" stroke="#1e293b" strokeWidth="2.2" />
            {/* C-D */}
            <line x1="320" y1="245" x2="280" y2="180" stroke="#1e293b" strokeWidth="2.2" />

            {/* Top base lines (all visible from above) */}
            {/* A'-B' */}
            <line x1="120" y1="70" x2="160" y2="135" stroke="#1e293b" strokeWidth="2.2" />
            {/* B'-C' */}
            <line x1="160" y1="135" x2="320" y2="135" stroke="#1e293b" strokeWidth="2.2" />
            {/* C'-D' */}
            <line x1="320" y1="135" x2="280" y2="70" stroke="#1e293b" strokeWidth="2.2" />
            {/* D'-A' */}
            <line x1="280" y1="70" x2="120" y2="70" stroke="#1e293b" strokeWidth="2.2" />

            {/* Vertical edges visible */}
            {/* B-B' */}
            <line x1="160" y1="245" x2="160" y2="135" stroke="#1e293b" strokeWidth="2.2" />
            {/* C-C' */}
            <line x1="320" y1="245" x2="320" y2="135" stroke="#1e293b" strokeWidth="2.2" />
            {/* D-D' */}
            <line x1="280" y1="180" x2="280" y2="70" stroke="#1e293b" strokeWidth="2.2" />

            {/* Vertices */}
            <circle cx="120" cy="180" r="3" fill="#1e293b" />
            <circle cx="160" cy="245" r="3" fill="#1e293b" />
            <circle cx="320" cy="245" r="3" fill="#1e293b" />
            <circle cx="280" cy="180" r="3" fill="#1e293b" />

            <circle cx="120" cy="70" r="3" fill="#1e293b" />
            <circle cx="160" cy="135" r="3" fill="#1e293b" />
            <circle cx="320" cy="135" r="3" fill="#1e293b" />
            <circle cx="280" cy="70" r="3" fill="#1e293b" />

            {/* Labels */}
            <text x="102" y="186" fontFamily="serif" fontSize="15" fontWeight="bold">A</text>
            <text x="145" y="262" fontFamily="serif" fontSize="15" fontWeight="bold">B</text>
            <text x="328" y="258" fontFamily="serif" fontSize="15" fontWeight="bold">C</text>
            <text x="290" y="186" fontFamily="serif" fontSize="15" fontWeight="bold">D</text>

            <text x="100" y="65" fontFamily="serif" fontSize="15" fontWeight="bold">A'</text>
            <text x="145" y="145" fontFamily="serif" fontSize="15" fontWeight="bold">B'</text>
            <text x="328" y="140" fontFamily="serif" fontSize="15" fontWeight="bold">C'</text>
            <text x="288" y="65" fontFamily="serif" fontSize="15" fontWeight="bold">D'</text>
          </svg>
        )}

        {/* 4. HÌNH LĂNG TRỤ TAM GIÁC ABC.A'B'C' */}
        {activeType === 'prism_triangle' && (
          <svg className="w-full max-w-[420px] h-[300px]" viewBox="0 0 420 300">
            {/* Hidden lines (dashed) */}
            <line x1="130" y1="210" x2="310" y2="210" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            <line x1="130" y1="210" x2="130" y2="80" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />

            {/* Bottom base visible */}
            <line x1="130" y1="210" x2="210" y2="260" stroke="#1e293b" strokeWidth="2.2" />
            <line x1="210" y1="260" x2="310" y2="210" stroke="#1e293b" strokeWidth="2.2" />

            {/* Top base visible */}
            <line x1="130" y1="80" x2="210" y2="130" stroke="#1e293b" strokeWidth="2.2" />
            <line x1="210" y1="130" x2="310" y2="80" stroke="#1e293b" strokeWidth="2.2" />
            <line x1="310" y1="80" x2="130" y2="80" stroke="#1e293b" strokeWidth="2.2" />

            {/* Vertical side edges visible */}
            <line x1="210" y1="260" x2="210" y2="130" stroke="#1e293b" strokeWidth="2.2" />
            <line x1="310" y1="210" x2="310" y2="80" stroke="#1e293b" strokeWidth="2.2" />

            {/* Vertices */}
            <circle cx="130" cy="210" r="3" fill="#1e293b" />
            <circle cx="210" cy="260" r="3" fill="#1e293b" />
            <circle cx="310" cy="210" r="3" fill="#1e293b" />
            <circle cx="130" cy="80" r="3" fill="#1e293b" />
            <circle cx="210" cy="130" r="3" fill="#1e293b" />
            <circle cx="310" cy="80" r="3" fill="#1e293b" />

            {/* Labels */}
            <text x="110" y="215" fontFamily="serif" fontSize="15" fontWeight="bold">A</text>
            <text x="205" y="280" fontFamily="serif" fontSize="15" fontWeight="bold">B</text>
            <text x="320" y="215" fontFamily="serif" fontSize="15" fontWeight="bold">C</text>
            <text x="110" y="75" fontFamily="serif" fontSize="15" fontWeight="bold">A'</text>
            <text x="205" y="145" fontFamily="serif" fontSize="15" fontWeight="bold">B'</text>
            <text x="320" y="75" fontFamily="serif" fontSize="15" fontWeight="bold">C'</text>
          </svg>
        )}

        {/* 5. HÌNH NÓN (CONE) & HÌNH TRỤ */}
        {activeType === 'cone' && (
          <svg className="w-full max-w-[420px] h-[300px]" viewBox="0 0 420 300">
            {/* Cone Apex S */}
            {/* Outline generator lines */}
            <line x1="210" y1="40" x2="110" y2="230" stroke="#1e293b" strokeWidth="2.2" />
            <line x1="210" y1="40" x2="310" y2="230" stroke="#1e293b" strokeWidth="2.2" />

            {/* Altitude SO */}
            <line x1="210" y1="40" x2="210" y2="230" stroke="#047857" strokeWidth="1.8" strokeDasharray="4,4" />
            {/* Radius OA */}
            <line x1="210" y1="230" x2="110" y2="230" stroke="#047857" strokeWidth="1.8" strokeDasharray="4,4" />

            {/* Base Ellipse: Back half dashed, front half solid */}
            {/* Back half (y < 230) */}
            <path d="M 110 230 A 100 25 0 0 1 310 230" fill="none" stroke="#1e293b" strokeWidth="1.8" strokeDasharray="5,5" />
            {/* Front half (y > 230) */}
            <path d="M 110 230 A 100 25 0 0 0 310 230" fill="none" stroke="#1e293b" strokeWidth="2.2" />

            {/* Right angle at O */}
            <polygon points="210,222 218,222 218,230 210,230" fill="none" stroke="#047857" strokeWidth="1.5" />

            {/* Vertices */}
            <circle cx="210" cy="40" r="3.5" fill="#1e293b" />
            <circle cx="210" cy="230" r="3" fill="#047857" />
            <circle cx="110" cy="230" r="3" fill="#1e293b" />
            <circle cx="310" cy="230" r="3" fill="#1e293b" />

            {/* Labels */}
            <text x="205" y="28" fontFamily="serif" fontSize="16" fontWeight="bold">S</text>
            <text x="215" y="248" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#047857">O</text>
            <text x="92" y="235" fontFamily="serif" fontSize="15" fontWeight="bold">A</text>
            <text x="318" y="235" fontFamily="serif" fontSize="15" fontWeight="bold">B</text>
            <text x="155" y="222" fontFamily="serif" fontSize="14" fontStyle="italic" fill="#047857">r</text>
            <text x="215" y="140" fontFamily="serif" fontSize="14" fontStyle="italic" fill="#047857">h</text>
            <text x="268" y="130" fontFamily="serif" fontSize="14" fontStyle="italic" fill="#1e293b">l</text>
          </svg>
        )}

        {/* 6. HÌNH PHẲNG: TAM GIÁC VUÔNG CÓ ĐƯỜNG CAO */}
        {activeType === 'triangle_plane' && (
          <svg className="w-full max-w-[420px] h-[300px]" viewBox="0 0 420 300">
            {/* Right Triangle ABC at A */}
            <line x1="80" y1="230" x2="340" y2="230" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="80" y1="230" x2="160" y2="70" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="160" y1="70" x2="340" y2="230" stroke="#1e293b" strokeWidth="2.5" />

            {/* Altitude AH to BC */}
            <line x1="160" y1="70" x2="198" y2="230" stroke="#047857" strokeWidth="2" strokeDasharray="5,3" />

            {/* Right angle at A */}
            {/* Vector from A to B: (-80, 160), from A to C: (180, 160) */}
            <path d="M 148 94 L 164 102 L 176 78" fill="none" stroke="#1e293b" strokeWidth="1.8" />

            {/* Right angle at H */}
            <polygon points="198,216 210,216 210,230 198,230" fill="none" stroke="#047857" strokeWidth="1.5" />

            {/* Vertices */}
            <circle cx="160" cy="70" r="3.5" fill="#1e293b" />
            <circle cx="80" cy="230" r="3.5" fill="#1e293b" />
            <circle cx="340" cy="230" r="3.5" fill="#1e293b" />
            <circle cx="198" cy="230" r="3" fill="#047857" />

            {/* Labels */}
            <text x="155" y="55" fontFamily="serif" fontSize="16" fontWeight="bold">A</text>
            <text x="60" y="240" fontFamily="serif" fontSize="16" fontWeight="bold">B</text>
            <text x="350" y="240" fontFamily="serif" fontSize="16" fontWeight="bold">C</text>
            <text x="195" y="252" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#047857">H</text>
          </svg>
        )}

        <div className="text-center text-xs text-slate-500 font-sans mt-2">
          {caption ||
            (activeType === 'pyramid_quad'
              ? 'Hình minh họa. Hình chóp S.ABCD với đáy hình bình hành, đường cao SO vuông góc đáy (nét đứt là các cạnh khuất).'
              : activeType === 'pyramid_triangle'
              ? 'Hình minh họa. Hình chóp tam giác S.ABC với đường cao SH vuông góc mặt phẳng đáy (ABC).'
              : activeType === 'cuboid'
              ? "Hình minh họa. Hình hộp chữ nhật / hình lập phương ABCD.A'B'C'D' với đường chéo không gian BD'."
              : activeType === 'prism_triangle'
              ? "Hình minh họa. Hình lăng trụ tam giác ABC.A'B'C'."
              : activeType === 'cone'
              ? 'Hình minh họa. Khối nón tròn xoay đỉnh S, đường cao h, bán kính đáy r, đường sinh l.'
              : 'Hình minh họa. Tam giác vuông có đường cao AH vuông góc với cạnh huyền BC.')}
        </div>
      </div>
    </div>
  );
};
