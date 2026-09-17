import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LESSONS } from '../data/mockData';
import { 
  BookOpen, 
  ArrowRight, 
  Play, 
  FileText, 
  Users,
  Sparkles,
  Layers,
  GraduationCap,
  MessageSquare,
  Compass,
  CheckCircle2,
  HelpCircle,
  BrainCircuit,
  Bot
} from 'lucide-react';

export function LandingView() {
  const { setSelectedLesson, setActiveTab, requireAuth } = useAuth();
  const [activePreviewTab, setActivePreviewTab] = useState('dialogue');

  const handleStartLesson = (lesson) => {
    requireAuth(() => {
      setSelectedLesson(lesson);
      setActiveTab('classroom');
    });
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 min-h-[calc(100vh-56px)] flex flex-col justify-between text-left selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. HERO SECTION: ACADEMIC & HIGH-END EDITORIAL */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-12 border-b border-slate-200/80 bg-white">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl space-y-5">
            
            {/* Academic Series Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0056D2] text-xs font-bold tracking-tight">
              <span className="w-2 h-2 rounded-full bg-[#0056D2] animate-pulse" />
              <span>Coursera Advanced Deep Learning Series</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Học AI Chuyên Sâu Cùng <br className="hidden sm:inline" />
              <span className="text-[#0056D2]">Lớp Học Đa Tác Tử</span> Thích Ứng
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Đọc slide bài giảng chuyên sâu kết hợp tương tác thời gian thực cùng Bạn học AI (phản biện ngộ nhận), Trợ giảng Socratic (gợi mở tư duy) và Giảng viên (chuẩn hóa kiến thức).
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#0056D2] font-bold">
                  2
                </div>
                <span>Giáo Trình Chuyên Sâu</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold">
                  58
                </div>
                <span>Trang Slide Trực Quan</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700 font-bold">
                  3
                </div>
                <span>Tác Tử Đồng Hành</span>
              </div>
            </div>

          </div>

          {/* 2. SIGNATURE INTERACTIVE CLASSROOM PREVIEW (ĐIỂM NHẤN SẢN PHẨM) */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-xl overflow-hidden">
            
            {/* Classroom Preview Header */}
            <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-300 font-bold ml-2">Mô Phỏng Trải Nghiệm Lớp Học Thực Tế</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Cơ chế Socratic & Phản Biện Ngộ Nhận</span>
              </div>
            </div>

            {/* Simulation Preview Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950">
              
              {/* Left Excerpt: Slide Snippet */}
              <div className="lg:col-span-5 p-5 sm:p-6 space-y-4 bg-slate-900/50">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Slide 15 / 29 · Day 1</span>
                  <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded text-[10px]">Self-Attention</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs sm:text-sm text-slate-200 space-y-2">
                  <div className="text-amber-400 font-bold">Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k) · V</div>
                  <p className="text-[12px] text-slate-400 font-sans leading-relaxed">
                    Khám phá lý do tại sao phép chia cho căn bậc hai của chiều không gian vector đặc trưng (√d_k) là điều kiện sống còn để tránh bão hòa gradient.
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 font-sans">
                  <div className="font-semibold text-slate-300">Đặc tính độc quyền:</div>
                  <div className="flex items-center gap-2">✓ Tự động trích xuất ngữ cảnh slide khi học viên cuộn trang</div>
                  <div className="flex items-center gap-2">✓ Tác tử nắm bắt toàn bộ tiến trình học tập</div>
                </div>
              </div>

              {/* Right Excerpt: Multi-Agent Conversation */}
              <div className="lg:col-span-7 p-5 sm:p-6 space-y-3.5 bg-slate-950">
                
                {/* Peer Minh */}
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-left space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Bạn học Minh (Ngộ nhận)
                    </span>
                    <span className="text-amber-500/70 font-mono">14:02</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    "Cậu ơi, sao Softmax scaling lại cần chia cho √d_k làm gì cho phức tạp nhỉ? Mình cứ nhân thẳng Q·Kᵀ thì đâu có mất mát thông tin gì?"
                  </p>
                </div>

                {/* Socratic TA Thảo */}
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-800/40 text-left space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Trợ giảng Thảo (Socratic Mentor)
                    </span>
                    <span className="text-blue-500/70 font-mono">14:03</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    "Minh thử nghĩ xem: Khi d_k rất lớn (ví dụ 512 chiều), tích vô hướng sẽ lớn đến mức nào? Và hàm Softmax ở những giá trị cực lớn sẽ có đạo hàm (gradient) tiến về bao nhiêu?"
                  </p>
                </div>

                {/* Instructor TS. Tuấn */}
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-left space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      TS. Tuấn (Giảng viên)
                    </span>
                    <span className="text-purple-400/70 font-mono">14:04</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    "Chuẩn xác! Đó chính là hiện tượng <em>Vanishing Gradient</em>. Phép chia √d_k giúp đưa phương sai của tích về chuẩn 1, giữ cho mô hình huấn luyện ổn định."
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 3. COURSES CURRICULUM GRID */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">Chương Trình Đào Tạo</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Chọn Bài Giảng Để Bắt Đầu Học Ngay
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Bao gồm 2 Module chuyên sâu · 58 trang slide bài giảng</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LESSONS.map((lesson, idx) => (
            <div 
              key={lesson.id}
              className="bg-white border border-slate-200 hover:border-[#0056D2] rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0056D2] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80">
                    {lesson.week} · {lesson.day}
                  </span>
                  <span className="text-slate-500 font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-md">
                    29 Trang Bài Giảng
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#0056D2] transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {lesson.id === 'lesson-01' 
                      ? 'Đi sâu vào cơ chế Self-Attention Q-K-V, Byte-Pair Encoding (BPE), Softmax Scaling và tính toán kinh tế Token trong các hệ thống LLM hiện đại.'
                      : 'Đóng khung bài toán AI, phương pháp phân định Rule-based vs Machine Learning, tính toán Cost of Error và thiết kế vòng lặp Human-in-the-loop.'}
                  </p>
                </div>

                {/* Key Concepts Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lesson.id === 'lesson-01' ? (
                    <>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">Q-K-V Attention</span>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">Softmax Scaling</span>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">BPE Tokenizer</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">Problem Framing</span>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">Cost of Error</span>
                      <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">Human-in-the-loop</span>
                    </>
                  )}
                </div>

              </div>

              <button
                onClick={() => handleStartLesson(lesson)}
                className="w-full py-3.5 rounded-xl bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Vào Lớp Học: {lesson.day}</span>
              </button>
            </div>
          ))}
        </div>

      </section>

      {/* 4. FOOTER NOTE */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>Coursera AI Academy © 2026. Tất cả quyền được bảo lưu.</div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Mô hình đào tạo Socratic</span>
            <span>·</span>
            <span>Đồng hành cùng học viên</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingView;
