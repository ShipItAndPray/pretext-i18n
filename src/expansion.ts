/**
 * Text expansion estimates by locale.
 * Values represent the multiplier relative to English source length.
 * Sources: IBM globalization guidelines, W3C i18n best practices.
 */
const EXPANSION_FACTORS: Record<string, number> = {
  de: 1.35,   // German: +35%
  fr: 1.20,   // French: +20%
  es: 1.25,   // Spanish: +25%
  it: 1.15,   // Italian: +15%
  pt: 1.30,   // Portuguese: +30%
  ja: 0.90,   // Japanese: -10%
  zh: 0.80,   // Chinese: -20%
  ko: 0.90,   // Korean: -10%
  ar: 1.25,   // Arabic: +25%
  ru: 1.15,   // Russian: +15%
  fi: 1.30,   // Finnish: +30%
  nl: 1.25,   // Dutch: +25%
  sv: 1.10,   // Swedish: +10%
  pl: 1.20,   // Polish: +20%
  tr: 1.15,   // Turkish: +15%
};

/**
 * Get the expansion factor for a given locale.
 * Returns 1.0 (no change) for unknown locales.
 */
export function getExpansionFactor(locale: string): number {
  // Normalize: take the language subtag (e.g. "de-DE" -> "de")
  const lang = locale.split('-')[0].toLowerCase();
  return EXPANSION_FACTORS[lang] ?? 1.0;
}

/**
 * Simulate text expansion for a target locale by repeating/trimming characters.
 * This produces a plausible-length string, not an actual translation.
 */
export function estimateExpansion(text: string, targetLocale: string): string {
  const factor = getExpansionFactor(targetLocale);
  const targetLength = Math.round(text.length * factor);

  if (targetLength <= text.length) {
    return text.slice(0, targetLength);
  }

  // Pad by cycling through the original text
  let result = text;
  while (result.length < targetLength) {
    const remaining = targetLength - result.length;
    result += text.slice(0, remaining);
  }
  return result;
}

/**
 * Returns all known locale codes.
 */
export function getSupportedLocales(): string[] {
  return Object.keys(EXPANSION_FACTORS);
}

export { EXPANSION_FACTORS };
