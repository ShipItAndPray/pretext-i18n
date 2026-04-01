import type { I18nCheck, I18nResult, LocaleOverflow } from './types.js';
import { estimateExpansion, getSupportedLocales } from './expansion.js';

/**
 * Estimate text width in pixels using average character width heuristic.
 * Parses the font size from a CSS font shorthand like "16px Inter".
 *
 * In a real Pretext integration this would use the Pretext layout engine
 * for pixel-perfect measurement. This heuristic uses 0.6 * fontSize as
 * average character width, which is standard for proportional Latin fonts.
 */
export function measureTextWidth(text: string, font: string): number {
  const sizeMatch = font.match(/(\d+(?:\.\d+)?)\s*px/);
  const fontSize = sizeMatch ? parseFloat(sizeMatch[1]) : 16;
  // Average char width ~0.6 of font size for proportional Latin fonts
  const avgCharWidth = fontSize * 0.6;
  return text.length * avgCharWidth;
}

/**
 * Calculate how many lines the text would occupy in the given container.
 */
export function calculateLineCount(textWidth: number, containerWidth: number): number {
  if (containerWidth <= 0) return 1;
  return Math.ceil(textWidth / containerWidth);
}

/**
 * Run overflow checks for a single I18nCheck.
 */
function checkSingle(check: I18nCheck): I18nResult {
  const { id, text, translations, containerWidth, font, maxLines = 1 } = check;

  // Determine which locales to check:
  // - Explicit translations provided
  // - Plus all supported locales that aren't already provided
  const explicitLocales = Object.keys(translations);
  const estimatedLocales = getSupportedLocales().filter(
    (loc) => !explicitLocales.includes(loc)
  );
  const allLocales = [...explicitLocales, ...estimatedLocales];

  const overflowingLocales: LocaleOverflow[] = [];
  const passingLocales: string[] = [];

  for (const locale of allLocales) {
    const localizedText = translations[locale] ?? estimateExpansion(text, locale);
    const textWidth = measureTextWidth(localizedText, font);
    const lineCount = calculateLineCount(textWidth, containerWidth);
    const maxAllowedWidth = containerWidth * maxLines;
    const overflow = textWidth - maxAllowedWidth;

    if (overflow > 0) {
      overflowingLocales.push({
        locale,
        textWidth: Math.round(textWidth * 100) / 100,
        overflow: Math.round(overflow * 100) / 100,
        lineCount,
      });
    } else {
      passingLocales.push(locale);
    }
  }

  // Sort overflows by severity (worst first)
  overflowingLocales.sort((a, b) => b.overflow - a.overflow);

  return {
    id,
    overflowingLocales,
    passingLocales,
    worstLocale: overflowingLocales.length > 0 ? overflowingLocales[0].locale : null,
  };
}

/**
 * Run overflow checks for all provided I18nChecks.
 */
export function checkI18nOverflow(checks: I18nCheck[]): I18nResult[] {
  return checks.map(checkSingle);
}
