
import React, { useState, useEffect } from 'react';
import { Download, X, Shield } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isVaultReady, setIsVaultReady] = useState(false);

  useEffect(() => {
    // Listen for the custom "vault-ready" signal from Service Worker registration
    const readyHandler = () => setIsVaultReady(true);
    window.addEventListener('vault-ready', readyHandler);

    const promptHandler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const dismissed = localStorage.getItem('vault_install_dismissed');
      // Only show if vault environment is ready and not previously dismissed
      if (!dismissed && isVaultReady) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', promptHandler);
    
    return () => {
      window.removeEventListener('vault-ready', readyHandler);
      window.removeEventListener('beforeinstallprompt', promptHandler);
    };
  }, [isVaultReady]);

  // Secondary check if vault becomes ready after prompt event stashed
  useEffect(() => {
    if (isVaultReady && deferredPrompt && !localStorage.getItem('vault_install_dismissed')) {
      setIsVisible(true);
    }
  }, [isVaultReady, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('vault_install_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-6 right-6 md:left-auto md:bottom-10 md:right-10 md:w-96 z-[300] bg-obsidian-soft border border-emerald-vault/30 p-5 rounded-2xl shadow-sovereign animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-xl bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20 shrink-0">
          <Download className="w-6 h-6 text-emerald-vault" strokeWidth={2.5} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-[13px] font-black uppercase tracking-widest">Install AegisVault</h3>
            <Shield size={12} className="text-emerald-vault/40" />
          </div>
          <p className="text-vault-dim text-[11px] leading-relaxed font-medium">
            Add this sovereign archive to your home screen for zero-latency offline access and absolute privacy.
          </p>
          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleInstall} 
              className="flex-1 bg-emerald-vault text-obsidian px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-vault/90 transition-all shadow-lg shadow-emerald-vault/10 active:scale-95"
            >
              Install Protocol
            </button>
            <button 
              onClick={dismiss} 
              className="text-vault-dim hover:text-white px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors"
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
