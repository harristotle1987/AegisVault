
/**
 * VaultRefiner: Sovereign Structural Intelligence Engine.
 * Operates entirely client-side to enforce "Executive" standards without external calls.
 */
export class VaultRefiner {
  /**
   * Refines raw markdown into a standardized, hardened format.
   */
  static refine(markdown: string): string {
    let refined = markdown.trim();

    // 1. Vertical Rhythm: Standardize whitespace
    refined = refined.replace(/\n{3,}/g, '\n\n');

    // 2. Executive Typography
    refined = refined
      .replace(/--/g, '—')
      .replace(/\.\.\./g, '…')
      .replace(/"([^"]*)"/g, '“$1”')
      .replace(/'([^']*)'/g, '‘$1’')
      .replace(/\(c\)/gi, '©')
      .replace(/\(r\)/gi, '®')
      .replace(/\(tm\)/gi, '™');

    // 3. Structural Hardening: Header & List Spacing
    refined = refined.replace(/^(#+)([^#\s])/gm, '$1 $2');
    refined = refined.replace(/^(\*|\-|\+)(?!\s)/gm, '$1 ');

    // 4. Identity Check: Ensure leading H1
    if (!/^#\s/m.test(refined) && refined.length > 0) {
      refined = `# Sovereign Entry\n\n${refined}`;
    }

    // 5. Sanitization: Strip dangerous HTML
    refined = refined.replace(/<(script|iframe|object|embed).*?>.*?<\/\1>/gi, '');

    return refined.trim();
  }

  /**
   * Generates a filename based on the document's primary heading.
   */
  static suggestFilename(markdown: string): string {
    const h1Match = markdown.match(/^#\s+(.*)$/m);
    if (h1Match && h1Match[1]) {
      return h1Match[1]
        .replace(/[^\w\s-]/gi, '')
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 32);
    }
    return `Vault_Archive_${new Date().getTime().toString().slice(-6)}`;
  }
}
