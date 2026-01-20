
import React from 'react';
import { VaultFont } from '../types';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  font?: VaultFont;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange, font = 'mono' }) => {
  const fontClass = font === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="h-10 px-4 flex items-center justify-between bg-obsidian-soft border-b border-vault-border text-[10px] uppercase tracking-widest text-vault-dim font-bold">
        <span>Source</span>
        <span className="text-[9px] opacity-50">UTF-8</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex-1 bg-obsidian p-8 focus:outline-none resize-none text-sm leading-relaxed text-vault-text placeholder:text-zinc-800 caret-emerald-vault ${fontClass}`}
        placeholder="Commence entry..."
        spellCheck={false}
      />
    </div>
  );
};
