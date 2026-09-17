import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Users,
  MessageSquare,
  Sparkles,
  Send,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

const LESSONS = [
  {
    id: "lesson-01",
    title: "Bài 1: AI Foundation & LLM Architecture",
    day: "Day 1",
    folder: "d1",
    pdfUrl: "/slides/d1-slide-hackathon.pdf",
    totalPages: 29
  },
  {
    id: "lesson-02",
    title: "Bài 2: Problem Formulation & Cost of Error",
    day: "Day 2",
    folder: "d2",
    pdfUrl: "/slides/d2-slide-hackathon.pdf",
    totalPages: 29
  }
];

const AGENT_META = {
  peer: {
    name: "Minh",
    role: "Bạn học (Ngộ nhận)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    bubble: "bg-amber-50/70 border-amber-200 text-slate-900"
  },
  ta: {
    name: "Trợ giảng Thảo",
    role: "Socratic Mentor",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    badge: "bg-blue-100 text-[#0056D2] border-blue-300",
    bubble: "bg-blue-50/70 border-blue-200 text-slate-900"
  },
  instructor: {
    name: "TS. Tuấn (GDE)",
    role: "Giảng viên",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    badge: "bg-purple-100 text-purple-900 border-purple-300",
    bubble: "bg-purple-50/80 border-purple-200 text-purple-950"
  }
};

const PROMPT_SUGGESTIONS = [
  "Theo mình hiểu ở slide này thì...",
  "Cơ chế này thực chất hoạt động là...",
  "Nhờ TA và Thầy gợi ý giúp em với!",
  "Bạn hiểu sai rồi, bản chất là..."
];

