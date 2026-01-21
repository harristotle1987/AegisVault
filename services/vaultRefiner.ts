
/**
 * VaultRefiner: Sovereign Structural Intelligence Engine.
 * Consolidated implementation in lowercase filename to resolve casing conflicts.
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

    // 4. Identity Check: Ensure a single, non-duplicating leading H1
    const SOVEREIGN_H1_TEXT = 'Sovereign Entry';
    const SOVEREIGN_H1 = `# ${SOVEREIGN_H1_TEXT}`;

    // Clean all leading SOVEREIGN_H1 instances to prevent doubling
    const cleanupRegex = new RegExp(`^(\\s*#\\s*${SOVEREIGN_H1_TEXT}\\s*\\n*)+`, 'i');
    let contentOnly = refined.replace(cleanupRegex, '').trimStart();

    // Only prepend if the user hasn't provided their own H1
    if (!contentOnly.startsWith('# ')) {
      refined = contentOnly.length > 0 ? `${SOVEREIGN_H1}\n\n${contentOnly}` : SOVEREIGN_H1;
    } else {
      refined = contentOnly;
    }

    // 5. Sanitization
    refined = refined.replace(/<(script|iframe|object|embed).*?>.*?<\/\1>/gi, '');

    return refined.trim();
  }

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
