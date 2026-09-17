import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { ClassroomView } from './components/ClassroomView';
import { ProductiveFailureView } from './components/ProductiveFailureView';
import { ProtegeView } from './components/ProtegeView';
import { InstructorStudioView } from './components/InstructorStudioView';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

function MainLayout() {
  const { activeTab } = useAuth();

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-[#f8fafc] text-slate-800 selection:bg-blue-600/20 selection:text-[#0056D2]">
      <div>
        <Navbar />
        <main className="w-full">
          {activeTab === 'home' && <LandingView />}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'classroom' && <ClassroomView />}
          {activeTab === 'productive-failure' && <ProductiveFailureView />}
          {activeTab === 'protege' && <ProtegeView />}
          {activeTab === 'instructor-studio' && <InstructorStudioView />}
        </main>
      </div>
      
      <Footer />
      <AuthModal />
      <Toast />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
