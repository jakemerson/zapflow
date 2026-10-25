import {
  NormalizedPathBranch,
  NormalizedStep,
  NormalizedZap,
  ZapFilterOperator,
  ZapierFilterCondition,
  ZapStepRole,
} from '../types';

const APP_ALIAS_MAP: Record<string, string> = {
  webhooks: 'webhooks',
  webhooksbyzapier: 'webhooks',
  webhook: 'webhooks',
  schedule: 'schedule',
  schedulebyzapier: 'schedule',
  filter: 'filter',
  filterbyzapier: 'filter',
  paths: 'paths',
  pathsbyzapier: 'paths',
  path: 'paths',
  delay: 'delay',
  delaybyzapier: 'delay',
  formatter: 'formatter',
  formatterbyzapier: 'formatter',
  code: 'code',
  codebyzapier: 'code',
  slack: 'slack',
  gmail: 'gmail',
  googlemail: 'gmail',
  googlemailv2: 'gmail',
  googlesheets: 'google_sheets',
  google_sheets: 'google_sheets',
  googledrive: 'google_drive',
  google_drive: 'google_drive',
  googlecalendar: 'google_calendar',
  google_calendar: 'google_calendar',
  zoom: 'zoom',
  zoomus: 'zoom',
  hubspot: 'hubspot',
  hubspotcrm: 'hubspot',
  pipedrive: 'pipedrive',
  activecampaign: 'activecampaign',
  mailchimp: 'mailchimp',
  zendesk: 'zendesk',
  stripe: 'stripe',
  shopify: 'shopify',
  typeform: 'typeform',
  calendly: 'calendly',
  openai: 'openai',
  chatgpt: 'openai',
  notion: 'notion',
  airtable: 'airtable',
  trello: 'trello',
  asana: 'asana',
  discord: 'discord',
  telegram: 'telegram',
  microsoftteams: 'microsoft_teams',
  microsoft_teams: 'microsoft_teams',
  twilio: 'twilio',
  github: 'github',
  postgres: 'postgres',
  postgresql: 'postgres',
  mysql: 'mysql',
  supabase: 'supabase',
};

