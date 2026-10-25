import React, { useState } from 'react';
import { X, TrendingDown, DollarSign, Settings2, ExternalLink, Server, Check } from 'lucide-react';
import { ZAPIER_PRICING_TIERS } from '../constants/defaults';
import { useMigration } from '../context/MigrationContext';

interface RoiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoiDrawer: React.FC<RoiDrawerProps> = ({ isOpen, onClose }) => {
  const {
    monthlyTasks,
    setMonthlyTasks,
    roiCalculation,
    railwayDeployUrl,
    affiliateConfig,
    updateAffiliateConfig,
  } = useMigration();

  const [showPartnerSettings, setShowPartnerSettings] = useState(false);
  const [referralInput, setReferralInput] = useState(affiliateConfig.referralCode);
  const [templateInput, setTemplateInput] = useState(affiliateConfig.templateUrl);
  const [agencyInput, setAgencyInput] = useState(affiliateConfig.agencyName);
  const [whiteLabelToggle, setWhiteLabelToggle] = useState(affiliateConfig.whiteLabelEnabled);

  if (!isOpen) return null;

  const handleSavePartnerConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAffiliateConfig({
      ...affiliateConfig,
      referralCode: referralInput.trim() || 'jakemerson',
      templateUrl: templateInput.trim() || 'https://railway.app/template/n8n-with-workers',
      agencyName: agencyInput.trim() || 'ZapFlow Migration Suite',
      whiteLabelEnabled: whiteLabelToggle,
    });
    setShowPartnerSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0c1019] border-l border-[#1c2438] h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1c2438] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Calculadora de Economia</h2>
              <p className="text-xs text-slate-400">Zapier vs. n8n Self-Hosted na Railway</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Main Savings Highlight Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 space-y-2">
            <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider block">
              Economia Anual Estimada
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                R$ {roiCalculation.annualSavingsBrl.toLocaleString('pt-BR')}
              </span>
              <span className="text-sm font-semibold text-emerald-400">
                ({roiCalculation.savingsPercentage}% a menos)
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Economia direta de <strong>${roiCalculation.annualSavingsUsd.toLocaleString('en-US')} USD/ano</strong> em faturas operacionais.
            </p>
          </div>

          {/* Task Volume Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-300">Volume Mensal de Tarefas (Zapier):</span>
              <span className="font-mono text-slate-400">{roiCalculation.recommendedZapierTier}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ZAPIER_PRICING_TIERS.map((tier) => {
                const active = roiCalculation.monthlyTasks === tier.tasks;
                return (
                  <button
                    key={tier.tasks}
                    type="button"
                    onClick={() => setMonthlyTasks(tier.tasks)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-mono transition cursor-pointer text-center ${
                      active
                        ? 'bg-[#ea4b71] text-white font-semibold shadow-sm'
                        : 'bg-[#121724] hover:bg-[#182032] text-slate-300 border border-[#1e273d]'
                    }`}
                  >
                    {tier.tasks >= 1000 ? `${tier.tasks / 1000}k` : tier.tasks} tasks
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#101420] border border-red-500/20">
              <span className="text-[11px] text-slate-400 block mb-1">Custo no Zapier</span>
              <span className="text-lg font-bold text-red-400 block">
                ${roiCalculation.zapierMonthlyUsd}/mês
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ${roiCalculation.zapierAnnualUsd}/ano
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101420] border border-purple-500/20">
              <span className="text-[11px] text-slate-400 block mb-1">n8n na Railway</span>
              <span className="text-lg font-bold text-purple-300 block">
                ~${roiCalculation.railwayMonthlyUsd}/mês
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Execuções ilimitadas
              </span>
            </div>
          </div>

          {/* Railway 1-Click CTA */}
          <div className="p-4 rounded-xl bg-[#101524] border border-[#1e273d] space-y-3">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-slate-200">Template n8n Oficial na Railway</span>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Banco PostgreSQL dedicado incluso</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>SSL e domínio automático gratuito</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cole os workflows convertidos via Ctrl+V no canvas</span>
              </li>
            </ul>

            <a
              href={railwayDeployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#ea4b71] hover:bg-[#d93f64] text-white font-semibold transition"
            >
              <span>Subir n8n na Railway (~$5/mês)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Partner Referral Settings toggle */}
          <div className="pt-2 border-t border-[#1c2438]">
            <button
              type="button"
              onClick={() => setShowPartnerSettings((prev) => !prev)}
              className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 text-xs py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Configurar Meu Link de Afiliado Railway (Agências)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {showPartnerSettings ? 'Ocultar' : 'Editar'}
              </span>
            </button>

            {showPartnerSettings && (
              <form onSubmit={handleSavePartnerConfig} className="mt-3 space-y-2.5 bg-[#101420] p-3.5 rounded-xl border border-[#1e273d]">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Código de Referência (referralCode):
                  </label>
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0a0d14] border border-[#1e273d] text-slate-200 font-mono text-xs"
                    placeholder="ex: jakemerson"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Nome da Sua Agência:
                  </label>
                  <input
                    type="text"
                    value={agencyInput}
                    onChange={(e) => setAgencyInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#0a0d14] border border-[#1e273d] text-slate-200 text-xs"
                  />
                </div>
                <label className="flex items-center gap-2 text-slate-300 text-[11px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whiteLabelToggle}
                    onChange={(e) => setWhiteLabelToggle(e.target.checked)}
                    className="rounded border-[#1e273d]"
                  />
                  <span>Assinatura White-Label nas Sticky Notes</span>
                </label>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
                >
                  Salvar Configuração
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
