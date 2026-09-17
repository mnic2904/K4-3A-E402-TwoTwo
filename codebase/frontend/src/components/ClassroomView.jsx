import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  FileText, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Users,
  GraduationCap,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';

const LESSON_METADATA = [
  {
    id: "lesson-01",
    title: "Bài 1: AI Foundation & LLM Architecture",
    week: "Tuần 1",
    day: "Day 1",
    pdfUrl: "/slides/d1-slide-hackathon.pdf",
    totalPages: 29
  },
  {
    id: "lesson-02",
    title: "Bài 2: Problem Formulation & Cost of Error",
    week: "Tuần 2",
    day: "Day 2",
    pdfUrl: "/slides/d2-slide-hackathon.pdf",
    totalPages: 29
  }
];

const AGENT_AVATARS = {
  instructor: {
    name: "TS. Tuấn (GDE)",
    title: "Giảng Viên & Chuyên Gia Đánh Giá",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    badge: "bg-purple-100 text-purple-800 border-purple-200"
  },
  ta: {
    name: "Trợ giảng Thảo",
    title: "Socratic Mentor & Hướng Dẫn",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    badge: "bg-blue-100 text-[#0056D2] border-blue-200"
  },
  peer: {
    name: "Minh (Bạn học)",
    title: "Bạn Cùng Lớp (Nêu Thắc Mắc & Ngộ Nhận)",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    badge: "bg-amber-100 text-amber-900 border-amber-200"
  }
};

