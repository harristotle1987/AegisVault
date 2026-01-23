import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, Shield } from 'lucide-react';

interface ScannerOverlayProps {
  onCapture: (base64Img: string) => void;
  onClose: () => void;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment', 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 } 
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error('Camera access failed:', err);
      }
    }
    setupCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    // Maintain HD resolution
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      /**
       * Sovereign HD Monochrome Protocol:
       * High contrast + Grayscale for technical fidelity.
       */
      ctx.filter = 'grayscale(100%) contrast(160%) brightness(105%)';
      ctx.drawImage(videoRef.current, 0, 0);
      onCapture(canvas.toDataURL('image/jpeg', 0.95));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Shield className="text-emerald-vault w-6 h-6" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white leading-tight">HD Shard Plate</span>
          <span className="text-[8px] font-mono text-emerald-vault/50 uppercase tracking-widest">Capture.Type: MONOCHROME</span>
        </div>
      </div>
      
      <button onClick={onClose} className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-all active:scale-90">
        <X size={28} />
      </button>

      <div className="relative w-full max-w-2xl aspect-[3/4] rounded-3xl overflow-hidden border-2 border-emerald-vault/20 shadow-sovereign bg-zinc-900 group">
        {!hasPermission && (
          <div className="absolute inset-0 flex items-center justify-center text-vault-dim text-[10px] uppercase font-black tracking-widest animate-pulse">
            Awaiting Hardware Handshake...
          </div>
        )}
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        
        {/* Alignment Frame */}
        <div className="absolute inset-8 md:inset-12 border border-white/10 rounded-xl pointer-events-none flex items-center justify-center">
          <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-vault absolute top-0 left-0" />
          <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-vault absolute top-0 right-0" />
          <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-vault absolute bottom-0 left-0" />
          <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-vault absolute bottom-0 right-0" />
        </div>
      </div>

      <button 
        onClick={capture} 
        className="mt-12 w-24 h-24 rounded-full bg-emerald-vault flex items-center justify-center text-black shadow-[0_15px_45px_rgba(16,185,129,0.3)] active:scale-90 transition-all hover:scale-105"
      >
        <Camera size={36} />
      </button>

      <p className="mt-8 text-[9px] font-black uppercase tracking-[0.2em] text-vault-dim opacity-40 text-center max-w-[240px]">
        Sovereign Visual Capture Protocol. Zero Text interference ensured.
      </p>
    </div>
  );
};