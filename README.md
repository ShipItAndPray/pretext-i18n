# @shipitandpray/pretext-i18n

Catch i18n text overflow at build time. No browser needed. Powered by Pretext.

**[Live Demo](https://shipitandpray.github.io/pretext-i18n/)**

German strings are 30% longer than English. French adds 20%. Your buttons, headers, and labels overflow silently -- until a QA engineer in Munich files a P1.

`pretext-i18n` measures all locale variants against container constraints at build time, before any browser renders a pixel. Run it in CI. Catch overflow bugs before they ship.

## Install

```bash
npm install @shipitandpray/pretext-i18n
```

## Quick Start

### Programmatic API

```typescript
import { checkI18nOverflow, generateReport } from '@shipitandpray/pretext-i18n';

const results = checkI18nOverflow([
  {
    id: 'save-button',
    text: 'Save changes',
    translations: {
      de: 'Anderungen speichern',
      fr: 'Enregistrer les modifications',
      ja: '変更を保存',
    },
    containerWidth: 120,
    font: '14px Inter',
    maxLines: 1,
  },
]);

console.log(generateReport(results, 'table'));
```

### CLI

```bash
# Create i18n-checks.json with your checks, then:
pretext-i18n --config i18n-checks.json --format table

# Fail CI on overflow:
pretext-i18n --config i18n-checks.json --fail-on-overflow
```

### Config File

```json
{
  "checks": [
    {
      "id": "save-button",
      "text": "Save changes",
      "translations": {
        "de": "Anderungen speichern",
        "fr": "Enregistrer les modifications"
      },
      "containerWidth": 120,
      "font": "14px Inter",
      "maxLines": 1
    }
  ]
}
```

## Automatic Expansion Estimates

When translations aren't provided, `pretext-i18n` estimates text length using industry-standard expansion factors:

| Locale | Expansion | Source |
|--------|-----------|--------|
| German (de) | +35% | IBM / W3C |
| French (fr) | +20% | IBM / W3C |
| Spanish (es) | +25% | IBM / W3C |
| Portuguese (pt) | +30% | IBM / W3C |
| Finnish (fi) | +30% | IBM / W3C |
| Arabic (ar) | +25% | IBM / W3C |
| Italian (it) | +15% | IBM / W3C |
| Russian (ru) | +15% | IBM / W3C |
| Japanese (ja) | -10% | IBM / W3C |
| Chinese (zh) | -20% | IBM / W3C |
| Korean (ko) | -10% | IBM / W3C |

## API

### `checkI18nOverflow(checks: I18nCheck[]): I18nResult[]`

Run overflow detection on an array of checks.

### `estimateExpansion(text: string, targetLocale: string): string`

Simulate text expansion for a locale (returns expanded/contracted string).

### `generateReport(results: I18nResult[], format: 'table' | 'json' | 'markdown'): string`

Format results for terminal, CI logs, or documentation.

## Output Formats

**Table** (default) -- terminal-friendly with pass/fail icons

**JSON** -- machine-readable, pipe to other tools

**Markdown** -- paste into PRs and docs

## CI Integration

```yaml
# GitHub Actions
- name: Check i18n overflow
  run: npx @shipitandpray/pretext-i18n --config i18n-checks.json --fail-on-overflow
```

## Why Build-Time?

- Catches overflow before code review
- No browser, no Selenium, no flaky visual tests
- Runs in < 1 second for hundreds of components
- Works with any framework (React, Vue, Svelte, vanilla)
- Estimated expansion when translations aren't ready yet

## License

MIT
