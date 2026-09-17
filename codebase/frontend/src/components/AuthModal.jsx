import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Check } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  
  const [studentId, setStudentId] = useState('S1024');
  const [name, setName] = useState('Đoàn Canh');

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = (preset) => {
    login({
      id: preset.id,
      name: preset.name,
      role: 'student',
      cohort: "K4 AI Engineering",
      email: `${preset.id.toLowerCase()}@vlearn.edu.vn`,
      avatar: preset.avatar,
      icapPoints: 485,
      resolvedMisconceptions: 3,
      streakDays: 4,
      completedLessons: ["lesson-01"]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      id: studentId.trim() || 'S1024',
      name: name.trim() || `Học viên ${studentId || 'S1024'}`,
      role: 'student',
      cohort: "K4 AI Engineering",
      email: `${(studentId.trim() || 's1024').toLowerCase()}@vlearn.edu.vn`,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      icapPoints: 485,
      resolvedMisconceptions: 3,
      streakDays: 4,
      completedLessons: ["lesson-01"]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150 text-left">
      <div className="relative w-full max-w-sm bg-white border border-stone-200 rounded-lg shadow-xl p-6 text-stone-800">
        
        {/* Close */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="text-xs font-mono font-semibold text-stone-500 uppercase tracking-wider">
            Xác thực học viên
          </div>
          <h2 className="text-base font-bold text-stone-900 mt-0.5">Đăng nhập tài khoản</h2>
        </div>

        {/* Quick preset */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => handleQuickLogin({
              id: "S1024",
              name: "Đoàn Canh",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
            })}
            className="w-full flex items-center justify-between p-3 rounded-md bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" 
                alt="Student" 
                className="w-8 h-8 rounded-full object-cover border border-stone-300"
              />
              <div>
                <div className="text-xs font-bold text-stone-900">Đoàn Canh</div>
                <div className="text-[11px] font-mono text-stone-500">ID: S1024 · K4 AI</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-stone-900">Vào học →</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-stone-400 text-[10px] font-mono uppercase">Hoặc nhập mã</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Đoàn Canh"
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-stone-600 mb-1">
              Mã số học viên
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="S1024"
              className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-md text-xs font-mono font-semibold text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Vào lớp học</span>
          </button>
        </form>

      </div>
    </div>
  );
}

export default AuthModal;
