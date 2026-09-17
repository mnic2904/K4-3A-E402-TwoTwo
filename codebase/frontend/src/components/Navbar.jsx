import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#EAEAEA] h-14 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        
        {/* Left: Clean Brand Logo */}
        <div 
          onClick={() => setActiveTab('classroom')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-7 h-7 rounded bg-[#111111] text-white flex items-center justify-center font-bold text-sm font-mono">
            V
          </div>
          <span className="text-lg font-black tracking-tight text-[#111111]">
            VLearn
          </span>
        </div>

        {/* Center: Main Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('classroom')}
            className={`px-3.5 py-1.5 rounded-md text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'classroom'
                ? 'bg-[#111111] text-white'
                : 'text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F2]'
            }`}
          >
            Lớp học
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-md text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#111111] text-white'
                : 'text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F2]'
            }`}
          >
            Giáo trình
          </button>

          <button
            onClick={() => requireAuth(() => setActiveTab('dashboard'))}
            className={`px-3.5 py-1.5 rounded-md text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#111111] text-white'
                : 'text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F2]'
            }`}
          >
            Hồ sơ học tập
          </button>
        </nav>

        {/* Right: User Status */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5 text-sm">
              <div 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity px-2.5 py-1 rounded-md border border-[#EAEAEA] bg-[#FAFAFA]"
              >
                <img 
                  src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"} 
                  alt={user.name} 
                  className="w-6 h-6 rounded-full object-cover border border-[#EAEAEA]"
                />
                <span className="font-bold text-[#111111]">
                  {user.name}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FBF3DB] text-[#956400] border border-[#F2E4B8] font-bold">
                  {user.icapPoints || 485} ICAP
                </span>
              </div>

              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded hover:bg-[#F4F4F2] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs sm:text-sm font-bold rounded-md transition-colors cursor-pointer"
            >
              Đăng nhập
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