export function normalizeAppName(rawApp: string): string {
  if (!rawApp) return 'webhooks';
  const cleaned = rawApp
    .split('@')[0]
    .replace(/CLIAPI$/i, '')
    .replace(/Legacy$/i, '')
    .replace(/API$/i, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();

  return APP_ALIAS_MAP[cleaned] || cleaned || 'webhooks';
}

export function inferStepRole(
  index: number,
  appKey: string,
  rawType?: string,
  actionKey?: string
): ZapStepRole {
  const lowerType = (rawType || '').toLowerCase();
  const lowerAction = (actionKey || '').toLowerCase();

  if (appKey === 'filter' || lowerType === 'filter') return 'filter';
  if (appKey === 'paths' || lowerType === 'path' || lowerType === 'paths') return 'path';
  if (appKey === 'code' || lowerType === 'code') return 'code';
  if (appKey === 'delay' || lowerType === 'delay') return 'delay';
  if (appKey === 'formatter' || lowerType === 'formatter') return 'formatter';

  if (
    index === 0 ||
    lowerType === 'trigger' ||
    lowerType === 'read' ||
    lowerAction.includes('catch_hook') ||
    lowerAction.startsWith('new_') ||
    lowerAction.startsWith('every_')
  ) {
    return 'trigger';
  }

  if (
    lowerType === 'search' ||
    lowerAction.includes('search') ||
    lowerAction.includes('find') ||
    lowerAction.includes('lookup')
  ) {
    return 'search';
  }

  return 'action';
}

function normalizeOperator(rawOp: unknown): ZapFilterOperator {
  const op = String(rawOp || 'equals').toLowerCase().trim();
  if (op.includes('not_contain') || op.includes('does_not_contain')) return 'not_contains';
  if (op.includes('contain')) return 'contains';
  if (op.includes('not_equal') || op === '!=' || op === '<>') return 'not_equals';
  if (op.includes('greater') || op === '>' || op === '>=') return 'greater_than';
  if (op.includes('less') || op === '<' || op === '<=') return 'less_than';
  if (op.includes('not_exist') || op.includes('empty')) return 'not_exists';
  if (op.includes('exist')) return 'exists';
  if (op.includes('start')) return 'starts_with';
  if (op.includes('end')) return 'ends_with';
  return 'equals';
}

function extractFilterConditions(rawStep: Record<string, unknown>, params: Record<string, unknown>): ZapierFilterCondition[] {
  const candidates =
    (rawStep.conditions as unknown[]) ||
    (rawStep.filter_conditions as unknown[]) ||
    (params.conditions as unknown[]) ||
    (params.criteria as unknown[]) ||
    [];

  if (Array.isArray(candidates) && candidates.length > 0) {
    return candidates
      .filter((c): c is Record<string, unknown> => Boolean(c && typeof c === 'object'))
      .map((c) => ({
        field: String(c.field || c.key || c.left || '{{1__id}}'),
        operator: normalizeOperator(c.operator || c.predicate || c.match || 'equals'),
        value: String(c.value ?? c.right ?? ''),
      }));
  }

  if (params.field || params.key) {
    return [
      {
        field: String(params.field || params.key),
        operator: normalizeOperator(params.operator || 'equals'),
        value: String(params.value ?? ''),
      },
    ];
  }

  return [
    {
      field: '{{1__status}}',
      operator: 'equals',
      value: 'active',
    },
  ];
}

function parseRawStep(rawStep: Record<string, unknown>, index: number): NormalizedStep {
  const id = String(rawStep.id ?? rawStep.step_id ?? index + 1);
  const rawApp = String(
    rawStep.app ?? rawStep.selected_api ?? rawStep.service ?? rawStep.type ?? 'WebhooksByZapier'
  );
  const appKey = normalizeAppName(rawApp);
  const actionKey = String(
    rawStep.action ?? rawStep.action_type ?? rawStep.event ?? rawStep.method ?? (index === 0 ? 'trigger' : 'action')
  ).toLowerCase();

  const role = inferStepRole(index, appKey, String(rawStep.type ?? rawStep.role ?? ''), actionKey);
  const params =
    rawStep.params && typeof rawStep.params === 'object' && !Array.isArray(rawStep.params)
      ? { ...(rawStep.params as Record<string, unknown>) }
      : rawStep.inputs && typeof rawStep.inputs === 'object' && !Array.isArray(rawStep.inputs)
        ? { ...(rawStep.inputs as Record<string, unknown>) }
        : {};

  const rawMeta =
    rawStep.meta && typeof rawStep.meta === 'object'
      ? (rawStep.meta as Record<string, unknown>)
      : {};
  const metaEditor =
    rawMeta.$editor && typeof rawMeta.$editor === 'object'
      ? (rawMeta.$editor as Record<string, unknown>)
      : {};

  const cleanAppLabel = rawApp
    ? rawApp.split('@')[0].replace(/(CLIAPI|ByZapier|API|V2)$/i, '').trim()
    : 'App';
  const cleanActionLabel = actionKey ? actionKey.replace(/_/g, ' ') : (index === 0 ? 'Trigger' : 'Action');
  const defaultTitle = `${cleanAppLabel} — ${cleanActionLabel}`;

  const title = String(
    rawStep.title ||
      rawStep.label ||
      rawStep.name ||
      rawMeta.stepTitle ||
      metaEditor.stepTitle ||
      defaultTitle
  );

  const normalized: NormalizedStep = {
    id,
    index,
    title,
    rawApp,
    appKey,
    role,
    actionKey,
    params,
  };

  if (role === 'filter') {
    normalized.filterConditions = extractFilterConditions(rawStep, params);
  }

  if (role === 'code') {
    const langRaw = String(rawStep.language ?? params.language ?? actionKey).toLowerCase();
    normalized.codeLanguage = langRaw.includes('python') ? 'python' : 'javascript';
    normalized.sourceCode = String(
      rawStep.code ??
        params.code ??
        params.script ??
        `// Script migrado do Zapier\nconst item = inputData;\noutput = { processed: true, ...item };`
    );
  }

  if (role === 'path') {
    const rawBranches =
      (rawStep.paths as unknown[]) ||
      (rawStep.branches as unknown[]) ||
      (params.paths as unknown[]) ||
      (params.branches as unknown[]) ||
      [];

    if (Array.isArray(rawBranches) && rawBranches.length > 0) {
      normalized.branches = rawBranches
        .filter((b): b is Record<string, unknown> => Boolean(b && typeof b === 'object'))
        .map((branchObj, bIdx): NormalizedPathBranch => {
          const bStepsRaw = Array.isArray(branchObj.steps) ? branchObj.steps : [];
          const bSteps = bStepsRaw
            .filter((s): s is Record<string, unknown> => Boolean(s && typeof s === 'object'))
            .map((s, sIdx) => parseRawStep(s, index + 1 + bIdx * 10 + sIdx));
          return {
            id: String(branchObj.id ?? `branch_${bIdx + 1}`),
            name: String(branchObj.name ?? branchObj.title ?? `Caminho ${String.fromCharCode(65 + bIdx)}`),
            conditions: extractFilterConditions(branchObj, branchObj),
            steps: bSteps,
          };
        });
    }
  }

  return normalized;
}

function parseSingleZapObject(rawZap: Record<string, unknown>, zapIdx: number): NormalizedZap | null {
  const id = String(rawZap.id ?? rawZap.zap_id ?? `zap_${zapIdx + 1}`);
  const description = typeof rawZap.description === 'string' ? rawZap.description : undefined;
  const statusRaw = String(rawZap.status ?? rawZap.state ?? 'on').toLowerCase();
  const status: 'on' | 'off' | 'draft' =
    statusRaw === 'off' || statusRaw === 'paused'
      ? 'off'
      : statusRaw === 'draft'
        ? 'draft'
        : 'on';

  let stepsArray: Record<string, unknown>[] = [];

  if (Array.isArray(rawZap.steps)) {
    stepsArray = rawZap.steps.filter(
      (s): s is Record<string, unknown> => Boolean(s && typeof s === 'object')
    );
  } else if (rawZap.nodes && typeof rawZap.nodes === 'object' && !Array.isArray(rawZap.nodes)) {
    // Zapier v2 dictionary format: { nodes: { "1": {...}, "2": {...} } }
    const nodeEntries = Object.entries(rawZap.nodes as Record<string, unknown>)
      .filter(([, val]) => Boolean(val && typeof val === 'object'))
      .map(([key, val]) => ({
        id: key,
        ...(val as Record<string, unknown>),
      }));
    stepsArray = nodeEntries;
  } else if (Array.isArray(rawZap.actions)) {
    stepsArray = rawZap.actions.filter(
      (s): s is Record<string, unknown> => Boolean(s && typeof s === 'object')
    );
  }

  if (stepsArray.length === 0) {
    return null;
  }

  const steps = stepsArray.map((s, idx) => parseRawStep(s, idx));

  let title = String(rawZap.title || rawZap.name || '').trim();
  if (!title || title.toLowerCase() === 'untitled zap') {
    const summary = steps
      .slice(0, 3)
      .map((st) => st.title.split('—')[0].trim())
      .filter(Boolean)
      .join(' → ');
    title = summary ? `${summary} (#${zapIdx + 1})` : `Zap Migrado #${zapIdx + 1}`;
  }

  return {
    id,
    title,
    description,
    status,
    steps,
    rawSource: rawZap,
  };
}

export function parseZapierJson(
  jsonInput: string
): { ok: true; zaps: NormalizedZap[] } | { ok: false; error: string } {
  const trimmed = jsonInput.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: 'O campo de entrada está vazio. Cole um JSON do Zapier ou escolha um dos 5 exemplos reais acima.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return {
      ok: false,
      error: `JSON inválido (${msg}). Verifique chaves, aspas ou vírgulas ausentes.`,
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      ok: false,
      error: 'O JSON fornecido deve ser um objeto ou uma lista de Zaps.',
    };
  }

  const zaps: NormalizedZap[] = [];

  if (Array.isArray(parsed)) {
    // Check if it's an array of Zaps or an array of Steps
    const looksLikeSteps =
      parsed.length > 0 &&
      typeof parsed[0] === 'object' &&
      parsed[0] !== null &&
      !('steps' in parsed[0]) &&
      ('app' in parsed[0] || 'action' in parsed[0] || 'selected_api' in parsed[0]);

    if (looksLikeSteps) {
      const single = parseSingleZapObject({ title: 'Zap Importado', steps: parsed }, 0);
      if (single) zaps.push(single);
    } else {
      parsed.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          const z = parseSingleZapObject(item as Record<string, unknown>, idx);
          if (z) zaps.push(z);
        }
      });
    }
  } else {
    const rootObj = parsed as Record<string, unknown>;
    if (Array.isArray(rootObj.zaps)) {
      rootObj.zaps.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          const z = parseSingleZapObject(item as Record<string, unknown>, idx);
          if (z) zaps.push(z);
        }
      });
    } else {
      const single = parseSingleZapObject(rootObj, 0);
      if (single) zaps.push(single);
    }
  }

  if (zaps.length === 0) {
    return {
      ok: false,
      error:
        'Nenhum passo (step/node) do Zapier foi encontrado neste JSON. Certifique-se de que o arquivo possui a propriedade "steps", "nodes" ou "zaps".',
    };
  }

  return { ok: true, zaps };
}
