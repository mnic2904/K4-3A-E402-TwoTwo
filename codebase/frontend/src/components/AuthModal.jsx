import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, GraduationCap, Check, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  
  const [studentId, setStudentId] = useState('S1024');
  const [name, setName] = useState('Đoàn Canh');
  const [cohort, setCohort] = useState('K4 AI Engineering');

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = (preset) => {
    login({
      id: preset.id,
      name: preset.name,
      role: 'student',
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
      id: studentId.trim() || 'S1024',
      name: name.trim() || `Học viên ${studentId || 'S1024'}`,
      role: 'student',
      cohort: cohort,
      email: `${(studentId.trim() || 's1024').toLowerCase()}@vlearn.edu.vn`,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
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
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-2xl font-black text-[#0056D2] font-sans tracking-tight">coursera</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Học Viên
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Đăng Nhập Tài Khoản Học Viên</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Truy cập slide bài giảng và thảo luận thời gian thực với trợ giảng & bạn học AI.
          </p>
        </div>

        {/* Quick Student Preset */}
        <div className="mb-5 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đăng nhập nhanh (1 chạm)</p>
          
          <button
            type="button"
            onClick={() => handleQuickLogin({
              id: "S1024",
              name: "Đoàn Canh (K4)",
              cohort: "K4 AI Engineering",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
              points: 485,
              resolved: 12
            })}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/40 hover:bg-blue-50 border border-blue-200/80 hover:border-blue-400 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" 
                alt="Student" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  Đoàn Canh <span className="font-mono text-[10px] font-bold text-[#0056D2] bg-blue-100/70 px-1.5 py-0.2 rounded">S1024</span>
                </div>
                <div className="text-[11px] text-slate-500">K4 AI Engineering · 485 Điểm Năng Lực</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#0056D2] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Manual Form Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2.5 text-slate-400 text-[10px] font-bold">Hoặc nhập mã học viên</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên học viên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Đoàn Canh"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0056D2] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã số học viên (Student ID)
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="VD: S1024"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0056D2] focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4" />
            Vào Lớp Học Ngay
          </button>
        </form>

      </div>
    </div>
  );
}

export default AuthModal;
