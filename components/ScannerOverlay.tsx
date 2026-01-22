import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Zap, Shield, Loader2 } from 'lucide-react';
import { ScannerService } from '../services/ScannerService';

interface ScannerOverlayProps {
  onCapture: (content: string) => void;
  onClose: () => void;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsInitializing(false);
      } catch (err) {
        setError("Camera access denied or unavailable.");
        setIsInitializing(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (capturedUrl) {
        URL.revokeObjectURL(capturedUrl);
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || isProcessing) return;
    
    try {
      const blob = await ScannerService.captureImage(videoRef.current);
      const url = URL.createObjectURL(blob);
      setCapturedUrl(url);
      setIsProcessing(true);
      
      const text = await ScannerService.performOCR(blob);
      onCapture(text);
    } catch (err) {
      setError("OCR Engine failure. Please try again.");
      setIsProcessing(false);
      setCapturedUrl(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-obsidian/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-xl h-[70vh] relative rounded-3xl overflow-hidden border border-emerald-vault/20 bg-black shadow-sovereign">
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-emerald-vault z-10">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Waking Optic Shards...</span>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10 text-center z-20">
            <Shield className="w-12 h-12 text-red-500/50" />
            <div className="space-y-2">
              <p className="text-white font-black uppercase tracking-widest text-xs">{error}</p>
              <button onClick={onClose} className="text-vault-dim text-[10px] underline uppercase tracking-widest">Return to Vault</button>
            </div>
          </div>
        ) : capturedUrl ? (
          <img 
            src={capturedUrl} 
            className="w-full h-full object-cover opacity-60 animate-in fade-in duration-500" 
            alt="Capture Preview" 
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-obsidian/40 z-30 animate-in fade-in duration-300">
             <div className="w-20 h-20 rounded-full border-4 border-emerald-vault/10 border-t-emerald-vault animate-spin" />
             <div className="text-center space-y-1">
                <span className="text-white font-black uppercase tracking-[0.4em] text-[10px]">Hardening Text Matrix</span>
                <p className="text-vault-dim text-[8px] font-mono uppercase tracking-widest">Tesseract.Core In-Situ</p>
             </div>
          </div>
        )}

        {!isInitializing && !error && !isProcessing && !capturedUrl && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[80%] h-[80%] border-2 border-emerald-vault/20 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-vault rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-vault rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-vault rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-vault rounded-br-xl" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center gap-8">
        <button 
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-vault-dim hover:text-white transition-all active:scale-90"
        >
          <X size={24} />
        </button>

        <button 
          onClick={handleCapture}
          disabled={isInitializing || isProcessing || !!error}
          className="w-20 h-20 rounded-full bg-emerald-vault border-8 border-emerald-vault/20 flex items-center justify-center text-black shadow-emerald-glow active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
        >
          {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <Camera size={32} strokeWidth={2.5} />}
        </button>

        <div className="w-14 h-14" />
      </div>

      <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-emerald-vault/5 border border-emerald-vault/10 rounded-full">
        <Zap size={12} className="text-emerald-vault" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-vault/70">Sovereign OCR Protocol Active</span>
      </div>
    </div>
  );
};