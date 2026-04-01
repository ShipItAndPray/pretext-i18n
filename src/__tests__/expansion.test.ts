import { describe, it, expect } from 'vitest';
import {
  estimateExpansion,
  getExpansionFactor,
  getSupportedLocales,
  EXPANSION_FACTORS,
} from '../expansion.js';

describe('getExpansionFactor', () => {
  it('returns correct factor for German', () => {
    expect(getExpansionFactor('de')).toBe(1.35);
  });

  it('returns correct factor for Japanese (contraction)', () => {
    expect(getExpansionFactor('ja')).toBe(0.9);
  });

  it('returns correct factor for Chinese (contraction)', () => {
    expect(getExpansionFactor('zh')).toBe(0.8);
  });

  it('handles locale subtags like de-DE', () => {
    expect(getExpansionFactor('de-DE')).toBe(1.35);
    expect(getExpansionFactor('fr-CA')).toBe(1.2);
  });

  it('returns 1.0 for unknown locales', () => {
    expect(getExpansionFactor('xx')).toBe(1.0);
    expect(getExpansionFactor('unknown')).toBe(1.0);
  });
});

describe('estimateExpansion', () => {
  it('expands text for German (+35%)', () => {
    const text = 'Save changes';
    const expanded = estimateExpansion(text, 'de');
    expect(expanded.length).toBe(Math.round(text.length * 1.35));
  });

  it('contracts text for Chinese (-20%)', () => {
    const text = 'Save changes';
    const contracted = estimateExpansion(text, 'zh');
    expect(contracted.length).toBe(Math.round(text.length * 0.8));
  });

  it('returns same length for unknown locale', () => {
    const text = 'Hello world';
    const result = estimateExpansion(text, 'xx');
    expect(result.length).toBe(text.length);
  });

  it('preserves original text as prefix when expanding', () => {
    const text = 'Save';
    const expanded = estimateExpansion(text, 'de');
    expect(expanded.startsWith(text)).toBe(true);
  });

  it('produces substring when contracting', () => {
    const text = 'Save changes';
    const contracted = estimateExpansion(text, 'ja');
    expect(text.startsWith(contracted)).toBe(true);
  });
});

describe('getSupportedLocales', () => {
  it('returns all locale codes', () => {
    const locales = getSupportedLocales();
    expect(locales.length).toBeGreaterThan(10);
    expect(locales).toContain('de');
    expect(locales).toContain('ja');
    expect(locales).toContain('ar');
  });
});

describe('EXPANSION_FACTORS', () => {
  it('all factors are positive numbers', () => {
    for (const [locale, factor] of Object.entries(EXPANSION_FACTORS)) {
      expect(factor).toBeGreaterThan(0);
      expect(typeof factor).toBe('number');
    }
  });

  it('has expected locales from spec', () => {
    const expected = ['de', 'fr', 'es', 'it', 'pt', 'ja', 'zh', 'ko', 'ar', 'ru', 'fi'];
    for (const loc of expected) {
      expect(EXPANSION_FACTORS).toHaveProperty(loc);
    }
  });
});
