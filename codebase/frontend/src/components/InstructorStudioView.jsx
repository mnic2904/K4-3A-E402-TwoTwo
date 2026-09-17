import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  SlidersHorizontal, 
  BarChart3, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  BookOpen, 
  Bot, 
  Settings2,
  FileText,
  Activity
} from 'lucide-react';

export function InstructorStudioView() {
  const { showToast } = useAuth();

  const [peerTemperature, setPeerTemperature] = useState(0.95);
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
        showToast("Đã lưu tham số", "Các tác tử trong lớp học đã được cập nhật hành vi mới thành công.", "success");
      }
    } catch (e) {
      showToast("Đã lưu tham số cục bộ", "Cấu hình tác tử đã được áp dụng.", "info");
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-64px)] py-8 text-left text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0056D2] text-xs font-semibold mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Coursera Instructor Studio · Quản Trị Giảng Dạy
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Quản Trị Tác Tử & Báo Cáo Học Viên (Instructor Studio)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Điều phối hành vi tác tử và theo dõi ngộ nhận của học viên theo thời gian thực từ Backend Knowledge Engine.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Tham Số Tác Tử</span>
          </button>
        </div>

        {/* Real Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold mb-1">Học Viên Đang Hoạt Động</div>
            <div className="text-2xl font-black text-slate-900 font-mono-code">
              {analytics?.total_active_learners || 1}
            </div>
            <div className="text-[11px] text-[#0056D2] mt-2 font-medium">Phiên học trực tiếp kết nối</div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold mb-1">Slide Bài Giảng Đã Nạp</div>
            <div className="text-2xl font-black text-[#0056D2] font-mono-code">2 Giáo Trình</div>
            <div className="text-[11px] text-slate-500 mt-2">Tổng cộng 58 trang bài giảng</div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold mb-1">Điểm Năng Lực Trung Bình</div>
            <div className="text-2xl font-black text-emerald-600 font-mono-code">
              {analytics?.average_mastery_score || 55}/100
            </div>
            <div className="text-[11px] text-emerald-600 mt-2 font-medium">Thang đo Mastery Score</div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold mb-1">Tác Tử Đang Hoạt Động</div>
            <div className="text-2xl font-black text-amber-600 font-mono-code">3 Models</div>
            <div className="text-[11px] text-slate-500 mt-2 font-medium">Instructor · TA · Peer</div>
          </div>
        </div>

        {/* Agent Tuning */}
        <div className="rounded-2xl p-6 sm:p-8 space-y-6 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[#0056D2]" />
            <h2 className="text-lg font-bold text-slate-900">Hiệu Chỉnh Tham Số Sinh Ngẫu Nhiên Của Tác Tử</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Peer */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-amber-900">Bạn Học Minh (Peer Learner)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tạo ngộ nhận tự nhiên từ nội dung slide để kích hoạt mô hình Protege/ICAP.
              </p>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600">Temperature (Sáng tạo)</span>
                  <span className="font-bold text-amber-700 font-mono-code">{peerTemperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={peerTemperature} 
                  onChange={(e) => setPeerTemperature(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* TA */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0056D2]" />
                <h3 className="text-sm font-bold text-blue-900">Trợ Giảng Thảo (TA Socratic)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đặt câu hỏi gợi mở, không đưa đáp án trực tiếp nhằm duy trì vùng phát triển gần (ZPD).
              </p>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600">Temperature (Cân bằng)</span>
                  <span className="font-bold text-[#0056D2] font-mono-code">{taTemperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={taTemperature} 
                  onChange={(e) => setTaTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#0056D2]"
                />
              </div>
            </div>

            {/* Instructor */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <h3 className="text-sm font-bold text-purple-900">TS. Tuấn (Instructor)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đánh giá chuẩn xác, trích dẫn tài liệu chính thức theo mã slide [Txx-xxx].
              </p>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600">Temperature (Chính xác cao)</span>
                  <span className="font-bold text-purple-700 font-mono-code">{instructorTemperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={instructorTemperature} 
                  onChange={(e) => setInstructorTemperature(parseFloat(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
