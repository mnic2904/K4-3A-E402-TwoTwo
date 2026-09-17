import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  ChevronDown, 
  Bell, 
  BookOpen, 
  Award, 
  GraduationCap, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  Compass, 
  Users, 
  Sparkles,
  Layers,
  Menu,
  X
} from 'lucide-react';

export function Navbar() {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    setIsAuthModalOpen, 
    logout, 
    switchRole 
  } = useAuth();

  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-xs text-slate-800">
      
      {/* Top Banner (Coursera Announcement) */}
      <div className="bg-[#0056D2] text-white text-[11px] font-medium py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
        <span>VLearn Track D.1: Trải nghiệm học tập thích ứng qua Lớp học Mô phỏng Đa tác tử (K4 Hackathon)</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Coursera-style Logo & Explore Button */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="text-2xl font-black tracking-tighter text-[#0056D2] font-sans">
              coursera
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              VLearn
            </span>
          </div>

          {/* Explore Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsExploreOpen(!isExploreOpen)}
              className="px-3 py-2 rounded-lg bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Khám phá</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {isExploreOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                <button
                  onClick={() => { setActiveTab('home'); setIsExploreOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#0056D2]" />
                  Tổng quan Specialization
                </button>
                <button
                  onClick={() => { setActiveTab('dashboard'); setIsExploreOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-[#0056D2]" />
                  Chương trình 4 Tuần (Syllabus)
                </button>
                <button
                  onClick={() => { setActiveTab('classroom'); setIsExploreOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-[#0056D2]" />
                  Lớp học Đa tác tử (Track D1)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar (Coursera standard) */}
        <div className="hidden lg:flex flex-1 max-w-md relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Bạn muốn học gì hôm nay? (Transformer, Problem Framing...)"
            className="w-full pl-9 pr-12 py-2 bg-slate-50 border border-slate-300 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0056D2] focus:bg-white transition-all shadow-xs"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#0056D2] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#00419e]">
            <Search className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Right Navigation & User Controls */}
        <div className="flex items-center gap-3">
          
          {/* My Learning Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`hidden sm:flex items-center gap-1 text-xs font-bold transition-colors ${
              activeTab === 'dashboard' ? 'text-[#0056D2]' : 'text-slate-700 hover:text-[#0056D2]'
            }`}
          >
            <span>Học tập của tôi</span>
          </button>

          {/* Quick Classroom Launcher */}
          <button
            onClick={() => setActiveTab('classroom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'classroom'
                ? 'bg-blue-50 text-[#0056D2] border border-blue-200'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#0056D2]" />
            <span>Vào Học (D1)</span>
          </button>

          {user?.role === 'instructor' && (
            <button
              onClick={() => setActiveTab('instructor-studio')}
              className={`hidden md:flex px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                activeTab === 'instructor-studio'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              Studio Giảng Viên
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              
              {/* ICAP Score Badge */}
              <div className="hidden xl:flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 text-[#0056D2] text-xs font-bold font-mono-code">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{user.icapPoints} pts</span>
              </div>

              {/* Role switch pill */}
              <button
                onClick={() => switchRole(user.role === 'student' ? 'instructor' : 'student')}
                title="Đổi vai trò Học viên / Giảng viên"
                className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
              >
                {user.role === 'instructor' ? <ShieldCheck className="w-3 h-3 text-purple-600" /> : <GraduationCap className="w-3 h-3 text-[#0056D2]" />}
                <span>{user.role === 'instructor' ? 'Giảng viên' : user.id}</span>
              </button>

              {/* User Avatar */}
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />

              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold rounded-lg shadow-xs transition-all active:scale-95"
            >
              Đăng Nhập
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
