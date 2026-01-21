import React, { useRef, useEffect, useState } from 'react';
import { VaultFont } from '../types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  font?: VaultFont;
  activeDocId?: string | null;
}

/**
 * Editor: Sovereign Text Entry Interface
 * Optimized for vertical stability and high-cadence editing.
 */
export const Editor: React.FC<EditorProps> = ({ value, onChange, font = 'mono', activeDocId }) => {
  const fontClass = font === 'mono' ? 'font-mono' : 'font-sans';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastScrolledId = useRef<string | null>(null);
  
  // Internal state to handle rapid typing without cursor jumps
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value when switching documents or external refinement
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Sovereign Scroll Stability Protocol: 
  // Focus on latest text ONLY ONCE when a new shard is activated.
  useEffect(() => {
    if (activeDocId && activeDocId !== lastScrolledId.current) {
      if (textareaRef.current) {
        const el = textareaRef.current;
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
          lastScrolledId.current = activeDocId;
        });
      }
    }
  }, [activeDocId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-obsidian">
      <div className="h-10 px-4 flex items-center justify-between bg-obsidian-soft border-b border-vault-border text-[10px] uppercase tracking-widest text-vault-dim font-bold shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-vault/40" />
          <span>Source Editor</span>
        </div>
        <span className="text-[9px] opacity-50 font-mono">MD.GFM</span>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {/* pb-[200px] provides absolute scroll headroom above floating UI */}
        <textarea
          ref={textareaRef}
          value={internalValue}
          onChange={handleChange}
          className={`absolute inset-0 w-full h-full bg-obsidian p-8 md:p-12 pb-[200px] md:pb-[200px] focus:outline-none resize-none text-sm leading-relaxed text-vault-text placeholder:text-zinc-800 caret-emerald-vault transition-colors overflow-y-auto vault-editor-scroll ${fontClass}`}
          placeholder="Commence entry..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
};