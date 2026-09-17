import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PRODUCTIVE_FAILURE_TASKS } from '../data/mockData';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RefreshCw
} from 'lucide-react';

const SAMPLE_SENTENCES = [
  "Trí tuệ nhân tạo đang thay đổi thế giới",
  "Học sinh Việt Nam học bài rất chăm chỉ",
  "Transformer Self-Attention Matrix",
  "Khái niệm mô hình ngôn ngữ lớn LLM"
];

function simulateBpeTokens(text) {
  const words = text.trim().split(/\s+/);
  const tokens = [];
  let byteCount = 0;

  words.forEach((w, wIdx) => {
    const hasDiacritics = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(w);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(w);
    byteCount += bytes.length;

    if (hasDiacritics && w.length > 2) {
      const mid = Math.ceil(w.length / 2);
      tokens.push({
        text: (wIdx > 0 ? " " : "") + w.slice(0, mid),
        isSubword: true,
        bytes: bytes.length
      });
      tokens.push({
        text: "##" + w.slice(mid),
        isSubword: true,
        bytes: bytes.length
      });
    } else {
      tokens.push({
        text: (wIdx > 0 ? " " : "") + w,
        isSubword: false,
        bytes: bytes.length
      });
    }
  });

  return { tokens, byteCount, wordCount: words.length };
}

