import { createWorker } from 'tesseract.js';

/**
 * Sovereign Scanner: Client-side OCR Engine
 * Role: Senior Architect
 * Logic: Hardened image-to-text conversion with advanced artifact scrubbing.
 */
export const ScannerService = {
  /**
   * Sanitizes OCR output to remove redundant formatting characters.
   * Fixes: __1. __ -> 1. , removes multiple underscores.
   */
  sanitize(text: string): string {
    return text
      // Remove artifacts like __1. __ or _Text_ that OCR often misinterprets from borders
      .replace(/__([0-9]+\.)\s*__/g, '$1 ') 
      .replace(/_{2,}/g, '') 
      // Ensure list items have a single space
      .replace(/^([0-9]+\.)\s+/gm, '$1 ')
      .replace(/^([\*\-\+])\s+/gm, '$1 ')
      // Clean up multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  async performOCR(imageBlob: Blob, onProgress?: (progress: number) => void): Promise<string> {
    const worker = await createWorker('eng');
    
    try {
      const { data: { text } } = await worker.recognize(imageBlob);
      return this.sanitize(text);
    } finally {
      await worker.terminate();
    }
  },

  async captureImage(videoElement: HTMLVideoElement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    // Maintain native aspect ratio for high-fidelity OCR
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context acquisition failure.");
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve, reject) => {
      // Use high-quality JPEG for best OCR contrast
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image serialization failure."));
      }, 'image/jpeg', 0.95);
    });
  }
};