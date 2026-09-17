import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Award, 
  Play, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Search, 
  ChevronRight, 
  FileText,
  Calendar,
  Sparkles,
  GraduationCap
} from 'lucide-react';

const COURSES = [
  {
    id: "lesson-01",
    title: "Day 1: AI Foundation & LLM Architecture",
    week: "Tuần 1",
    day: "Day 1",
    duration: "45 phút",
    totalPages: 29,
    pdfUrl: "/slides/d1-slide-hackathon.pdf"
  },
  {
    id: "lesson-02",
    title: "Day 2: Problem Formulation & Cost of Error",
    week: "Tuần 2",
    day: "Day 2",
    duration: "45 phút",
    totalPages: 29,
    pdfUrl: "/slides/d2-slide-hackathon.pdf"
  }
];

export function DashboardView() {
  const { user, setSelectedLesson, setActiveTab } = useAuth();
  const [profile, setProfile] = useState({
    mastery_score: 40,
    level: "Beginner",
    visited_slides: [1],
    resolved_questions_count: 0
  });
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const resProfile = await fetch(`http://localhost:8000/api/student/profile?student_id=${user?.id || 'S1024'}&lesson_id=lesson-01`);
        if (resProfile.ok) {
          const dataP = await resProfile.json();
          setProfile(dataP);
        }

        const resAnalytics = await fetch(`http://localhost:8000/api/analytics`);
        if (resAnalytics.ok) {
          const dataA = await resAnalytics.json();
          setAnalytics(dataA);
        }
      } catch (err) {
        console.warn("Backend fetch notice on Dashboard:", err);
      }
    }
    loadData();
  }, [user?.id]);

  const handleStart = (lesson) => {
    setSelectedLesson(lesson);
    setActiveTab('classroom');
  };

  const completedSlideCount = profile.visited_slides?.length || 1;
  const progressPercent = Math.min(100, Math.round((completedSlideCount / 29) * 100));

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-64px)] text-slate-800 text-left py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. COURSERA "MY LEARNING" WELCOME BANNER */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">Học Tập Của Tôi (My Learning)</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Chào mừng trở lại, {user?.name || "Học viên"}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Mã học viên: <span className="font-mono-code font-bold text-slate-700">{user?.id || "S1024"}</span> · Lớp K4 AI Engineering
              </p>
            </div>

            {/* Live Progress Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-center">
                <div className="text-xs font-bold text-[#0056D2]">Điểm Năng Lực (Mastery)</div>
                <div className="text-xl font-black text-[#0056D2] font-mono-code">{profile.mastery_score}/100</div>
                <div className="text-[10px] text-slate-500 font-bold">{profile.level}</div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
                <div className="text-xs font-bold text-emerald-700">Slide Đã Học</div>
                <div className="text-xl font-black text-emerald-700 font-mono-code">{completedSlideCount}/29</div>
                <div className="text-[10px] text-slate-500">{progressPercent}% hoàn thành</div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-center">
                <div className="text-xs font-bold text-amber-700">Ngộ Nhận Đã Giải</div>
                <div className="text-xl font-black text-amber-700 font-mono-code">{profile.resolved_questions_count || 0}</div>
                <div className="text-[10px] text-slate-500">Tương tác Socratic</div>
              </div>
            </div>

          </div>
        </div>

        {/* 2. IN-PROGRESS COURSE HERO CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0056D2] bg-blue-50 px-2.5 py-0.5 rounded">
                Đang học dở
              </span>
              <span className="text-xs text-slate-400">· Tuần 1 / 4</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Chương Trình Chuyên Sâu: AI Engineering & Multi-Agent Architecture
            </h2>

            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tiến độ slide bài giảng</span>
                <span className="font-bold text-slate-800 font-mono-code">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0056D2] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => handleStart(COURSES[0])}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Tiếp Tục Học: Day 1 AI Foundation</span>
            </button>
          </div>
        </div>

        {/* 3. COURSERA SPECIALIZATION COURSES LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0056D2]" />
              <span>Các Khóa Học Trong Chương Trình</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono-code">2 Khóa học chính thức</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COURSES.map((course, idx) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0056D2]">{course.week}</span>
                    <span className="text-slate-400 font-mono-code">{course.totalPages} Trang Slide</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0056D2] transition-colors">
                    {course.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {course.id === 'lesson-01' 
                      ? 'Đi sâu vào Attention Q-K-V, Softmax scaling, Token Economy và cơ chế nén ngữ cảnh của Transformer.' 
                      : 'Phân định bài toán Rule-based vs Machine Learning, tính toán Cost of Error và thiết kế Human-in-the-loop.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{course.duration}</span>
                  </div>

                  <button
                    onClick={() => handleStart(course)}
                    className="px-4 py-2 bg-slate-100 hover:bg-[#0056D2] hover:text-white text-slate-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1"
                  >
                    <span>Vào Học</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
