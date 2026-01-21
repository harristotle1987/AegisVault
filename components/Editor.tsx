import React, { useRef } from 'react';
import { VaultFont } from '../types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  font?: VaultFont;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, font = 'mono' }) => {
  const fontClass = font === 'mono' ? 'font-mono' : 'font-sans';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    // Explicitly prevent browser from attempting to scroll the page body
    window.scrollTo(0, 0);
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
        <textarea
          ref={textareaRef}
          value={value}
          onFocus={handleFocus}
          onChange={(e) => onChange(e.target.value)}
          className={`absolute inset-0 w-full h-full bg-obsidian p-8 md:p-12 focus:outline-none resize-none text-sm leading-relaxed text-vault-text placeholder:text-zinc-800 caret-emerald-vault transition-colors overflow-y-auto vault-editor-scroll ${fontClass}`}
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