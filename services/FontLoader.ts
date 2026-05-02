/**
 * FontLoader: Virtual File System (VFS) for high-fidelity typography.
 * Embeds binary font data directly into binary output streams.
 */

// Placeholder binary strings representing font files. 
// In a production environment, these would be the full base64 strings of .ttf files.
export const VAULT_FONTS = {
  // Using simplified placeholders that standard PDF engines can map or replace if missing.
  // Full base64 blobs for Inter and JetBrains Mono would go here.
  // Dummy Base64 strings for demonstration purposes.
  INTER_REGULAR: "AAEAAAALAIAAAgQgBEM...[ACTUAL_INTER_FONT_BASE64]", // Placeholder for Inter Regular
  JETBRAINS_MONO: "AAEAAAALAIAAAgQgBEM...[ACTUAL_JETBRAINS_FONT_BASE64]", // Placeholder for JetBrains Mono
};

export class FontLoader {
  /**
   * Hydrates the jsPDF instance with custom fonts from the local VFS.
   */
  static async loadForPDF(doc: any) {
    try {
      // Logic for adding fonts if real base64 were present
      if (VAULT_FONTS.INTER_REGULAR && !VAULT_FONTS.INTER_REGULAR.includes("ACTUAL_INTER_FONT_BASE64")) {
        doc.addFileToVFS("Inter-Regular.ttf", VAULT_FONTS.INTER_REGULAR);
        doc.addFont("Inter-Regular.ttf", "Inter", "normal");
      }
      
      if (VAULT_FONTS.JETBRAINS_MONO && !VAULT_FONTS.JETBRAINS_MONO.includes("ACTUAL_JETBRAINS_FONT_BASE64")) {
        doc.addFileToVFS("JetBrainsMono-Regular.ttf", VAULT_FONTS.JETBRAINS_MONO);
        doc.addFont("JetBrainsMono-Regular.ttf", "JetBrains", "normal");
      }

      // Default font setting
      doc.setFont("Helvetica"); // Fallback
    } catch (e) {
      console.warn("Vault VFS Font Injection bypassed. Using standard system fallbacks.");
    }
  }

  /**
   * Utility to bufferize Base64 for Docx embedding.
   */
  static getBuffer(base64: string): Uint8Array {
    if (!base64 || base64.includes("ACTUAL_INTER_FONT_BASE64") || base64.includes("ACTUAL_JETBRAINS_FONT_BASE64")) {
      return new Uint8Array();
    }
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