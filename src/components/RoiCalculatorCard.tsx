import React from 'react';
import {
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Server,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ZAPIER_PRICING_TIERS } from '../constants/defaults';
import { useMigration } from '../context/MigrationContext';

interface RoiCalculatorCardProps {
  compact?: boolean;
  onOpenMigrator?: () => void;
}

export const RoiCalculatorCard: React.FC<RoiCalculatorCardProps> = ({
  compact = false,
  onOpenMigrator,
}) => {
  const {
    monthlyTasks,
    setMonthlyTasks,
    roiCalculation,
    railwayDeployUrl,
  } = useMigration();

  // Find tier index
  const activeTierIndex = Math.max(
    0,
    ZAPIER_PRICING_TIERS.findIndex((t) => t.tasks >= monthlyTasks)
  );
  const currentTier = ZAPIER_PRICING_TIERS[activeTierIndex] || ZAPIER_PRICING_TIERS[0];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Number(e.target.value);
    const selected = ZAPIER_PRICING_TIERS[idx];
    if (selected) {
      setMonthlyTasks(selected.tasks);
    }
  };

  const handleTierClick = (tasks: number) => {
    setMonthlyTasks(tasks);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden text-slate-800 ${compact ? 'p-5' : 'p-6 sm:p-8'}`}>
      {/* Title & Description */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingDown className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Simulador de Custos Reais
          </span>
        </div>
        <h3 className={`font-extrabold text-slate-950 tracking-tight ${compact ? 'text-lg' : 'text-2xl'}`}>
          Quanto você economiza saindo do Zapier?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Baseado nos planos e tabelas oficiais do <strong>Zapier Professional</strong> vs. <strong>n8n na Nuvem com tarefas ilimitadas</strong>.
        </p>
      </div>

      {/* Selector: Tier Buttons */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700">Selecione seu consumo mensal no Zapier:</span>
            <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 text-xs sm:text-sm">
              {currentTier.tasks.toLocaleString('pt-BR')} tarefas/mês
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {ZAPIER_PRICING_TIERS.map((tier, idx) => {
              const isSelected = tier.tasks === currentTier.tasks;
              return (
                <button
                  key={tier.tasks}
                  type="button"
                  onClick={() => handleTierClick(tier.tasks)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition text-center cursor-pointer ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {tier.tasks >= 1000 ? `${tier.tasks / 1000}k` : tier.tasks}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stepped Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={ZAPIER_PRICING_TIERS.length - 1}
            step={1}
            value={activeTierIndex}
            onChange={handleSliderChange}
            className="w-full accent-orange-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>750 tarefas</span>
            <span>10k</span>
            <span>50k</span>
            <span>100k tarefas</span>
          </div>
        </div>
      </div>

      {/* Side-by-side Cost Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Zapier Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600">Zapier Professional</span>
            <span className="text-[11px] text-slate-500 font-mono">Limite rígido</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            ${currentTier.monthlyUsd.toFixed(2)}
            <span className="text-xs font-normal text-slate-500"> /mês</span>
          </div>
          <div className="text-xs text-slate-600 mt-2 space-y-1">
            <p>• Custo anual: <strong>${(currentTier.monthlyUsd * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</strong></p>
            <p>• Cobrança por tarefas extras excedentes</p>
            <p>• 1 usuário incluído</p>
          </div>
        </div>

        {/* n8n Cloud Card */}
        <div className="p-4 sm:p-5 rounded-xl border-2 border-emerald-400 bg-emerald-50/50 relative">
          <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {roiCalculation.savingsPercentage}% Menos
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-900">n8n Hospedado na Nuvem</span>
          </div>
          <div className="text-3xl font-black text-emerald-950 font-mono">
            ~${roiCalculation.railwayMonthlyUsd}
            <span className="text-xs font-normal text-emerald-800"> /mês</span>
          </div>
          <div className="text-xs text-emerald-900 mt-2 space-y-1 font-medium">
            <p>• Custo anual: <strong>~${roiCalculation.railwayAnnualUsd}/ano</strong></p>
            <p>• <strong>Execuções 100% ilimitadas</strong></p>
            <p>• Servidor dedicado + PostgreSQL incluso</p>
          </div>
        </div>
      </div>

      {/* Savings Highlight Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
            Sua Economia Direta Estimada
          </span>
          <div className="text-3xl sm:text-4xl font-black font-mono mt-0.5">
            ${roiCalculation.monthlySavingsUsd.toFixed(2)}{' '}
            <span className="text-sm sm:text-base font-normal text-emerald-200">/ mês</span>
          </div>
          <div className="text-xs text-emerald-100 mt-1">
            Você economiza cerca de <strong className="text-white">R$ {roiCalculation.annualSavingsBrl.toLocaleString('pt-BR')}</strong> todo ano ao migrar para o n8n.
          </div>
        </div>

        <a
          href={railwayDeployUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs transition transform hover:-translate-y-0.5"
        >
          <Server className="w-4 h-4 text-emerald-700" />
          <span>Criar meu n8n com 1 clique</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>

      {/* Footer reassurance / action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Deploy pronto para produção em 2 minutos via Railway</span>
        </div>

        {onOpenMigrator && (
          <button
            type="button"
            onClick={onOpenMigrator}
            className="text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Já tem fluxos? Abrir Migrador Grátis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
