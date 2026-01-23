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
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
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
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.filter = 'grayscale(100%) contrast(150%)'; // HD Monochromatic Plate
      ctx.drawImage(videoRef.current, 0, 0);
      onCapture(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <Shield className="text-emerald-vault w-6 h-6" />
        <span className="text-xs font-black uppercase tracking-[0.3em] text-white">HD Plate Scanner</span>
      </div>
      
      <button onClick={onClose} className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full">
        <X size={28} />
      </button>

      <div className="relative w-full max-w-2xl aspect-[3/4] rounded-3xl overflow-hidden border-2 border-emerald-vault/20 shadow-sovereign bg-zinc-900">
        {!hasPermission && <div className="absolute inset-0 flex items-center justify-center text-vault-dim text-xs uppercase font-black">Awaiting Permission...</div>}
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-8 border border-white/20 rounded-xl pointer-events-none" />
      </div>

      <button onClick={capture} className="mt-12 w-20 h-20 rounded-full bg-emerald-vault flex items-center justify-center text-black shadow-lg active:scale-90 transition-transform">
        <Camera size={32} />
      </button>

      <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-vault-dim opacity-50">Sovereign Image Capture • No OCR Integrity</p>
    </div>
  );
};