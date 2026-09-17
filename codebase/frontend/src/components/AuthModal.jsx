import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, GraduationCap, ShieldCheck, Check, ArrowRight } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  
  const [role, setRole] = useState('student');
  const [studentId, setStudentId] = useState('S1024');
  const [name, setName] = useState('Đoàn Canh');
  const [cohort, setCohort] = useState('K4 AI Engineering (Hiện tại)');

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = (preset) => {
    login({
      id: preset.id,
      name: preset.name,
      role: preset.role,
      cohort: preset.cohort,
      email: `${preset.id.toLowerCase()}@vlearn.edu.vn`,
      avatar: preset.avatar,
      icapPoints: preset.points,
      resolvedMisconceptions: preset.resolved,
      streakDays: 5,
      completedLessons: ["lesson-01"]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      id: role === 'student' ? studentId : 'INSTR-01',
      name: name.trim() || (role === 'student' ? `Học viên ${studentId}` : 'Giảng viên'),
      role: role,
      cohort: cohort,
      email: `${studentId.toLowerCase()}@vlearn.edu.vn`,
      avatar: role === 'instructor' 
        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      icapPoints: 350,
      resolvedMisconceptions: 8,
      streakDays: 3,
      completedLessons: ["lesson-01"]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-800 overflow-hidden">
        
        {/* Coursera Blue Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0056D2]" />
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xl font-black text-[#0056D2] font-sans tracking-tight block mb-1">coursera</span>
          <h2 className="text-lg font-bold text-slate-900">Đăng Nhập Tài Khoản Học Tập</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn hồ sơ học viên K4 hoặc giảng viên để tham gia lớp học thích ứng.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="mb-5 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hồ sơ thử nghiệm nhanh</p>
          
          <button
            type="button"
            onClick={() => handleQuickLogin({
              id: "S1024",
              name: "Đoàn Canh (K4)",
              role: "student",
              cohort: "K4 AI Engineering",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
              points: 485,
              resolved: 12
            })}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" 
                alt="Student" 
                className="w-9 h-9 rounded-full object-cover border border-blue-200"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Đoàn Canh <span className="font-mono-code text-[10px] text-[#0056D2] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">S1024</span>
                </div>
                <div className="text-[11px] text-slate-500">Học viên K4 · 485 ICAP Points</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0056D2] group-hover:translate-x-0.5 transition-all" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin({
              id: "INSTR-01",
              name: "TS. Tuấn (GDE)",
              role: "instructor",
              cohort: "Giảng viên Phụ trách",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
              points: 1200,
              resolved: 58
            })}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                alt="Instructor" 
                className="w-9 h-9 rounded-full object-cover border border-purple-200"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  TS. Tuấn <span className="font-mono-code text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">Giảng Viên / GDE</span>
                </div>
                <div className="text-[11px] text-slate-500">Quản trị kịch bản & Analytics lớp</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Manual Form */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 text-[10px] font-semibold">Hoặc tùy chỉnh</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                role === 'student'
                  ? 'bg-blue-50 border-[#0056D2] text-[#0056D2]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Học Viên
            </button>
            <button
              type="button"
              onClick={() => setRole('instructor')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                role === 'instructor'
                  ? 'bg-purple-50 border-purple-600 text-purple-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Giảng Viên
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {role === 'student' ? 'Họ và tên học viên' : 'Họ tên giảng viên'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Đoàn Canh"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0056D2]"
            />
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mã học viên (Student ID từ pack S####)
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="VD: S1024"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-[#0056D2]"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Vào Không Gian Học Tập
          </button>
        </form>

      </div>
    </div>
  );
}
