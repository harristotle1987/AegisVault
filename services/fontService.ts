
/**
 * VAULT_FONTS: Virtual File System for high-fidelity typography.
 * In a production environment, these placeholders would be replaced with 
 * full Base64 encoded .ttf strings for Inter and JetBrains Mono.
 */
export const VAULT_FONTS = {
  // Placeholders for actual font binary data
  INTER_REGULAR: "AAEAAAARAQAABAAQR0RFR...[BASE64_PLACEHOLDER]",
  JETBRAINS_MONO: "AAEAAAARAQAABAAQR0RFR...[BASE64_PLACEHOLDER]",
};

export class FontLoaderService {
  /**
   * Hydrates the jsPDF instance with custom fonts.
   */
  static async loadForPDF(doc: any) {
    try {
      // 1. Add to Virtual File System
      doc.addFileToVFS("Inter-Regular.ttf", VAULT_FONTS.INTER_REGULAR);
      doc.addFileToVFS("JetBrainsMono.ttf", VAULT_FONTS.JETBRAINS_MONO);

      // 2. Register with the document
      doc.addFont("Inter-Regular.ttf", "Inter", "normal");
      doc.addFont("JetBrainsMono.ttf", "JetBrains", "normal");
      
      // 3. Set default
      doc.setFont("Inter");
    } catch (e) {
      console.warn("Custom fonts could not be loaded into PDF VFS. Falling back to system fonts.");
    }
  }

  /**
   * Converts Base64 to Uint8Array for docx.js embedding.
   */
  static getDocxFontBuffer(base64: string): Uint8Array {
    try {
      const pureBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
      const binaryString = window.atob(pureBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (e) {
      return new Uint8Array();
    }
  }
}
