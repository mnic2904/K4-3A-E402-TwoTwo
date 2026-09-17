import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PRODUCTIVE_FAILURE_TASKS } from '../data/mockData';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  BookOpen, 
  RefreshCw, 
  ShieldAlert,
  FileText
} from 'lucide-react';

export function ProductiveFailureView() {
  const { setActiveTab, addIcapPoints, showToast } = useAuth();
  const task = PRODUCTIVE_FAILURE_TASKS[0];

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hintTier, setHintTier] = useState(0);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setHasSubmitted(true);
    const chosen = task.options.find(o => o.id === selectedOption);
    if (chosen?.isCorrect) {
      addIcapPoints(60);
      showToast("Chính xác!", "Bạn đã hiểu đúng bản chất Subword Tokenization tiếng Việt.", "success");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      addIcapPoints(20);
      showToast("Thất bại có thiết kế (Productive Failure)", "Đừng lo, hãy xem lời dẫn giải theo lỗi dưới đây.", "info");
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setHintTier(0);
  };

  const chosen = task.options.find(o => o.id === selectedOption);

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-64px)] py-8 text-left text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0056D2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Khóa học</span>
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2] bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
            Coursera Lab · Bài Tập Tương Tác Socratic
          </span>
        </div>

        {/* Task Card */}
        <div className="coursera-card rounded-2xl p-6 sm:p-8 space-y-6 bg-white shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#0056D2] uppercase tracking-wider">
              Bài Thực Hành Trắc Nghiệm Tương Tác
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {task.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {task.context}
            </p>
          </div>

          {/* Sentence container */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono-code text-xs sm:text-sm text-slate-900">
            "{task.sentence}"
            <div className="mt-2 text-[11px] text-slate-500 font-sans">
              (Độ dài chuỗi: {task.wordCount} từ tiếng Việt)
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {task.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              let style = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';

              if (hasSubmitted) {
                if (opt.isCorrect) style = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                else if (isSelected && !opt.isCorrect) style = 'border-red-500 bg-red-50 text-red-900';
              } else if (isSelected) {
                style = 'border-[#0056D2] bg-blue-50/50 text-[#0056D2]';
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => !hasSubmitted && setSelectedOption(opt.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${style}`}
                >
                  <div className={`w-6 h-6 rounded-lg font-mono-code text-xs font-bold flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#0056D2] text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {opt.id}
                  </div>
                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                    {opt.text}
                  </div>
                  {hasSubmitted && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {hasSubmitted && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="pt-2 flex items-center justify-between">
            {!hasSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="px-6 py-3 rounded-lg bg-[#0056D2] hover:bg-[#00419e] disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all"
              >
                Nộp Bài Kiểm Tra Giả Định
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm Lại Bài Này</span>
              </button>
            )}

            {!hasSubmitted && (
              <button
                onClick={() => setHintTier(prev => Math.min(prev + 1, 2))}
                className="text-xs text-[#0056D2] hover:underline font-semibold flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>{hintTier === 0 ? "Xem gợi ý mức 1" : "Đã mở gợi ý"}</span>
              </button>
            )}
          </div>

          {/* Hint Disclosure */}
          {hintTier >= 1 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-amber-800">
                <Lightbulb className="w-3.5 h-3.5" /> Gợi ý Byte-Pair Encoding
              </span>
              <p>
                Tokenizer của GPT phân tách các ký tự có dấu thanh trong tiếng Việt thành các chuỗi bytes độc lập, khiến 1 từ có thể tốn từ 2 đến 3 token!
              </p>
            </div>
          )}

          {/* Feedback */}
          {hasSubmitted && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Chẩn Đoán Lỗi Tư Duy (Diagnostic Feedback)
                </span>
                <span className="citation-tag">
                  <BookOpen className="w-3 h-3" /> {task.transcriptRef}
                </span>
              </div>

              {chosen && !chosen.isCorrect && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                  <strong>Giả định chưa đúng:</strong> {chosen.misconception}
                </div>
              )}

              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Lời giảng của TS. Tuấn:</strong> {task.explanation}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
