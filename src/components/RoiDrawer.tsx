import React, { useState } from 'react';
import { X, Settings2 } from 'lucide-react';
import { useMigration } from '../context/MigrationContext';
import { RoiCalculatorCard } from './RoiCalculatorCard';

interface RoiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoiDrawer: React.FC<RoiDrawerProps> = ({ isOpen, onClose }) => {
  const {
    affiliateConfig,
    updateAffiliateConfig,
  } = useMigration();

  const [showPartnerSettings, setShowPartnerSettings] = useState(false);
  const [referralInput, setReferralInput] = useState(affiliateConfig.referralCode);
  const [templateInput, setTemplateInput] = useState(affiliateConfig.templateUrl);

  if (!isOpen) return null;

  const handleSavePartnerConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateAffiliateConfig({
      ...affiliateConfig,
      referralCode: referralInput.trim() || 'jakemerson',
      templateUrl: templateInput.trim() || 'https://railway.app/template/n8n-with-workers',
    });
    setShowPartnerSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-slate-50 border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">Calculadora de Economia</h2>
            <p className="text-xs text-slate-500">Compare seu consumo no Zapier vs. n8n na Nuvem</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1">
          <RoiCalculatorCard compact />

          {/* Toggle de Configurações Avançadas */}
          <div className="pt-2 px-2">
            <button
              type="button"
              onClick={() => setShowPartnerSettings(!showPartnerSettings)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{showPartnerSettings ? 'Ocultar configurações do template' : 'Configurar template personalizado'}</span>
            </button>

            {showPartnerSettings && (
              <form onSubmit={handleSavePartnerConfig} className="mt-3 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Código de Referência / Parceiro:
                  </label>
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden"
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
                    className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:outline-hidden"
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