export function ProductiveFailureView() {
  const { setActiveTab, addIcapPoints, showToast } = useAuth();
  const task = PRODUCTIVE_FAILURE_TASKS[0];

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hintTier, setHintTier] = useState(0);

  const [sandboxText, setSandboxText] = useState(task.sentence);
  const [activeTokenIdx, setActiveTokenIdx] = useState(null);

  const sandboxAnalysis = simulateBpeTokens(sandboxText);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setHasSubmitted(true);
    const chosen = task.options.find(o => o.id === selectedOption);
    if (chosen?.isCorrect) {
      addIcapPoints(60);
      showToast("Chính xác", "Bạn đã hiểu đúng bản chất Subword Tokenization tiếng Việt.", "success");
    } else {
      addIcapPoints(25);
      showToast("Thất bại có thiết kế", "Đọc kỹ phần dẫn giải bên dưới để hiểu nguyên nhân tại sao token lại nhiều hơn số từ.", "info");
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setHintTier(0);
  };

  const chosen = task.options.find(o => o.id === selectedOption);

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
              Productive Failure Lab
            </span>
            <span className="text-xs font-mono text-[#956400] font-black px-2.5 py-1 rounded bg-[#FBF3DB] border border-[#F2E4B8]">
              +60 ICAP
            </span>
          </div>
        </div>

        {/* Task Question Card */}
        <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 sm:p-9 space-y-6">
          <div>
            <div className="text-xs font-mono text-[#787774] font-bold uppercase tracking-wider">
              Bài tập dự đoán trước bài giảng
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-1">
              {task.title}
            </h1>
            <p className="text-base sm:text-lg text-[#555555] mt-2 leading-relaxed">
              {task.context}
            </p>
          </div>

          {/* Sample sentence */}
          <div className="p-5 rounded bg-[#F7F6F3] text-[#111111] font-mono text-base sm:text-lg leading-relaxed border border-[#EAEAEA]">
            <div className="text-xs uppercase text-[#787774] font-sans font-bold mb-1">
              Văn bản thử nghiệm:
            </div>
            "{task.sentence}"
            <div className="mt-2.5 text-xs sm:text-sm text-[#787774] font-sans flex items-center gap-4">
              <span>Độ dài: <strong>{task.wordCount} từ tiếng Việt</strong></span>
              <span>•</span>
              <span>Bảng mã: <strong>UTF-8 Multibyte</strong></span>
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            <div className="text-sm sm:text-base font-bold text-[#111111] font-mono">
              Khi đưa vào tokenizer GPT-4/LLaMA, câu trên sẽ được phân tách thành bao nhiêu Tokens?
            </div>
            <div className="space-y-2.5">
              {task.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                let style = 'border-[#EAEAEA] hover:border-[#CCCCCC] bg-white text-[#111111]';

                if (hasSubmitted) {
                  if (opt.isCorrect) style = 'border-[#346538] bg-[#EDF3EC] text-[#346538] font-bold';
                  else if (isSelected && !opt.isCorrect) style = 'border-[#9F2F2D] bg-[#FDEBEC] text-[#9F2F2D]';
                } else if (isSelected) {
                  style = 'border-[#111111] bg-[#F7F6F3] text-[#111111] font-bold';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => !hasSubmitted && setSelectedOption(opt.id)}
                    className={`p-4 rounded border transition-colors cursor-pointer flex items-start gap-3.5 text-base sm:text-lg ${style}`}
                  >
                    <div className={`w-6 h-6 rounded font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#111111] text-white' : 'bg-[#F0F0F0] text-[#555555]'
                    }`}>
                      {opt.id}
                    </div>
                    <div className="flex-1 leading-relaxed">
                      {opt.text}
                    </div>
                    {hasSubmitted && opt.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-[#346538] shrink-0 mt-0.5" />
                    )}
                    {hasSubmitted && isSelected && !opt.isCorrect && (
                      <XCircle className="w-5 h-5 text-[#9F2F2D] shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="pt-3 flex items-center justify-between border-t border-[#F0F0F0]">
            {!hasSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption}
                className="px-5 py-2.5 rounded bg-[#111111] hover:bg-[#2A2A2A] disabled:opacity-40 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Nộp bài dự đoán
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded bg-[#F7F6F3] hover:bg-[#EAEAEA] text-[#111111] font-bold text-sm transition-colors flex items-center gap-1.5 cursor-pointer border border-[#EAEAEA]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thực hiện lại</span>
              </button>
            )}

            {!hasSubmitted && (
              <button
                onClick={() => setHintTier(prev => Math.min(prev + 1, 2))}
                className="text-sm text-[#666666] hover:text-[#111111] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{hintTier === 0 ? "Xem gợi ý lý thuyết" : `Gợi ý cấp ${hintTier}/2`}</span>
              </button>
            )}
          </div>

          {/* Hint disclosure */}
          {hintTier > 0 && !hasSubmitted && (
            <div className="p-4 bg-[#FBF3DB]/50 border border-[#F2E4B8] rounded text-[#111111] space-y-2 text-sm leading-relaxed">
              <div className="font-bold text-[#956400]">
                Gợi ý lý thuyết Subword BPE:
              </div>
              <p>
                {hintTier === 1 && "Tiếng Việt sử dụng bảng ký tự có dấu (UTF-8). Hầu hết các bộ Tokenizer phương Tây không chứa sẵn toàn bộ các tổ hợp âm tiết tiếng Việt trong từ điển gốc."}
                {hintTier === 2 && "Khi một từ tiếng Việt có dấu không có trong từ điển token, bộ tokenizer sẽ buộc phải tách từ đó thành 2 đến 4 byte con (Subwords / Bytes) để mã hóa."}
              </p>
            </div>
          )}

          {/* Explanation after submission */}
          {hasSubmitted && (
            <div className={`p-5 rounded border space-y-3 text-sm sm:text-base ${
              chosen?.isCorrect 
                ? 'bg-[#EDF3EC] border-[#C2DEC0] text-[#346538]' 
                : 'bg-[#FBF3DB]/60 border-[#F2E4B8] text-[#956400]'
            }`}>
              <div className="font-black text-base sm:text-lg flex items-center gap-2">
                {chosen?.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-[#346538]" />
                ) : (
                  <span>Bản chất học thuật: Hiện tượng Token Fragmentation</span>
                )}
                {chosen?.isCorrect && <span>Chính xác</span>}
              </div>
              <p className="leading-relaxed text-[#333333]">
                {task.explanation}
              </p>
              <div className="text-xs sm:text-sm font-mono bg-white p-3 rounded border border-[#EAEAEA] text-[#555555]">
                <strong>Hệ quả:</strong> Người dùng tiếng Việt chịu chi phí API cao gấp 1.8x - 2.5x và context window bị thu hẹp so với tiếng Anh khi dùng LLM có vốn từ điển tiếng Anh là chính.
              </div>
            </div>
          )}
        </div>

        {/* Interactive Tokenizer Visualizer Sandbox */}
        <div className="bg-white border border-[#EAEAEA] rounded-lg p-7 sm:p-9 space-y-6">
          <div>
            <div className="text-xs font-mono text-[#787774] font-bold uppercase tracking-wider">
              Thực nghiệm bóc tách Token
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111111] mt-1">
              Phân tách Token Subwords Tiếng Việt
            </h2>
            <p className="text-sm text-[#666666] mt-1">
              Nhập bất kỳ câu tiếng Việt nào để quan sát thuật toán phân tách các ký tự có dấu thành từng mảnh Subword Tokens.
            </p>
          </div>

          {/* Input & quick samples */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-mono text-[#787774] font-bold self-center">Mẫu:</span>
              {SAMPLE_SENTENCES.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSandboxText(s)}
                  className="text-xs sm:text-sm bg-[#F7F6F3] hover:bg-[#EAEAEA] text-[#333333] px-3 py-1.5 rounded border border-[#EAEAEA] transition-colors cursor-pointer"
                >
                  "{s}"
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              placeholder="Nhập câu tiếng Việt cần kiểm tra..."
              className="w-full p-3.5 rounded border border-[#EAEAEA] focus:border-[#111111] focus:outline-none text-sm sm:text-base font-mono bg-[#FBFBFA]"
            />
          </div>

          {/* Token Visualizer Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[#787774]">
              <span className="font-bold">KẾT QUẢ MÃ HÓA:</span>
              <span>
                {sandboxAnalysis.wordCount} từ ➔ <strong className="text-[#111111] text-base">{sandboxAnalysis.tokens.length} tokens</strong> ({(sandboxAnalysis.tokens.length / (sandboxAnalysis.wordCount || 1)).toFixed(2)}x)
              </span>
            </div>

            <div className="p-4 rounded bg-[#F7F6F3] border border-[#EAEAEA] flex flex-wrap gap-2 min-h-20 items-center">
              {sandboxAnalysis.tokens.map((tok, idx) => {
                const colors = [
                  'bg-[#E1F3FE] text-[#1F6C9F] border-[#C5E6FC]',
                  'bg-[#F4EFFB] text-[#5E3D85] border-[#E4D5F7]',
                  'bg-[#EDF3EC] text-[#346538] border-[#C2DEC0]',
                  'bg-[#FBF3DB] text-[#956400] border-[#F2E4B8]'
                ];
                const colorClass = colors[idx % colors.length];
                const isActive = activeTokenIdx === idx;

                return (
                  <span
                    key={idx}
                    onClick={() => setActiveTokenIdx(idx)}
                    className={`inline-block px-3 py-1 rounded font-mono text-sm font-bold border cursor-pointer select-none ${colorClass} ${
                      isActive ? 'ring-2 ring-[#111111]' : ''
                    }`}
                  >
                    {tok.text.replace(' ', '␣')}
                  </span>
                );
              })}
            </div>

            <div className="text-xs text-[#888888] font-mono">
              Ký tự <strong>␣</strong> thể hiện khoảng trắng đầu token.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
