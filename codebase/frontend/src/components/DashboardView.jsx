import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Layers, 
  Clock
} from 'lucide-react';

const COURSES = [
  {
    id: "lesson-01",
    title: "Bài 1: AI Foundation & LLM Architecture",
    day: "Bài 1",
    duration: "45 phút",
    totalPages: 29,
    pdfUrl: "/slides/d1-slide-hackathon.pdf",
    tags: ["Self-Attention", "Q-K-V Matrix", "Softmax Scaling", "BPE Tokenizer"],
    description: "Kiến trúc Transformer, cơ chế Self-Attention đa đầu, hàm Softmax Scaling và bộ phân tách Byte-Pair Encoding (BPE)."
  },
  {
    id: "lesson-02",
    title: "Bài 2: Problem Formulation & Cost of Error",
    day: "Bài 2",
    duration: "50 phút",
    totalPages: 29,
    pdfUrl: "/slides/d2-slide-hackathon.pdf",
    tags: ["Problem Framing", "Cost of Error", "Rule-based vs ML", "Human-in-the-loop"],
    description: "Định hình bài toán thực tế, phân tích ma trận Cost of Error và xác định ngưỡng áp dụng Machine Learning."
  }
];

const TOPIC_MASTERY = [
  { name: "Kiến trúc Transformer & Attention", score: 85, color: "bg-[#1F6C9F]" },
  { name: "BPE Tokenizer & UTF-8 Subwords", score: 70, color: "bg-[#956400]" },
  { name: "Cơ chế Next-Token Prediction", score: 90, color: "bg-[#5E3D85]" },
  { name: "Định hình Bài toán & Cost Matrix", score: 60, color: "bg-[#346538]" }
];

