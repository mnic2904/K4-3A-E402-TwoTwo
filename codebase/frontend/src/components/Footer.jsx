import React from 'react';
import { Award, Globe, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-100 py-12 text-slate-600 text-xs text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-xl font-black text-[#0056D2] font-sans tracking-tight">coursera</span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Nền tảng học tập trực tuyến hàng đầu hợp tác cùng VLearn Academy & Bách Khoa AI Lab triển khai Track D.1.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Chương Trình K4</span>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li>AI & LLM Foundation</li>
              <li>Xác Định Bài Toán Cho AI</li>
              <li>Self-Attention & Transformer</li>
              <li>Tokenization & Economy</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Phương Pháp Học Tập</span>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li>ICAP Framework (Chi & Wylie, 2014)</li>
              <li>Productive Failure (Kapur, 2016)</li>
              <li>Protégé Effect (Chase et al., 2009)</li>
              <li>Socratic Multi-Agent Coaching</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Tài Nguyên Đính Kèm</span>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li>Slide PDF Day 1 (d1-slide-hackathon)</li>
              <li>Slide PDF Day 2 (d2-slide-hackathon)</li>
              <li>Transcript Bản Sạch [Txx-NNN]</li>
              <li>13.494 Chatlog Lượt Học K3/K4</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 Coursera Inc. & VLearn Adaptive Track D.1. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Điều khoản sử dụng</span>
            <span className="hover:underline cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:underline cursor-pointer">Trợ giúp học viên</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
