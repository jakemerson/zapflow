import {
  AffiliateConfig,
  ConvertedZapItem,
  N8nConnections,
  N8nNode,
  N8nWorkflow,
  NormalizedStep,
  NormalizedZap,
  StepMappingResult,
  ZapierFilterCondition,
} from '../types';
import { NODE_MAPPINGS } from '../constants/nodeMappings';
import { transpileParamsObject, transpileStringValue } from './expressionTranspiler';
import { buildMigrationReport } from './n8nValidator';

function mapFilterOperatorToN8n(operator: ZapierFilterCondition['operator']): {
  type: 'string' | 'number' | 'boolean';
  operation: string;
} {
  switch (operator) {
    case 'greater_than':
      return { type: 'number', operation: 'gt' };
    case 'less_than':
      return { type: 'number', operation: 'lt' };
    case 'contains':
      return { type: 'string', operation: 'contains' };
    case 'not_contains':
      return { type: 'string', operation: 'notContains' };
    case 'not_equals':
      return { type: 'string', operation: 'notEquals' };
    case 'starts_with':
      return { type: 'string', operation: 'startsWith' };
    case 'ends_with':
      return { type: 'string', operation: 'endsWith' };
    case 'exists':
      return { type: 'string', operation: 'notEmpty' };
    case 'not_exists':
      return { type: 'string', operation: 'empty' };
    case 'equals':
    default:
      return { type: 'string', operation: 'equals' };
  }
}

