import React, { useEffect, useState } from 'react';
import { X, Moon, Shield, ShieldCheck, Save, Database, EyeOff, Zap, Layout, Monitor, RefreshCcw, Volume2 } from 'lucide-react';
import { VaultFont } from '../../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  docCount: number;
  activeFont: VaultFont;
  setActiveFont: (font: VaultFont) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speechPitch: number;
  setSpeechPitch: (pitch: number) => void;
  selectedVoiceURI: string | null;
  setSelectedVoiceURI: (uri: string | null) => void;
}

const ToggleOption = ({ label, description, defaultOn, icon }: { label: string, description: string, defaultOn?: boolean, icon: React.ReactNode }) => {
  const [isOn, setIsOn] = useState(defaultOn || false);
  return (
    <button 
      onClick={() => setIsOn(!isOn)}
      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-vault-border hover:bg-white/[0.04] transition-all group active:scale-[0.98] touch-manipulation"
    >
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOn ? 'bg-emerald-vault/20 text-emerald-vault' : 'bg-white/5 text-vault-dim'}`}>
          {icon}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-[10px] font-bold text-vault-text uppercase tracking-widest">{label}</span>
          <span className="text-[9px] text-vault-dim font-medium">{description}</span>
        </div>
      </div>
      <div className={`w-10 h-5 rounded-full p-1 transition-colors ${isOn ? 'bg-emerald-vault' : 'bg-vault-border'}`}>
        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </button>
  );
};

export const ConfigModal: React.FC<ConfigModalProps> = ({ 
  isOpen, 
  onClose, 
  docCount, 
  activeFont, 
  setActiveFont,
  speechRate,
  setSpeechRate,
  speechPitch,
  setSpeechPitch,
  selectedVoiceURI,
  setSelectedVoiceURI
}) => {
  const [isPurging, setIsPurging] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
      window.location.reload();
    } catch (err) {
      console.error('Purge sequence failure:', err);
      setIsPurging(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-obsidian/40 backdrop-blur-sm z-[150] transition-all duration-500 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'}`}
        onClick={onClose}
      />

      <div className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-obsidian-soft border-l border-vault-border z-[160] shadow-sovereign 
        transform transition-transform duration-500 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0 pointer-events-auto visible' : 'translate-x-full pointer-events-none invisible'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-vault-border bg-obsidian">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-vault/10 flex items-center justify-center border border-emerald-vault/20">
              <Database className="text-emerald-vault w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-white font-black text-xs uppercase tracking-[0.4em]">System Configuration</h2>
              <span className="text-[8px] font-mono text-emerald-vault/50 uppercase tracking-widest">Aegis.Core: Operational</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-emerald-vault/10 rounded-full text-emerald-vault transition-all active:scale-90"
            aria-label="Close Settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 no-scrollbar">
          <section className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-obsidian-muted/30 border border-vault-border space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-vault-dim">Shard Count</span>
              <div className="text-sm font-bold text-white">{docCount} Archives</div>
            </div>
            <div className="p-4 rounded-xl bg-obsidian-muted/30 border border-vault-border space-y-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-vault-dim">Environment</span>
              <div className="text-sm font-bold text-emerald-vault">Sandboxed</div>
            </div>
          </section>

          {/* Acoustic Protocol Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Volume2 size={12} className="text-emerald-vault" />
              <h3 className="text-[10px] font-black text-emerald-vault uppercase tracking-[0.3em]">Acoustic Engine</h3>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.02] border border-vault-border space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-vault-text uppercase tracking-widest">Voice Profile</span>
                  {selectedVoiceURI && (
                    <span className="text-[8px] font-mono text-emerald-vault bg-emerald-vault/10 px-2 py-0.5 rounded">
                      {voices.find((v, i) => `${v.voiceURI}||${v.name}||${v.lang}||${i}` === selectedVoiceURI)?.name || 'Custom'}
                    </span>
                  )}
                </div>
                <select 
                  value={selectedVoiceURI || ''} 
                  onChange={(e) => setSelectedVoiceURI(e.target.value || null)}
                  className="w-full bg-obsidian border border-vault-border rounded-lg p-3 text-xs text-vault-text focus:outline-none focus:border-emerald-vault transition-colors"
                >
                  <option value="">System Default</option>
                  {voices.map((voice, index) => {
                    const uniqueId = `${voice.voiceURI}||${voice.name}||${voice.lang}||${index}`;
                    return (
                      <option key={uniqueId} value={uniqueId}>
                        {voice.name} ({voice.lang})
                      </option>
                    );
                  })}
                </select>
                <button 
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setTimeout(() => {
                      const utter = new SpeechSynthesisUtterance("Voice profile synchronized and active.");
                      utter.rate = speechRate;
                      utter.pitch = speechPitch;
                      const voicesList = window.speechSynthesis.getVoices();
                      if (selectedVoiceURI) {
                        const [uri, name, lang, indexStr] = selectedVoiceURI.split('||');
                        const index = parseInt(indexStr, 10);
                        
                        // Multi-stage matching
                        let voice = voicesList[index];
                        if (!voice || voice.voiceURI !== uri || voice.name !== name) {
                          voice = voicesList.find(v => v.voiceURI === uri && v.name === name) || 
                                  voicesList.find(v => v.voiceURI === uri) || 
                                  null;
                        }
                        
                        if (voice) {
                          utter.voice = voice;
                          utter.lang = voice.lang;
                        }
                      }
                      window.speechSynthesis.speak(utter);
                    }, 100);
                  }}
                  className="w-full py-3 bg-emerald-vault/10 hover:bg-emerald-vault/20 text-emerald-vault border border-emerald-vault/30 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Zap size={12} /> Sync & Test Voice Profile
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-vault-text uppercase tracking-widest">Voice Character Presets</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Adult Male', pitch: 0.9, rate: 1.0 },
                    { label: 'Child Male', pitch: 1.4, rate: 1.1 },
                    { label: 'Adult Female', pitch: 1.1, rate: 1.0 },
                    { label: 'Child Female', pitch: 1.6, rate: 1.1 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setSpeechPitch(preset.pitch);
                        setSpeechRate(preset.rate);
                      }}
                      className="py-2 px-3 bg-white/[0.03] border border-vault-border rounded-lg text-[9px] font-bold text-vault-dim hover:border-emerald-vault/50 hover:text-emerald-vault transition-all active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-vault-text uppercase tracking-widest">Vocal Pitch (Child ↔ Adult)</span>
                  <span className="text-[10px] font-mono text-emerald-vault">{speechPitch.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  value={speechPitch} 
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-emerald-vault"
                />
                <div className="flex justify-between text-[8px] text-vault-dim uppercase font-bold tracking-tighter">
                  <span>Deep / Adult</span>
                  <span>High / Child</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-vault-text uppercase tracking-widest">Listen Speed</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0.1" 
                      max="10" 
                      value={speechRate} 
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value) || 1)}
                      className="w-12 bg-transparent border-b border-vault-border text-center text-[10px] font-mono text-emerald-vault focus:outline-none focus:border-emerald-vault"
                    />
                    <span className="text-[10px] font-mono text-emerald-vault">x</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[0.5, 1, 2, 3, 5, 10].map(rate => (
                    <button 
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all border ${
                        speechRate === rate 
                          ? 'bg-emerald-vault text-black border-emerald-vault' 
                          : 'bg-vault-dim/5 text-vault-dim border-vault-border hover:border-vault-dim/30'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10.0" 
                  step="0.1" 
                  value={speechRate} 
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-vault"
                />
              </div>
              <p className="text-[9px] text-vault-dim leading-relaxed font-medium italic opacity-60">Adjusts the playback frequency and voice profile of the chunked audio engine.</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Shield size={12} className="text-emerald-vault" />
              <h3 className="text-[10px] font-black text-emerald-vault uppercase tracking-[0.3em]">Privacy Hardening</h3>
            </div>
            <div className="space-y-3">
              <ToggleOption 
                label="Auto-Purge Session" 
                description="Clear local RAM on vault exit" 
                icon={<Zap size={14} />}
              />
              <ToggleOption 
                label="Stealth Mode" 
                description="Hide UI elements during export" 
                defaultOn 
                icon={<EyeOff size={14} />}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Layout size={12} className="text-vault-dim" />
              <h3 className="text-[10px] font-black text-vault-dim uppercase tracking-[0.3em]">Visual Logic</h3>
            </div>
            <div className="p-6 rounded-2xl bg-obsidian-muted border border-vault-border space-y-4">
              <div className="grid grid-cols-2 gap-3 relative z-[170]">
                <button 
                  onClick={() => setActiveFont('sans')}
                  className={`flex flex-col items-center gap-2 py-4 border rounded-xl transition-all active:scale-95 ${
                    activeFont === 'sans' 
                      ? 'border-emerald-vault/40 bg-emerald-vault/5 text-emerald-vault' 
                      : 'border-vault-border bg-white/[0.02] text-vault-dim hover:border-vault-border/50'
                  }`}
                >
                  <Monitor size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Inter (Sans)</span>
                </button>
                <button 
                  onClick={() => setActiveFont('mono')}
                  className={`flex flex-col items-center gap-2 py-4 border rounded-xl transition-all active:scale-95 ${
                    activeFont === 'mono' 
                      ? 'border-emerald-vault/40 bg-emerald-vault/5 text-emerald-vault' 
                      : 'border-vault-border bg-white/[0.02] text-vault-dim hover:border-vault-border/50'
                  }`}
                >
                  <Database size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Mono (Draft)</span>
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4 pb-10">
            <div className="flex items-center gap-2 px-1">
              <RefreshCcw size={12} className="text-red-400" />
              <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">Maintenance Protocol</h3>
            </div>
            <button 
              onClick={handlePurge}
              disabled={isPurging}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all group active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                  <RefreshCcw size={14} className={isPurging ? 'animate-spin' : ''} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Purge Cache & Update</span>
                  <span className="text-[9px] text-vault-dim font-medium">Reset PWA shell & local assets</span>
                </div>
              </div>
            </button>
          </section>
        </div>

        <div className="p-6 bg-obsidian border-t border-vault-border">
           <button 
             onClick={onClose}
             className="w-full py-5 bg-emerald-vault hover:bg-emerald-vault/90 text-black rounded-xl text-[12px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.3)]"
           >
             <ShieldCheck size={18} /> Exit & Secure Configuration
           </button>
        </div>
      </div>
    </>
  );
};