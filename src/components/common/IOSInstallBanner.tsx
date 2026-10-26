import React, { useState, useEffect } from 'react';
import { X, Share2, Plus, Smartphone } from 'lucide-react';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}
function isSafariOnly() {
  return /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
}
function isStandalone() {
  return (window.navigator as any).standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

export const IOSInstallBanner: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ios_banner_dismissed');
    if (!dismissed && isIOS() && isSafariOnly() && !isStandalone()) {
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white border border-rosepink-200 rounded-2xl shadow-soft-lg p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <img src="/hercycle-logo.png" alt="" className="w-9 h-9 object-contain rounded-xl" />
          <div>
            <p className="text-sm font-bold text-burgundy-900">Install HER CYCLE</p>
            <p className="text-[11px] text-gray-500">Add to your Home Screen</p>
          </div>
        </div>
        <button
          onClick={() => { setShow(false); sessionStorage.setItem('ios_banner_dismissed', '1'); }}
          className="p-1 rounded-full text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <ol className="space-y-2">
        <li className="flex items-center gap-2 text-xs text-gray-700">
          <span className="w-5 h-5 rounded-full bg-burgundy-100 text-burgundy-800 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
          <span>Tap <strong>Share</strong></span>
          <Share2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>in Safari's toolbar</span>
        </li>
        <li className="flex items-center gap-2 text-xs text-gray-700">
          <span className="w-5 h-5 rounded-full bg-burgundy-100 text-burgundy-800 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
          <span>Tap <strong>Add to Home Screen</strong></span>
          <Plus className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        </li>
        <li className="flex items-center gap-2 text-xs text-gray-700">
          <span className="w-5 h-5 rounded-full bg-burgundy-100 text-burgundy-800 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
          <span>Tap <strong>Add</strong> — opens like a native app</span>
          <Smartphone className="w-3.5 h-3.5 text-green-500 shrink-0" />
        </li>
      </ol>
      <p className="text-[10px] text-gray-400 mt-2">iPhone &amp; iPad only. Requires Safari &amp; HTTPS deployment.</p>
    </div>
  );
};
