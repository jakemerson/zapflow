import { AffiliateConfig, RoiCalculation } from '../types';
import {
  RAILWAY_N8N_HOBBY_USD,
  RAILWAY_N8N_WORKERS_USD,
  USD_TO_BRL_RATE,
  VALID_PRO_COUPONS,
  ZAPIER_PRICING_TIERS,
} from '../constants/defaults';

export function calculateMigrationRoi(
  monthlyTasks: number,
  zapierCount = 12
): RoiCalculation {
  const matchedTier =
    ZAPIER_PRICING_TIERS.find((t) => t.tasks >= monthlyTasks) ||
    ZAPIER_PRICING_TIERS[ZAPIER_PRICING_TIERS.length - 1];

  const zapierMonthlyUsd = matchedTier.monthlyUsd;
  const zapierAnnualUsd = Math.round(zapierMonthlyUsd * 12);

  const railwayMonthlyUsd =
    monthlyTasks > 50000 ? RAILWAY_N8N_WORKERS_USD : RAILWAY_N8N_HOBBY_USD;
  const railwayAnnualUsd = railwayMonthlyUsd * 12;

  const monthlySavingsUsd = Math.max(0, Number((zapierMonthlyUsd - railwayMonthlyUsd).toFixed(2)));
  const annualSavingsUsd = Math.round(monthlySavingsUsd * 12);
  const monthlySavingsBrl = Math.round(monthlySavingsUsd * USD_TO_BRL_RATE);
  const annualSavingsBrl = Math.round(annualSavingsUsd * USD_TO_BRL_RATE);

  const savingsPercentage =
    zapierMonthlyUsd > 0
      ? Math.min(99, Math.round((monthlySavingsUsd / zapierMonthlyUsd) * 100))
      : 90;

  return {
    monthlyTasks: matchedTier.tasks,
    zapierCount,
    zapierMonthlyUsd,
    zapierAnnualUsd,
    railwayMonthlyUsd,
    railwayAnnualUsd,
    monthlySavingsUsd,
    annualSavingsUsd,
    monthlySavingsBrl,
    annualSavingsBrl,
    savingsPercentage,
    recommendedZapierTier: matchedTier.planName,
  };
}

export function buildRailwayDeployUrl(config: AffiliateConfig): string {
  const baseUrl =
    config.templateUrl.trim() || 'https://railway.app/template/n8n-with-workers';
  const code = config.referralCode.trim() || 'jakemerson';
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}referralCode=${encodeURIComponent(code)}`;
}

export function validateAndRedeemCoupon(code: string): {
  valid: boolean;
  normalizedCode: string;
  message: string;
} {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return {
      valid: false,
      normalizedCode: '',
      message: 'Digite um cupom promocional válido (ex: DESAFIO12X12).',
    };
  }

  const isValid = (VALID_PRO_COUPONS as readonly string[]).includes(normalizedCode);
  if (isValid) {
    return {
      valid: true,
      normalizedCode,
      message: `Cupom ${normalizedCode} ativado! Modo Pro / Agency Batch desbloqueado vitaliciamente.`,
    };
  }

  return {
    valid: false,
    normalizedCode,
    message: `O cupom "${normalizedCode}" não foi reconhecido. Experimente DESAFIO12X12 ou ZAPFLOWPRO.`,
  };
}
