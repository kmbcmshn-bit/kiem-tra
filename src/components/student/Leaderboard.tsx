import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Medal, Flame, Star, Sparkles, Award } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { students, currentStudent } = useApp();

  if (students.length === 0 || !currentStudent) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-lg">
            Chưa Có Dữ Liệu Bảng Vinh Danh
          </h3>
          <p className="text-xs text-slate-500">
            Giáo viên cần tạo lớp và tải danh sách học sinh lên hệ thống để kích hoạt bảng xếp hạng điểm thưởng XP.
          </p>
        </div>
      </div>
    );
  }

  // Sort students by XP descending
  const sortedStudents = [...students].sort((a, b) => b.xp - a.xp);
  const top10 = sortedStudents.slice(0, 10);
  const top1 = sortedStudents[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Leaderboard Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-200" />
              Bảng Vinh Danh Học Sinh {currentStudent?.className ? `Lớp ${currentStudent.className}` : 'Xuất Sắc'}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Đường Đua Tri Thức & Điểm Thưởng XP
            </h2>
            <p className="text-xs text-amber-100 max-w-lg">
              Tích lũy XP qua mỗi bài học, tiết giải bài tập củng cố và bài kiểm tra định kỳ để thăng hạng và mở khóa danh hiệu danh giá!
            </p>
          </div>

          {/* Current Student Position Callout */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center shrink-0 w-full md:w-auto">
            <div className="text-[11px] uppercase tracking-wider text-amber-100 font-semibold">
              Vị trí của bạn ({currentStudent.name})
            </div>
            <div className="flex items-center justify-center gap-3 mt-1">
              <div className="text-2xl font-black text-white">
                #{sortedStudents.findIndex(s => s.id === currentStudent.id) + 1}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold">{currentStudent.xp} XP</div>
                <div className="text-amber-200 text-[11px]">Cấp {currentStudent.level} • {currentStudent.badgeTitle}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Top 2 */}
        {sortedStudents[1] && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center order-2 md:order-1 relative">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-sm mx-auto flex items-center justify-center mb-3">
              #2
            </div>
            <img
              src={sortedStudents[1].avatar}
              alt=""
              className="w-16 h-16 rounded-full mx-auto ring-4 ring-slate-200 object-cover mb-2"
            />
            <h4 className="font-bold text-slate-900 text-sm">{sortedStudents[1].name}</h4>
            <div className="text-xs text-emerald-700 font-semibold">{sortedStudents[1].badgeTitle}</div>
            <div className="text-xs font-bold text-slate-500 mt-2 bg-slate-100 py-1 px-3 rounded-full inline-block">
              {sortedStudents[1].xp} XP
            </div>
          </div>
        )}

        {/* Top 1 (Thủ khoa) */}
        {top1 && (
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-400 p-6 shadow-md text-center order-1 md:order-2 relative -mt-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> THỦ KHOA LỚP
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-base mx-auto flex items-center justify-center mb-3 shadow-inner">
              👑 #1
            </div>
            <img
              src={top1.avatar}
              alt=""
              className="w-20 h-20 rounded-full mx-auto ring-4 ring-amber-400 object-cover mb-2"
            />
            <h4 className="font-bold text-slate-900 text-base">{top1.name}</h4>
            <div className="text-xs text-amber-800 font-bold">{top1.badgeTitle}</div>
            <div className="text-sm font-black text-amber-900 mt-2 bg-amber-200/80 py-1 px-4 rounded-full inline-block">
              {top1.xp} XP
            </div>
          </div>
        )}

        {/* Top 3 */}
        {sortedStudents[2] && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center order-3 relative">
            <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-800 font-bold text-sm mx-auto flex items-center justify-center mb-3">
              #3
            </div>
            <img
              src={sortedStudents[2].avatar}
              alt=""
              className="w-16 h-16 rounded-full mx-auto ring-4 ring-amber-600/30 object-cover mb-2"
            />
            <h4 className="font-bold text-slate-900 text-sm">{sortedStudents[2].name}</h4>
            <div className="text-xs text-emerald-700 font-semibold">{sortedStudents[2].badgeTitle}</div>
            <div className="text-xs font-bold text-slate-500 mt-2 bg-slate-100 py-1 px-3 rounded-full inline-block">
              {sortedStudents[2].xp} XP
            </div>
          </div>
        )}
      </div>

      {/* TOP 10 TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Medal className="w-4 h-4 text-emerald-600" />
            <span>Bảng Xếp Hạng Top 10 Học Sinh Xuất Sắc</span>
          </h3>
          <span className="text-xs text-slate-500">Cập nhật thời gian thực</span>
        </div>

        <div className="divide-y divide-slate-100">
          {top10.map((st, index) => {
            const isMe = st.id === currentStudent.id;
            return (
              <div
                key={st.id}
                className={`flex items-center justify-between p-3.5 sm:px-5 transition-colors ${
                  isMe ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    index === 0
                      ? 'bg-amber-400 text-amber-950'
                      : index === 1
                      ? 'bg-slate-300 text-slate-800'
                      : index === 2
                      ? 'bg-amber-700/30 text-amber-900'
                      : 'text-slate-400'
                  }`}>
                    {index + 1}
                  </div>

                  <img src={st.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />

                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{st.name}</span>
                      {isMe && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      {st.badgeTitle} • Cấp {st.level}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-xs sm:text-sm text-slate-900">
                      {st.xp} XP
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <Flame className="w-3 h-3 text-amber-500" /> Chuỗi {st.streakDays} ngày
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
