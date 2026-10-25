import React from 'react';
import { Lightbulb, ExternalLink, Calculator, Server } from 'lucide-react';
import { useMigration } from '../context/MigrationContext';

interface StatusBarProps {
  onOpenRoiDrawer: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ onOpenRoiDrawer }) => {
  const { roiCalculation, railwayDeployUrl } = useMigration();

  return (
    <footer className="h-10 border-t border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between text-xs text-slate-600 select-none shrink-0 shadow-2xs">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="truncate">
          Economia estimada:{' '}
          <strong className="text-emerald-600 font-mono font-bold">
            ${roiCalculation.monthlySavingsUsd}/mês
          </strong>{' '}
          ({roiCalculation.savingsPercentage}%) migrando para o n8n
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs shrink-0">
        <button
          type="button"
          onClick={onOpenRoiDrawer}
          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium transition cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-orange-600" />
          <span>Simular Economia</span>
        </button>

        <span className="text-slate-300 hidden sm:inline">•</span>

        <a
          href={railwayDeployUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 font-bold transition"
        >
          <Server className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ainda não tem seu n8n hospedado? Criar com 1 clique ↗</span>
        </a>
      </div>
    </footer>
  );
};
