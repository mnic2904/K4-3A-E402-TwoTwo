import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LESSONS } from '../data/mockData';
import { 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

export function LandingView() {
  const { setSelectedLesson, setActiveTab, requireAuth } = useAuth();

  const handleStartLesson = (lesson) => {
    requireAuth(() => {
      setSelectedLesson(lesson);
      setActiveTab('classroom');
    });
  };

  return (
    <div className="bg-[#FBFBFA] min-h-[calc(100vh-56px)] text-[#111111] text-left py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Editorial Hero */}
        <div className="space-y-6 border-b border-[#EAEAEA] pb-16">
          <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[#787774]">
            <span className="w-2 h-2 rounded-full bg-[#111111]" />
            <span>Môi trường học tập tương tác đa tác tử</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.15]">
            Học tập qua tranh biện và phản biện đa tác tử
          </h1>

          <p className="text-lg sm:text-xl text-[#555555] leading-relaxed max-w-3xl">
            Một không gian học tập trực tiếp với giáo trình chuẩn hóa. Sinh viên không chỉ đọc slide mà chủ động tương tác với ba tác tử mô phỏng theo mô hình S-P-I-C-E để phát hiện ngộ nhận, gợi mở tư duy và chuẩn hóa kiến thức.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleStartLesson(LESSONS[0])}
              className="px-7 py-3.5 bg-[#111111] hover:bg-[#2A2A2A] text-white text-base font-bold rounded-md transition-all flex items-center gap-2.5 cursor-pointer active:scale-[0.99] shadow-xs"
            >
              <span>Bắt đầu Bài 1: AI Foundation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-3.5 bg-white hover:bg-[#F4F4F2] text-[#111111] text-base font-bold rounded-md border border-[#EAEAEA] transition-colors cursor-pointer"
            >
              Xem lộ trình học tập
            </button>
          </div>
        </div>

        {/* 3 Personas Architecture */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-bold text-[#787774]">
              Cấu trúc vai trò 3 tác tử
            </h2>
            <span className="text-xs font-mono text-[#999999]">S-P-I-C-E Framework</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Peer Card */}
            <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#FBF3DB] text-[#956400] border border-[#F2E4B8]">
                  Bạn học
                </span>
                <span className="text-xs font-mono text-[#999999]">Minh</span>
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Bạn học Minh</h3>
              <p className="text-base text-[#666666] leading-relaxed">
                Đóng vai học viên cùng lớp, đưa ra những giả định trực quan và ngộ nhận phổ biến để kích thích người học phản biện.
              </p>
            </div>

            {/* TA Card */}
            <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#E1F3FE] text-[#1F6C9F] border border-[#C5E6FC]">
                  Trợ giảng
                </span>
                <span className="text-xs font-mono text-[#999999]">Thảo</span>
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Trợ giảng Thảo</h3>
              <p className="text-base text-[#666666] leading-relaxed">
                Áp dụng phương pháp Socratic, đưa ra câu hỏi gợi mở và liên hệ thực tế giúp người học tự khám phá nguyên lý cốt lõi.
              </p>
            </div>

            {/* Instructor Card */}
            <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#F4EFFB] text-[#5E3D85] border border-[#E4D5F7]">
                  Giảng viên
                </span>
                <span className="text-xs font-mono text-[#999999]">TS. Tuấn</span>
              </div>
              <h3 className="text-lg font-bold text-[#111111]">TS. Tuấn</h3>
              <p className="text-base text-[#666666] leading-relaxed">
                Tổng kết kiến thức học thuật, viện dẫn chính xác tài liệu slide gốc theo mã trích dẫn định danh minh bạch.
              </p>
            </div>

          </div>
        </div>

        {/* Course Deck */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
            <h2 className="text-sm font-mono uppercase tracking-wider font-bold text-[#787774]">
              Danh mục giáo trình
            </h2>
            <span className="text-xs font-mono text-[#999999]">2 Học phần</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LESSONS.map((l) => (
              <div 
                key={l.id}
                className="bg-white border border-[#EAEAEA] hover:border-[#CCCCCC] rounded-lg p-7 space-y-5 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-mono text-[#787774]">
                    <span className="font-bold text-[#111111] text-sm">{l.day}</span>
                    <span className="font-semibold">{l.totalPages} trang slide</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#111111] leading-snug">
                    {l.title}
                  </h3>

                  <p className="text-base text-[#666666] leading-relaxed">
                    {l.id === 'lesson-01'
                      ? 'Kiến trúc Transformer, cơ chế Self-Attention đa đầu, Byte-Pair Encoding (BPE) và chuẩn hóa Softmax Scaling.'
                      : 'Định hình bài toán AI, ma trận Cost of Error, phân định Rule-based vs Machine Learning và phương pháp Human-in-the-loop.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0F0F0] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#888888]">Giáo trình chính thức</span>
                  <button
                    onClick={() => handleStartLesson(l)}
                    className="px-5 py-2.5 bg-[#111111] hover:bg-[#2A2A2A] text-white text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Vào lớp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default LandingView;
