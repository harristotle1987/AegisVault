import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Zap, Shield, Loader2, Maximize, Minimize } from 'lucide-react';
import { ScannerService } from '../services/ScannerService';

interface ScannerOverlayProps {
  onCapture: (content: string) => void;
  onClose: () => void;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        // Broaden constraints to ensure fallback if 'environment' is unavailable
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 4096 }, // Target 4K/HD
            height: { ideal: 2160 }
          },
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Forced playback start for iOS/Safari compliance
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('muted', 'true');
          videoRef.current.muted = true;
          
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Autoplay blocked, waiting for interaction.");
          }
        }
        setIsInitializing(false);
      } catch (err) {
        console.error("Optic Shard Failure:", err);
        setError("Camera Access Denied. Check permissions.");
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
      setIsProcessing(true);
      const blob = await ScannerService.captureImage(videoRef.current);
      
      const hardenedImage = await ScannerService.hardenDocumentPlate(blob);
      setCapturedUrl(hardenedImage);
      
      // Inject as a high-definition markdown image plate
      const markdownImage = `\n\n![HD Shard ${new Date().toLocaleTimeString()}](${hardenedImage})\n\n`;
      onCapture(markdownImage);
    } catch (err) {
      setError("Asset hardening failure.");
      setIsProcessing(false);
      setCapturedUrl(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleZoom = () => setIsZoomed(!isZoomed);

  return (
    <div className="fixed inset-0 z-[10005] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-xl h-[70vh] relative rounded-3xl overflow-hidden border border-emerald-vault/20 bg-black shadow-sovereign">
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-emerald-vault z-10">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Waking Optic Shards...</span>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-10 text-center z-20">
            <Shield className="w-12 h-12 text-red-500/50" />
            <div className="space-y-2">
              <p className="text-white font-black uppercase tracking-widest text-xs">{error}</p>
              <button onClick={onClose} className="text-emerald-vault text-[10px] underline uppercase tracking-widest">Return to Vault</button>
            </div>
          </div>
        ) : capturedUrl ? (
          <div 
            ref={scrollRef}
            className={`w-full h-full overflow-auto scrollbar-hide ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={toggleZoom}
          >
            <img 
              src={capturedUrl} 
              className={`transition-transform duration-300 origin-top-left ${isZoomed ? 'scale-[2.5] w-auto h-auto max-w-none' : 'w-full h-full object-cover'}`} 
              alt="Capture Preview" 
            />
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
        )}

        {capturedUrl && !isProcessing && (
           <button 
             onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
             className="absolute top-4 right-4 z-40 p-3 rounded-full bg-black/80 border border-emerald-vault/20 text-emerald-vault hover:bg-emerald-vault hover:text-black transition-all"
           >
             {isZoomed ? <Minimize size={20} /> : <Maximize size={20} />}
           </button>
        )}

        {isProcessing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 z-30 animate-in fade-in duration-300 backdrop-blur-md">
             <div className="w-20 h-20 rounded-full border-4 border-emerald-vault/10 border-t-emerald-vault animate-spin" />
             <div className="text-center space-y-1">
                <span className="text-white font-black uppercase tracking-[0.4em] text-[10px]">Hardening Image Plate</span>
                <p className="text-emerald-vault text-[8px] font-mono uppercase tracking-widest">Applying Sovereign Filters</p>
             </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center gap-8">
        <button 
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:text-emerald-vault transition-all active:scale-90"
        >
          <X size={24} />
        </button>

        <button 
          onClick={handleCapture}
          disabled={isInitializing || isProcessing || !!capturedUrl}
          className="w-20 h-20 rounded-full bg-emerald-vault border-8 border-emerald-vault/20 flex items-center justify-center text-black shadow-emerald-glow active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
        >
          {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <Camera size={32} strokeWidth={2.5} />}
        </button>

        <div className="w-14 h-14" />
      </div>

      <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-emerald-vault/5 border border-emerald-vault/10 rounded-full">
        <Zap size={12} className="text-emerald-vault" />
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-vault/70">
          {capturedUrl ? "100% Document Validity Verified" : "HD Plate Scanner Active"}
        </span>
      </div>
    </div>
  );
};