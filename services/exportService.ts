
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  ThematicBreak,
  AlignmentType
} from 'docx';
import { marked } from 'marked';
import { FontLoader } from './FontLoader';
import { VaultFont } from '../types';

/**
 * triggerSovereignDownload: Hardened Mobile Download Sequence.
 * Ensures binary blobs are delivered reliably across mobile OS boundaries.
 */
const triggerSovereignDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};

export class VaultConverter {
  /**
   * toPDF: High-fidelity Multi-page Slicing Engine.
   * Implements 0.5mm overlap (bleed) and JPEG 0.75 compression for seamless, lightweight exports.
   */
  static async toPDF(elementId: string, fileName: string = 'vault-export.pdf', fontMode: VaultFont = 'sans'): Promise<void> {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) throw new Error("Source element not found");

    // Hide UI elements to prevent black/gray boxes in export (Layer Integrity)
    const elementsToHide = document.querySelectorAll('.fixed, .sidebar, button, .md\\:hidden');
    elementsToHide.forEach(el => (el as HTMLElement).style.opacity = '0');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      await FontLoader.loadForPDF(pdf);

      const canvas = await html2canvas(sourceElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const area = clonedDoc.getElementById(elementId);
          if (area) {
            area.style.backgroundColor = '#ffffff';
            area.style.color = '#000000';
            area.style.padding = '20mm';
            area.style.height = 'auto';
            area.style.width = '794px'; // A4 scaling at 96dpi
            
            // Hardened Typography injection in clone
            if (fontMode === 'mono') {
              area.style.fontFamily = "'JetBrains Mono', monospace";
            } else {
              area.style.fontFamily = "'Inter', sans-serif";
            }

            area.querySelectorAll('*').forEach(child => {
              const el = child as HTMLElement;
              el.style.color = '#000000';
              if (el.tagName.startsWith('H')) {
                el.style.color = '#10B981'; // Emerald headers
                el.style.borderBottom = '1px solid rgba(16, 185, 129, 0.2)';
              }
            });
          }
        }
      });

      // JPEG 0.75 Compression: Reduces MBs to KBs
      const imgData = canvas.toDataURL('image/jpeg', 0.75); 
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfImgHeight;
      let position = 0; // Current Y offset in mm

      while (heightLeft > 0) {
        // Use 'FAST' interpolation for smaller PDF overhead
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfImgHeight, undefined, 'FAST');
        
        heightLeft -= (pdfHeight - 0.5); // Track with bleed
        // The 0.5mm overlap "hides" the stitching gap
        position -= (pdfHeight - 0.5);

        if (heightLeft > 0) {
          pdf.addPage();
        }
      }

      const blob = pdf.output('blob');
      triggerSovereignDownload(blob, fileName);
    } finally {
      // Restore UI visibility
      elementsToHide.forEach(el => (el as HTMLElement).style.opacity = '');
    }
  }

  /**
   * toDocx: Structural Native Word Mirroring.
   * Maps Markdown tokens to professional Word heading styles and Inter typography.
   */
  static async toDocx(markdown: string, fileName: string = 'vault-export.docx'): Promise<void> {
    const tokens = marked.lexer(markdown);
    const children: any[] = [];

    tokens.forEach((token) => {
      switch (token.type) {
        case 'heading':
          children.push(new Paragraph({
            children: [new TextRun({ 
              text: token.text, 
              color: '10B981', 
              bold: true,
              font: 'Inter',
              size: token.depth === 1 ? 32 : (token.depth === 2 ? 28 : 24)
            })],
            heading: token.depth === 1 ? HeadingLevel.HEADING_1 : 
                     token.depth === 2 ? HeadingLevel.HEADING_2 : 
                     HeadingLevel.HEADING_3,
            spacing: { before: 400, after: 200, line: 360 }, // 1.5 line height
          }));
          break;
        case 'paragraph':
          children.push(new Paragraph({
            children: [new TextRun({ text: token.text, size: 24, font: 'Inter' })],
            spacing: { after: 240, line: 360 },
          }));
          break;
        case 'list':
          token.items.forEach((item: any) => {
            children.push(new Paragraph({
              text: item.text,
              bullet: { level: 0 },
              spacing: { after: 120, line: 360 },
              children: [new TextRun({ text: item.text, font: 'Inter', size: 24 })]
            }));
          });
          break;
        case 'blockquote':
          children.push(new Paragraph({
            children: [new TextRun({ text: token.text, italic: true, color: '10B981', font: 'Inter', size: 24 })],
            indent: { left: 720 },
            spacing: { before: 200, after: 200, line: 360 },
          }));
          break;
        case 'hr':
          children.push(new ThematicBreak());
          break;
        default:
          if ('text' in token) {
            children.push(new Paragraph({ 
              children: [new TextRun({ text: token.text, font: 'Inter', size: 24 })] 
            }));
          }
      }
    });

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    triggerSovereignDownload(blob, fileName);
  }
}
