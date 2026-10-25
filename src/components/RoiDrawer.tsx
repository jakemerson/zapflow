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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Calculadora de Economia</h2>
              <p className="text-xs text-slate-500">Zapier vs. n8n Hospedado na Nuvem</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 text-slate-800">
          {/* Slider Volume de Tarefas */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Volume Mensal de Tarefas</span>
              <span className="font-mono text-sm font-bold text-orange-600">
                {monthlyTasks.toLocaleString('pt-BR')} tarefas/mês
              </span>
            </div>

            <input
              type="range"
              min={750}
              max={1500000}
              step={5000}
              value={monthlyTasks}
              onChange={(e) => setMonthlyTasks(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>750</span>
              <span>100k</span>
              <span>500k</span>
              <span>1.5M+</span>
            </div>
          </div>

          {/* Comparativo de Custos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 font-medium block">Custo no Zapier</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                ${roiCalculation.zapierMonthlyUsd}
                <span className="text-xs text-slate-400 font-normal">/mês</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                ${roiCalculation.zapierAnnualUsd}/ano
              </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50/50">
              <span className="text-[11px] text-emerald-800 font-bold block">n8n na Nuvem</span>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1 font-mono">
                ${roiCalculation.railwayMonthlyUsd}
                <span className="text-xs text-emerald-800 font-normal">/mês</span>
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                ${roiCalculation.railwayAnnualUsd}/ano (Ilimitado)
              </div>
            </div>
          </div>

          {/* Economia em Destaque */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-100">
              Economia Estimada Líquida
            </span>
            <div className="text-3xl font-black mt-1 font-mono">
              ${roiCalculation.monthlySavingsUsd}{' '}
              <span className="text-base font-normal text-emerald-200">/ mês</span>
            </div>
            <div className="text-xs text-emerald-100 mt-1">
              Equivalente a <strong>R$ {roiCalculation.annualSavingsBrl.toLocaleString('pt-BR')}</strong> por ano ({roiCalculation.savingsPercentage}% de redução).
            </div>
          </div>

          {/* Botão de Deploy do n8n */}
          <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-3">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Ainda não tem seu n8n hospedado?</span>
            </div>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Inicie seu servidor n8n com 1 clique. Inclui PostgreSQL integrado, SSL automático, backups e execuções ilimitadas.
            </p>
            <a
              href={railwayDeployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-sm transition"
            >
              <span>Criar meu n8n na Nuvem com 1 clique</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Toggle de Configurações Avançadas */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPartnerSettings(!showPartnerSettings)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{showPartnerSettings ? 'Ocultar configurações de template' : 'Configurar template personalizado'}</span>
            </button>

            {showPartnerSettings && (
              <form onSubmit={handleSavePartnerConfig} className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Código de Referência / Parceiro:
                  </label>
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    placeholder="jakemerson"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Template URL:
                  </label>
                  <input
                    type="url"
                    value={templateInput}
                    onChange={(e) => setTemplateInput(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    placeholder="https://railway.app/template/n8n-with-workers"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
