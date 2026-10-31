import React from 'react';
import { MathText } from './MathText';

interface StatisticsTableProps {
  title?: string;
  data?: {
    interval: string;
    frequency: number;
    relativeFreq?: string;
    midpoint?: number;
  }[];
}

export const TextbookStatisticsTable: React.FC<StatisticsTableProps> = ({
  title = 'Bảng số liệu ghép nhóm thời gian tự học (phút/ngày) - Chuẩn SGK Toán 12',
  data = [
    { interval: '[40; 50)', frequency: 5, relativeFreq: '11.1%', midpoint: 45 },
    { interval: '[50; 60)', frequency: 12, relativeFreq: '26.7%', midpoint: 55 },
    { interval: '[60; 70)', frequency: 18, relativeFreq: '40.0%', midpoint: 65 },
    { interval: '[70; 80)', frequency: 8, relativeFreq: '17.8%', midpoint: 75 },
    { interval: '[80; 90)', frequency: 2, relativeFreq: '4.4%', midpoint: 85 },
  ],
}) => {
  const total = data.reduce((acc, cur) => acc + cur.frequency, 0);

  // Compute sample mean
  const weightedSum = data.reduce((acc, cur) => acc + cur.frequency * (cur.midpoint || 0), 0);
  const meanNum = total > 0 ? weightedSum / total : 0;
  const mean = meanNum.toFixed(2);

  // Compute sample variance s^2 = 1/n * sum(n_i * (c_i - mean)^2)
  const varianceSum = data.reduce(
    (acc, cur) => acc + cur.frequency * Math.pow((cur.midpoint || 0) - meanNum, 2),
    0
  );
  const varianceNum = total > 0 ? varianceSum / total : 0;
  const variance = varianceNum.toFixed(2);
  const stdDev = Math.sqrt(varianceNum).toFixed(2);

  return (
    <div className="my-4 rounded-2xl border-2 border-slate-700 bg-white p-4 shadow-sm font-serif">
      <div className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wide mb-3 flex flex-wrap items-center justify-between border-b border-slate-300 pb-2">
        <span className="text-emerald-950 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs" />
          Bảng Thống Kê Ghép Nhóm Chuẩn SGK (GDPT 2018)
        </span>
        <span className="text-slate-600 text-xs font-mono bg-slate-100 px-2.5 py-0.5 rounded border border-slate-300 font-bold">
          Quy chuẩn Toán 12
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse border-2 border-slate-800 text-sm font-serif">
          <thead className="bg-slate-100 font-sans font-bold text-slate-900 border-b-2 border-slate-800">
            <tr>
              <th className="border-2 border-slate-800 p-2.5 text-left pl-4 text-xs sm:text-sm">
                Khoảng biến lượng <MathText content="$[a; b)$" size="sm" />
              </th>
              <th className="border-2 border-slate-800 p-2.5 text-xs sm:text-sm">
                Giá trị đại diện <MathText content="$c_i$" size="sm" />
              </th>
              <th className="border-2 border-slate-800 p-2.5 text-xs sm:text-sm">
                Tần số <MathText content="$n_i$" size="sm" />
              </th>
              <th className="border-2 border-slate-800 p-2.5 text-xs sm:text-sm">
                Tần số tương đối <MathText content="$f_i$" size="sm" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-800">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 font-medium">
                <td className="border-2 border-slate-800 p-2.5 font-bold text-left pl-4 text-slate-900 text-sm sm:text-base">
                  <MathText content={row.interval} size="md" />
                </td>
                <td className="border-2 border-slate-800 p-2.5 font-mono text-slate-800 text-sm sm:text-base font-bold">
                  {row.midpoint}
                </td>
                <td className="border-2 border-slate-800 p-2.5 font-bold text-emerald-900 font-mono text-sm sm:text-base">
                  {row.frequency}
                </td>
                <td className="border-2 border-slate-800 p-2.5 text-slate-700 font-mono text-sm sm:text-base">
                  {row.relativeFreq || '-'}
                </td>
              </tr>
            ))}
            <tr className="bg-emerald-50/80 font-sans font-extrabold text-slate-950 border-t-2 border-slate-800">
              <td className="border-2 border-slate-800 p-2.5 text-left pl-4 uppercase text-xs sm:text-sm">
                Tổng cộng (Cỡ mẫu n)
              </td>
              <td className="border-2 border-slate-800 p-2.5 text-slate-400">-</td>
              <td className="border-2 border-slate-800 p-2.5 font-mono text-emerald-950 font-black text-base">
                {total}
              </td>
              <td className="border-2 border-slate-800 p-2.5 font-mono text-emerald-950 font-black">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 p-3 bg-slate-50/90 rounded-xl border border-slate-300 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-3 font-sans">
        <span className="text-slate-700 italic font-medium">{title}</span>
        <div className="flex flex-wrap items-center gap-3 font-semibold">
          <span className="text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
            Trung bình: <MathText content={`$\\bar{x} \\approx ${mean}$`} size="md" />
          </span>
          <span className="text-sky-950 bg-white px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs">
            Phương sai: <MathText content={`$s^2 \\approx ${variance}$`} size="md" />
          </span>
          <span className="text-indigo-950 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
            Độ lệch chuẩn: <MathText content={`$s \\approx ${stdDev}$`} size="md" />
          </span>
        </div>
      </div>
    </div>
  );
};
