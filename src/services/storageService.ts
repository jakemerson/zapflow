import {
  AffiliateConfig,
  AiCopilotSettings,
  LicenseState,
} from '../types';
import {
  DEFAULT_AFFILIATE_CONFIG,
  DEFAULT_AI_SETTINGS,
  DEFAULT_LICENSE_STATE,
  STORAGE_KEYS,
} from '../constants/defaults';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const storageService = {
  loadAffiliateConfig(): AffiliateConfig {
    if (!isBrowser()) return DEFAULT_AFFILIATE_CONFIG;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.AFFILIATE);
      if (!raw) return DEFAULT_AFFILIATE_CONFIG;
      const parsed = JSON.parse(raw);
      if (parsed.referralCode === 'jakemerson' || !parsed.referralCode) {
        parsed.referralCode = DEFAULT_AFFILIATE_CONFIG.referralCode;
      }
      if (parsed.templateUrl?.includes('railway.app/template') || !parsed.templateUrl) {
        parsed.templateUrl = DEFAULT_AFFILIATE_CONFIG.templateUrl;
      }
      return { ...DEFAULT_AFFILIATE_CONFIG, ...parsed };
    } catch {
      return DEFAULT_AFFILIATE_CONFIG;
    }
  },

  saveAffiliateConfig(config: AffiliateConfig): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.AFFILIATE, JSON.stringify(config));
    } catch {
      // Ignore quota errors
    }
  },

  loadAiSettings(): AiCopilotSettings {
    if (!isBrowser()) return DEFAULT_AI_SETTINGS;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
      if (!raw) return DEFAULT_AI_SETTINGS;
      return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_AI_SETTINGS;
    }
  },

  saveAiSettings(settings: AiCopilotSettings): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore quota errors
    }
  },

  loadLicenseState(): LicenseState {
    if (!isBrowser()) return DEFAULT_LICENSE_STATE;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.LICENSE);
      if (!raw) return DEFAULT_LICENSE_STATE;
      return { ...DEFAULT_LICENSE_STATE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_LICENSE_STATE;
    }
  },

  saveLicenseState(state: LicenseState): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  },
};
