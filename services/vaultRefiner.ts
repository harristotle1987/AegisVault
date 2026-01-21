/**
 * VaultRefiner: Sovereign Structural Intelligence Engine.
 * Consolidated into lowercase filename to resolve filesystem casing conflicts 
 * and satisfy primary compilation root requirements.
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

    // Step 1: Remove any existing instances of SOVEREIGN_H1 from the absolute beginning of the content.
    // This handles cases where it might be present due to previous hardening or manual input.
    // Use a regex that ignores leading whitespace and consumes any newlines after the H1.
    let processedContent = refined.replace(new RegExp(`^\\s*#\\s*${SOVEREIGN_H1_TEXT}\\s*\\n*`, 'i'), '');
    processedContent = processedContent.trimStart(); // Ensure no leading newlines/whitespace remain

    // Step 2: Check if the now-cleaned content starts with *any* Markdown H1.
    // We check `processedContent` as it's been stripped of any prior Sovereign H1.
    const startsWithAnyH1 = processedContent.startsWith('# ');

    // Step 3: Conditionally prepend SOVEREIGN_H1 based on the check.
    if (!startsWithAnyH1) {
        // If no H1 is present at the beginning of the processed content, add our canonical Sovereign H1.
        if (processedContent.length > 0) {
            refined = `${SOVEREIGN_H1}\n\n${processedContent}`;
        } else {
            // If content is completely empty after cleaning, just put the Sovereign H1.
            refined = SOVEREIGN_H1;
        }
    } else {
        // If an H1 was already present (user's own), use the processed content directly.
        refined = processedContent;
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