export function ClassroomView() {
  const { user, selectedLesson, setSelectedLesson, setActiveTab, addIcapPoints, showToast } = useAuth();
  
  const currentLesson = selectedLesson || LESSON_METADATA[0];
  const [activeLessonTab, setActiveLessonTab] = useState('assistant'); // 'assistant' | 'notes'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(null);
  const [userNotes, setUserNotes] = useState(() => localStorage.getItem(`notes_${currentLesson.id}`) || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [slideZoom, setSlideZoom] = useState(100);
  const [currentSlidePage, setCurrentSlidePage] = useState(1);
  const [slidesIndex, setSlidesIndex] = useState([]);
  const [studentProfile, setStudentProfile] = useState({
    mastery_score: 40,
    level: "Beginner",
    visited_slides: [1],
    resolved_questions_count: 0
  });

  const chatContainerRef = useRef(null);

  // 1. Fetch real indexed slide titles and student profile on mount / lesson switch
  useEffect(() => {
    async function loadLessonData() {
      try {
        const resSlides = await fetch(`http://localhost:8000/api/slides/${currentLesson.id}`);
        if (resSlides.ok) {
          const dataSlides = await resSlides.json();
          setSlidesIndex(dataSlides.slides || []);
        }

        const resProfile = await fetch(`http://localhost:8000/api/student/profile?student_id=${user?.id || 'S1024'}&lesson_id=${currentLesson.id}`);
        if (resProfile.ok) {
          const dataProfile = await resProfile.json();
          setStudentProfile(dataProfile);
        }
      } catch (err) {
        console.warn("Backend slide index fetch notice:", err);
      }
    }

    loadLessonData();
    setMessages([]);
    handleSlideChange(1);
  }, [currentLesson.id]);

  // Smooth scroll ONLY inside the chat container box, preventing window jumping
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  // 2. Real-time slide tracking & automatic adaptive checkpoint triggering
  const handleSlideChange = async (newPage, forced = false) => {
    const pageNum = Math.max(1, Math.min(newPage, currentLesson.totalPages || 29));
    setCurrentSlidePage(pageNum);

    try {
      const res = await fetch('http://localhost:8000/api/track-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id || "S1024",
          lesson_id: currentLesson.id,
          slide_number: pageNum,
          time_spent_seconds: 5,
          force_trigger: forced
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.student_profile) {
          setStudentProfile(data.student_profile);
        }

        if (data.should_intervene && data.intervention) {
          const inv = data.intervention;
          const peerMsg = {
            id: `peer-${Date.now()}`,
            sender: 'peer-minh',
            text: inv.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMisconception: true,
            concept: inv.concept,
            difficulty: inv.difficulty
          };
          
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            // If previous message was already an unanswered question from peer, replace it with the new slide's question
            if (!forced && lastMsg && lastMsg.sender === 'peer-minh' && lastMsg.isMisconception) {
              return [...prev.slice(0, -1), peerMsg];
            }
            return [...prev, peerMsg];
          });
          showToast("Thảo luận thích ứng", `Minh có thắc mắc tại Slide ${pageNum} (${inv.difficulty})!`, "info");
        }
      }
    } catch (err) {
      console.warn("Slide tracking connection notice:", err);
    }
  };

  const handleAskQuestionNow = () => {
    handleSlideChange(currentSlidePage, true);
  };

  const handleSaveNotes = (val) => {
    setUserNotes(val);
    localStorage.setItem(`notes_${currentLesson.id}`, val);
  };

  // 3. Multi-agent debate & student explanation submission
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    addIcapPoints(35);

    // Call Multi-Agent API
    setIsTyping('peer-minh');

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id || "S1024",
          lesson_id: currentLesson.id,
          current_slide: currentSlidePage,
          messages: messages,
          user_input: text
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.student_profile) {
          setStudentProfile(data.student_profile);
        }
        
        // Sequential multi-agent responses
        setTimeout(() => {
          setIsTyping(null);
          if (data.peer_response) {
            setMessages(prev => [...prev, {
              ...data.peer_response,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }

          setTimeout(() => {
            setIsTyping('ta-thao');
            setTimeout(() => {
              setIsTyping(null);
              if (data.ta_response) {
                setMessages(prev => [...prev, {
                  ...data.ta_response,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
              }

              if (data.instructor_response) {
                setTimeout(() => {
                  setIsTyping('prof-tuan');
                  setTimeout(() => {
                    setIsTyping(null);
                    setMessages(prev => [...prev, {
                      ...data.instructor_response,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                    showToast("Cập nhật Mastery thành công!", "TS. Tuấn đã xác nhận lời giải thích chính xác.", "success");
                  }, 1200);
                }, 600);
              }
            }, 1200);
          }, 500);
        }, 800);

        return;
      }
    } catch (e) {
      console.warn("Backend chat notice:", e);
      setIsTyping(null);
    }
  };

  const currentSlidePdf = currentLesson.pdfUrl || '/slides/d1-slide-hackathon.pdf';
  const activeSlideInfo = slidesIndex.find(s => s.page === currentSlidePage);

  return (
    <div className="bg-[#f8fafc] text-slate-800 h-[calc(100vh-64px)] flex flex-col text-left overflow-hidden">
      
      {/* 1. COURSERA TOP PLAYER BAR */}
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 z-30">
        
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            title="Trở về My Learning"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="text-xs font-bold text-[#0056D2] uppercase tracking-wider">
              {currentLesson.week} · {currentLesson.day}
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 line-clamp-1">
              {currentLesson.title}
            </h1>
          </div>
        </div>

        {/* Live Mastery Badge & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-sm">
            <GraduationCap className="w-4 h-4 text-[#0056D2]" />
            <span className="text-slate-600 font-medium">Trình độ:</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs ${
              studentProfile.level === 'Advanced' ? 'bg-emerald-100 text-emerald-800' :
              studentProfile.level === 'Intermediate' ? 'bg-blue-100 text-[#0056D2]' : 'bg-amber-100 text-amber-800'
            }`}>
              {studentProfile.level}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Mastery:</span>
            <strong className="text-[#0056D2] font-mono-code font-extrabold">{studentProfile.mastery_score}/100</strong>
          </div>

          <a
            href={currentSlidePdf}
            download
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Slide PDF</span>
          </a>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 text-[#0056D2] hover:bg-blue-100 text-xs font-bold transition-colors"
          >
            {isSidebarOpen ? 'Ẩn mục lục' : 'Hiện mục lục'}
          </button>
        </div>

      </header>

      {/* 2. MAIN LEARNING STAGE (Sidebar + Content Viewport) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SYLLABUS & SLIDE OUTLINE SIDEBAR (Independent Scrollable Container) */}
        {isSidebarOpen && (
          <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full overflow-hidden z-20">
            
            {/* Top Lesson Selector Tabs */}
            <div className="p-3 border-b border-slate-200 bg-slate-50/80 space-y-1.5 shrink-0">
              <span className="text-xs font-extrabold text-slate-900 block uppercase tracking-wider">
                Chọn Bài Học
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {LESSON_METADATA.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLesson(l)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold text-center transition-all truncate ${
                      currentLesson.id === l.id
                        ? 'bg-[#0056D2] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {l.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Slide List Header */}
            <div className="px-4 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0056D2]" />
                <span>Mục Lục 29 Slide</span>
              </span>
              <span className="text-xs font-mono-code font-bold text-slate-500">
                {studentProfile.visited_slides?.length || 1}/29 đã xem
              </span>
            </div>

            {/* Scrollable Slide Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {slidesIndex.length > 0 ? (
                slidesIndex.map((s) => {
                  const isActive = s.page === currentSlidePage;
                  const isVisited = studentProfile.visited_slides?.includes(s.page);
                  return (
                    <button
                      key={s.page}
                      onClick={() => handleSlideChange(s.page)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                        isActive 
                          ? 'bg-blue-50/95 border border-blue-200 text-[#0056D2] shadow-2xs' 
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono-code font-bold ${
                        isActive ? 'bg-[#0056D2] text-white' : isVisited ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {s.page}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold leading-snug line-clamp-2">{s.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                            s.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border border-red-100' :
                            s.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {s.difficulty}
                          </span>
                          <span>·</span>
                          <span className="font-mono-code">{s.citation_code}</span>
                        </div>
                      </div>

                      {isVisited && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-xs text-slate-400 text-center">Đang nạp danh sách 29 slide từ PDF...</div>
              )}
            </div>
          </aside>
        )}

        {/* MAIN STAGE: Split Layout with Slide PDF Viewer & Multi-Agent Feed */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
          
          {/* A. SLIDE PDF VIEWER STAGE (Fixed Height, Responsive Controls) */}
          <div className="bg-[#1e293b] p-3 shadow-inner shrink-0">
            <div className="max-w-5xl mx-auto space-y-2">
              
              {/* Slide Controls Bar */}
              <div className="flex flex-wrap items-center justify-between text-slate-300 px-2 gap-2 text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-white text-sm">
                    {currentLesson.day === 'Day 1' ? 'd1-slide-hackathon.pdf' : 'd2-slide-hackathon.pdf'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono-code">(Trang {currentSlidePage}/29)</span>
                </div>

                {/* Page Navigator */}
                <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700 text-xs">
                  <button 
                    onClick={() => handleSlideChange(currentSlidePage - 1)}
                    disabled={currentSlidePage <= 1}
                    className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700 transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs text-slate-200 font-medium font-mono-code">
                    Slide <strong className="text-white text-sm">{currentSlidePage}</strong> / 29
                  </span>

                  <button 
                    onClick={() => handleSlideChange(currentSlidePage + 1)}
                    disabled={currentSlidePage >= 29}
                    className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700 transition-colors"
                    title="Trang tiếp theo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700 text-xs">
                    <button onClick={() => setSlideZoom(z => Math.max(z - 15, 70))} className="hover:text-white p-0.5"><ZoomOut className="w-3.5 h-3.5" /></button>
                    <span className="font-mono-code px-1 text-slate-300 font-semibold">{slideZoom}%</span>
                    <button onClick={() => setSlideZoom(z => Math.min(z + 15, 140))} className="hover:text-white p-0.5"><ZoomIn className="w-3.5 h-3.5" /></button>
                  </div>

                  <a
                    href={`${currentSlidePdf}#page=${currentSlidePage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                    title="Mở tab mới"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Embedded PDF Slide Viewer */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-2xl h-[360px] sm:h-[400px]">
                <iframe
                  key={`${currentSlidePdf}-${currentSlidePage}`}
                  src={`${currentSlidePdf}#page=${currentSlidePage}&toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                  title="Lecture Slides"
                  className="w-full h-full border-0"
                  style={{ transform: `scale(${slideZoom / 100})`, transformOrigin: 'top center' }}
                />
              </div>

            </div>
          </div>

          {/* B. MULTI-AGENT INTERACTION & NOTES PANEL (Independent Scrollable Container) */}
          <div className="bg-white border-t border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-3 flex-1 flex flex-col overflow-hidden">
              
              {/* Tabs Navigation & Current Slide Live Info */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveLessonTab('assistant')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                      activeLessonTab === 'assistant'
                        ? 'bg-[#0056D2] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Trợ Lý Đa Tác Tử</span>
                  </button>

                  <button
                    onClick={() => setActiveLessonTab('notes')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                      activeLessonTab === 'notes'
                        ? 'bg-[#0056D2] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Ghi Chú Cá Nhân</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
                  <Activity className="w-3.5 h-3.5 text-[#0056D2] animate-pulse" />
                  <span>Đang xem:</span>
                  <strong className="text-slate-900 font-bold max-w-xs truncate">
                    {activeSlideInfo?.title || `Slide ${currentSlidePage}`}
                  </strong>
                </div>
              </div>

              {/* TAB 1: MULTI-AGENT CLASSROOM FEED */}
              {activeLessonTab === 'assistant' && (
                <div className="flex-1 flex flex-col overflow-hidden space-y-2">
                  
                  {/* Internal Scrollable Messages Feed */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto space-y-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl p-4"
                  >
                    {messages.length === 0 ? (
                      <div className="py-6 text-center text-slate-500 text-sm space-y-2.5 bg-white/80 p-5 rounded-2xl border border-slate-200">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0056D2] font-bold text-xs">
                          <Activity className="w-4 h-4 animate-pulse" />
                          <span>Đang theo dõi: Slide {currentSlidePage} / 29</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {activeSlideInfo?.title || `Slide ${currentSlidePage}: Bài Giảng`}
                        </h3>
                        <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                          Bạn học Minh và Trợ giảng Thảo đang theo dõi nội dung trang này cùng bạn. Khi bạn đọc hoặc lật sang trang có khái niệm mới, AI sẽ tự động kích hoạt câu hỏi tương tác.
                        </p>
                        <button
                          onClick={handleAskQuestionNow}
                          className="px-4 py-2 bg-[#0056D2] hover:bg-[#00419e] text-white rounded-xl font-bold text-xs transition-all inline-flex items-center gap-2 shadow-xs"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Yêu cầu Bạn học Minh đặt câu hỏi về Slide {currentSlidePage}</span>
                        </button>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        const persona = msg.sender === 'peer-minh' ? AGENT_AVATARS.peer :
                                        msg.sender === 'ta-thao' ? AGENT_AVATARS.ta :
                                        msg.sender === 'prof-tuan' ? AGENT_AVATARS.instructor : null;

                        return (
                          <div 
                            key={msg.id}
                            className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isUser && persona && (
                              <img 
                                src={persona.avatar} 
                                alt={persona.name} 
                                className="w-10 h-10 rounded-full border border-slate-200 object-cover mt-1 shrink-0 shadow-2xs" 
                              />
                            )}

                            <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                              {!isUser && persona && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900">{persona.name}</span>
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${persona.badge}`}>
                                    {persona.title}
                                  </span>
                                  <span className="text-xs text-slate-400">{msg.timestamp}</span>
                                </div>
                              )}

                              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                isUser 
                                  ? 'bg-[#0056D2] text-white rounded-tr-none font-medium' 
                                  : msg.sender === 'prof-tuan'
                                  ? 'bg-purple-50 border border-purple-200 text-purple-950 rounded-tl-none font-medium'
                                  : msg.sender === 'ta-thao'
                                  ? 'bg-blue-50 border border-blue-200 text-slate-900 rounded-tl-none font-medium'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs font-normal'
                              }`}>
                                {msg.text}
                              </div>

                              {msg.citation && (
                                <div className="text-[11px] text-purple-700 bg-purple-100/70 border border-purple-200 px-2.5 py-0.5 rounded-lg font-mono-code font-bold inline-flex items-center gap-1.5 mt-1">
                                  <span>🏷️ Tham chiếu bài giảng:</span>
                                  <span className="underline">[{msg.citation}]</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}

                    {isTyping && (
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 py-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0056D2] animate-bounce" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0056D2] animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0056D2] animate-bounce [animation-delay:0.4s]" />
                        <span className="text-xs font-semibold text-slate-600">
                          {isTyping === 'peer-minh' ? 'Minh đang phản hồi...' : isTyping === 'ta-thao' ? 'Trợ giảng Thảo đang hỗ trợ...' : 'TS. Tuấn đang đánh giá...'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Input Chat Box */}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="flex items-center gap-2 bg-white border border-slate-300 rounded-2xl p-1.5 shadow-xs focus-within:border-[#0056D2] focus-within:ring-2 focus-within:ring-blue-100 transition-all shrink-0"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Nhập lập luận giải thích của bạn để hướng dẫn bạn học Minh..."
                      className="flex-1 text-sm px-4 py-2.5 bg-transparent focus:outline-hidden text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="px-5 py-2.5 bg-[#0056D2] hover:bg-[#00419e] disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>Gửi Lập Luận</span>
                    </button>
                  </form>

                </div>
              )}

              {/* TAB 2: PERSONAL NOTES */}
              {activeLessonTab === 'notes' && (
                <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
                  <span className="text-sm font-bold text-slate-700 block">Sổ tay ghi chú học tập ({currentLesson.title})</span>
                  <textarea
                    value={userNotes}
                    onChange={(e) => handleSaveNotes(e.target.value)}
                    placeholder="Ghi lại các công thức, điểm ngộ nhận cần nhớ và kinh nghiệm từ bài giảng..."
                    className="flex-1 text-sm p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#0056D2] focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  />
                  <div className="text-xs text-slate-400">Ghi chú được tự động lưu trên trình duyệt của bạn.</div>
                </div>
              )}

            </div>
          </div>

        </main>

      </div>

    </div>
  );
}
