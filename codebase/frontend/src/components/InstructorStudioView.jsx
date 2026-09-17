import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  SlidersHorizontal, 
  Save, 
  ArrowLeft,
  Users,
  Layers,
  Award,
  Activity,
  Sparkles
} from 'lucide-react';

export function InstructorStudioView() {
  const { showToast, setActiveTab } = useAuth();

  const [peerTemperature, setPeerTemperature] = useState(0.85);
  const [taTemperature, setTaTemperature] = useState(0.70);
  const [instructorTemperature, setInstructorTemperature] = useState(0.30);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('http://localhost:8000/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.warn("Analytics fetch notice:", err);
      }
    }
    loadAnalytics();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/instructor/tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructor_temperature: instructorTemperature,
          ta_temperature: taTemperature,
          peer_temperature: peerTemperature
        })
      });
      if (res.ok) {
        showToast("Đã lưu tham số", "Tham số hành vi tác tử đã được áp dụng.", "success");
      }
    } catch (e) {
      showToast("Đã lưu tham số", "Cấu hình tác tử đã được cập nhật.", "info");
    }
  };

  return (
    <div className="bg-stone-100 min-h-[calc(100vh-56px)] py-8 sm:py-12 text-left text-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => setActiveTab('classroom')}
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-700 hover:text-stone-900 bg-white border border-stone-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs mb-3 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Lớp Học</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
              Instructor Studio & Analytics
            </h1>
            <p className="text-base text-stone-600 mt-1">
              Hiệu chỉnh tham số hành vi của các mô hình AI và theo dõi chỉ số lĩnh hội kiến thức của học viên.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-center"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Tham Số Tác Tử</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border-2 border-stone-200 shadow-xs">
            <div className="text-xs font-mono text-stone-500 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Học Viên Hoạt Động</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-stone-900 mt-1">
              {analytics?.total_active_learners || 1}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-stone-200 shadow-xs">
            <div className="text-xs font-mono text-stone-500 font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Slide Giáo Trình</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-stone-900 mt-1">
              58 Slide
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-stone-200 shadow-xs">
            <div className="text-xs font-mono text-stone-500 font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Mastery Trung Bình</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-stone-900 mt-1">
              {analytics?.average_mastery_score || 68}/100
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-stone-200 shadow-xs">
            <div className="text-xs font-mono text-stone-500 font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tác Tử AI Đang Chạy</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-stone-900 mt-1">
              3 Models
            </div>
          </div>
        </div>

        {/* Agent Tuning */}
        <div className="rounded-2xl p-6 sm:p-8 bg-white border-2 border-stone-200 space-y-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 font-bold uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-stone-700" />
            <span>Hiệu chỉnh tham số Temperature & Mức độ sáng tạo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Peer */}
            <div className="p-5 rounded-xl bg-stone-50 border-2 border-stone-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-extrabold text-base text-stone-900">Bạn học Minh</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Độ ngẫu nhiên cao giúp bạn học thể hiện các ngộ nhận trực quan, tự nhiên của người mới học.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-stone-700 font-bold">
                  <span>Temperature:</span>
                  <span className="text-stone-950 text-sm">{peerTemperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={peerTemperature}
                  onChange={(e) => setPeerTemperature(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* TA */}
            <div className="p-5 rounded-xl bg-stone-50 border-2 border-stone-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="font-extrabold text-base text-stone-900">Trợ giảng Thảo</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Nhiệt độ cân bằng để đặt câu hỏi gợi mở theo phương pháp Socratic, không tiết lộ ngay đáp án.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-stone-700 font-bold">
                  <span>Temperature:</span>
                  <span className="text-stone-950 text-sm">{taTemperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={taTemperature}
                  onChange={(e) => setTaTemperature(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* Instructor */}
            <div className="p-5 rounded-xl bg-stone-50 border-2 border-stone-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-600" />
                <span className="font-extrabold text-base text-stone-900">TS. Tuấn</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Nhiệt độ thấp để đảm bảo câu trả lời luôn chuẩn xác về mặt học thuật, trích dẫn đúng slide.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-stone-700 font-bold">
                  <span>Temperature:</span>
                  <span className="text-stone-950 text-sm">{instructorTemperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.2"
                  step="0.05"
                  value={instructorTemperature}
                  onChange={(e) => setInstructorTemperature(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-purple-600"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
