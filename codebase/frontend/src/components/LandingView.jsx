import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SPECIALIZATION_INFO, LESSONS, AGENT_PERSONAS } from '../data/mockData';
import { 
  Star, 
  CheckCircle2, 
  Users, 
  Globe, 
  Award, 
  Calendar, 
  BookOpen, 
  ArrowRight, 
  Play, 
  FileText, 
  Sparkles,
  Bot,
  Layers,
  GraduationCap,
  ShieldCheck,
  Check
} from 'lucide-react';

export function LandingView() {
  const { setSelectedLesson, setActiveTab } = useAuth();

  const handleEnroll = () => {
    setSelectedLesson(LESSONS[0]);
    setActiveTab('classroom');
  };

  return (
    <div className="bg-white text-slate-800 text-left">
      
      {/* 1. COURSERA BREADCRUMB & HERO */}
      <div className="bg-[#f8fafc] border-b border-slate-200 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="text-xs text-slate-500 mb-4 flex items-center gap-1.5 flex-wrap">
            <span className="hover:underline cursor-pointer">Trang chủ</span>
            <span>&gt;</span>
            <span className="hover:underline cursor-pointer">Khoa học Máy tính</span>
            <span>&gt;</span>
            <span className="hover:underline cursor-pointer">Trí tuệ Nhân tạo</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-semibold">VLearn AI Engineering Specialization</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Header */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2] bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                  Chuyên Ngành (Specialization)
                </span>
                <span className="text-xs text-slate-500">· 2 Khóa học chuyên sâu (Day 1 & Day 2)</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {SPECIALIZATION_INFO.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                {SPECIALIZATION_INFO.subtitle}
              </p>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className="text-amber-500 font-extrabold text-sm">{SPECIALIZATION_INFO.rating}</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-slate-500 font-normal">({SPECIALIZATION_INFO.ratingCount})</span>
                </div>
                
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium"><strong>{SPECIALIZATION_INFO.enrolledCount}</strong></span>
                
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1 text-slate-600">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tiếng Việt (Có slide & transcript gốc)</span>
                </div>
              </div>

              {/* Instructor preview */}
              <div className="flex items-center gap-3 pt-2">
                <img 
                  src={SPECIALIZATION_INFO.instructors[0].avatar} 
                  alt="Instructor" 
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Giảng viên phụ trách: {SPECIALIZATION_INFO.instructors[0].name}</div>
                  <div className="text-[11px] text-slate-500">{SPECIALIZATION_INFO.instructors[0].organization}</div>
                </div>
              </div>

            </div>

            {/* Right Card: Coursera Enrollment Card */}
            <div className="lg:col-span-4">
              <div className="coursera-card rounded-2xl p-6 space-y-5 bg-white">
                
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Được cung cấp bởi</span>
                  <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#0056D2]" />
                    {SPECIALIZATION_INFO.partnerName}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleEnroll}
                    className="w-full py-3.5 rounded-lg bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Đăng Ký Học Miễn Phí</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Bao gồm 2 Slide PDF gốc và Lớp học Đa tác tử tương tác
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cấp độ</span>
                    <span className="font-semibold text-slate-800">{SPECIALIZATION_INFO.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Thời gian biểu</span>
                    <span className="font-semibold text-slate-800">4 tuần (Tự học theo nhịp độ)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chứng chỉ</span>
                    <span className="font-semibold text-slate-800">Chứng nhận hoàn thành K4</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. WHAT YOU WILL LEARN (Coursera Style Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="coursera-card rounded-2xl p-8 bg-white space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Những Gì Bạn Sẽ Học Được</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#0056D2] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Hiểu sâu bản chất cơ chế Self-Attention trong kiến trúc Transformer qua ma trận Query, Key, Value thay vì đếm từ khóa thông thường.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#0056D2] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Nắm vững phương pháp Đóng khung bài toán AI (Problem Formulation) và đánh giá chi phí rủi ro Cost of Error.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#0056D2] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Thực hành phân tích lỗi Byte-Pair Tokenization và chi phí token của tiếng Việt có dấu trong môi trường Lab.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#0056D2] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Tham gia đối thoại đa tác tử: phản biện bạn học AI, nhận dẫn dắt Socratic và củng cố kiến thức qua Protégé Effect.
              </p>
            </div>
          </div>

          {/* Skills Gain Chips */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 block mb-2">Kỹ Năng Đạt Được:</span>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATION_INFO.skillsGained.map(skill => (
                <span key={skill} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. COURSES IN THIS SPECIALIZATION (Syllabus with Real Slide Attachments) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">Chương Trình Chi Tiết</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Các Khóa Học Trong Chuyên Ngành</h2>
        </div>

        <div className="space-y-4">
          {LESSONS.map((lesson, idx) => (
            <div 
              key={lesson.id}
              className="coursera-card rounded-2xl p-6 bg-white hover:border-[#0056D2]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0056D2] bg-blue-50 px-2 py-0.5 rounded font-mono-code">
                    Khóa {idx + 1} · {lesson.week}
                  </span>
                  <span className="text-xs text-slate-400">· {lesson.duration}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{lesson.title}</h3>
                <p className="text-xs text-slate-600">{lesson.subtitle}</p>

                {/* Slide Attachment Pill */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    Slide PDF gốc: {lesson.pdfSlideUrl ? (lesson.day === 'Day 1' ? 'd1-slide-hackathon.pdf' : 'd2-slide-hackathon.pdf') : 'Slide Bài Giảng'} (29 Trang)
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setActiveTab('classroom');
                  }}
                  className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Vào Học Khóa Này</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
