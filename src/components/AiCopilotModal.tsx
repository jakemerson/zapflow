import React, { useState } from 'react';
import { X, Sparkles, Shield, Cpu } from 'lucide-react';
import { AiProvider } from '../types';
import { useMigration } from '../context/MigrationContext';

export const AiCopilotModal: React.FC = () => {
  const { aiModalOpen, setAiModalOpen, aiSettings, updateAiSettings } =
    useMigration();

  const [provider, setProvider] = useState<AiProvider>(aiSettings.provider);
  const [groqKey, setGroqKey] = useState(aiSettings.groqKey);
  const [openaiKey, setOpenaiKey] = useState(aiSettings.openaiKey);
  const [anthropicKey, setAnthropicKey] = useState(aiSettings.anthropicKey);

  if (!aiModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAiSettings({
      provider,
      groqKey,
      openaiKey,
      anthropicKey,
    });
    setAiModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Co-Piloto de Código para Code by Zapier (BYOK)
              </h3>
              <p className="text-xs text-slate-500">
                Traduza scripts JS/Python para o padrão <code className="text-purple-600 font-semibold">$input.all()</code> do n8n v2
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-slate-800">
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Motor de Conversão de Scripts:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'heuristic', label: 'AST Nativo', desc: '100% Grátis' },
                  { id: 'groq', label: 'Groq Cloud', desc: 'Llama 3.3 Rápido' },
                  { id: 'openai', label: 'OpenAI', desc: 'GPT-4o Mini' },
                  { id: 'anthropic', label: 'Claude', desc: 'Sonnet 3.5' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProvider(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    provider === opt.id
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {provider === 'groq' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chave de API Groq (gsk_...):
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          )}

          {provider === 'openai' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chave de API OpenAI (sk-...):
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          )}

          {provider === 'anthropic' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chave de API Anthropic (sk-ant-...):
              </label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:bg-white focus:border-purple-600 focus:outline-hidden"
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Suas chaves BYOK são salvas exclusivamente no <code>localStorage</code> do seu navegador e nunca passam por servidores intermediários.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAiModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm transition cursor-pointer"
            >
              Salvar Configuração
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
