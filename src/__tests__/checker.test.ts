import { describe, it, expect } from 'vitest';
import { checkI18nOverflow, measureTextWidth, calculateLineCount } from '../checker.js';
import type { I18nCheck } from '../types.js';

describe('measureTextWidth', () => {
  it('calculates width based on font size and text length', () => {
    // 10 chars * 16px * 0.6 = 96px
    expect(measureTextWidth('0123456789', '16px Arial')).toBe(96);
  });

  it('handles different font sizes', () => {
    // 5 chars * 20px * 0.6 = 60px
    expect(measureTextWidth('Hello', '20px Inter')).toBe(60);
  });

  it('defaults to 16px when no size found', () => {
    // 4 chars * 16px * 0.6 = 38.4
    expect(measureTextWidth('Test', 'Arial')).toBeCloseTo(38.4);
  });

  it('handles decimal font sizes', () => {
    // 10 chars * 14.5px * 0.6 = 87
    expect(measureTextWidth('0123456789', '14.5px sans-serif')).toBe(87);
  });
});

describe('calculateLineCount', () => {
  it('returns 1 for text fitting in container', () => {
    expect(calculateLineCount(100, 200)).toBe(1);
  });

  it('returns 2 for text needing two lines', () => {
    expect(calculateLineCount(300, 200)).toBe(2);
  });

  it('rounds up partial lines', () => {
    expect(calculateLineCount(250, 200)).toBe(2);
  });

  it('handles zero container width gracefully', () => {
    expect(calculateLineCount(100, 0)).toBe(1);
  });
});

describe('checkI18nOverflow', () => {
  it('detects overflow with explicit translations', () => {
    const checks: I18nCheck[] = [
      {
        id: 'save-button',
        text: 'Save',
        translations: {
          de: 'Speichern und fortfahren',  // Much longer
        },
        containerWidth: 60,
        font: '16px Arial',
      },
    ];

    const results = checkI18nOverflow(checks);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('save-button');
    expect(results[0].overflowingLocales.length).toBeGreaterThan(0);
    // German translation should overflow
    const deOverflow = results[0].overflowingLocales.find((l) => l.locale === 'de');
    expect(deOverflow).toBeDefined();
    expect(deOverflow!.overflow).toBeGreaterThan(0);
  });

  it('passes when text fits', () => {
    const checks: I18nCheck[] = [
      {
        id: 'ok-button',
        text: 'OK',
        translations: { de: 'OK', fr: 'OK', es: 'OK' },
        containerWidth: 200,
        font: '16px Arial',
      },
    ];

    const results = checkI18nOverflow(checks);
    expect(results[0].overflowingLocales).toHaveLength(0);
    expect(results[0].worstLocale).toBeNull();
    expect(results[0].passingLocales.length).toBeGreaterThan(0);
  });

  it('uses estimated expansion when no translation provided', () => {
    const checks: I18nCheck[] = [
      {
        id: 'tight-button',
        text: 'Save all changes now',
        translations: {},  // No translations - use estimates
        containerWidth: 100,
        font: '14px Arial',
      },
    ];

    const results = checkI18nOverflow(checks);
    expect(results).toHaveLength(1);
    // German (+35%) on a tight container should overflow
    const deResult = results[0].overflowingLocales.find((l) => l.locale === 'de');
    expect(deResult).toBeDefined();
  });

  it('sorts overflowing locales by severity (worst first)', () => {
    const checks: I18nCheck[] = [
      {
        id: 'header',
        text: 'Welcome to the application',
        translations: {},
        containerWidth: 120,
        font: '16px Arial',
      },
    ];

    const results = checkI18nOverflow(checks);
    const overflows = results[0].overflowingLocales;
    for (let i = 1; i < overflows.length; i++) {
      expect(overflows[i - 1].overflow).toBeGreaterThanOrEqual(overflows[i].overflow);
    }
  });

  it('respects maxLines parameter', () => {
    // With maxLines=1, "Save changes" at 16px in 60px container:
    // width = 12 * 9.6 = 115.2, allowed = 60 -> overflow
    // With maxLines=2, allowed = 120 -> pass
    const checks: I18nCheck[] = [
      {
        id: 'multi-line',
        text: 'Save changes',
        translations: { en: 'Save changes' },
        containerWidth: 60,
        font: '16px Arial',
        maxLines: 2,
      },
    ];

    const results = checkI18nOverflow(checks);
    const enResult = results[0].passingLocales.includes('en') ||
      results[0].overflowingLocales.find((l) => l.locale === 'en');
    // With 2 lines allowed at 60px = 120px budget, text is ~115.2px -> should pass
    expect(results[0].passingLocales).toContain('en');
  });

  it('identifies worst locale correctly', () => {
    const checks: I18nCheck[] = [
      {
        id: 'test',
        text: 'Configuration settings',
        translations: {
          de: 'Konfigurationseinstellungen bearbeiten',  // Very long
          fr: 'Parametres de configuration',
        },
        containerWidth: 120,
        font: '14px Arial',
      },
    ];

    const results = checkI18nOverflow(checks);
    if (results[0].worstLocale) {
      // Worst locale should be the first in the sorted overflows array
      expect(results[0].worstLocale).toBe(results[0].overflowingLocales[0].locale);
    }
  });

  it('handles multiple checks', () => {
    const checks: I18nCheck[] = [
      {
        id: 'btn-1',
        text: 'OK',
        translations: {},
        containerWidth: 200,
        font: '16px Arial',
      },
      {
        id: 'btn-2',
        text: 'Submit your application for review',
        translations: {},
        containerWidth: 100,
        font: '16px Arial',
      },
    ];

    const results = checkI18nOverflow(checks);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('btn-1');
    expect(results[1].id).toBe('btn-2');
  });
});
