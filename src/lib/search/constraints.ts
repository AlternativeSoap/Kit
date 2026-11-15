import type {
  ToolPricing,
  ToolPrivacy,
  ToolRegistration,
} from "@/tools/types";
import { normalize, tokenize } from "./normalize";

export type SearchConstraints = {
  /** Prefer tools with this pricing. */
  pricing?: ToolPricing;
  /** Prefer tools that need no account. */
  registration?: ToolRegistration;
  /** Prefer local or privacy-focused tools. */
  privacy?: ToolPrivacy;
  /** Prefer open-source tools (matched via tags). */
  openSource?: boolean;
  /** Soft topic tags inferred from the query. */
  tags: string[];
  /** Query text with constraint filler words removed. */
  remainder: string;
};

const FREE_WORDS = new Set(["free", "gratis", "costless"].map(normalize));
const OPEN_SOURCE_WORDS = new Set(
  ["opensource", "foss", "oss"].map(normalize),
);

const NEGATION = new Set(
  ["without", "uden", "no", "not", "ikke", "minus"].map(normalize),
);

const REGISTRATION_WORDS = new Set(
  [
    "registration",
    "register",
    "signup",
    "sign-up",
    "signin",
    "sign-in",
    "login",
    "log-in",
    "account",
    "accounts",
    "tilmelding",
    "oprettelse",
    "konto",
    "login",
  ].map(normalize),
);

const PRIVACY_WORDS = new Set(
  ["privacy", "private", "privatliv", "privat", "local", "lokalt"].map(
    normalize,
  ),
);

const TAG_HINTS: { words: string[]; tag: string }[] = [
  { words: ["pdf"], tag: "pdf" },
  { words: ["image", "images", "photo", "photos", "billede", "billeder"], tag: "image" },
  {
    words: [
      "background",
      "baggrund",
      "remover",
      "baggrundsfjerner",
      "background-removal",
    ],
    tag: "background-removal",
  },
  { words: ["compress", "komprimer", "optimize", "optimer"], tag: "compress" },
  {
    words: ["merge", "sammenføj", "sammenfoj", "combine", "join"],
    tag: "merge",
  },
  { words: ["split", "opdel", "divide"], tag: "split" },
  { words: ["password", "kodeord", "adgangskode"], tag: "password" },
  { words: ["vat", "moms", "mva"], tag: "tax" },
  {
    words: ["salary", "lon", "pay", "wage", "nettoløn", "nettolon", "netto"],
    tag: "salary",
  },
  { words: ["translate", "translation", "oversæt"], tag: "translate" },
  { words: ["ai", "chatbot", "llm"], tag: "ai" },
  { words: ["encyclopedia", "wiki", "leksikon"], tag: "encyclopedia" },
  { words: ["qr", "qrcode"], tag: "qr" },
  { words: ["weather", "vejr", "vejrudsigt", "forecast"], tag: "weather" },
  { words: ["job", "jobs", "career"], tag: "jobs" },
  { words: ["meeting", "møde", "zoom", "meet"], tag: "meeting" },
  { words: ["color", "colors", "farve", "palette"], tag: "color" },
  { words: ["json", "regex"], tag: "code" },
  { words: ["parcel", "pakke", "track"], tag: "shipping" },
  { words: ["discount", "rabat", "markup"], tag: "percent" },
];

/**
 * Pull pricing, registration, privacy and topic hints out of a natural query.
 * Operators like @kit are handled elsewhere; this only reads plain language.
 */
export function extractConstraints(query: string): SearchConstraints {
  const tokens = tokenize(query);
  const drop = new Set<number>();
  const tags = new Set<string>();
  let pricing: ToolPricing | undefined;
  let registration: ToolRegistration | undefined;
  let privacy: ToolPrivacy | undefined;
  let openSource = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    const glued = token.replace(/-/g, "");

    if (FREE_WORDS.has(token)) {
      pricing = "free";
      drop.add(i);
      continue;
    }

    if (
      OPEN_SOURCE_WORDS.has(glued) ||
      (token === "open" && tokens[i + 1] === "source")
    ) {
      openSource = true;
      drop.add(i);
      if (token === "open" && tokens[i + 1] === "source") drop.add(i + 1);
      continue;
    }

    if (PRIVACY_WORDS.has(token)) {
      privacy = token === "local" || token === "lokalt" ? "local" : "privacy-focused";
      drop.add(i);
      continue;
    }

    if (NEGATION.has(token) && i + 1 < tokens.length) {
      const next = tokens[i + 1]!;
      if (REGISTRATION_WORDS.has(next) || REGISTRATION_WORDS.has(next.replace(/-/g, ""))) {
        registration = "none";
        drop.add(i);
        drop.add(i + 1);
        continue;
      }
    }

    // "no registration" / "uden tilmelding" already handled; also "no-login".
    if (token === "no-login" || token === "nologin" || glued === "nologin") {
      registration = "none";
      drop.add(i);
    }
  }

  for (const hint of TAG_HINTS) {
    if (hint.words.some((word) => tokens.includes(normalize(word)))) {
      tags.add(hint.tag);
    }
  }

  // Multi-word open source already dropped; rebuild remainder from kept tokens.
  // Empty remainder is intentional when the query is only constraints
  // ("free without registration").
  const remainderTokens = tokens.filter((_, index) => !drop.has(index));

  return {
    pricing,
    registration,
    privacy,
    openSource: openSource || undefined,
    tags: Array.from(tags),
    remainder: remainderTokens.join(" ").trim(),
  };
}
