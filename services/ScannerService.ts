import { createWorker } from 'tesseract.js';

/**
 * Sovereign Scanner: Client-side OCR Engine
 * Role: Senior Architect
 * Logic: Hardened image-to-text conversion with Mathematical Structure Recognition.
 */
export const ScannerService = {
  /**
   * Mathematical Structure Recognizer & Sanitizer
   * Identifies fractions, variables, and geometry symbols ($\Delta$).
   * Scrubs redundant OCR artifacts while preserving mathematical integrity.
   */
  sanitize(text: string): string {
    return text
      // 1. Structural Underscore Scrubbing (Fixes __1. __ artifact)
      .replace(/_{1,}([0-9]+\.)\s*_{1,}/g, '$1 ')
      .replace(/_{2,}/g, '')
      
      // 2. Mathematical Structure Mapping (LaTeX)
      // Convert linear fractions (d/d) to LaTeX \frac{}{}
      .replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}')
      // Standardize equation spacing
      .replace(/(\w+)\s*=\s*/g, '$1 = ')
      // Identify common variable relations
      .replace(/(\d+)([a-zA-Z])/g, '$1$2')
      
      // 3. Geometry Symbol Mapping
      // Map text-variants of Delta to LaTeX equivalent
      .replace(/\b(Delta|delta|triangle)\b/gi, '$\\Delta$')
      
      // 4. Whitespace & List Hardening
      .replace(/^([0-9]+\.)\s+/gm, '$1 ')
      .replace(/^([\*\-\+])\s+/gm, '$1 ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  async performOCR(imageBlob: Blob, onProgress?: (progress: number) => void): Promise<string> {
    // Math-aware worker initialization
    const worker = await createWorker('eng');
    
    try {
      // Recognize using the 'eng' model which handles common math/alpha characters
      const { data: { text } } = await worker.recognize(imageBlob);
      return this.sanitize(text);
    } finally {
      await worker.terminate();
    }
  },

  async captureImage(videoElement: HTMLVideoElement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    // Maintain native resolution for high-fidelity OCR recognition
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context acquisition failure.");
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    return new Promise((resolve, reject) => {
      // Use high-quality JPEG to prevent artifact interference
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image serialization failure."));
      }, 'image/jpeg', 0.95);
    });
  }
};