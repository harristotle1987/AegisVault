
/**
 * VaultRefiner: Sovereign Structural Intelligence Engine.
 * Moved here to resolve casing conflict between vaultRefiner.ts and VaultRefiner.ts.
 */
export class VaultRefiner {
  /**
   * Refines raw markdown into a standardized, hardened format.
   */
  static refine(markdown: string): string {
    let refined = this.formatTables(markdown.trim());

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

    // 5.5 Badge Protocol: Automatic status highlighting
    const badgeMap: Record<string, string> = {
      'Submitted': 'success',
      'Active': 'success',
      'Pending': 'warning',
      'In Progress': 'warning',
      'Term Closed': 'neutral',
      'Closed': 'danger',
      'Draft': 'neutral',
      'Verified': 'success',
      'Critical': 'danger',
      'Approved': 'success',
      'Rejected': 'danger'
    };

    Object.entries(badgeMap).forEach(([text, type]) => {
      const regex = new RegExp(`\\b${text}\\b`, 'g');
      refined = refined.replace(regex, `<span class="vault-badge vault-badge-${type}">${text}</span>`);
    });

    return refined.trim();
  }

  /**
   * Specifically handles ASCII table conversion and large table collapsing.
   */
  static formatTables(markdown: string): string {
    let refined = markdown;

    // 6. ASCII Table Conversion Protocol
    // Detects +---+ style tables and converts them to markdown
    const asciiTableRegex = /^(\+[ \-+]+\+\n)(\|.+\|\n)(\+[ \-+]+\+\n)((\|.+\|\n)(\+[ \-+]+\+\n?)*)+/gm;
    refined = refined.replace(asciiTableRegex, (match) => {
      const lines = match.trim().split('\n');
      const markdownRows: string[] = [];
      let currentMarkdownRow: string[] = [];
      
      lines.forEach(line => {
        if (line.startsWith('|')) {
          const cells = line.split('|')
            .filter((cell, index, array) => index > 0 && index < array.length - 1)
            .map(cell => cell.trim());
          
          if (currentMarkdownRow.length === 0) {
            currentMarkdownRow = cells;
          } else {
            // Append multi-line content with <br>
            cells.forEach((cell, i) => {
              if (cell) {
                currentMarkdownRow[i] = currentMarkdownRow[i] 
                  ? `${currentMarkdownRow[i]}<br>${cell}` 
                  : cell;
              }
            });
          }
        } else if (line.startsWith('+')) {
          if (currentMarkdownRow.length > 0) {
            markdownRows.push(`| ${currentMarkdownRow.join(' | ')} |`);
            
            // Add separator after header
            if (markdownRows.length === 1) {
              const separator = `| ${currentMarkdownRow.map(() => '---').join(' | ')} |`;
              markdownRows.push(separator);
            }
            currentMarkdownRow = [];
          }
        }
      });
      
      return `\n${markdownRows.join('\n')}\n`;
    });

    // 7. Concise Table Protocol: Removed automatic collapsing to ensure high-fidelity rendering
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
