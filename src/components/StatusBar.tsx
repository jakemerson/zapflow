import React from 'react';
import { Lightbulb, ExternalLink, Calculator } from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

interface StatusBarProps {
  onOpenRoiDrawer: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ onOpenRoiDrawer }) => {
  const { roiCalculation, railwayDeployUrl } = useMigration();

  return (
    <footer className="h-10 border-t border-[#181f30] bg-[#0a0d14] px-4 flex items-center justify-between text-xs text-slate-400 select-none shrink-0">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
        <span>
          Economia estimada:{' '}
          <strong className="text-emerald-400 font-mono">
            ${roiCalculation.monthlySavingsUsd}/mês
          </strong>{' '}
          ({roiCalculation.savingsPercentage}%) migrando para n8n
        </span>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <button
          type="button"
          onClick={onOpenRoiDrawer}
          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <Calculator className="w-3 h-3 text-[#ea4b71]" />
          <span>Ver ROI & Simular</span>
        </button>

        <span className="text-slate-600">•</span>

        <a
          href={railwayDeployUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium transition"
        >
          <span>Deploy Railway (~$5/mês)</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </footer>
  );
};
