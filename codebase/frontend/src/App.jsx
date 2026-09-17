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
  const { activeTab, user, setActiveTab, setIsAuthModalOpen } = useAuth();

  React.useEffect(() => {
    if (!user && activeTab !== 'home') {
      setActiveTab('home');
      setIsAuthModalOpen(true);
    }
  }, [user, activeTab, setActiveTab, setIsAuthModalOpen]);

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-stone-100 text-stone-900 selection:bg-stone-200 selection:text-stone-950">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="w-full flex-1">
          {activeTab === 'home' && <LandingView />}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'classroom' && <ClassroomView />}
          {activeTab === 'productive-failure' && <ProductiveFailureView />}
          {activeTab === 'protege' && <ProtegeView />}
          {activeTab === 'instructor-studio' && <InstructorStudioView />}
        </main>
      </div>
      
      {activeTab !== 'classroom' && <Footer />}
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
