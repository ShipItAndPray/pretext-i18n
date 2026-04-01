export { checkI18nOverflow, measureTextWidth, calculateLineCount } from './checker.js';
export { estimateExpansion, getExpansionFactor, getSupportedLocales, EXPANSION_FACTORS } from './expansion.js';
export { generateReport } from './reporter.js';
export type {
  I18nCheck,
  I18nResult,
  LocaleOverflow,
  I18nConfig,
  ReportFormat,
} from './types.js';
