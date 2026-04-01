import type { I18nResult, ReportFormat } from './types.js';

/**
 * Generate a formatted report from i18n check results.
 */
export function generateReport(
  results: I18nResult[],
  format: ReportFormat
): string {
  switch (format) {
    case 'json':
      return generateJsonReport(results);
    case 'markdown':
      return generateMarkdownReport(results);
    case 'table':
    default:
      return generateTableReport(results);
  }
}

function generateJsonReport(results: I18nResult[]): string {
  const summary = {
    total: results.length,
    passing: results.filter((r) => r.overflowingLocales.length === 0).length,
    failing: results.filter((r) => r.overflowingLocales.length > 0).length,
    results,
  };
  return JSON.stringify(summary, null, 2);
}

function generateTableReport(results: I18nResult[]): string {
  const lines: string[] = [];
  const passing = results.filter((r) => r.overflowingLocales.length === 0).length;
  const failing = results.length - passing;

  lines.push('');
  lines.push('  pretext-i18n Overflow Report');
  lines.push('  ' + '='.repeat(50));
  lines.push('');

  for (const result of results) {
    const status = result.overflowingLocales.length > 0 ? 'FAIL' : 'PASS';
    const icon = status === 'FAIL' ? 'x' : 'v';
    lines.push(`  [${icon}] ${result.id}`);

    if (result.overflowingLocales.length > 0) {
      // Table header
      lines.push(`      ${'Locale'.padEnd(10)} ${'Width'.padEnd(10)} ${'Overflow'.padEnd(10)} Lines`);
      lines.push(`      ${'-'.repeat(10)} ${'-'.repeat(10)} ${'-'.repeat(10)} -----`);

      for (const loc of result.overflowingLocales) {
        lines.push(
          `      ${loc.locale.padEnd(10)} ${String(loc.textWidth).padEnd(10)} ${('+' + loc.overflow).padEnd(10)} ${loc.lineCount}`
        );
      }
    } else {
      lines.push(`      All ${result.passingLocales.length} locales pass`);
    }
    lines.push('');
  }

  lines.push('  ' + '-'.repeat(50));
  lines.push(`  Total: ${results.length} | Pass: ${passing} | Fail: ${failing}`);
  lines.push('');

  return lines.join('\n');
}

function generateMarkdownReport(results: I18nResult[]): string {
  const lines: string[] = [];
  const passing = results.filter((r) => r.overflowingLocales.length === 0).length;
  const failing = results.length - passing;

  lines.push('# pretext-i18n Overflow Report');
  lines.push('');
  lines.push(`**Total:** ${results.length} | **Pass:** ${passing} | **Fail:** ${failing}`);
  lines.push('');

  for (const result of results) {
    const status = result.overflowingLocales.length > 0 ? 'FAIL' : 'PASS';
    lines.push(`## ${status}: \`${result.id}\``);
    lines.push('');

    if (result.overflowingLocales.length > 0) {
      lines.push('| Locale | Width | Overflow | Lines |');
      lines.push('|--------|-------|----------|-------|');

      for (const loc of result.overflowingLocales) {
        lines.push(`| ${loc.locale} | ${loc.textWidth} | +${loc.overflow} | ${loc.lineCount} |`);
      }
    } else {
      lines.push(`All ${result.passingLocales.length} locales pass.`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
