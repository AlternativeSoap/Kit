/**
 * Ranking checks for Kit search intelligence (Phase 1).
 * Run: npx tsx --tsconfig tsconfig.json scripts/check-search.ts
 */
import { dictionaries } from "../src/i18n/dictionaries";
import { extractConstraints } from "../src/lib/search/constraints";
import { searchTools, usageBoost } from "../src/lib/search";
import { isTypoOf } from "../src/lib/search/typo";

type Expectation =
  | { first: string }
  | { includes: string; before?: string }
  | { excludes: string }
  | { empty: true };

const cases: [locale: "en" | "da", query: string, expect: Expectation][] = [
  // Regressions: everyday short queries
  ["en", "moms", { first: "moms" }],
  ["en", "moms", { excludes: "google-maps" }],
  ["en", "moms", { excludes: "valutakurser" }],
  ["en", "vat", { first: "moms" }],
  ["da", "moms", { first: "moms" }],
  ["en", "password", { first: "password" }],
  ["da", "kodeord", { first: "password" }],
  ["en", "ai", { first: "chatgpt" }],
  ["en", "procent", { first: "procent" }],
  ["en", "dato", { first: "dato" }],
  ["en", "barsel", { first: "barsel" }],
  ["en", "borger", { first: "borgerdk" }],
  ["en", "25%", { includes: "moms" }],

  // Synonyms
  ["en", "omregn", { first: "enheder" }],
  ["da", "convert", { first: "enheder" }],
  ["en", "business days", { includes: "dato" }],

  // Typos
  ["en", "pasword", { first: "password" }],
  ["en", "passwrod", { first: "password" }],
  ["da", "kodeor", { first: "password" }],

  // Multi-requirement / constraints
  ["en", "free password without registration", { first: "password" }],
  ["da", "gratis kodeord uden tilmelding", { first: "password" }],
  ["en", "free encyclopedia without registration", { first: "wikipedia" }],
  ["en", "free image editor without registration", { first: "photopea" }],
  ["en", "free image editor without registration", { excludes: "chatgpt" }],
  ["en", "free image editor without registration", { excludes: "canva" }],
  ["en", "password without registration", { first: "password" }],
  ["en", "free without registration", { empty: true }],

  // Short-query noise control
  ["en", "ai", { excludes: "gmail" }],

  // Expanded catalog
  ["en", "pdf", { includes: "pdf24" }],
  ["en", "free pdf without registration", { first: "pdf24" }],
  ["en", "compress image", { first: "imgcompress" }],
  ["en", "facebook", { first: "facebook" }],
  ["en", "instagram", { first: "instagram" }],
  ["en", "tiktok", { first: "tiktok" }],
  ["en", "crop", { first: "crop" }],
  ["en", "regex", { first: "regex" }],
  ["en", "mortgage", { first: "mortgage" }],
  ["en", "remove background", { first: "removebg" }],
  ["da", "fjern baggrund", { first: "removebg" }],
  ["en", "qr code", { first: "qr" }],
  ["da", "vejr", { first: "dmi" }],
  ["en", "weather denmark", { includes: "dmi" }],
  ["en", "mitid", { first: "mitid" }],
  ["en", "have i been pwned", { first: "haveibeenpwned" }],
  ["en", "excalidraw", { first: "excalidraw" }],

  // Operators
  ["en", "@kit password", { first: "password" }],
  ["en", "@kit password", { excludes: "bitwarden" }],
  ["en", "@web pdf", { includes: "pdf24" }],
  ["en", "@web pdf", { excludes: "password" }],

  // Full library browse (exact + unambiguous prefixes while typing)
  ["en", "library", { includes: "password" }],
  ["en", "library", { includes: "chatgpt" }],
  ["en", "library", { includes: "moms" }],
  ["en", "lib", { includes: "password" }],
  ["en", "librar", { includes: "chatgpt" }],
  ["da", "bibliotek", { includes: "password" }],
  ["da", "bib", { includes: "moms" }],
  ["da", "bibl", { includes: "password" }],
  ["da", "katalog", { includes: "chatgpt" }],
  ["en", "all tools", { includes: "qr" }],
  ["en", "Bibliotek!", { includes: "password" }],
  // Archive stays reachable by its own names
  ["en", "archive", { first: "archive" }],
  ["en", "wayback", { first: "archive" }],

  // Outcome phrases
  ["en", "split pdf", { includes: "pdf24" }],
  ["en", "merge pdf", { includes: "pdf24" }],
  ["da", "opdel pdf", { includes: "pdf24" }],
  ["en", "compress pdf", { includes: "pdf24" }],
  ["en", "edit photo", { first: "photopea" }],
  ["da", "nettoløn", { includes: "lon" }],
];

let failed = 0;

for (const [locale, query, expect] of cases) {
  const hits = searchTools(query, dictionaries[locale]);
  const ids = hits.map((hit) => hit.tool.id);
  const label = `[${locale}] "${query}"`;

  if ("empty" in expect) {
    if (ids.length !== 0) {
      console.error(`FAIL ${label} expected empty, got ${ids.slice(0, 5).join(", ")}`);
      failed += 1;
    }
    continue;
  }

  if ("first" in expect) {
    if (ids[0] !== expect.first) {
      console.error(
        `FAIL ${label} expected first=${expect.first}, got ${ids.slice(0, 5).join(", ") || "(none)"}`,
      );
      failed += 1;
    }
    continue;
  }

  if ("includes" in expect) {
    const index = ids.indexOf(expect.includes);
    if (index === -1) {
      console.error(
        `FAIL ${label} expected includes ${expect.includes}, got ${ids.slice(0, 8).join(", ") || "(none)"}`,
      );
      failed += 1;
      continue;
    }
    if (expect.before) {
      const beforeIndex = ids.indexOf(expect.before);
      if (beforeIndex !== -1 && index > beforeIndex) {
        console.error(
          `FAIL ${label} expected ${expect.includes} before ${expect.before}`,
        );
        failed += 1;
      }
    }
    continue;
  }

  if ("excludes" in expect) {
    if (ids.includes(expect.excludes)) {
      console.error(`FAIL ${label} expected to exclude ${expect.excludes}`);
      failed += 1;
    }
  }
}

// Unit checks for helpers
const constraint = extractConstraints("free PDF editor without registration");
if (constraint.pricing !== "free" || constraint.registration !== "none") {
  console.error("FAIL constraint extract", constraint);
  failed += 1;
}
if (!isTypoOf("pasword", "password") || isTypoOf("ai", "mail")) {
  console.error("FAIL typo helper");
  failed += 1;
}

if (usageBoost("moms", { moms: 100 }) !== 10 || usageBoost("moms") !== 0) {
  console.error("FAIL usageBoost cap");
  failed += 1;
}

const boosted = searchTools("password", dictionaries.en, {
  usage: { bitwarden: 20 },
});
const plain = searchTools("password", dictionaries.en);
if (boosted[0]?.tool.id !== "password" || plain[0]?.tool.id !== "password") {
  console.error("FAIL usage must not override exact password match");
  failed += 1;
}

if (failed === 0) {
  console.log(`${cases.length} search cases passed`);
  process.exit(0);
}

console.error(`${failed} search checks failed`);
process.exit(1);
