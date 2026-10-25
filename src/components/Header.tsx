import React from 'react';
import {
  Zap,
  Sparkles,
  Rocket,
  Crown,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

export const Header: React.FC = () => {
  const {
    license,
    railwayDeployUrl,
    setAiModalOpen,
    openPaywall,
    toggleProTestMode,
    aiSettings,
  } = useMigration();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 border border-white/10">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                ZapFlow
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                Zapier → n8n AST
              </span>
              {license.isPro && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Crown className="w-3 h-3" /> PRO AGENCY
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Transpilador Determinístico de Zaps para Workflows n8n • 100% Client-Side
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition cursor-pointer"
            title="Configurar Co-Piloto IA (BYOK) para Code by Zapier"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Co-Piloto Code:</span>
            <span className="text-purple-300 font-semibold uppercase">
              {aiSettings.provider}
            </span>
          </button>

          {!license.isPro ? (
            <button
              type="button"
              onClick={() =>
                openPaywall(
                  'Desbloqueie conversão em lote ilimitada (Agency Pack) e Sticky Notes White-Label.'
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Upgrade Pro</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleProTestMode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
              title="Clique para alternar entre modo Pro e Free para testes"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Licença Pro Ativa</span>
            </button>
          )}

          <a
            href={railwayDeployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white shadow-lg shadow-purple-600/25 transition transform hover:-translate-y-0.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Subir n8n na Railway (~$5/mês)</span>
          </a>
        </div>
      </div>

      {/* Sub-bar quick value strip */}
      <div className="bg-slate-900/70 border-t border-slate-800/60 px-4 py-1.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero Upload para Servidores (Privacidade Total)
            </span>
            <span className="hidden md:inline">
              • Converte <code className="text-orange-300">{'{{1__email}}'}</code> →{' '}
              <code className="text-rose-300">{'={{ $json.email }}'}</code>
            </span>
            <span className="hidden lg:inline">
              • Suporte a <strong className="text-slate-200">Filter (If)</strong>,{' '}
              <strong className="text-slate-200">Paths (Switch)</strong>,{' '}
              <strong className="text-slate-200">Code JS/Python</strong> e{' '}
              <strong className="text-slate-200">30+ Apps</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Cupom de demonstração Desafio 12x12:</span>
            <button
              type="button"
              onClick={() => openPaywall('Ative gratuitamente o modo Pro com o cupom oficial do Desafio 12x12!')}
              className="font-mono font-bold text-amber-300 hover:underline cursor-pointer"
            >
              DESAFIO12X12
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
