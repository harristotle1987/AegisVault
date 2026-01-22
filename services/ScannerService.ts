import { createWorker } from 'tesseract.js';

/**
 * Sovereign Scanner: Client-side OCR Engine
 * Role: Senior Architect
 * Logic: Hardened image-to-text conversion with surgical artifact scrubbing.
 */
export const ScannerService = {
  /**
   * Sanitizes OCR output to remove redundant formatting characters.
   * Fixes: __1. __ -> 1. , removes stray underscores and math-noise.
   */
  sanitize(text: string): string {
    return text
      // Remove specific artifact patterns like __1. __
      .replace(/_{1,}([0-9]+\.)\s*_{1,}/g, '$1 ')
      // Remove stray underscore lines often seen in OCR of columns or margins
      .replace(/_{2,}/g, '')
      // Remove leading/trailing underscores from words
      .replace(/\b_(\w+)\b/g, '$1')
      .replace(/\b(\w+)_\b/g, '$1')
      // Normalize list formatting (Ensure single space after bullet/number)
      .replace(/^([0-9]+\.)\s+/gm, '$1 ')
      .replace(/^([\*\-\+])\s+/gm, '$1 ')
      // Remove artifacts from mathematical notation blocks (common in OCR)
      .replace(/\|/g, '') // Remove stray pipes
      // Clean up multiple newlines to maintain GFM rhythm
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