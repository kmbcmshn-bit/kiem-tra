import React from 'react';
import { GraduationCap, ShieldCheck, Heart, Sparkles, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                LMS EduSmart • Hệ Thống Kiểm Tra Trực Tuyến & Tự Học
              </div>
              <p className="text-xs text-slate-500">
                Chuẩn đổi mới phương pháp kiểm tra đánh giá theo Chương trình GDPT 2018
              </p>
            </div>
          </div>

          {/* Copyright & Author */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-slate-600">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Được phát triển bởi Thầy Trịnh Tuấn Kiệt</span>
            </div>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500">Bản quyền © 2026 EduSmart LMS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
