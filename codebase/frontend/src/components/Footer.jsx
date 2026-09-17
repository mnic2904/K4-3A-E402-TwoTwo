import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-stone-200 bg-white py-5 text-stone-500 text-xs text-left shrink-0 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-stone-600">
          <span className="font-bold text-stone-900">VLearn</span>
          <span>·</span>
          <span>Nền tảng học tập và ôn tập AI</span>
        </div>
        <div className="text-stone-400">
          © 2026 VLearn. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
