import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Shield, Share, PlusSquare } from 'lucide-react';

/**
 * InstallPrompt: Targeted Android Sovereign Onboarding
 */
export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const android = /android/i.test(userAgent);
    
    setIsAndroid(android);

    // Suppress if not Android or already onboarded
    if (!android || localStorage.getItem('bunker_onboarded') === 'true') {
      return;
    }

    const promptHandler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', promptHandler);

    // Operational Delay (10 seconds)
    timerRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 10000); 

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setIsVisible(false);
      localStorage.setItem('bunker_onboarded', 'true');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('bunker_onboarded', 'true');
    }
    setIsVisible(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('bunker_onboarded', 'true');
  };

  if (!isVisible || !isAndroid) return null;

  return (
    <div className="fixed bottom-32 left-6 right-6 md:left-auto md:bottom-10 md:right-10 md:w-96 z-[99999] bg-obsidian-soft border border-emerald-vault/40 p-6 rounded-2xl shadow-sovereign animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-xl bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20 shrink-0">
          <Download className="w-6 h-6 text-emerald-vault" strokeWidth={2.5} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-[13px] font-black uppercase tracking-widest">
              Install AegisVault
            </h3>
            <Shield size={12} className="text-emerald-vault/40" />
          </div>
          
          <p className="text-vault-dim text-[11px] leading-relaxed font-medium pt-1">
            Add this sovereign archive to your home screen for zero-latency offline access and absolute privacy.
          </p>

          <div className="flex gap-4 pt-5">
            <button 
              onClick={handleInstall} 
              className="flex-1 bg-emerald-vault text-obsidian px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-vault/90 transition-all shadow-lg shadow-emerald-vault/10 active:scale-95"
            >
              Install Protocol
            </button>
            <button 
              onClick={dismiss} 
              className="text-vault-dim hover:text-white py-3 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-vault-dim hover:text-white transition-colors p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};