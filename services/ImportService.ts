import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

export const ImportService = {
  /**
   * Universal Sanitizer: Purges legacy artifacts and structural noise.
   */
  sanitize(content: string): string {
    return content
      .replace(/__\d+\.__/g, '') // Absolute purge of __1.__ pattern
      .replace(/_\d+\._/g, '')
      .replace(/\d+\.\s\_\_/g, ' ')
      .replace(/@\w+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  },

  async processFile(file: File): Promise<{ title: string, content: string }> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const title = file.name.replace(/\.[^/.]+$/, "");
    
    try {
      let content = '';
      if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToMarkdown({ arrayBuffer });
        content = result.value;
      } else if (extension === 'txt' || extension === 'md') {
        content = await file.text();
      } else {
        throw new Error('Unsupported format');
      }

      return { title, content: this.sanitize(content) };
    } catch (err) {
      console.error('Ingestion failure:', err);
      throw err;
    }
  }
};