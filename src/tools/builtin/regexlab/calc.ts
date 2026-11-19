export type FlagKey = "g" | "i" | "m" | "s" | "u" | "y";

export type MatchInfo = {
  index: number;
  text: string;
  groups: string[];
  /** Named groups when present */
  named: Record<string, string>;
};

export type RegexOk = {
  ok: true;
  matches: MatchInfo[];
  flags: string;
};

export type RegexErr = { ok: false; error: string };

export type RegexResult = RegexOk | RegexErr;

export function buildFlags(selected: Partial<Record<FlagKey, boolean>>): string {
  let flags = "";
  for (const key of ["g", "i", "m", "s", "u", "y"] as const) {
    if (selected[key]) flags += key;
  }
  return flags;
}

export function testRegex(pattern: string, flags: string, text: string): RegexResult {
  if (!pattern) return { ok: true, matches: [], flags };
  try {
    const re = new RegExp(pattern, flags);
    const matches: MatchInfo[] = [];
    if (flags.includes("g")) {
      let match: RegExpExecArray | null;
      let guard = 0;
      while ((match = re.exec(text)) !== null) {
        matches.push(toMatch(match));
        if (match[0] === "") re.lastIndex += 1;
        if (++guard > 10_000) break;
      }
    } else {
      const match = re.exec(text);
      if (match) matches.push(toMatch(match));
    }
    return { ok: true, matches, flags };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid regular expression",
    };
  }
}

function toMatch(match: RegExpExecArray): MatchInfo {
  const named: Record<string, string> = {};
  if (match.groups) {
    for (const [k, v] of Object.entries(match.groups)) {
      if (v != null) named[k] = v;
    }
  }
  return {
    index: match.index,
    text: match[0] ?? "",
    groups: match.slice(1).map((g) => g ?? ""),
    named,
  };
}

export type Seg = { text: string; hit: boolean; matchIndex?: number };

/** Split text into highlight segments; overlapping matches are skipped. */
export function highlightSegments(text: string, matches: MatchInfo[]): Seg[] {
  if (!matches.length) return [{ text, hit: false }];
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const parts: Seg[] = [];
  let cursor = 0;
  sorted.forEach((match, matchIndex) => {
    if (match.index < cursor) return;
    if (match.index > cursor) {
      parts.push({ text: text.slice(cursor, match.index), hit: false });
    }
    const end = match.index + match.text.length;
    parts.push({ text: text.slice(match.index, end), hit: true, matchIndex });
    cursor = end;
  });
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hit: false });
  return parts;
}

export type SuiteCase = {
  id: string;
  text: string;
  /** Expect at least one match */
  expectMatch: boolean;
};

export type SuiteResult = SuiteCase & {
  ok: boolean;
  matchCount: number;
  error?: string;
};

export function runSuite(
  pattern: string,
  flags: string,
  cases: SuiteCase[],
): SuiteResult[] {
  return cases.map((c) => {
    const r = testRegex(pattern, flags, c.text);
    if (!r.ok) {
      return { ...c, ok: false, matchCount: 0, error: r.error };
    }
    const has = r.matches.length > 0;
    return {
      ...c,
      ok: has === c.expectMatch,
      matchCount: r.matches.length,
    };
  });
}

/** Rough local explain: list token-ish chunks in the pattern. */
export function explainPattern(pattern: string): { token: string; noteDa: string; noteEn: string }[] {
  if (!pattern) return [];
  const notes: { token: string; noteDa: string; noteEn: string }[] = [];
  const push = (token: string, noteDa: string, noteEn: string) => {
    if (!notes.some((n) => n.token === token)) notes.push({ token, noteDa, noteEn });
  };

  if (pattern.includes("^")) push("^", "Start af streng/linje", "Start of string/line");
  if (pattern.includes("$")) push("$", "Slut af streng/linje", "End of string/line");
  if (pattern.includes(".")) push(".", "Ethvert tegn (undtagen linjeskift uden s)", "Any character (except newline without s)");
  if (pattern.includes("\\d")) push("\\d", "Ciffer 0-9", "Digit 0-9");
  if (pattern.includes("\\w")) push("\\w", "Ordtegn [A-Za-z0-9_]", "Word char [A-Za-z0-9_]");
  if (pattern.includes("\\s")) push("\\s", "Whitespace", "Whitespace");
  if (pattern.includes("\\b")) push("\\b", "Ordgrænse", "Word boundary");
  if (/\+/.test(pattern)) push("+", "Én eller flere", "One or more");
  if (/\*/.test(pattern)) push("*", "Nul eller flere", "Zero or more");
  if (/\?/.test(pattern) && !/\(\?/.test(pattern)) push("?", "Nul eller én / non-greedy", "Zero or one / non-greedy");
  if (/\[.*?\]/.test(pattern)) push("[…]", "Tegnklasse", "Character class");
  if (/\(.*?\)/.test(pattern)) push("()", "Fangstgruppe", "Capturing group");
  if (/\|/.test(pattern)) push("|", "Eller (alternation)", "Or (alternation)");
  if (/\{[\d,]+\}/.test(pattern)) push("{n,m}", "Gentagelsesantal", "Repetition count");

  return notes;
}

export const CHEATSHEET: { token: string; da: string; en: string }[] = [
  { token: ".", da: "Ethvert tegn", en: "Any character" },
  { token: "\\d", da: "Ciffer", en: "Digit" },
  { token: "\\w", da: "Ordtegn", en: "Word character" },
  { token: "\\s", da: "Whitespace", en: "Whitespace" },
  { token: "\\b", da: "Ordgrænse", en: "Word boundary" },
  { token: "^ $", da: "Start / slut", en: "Start / end" },
  { token: "* + ?", da: "0+ / 1+ / 0-1", en: "0+ / 1+ / 0-1" },
  { token: "{n,m}", da: "n til m gange", en: "n to m times" },
  { token: "[abc]", da: "Tegnklasse", en: "Character class" },
  { token: "[^abc]", da: "Negeret klasse", en: "Negated class" },
  { token: "(…)", da: "Gruppe", en: "Group" },
  { token: "(?:…)", da: "Ikke-fangende", en: "Non-capturing" },
  { token: "(?<n>…)", da: "Navngiven gruppe", en: "Named group" },
  { token: "a|b", da: "Alternation", en: "Alternation" },
];

let _id = 0;
export function suiteId(): string {
  _id += 1;
  return `case-${_id}`;
}