export function DashboardView() {
  const { user, setSelectedLesson, setActiveTab } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('courses');
  const [profile, setProfile] = useState({
    mastery_score: 55,
    level: "Intermediate",
    visited_slides: [1, 2, 3, 14, 15],
    resolved_questions_count: 3
  });

  useEffect(() => {
    async function loadData() {
      try {
        const resProfile = await fetch(`http://localhost:8000/api/student/profile?student_id=${user?.id || 'S1024'}&lesson_id=lesson-01`);
        if (resProfile.ok) {
          const dataP = await resProfile.json();
          setProfile(dataP);
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

  const completedSlideCount = profile.visited_slides?.length || 5;
  const progressPercent = Math.min(100, Math.round((completedSlideCount / 29) * 100));

  return (
    <div className="bg-[#FBFBFA] min-h-[calc(100vh-53px)] text-[#111111] text-left py-10 sm:py-16 text-base">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Profile Header */}
        <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 sm:p-9 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-mono text-[#787774] font-bold uppercase tracking-wider">
                Hồ sơ học tập
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mt-1">
                {user?.name || "Học viên"}
              </h1>
              <p className="text-sm text-[#787774] font-mono mt-1">
                Mã định danh: <strong className="text-[#111111]">{user?.id || "S1024"}</strong>
              </p>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-3.5">
              <div className="p-4 bg-[#F7F6F3] border border-[#EAEAEA] rounded-lg text-center min-w-28">
                <div className="text-xs font-mono text-[#787774] font-bold">Điểm ICAP</div>
                <div className="text-2xl font-black font-mono text-[#111111] mt-0.5">{user?.icapPoints || 485}</div>
              </div>

              <div className="p-4 bg-[#F7F6F3] border border-[#EAEAEA] rounded-lg text-center min-w-28">
                <div className="text-xs font-mono text-[#787774] font-bold">Slide đã xem</div>
                <div className="text-2xl font-black font-mono text-[#111111] mt-0.5">{completedSlideCount}/29</div>
              </div>

              <div className="p-4 bg-[#F7F6F3] border border-[#EAEAEA] rounded-lg text-center min-w-28">
                <div className="text-xs font-mono text-[#787774] font-bold">Chuỗi học</div>
                <div className="text-2xl font-black font-mono text-[#111111] mt-0.5">3 ngày</div>
              </div>
            </div>
          </div>
        </div>

        {/* Current In-Progress Lesson Banner */}
        <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="text-xs font-mono text-[#787774] font-bold uppercase tracking-wider">
                Bài học đang tiến hành
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">
                Bài 1: AI Foundation & LLM Architecture
              </h2>
              <div className="max-w-md space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono text-[#787774]">
                  <span className="font-semibold">Tiến độ giáo trình</span>
                  <span className="font-bold text-[#111111]">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-[#EAEAEA] rounded-full overflow-hidden">
                  <div className="h-full bg-[#111111] rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStart(COURSES[0])}
              className="px-5 py-3 bg-[#111111] hover:bg-[#2A2A2A] text-white text-sm font-bold rounded-md transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-center shrink-0 shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Tiếp tục học</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-tabs */}
        <div className="flex border-b border-[#EAEAEA] gap-8 text-sm font-mono">
          <button
            onClick={() => setActiveSubTab('courses')}
            className={`pb-3 font-bold border-b-2 -mb-px transition-colors cursor-pointer uppercase tracking-wider ${
              activeSubTab === 'courses' 
                ? 'border-[#111111] text-[#111111]' 
                : 'border-transparent text-[#787774] hover:text-[#111111]'
            }`}
          >
            Giáo trình bài giảng
          </button>
          <button
            onClick={() => setActiveSubTab('mastery')}
            className={`pb-3 font-bold border-b-2 -mb-px transition-colors cursor-pointer uppercase tracking-wider ${
              activeSubTab === 'mastery' 
                ? 'border-[#111111] text-[#111111]' 
                : 'border-transparent text-[#787774] hover:text-[#111111]'
            }`}
          >
            Độ thấu hiểu (Mastery)
          </button>
          <button
            onClick={() => setActiveSubTab('labs')}
            className={`pb-3 font-bold border-b-2 -mb-px transition-colors cursor-pointer uppercase tracking-wider ${
              activeSubTab === 'labs' 
                ? 'border-[#111111] text-[#111111]' 
                : 'border-transparent text-[#787774] hover:text-[#111111]'
            }`}
          >
            Phòng thí nghiệm
          </button>
        </div>

        {/* Tab 1: Course List */}
        {activeSubTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COURSES.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-[#EAEAEA] hover:border-[#CCCCCC] rounded-lg p-7 flex flex-col justify-between space-y-5 transition-colors"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-mono text-[#787774]">
                    <span className="font-bold text-[#111111] text-sm bg-[#F7F6F3] px-2.5 py-1 rounded border border-[#EAEAEA]">{c.day}</span>
                    <span className="font-semibold">{c.duration} • {c.totalPages} slide</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#111111] leading-snug">
                    {c.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
                    {c.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.tags.map((t, idx) => (
                      <span key={idx} className="text-xs font-mono bg-[#F7F6F3] text-[#555555] px-2.5 py-1 rounded border border-[#EAEAEA]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F0F0F0] flex items-center justify-between">
                  <span className="text-xs text-[#888888] font-mono">Tác tử hỗ trợ trực tiếp</span>
                  <button
                    onClick={() => handleStart(c)}
                    className="px-4 py-2 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-bold rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Vào học</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Mastery Breakdown */}
        {activeSubTab === 'mastery' && (
          <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#111111]">
                Mức độ nắm vững theo chủ đề
              </h3>
              <p className="text-sm text-[#666666] mt-0.5">
                Tính toán dựa trên số lượt tranh biện Socratic với tác tử và kết quả bài tập Productive Failure / Protégé.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {TOPIC_MASTERY.map((topic, idx) => (
                <div key={idx} className="p-4 rounded bg-[#F7F6F3] border border-[#EAEAEA] space-y-2">
                  <div className="flex items-center justify-between text-sm font-bold text-[#111111]">
                    <span>{topic.name}</span>
                    <span className="font-mono text-base">{topic.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#EAEAEA] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${topic.color} rounded-full`}
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Labs */}
        {activeSubTab === 'labs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div 
              onClick={() => setActiveTab('failure')}
              className="bg-white border border-[#EAEAEA] hover:border-[#CCCCCC] rounded-lg p-6 space-y-3.5 cursor-pointer transition-colors"
            >
              <div className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#FBF3DB] text-[#956400] border border-[#F2E4B8] w-fit">
                Productive Failure
              </div>
              <h4 className="text-base font-bold text-[#111111]">Phòng Thí Nghiệm Subword Tokenizer</h4>
              <p className="text-sm text-[#666666] leading-relaxed">
                Dự đoán và quan sát hiện tượng phân mảnh Token tiếng Việt trên mô hình ngôn ngữ lớn LLM.
              </p>
              <div className="text-xs font-mono text-[#111111] font-bold flex items-center gap-1 pt-1">
                <span>Vào phòng thí nghiệm</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('protege')}
              className="bg-white border border-[#EAEAEA] hover:border-[#CCCCCC] rounded-lg p-6 space-y-3.5 cursor-pointer transition-colors"
            >
              <div className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#F4EFFB] text-[#5E3D85] border border-[#E4D5F7] w-fit">
                Protégé Effect
              </div>
              <h4 className="text-base font-bold text-[#111111]">Giảng Giải Khái Niệm Feynman</h4>
              <p className="text-sm text-[#666666] leading-relaxed">
                Đóng vai người hướng dẫn giải thích cho bạn học Minh để củng cố kiến thức theo bộ tiêu chí Rubric.
              </p>
              <div className="text-xs font-mono text-[#111111] font-bold flex items-center gap-1 pt-1">
                <span>Bắt đầu giảng giải</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardView;
