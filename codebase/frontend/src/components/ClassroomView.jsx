import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Send, 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  X,
  RotateCcw,
  BookOpen,
  Volume2,
  Bookmark,
  FileText,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';

const LESSONS = [
  {
    id: "lesson-01",
    title: "Bài 1: AI Foundation & LLM Architecture",
    day: "Bài 1",
    folder: "d1",
    pdfUrl: "/slides/d1-slide-hackathon.pdf",
    totalPages: 29
  },
  {
    id: "lesson-02",
    title: "Bài 2: Problem Formulation & Cost of Error",
    day: "Bài 2",
    folder: "d2",
    pdfUrl: "/slides/d2-slide-hackathon.pdf",
    totalPages: 29
  }
];

const AGENT_CONFIG = {
  peer: {
    id: "peer-minh",
    name: "Minh",
    role: "Bạn học",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    borderAccent: "border-l-4 border-l-[#956400]",
    roleBadge: "bg-[#FBF3DB] text-[#956400] border-[#F2E4B8] font-bold text-xs",
    cardBg: "bg-white border-[#EAEAEA]"
  },
  ta: {
    id: "ta-thao",
    name: "Trợ giảng Thảo",
    role: "Trợ giảng",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    borderAccent: "border-l-4 border-l-[#1F6C9F]",
    roleBadge: "bg-[#E1F3FE] text-[#1F6C9F] border-[#C5E6FC] font-bold text-xs",
    cardBg: "bg-white border-[#EAEAEA]"
  },
  instructor: {
    id: "prof-tuan",
    name: "TS. Tuấn",
    role: "Giảng viên",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    borderAccent: "border-l-4 border-l-[#5E3D85]",
    roleBadge: "bg-[#F4EFFB] text-[#5E3D85] border-[#E4D5F7] font-bold text-xs",
    cardBg: "bg-[#FCFAFF] border-[#EAEAEA]"
  }
};

const FAST_ACTIONS = [
  { label: "Ví dụ thực tế", prompt: "Nhờ Trợ giảng Thảo đưa ra một ví dụ thực tế liên hệ để em dễ hiểu hơn với ạ!" },
  { label: "Tổng kết học thuật", prompt: "Nhờ TS. Tuấn tổng kết giúp em bản chất học thuật và công thức chuẩn của slide này với ạ!" },
  { label: "Phản biện bạn Minh", prompt: "Bạn Minh hiểu chưa đúng chỗ này rồi, vì theo lý thuyết ở slide..." },
  { label: "Câu hỏi kiểm tra", prompt: "Nhờ TS. Tuấn đặt một câu hỏi thử thách để kiểm tra mức độ hiểu sâu của em về slide này với ạ!" }
];