export function transpileZapierCodeHeuristic(
  sourceCode: string,
  language: 'javascript' | 'python' = 'javascript'
): string {
  const trimmed = (sourceCode || '').trim();
  if (language === 'python') {
    const pyBody = trimmed
      .replace(/input_data\[['"]([^'"]+)['"]\]/g, "_input.first().json.get('$1')")
      .replace(/input_data\.get\(/g, '_input.first().json.get(');
    return `# Migrado automaticamente de Code by Zapier (Python) para n8n\n${pyBody}\n\nreturn [{'json': output if 'output' in locals() else {}}]`;
  }

  let jsBody = trimmed
    .replace(/\binputData\.([a-zA-Z0-9_]+)/g, '$input.first().json.$1')
    .replace(/\binputData\[['"]([^'"]+)['"]\]/g, "$input.first().json['$1']");

  if (!jsBody.includes('let output') && !jsBody.includes('const output') && !jsBody.includes('var output')) {
    if (jsBody.includes('output =')) {
      jsBody = `let output = {};\n${jsBody}`;
    }
  }

  if (!jsBody.includes('return [')) {
    jsBody = `${jsBody}\n\nreturn [{ json: typeof output !== 'undefined' ? output : $input.first().json }];`;
  }

  return `// ⚡ Migrado automaticamente de Code by Zapier (JS) para n8n Code Node v2\n// Nota: inputData foi mapeado para $input.first().json\n${jsBody}`;
}

export function convertZapToN8n(
  zap: NormalizedZap,
  affiliateConfig: AffiliateConfig
): ConvertedZapItem {
  const nodes: N8nNode[] = [];
  const connections: N8nConnections = {};
  const stepResults: StepMappingResult[] = [];
  const usedNames = new Set<string>();
  const stepLookup: Record<string, string> = {};

  function getUniqueNodeName(baseName: string): string {
    const cleanBase = baseName.trim() || 'Step';
    if (!usedNames.has(cleanBase)) {
      usedNames.add(cleanBase);
      return cleanBase;
    }
    let counter = 2;
    while (usedNames.has(`${cleanBase} ${counter}`)) {
      counter += 1;
    }
    const candidate = `${cleanBase} ${counter}`;
    usedNames.add(candidate);
    return candidate;
  }

  function addConnection(sourceNodeName: string, targetNodeName: string, branchIndex = 0): void {
    if (!connections[sourceNodeName]) {
      connections[sourceNodeName] = { main: [] };
    }
    while (connections[sourceNodeName].main.length <= branchIndex) {
      connections[sourceNodeName].main.push([]);
    }
    connections[sourceNodeName].main[branchIndex].push({
      node: targetNodeName,
      type: 'main',
      index: 0,
    });
  }

  function buildSingleStepNode(
    step: NormalizedStep,
    position: [number, number],
    previousNodeName?: string
  ): { node: N8nNode; result: StepMappingResult } {
    const nodeId = `node-${step.id}-${nodes.length + 1}`;
    let expressionsConverted = 0;

    // 1. Filter by Zapier -> n8n-nodes-base.if
    if (step.role === 'filter') {
      const nodeName = getUniqueNodeName(step.title || 'Filter Condition (If)');
      stepLookup[step.id] = nodeName;
      stepLookup[String(step.index + 1)] = nodeName;
      stepLookup[`step_${step.index + 1}`] = nodeName;

      const rawConds = step.filterConditions || [
        { field: '{{1__status}}', operator: 'equals', value: 'active' },
      ];

      const n8nConds = rawConds.map((c, idx) => {
        const leftTranspiled = transpileStringValue(c.field, stepLookup, previousNodeName);
        const rightTranspiled = transpileStringValue(c.value, stepLookup, previousNodeName);
        expressionsConverted += leftTranspiled.convertedCount + rightTranspiled.convertedCount;
        const opSpec = mapFilterOperatorToN8n(c.operator);
        return {
          id: `cond-${idx + 1}`,
          leftValue: leftTranspiled.value,
          rightValue: opSpec.type === 'number' ? Number(rightTranspiled.value) || 0 : rightTranspiled.value,
          operator: {
            type: opSpec.type,
            operation: opSpec.operation,
          },
        };
      });

      const node: N8nNode = {
        id: nodeId,
        name: nodeName,
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position,
        parameters: {
          conditions: {
            options: {
              caseSensitive: false,
              leftValue: '',
              typeValidation: 'loose',
            },
            conditions: n8nConds,
            combinator: 'and',
          },
          options: {},
        },
      };

      const result: StepMappingResult = {
        zapStepId: step.id,
        zapStepTitle: step.title,
        zapAppKey: 'filter',
        zapActionKey: step.actionKey,
        zapRole: step.role,
        n8nNodeId: nodeId,
        n8nNodeName: nodeName,
        n8nNodeType: node.type,
        n8nPosition: position,
        mappingStatus: 'native',
        confidenceScore: 98,
        warnings: [],
        expressionsConverted,
      };

      return { node, result };
    }

    // 2. Paths by Zapier -> n8n-nodes-base.switch
    if (step.role === 'path') {
      const nodeName = getUniqueNodeName(step.title || 'Router (Switch Paths)');
      stepLookup[step.id] = nodeName;
      stepLookup[String(step.index + 1)] = nodeName;
      stepLookup[`step_${step.index + 1}`] = nodeName;

      const branches = step.branches || [];
      const rulesValues = branches.map((b, bIdx) => {
        const firstCond = b.conditions[0] || {
          field: '{{1__type}}',
          operator: 'equals',
          value: b.name,
        };
        const leftT = transpileStringValue(firstCond.field, stepLookup, previousNodeName);
        const rightT = transpileStringValue(firstCond.value, stepLookup, previousNodeName);
        expressionsConverted += leftT.convertedCount + rightT.convertedCount;
        const opSpec = mapFilterOperatorToN8n(firstCond.operator);
        return {
          outputKey: b.name || `Path ${bIdx + 1}`,
          conditions: {
            options: { caseSensitive: false, typeValidation: 'loose' },
            conditions: [
              {
                id: `switch-cond-${bIdx + 1}`,
                leftValue: leftT.value,
                rightValue:
                  opSpec.type === 'number' ? Number(rightT.value) || 0 : rightT.value,
                operator: {
                  type: opSpec.type,
                  operation: opSpec.operation,
                },
              },
            ],
            combinator: 'and',
          },
        };
      });

      const node: N8nNode = {
        id: nodeId,
        name: nodeName,
        type: 'n8n-nodes-base.switch',
        typeVersion: 3,
        position,
        parameters: {
          mode: 'rules',
          rules: {
            values: rulesValues,
          },
          options: {
            fallbackOutput: 'extra',
          },
        },
      };

      const result: StepMappingResult = {
        zapStepId: step.id,
        zapStepTitle: step.title,
        zapAppKey: 'paths',
        zapActionKey: step.actionKey,
        zapRole: step.role,
        n8nNodeId: nodeId,
        n8nNodeName: nodeName,
        n8nNodeType: node.type,
        n8nPosition: position,
        mappingStatus: 'native',
        confidenceScore: 95,
        warnings: [],
        expressionsConverted,
      };

      return { node, result };
    }

    // 3. Code by Zapier -> n8n-nodes-base.code
    if (step.role === 'code') {
      const nodeName = getUniqueNodeName(step.title || 'Code (JS/Python)');
      stepLookup[step.id] = nodeName;
      stepLookup[String(step.index + 1)] = nodeName;
      stepLookup[`step_${step.index + 1}`] = nodeName;

      const lang = step.codeLanguage || 'javascript';
      const transpiledCode = transpileZapierCodeHeuristic(step.sourceCode || '', lang);

      const node: N8nNode = {
        id: nodeId,
        name: nodeName,
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position,
        parameters:
          lang === 'python'
            ? {
                language: 'python',
                pythonCode: transpiledCode,
              }
            : {
                mode: 'runOnceForAllItems',
                jsCode: transpiledCode,
              },
        notes: 'Código convertido de inputData (Zapier) para $input.first().json (n8n)',
        notesInFlow: true,
      };

      const result: StepMappingResult = {
        zapStepId: step.id,
        zapStepTitle: step.title,
        zapAppKey: 'code',
        zapActionKey: step.actionKey,
        zapRole: step.role,
        n8nNodeId: nodeId,
        n8nNodeName: nodeName,
        n8nNodeType: node.type,
        n8nPosition: position,
        mappingStatus: 'heuristic',
        confidenceScore: 88,
        warnings: [
          'Script Code by Zapier convertido via heurística AST. Use o botão "Refinar com IA" se o script usar bibliotecas assíncronas customizadas.',
        ],
        expressionsConverted: 1,
        isCodeStep: true,
        codeLanguage: lang,
      };

      return { node, result };
    }

    // 4. Lookup in NODE_MAPPINGS catalog
    const spec = NODE_MAPPINGS[step.appKey];
    const transpiled = transpileParamsObject(step.params, stepLookup, previousNodeName);
    expressionsConverted += transpiled.convertedCount;

    if (spec) {
      const isTrigger = step.role === 'trigger' && Boolean(spec.n8nTriggerType);
      const n8nType = isTrigger && spec.n8nTriggerType ? spec.n8nTriggerType : spec.n8nActionType;
      const typeVersion =
        isTrigger && spec.n8nTriggerVersion ? spec.n8nTriggerVersion : spec.n8nActionVersion;

      const nodeName = getUniqueNodeName(step.title || spec.displayName);
      stepLookup[step.id] = nodeName;
      stepLookup[String(step.index + 1)] = nodeName;
      stepLookup[`step_${step.index + 1}`] = nodeName;

      const node: N8nNode = {
        id: nodeId,
        name: nodeName,
        type: n8nType,
        typeVersion,
        position,
        parameters: spec.buildParameters(step.role, step.actionKey, transpiled.params),
      };

      if (n8nType === 'n8n-nodes-base.webhook') {
        node.webhookId = `zapflow-${zap.id}-${step.id}`;
      }

      if (spec.credentialType && spec.credentialLabel) {
        node.credentials = {
          [spec.credentialType]: {
            id: `CRED_${spec.appKey.toUpperCase()}`,
            name: spec.credentialLabel,
          },
        };
      }

      const result: StepMappingResult = {
        zapStepId: step.id,
        zapStepTitle: step.title,
        zapAppKey: step.appKey,
        zapActionKey: step.actionKey,
        zapRole: step.role,
        n8nNodeId: nodeId,
        n8nNodeName: nodeName,
        n8nNodeType: n8nType,
        n8nPosition: position,
        mappingStatus: 'native',
        confidenceScore: 98,
        requiredCredential: spec.credentialLabel,
        warnings: [],
        expressionsConverted,
      };

      return { node, result };
    }

    // 5. Intelligent HTTP Request Fallback for proprietary/unlisted Zapier apps
    const fallbackName = getUniqueNodeName(`${step.title || step.rawApp} (HTTP API)`);
    stepLookup[step.id] = fallbackName;
    stepLookup[String(step.index + 1)] = fallbackName;
    stepLookup[`step_${step.index + 1}`] = fallbackName;

    const fallbackNode: N8nNode = {
      id: nodeId,
      name: fallbackName,
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.2,
      position,
      parameters: {
        method: 'POST',
        url: `https://api.${step.appKey}.com/v1/${step.actionKey}`,
        sendBody: true,
        specifyBody: 'json',
        jsonBody: transpiled.params,
        options: {},
      },
      notes: `Fallback HTTP para ${step.rawApp} (${step.actionKey}). Configure o endpoint oficial ou instale o community node correspondente.`,
      notesInFlow: true,
    };

    const fallbackResult: StepMappingResult = {
      zapStepId: step.id,
      zapStepTitle: step.title,
      zapAppKey: step.appKey,
      zapActionKey: step.actionKey,
      zapRole: step.role,
      n8nNodeId: nodeId,
      n8nNodeName: fallbackName,
      n8nNodeType: fallbackNode.type,
      n8nPosition: position,
      mappingStatus: 'http_fallback',
      confidenceScore: 70,
      warnings: [
        `O app "${step.rawApp}" foi convertido para um nó HTTP Request estruturado com os parâmetros originais. Verifique o endpoint da API.`,
      ],
      expressionsConverted,
    };

    return { node: fallbackNode, result: fallbackResult };
  }

  // Layout coordinates & traversal
  let currentX = 260;
  const baseY = 360;
  let lastMainNodeName: string | undefined;

  for (const step of zap.steps) {
    const { node, result } = buildSingleStepNode(
      step,
      [currentX, baseY],
      lastMainNodeName
    );
    nodes.push(node);
    stepResults.push(result);

    if (lastMainNodeName) {
      addConnection(lastMainNodeName, node.name, 0);
    }

    if (step.role === 'path' && step.branches && step.branches.length > 0) {
      const totalBranches = step.branches.length;
      const switchNodeName = node.name;

      step.branches.forEach((branch, branchIdx) => {
        const offsetMultiplier = branchIdx - (totalBranches - 1) / 2;
        const branchY = Math.round(baseY + offsetMultiplier * 220);
        let branchX = currentX + 300;
        let prevBranchNodeName = switchNodeName;

        branch.steps.forEach((bStep, bStepIdx) => {
          const { node: bNode, result: bResult } = buildSingleStepNode(
            bStep,
            [branchX, branchY],
            prevBranchNodeName
          );
          nodes.push(bNode);
          stepResults.push(bResult);

          addConnection(
            prevBranchNodeName,
            bNode.name,
            bStepIdx === 0 ? branchIdx : 0
          );
          prevBranchNodeName = bNode.name;
          branchX += 280;
        });
      });

      currentX += 600;
      lastMainNodeName = node.name;
    } else {
      lastMainNodeName = node.name;
      currentX += 280;
    }
  }

  // Build Sticky Note documentation node at the top of the n8n Canvas
  const prelimCreds = Array.from(
    new Set(stepResults.map((s) => s.requiredCredential).filter(Boolean))
  );

  const referralUrl = `${affiliateConfig.templateUrl}${
    affiliateConfig.templateUrl.includes('?') ? '&' : '?'
  }referralCode=${encodeURIComponent(affiliateConfig.referralCode || 'jakemerson')}`;

  const headerLine = affiliateConfig.whiteLabelEnabled
    ? `## 🚀 ${affiliateConfig.customStickyHeader || affiliateConfig.agencyName}`
    : `## ⚡ Migrado do Zapier via ZapFlow (${zap.title})`;

  const credsSection =
    prelimCreds.length > 0
      ? `**🔑 Credenciais para vincular no n8n:**\n${prelimCreds.map((c) => `- \`${c}\``).join('\n')}`
      : `**✅ Nenhuma credencial OAuth externa obrigatória detectada.**`;

  const affiliateFooter = affiliateConfig.whiteLabelEnabled
    ? `_Gerado por ${affiliateConfig.agencyName}_`
    : `---\n💡 **Ainda não tem servidor n8n 24/7?** [Suba sua instância n8n + PostgreSQL na Railway em 60s por ~$5/mês (Economize 92%)](${referralUrl})`;

  const stickyNoteNode: N8nNode = {
    id: `sticky-doc-${zap.id}`,
    name: '📋 Guia de Migração ZapFlow',
    type: 'n8n-nodes-base.stickyNote',
    typeVersion: 1,
    position: [240, 60],
    parameters: {
      content: `${headerLine}\n\n${credsSection}\n\n${affiliateFooter}`,
      height: 230,
      width: 720,
      color: 4,
    },
  };

  const allNodes = [stickyNoteNode, ...nodes];

  const workflow: N8nWorkflow = {
    name: zap.title,
    nodes: allNodes,
    connections,
    active: false,
    settings: {
      executionOrder: 'v1',
      saveManualExecutions: true,
    },
    meta: {
      templateCredsSetupCompleted: false,
      migratedBy: 'ZapFlow (ZapierToN8N)',
      migratedAt: new Date().toISOString(),
    },
    tags: [{ name: 'migrated-from-zapier' }, { name: 'zapflow' }],
  };

  const report = buildMigrationReport(zap, workflow, stepResults);

  return {
    zap,
    workflow,
    report,
    workflowJsonString: JSON.stringify(workflow, null, 2),
  };
}
