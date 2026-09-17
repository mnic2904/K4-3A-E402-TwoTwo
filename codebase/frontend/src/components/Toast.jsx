import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast() {
  const { toastMessage } = useAuth();
  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 max-w-sm ${
        isSuccess 
          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
          : isError
          ? 'bg-red-950/80 border-red-500/40 text-red-200'
          : 'bg-slate-900/90 border-slate-700 text-slate-100'
      }`}>
        <div className="shrink-0 mt-0.5">
          {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
           isError ? <AlertCircle className="w-5 h-5 text-red-400" /> :
           <Info className="w-5 h-5 text-blue-400" />}
        </div>
        <div className="text-left space-y-0.5">
          <div className="text-xs font-bold">{toastMessage.title}</div>
          <div className="text-[11px] text-slate-300 leading-relaxed">{toastMessage.message}</div>
        </div>
      </div>
    </div>
  );
}
