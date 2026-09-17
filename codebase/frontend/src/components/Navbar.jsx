import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  LogOut, 
  GraduationCap, 
  Users,
  Award
} from 'lucide-react';

export function Navbar() {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    requireAuth,
    setIsAuthModalOpen, 
    logout 
  } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/90 shadow-2xs text-slate-800 h-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <span className="text-2xl font-black tracking-tighter text-[#0056D2] font-sans group-hover:opacity-90 transition-opacity">
            coursera
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2] bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/80">
            AI Academy
          </span>
        </div>

        {/* Center/Right Nav Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          <button
            onClick={() => setActiveTab('home')}
            className={`text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-[#0056D2]' : 'text-slate-600 hover:text-[#0056D2]'
            }`}
          >
            Trang Chủ
          </button>

          <button
            onClick={() => requireAuth(() => setActiveTab('classroom'))}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'classroom'
                ? 'bg-[#0056D2] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Lớp Học Đa Tác Tử</span>
          </button>

          {/* User Auth controls */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#0056D2] font-semibold font-mono">
                    {user.id || 'S1024'} · Học viên K4
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-1.5 bg-[#0056D2] hover:bg-[#00419e] text-white text-xs sm:text-sm font-bold rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Đăng Nhập Học Viên
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;
