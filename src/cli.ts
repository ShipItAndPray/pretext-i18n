import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkI18nOverflow } from './checker.js';
import { generateReport } from './reporter.js';
import type { I18nConfig, ReportFormat } from './types.js';

function parseArgs(args: string[]): {
  config: string;
  format: ReportFormat;
  failOnOverflow: boolean;
} {
  let config = 'i18n-checks.json';
  let format: ReportFormat = 'table';
  let failOnOverflow = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--config':
      case '-c':
        config = args[++i];
        break;
      case '--format':
      case '-f':
        format = args[++i] as ReportFormat;
        break;
      case '--fail-on-overflow':
        failOnOverflow = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return { config, format, failOnOverflow };
}

function printHelp(): void {
  console.log(`
  pretext-i18n — Catch i18n text overflow at build time

  Usage:
    pretext-i18n [options]

  Options:
    --config, -c <path>    Path to config JSON file (default: i18n-checks.json)
    --format, -f <fmt>     Output format: table | json | markdown (default: table)
    --fail-on-overflow     Exit with code 1 if any overflow detected (for CI)
    --help, -h             Show this help
`);
}

function main(): void {
  const { config, format, failOnOverflow } = parseArgs(process.argv.slice(2));

  const configPath = resolve(process.cwd(), config);
  let raw: string;
  try {
    raw = readFileSync(configPath, 'utf-8');
  } catch {
    console.error(`Error: Cannot read config file "${configPath}"`);
    process.exit(1);
  }

  let parsed: I18nConfig;
  try {
    parsed = JSON.parse(raw) as I18nConfig;
  } catch {
    console.error(`Error: Invalid JSON in "${configPath}"`);
    process.exit(1);
  }

  if (!parsed.checks || !Array.isArray(parsed.checks)) {
    console.error('Error: Config must have a "checks" array');
    process.exit(1);
  }

  const results = checkI18nOverflow(parsed.checks);
  const report = generateReport(results, format);
  console.log(report);

  const hasOverflow = results.some((r) => r.overflowingLocales.length > 0);
  if (failOnOverflow && hasOverflow) {
    process.exit(1);
  }
}

main();
