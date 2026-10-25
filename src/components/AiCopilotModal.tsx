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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Co-Piloto de Código para Code by Zapier (BYOK)
              </h3>
              <p className="text-xs text-slate-400">
                Traduza scripts JS/Python para o padrão <code className="text-purple-300">$input.all()</code> do n8n v2
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAiModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-200 mb-2">
              Motor de Conversão de Scripts:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'heuristic', label: 'AST Local (Grátis)' },
                  { id: 'groq', label: 'Groq (Llama 3.3)' },
                  { id: 'openai', label: 'OpenAI (GPT-4o)' },
                  { id: 'anthropic', label: 'Claude 3.5 Haiku' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProvider(opt.id)}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                    provider === opt.id
                      ? 'bg-purple-600/25 border-purple-500 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-4 h-4 mx-auto mb-1" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {provider === 'groq' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Chave de API da Groq (gsk_...):
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
          )}

          {provider === 'openai' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Chave de API da OpenAI (sk-...):
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
          )}

          {provider === 'anthropic' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Chave de API da Anthropic (sk-ant-...):
              </label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Suas chaves BYOK são salvas exclusivamente no <code>localStorage</code> do seu navegador e nunca passam por servidores intermediários.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAiModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
            >
              Salvar Configuração
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
