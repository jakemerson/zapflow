const SYSTEM_VAR_MAP: Record<string, string> = {
  zap_meta_human_now: '$now.toISO()',
  zap_meta_utc_iso: '$now.toISO()',
  zap_meta_timestamp: '$now.toUnixInteger()',
  zap_meta_timezone: '$today.zoneName',
  zap_meta_edt_iso: '$now.toISO()',
  zap_meta_est_iso: '$now.toISO()',
};

function sanitizeFieldPath(rawPath: string): string {
  return rawPath
    .trim()
    .replace(/__/g, '.')
    .replace(/\[\]/g, '[0]')
    .replace(/^\.+|\.+$/g, '');
}

function buildSingleTokenExpression(
  innerToken: string,
  stepLookup: Record<string, string>,
  previousNodeName?: string
): string {
  const trimmed = innerToken.trim();

  if (SYSTEM_VAR_MAP[trimmed]) {
    return SYSTEM_VAR_MAP[trimmed];
  }

  // Matches patterns like:
  // "1__email", "step_1__user__email", "109283__data__id", "1.user.email"
  const stepUnderscoreMatch = trimmed.match(/^(step_\d+|\d+)__(.+)$/i);
  if (stepUnderscoreMatch) {
    const stepKey = stepUnderscoreMatch[1].toLowerCase();
    const numericId = stepKey.replace(/^step_/, '');
    const fieldPath = sanitizeFieldPath(stepUnderscoreMatch[2]);
    const targetNodeName = stepLookup[stepKey] || stepLookup[numericId];

    if (targetNodeName && targetNodeName !== previousNodeName) {
      return `$('${targetNodeName.replace(/'/g, "\\'")}').item.json.${fieldPath}`;
    }
    return `$json.${fieldPath}`;
  }

  const stepDotMatch = trimmed.match(/^(step_\d+|\d+)\.(.+)$/i);
  if (stepDotMatch) {
    const stepKey = stepDotMatch[1].toLowerCase();
    const numericId = stepKey.replace(/^step_/, '');
    const fieldPath = sanitizeFieldPath(stepDotMatch[2]);
    const targetNodeName = stepLookup[stepKey] || stepLookup[numericId];

    if (targetNodeName && targetNodeName !== previousNodeName) {
      return `$('${targetNodeName.replace(/'/g, "\\'")}').item.json.${fieldPath}`;
    }
    return `$json.${fieldPath}`;
  }

  const cleanField = sanitizeFieldPath(trimmed);
  return `$json.${cleanField}`;
}

export function transpileStringValue(
  rawText: string,
  stepLookup: Record<string, string>,
  previousNodeName?: string
): { value: string; convertedCount: number } {
  if (!rawText || typeof rawText !== 'string' || !rawText.includes('{{')) {
    return { value: rawText, convertedCount: 0 };
  }

  const tokenRegex = /\{\{([^{}]+)\}\}/g;
  const matches = [...rawText.matchAll(tokenRegex)];
  if (matches.length === 0) {
    return { value: rawText, convertedCount: 0 };
  }

  // Case 1: The entire string is a single Zapier variable token (e.g. "{{1__email}}")
  if (matches.length === 1 && matches[0][0].trim() === rawText.trim()) {
    const expr = buildSingleTokenExpression(matches[0][1], stepLookup, previousNodeName);
    return {
      value: `={{ ${expr} }}`,
      convertedCount: 1,
    };
  }

  // Case 2: Mixed string with static text and one or more tokens (e.g. "Lead: {{1__name}} <{{1__email}}>")
  let convertedCount = 0;
  const replaced = rawText.replace(tokenRegex, (_fullMatch, inner: string) => {
    convertedCount += 1;
    const expr = buildSingleTokenExpression(inner, stepLookup, previousNodeName);
    return `{{ ${expr} }}`;
  });

  const finalValue = replaced.startsWith('=') ? replaced : `=${replaced}`;
  return {
    value: finalValue,
    convertedCount,
  };
}

export function transpileParamsObject(
  params: Record<string, unknown>,
  stepLookup: Record<string, string>,
  previousNodeName?: string
): { params: Record<string, unknown>; convertedCount: number } {
  let totalConverted = 0;

  function walkValue(val: unknown): unknown {
    if (typeof val === 'string') {
      const res = transpileStringValue(val, stepLookup, previousNodeName);
      totalConverted += res.convertedCount;
      return res.value;
    }
    if (Array.isArray(val)) {
      return val.map((item) => walkValue(item));
    }
    if (val !== null && typeof val === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        out[k] = walkValue(v);
      }
      return out;
    }
    return val;
  }

  const transpiled = walkValue(params) as Record<string, unknown>;
  return {
    params: transpiled,
    convertedCount: totalConverted,
  };
}
