import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  AffiliateConfig,
  AiCopilotSettings,
  ConvertedZapItem,
  LicenseState,
  RoiCalculation,
} from '../types';
import { SAMPLE_ZAPS } from '../constants/sampleZaps';
import { storageService } from '../services/storageService';
import { parseZapierJson } from '../services/zapierParser';
import { convertZapToN8n } from '../services/n8nGenerator';
import {
  buildRailwayDeployUrl,
  calculateMigrationRoi,
  validateAndRedeemCoupon,
} from '../services/roiCalculatorService';
import { refineCodeWithAi } from '../services/aiCopilotService';

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface MigrationContextValue {
  rawJsonInput: string;
  activeSampleId: string;
  convertedItems: ConvertedZapItem[];
  selectedZapIndex: number;
  activeItem: ConvertedZapItem | null;
  parseError: string | null;
  affiliateConfig: AffiliateConfig;
  aiSettings: AiCopilotSettings;
  license: LicenseState;
  monthlyTasks: number;
  roiCalculation: RoiCalculation;
  railwayDeployUrl: string;
  aiModalOpen: boolean;
  paywallModalOpen: boolean;
  paywallReason: string;
  isRefiningCode: boolean;
  toast: ToastNotification | null;

  setSelectedZapIndex: (idx: number) => void;
  setMonthlyTasks: (tasks: number) => void;
  setAiModalOpen: (open: boolean) => void;
  openPaywall: (reason?: string) => void;
  closePaywall: () => void;
  loadSampleZap: (sampleId: string) => void;
  handleJsonUploadOrPaste: (rawJson: string) => void;
  copyWorkflowToClipboard: (index?: number) => Promise<void>;
  downloadSingleWorkflowJson: (index?: number) => void;
  downloadBatchBundle: () => void;
  updateAffiliateConfig: (next: AffiliateConfig) => void;
  updateAiSettings: (next: AiCopilotSettings) => void;
  refineStepCodeWithAi: (n8nNodeId: string) => Promise<void>;
  redeemCoupon: (code: string) => { valid: boolean; message: string };
  toggleProTestMode: () => void;
  showToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

const MigrationContext = createContext<MigrationContextValue | undefined>(undefined);

function runConversionPipeline(
  rawText: string,
  affiliateConfig: AffiliateConfig
): { items: ConvertedZapItem[]; error: string | null } {
  const parsed = parseZapierJson(rawText);
  if (!parsed.ok) {
    return { items: [], error: parsed.error };
  }
  const items = parsed.zaps.map((z) => convertZapToN8n(z, affiliateConfig));
  return { items, error: null };
}

export const MigrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialAffiliate = useMemo(() => storageService.loadAffiliateConfig(), []);
  const initialAi = useMemo(() => storageService.loadAiSettings(), []);
  const initialLicense = useMemo(() => storageService.loadLicenseState(), []);

  const defaultSample = SAMPLE_ZAPS[0];
  const defaultRawJson = useMemo(
    () => JSON.stringify(defaultSample.payload, null, 2),
    [defaultSample]
  );

  const initialConversion = useMemo(
    () => runConversionPipeline(defaultRawJson, initialAffiliate),
    [defaultRawJson, initialAffiliate]
  );

  const [rawJsonInput, setRawJsonInput] = useState<string>(defaultRawJson);
  const [activeSampleId, setActiveSampleId] = useState<string>(defaultSample.id);
  const [convertedItems, setConvertedItems] = useState<ConvertedZapItem[]>(
    initialConversion.items
  );
  const [selectedZapIndex, setSelectedZapIndex] = useState<number>(0);
  const [parseError, setParseError] = useState<string | null>(initialConversion.error);

  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateConfig>(initialAffiliate);
  const [aiSettings, setAiSettings] = useState<AiCopilotSettings>(initialAi);
  const [license, setLicense] = useState<LicenseState>(initialLicense);

  const [monthlyTasks, setMonthlyTasks] = useState<number>(20000);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [paywallModalOpen, setPaywallModalOpen] = useState<boolean>(false);
  const [paywallReason, setPaywallReason] = useState<string>(
    'Desbloqueie a exportação em lote de múltiplos Zaps e personalização White-Label para agências.'
  );
  const [isRefiningCode, setIsRefiningCode] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((prev) => (prev?.id === id ? null : prev));
      }, 4200);
    },
    []
  );

  const openPaywall = useCallback((reason?: string) => {
    if (reason) setPaywallReason(reason);
    setPaywallModalOpen(true);
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallModalOpen(false);
  }, []);

  const handleJsonUploadOrPaste = useCallback(
    (rawJson: string) => {
      setRawJsonInput(rawJson);
      const { items, error } = runConversionPipeline(rawJson, affiliateConfig);
      setParseError(error);
      if (!error && items.length > 0) {
        setConvertedItems(items);
        setSelectedZapIndex(0);
      }
    },
    [affiliateConfig]
  );

  const loadSampleZap = useCallback(
    (sampleId: string) => {
      const found = SAMPLE_ZAPS.find((s) => s.id === sampleId);
      if (!found) return;
      setActiveSampleId(found.id);
      const formatted = JSON.stringify(found.payload, null, 2);
      setRawJsonInput(formatted);
      const { items, error } = runConversionPipeline(formatted, affiliateConfig);
      setParseError(error);
      setConvertedItems(items);
      setSelectedZapIndex(0);
      showToast(
        `Exemplo "${found.name}" carregado e transpilado (${items.length} workflow${
          items.length > 1 ? 's' : ''
        })!`,
        'info'
      );
    },
    [affiliateConfig, showToast]
  );

  const updateAffiliateConfig = useCallback(
    (next: AffiliateConfig) => {
      setAffiliateConfig(next);
      storageService.saveAffiliateConfig(next);
      const { items, error } = runConversionPipeline(rawJsonInput, next);
      if (!error && items.length > 0) {
        setConvertedItems(items);
      }
      showToast('Configuração de afiliado Railway atualizada nas Sticky Notes!', 'success');
    },
    [rawJsonInput, showToast]
  );

  const updateAiSettings = useCallback(
    (next: AiCopilotSettings) => {
      setAiSettings(next);
      storageService.saveAiSettings(next);
      showToast('Configurações do Co-Piloto IA salvas localmente!', 'success');
    },
    [showToast]
  );

  const activeItem = useMemo(
    () => convertedItems[selectedZapIndex] || convertedItems[0] || null,
    [convertedItems, selectedZapIndex]
  );

  const copyWorkflowToClipboard = useCallback(
    async (index?: number) => {
      const target =
        typeof index === 'number' ? convertedItems[index] : activeItem;
      if (!target) return;

      try {
        await navigator.clipboard.writeText(target.workflowJsonString);
        showToast(
          'Workflow n8n copiado! Abra o canvas do n8n e pressione Ctrl+V (ou Cmd+V) para colar os nós.',
          'success'
        );
      } catch {
        showToast('Não foi possível acessar a área de transferência.', 'warning');
      }
    },
    [convertedItems, activeItem, showToast]
  );

  const downloadSingleWorkflowJson = useCallback(
    (index?: number) => {
      const target =
        typeof index === 'number' ? convertedItems[index] : activeItem;
      if (!target) return;

      const safeFilename =
        target.zap.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'n8n-workflow';

      const blob = new Blob([target.workflowJsonString], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeFilename}.n8n.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Arquivo "${safeFilename}.n8n.json" baixado com sucesso!`, 'success');
    },
    [convertedItems, activeItem, showToast]
  );

  const downloadBatchBundle = useCallback(() => {
    if (convertedItems.length > 1 && !license.isPro) {
      openPaywall(
        `Seu arquivo contém ${convertedItems.length} Zaps em lote. Desbloqueie o ZapFlow Pro (R$ 59 único ou use o cupom DESAFIO12X12) para exportar pacotes completos de agência!`
      );
      return;
    }

    const bundlePayload = {
      exportedBy: 'ZapFlow Pro — Batch Migration Suite',
      exportedAt: new Date().toISOString(),
      totalWorkflows: convertedItems.length,
      workflows: convertedItems.map((item) => ({
        zapTitle: item.zap.title,
        confidenceScore: item.report.overallConfidence,
        requiredCredentials: item.report.requiredCredentials,
        n8nWorkflow: item.workflow,
      })),
    };

    const blob = new Blob([JSON.stringify(bundlePayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zapflow-batch-${convertedItems.length}-workflows.n8n.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(
      `Pacote em lote com ${convertedItems.length} workflows exportado com sucesso!`,
      'success'
    );
  }, [convertedItems, license.isPro, openPaywall, showToast]);

  const refineStepCodeWithAi = useCallback(
    async (n8nNodeId: string) => {
      if (!activeItem) return;
      const stepRes = activeItem.report.stepResults.find((s) => s.n8nNodeId === n8nNodeId);
      const rawStep = activeItem.zap.steps.find((s) => s.id === stepRes?.zapStepId);
      if (!stepRes || !rawStep) return;

      setIsRefiningCode(true);
      try {
        const res = await refineCodeWithAi(
          rawStep.sourceCode || '',
          rawStep.codeLanguage || 'javascript',
          aiSettings
        );

        setConvertedItems((prev) =>
          prev.map((item, idx) => {
            if (idx !== selectedZapIndex) return item;
            const updatedNodes = item.workflow.nodes.map((node) => {
              if (node.id !== n8nNodeId) return node;
              const isPy = rawStep.codeLanguage === 'python';
              return {
                ...node,
                parameters: isPy
                  ? { language: 'python', pythonCode: res.code }
                  : { mode: 'runOnceForAllItems', jsCode: res.code },
              };
            });
            const updatedWorkflow = { ...item.workflow, nodes: updatedNodes };
            return {
              ...item,
              workflow: updatedWorkflow,
              workflowJsonString: JSON.stringify(updatedWorkflow, null, 2),
            };
          })
        );

        showToast(`${res.providerUsed}: ${res.note}`, 'success');
      } finally {
        setIsRefiningCode(false);
      }
    },
    [activeItem, aiSettings, selectedZapIndex, showToast]
  );

  const redeemCoupon = useCallback(
    (code: string) => {
      const check = validateAndRedeemCoupon(code);
      if (check.valid) {
        const nextLicense: LicenseState = {
          isPro: true,
          activatedAt: new Date().toISOString(),
          couponUsed: check.normalizedCode,
          conversionsCount: license.conversionsCount + 1,
        };
        setLicense(nextLicense);
        storageService.saveLicenseState(nextLicense);
        setPaywallModalOpen(false);
        showToast(check.message, 'success');
      }
      return { valid: check.valid, message: check.message };
    },
    [license.conversionsCount, showToast]
  );

  const toggleProTestMode = useCallback(() => {
    const nextState: LicenseState = {
      ...license,
      isPro: !license.isPro,
      couponUsed: !license.isPro ? 'SANDBOX_TOGGLE' : undefined,
    };
    setLicense(nextState);
    storageService.saveLicenseState(nextState);
    showToast(
      nextState.isPro
        ? '💎 Modo PRO / Agency Batch ativado!'
        : 'Modo Gratuito (Free) ativado para teste.',
      'info'
    );
  }, [license, showToast]);

  const roiCalculation = useMemo(
    () => calculateMigrationRoi(monthlyTasks, convertedItems.length || 10),
    [monthlyTasks, convertedItems.length]
  );

  const railwayDeployUrl = useMemo(
    () => buildRailwayDeployUrl(affiliateConfig),
    [affiliateConfig]
  );

  return (
    <MigrationContext.Provider
      value={{
        rawJsonInput,
        activeSampleId,
        convertedItems,
        selectedZapIndex,
        activeItem,
        parseError,
        affiliateConfig,
        aiSettings,
        license,
        monthlyTasks,
        roiCalculation,
        railwayDeployUrl,
        aiModalOpen,
        paywallModalOpen,
        paywallReason,
        isRefiningCode,
        toast,
        setSelectedZapIndex,
        setMonthlyTasks,
        setAiModalOpen,
        openPaywall,
        closePaywall,
        loadSampleZap,
        handleJsonUploadOrPaste,
        copyWorkflowToClipboard,
        downloadSingleWorkflowJson,
        downloadBatchBundle,
        updateAffiliateConfig,
        updateAiSettings,
        refineStepCodeWithAi,
        redeemCoupon,
        toggleProTestMode,
        showToast,
      }}
    >
      {children}
    </MigrationContext.Provider>
  );
};

export function useMigration(): MigrationContextValue {
  const ctx = useContext(MigrationContext);
  if (!ctx) {
    throw new Error('useMigration deve ser usado dentro de um MigrationProvider');
  }
  return ctx;
}
