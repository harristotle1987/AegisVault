import { createWorker } from 'tesseract.js';

/**
 * Sovereign Scanner: Client-side OCR Engine
 * Role: Senior Architect
 * Logic: Hardened image-to-text conversion with zero telemetry.
 */
export const ScannerService = {
  async performOCR(imageBlob: Blob, onProgress?: (progress: number) => void): Promise<string> {
    const worker = await createWorker('eng');
    
    try {
      const { data: { text } } = await worker.recognize(imageBlob);
      return text;
    } finally {
      await worker.terminate();
    }
  },

  async captureImage(videoElement: HTMLVideoElement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context acquisition failure.");
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image serialization failure."));
      }, 'image/jpeg', 0.95);
    });
  }
};
