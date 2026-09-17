import React, { createContext, useContext, useState, useEffect } from 'react';
import { LESSONS } from '../data/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vlearn_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      id: "S1024",
      name: "Đoàn Canh",
      role: "student", // 'student' | 'instructor'
      cohort: "K4 AI Engineering",
      email: "canh.dt@vlearn.edu.vn",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      icapPoints: 485,
      resolvedMisconceptions: 12,
      streakDays: 5,
      completedLessons: ["lesson-01"]
    };
  });

  const [activeTab, setActiveTab] = useState("home");
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[0]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('vlearn_user', JSON.stringify(user));
    }
  }, [user]);

  const showToast = (title, message, type = "info") => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    showToast("Đăng nhập thành công", `Chào mừng ${userData.name} tham gia VLearn!`, "success");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vlearn_user');
    setActiveTab("home");
    showToast("Đã đăng xuất", "Hẹn gặp lại bạn trong buổi học tới.", "info");
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = {
      ...user,
      role: newRole,
      name: newRole === "instructor" ? "TS. Đoàn Canh (Giảng viên)" : "Đoàn Canh",
      avatar: newRole === "instructor" 
        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };
    setUser(updated);
    showToast("Đổi vai trò", `Đã chuyển sang chế độ ${newRole === "instructor" ? "Giảng viên / Quản trị" : "Học viên"}`, "success");
  };

  const addIcapPoints = (pts) => {
    if (!user) return;
    setUser(prev => ({
      ...prev,
      icapPoints: prev.icapPoints + pts
    }));
  };

  const recordMisconceptionResolved = () => {
    if (!user) return;
    setUser(prev => ({
      ...prev,
      resolvedMisconceptions: (prev.resolvedMisconceptions || 0) + 1,
      icapPoints: prev.icapPoints + 50
    }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      switchRole,
      activeTab,
      setActiveTab,
      selectedLesson,
      setSelectedLesson,
      isAuthModalOpen,
      setIsAuthModalOpen,
      toastMessage,
      showToast,
      addIcapPoints,
      recordMisconceptionResolved
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
