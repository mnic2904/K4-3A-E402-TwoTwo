import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PROTEGE_TOPICS } from '../data/mockData';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  Send, 
  Bot, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Award,
  BookOpen
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
      if (textLower.includes('xác suất') || textLower.includes('next token') || textLower.includes('dự đoán')) {
        if (!newCovered.includes(0)) newCovered.push(0);
      }
      if (textLower.includes('kiểm chứng') || textLower.includes('fact') || textLower.includes('sự thật')) {
        if (!newCovered.includes(1)) newCovered.push(1);
      }
      if (textLower.includes('pre-training') || textLower.includes('dữ liệu') || textLower.includes('học')) {
        if (!newCovered.includes(2)) newCovered.push(2);
      }
      setCoveredConcepts(newCovered);

      if (newCovered.length >= 2) {
        addIcapPoints(75);
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
        showToast("Đạt yêu cầu bài tập!", "Bạn đã giải thích đủ các khái niệm cốt lõi cho Robo-Junior.", "success");
        setTeachingHistory(prev => [...prev, {
          id: `robo-${Date.now()}`,
          sender: 'robo',
          text: "A! Bây giờ em đã hiểu rồi! AI không hề có ý thức nói dối, mà chỉ là chọn từ có xác suất thống kê cao nhất tiếp theo dựa trên dữ liệu pre-training. Em cảm ơn thầy giáo nhiều lắm!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        addIcapPoints(30);
        setTeachingHistory(prev => [...prev, {
          id: `robo-${Date.now()}`,
          sender: 'robo',
          text: "Em vẫn hơi thắc mắc: Nếu AI chỉ là thuật toán thì tại sao khi hỏi các câu không có thật nó vẫn tự bịa ra câu trả lời rất tự tin thay vì nói 'tôi không biết'? Thầy giáo giải thích thêm chỗ phân phối xác suất được không ạ?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    }, 1800);
  };

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-64px)] py-8 text-left text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0056D2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Khóa học</span>
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            Coursera Assignment · Giảng Bài Cho Bạn Học (Protégé)
          </span>
        </div>

        {/* Card */}
        <div className="coursera-card rounded-2xl p-6 sm:p-8 space-y-6 bg-white shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Bài Tập Tương Tác: Dạy Lại Khái Niệm
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {topic.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Đóng vai người hướng dẫn giải thích cho tác tử học trò Robo-Junior. AI chỉ đánh giá đạt khi bạn bao phủ đủ 3 luận điểm cốt lõi.
            </p>
          </div>

          {/* Rubric criteria checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Tiêu Chí Đánh Giá (Rubric Cốt Lõi):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topic.targetConcepts.map((concept, idx) => {
                const isDone = coveredConcepts.includes(idx);
                return (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                      isDone 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' 
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="line-clamp-2">{concept}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Stream */}
          <div className="space-y-3 max-h-80 overflow-y-auto bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            {teachingHistory.map((item) => {
              const isUser = item.sender === 'user';
              return (
                <div key={item.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-[#0056D2] text-white rounded-tr-none shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                  }`}>
                    <p>{item.text}</p>
                  </div>
                </div>
              );
            })}

            {isEvaluating && (
              <div className="text-xs text-slate-500 italic flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#0056D2] animate-spin" />
                <span>Robo-Junior đang đối chiếu câu trả lời với Slide & Rubric...</span>
              </div>
            )}
          </div>

          {/* Draft Box */}
          <div className="space-y-3 pt-2">
            <textarea
              rows={3}
              value={draftExplanation}
              onChange={(e) => setDraftExplanation(e.target.value)}
              placeholder="Nhập lời giảng giải của bạn cho Robo-Junior (VD: AI dự đoán từ tiếp theo theo phân phối xác suất chứ không có cơ chế tự kiểm chứng sự thật...)"
              className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0056D2]"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Tiến độ Rubric: <strong>{coveredConcepts.length}/3</strong> khái niệm
              </span>

              <button
                onClick={handleSendExplanation}
                disabled={!draftExplanation.trim() || isEvaluating}
                className="px-5 py-2.5 bg-[#0056D2] hover:bg-[#00419e] disabled:opacity-40 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Giảng Cho Robo-Junior</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
