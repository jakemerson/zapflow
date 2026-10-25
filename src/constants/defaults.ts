import {
  AffiliateConfig,
  AiCopilotSettings,
  LicenseState,
  ZapierPricingTier,
} from '../types';

export const STORAGE_KEYS = {
  AFFILIATE: '@zapflow:affiliate_config',
  AI_SETTINGS: '@zapflow:ai_settings',
  LICENSE: '@zapflow:license_state',
  CHECKLIST_DONE: '@zapflow:checklist_done',
} as const;

export const DEFAULT_AFFILIATE_CONFIG: AffiliateConfig = {
  referralCode: 'jakemerson',
  templateUrl: 'https://railway.app/template/n8n-with-workers',
  agencyName: 'ZapFlow Migration Suite',
  customStickyHeader: '⚡ Migrado automaticamente do Zapier via ZapFlow',
  whiteLabelEnabled: false,
};

export const DEFAULT_AI_SETTINGS: AiCopilotSettings = {
  provider: 'heuristic',
  groqKey: '',
  openaiKey: '',
  anthropicKey: '',
};

export const DEFAULT_LICENSE_STATE: LicenseState = {
  isPro: false,
  conversionsCount: 0,
};

export const ZAPIER_PRICING_TIERS: ZapierPricingTier[] = [
  { tasks: 750, label: '750 tarefas/mês', monthlyUsd: 29.99, planName: 'Professional (750 tarefas)' },
  { tasks: 1500, label: '1.500 tarefas/mês', monthlyUsd: 58.50, planName: 'Professional (1.5k tarefas)' },
  { tasks: 2000, label: '2.000 tarefas/mês', monthlyUsd: 73.50, planName: 'Professional (2k tarefas)' },
  { tasks: 5000, label: '5.000 tarefas/mês', monthlyUsd: 133.50, planName: 'Professional (5k tarefas)' },
  { tasks: 10000, label: '10.000 tarefas/mês', monthlyUsd: 193.50, planName: 'Professional (10k tarefas)' },
  { tasks: 20000, label: '20.000 tarefas/mês', monthlyUsd: 283.50, planName: 'Professional (20k tarefas)' },
  { tasks: 50000, label: '50.000 tarefas/mês', monthlyUsd: 433.50, planName: 'Professional (50k tarefas)' },
  { tasks: 100000, label: '100.000 tarefas/mês', monthlyUsd: 733.50, planName: 'Professional (100k tarefas)' },
];

export const RAILWAY_N8N_HOBBY_USD = 5;
export const RAILWAY_N8N_WORKERS_USD = 15;
export const USD_TO_BRL_RATE = 5.75;

export const PRO_LICENSE_PRICE_BRL = 59;

export const VALID_PRO_COUPONS = [
  'DESAFIO12X12',
  'ZAPFLOWPRO',
  'RAILWAYVIP',
  'TESTEPRO',
  'VIP100',
] as const;
