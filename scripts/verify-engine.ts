import { SAMPLE_ZAPS } from '../src/constants/sampleZaps';
import { DEFAULT_AFFILIATE_CONFIG } from '../src/constants/defaults';
import { parseZapierJson } from '../src/services/zapierParser';
import { convertZapToN8n } from '../src/services/n8nGenerator';
import { transpileStringValue } from '../src/services/expressionTranspiler';
import {
  buildRailwayDeployUrl,
  calculateMigrationRoi,
  validateAndRedeemCoupon,
} from '../src/services/roiCalculatorService';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ FALHA DE VERIFICAÇÃO: ${message}`);
  }
}

console.log('🔍 Iniciando bateria de testes automatizados E2E do ZapFlow...\n');

// 1. Test Expression Transpiler
const stepLookup = {
  '1': 'Catch Lead Webhook',
  step_1: 'Catch Lead Webhook',
  '3': 'Normalizar Dados do Lead',
};

const singleExpr = transpileStringValue('{{1__email}}', stepLookup, 'Catch Lead Webhook');
assert(
  singleExpr.value === '={{ $json.email }}',
  `Esperado "={{ $json.email }}", recebido "${singleExpr.value}"`
);

const crossNodeExpr = transpileStringValue(
  '{{1__email}}',
  stepLookup,
  'Normalizar Dados do Lead'
);
assert(
  crossNodeExpr.value === "={{ $('Catch Lead Webhook').item.json.email }}",
  `Esperado referência nominal ao nó 1, recebido "${crossNodeExpr.value}"`
);

const mixedExpr = transpileStringValue(
  'Lead: {{3__clean_name}} em {{zap_meta_human_now}}',
  stepLookup,
  'Normalizar Dados do Lead'
);
assert(
  mixedExpr.value.startsWith('=Lead:') &&
    mixedExpr.value.includes('$json.clean_name') &&
    mixedExpr.value.includes('$now.toISO()'),
  `Falha em interpolação mista: "${mixedExpr.value}"`
);
console.log('✅ [1/4] Expression Transpiler validado com sucesso.');

// 2. Test all 5 Sample Zaps (8 total workflows including the 4-Zap Agency Batch)
let totalWorkflowsValidated = 0;

for (const sample of SAMPLE_ZAPS) {
  const rawJson = JSON.stringify(sample.payload);
  const parsed = parseZapierJson(rawJson);
  assert(parsed.ok === true, `Falha ao fazer parse do exemplo ${sample.id}`);
  if (!parsed.ok) continue;

  for (const zap of parsed.zaps) {
    const converted = convertZapToN8n(zap, DEFAULT_AFFILIATE_CONFIG);
    assert(
      converted.report.isValidSchema === true,
      `Schema inválido para "${zap.title}": ${converted.report.validationErrors.join(', ')}`
    );
    assert(
      converted.workflow.nodes.some((n) => n.type === 'n8n-nodes-base.stickyNote'),
      `Sticky Note ausente no workflow "${zap.title}"`
    );

    const sticky = converted.workflow.nodes.find(
      (n) => n.type === 'n8n-nodes-base.stickyNote'
    );
    assert(
      String(sticky?.parameters.content || '').includes('referralCode=jakemerson'),
      `Link de afiliado Railway ausente na Sticky Note de "${zap.title}"`
    );

    totalWorkflowsValidated += 1;
  }
}

assert(
  totalWorkflowsValidated === 8,
  `Esperados 8 workflows validados nos 5 exemplos, obtidos ${totalWorkflowsValidated}`
);
console.log(
  `✅ [2/4] Todos os ${totalWorkflowsValidated} workflows dos 5 pacotes de exemplo foram convertidos e validados no schema n8n v1.`
);

// 3. Test Multi-Branch Switch (Paths by Zapier) & HTTP Fallback
const routerSample = SAMPLE_ZAPS.find((s) => s.id === 'stripe-paths-router')!;
const routerParsed = parseZapierJson(JSON.stringify(routerSample.payload));
if (routerParsed.ok) {
  const routerConverted = convertZapToN8n(routerParsed.zaps[0], DEFAULT_AFFILIATE_CONFIG);
  const switchNode = routerConverted.workflow.nodes.find(
    (n) => n.type === 'n8n-nodes-base.switch'
  );
  assert(Boolean(switchNode), 'Nó Switch não foi gerado para Paths by Zapier');
  const switchConns = routerConverted.workflow.connections[switchNode!.name];
  assert(
    switchConns && switchConns.main.length === 2,
    'Switch deveria possuir 2 saídas independentes em connections.main'
  );
}
console.log('✅ [3/4] Roteamento Multi-Branch (Paths -> Switch DAG) verificado.');

// 4. Test ROI Calculator, Railway Affiliate Link & Pro Coupon
const roi = calculateMigrationRoi(20000, 12);
assert(roi.zapierMonthlyUsd === 289, 'Preço Zapier 20k deveria ser $289');
assert(roi.railwayMonthlyUsd === 5, 'Preço Railway até 50k deveria ser $5');
assert(roi.annualSavingsUsd === (289 - 5) * 12, 'Economia anual em USD incorreta');

const deployUrl = buildRailwayDeployUrl(DEFAULT_AFFILIATE_CONFIG);
assert(
  deployUrl.includes('?referralCode=jakemerson'),
  `URL de afiliado inválida: ${deployUrl}`
);

const couponCheck = validateAndRedeemCoupon('desafio12x12');
assert(couponCheck.valid === true, 'Cupom DESAFIO12X12 deveria ser válido');
console.log('✅ [4/4] Calculadora de ROI, Link Afiliado Railway e Cupons Pro verificados.\n');
console.log('🎉 TODOS OS TESTES AUTOMATIZADOS PASSARAM COM 100% DE SUCESSO!');
