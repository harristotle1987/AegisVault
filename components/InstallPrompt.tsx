import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPromptProps {
  forceAndroidOnly?: boolean;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ forceAndroidOnly = true }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent);
    if (forceAndroidOnly && !isAndroid) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setIsVisible(true), 10000); // 10s sovereign delay
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [forceAndroidOnly]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-32 left-6 right-6 md:left-auto md:right-10 md:bottom-10 md:w-80 bg-zinc-900 border border-emerald-vault/40 p-6 rounded-2xl shadow-sovereign z-[99999] animate-in slide-in-from-bottom-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <h3 className="text-white text-xs font-black uppercase tracking-widest">Install Protocol</h3>
          <button onClick={() => setIsVisible(false)}><X size={16} /></button>
        </div>
        <p className="text-vault-dim text-[11px] leading-relaxed">Add AegisVault to your home screen for zero-latency offline access.</p>
        <button 
          onClick={() => { deferredPrompt?.prompt(); setIsVisible(false); }}
          className="w-full py-3 bg-emerald-vault text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
        >
          Accept Shard
        </button>
      </div>
    </div>
  );
};