/** Input: a single i18n check to run */
export interface I18nCheck {
  /** Component identifier (e.g. "save-button", "header-title") */
  id: string;
  /** English source text */
  text: string;
  /** locale code -> translated text (optional; missing locales use expansion estimates) */
  translations: Record<string, string>;
  /** Container width in pixels */
  containerWidth: number;
  /** CSS font shorthand, e.g. "16px Inter" */
  font: string;
  /** Maximum allowed lines (single-line by default) */
  maxLines?: number;
}

/** Per-locale overflow detail */
export interface LocaleOverflow {
  locale: string;
  textWidth: number;
  overflow: number;
  lineCount: number;
}

/** Output: result for a single check */
export interface I18nResult {
  id: string;
  overflowingLocales: LocaleOverflow[];
  passingLocales: string[];
  worstLocale: string | null;
}

/** CLI config file shape */
export interface I18nConfig {
  checks: I18nCheck[];
}

/** Report format options */
export type ReportFormat = 'table' | 'json' | 'markdown';
