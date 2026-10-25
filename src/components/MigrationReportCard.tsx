import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  CheckSquare,
  Square,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

export const MigrationReportCard: React.FC = () => {
  const { activeItem } = useMigration();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!activeItem) return null;

  const { report } = activeItem;

  const toggleChecklistItem = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header + Confidence Gauge */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Auditoria & Checklist de Ativação no n8n</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Validação sintática de nós, conexões e variáveis transpiladas
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Score de Confiança
            </span>
            <span className="text-lg font-extrabold text-emerald-400">
              {report.overallConfidence}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <span className="block text-base font-extrabold text-slate-100">
            {report.totalSteps}
          </span>
          <span className="text-[11px] text-slate-400">Passos Convertidos</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <span className="block text-base font-extrabold text-rose-400">
            {report.expressionsConvertedCount}
          </span>
          <span className="text-[11px] text-slate-400">
            Expressões <code>{'$json'}</code>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <span className="block text-base font-extrabold text-amber-400">
            {report.requiredCredentials.length}
          </span>
          <span className="text-[11px] text-slate-400">Credenciais OAuth/API</span>
        </div>
      </div>

      {/* Required Credentials Pills */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>Credenciais para Conectar no n8n</span>
        </h4>
        {report.requiredCredentials.length === 0 ? (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            Nenhuma credencial externa obrigatória! Este fluxo usa apenas nós nativos/webhooks.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {report.requiredCredentials.map((cred) => (
              <span
                key={cred}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-200 border border-amber-500/30"
              >
                🔑 {cred}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Post-Migration Checklist */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Checklist Passo a Passo de Ativação
        </h4>
        <div className="space-y-1.5">
          {report.checklist.map((itemText, idx) => {
            const key = `${report.zapId}-${idx}`;
            const isDone = Boolean(checkedItems[key]);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleChecklistItem(key)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition cursor-pointer ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through'
                    : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <span>{itemText}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
