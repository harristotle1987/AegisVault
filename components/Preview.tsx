import React, { useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { marked } from 'marked';
import { VaultFont } from '../types';

interface PreviewProps {
  content: string;
  font?: VaultFont;
  activeDocId?: string | null;
}

export const Preview: React.FC<PreviewProps> = ({ content, font = 'sans', activeDocId }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrolledId = useRef<string | null>(null);

  const html = useMemo(() => {
    return marked.parse(content, { 
      breaks: true, 
      gfm: true,
      mangle: false,
      headerIds: false
    });
  }, [content]);

  /**
   * Renderer Sync
   */
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = html;
    }
  }, [html]);

  /**
   * Sovereign Scroll Stability Protocol:
   * Sync to bottom ONLY when switching shards.
   * This ensures the user is oriented to latest changes upon opening,
   * but prevents the view from jumping away during active editing.
   */
  useLayoutEffect(() => {
    if (activeDocId && activeDocId !== lastScrolledId.current) {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'auto'
        });
        lastScrolledId.current = activeDocId;
      }
    }
  }, [activeDocId]);

  const fontClass = font === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-10 px-6 flex items-center justify-between bg-obsidian-soft border-b border-vault-border shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-vault animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-vault-dim font-bold">
            Live Rendering
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-vault-dim/30 border border-vault-border px-2 py-0.5 rounded">ISO 216: A4</span>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-obsidian-soft no-scrollbar vault-editor-scroll"
      >
        <div className="max-w-4xl mx-auto min-h-full flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.4)]">
          <div 
            id="preview-area"
            ref={previewRef}
            className={`flex-1 p-16 md:p-24 prose-vault selection:bg-emerald-vault/20 transition-all duration-500 ease-in-out ${fontClass}`}
          />
          
          <div className="h-32 flex items-center justify-center border-t border-vault-border/20 mt-8 mb-24">
            <div className="flex flex-col items-center gap-2 opacity-20">
              <div className="w-1 h-1 rounded-full bg-white" />
              <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-white">End of Draft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};