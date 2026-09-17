import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PROTEGE_TOPICS } from '../data/mockData';
import { 
  Send, 
  CheckCircle2, 
  ArrowLeft,
  Volume2,
  RefreshCw
} from 'lucide-react';

export function ProtegeView() {
  const { setActiveTab, addIcapPoints, showToast } = useAuth();
  const topic = PROTEGE_TOPICS[0];

  const [teachingHistory, setTeachingHistory] = useState([
    {
      id: 'p-1',
      sender: 'robo',
      text: topic.starterQuestion,
      timestamp: '14:00'
    }
  ]);
  const [draftExplanation, setDraftExplanation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [coveredConcepts, setCoveredConcepts] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendExplanation = () => {
    if (!draftExplanation.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: draftExplanation,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTeachingHistory(prev => [...prev, userMsg]);
    setDraftExplanation('');
    setIsEvaluating(true);

    setTimeout(() => {
      setIsEvaluating(false);
      
      const textLower = userMsg.text.toLowerCase();
      const newCovered = [...coveredConcepts];
      if (textLower.includes('xác suất') || textLower.includes('next token') || textLower.includes('dự đoán') || textLower.includes('thống kê')) {
        if (!newCovered.includes(0)) newCovered.push(0);
      }
      if (textLower.includes('kiểm chứng') || textLower.includes('fact') || textLower.includes('sự thật') || textLower.includes('logic')) {
        if (!newCovered.includes(1)) newCovered.push(1);
      }
      if (textLower.includes('pre-training') || textLower.includes('dữ liệu') || textLower.includes('học') || textLower.includes('huấn luyện')) {
        if (!newCovered.includes(2)) newCovered.push(2);
      }
      setCoveredConcepts(newCovered);

      if (newCovered.length >= 2) {
        setIsComplete(true);
        addIcapPoints(75);
        showToast("Đạt yêu cầu", "Bạn đã vận dụng phương pháp Feynman giảng giải đủ các khái niệm cốt lõi.", "success");
        setTeachingHistory(prev => [...prev, {
          id: `robo-${Date.now()}`,
          sender: 'robo',
          text: "Em đã hiểu rõ rồi ạ. LLM thực chất là bộ dự đoán token tiếp theo theo phân phối xác suất từ tập dữ liệu pre-training, không có cơ chế tự kiểm chứng sự thật khách quan (Fact-checking). Em cảm ơn bạn!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        addIcapPoints(30);
        setTeachingHistory(prev => [...prev, {
          id: `robo-${Date.now()}`,
          sender: 'robo',
          text: "Em vẫn thắc mắc: Tại sao khi hỏi một câu không có thật thì LLM vẫn tự tin đưa ra câu trả lời thay vì bảo 'Tôi không biết'? Bạn có thể giải thích thêm về phân phối xác suất không ạ?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    }, 1200);
  };

  const handleReset = () => {
    setTeachingHistory([
      {
        id: 'p-1',
        sender: 'robo',
        text: topic.starterQuestion,
        timestamp: '14:00'
      }
    ]);
    setDraftExplanation('');
    setCoveredConcepts([]);
    setIsComplete(false);
  };

  const PROMPT_SUGGESTIONS = [
    "LLM chỉ dự đoán từ tiếp theo dựa vào xác suất thống kê học được từ dữ liệu huấn luyện...",
    "Mô hình không có khả năng tự kiểm chứng sự thật khách quan mà chỉ ghép các từ có xác suất cao nhất...",
    "Hiện tượng Hallucination xảy ra do LLM tối ưu hóa chuỗi từ mượt mà nhất trong không gian vector..."
  ];

  return (
    <div className="bg-[#FBFBFA] min-h-[calc(100vh-53px)] py-10 sm:py-16 text-left text-[#111111] text-base">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('classroom')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#555555] hover:text-[#111111] bg-white border border-[#EAEAEA] px-3.5 py-2 rounded transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Lớp học</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#787774] font-bold px-2.5 py-1 rounded bg-[#F7F6F3] border border-[#EAEAEA]">
              Protégé Effect Lab
            </span>
            <span className="text-xs font-mono text-[#956400] font-black px-2.5 py-1 rounded bg-[#FBF3DB] border border-[#F2E4B8]">
              +75 ICAP
            </span>
          </div>
        </div>

        {/* Task Overview Card */}
        <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 sm:p-9 space-y-6">
          <div>
            <div className="text-xs font-mono text-[#787774] font-bold uppercase tracking-wider">
              Dạy lại khái niệm (Feynman Technique)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-1">
              {topic.title}
            </h1>
            <p className="text-base sm:text-lg text-[#555555] mt-2 leading-relaxed">
              Hãy đóng vai người hướng dẫn để giảng lại cho bạn học <strong>Minh</strong> hiểu rõ bản chất vấn đề. Bao phủ đủ 3 tiêu chí Rubric bên dưới.
            </p>
          </div>

          {/* Rubric Tracker */}
          <div className="p-5 rounded bg-[#F7F6F3] border border-[#EAEAEA] space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#787774]">
              <span className="font-bold uppercase">Tiêu chí đánh giá Rubric ({coveredConcepts.length}/3)</span>
              <span className="font-bold">{Math.round((coveredConcepts.length / 3) * 100)}% hoàn thành</span>
            </div>

            <div className="w-full h-2 bg-[#EAEAEA] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#346538] transition-all duration-300"
                style={{ width: `${(coveredConcepts.length / 3) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {topic.targetConcepts.map((concept, idx) => {
                const isDone = coveredConcepts.includes(idx);
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded border text-xs sm:text-sm flex items-start gap-2.5 transition-colors ${
                      isDone 
                        ? 'bg-[#EDF3EC] border-[#C2DEC0] text-[#346538] font-bold' 
                        : 'bg-white border-[#EAEAEA] text-[#666666]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isDone ? 'text-[#346538]' : 'text-[#CCCCCC]'}`} />
                    <span className="leading-snug">{concept}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat / Interaction Stream */}
          <div className="space-y-4 max-h-96 overflow-y-auto bg-[#FBFBFA] p-5 rounded border border-[#EAEAEA]">
            {teachingHistory.map((item) => {
              const isUser = item.sender === 'user';
              return (
                <div key={item.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded bg-[#FBF3DB] text-[#956400] font-bold flex items-center justify-center shrink-0 text-sm border border-[#F2E4B8]">
                      M
                    </div>
                  )}

                  <div className={`max-w-[85%] p-4 rounded text-base leading-relaxed border ${
                    isUser 
                      ? 'bg-[#111111] text-white border-[#111111] rounded-tr-none font-medium' 
                      : 'bg-white border-[#EAEAEA] text-[#111111] rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                      <span className={`text-xs font-mono font-bold ${isUser ? 'text-[#CCCCCC]' : 'text-[#956400]'}`}>
                        {isUser ? 'Bạn' : 'Bạn học Minh'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#888888]">
                          {item.timestamp}
                        </span>
                        {!isUser && (
                          <button
                            onClick={() => handleSpeak(item.text)}
                            className="p-1 text-[#888888] hover:text-[#111111] transition-colors"
                            title="Nghe giọng đọc"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>{item.text}</div>
                  </div>
                </div>
              );
            })}

            {isEvaluating && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded bg-[#FBF3DB] text-[#956400] font-bold flex items-center justify-center shrink-0 text-sm border border-[#F2E4B8]">
                  M
                </div>
                <div className="p-3 rounded bg-white border border-[#EAEAEA] text-[#666666] text-sm flex items-center gap-2.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#111111] animate-pulse" />
                  <span>Minh đang suy ngẫm lời giải thích...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompt suggestions */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-[#787774] uppercase tracking-wider">
              Gợi ý cấu trúc giải thích:
            </div>
            <div className="flex flex-col gap-1.5">
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setDraftExplanation(s)}
                  className="text-left text-xs sm:text-sm bg-[#F7F6F3] hover:bg-[#EAEAEA] border border-[#EAEAEA] p-2.5 rounded text-[#333333] transition-colors cursor-pointer leading-relaxed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="space-y-3 pt-1">
            <div className="flex gap-2.5">
              <textarea
                rows={2}
                value={draftExplanation}
                onChange={(e) => setDraftExplanation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendExplanation();
                  }
                }}
                placeholder="Nhập lời giảng giải cho bạn Minh (Nhấn Enter để gửi)..."
                className="flex-1 p-3.5 rounded border border-[#EAEAEA] focus:border-[#111111] focus:outline-none text-base bg-white"
              />
              <button
                onClick={handleSendExplanation}
                disabled={!draftExplanation.trim() || isEvaluating}
                className="px-5 bg-[#111111] hover:bg-[#2A2A2A] disabled:opacity-40 text-white rounded text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Gửi</span>
              </button>
            </div>

            {isComplete && (
              <div className="p-4 bg-[#EDF3EC] border border-[#C2DEC0] rounded flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-[#346538] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#346538]" />
                  <span>Hoàn thành bài tập Protégé. Bạn đã đạt đủ điểm tiêu chí.</span>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 bg-white border border-[#C2DEC0] rounded text-xs font-bold text-[#346538] hover:bg-[#EDF3EC] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm lại</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
