import {
  MigrationReport,
  N8nWorkflow,
  NormalizedZap,
  StepMappingResult,
} from '../types';

export function validateN8nWorkflow(
  workflow: N8nWorkflow
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workflow || typeof workflow !== 'object') {
    return { isValid: false, errors: ['Workflow nulo ou inválido.'] };
  }

  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    errors.push('O workflow n8n não contém nenhum nó.');
  }

  const nodeIds = new Set<string>();
  const nodeNames = new Set<string>();

  for (const node of workflow.nodes || []) {
    if (!node.id) {
      errors.push(`Nó "${node.name}" não possui um ID válido.`);
    } else if (nodeIds.has(node.id)) {
      errors.push(`ID de nó duplicado detectado: "${node.id}".`);
    } else {
      nodeIds.add(node.id);
    }

    if (!node.name) {
      errors.push(`Nó com ID "${node.id}" não possui nome.`);
    } else if (nodeNames.has(node.name)) {
      errors.push(`Nome de nó duplicado detectado no n8n: "${node.name}".`);
    } else {
      nodeNames.add(node.name);
    }

    if (!node.type || !node.type.includes('.')) {
      errors.push(`Tipo de nó inválido em "${node.name}": "${node.type}".`);
    }

    if (
      !Array.isArray(node.position) ||
      node.position.length !== 2 ||
      !Number.isFinite(node.position[0]) ||
      !Number.isFinite(node.position[1])
    ) {
      errors.push(`Coordenadas [x, y] inválidas no nó "${node.name}".`);
    }
  }

  if (workflow.connections && typeof workflow.connections === 'object') {
    for (const [sourceName, connGroup] of Object.entries(workflow.connections)) {
      if (!nodeNames.has(sourceName)) {
        errors.push(`Conexão de origem referencia nó inexistente: "${sourceName}".`);
      }
      if (connGroup && Array.isArray(connGroup.main)) {
        for (const branch of connGroup.main) {
          if (Array.isArray(branch)) {
            for (const target of branch) {
              if (!nodeNames.has(target.node)) {
                errors.push(
                  `Conexão de "${sourceName}" aponta para nó de destino inexistente: "${target.node}".`
                );
              }
            }
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function buildMigrationReport(
  zap: NormalizedZap,
  workflow: N8nWorkflow,
  stepResults: StepMappingResult[]
): MigrationReport {
  const validation = validateN8nWorkflow(workflow);
  const totalSteps = stepResults.length;

  const nativeMappedCount = stepResults.filter((s) => s.mappingStatus === 'native').length;
  const heuristicMappedCount = stepResults.filter((s) => s.mappingStatus === 'heuristic').length;
  const fallbackCount = stepResults.filter((s) => s.mappingStatus === 'http_fallback').length;

  const expressionsConvertedCount = stepResults.reduce(
    (sum, s) => sum + s.expressionsConverted,
    0
  );

  const avgConfidence =
    totalSteps > 0
      ? Math.round(
          stepResults.reduce((sum, s) => sum + s.confidenceScore, 0) / totalSteps
        )
      : 100;

  const requiredCredentialsSet = new Set<string>();
  const warnings: string[] = [];

  for (const sr of stepResults) {
    if (sr.requiredCredential) {
      requiredCredentialsSet.add(sr.requiredCredential);
    }
    for (const w of sr.warnings) {
      warnings.push(`[${sr.n8nNodeName}] ${w}`);
    }
  }

  const requiredCredentials = Array.from(requiredCredentialsSet);

  const checklist: string[] = [
    'Importar o arquivo .json no n8n ou pressionar Ctrl+V / Cmd+V diretamente no canvas aberto do n8n.',
  ];

  if (requiredCredentials.length > 0) {
    checklist.push(
      `Vincular ${requiredCredentials.length} credencial(is) no n8n: ${requiredCredentials.join(', ')}.`
    );
  }

  const hasWebhookTrigger = stepResults.some((s) => s.n8nNodeType === 'n8n-nodes-base.webhook');
  if (hasWebhookTrigger) {
    checklist.push(
      'Copiar a Production URL gerada no nó Webhook do n8n e atualizar no sistema emissor (substituindo a URL antiga do hooks.zapier.com).'
    );
  }

  const hasCodeStep = stepResults.some((s) => s.isCodeStep);
  if (hasCodeStep) {
    checklist.push(
      'Executar um teste manual no nó Code para validar a estrutura de saída [{ json: ... }].'
    );
  }

  if (fallbackCount > 0) {
    checklist.push(
      `Revisar o(s) ${fallbackCount} nó(s) HTTP Request gerado(s) como fallback para integrações customizadas.`
    );
  }

  checklist.push('Ativar a chave "Active" no topo direito do workflow no n8n e desligar o Zap antigo no Zapier.');

  return {
    zapId: zap.id,
    zapTitle: zap.title,
    overallConfidence: validation.isValid ? avgConfidence : Math.max(50, avgConfidence - 25),
    totalSteps,
    nativeMappedCount,
    heuristicMappedCount,
    fallbackCount,
    expressionsConvertedCount,
    requiredCredentials,
    warnings,
    checklist,
    stepResults,
    isValidSchema: validation.isValid,
    validationErrors: validation.errors,
  };
}
