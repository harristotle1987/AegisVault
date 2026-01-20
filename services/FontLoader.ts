
/**
 * FontLoader: Virtual File System (VFS) for high-fidelity typography.
 */
export const VAULT_FONTS = {
  // Placeholder binary data - In production, these are full Base64 strings.
  INTER_REGULAR: "AAEAAAARAQAABAAQR0RFR...[BASE64_PLACEHOLDER]",
  JETBRAINS_MONO: "AAEAAAARAQAABAAQR0RFR...[BASE64_PLACEHOLDER]",
};

export class FontLoader {
  /**
   * Hydrates the jsPDF instance with custom fonts from the local VFS.
   */
  static async loadForPDF(doc: any) {
    try {
      doc.addFileToVFS("Inter-Regular.ttf", VAULT_FONTS.INTER_REGULAR);
      doc.addFileToVFS("JetBrainsMono.ttf", VAULT_FONTS.JETBRAINS_MONO);
      doc.addFont("Inter-Regular.ttf", "Inter", "normal");
      doc.addFont("JetBrainsMono.ttf", "JetBrains", "normal");
      doc.setFont("Inter");
    } catch (e) {
      console.warn("Vault VFS Font Injection bypassed. Using system fallbacks.");
    }
  }

  /**
   * Utility to bufferize Base64 for Docx embedding.
   */
  static getBuffer(base64: string): Uint8Array {
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