export function ClassroomView() {
  const { user, selectedLesson, setSelectedLesson, addIcapPoints } = useAuth();
  
  const currentLesson = selectedLesson || LESSONS[0];
  const [currentSlidePage, setCurrentSlidePage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(null);
  const [mobileTab, setMobileTab] = useState('slide'); // 'slide' | 'chat'
  const [zoomScale, setZoomScale] = useState(100);

  const slideScrollContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);

  // 1. Reset messages and page on lesson change
  useEffect(() => {
    setMessages([]);
    setCurrentSlidePage(1);
    if (slideScrollContainerRef.current) {
      slideScrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    triggerSlideTrack(1);
  }, [currentLesson.id]);

  // 2. Auto scroll chat feed
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  // 3. Track slide with backend API
  const triggerSlideTrack = useCallback(async (pageNum, forced = false) => {
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
        if (data.should_intervene && data.intervention) {
          const inv = data.intervention;
          const peerMsg = {
            id: `peer-${Date.now()}`,
            sender: 'peer-minh',
            text: inv.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMisconception: true
          };
          
          setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (!forced && lastMsg && lastMsg.sender === 'peer-minh' && lastMsg.isMisconception) {
              return [...prev.slice(0, -1), peerMsg];
            }
            return [...prev, peerMsg];
          });
        }
      }
    } catch (err) {
      console.warn("Slide tracking notice:", err);
    }
  }, [currentLesson.id, user?.id]);

  const currentSlidePageRef = useRef(currentSlidePage);
  useEffect(() => {
    currentSlidePageRef.current = currentSlidePage;
  }, [currentSlidePage]);

  const slideTrackDebounceTimer = useRef(null);

  const debouncedTriggerSlideTrack = useCallback((pageNum) => {
    if (slideTrackDebounceTimer.current) {
      clearTimeout(slideTrackDebounceTimer.current);
    }
    slideTrackDebounceTimer.current = setTimeout(() => {
      triggerSlideTrack(pageNum);
    }, 400);
  }, [triggerSlideTrack]);

  // 4. Stable Scroll Intersection Observer (Zero layout shifts, debounced)
  useEffect(() => {
    const container = slideScrollContainerRef.current;
    if (!container) return;

    const options = {
      root: container,
      rootMargin: '-10% 0px -40% 0px',
      threshold: [0.1, 0.3, 0.6]
    };

    const observer = new IntersectionObserver((entries) => {
      if (isScrollingProgrammatically.current) return;

      const intersectingEntries = entries.filter((e) => e.isIntersecting);
      if (intersectingEntries.length > 0) {
        intersectingEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topEntry = intersectingEntries[0];
        const page = parseInt(topEntry.target.getAttribute('data-slide-page'), 10);
        if (page && page !== currentSlidePageRef.current) {
          currentSlidePageRef.current = page;
          setCurrentSlidePage(page);
          debouncedTriggerSlideTrack(page);
        }
      }
    }, options);

    const slideElements = container.querySelectorAll('.slide-page-item');
    slideElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (slideTrackDebounceTimer.current) {
        clearTimeout(slideTrackDebounceTimer.current);
      }
    };
  }, [currentLesson.id, debouncedTriggerSlideTrack]);

  // 5. Jump to slide smoothly
  const scrollToSlide = (pageNum, forced = false) => {
    const targetPage = Math.max(1, Math.min(pageNum, currentLesson.totalPages || 29));
    currentSlidePageRef.current = targetPage;
    setCurrentSlidePage(targetPage);

    const el = document.getElementById(`slide-page-${targetPage}`);
    if (el && slideScrollContainerRef.current) {
      isScrollingProgrammatically.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 700);
    }

    triggerSlideTrack(targetPage, forced);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        scrollToSlide(currentSlidePage - 1);
      } else if (e.key === 'ArrowRight') {
        scrollToSlide(currentSlidePage + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlidePage]);

  // Submit explanation / answer
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    addIcapPoints?.(30);

    setIsTyping('ta-thao');

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id || "S1024",
          lesson_id: currentLesson.id,
          current_slide: currentSlidePage,
          messages: updatedMessages,
          user_input: text
        })
      });

      if (res.ok) {
        const data = await res.json();
        const responseList = data.ordered_responses || [];

        if (responseList.length === 0) {
          setIsTyping(null);
          return;
        }

        let delayAccumulator = 600;

        responseList.forEach((resp, idx) => {
          setTimeout(() => {
            setIsTyping(resp.sender);
            
            setTimeout(() => {
              setMessages(prev => [...prev, {
                ...resp,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);

              if (idx === responseList.length - 1) {
                setIsTyping(null);
                if (resp.sender === 'prof-tuan') {
                  confetti?.({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
                }
              }
            }, 600);

          }, delayAccumulator);

          delayAccumulator += 1200;
        });

        return;
      }
    } catch (e) {
      console.warn("Chat notice:", e);
      setIsTyping(null);
    }
  };

  const currentSlidePdf = currentLesson.pdfUrl || '/slides/d1-slide-hackathon.pdf';
  const slideFolder = currentLesson.folder || 'd1';

  return (
    <div className="bg-slate-100 text-slate-800 h-[calc(100vh-56px)] flex flex-col overflow-hidden text-left font-sans">
      
      {/* 1. TOP SUB-HEADER BAR */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 gap-3">
        
        {/* Course Switcher */}
        <div className="flex items-center gap-2.5">
          {LESSONS.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLesson(l)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                currentLesson.id === l.id
                  ? 'bg-[#0056D2] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {l.day}
            </button>
          ))}
          <span className="hidden md:inline text-sm font-bold text-slate-800 truncate max-w-sm">
            {currentLesson.title}
          </span>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
          <button
            onClick={() => setMobileTab('slide')}
            className={`px-3 py-1 rounded-md transition-all ${
              mobileTab === 'slide' ? 'bg-white text-[#0056D2] shadow-xs' : 'text-slate-600'
            }`}
          >
            Slide Bài Giảng
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-3 py-1 rounded-md transition-all ${
              mobileTab === 'chat' ? 'bg-white text-[#0056D2] shadow-xs' : 'text-slate-600'
            }`}
          >
            Lớp Học AI ({messages.length})
          </button>
        </div>

        {/* Slide Controls: Prev / Next / Page Indicator & Download */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <button 
              onClick={() => scrollToSlide(currentSlidePage - 1)}
              disabled={currentSlidePage <= 1}
              className="p-1 hover:text-blue-600 disabled:opacity-30 rounded hover:bg-slate-200 transition-colors"
              title="Trang trước (Phím ←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold px-1.5 text-slate-900 text-xs sm:text-sm">
              Trang <strong className="text-[#0056D2] text-sm sm:text-base">{currentSlidePage}</strong> / 29
            </span>
            <button 
              onClick={() => scrollToSlide(currentSlidePage + 1)}
              disabled={currentSlidePage >= 29}
              className="p-1 hover:text-blue-600 disabled:opacity-30 rounded hover:bg-slate-200 transition-colors"
              title="Trang tiếp (Phím →)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <a
            href={currentSlidePdf}
            download
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs"
            title="Tải toàn bộ file PDF slide"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Tải PDF</span>
          </a>

        </div>

      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT PANE: SCROLLABLE SLIDE DECK WITH REAL-TIME TRACKING (Dominant 7 Cols) */}
        <div className={`lg:col-span-7 h-full bg-slate-900 flex flex-col overflow-hidden relative ${
          mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Scrollable Slide List with Snap / Smooth Scroll */}
          <div 
            ref={slideScrollContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6"
          >
            {[...Array(29)].map((_, idx) => {
              const pageNumber = idx + 1;
              const isCurrent = pageNumber === currentSlidePage;
              return (
                <div 
                  key={pageNumber}
                  id={`slide-page-${pageNumber}`}
                  data-slide-page={pageNumber}
                  className={`slide-page-item max-w-4xl mx-auto rounded-xl overflow-hidden border-2 transition-colors duration-200 ${
                    isCurrent 
                      ? 'border-[#0056D2] shadow-2xl' 
                      : 'border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  {/* Slide page header label */}
                  <div className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center justify-between border-b transition-colors ${
                    isCurrent ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Layers className={`w-3.5 h-3.5 ${isCurrent ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span>Slide {pageNumber} / 29</span>
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-sans font-bold bg-[#0056D2] text-white px-2 py-0.5 rounded">
                        Đang xem
                      </span>
                    )}
                  </div>

                  {/* Crisp Slide Image */}
                  <img
                    src={`/slides/${slideFolder}/slide-${pageNumber}.png`}
                    alt={`Slide ${pageNumber}`}
                    loading={pageNumber <= 3 ? "eager" : "lazy"}
                    className="w-full h-auto object-contain bg-black block"
                  />
                </div>
              );
            })}
          </div>

          {/* Floating Slide Scroller Status Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xs text-white px-4 py-1.5 rounded-full border border-slate-700 shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 pointer-events-none z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Đang đọc: Slide {currentSlidePage} / 29</span>
          </div>

        </div>

        {/* RIGHT PANE: MULTI-AGENT CLASSROOM CHAT (5 Cols) */}
        <div className={`lg:col-span-5 h-full bg-white border-l border-slate-200 flex flex-col overflow-hidden ${
          mobileTab === 'slide' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Agent Header Ribbon */}
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900">
              <Users className="w-5 h-5 text-[#0056D2]" />
              <span>Lớp Học Tương Tác AI</span>
            </div>

            <button
              onClick={() => triggerSlideTrack(currentSlidePage, true)}
              className="text-xs font-bold text-[#0056D2] hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hỏi về Slide {currentSlidePage}</span>
            </button>
          </div>

          {/* Messages Feed with Larger Font & Clean Contrast */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40"
          >
            {messages.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0056D2] flex items-center justify-center mx-auto shadow-2xs">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900 text-base">
                  Đang theo dõi: Slide {currentSlidePage} / 29
                </div>
                <p className="text-slate-600 max-w-sm mx-auto leading-relaxed text-xs sm:text-sm">
                  Bạn hãy cuộn đọc slide bài giảng bên trái. Bạn học Minh và Trợ giảng Thảo sẽ cùng tương tác khi có khái niệm mới!
                </p>
                <button
                  onClick={() => triggerSlideTrack(currentSlidePage, true)}
                  className="px-4 py-2 bg-[#0056D2] hover:bg-[#00419e] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  Bắt đầu thảo luận Slide {currentSlidePage}
                </button>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const persona = msg.sender === 'peer-minh' ? AGENT_META.peer :
                                msg.sender === 'ta-thao' ? AGENT_META.ta :
                                msg.sender === 'prof-tuan' ? AGENT_META.instructor : null;

                return (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && persona && (
                      <img 
                        src={persona.avatar} 
                        alt={persona.name} 
                        className="w-9 h-9 rounded-full object-cover mt-0.5 shrink-0 border border-slate-300 shadow-2xs" 
                      />
                    )}

                    <div className={`max-w-[88%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      {!isUser && persona && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="font-extrabold text-slate-900">{persona.name}</span>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${persona.badge}`}>
                            {persona.role}
                          </span>
                        </div>
                      )}

                      <div className={`p-3.5 rounded-2xl text-sm sm:text-base leading-relaxed border ${
                        isUser 
                          ? 'bg-[#0056D2] text-white border-[#0056D2] rounded-tr-none font-medium shadow-xs' 
                          : `${persona?.bubble || 'bg-white border-slate-200'} rounded-tl-none shadow-xs`
                      }`}>
                        {msg.text}
                      </div>

                      {msg.citation && (
                        <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md font-mono font-bold inline-block">
                          🏷️ Tham chiếu: [{msg.citation}]
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-600 py-1.5 bg-white/80 p-2.5 rounded-xl border border-slate-200 w-fit">
                <div className="w-2 h-2 rounded-full bg-[#0056D2] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#0056D2] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#0056D2] animate-bounce [animation-delay:0.4s]" />
                <span className="font-bold text-slate-700">
                  {isTyping === 'peer-minh' ? 'Minh đang phản hồi...' : isTyping === 'ta-thao' ? 'Trợ giảng Thảo đang trả lời...' : 'TS. Tuấn đang đánh giá...'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Suggestions & Input Bar */}
          <div className="p-3.5 border-t border-slate-200 bg-white space-y-2.5 shrink-0">
            
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(s)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#0056D2] text-slate-700 rounded-lg text-xs sm:text-sm font-medium transition-colors truncate max-w-full text-left cursor-pointer border border-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Composer with Larger Typography */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập lập luận giải thích của bạn để trao đổi với lớp..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm sm:text-base text-slate-900 focus:outline-hidden focus:border-[#0056D2] focus:bg-white transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-2.5 bg-[#0056D2] hover:bg-[#00419e] disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Gửi</span>
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ClassroomView;
