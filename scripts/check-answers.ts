/**
 * Instant Answer phrasing checks (Phase 2).
 * Run: npx tsx --tsconfig tsconfig.json scripts/check-answers.ts
 */
import { parseAnswer } from "../src/lib/answers/parse";

const now = new Date(2026, 10, 14, 9, 30);

type Expect =
  | {
      kind:
        | "percent"
        | "vat"
        | "units"
        | "dateShift"
        | "salary"
        | "url"
        | "color"
        | "json"
        | "timestamp"
        | "uuid"
        | "email"
        | "mileage"
        | "fuel"
        | "loan"
        | "pregnancy"
        | "holidayPay"
        | "margin"
        | "jwt"
        | "cidr";
    }
  | { kind: "clockSpan"; durationMinutes: number }
  | { kind: "throughput"; taktSeconds: number }
  | { kind: "liveData"; topic: string }
  | { kind: "random"; min: number; max: number }
  | null;

const cases: [locale: "en" | "da", query: string, expect: Expect][] = [
  ["en", "25% of 4000", { kind: "percent" }],
  ["en", "1250 including VAT", { kind: "vat" }],
  ["en", "100 km to miles", { kind: "units" }],
  ["en", "45 days from today", { kind: "dateShift" }],
  ["en", "20 working days from today", { kind: "dateShift" }],
  ["en", "35000 gross to net", { kind: "salary" }],
  ["da", "35000 brutto til netto", { kind: "salary" }],
  ["en", "7:30 to 15:45", { kind: "clockSpan", durationMinutes: 495 }],
  ["da", "7.30 til 15.45", { kind: "clockSpan", durationMinutes: 495 }],
  ["en", "22:00 to 06:00", { kind: "clockSpan", durationMinutes: 480 }],
  ["en", "120 products in 8 hours", { kind: "throughput", taktSeconds: 240 }],
  ["da", "120 enheder på 8 timer", { kind: "throughput", taktSeconds: 240 }],
  ["en", "usd to dkk", { kind: "liveData", topic: "currency" }],
  ["en", "100 eur to dkk", { kind: "liveData", topic: "currency" }],
  ["en", "weather today", { kind: "liveData", topic: "weather" }],
  ["da", "vejr i dag", { kind: "liveData", topic: "weather" }],
  ["en", "random 50", { kind: "random", min: 1, max: 50 }],
  ["en", "random", { kind: "random", min: 1, max: 100 }],
  ["en", "pin 4", { kind: "random", min: 1000, max: 9999 }],
  ["en", "4 digit pin", { kind: "random", min: 1000, max: 9999 }],
  ["en", "15% off 200", { kind: "percent" }],
  ["da", "rabat 15% af 200", { kind: "percent" }],
  ["en", "netto for 35000", { kind: "salary" }],
  ["da", "35000 nettoløn", { kind: "salary" }],
  ["en", "valutakurser", null],
  ["en", "vejr", null],
  ["en", "dmi", null],
  ["en", "moms", null],
  ["en", "https://example.com", { kind: "url" }],
  ["en", "#6b705c", { kind: "color" }],
  ["en", "rgb(107,112,92)", { kind: "color" }],
  ["en", '{"name":"KIT"}', { kind: "json" }],
  ["en", "unix 1700000000", { kind: "timestamp" }],
  ["en", "1700000000", { kind: "timestamp" }],
  ["en", "550e8400-e29b-41d4-a716-446655440000", { kind: "uuid" }],
  ["en", "hello@example.com", { kind: "email" }],
  ["en", "json", null],
  ["en", "qr", null],
  ["en", "120 km * 3.79", { kind: "mileage" }],
  ["da", "kilometerpenge 120", { kind: "mileage" }],
  ["en", "120 km allowance", { kind: "mileage" }],
  ["en", "500 km 5.5 l/100km 14 kr", { kind: "fuel" }],
  ["en", "fuel 500 km 5.5l 14kr", { kind: "fuel" }],
  ["en", "loan 200000 3.5% 30y", { kind: "loan" }],
  ["da", "lån 200000 3,5% 30 år", { kind: "loan" }],
  ["en", "termin 2026-03-01", { kind: "pregnancy" }],
  ["da", "graviditet 2026-01-15", { kind: "pregnancy" }],
  ["en", "feriepenge 35000", { kind: "holidayPay" }],
  ["da", "feriepenge 35000 ved 12,5%", { kind: "holidayPay" }],
  ["en", "margin cost 80 sell 100", { kind: "margin" }],
  ["en", "avance 80 100", { kind: "margin" }],
  ["en", "markup 25% of 80", { kind: "margin" }],
  [
    "en",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
    { kind: "jwt" },
  ],
  ["en", "192.168.0.0/24", { kind: "cidr" }],
  ["en", "jwt", null],
  ["en", "cron", null],
];

let failed = 0;

for (const [locale, query, expect] of cases) {
  const spec = parseAnswer(query, locale, now);
  const label = `[${locale}] "${query}"`;

  if (expect === null) {
    if (spec !== null) {
      console.error(`FAIL ${label} expected null, got ${spec.kind}`);
      failed += 1;
    }
    continue;
  }

  if (!spec || spec.kind !== expect.kind) {
    console.error(
      `FAIL ${label} expected kind=${expect.kind}, got ${spec?.kind ?? "null"}`,
    );
    failed += 1;
    continue;
  }

  if (expect.kind === "clockSpan" && spec.kind === "clockSpan") {
    if (spec.durationMinutes !== expect.durationMinutes) {
      console.error(
        `FAIL ${label} expected ${expect.durationMinutes} min, got ${spec.durationMinutes}`,
      );
      failed += 1;
    }
  }

  if (expect.kind === "throughput" && spec.kind === "throughput") {
    if (Math.abs(spec.taktSeconds - expect.taktSeconds) > 0.01) {
      console.error(
        `FAIL ${label} expected takt ${expect.taktSeconds}, got ${spec.taktSeconds}`,
      );
      failed += 1;
    }
  }

  if (expect.kind === "liveData" && spec.kind === "liveData") {
    if (spec.topic !== expect.topic) {
      console.error(
        `FAIL ${label} expected topic ${expect.topic}, got ${spec.topic}`,
      );
      failed += 1;
    }
  }

  if (expect.kind === "random" && spec.kind === "random") {
    if (spec.min !== expect.min || spec.max !== expect.max) {
      console.error(
        `FAIL ${label} expected ${expect.min}-${expect.max}, got ${spec.min}-${spec.max}`,
      );
      failed += 1;
    }
  }
}

if (failed === 0) {
  console.log(`${cases.length} answer cases passed`);
  process.exit(0);
}

console.error(`${failed} answer checks failed`);
process.exit(1);
