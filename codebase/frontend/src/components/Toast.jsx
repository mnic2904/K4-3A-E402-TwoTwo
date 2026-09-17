import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function Toast() {
  const { toastMessage } = useAuth();
  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-3 duration-200">
      <div className="p-3.5 rounded-lg border border-stone-800 bg-stone-900 text-white shadow-xl flex items-start gap-2.5 max-w-sm">
        <div className="shrink-0 mt-0.5">
          {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
           isError ? <AlertCircle className="w-4 h-4 text-red-400" /> :
           <Info className="w-4 h-4 text-stone-400" />}
        </div>
        <div className="text-left space-y-0.5">
          <div className="text-xs font-semibold text-white">{toastMessage.title}</div>
          <div className="text-[11px] text-stone-400 leading-relaxed">{toastMessage.message}</div>
        </div>
      </div>
    </div>
  );
}

export default Toast;
