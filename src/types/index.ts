export type ZapStepRole =
  | 'trigger'
  | 'action'
  | 'search'
  | 'filter'
  | 'path'
  | 'code'
  | 'delay'
  | 'formatter';

export type ZapFilterOperator =
  | 'contains'
  | 'not_contains'
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'exists'
  | 'not_exists'
  | 'starts_with'
  | 'ends_with';

export interface ZapierFilterCondition {
  field: string;
  operator: ZapFilterOperator;
  value: string;
}

export interface NormalizedPathBranch {
  id: string;
  name: string;
  conditions: ZapierFilterCondition[];
  steps: NormalizedStep[];
}

export interface NormalizedStep {
  id: string;
  index: number;
  title: string;
  rawApp: string;           // Ex: "SlackCLIAPI@1.2.3", "WebhooksByZapier", "FilterByZapier"
  appKey: string;           // Chave normalizada: "slack", "webhooks", "filter", "google_sheets"
  role: ZapStepRole;
  actionKey: string;        // Ex: "catch_hook", "send_channel_message", "create_spreadsheet_row"
  params: Record<string, unknown>;
  filterConditions?: ZapierFilterCondition[];
  branches?: NormalizedPathBranch[];
  codeLanguage?: 'javascript' | 'python';
  sourceCode?: string;
}

export interface NormalizedZap {
  id: string;
  title: string;
  description?: string;
  status: 'on' | 'off' | 'draft';
  steps: NormalizedStep[];
  rawSource?: Record<string, unknown>;
}

// --- Estruturas Oficiais do n8n Workflow JSON v1+ ---

export interface N8nCredentialRef {
  id: string;
  name: string;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;             // Ex: "n8n-nodes-base.webhook", "n8n-nodes-base.slack"
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, N8nCredentialRef>;
  notes?: string;
  notesInFlow?: boolean;
  webhookId?: string;
}

export interface N8nConnectionTarget {
  node: string;
  type: 'main';
  index: number;
}

export type N8nConnections = Record<
  string,
  {
    main: N8nConnectionTarget[][];
  }
>;

export interface N8nWorkflow {
  name: string;
  nodes: N8nNode[];
  connections: N8nConnections;
  active: boolean;
  settings: {
    executionOrder: 'v1';
    saveManualExecutions?: boolean;
  };
  meta: {
    instanceId?: string;
    templateCredsSetupCompleted?: boolean;
    migratedBy: 'ZapFlow (ZapierToN8N)';
    migratedAt: string;
  };
  tags: Array<{ name: string }>;
}

// --- Catálogo de Mapeamento de Nós ---

export interface NodeMappingSpec {
  appKey: string;
  displayName: string;
  category: 'core' | 'communication' | 'productivity' | 'crm' | 'ecommerce' | 'ai' | 'database' | 'devtools';
  n8nTriggerType?: string;
  n8nTriggerVersion?: number;
  n8nActionType: string;
  n8nActionVersion: number;
  credentialType?: string;
  credentialLabel?: string;
  accentColor: string;
  buildParameters: (
    role: ZapStepRole,
    actionKey: string,
    transpiledParams: Record<string, unknown>
  ) => Record<string, unknown>;
}

// --- Relatório de Migração e Auditoria ---

export interface StepMappingResult {
  zapStepId: string;
  zapStepTitle: string;
  zapAppKey: string;
  zapActionKey: string;
  zapRole: ZapStepRole;
  n8nNodeId: string;
  n8nNodeName: string;
  n8nNodeType: string;
  n8nPosition: [number, number];
  mappingStatus: 'native' | 'heuristic' | 'http_fallback';
  confidenceScore: number;  // 0 a 100
  requiredCredential?: string;
  warnings: string[];
  expressionsConverted: number;
  isCodeStep?: boolean;
  codeLanguage?: 'javascript' | 'python';
}

export interface MigrationReport {
  zapId: string;
  zapTitle: string;
  overallConfidence: number; // 0 a 100
  totalSteps: number;
  nativeMappedCount: number;
  heuristicMappedCount: number;
  fallbackCount: number;
  expressionsConvertedCount: number;
  requiredCredentials: string[];
  warnings: string[];
  checklist: string[];
  stepResults: StepMappingResult[];
  isValidSchema: boolean;
  validationErrors: string[];
}

export interface ConvertedZapItem {
  zap: NormalizedZap;
  workflow: N8nWorkflow;
  report: MigrationReport;
  workflowJsonString: string;
}

// --- ROI, Afiliado Railway & Monetização ---

export interface AffiliateConfig {
  referralCode: string;
  templateUrl: string;
  agencyName: string;
  customStickyHeader: string;
  whiteLabelEnabled: boolean;
}

export interface ZapierPricingTier {
  tasks: number;
  label: string;
  monthlyUsd: number;
  planName: string;
}

export interface RoiCalculation {
  monthlyTasks: number;
  zapierCount: number;
  zapierMonthlyUsd: number;
  zapierAnnualUsd: number;
  railwayMonthlyUsd: number;
  railwayAnnualUsd: number;
  monthlySavingsUsd: number;
  annualSavingsUsd: number;
  annualSavingsBrl: number;
  monthlySavingsBrl: number;
  savingsPercentage: number;
  recommendedZapierTier: string;
}

export type AiProvider = 'heuristic' | 'groq' | 'openai' | 'anthropic';

export interface AiCopilotSettings {
  provider: AiProvider;
  groqKey: string;
  openaiKey: string;
  anthropicKey: string;
}

export interface LicenseState {
  isPro: boolean;
  activatedAt?: string;
  couponUsed?: string;
  conversionsCount: number;
}

export interface SampleZapPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  stepsSummary: string;
  isBatch?: boolean;
  payload: Record<string, unknown>;
}
