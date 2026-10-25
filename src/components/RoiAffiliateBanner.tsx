import React, { useState } from 'react';
import {
  Rocket,
  TrendingDown,
  DollarSign,
  Settings2,
  ExternalLink,
  Check,
  Server,
} from 'lucide-react';
import { ZAPIER_PRICING_TIERS } from '../constants/defaults';
import { useMigration } from '../context/MigrationContext';

export const RoiAffiliateBanner: React.FC = () => {
  const {
    monthlyTasks,
    setMonthlyTasks,
    roiCalculation,
    railwayDeployUrl,
    affiliateConfig,
    updateAffiliateConfig,
    license,
    openPaywall,
  } = useMigration();

  const [showPartnerSettings, setShowPartnerSettings] = useState(false);
  const [referralInput, setReferralInput] = useState(affiliateConfig.referralCode);
  const [templateInput, setTemplateInput] = useState(affiliateConfig.templateUrl);
  const [agencyInput, setAgencyInput] = useState(affiliateConfig.agencyName);
  const [whiteLabelToggle, setWhiteLabelToggle] = useState(
    affiliateConfig.whiteLabelEnabled
  );

  const handleSavePartnerConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (whiteLabelToggle && !license.isPro) {
      openPaywall(
        'O modo White-Label nas Sticky Notes é um recurso exclusivo do plano ZapFlow Pro / Agency.'
      );
      return;
    }
    updateAffiliateConfig({
      ...affiliateConfig,
      referralCode: referralInput.trim() || 'mdYrO9',
      templateUrl:
        templateInput.trim() || 'https://railway.com/deploy/n8n-main-worker',
      agencyName: agencyInput.trim() || 'ZapFlow Migration Suite',
      whiteLabelEnabled: whiteLabelToggle,
    });
    setShowPartnerSettings(false);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/50 p-5 sm:p-6 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 7 Cols: Interactive Zapier vs Railway Cost Calculator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <TrendingDown className="w-3.5 h-3.5" />
              Calculadora de ROI & Economia Anual
            </span>
            <span className="text-xs text-slate-400">
              Compare sua fatura mensal do Zapier vs. n8n Self-Hosted na Railway
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
            Pare de pagar imposto por tarefa no Zapier. Economize{' '}
            <span className="text-emerald-400">
              R$ {roiCalculation.annualSavingsBrl.toLocaleString('pt-BR')}/ano
            </span>{' '}
            ({roiCalculation.savingsPercentage}%) rodando seu próprio n8n na Railway!
          </h2>

          {/* Task Volume Selector Pills */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold">
                Selecione seu volume mensal de tarefas (Tasks/mês no Zapier):
              </span>
              <span className="font-mono font-bold text-rose-300">
                {roiCalculation.recommendedZapierTier}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ZAPIER_PRICING_TIERS.map((tier) => {
                const active = roiCalculation.monthlyTasks === tier.tasks;
                return (
                  <button
                    key={tier.tasks}
                    type="button"
                    onClick={() => setMonthlyTasks(tier.tasks)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                      active
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    {tier.tasks >= 1000 ? `${tier.tasks / 1000}k` : tier.tasks} tasks
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cost Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-red-500/25">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                Custo Atual no Zapier
              </span>
              <span className="text-xl font-extrabold text-red-400 mt-1 block">
                ${roiCalculation.zapierMonthlyUsd}/mês
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ${roiCalculation.zapierAnnualUsd}/ano (~R${' '}
                {Math.round(roiCalculation.zapierAnnualUsd * 5.75).toLocaleString('pt-BR')})
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30">
              <span className="text-[11px] font-semibold uppercase text-purple-300 block">
                n8n na Railway (24/7)
              </span>
              <span className="text-xl font-extrabold text-purple-300 mt-1 block">
                ~${roiCalculation.railwayMonthlyUsd}/mês
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Execuções ilimitadas + Postgres
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40">
              <span className="text-[11px] font-bold uppercase text-emerald-300 block">
                Sua Economia Anual
              </span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                R$ {roiCalculation.annualSavingsBrl.toLocaleString('pt-BR')}
              </span>
              <span className="text-[11px] text-emerald-200/80 font-mono">
                +${roiCalculation.annualSavingsUsd} USD livres no caixa
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: 1-Click Railway Template Card */}
        <div className="lg:col-span-5 bg-slate-950/90 border border-purple-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Não tem o n8n rodando ainda?
                </h3>
                <p className="text-xs text-slate-400">
                  Template Oficial Railway (n8n + PostgreSQL + Workers + SSL)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              1-CLICK DEPLOY
            </span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sobe em 60 segundos com banco PostgreSQL persistente e HTTPS automático</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Basta abrir o n8n criado e colar os workflows convertidos aqui com Ctrl+V</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sem limite artificial de Zaps ativos nem cobrança por passo</span>
            </li>
          </ul>

          <a
            href={railwayDeployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-extrabold bg-gradient-to-r from-purple-600 via-rose-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 text-white shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
          >
            <Rocket className="w-4 h-4" />
            <span>Subir Meu n8n na Railway Agora (~$5/mês)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono truncate">
              Ref: <strong className="text-purple-300">?referralCode={affiliateConfig.referralCode}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowPartnerSettings((prev) => !prev)}
              className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 font-semibold cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Configurar Meu Link Afiliado</span>
            </button>
          </div>

          {showPartnerSettings && (
            <form
              onSubmit={handleSavePartnerConfig}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Modo Parceiro / Agência (Seu Link Railway)
                </span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Seu Código de Afiliado Railway (referralCode):
                </label>
                <input
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                  placeholder="ex: mdYrO9"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  URL do Template n8n na Railway:
                </label>
                <input
                  type="url"
                  value={templateInput}
                  onChange={(e) => setTemplateInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Nome da Sua Agência / Consultoria:
                </label>
                <input
                  type="text"
                  value={agencyInput}
                  onChange={(e) => setAgencyInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={whiteLabelToggle}
                  onChange={(e) => setWhiteLabelToggle(e.target.checked)}
                  className="rounded border-slate-700"
                />
                <span>Ativar Sticky Note White-Label nos JSONs gerados (💎 PRO)</span>
              </label>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition cursor-pointer"
              >
                Salvar e Atualizar Sticky Notes
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