export function ClassroomView() {
  const { user, selectedLesson, setSelectedLesson, addIcapPoints, showToast } = useAuth();
  
  const currentLesson = selectedLesson || LESSONS[0];
  const [currentSlidePage, setCurrentSlidePage] = useState(1);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(null);
  const [mobileTab, setMobileTab] = useState('slide');
  const [zoomScale, setZoomScale] = useState(100);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeNotesOpen, setActiveNotesOpen] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [savedNotes, setSavedNotes] = useState(() => {
    return localStorage.getItem(`notes_${currentLesson.id}`) || '';
  });

  const slideScrollContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isScrollingProgrammatically = useRef(false);

  // Reset on lesson switch
  useEffect(() => {
    setMessages([]);
    setCurrentSlidePage(1);
    if (slideScrollContainerRef.current) {
      slideScrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    triggerSlideTrack(1);
  }, [currentLesson.id]);

  // Save notes to storage
  const handleSaveNote = (text) => {
    setSavedNotes(text);
    localStorage.setItem(`notes_${currentLesson.id}`, text);
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([savedNotes || "# Ghi chú bài học\n\nChưa có ghi chú nào."], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VLearn_GhiChu_${currentLesson.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast?.("Đã tải xuống", "File ghi chú Markdown đã được lưu về máy.", "success");
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(savedNotes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
    showToast?.("Đã sao chép", "Nội dung ghi chú đã được lưu vào clipboard.", "info");
  };

  const handleInsertTimestampNote = () => {
    const timestampTag = `\n\n### Ghi chú Slide ${currentSlidePage} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}):\n- `;
    const newNotes = (savedNotes || '') + timestampTag;
    handleSaveNote(newNotes);
  };

  // Auto scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  // Track slide
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

  // Scroll Intersection Observer
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

  // Jump to slide
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
    setIsDrawerOpen(false);
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

  // Text-to-speech voice read aloud
  const handleReadAloud = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = speechRate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = (msgId) => {
    setBookmarks(prev => 
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  // Send message
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

        let delayAccumulator = 250;

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
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                }
              }
            }, 250);

          }, delayAccumulator);

          delayAccumulator += 650;
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
    <div className="bg-[#F4F4F2] text-[#111111] h-[calc(100vh-53px)] flex flex-col overflow-hidden text-left font-sans text-base">
      
      {/* 1. TOP SUBHEADER BAR */}
      <div className="bg-white border-b border-[#EAEAEA] px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 gap-4 z-20">
        
        {/* Left: Lesson Selector & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F7F6F3] p-1 rounded border border-[#EAEAEA]">
            {LESSONS.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLesson(l)}
                className={`px-3.5 py-1.5 rounded text-sm font-bold transition-all cursor-pointer ${
                  currentLesson.id === l.id
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                {l.day}
              </button>
            ))}
          </div>

          <span className="hidden md:inline text-base font-extrabold text-[#111111] truncate max-w-md">
            {currentLesson.title}
          </span>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden items-center bg-[#F7F6F3] p-1 rounded text-xs font-semibold border border-[#EAEAEA]">
          <button
            onClick={() => setMobileTab('slide')}
            className={`px-3 py-1 rounded transition-all ${
              mobileTab === 'slide' ? 'bg-[#111111] text-white font-bold' : 'text-[#666666]'
            }`}
          >
            Slide
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-3 py-1 rounded transition-all ${
              mobileTab === 'chat' ? 'bg-[#111111] text-white font-bold' : 'text-[#666666]'
            }`}
          >
            Thảo luận ({messages.length})
          </button>
        </div>

        {/* Right: Controls & Study Tools */}
        <div className="flex items-center gap-2.5 text-sm font-medium">
          
          {/* Active Recall & Summary Trigger */}
          <button
            onClick={() => setIsRecallModalOpen(true)}
            className="px-3.5 py-1.5 rounded border border-[#EAEAEA] bg-white hover:bg-[#F7F6F3] text-[#111111] font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-sm"
            title="Xem tóm tắt và câu hỏi ôn tập nhanh cho slide này"
          >
            <HelpCircle className="w-4 h-4 text-[#555555]" />
            <span className="hidden sm:inline">Ôn tập slide</span>
          </button>

          {/* Notes Toggle */}
          <button
            onClick={() => setActiveNotesOpen(!activeNotesOpen)}
            className={`px-3.5 py-1.5 rounded border text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeNotesOpen 
                ? 'bg-[#111111] text-white border-[#111111]' 
                : 'bg-white hover:bg-[#F7F6F3] text-[#111111] border-[#EAEAEA]'
            }`}
            title="Mở sổ tay ghi chú cá nhân"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Ghi chú</span>
          </button>

          {/* TTS Speed selector */}
          <div className="hidden lg:flex items-center gap-1 bg-[#F7F6F3] px-2.5 py-1.5 rounded border border-[#EAEAEA] text-xs font-mono text-[#666666]">
            <Volume2 className="w-4 h-4" />
            <select
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="bg-transparent text-[#111111] focus:outline-none cursor-pointer font-sans text-xs font-bold"
            >
              <option value="1.0">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>

          {/* Zoom controls */}
          <div className="hidden xl:flex items-center bg-[#F7F6F3] rounded p-1 border border-[#EAEAEA]">
            <button
              onClick={() => setZoomScale(prev => Math.max(75, prev - 15))}
              className="p-1 hover:bg-[#EAEAEA] rounded text-[#666666] transition-colors cursor-pointer"
              title="Thu nhỏ slide"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-[#111111] min-w-10 text-center font-bold">
              {zoomScale}%
            </span>
            <button
              onClick={() => setZoomScale(prev => Math.min(150, prev + 15))}
              className="p-1 hover:bg-[#EAEAEA] rounded text-[#666666] transition-colors cursor-pointer"
              title="Phóng to slide"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomScale !== 100 && (
              <button
                onClick={() => setZoomScale(100)}
                className="p-1 hover:bg-[#EAEAEA] rounded text-[#888888] hover:text-[#111111] transition-colors cursor-pointer border-l border-[#EAEAEA]"
                title="Đặt lại 100%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded bg-white hover:bg-[#F7F6F3] text-[#111111] border border-[#EAEAEA] transition-colors cursor-pointer"
            title="Xem toàn bộ mục lục slide"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* PDF Download */}
          <a
            href={currentSlidePdf}
            download
            className="p-2 rounded bg-white hover:bg-[#F7F6F3] text-[#111111] border border-[#EAEAEA] transition-colors cursor-pointer"
            title="Tải slide PDF gốc"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* 2. MAIN SPLIT-VIEW CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* ======================================================== */}
        {/* LEFT PANE: HIGH-CONTRAST SLIDE VIEWPORT                 */}
        {/* ======================================================== */}
        <div className={`w-full lg:w-[56%] xl:w-[58%] flex flex-col bg-[#111318] border-r border-[#333333] relative select-none ${
          mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Slide Viewport Header */}
          <div className="bg-[#181a20] border-b border-[#2A2C32] px-4 py-2 flex items-center justify-between text-[#888888] text-sm shrink-0 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#DDDDDD] font-bold text-base">
                Trang {currentSlidePage} / {currentLesson.totalPages || 29}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollToSlide(currentSlidePage - 1)}
                disabled={currentSlidePage <= 1}
                className="p-1.5 hover:bg-[#2A2C32] disabled:opacity-30 rounded text-[#CCCCCC] transition-colors cursor-pointer"
                title="Slide trước (Phím mũi tên trái)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToSlide(currentSlidePage + 1)}
                disabled={currentSlidePage >= (currentLesson.totalPages || 29)}
                className="p-1.5 hover:bg-[#2A2C32] disabled:opacity-30 rounded text-[#CCCCCC] transition-colors cursor-pointer"
                title="Slide tiếp (Phím mũi tên phải)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slide Scroll Stage */}
          <div 
            ref={slideScrollContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col items-center bg-[#0D0E12]"
          >
            {[...Array(currentLesson.totalPages || 29)].map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentSlidePage;
              return (
                <div
                  key={pageNum}
                  id={`slide-page-${pageNum}`}
                  data-slide-page={pageNum}
                  className={`slide-page-item transition-all duration-200 w-full flex flex-col items-center max-w-4xl ${
                    isCurrent ? 'ring-2 ring-[#FBF3DB] rounded-lg shadow-xl' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{ width: `${zoomScale}%` }}
                >
                  <div className="w-full flex items-center justify-between text-[#777777] text-xs font-mono px-3.5 py-1.5 bg-[#181A20] rounded-t-md border border-b-0 border-[#2A2C32]">
                    <span className="font-bold text-[#EEEEEE] text-sm">Slide {pageNum}</span>
                    <button
                      onClick={() => scrollToSlide(pageNum, true)}
                      className="text-[#AAAAAA] hover:text-white transition-colors text-xs font-medium"
                    >
                      Kích hoạt thảo luận trang này ➔
                    </button>
                  </div>

                  <div className="w-full bg-[#050505] rounded-b-md overflow-hidden border border-[#2A2C32]">
                    <img
                      src={`/slides/${slideFolder}/slide-${pageNum}.png`}
                      alt={`Slide ${pageNum}`}
                      className="w-full h-auto object-contain block bg-[#050505]"
                      loading={pageNum <= 3 ? "eager" : "lazy"}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      style={{ display: 'none' }}
                      className="h-80 w-full bg-[#181A20] text-[#CCCCCC] flex flex-col items-center justify-center p-6 text-center space-y-2"
                    >
                      <BookOpen className="w-8 h-8 text-[#777777]" />
                      <div className="font-bold text-base">Slide {pageNum} - {currentLesson.title}</div>
                      <p className="text-sm text-[#888888] max-w-md">
                        Tài liệu bài giảng đang hiển thị. Hãy sử dụng khung thảo luận bên phải để tương tác cùng tác tử.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Slide Bottom Filmstrip */}
          <div className="bg-[#181A20] border-t border-[#2A2C32] px-3 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
            <span className="text-xs font-mono text-[#888888] font-bold uppercase shrink-0 pl-1">
              Trang:
            </span>
            <div className="flex items-center gap-1.5">
              {[...Array(currentLesson.totalPages || 29)].map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === currentSlidePage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => scrollToSlide(pageNum, true)}
                    className={`min-w-7 h-7 px-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                      isCurrent 
                        ? 'bg-[#EAEAEA] text-[#111111] font-black scale-105' 
                        : 'bg-[#22242B] text-[#888888] hover:bg-[#33353E] hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT PANE: PEDAGOGICAL MULTI-AGENT DISCUSSION           */}
        {/* ======================================================== */}
        <div className={`w-full lg:w-[44%] xl:w-[42%] flex flex-col bg-[#FBFBFA] relative text-left ${
          mobileTab === 'slide' ? 'hidden lg:flex' : 'flex'
        }`}>

          {/* Active Notes Drawer Overlay if open */}
          {activeNotesOpen && (
            <div className="absolute inset-0 z-30 bg-white flex flex-col p-5 border-l border-[#EAEAEA] animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#111111]" />
                  <span className="font-extrabold text-[#111111] text-base">Ghi chú cá nhân</span>
                </div>
                <button
                  onClick={() => setActiveNotesOpen(false)}
                  className="p-1 text-[#888888] hover:text-[#111111] rounded hover:bg-[#F4F4F2] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Note actions toolbar */}
              <div className="flex flex-wrap items-center gap-2.5 py-3 border-b border-[#F0F0F0]">
                <button
                  onClick={handleInsertTimestampNote}
                  className="px-3 py-1.5 bg-[#F7F6F3] hover:bg-[#EAEAEA] border border-[#EAEAEA] rounded text-xs font-bold text-[#111111] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>+ Chèn mốc Slide {currentSlidePage}</span>
                </button>
                <button
                  onClick={handleCopyNotes}
                  className="px-3 py-1.5 bg-[#F7F6F3] hover:bg-[#EAEAEA] border border-[#EAEAEA] rounded text-xs font-bold text-[#111111] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedNotes ? <Check className="w-3.5 h-3.5 text-[#346538]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNotes ? "Đã chép" : "Sao chép"}</span>
                </button>
                <button
                  onClick={handleDownloadNotes}
                  className="px-3 py-1.5 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ml-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải .md</span>
                </button>
              </div>

              <textarea
                value={savedNotes}
                onChange={(e) => handleSaveNote(e.target.value)}
                placeholder="Ghi chú các kiến thức, công thức, thắc mắc quan trọng trong suốt buổi học..."
                className="flex-1 w-full p-4 font-sans text-base leading-relaxed bg-[#FBFBFA] border border-[#EAEAEA] rounded mt-2 focus:outline-none focus:border-[#111111] transition-colors resize-none"
              />
              <div className="pt-2 text-xs font-mono text-[#888888] flex justify-between">
                <span>Lưu trữ cục bộ tự động</span>
                <span>{savedNotes.length} ký tự</span>
              </div>
            </div>
          )}

          {/* Active Agents Status Header */}
          <div className="bg-white border-b border-[#EAEAEA] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                <img 
                  src={AGENT_CONFIG.peer.avatar} 
                  alt="Minh" 
                  className="w-8 h-8 rounded-full border border-white object-cover" 
                  title="Minh (Bạn học)"
                />
                <img 
                  src={AGENT_CONFIG.ta.avatar} 
                  alt="Thảo" 
                  className="w-8 h-8 rounded-full border border-white object-cover" 
                  title="Thảo (Trợ giảng)"
                />
                <img 
                  src={AGENT_CONFIG.instructor.avatar} 
                  alt="TS. Tuấn" 
                  className="w-8 h-8 rounded-full border border-white object-cover" 
                  title="TS. Tuấn (Giảng viên)"
                />
              </div>

              <div>
                <div className="text-sm font-extrabold text-[#111111]">
                  Thảo luận đa tác tử
                </div>
                <div className="text-xs font-mono text-[#787774]">
                  Slide {currentSlidePage} • Trợ giảng Socratic & TS. Tuấn
                </div>
              </div>
            </div>

            <span className="text-xs font-mono bg-[#F7F6F3] text-[#555555] px-2.5 py-1 rounded border border-[#EAEAEA] font-semibold">
              {messages.length} lượt trao đổi
            </span>
          </div>

          {/* Message Stream */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#787774] space-y-3">
                <BookOpen className="w-8 h-8 text-[#999999]" />
                <h4 className="text-base font-bold text-[#111111]">
                  Phiên học trực tiếp sẵn sàng
                </h4>
                <p className="text-sm text-[#666666] max-w-sm leading-relaxed">
                  Gửi câu hỏi về Slide {currentSlidePage} hoặc chọn một hành động nhanh bên dưới để bắt đầu trao đổi.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const persona = !isUser ? (
                  msg.sender.includes('peer') ? AGENT_CONFIG.peer :
                  msg.sender.includes('prof') ? AGENT_CONFIG.instructor :
                  AGENT_CONFIG.ta
                ) : null;

                const isBookmarked = bookmarks.includes(msg.id);

                return (
                  <div 
                    key={msg.id}
                    className={`flex gap-3 text-left ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <img
                        src={persona?.avatar}
                        alt=""
                        aria-hidden="true"
                        className="w-9 h-9 rounded-full border border-[#EAEAEA] shrink-0 mt-0.5 object-cover select-none"
                      />
                    )}

                    <div className={`space-y-1.5 max-w-[88%] sm:max-w-[85%]`}>
                      
                      {/* Persona Header Tag */}
                      {!isUser && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#111111]">
                            {persona?.name}
                          </span>
                          
                          <span className={`px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${persona?.roleBadge}`}>
                            {persona?.role}
                          </span>

                          <button
                            onClick={() => handleReadAloud(msg.text)}
                            className="p-1 text-[#888888] hover:text-[#111111] transition-colors cursor-pointer"
                            title="Nghe đọc"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleBookmark(msg.id)}
                            className={`p-1 transition-colors cursor-pointer ${
                              isBookmarked ? 'text-[#956400]' : 'text-[#CCCCCC] hover:text-[#777777]'
                            }`}
                            title="Lưu đánh dấu"
                          >
                            <Bookmark className="w-4 h-4 fill-current" />
                          </button>

                          <span className="text-xs text-[#888888] font-mono ml-auto">
                            {msg.timestamp}
                          </span>
                        </div>
                      )}

                      {/* Distinct Message Card with Large Typography */}
                      <div className={`p-4 rounded-lg text-base sm:text-lg leading-[1.68] border shadow-xs ${
                        isUser 
                          ? 'bg-[#111111] text-white border-[#111111] rounded-tr-none font-medium' 
                          : `${persona?.cardBg || 'bg-white border-[#EAEAEA]'} ${persona?.borderAccent || ''} rounded-tl-none text-[#111111]`
                      }`}>
                        {msg.text}
                      </div>

                      {msg.citation && (
                        <div className="citation-badge inline-block text-xs font-mono font-bold bg-[#F4EFFB] border border-[#E4D5F7] text-[#5E3D85] px-2.5 py-0.5 rounded">
                          Trích dẫn: [{msg.citation}]
                        </div>
                      )}

                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="text-sm text-[#555555] font-bold py-2 px-3.5 bg-white rounded border border-[#EAEAEA] w-fit font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
                <span>{isTyping === 'peer-minh' ? 'Minh đang phản hồi...' : isTyping === 'ta-thao' ? 'Trợ giảng Thảo đang soạn câu trả lời...' : 'TS. Tuấn đang chuẩn hóa kiến thức...'}</span>
              </div>
            )}
          </div>

          {/* Bottom input area */}
          <div className="p-4 border-t border-[#EAEAEA] bg-white space-y-3 shrink-0">
            
            {/* Fast Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {FAST_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(action.prompt)}
                  className="px-3 py-1.5 bg-[#F7F6F3] hover:bg-[#EAEAEA] text-[#222222] hover:text-[#111111] rounded text-sm font-semibold transition-colors cursor-pointer border border-[#EAEAEA]"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Composer */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập câu hỏi hoặc câu trả lời phản biện..."
                className="flex-1 px-4 py-3 bg-[#FBFBFA] border border-[#EAEAEA] rounded text-base sm:text-lg text-[#111111] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors placeholder:text-[#999999]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 bg-[#111111] hover:bg-[#2A2A2A] disabled:opacity-40 text-white text-sm sm:text-base font-bold rounded transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Gửi</span>
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* 3. SLIDE DRAWER MODAL */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-lg border border-[#EAEAEA] max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden text-left shadow-lg">
            
            <div className="p-4 border-b border-[#EAEAEA] flex items-center justify-between bg-[#FBFBFA]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Mục lục slide bài giảng
                </h3>
                <p className="text-xs sm:text-sm text-[#787774]">
                  {currentLesson.title} (29 trang)
                </p>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-[#888888] hover:text-[#111111] rounded hover:bg-[#F4F4F2] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-[#F7F6F3]">
              {[...Array(29)].map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === currentSlidePage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => scrollToSlide(pageNum, true)}
                    className={`p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isCurrent 
                        ? 'bg-[#111111] text-white border-[#111111]' 
                        : 'bg-white border-[#EAEAEA] hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                      <span>Trang {pageNum}</span>
                      {isCurrent && <span className="text-[10px] bg-white text-[#111111] font-black px-1.5 py-0.2 rounded">Hiện tại</span>}
                    </div>
                    <img 
                      src={`/slides/${slideFolder}/slide-${pageNum}.png`} 
                      alt={`Thumbnail ${pageNum}`} 
                      className="w-full h-20 object-contain bg-[#0D0E12] rounded border border-[#EAEAEA]" 
                    />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* 4. ACTIVE RECALL & SLIDE SUMMARY MODAL */}
      {isRecallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-lg border border-[#EAEAEA] max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden text-left shadow-lg">
            
            <div className="p-4 sm:p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#FBFBFA]">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Tóm tắt & Ôn tập · Slide {currentSlidePage}
                </h3>
                <p className="text-xs sm:text-sm text-[#787774] font-mono">
                  {currentLesson.title}
                </p>
              </div>

              <button
                onClick={() => setIsRecallModalOpen(false)}
                className="p-1.5 text-[#888888] hover:text-[#111111] rounded hover:bg-[#F4F4F2] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-[#111111]">
              
              {/* Key Takeaways */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono font-bold text-[#787774] uppercase tracking-wider">
                  Khái niệm cốt lõi:
                </div>
                <div className="p-4 bg-[#FBFBFA] rounded border border-[#EAEAEA] space-y-2.5 text-sm sm:text-base leading-relaxed text-[#333333]">
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-[#111111]">1.</span>
                    <span>Phân phối trọng số chú ý thông qua cơ chế tích vô hướng ma trận Query và Key.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-[#111111]">2.</span>
                    <span>Chia căn bậc hai số chiều d_k để ổn định phương sai trước hàm Softmax Scaling.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-[#111111]">3.</span>
                    <span>Bảo toàn vị trí từ ngữ thông qua Positional Encoding khi thực thi song song hóa.</span>
                  </div>
                </div>
              </div>

              {/* Active Recall Challenge */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono font-bold text-[#787774] uppercase tracking-wider">
                  Câu hỏi kiểm tra nhận thức:
                </div>
                <div className="p-4 bg-[#FBF3DB]/40 border border-[#F2E4B8] rounded space-y-3 text-sm sm:text-base">
                  <p className="font-bold text-[#111111] leading-snug">
                    Tại sao lại cần chia tích vô hướng Q·K^T cho căn bậc hai của d_k trước khi đưa vào hàm Softmax?
                  </p>
                  <details className="group">
                    <summary className="font-bold text-[#956400] hover:text-[#111111] cursor-pointer select-none text-xs uppercase tracking-wider">
                      Xem giải thích chi tiết ➔
                    </summary>
                    <p className="mt-2 text-[#444444] leading-relaxed pt-2 border-t border-[#F2E4B8] text-sm">
                      Khi số chiều d_k lớn, tích vô hướng có phương sai xấp xỉ d_k, đẩy hàm Softmax vào vùng bão hòa có đạo hàm triệt tiêu (Gradient Vanishing). Việc chia căn d_k chuẩn hóa phương sai về 1 giúp gradient lan truyền ổn định.
                    </p>
                  </details>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    handleInsertTimestampNote();
                    setIsRecallModalOpen(false);
                    setActiveNotesOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#111111] hover:bg-[#2A2A2A] text-white rounded text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Chèn vào Ghi chú</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ClassroomView;
