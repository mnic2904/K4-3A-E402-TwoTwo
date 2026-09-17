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
              Nền tảng học tập trực tuyến hàng đầu thế giới, trang bị kiến thức công nghệ AI thực chiến cùng các chuyên gia hàng đầu.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Chương Trình Đào Tạo</span>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li>AI & LLM Architecture</li>
              <li>Xác Định Bài Toán Cho AI</li>
              <li>Self-Attention & Transformer</li>
              <li>Token Economy & Optimization</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Phương Pháp Socratic</span>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li>Mô hình tương tác ICAP Framework</li>
              <li>Thực hành Productive Failure</li>
              <li>Dạy lại kiến thức (Protégé Effect)</li>
              <li>Hệ thống tác tử thông minh thích ứng</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Tài Nguyên Khóa Học</span>
            <ul className="space-y-1.5 text-[11px] text-slate-500">
              <li>Slide bài giảng AI Foundation (29 trang)</li>
              <li>Slide bài giảng Problem Formulation (29 trang)</li>
              <li>Tài liệu trích dẫn & thuật ngữ chuyên môn</li>
              <li>Không gian thảo luận cộng đồng</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 Coursera Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Điều khoản sử dụng</span>
            <span className="hover:underline cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:underline cursor-pointer">Trung tâm trợ giúp</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
