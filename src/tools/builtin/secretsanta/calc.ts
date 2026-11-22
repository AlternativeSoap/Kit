export type Exclusion = { giver: string; receiver: string };

export type SantaAssignment = { giver: string; receiver: string };

export type SantaResult = {
  assignments: SantaAssignment[];
  error?: string;
};

const EXCLUSION_SEP = /(?:\s*>\s*|\s*→\s*|\s*->\s*)/;

/** Names, one per line. Blank lines ignored. Duplicates kept as distinct only if spelling differs after trim. */
export function parseNames(raw: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const name = line.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

/** Lines like "A>B" meaning A cannot draw B. Names matched case-insensitively against the list. */
export function parseExclusions(
  raw: string,
  names: readonly string[],
): Exclusion[] {
  const byKey = new Map(names.map((n) => [n.toLowerCase(), n]));
  const out: Exclusion[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(EXCLUSION_SEP);
    if (parts.length !== 2) continue;
    const giver = byKey.get(parts[0]!.trim().toLowerCase());
    const receiver = byKey.get(parts[1]!.trim().toLowerCase());
    if (!giver || !receiver || giver === receiver) continue;
    out.push({ giver, receiver });
  }
  return out;
}

function isValidDerangement(
  order: readonly string[],
  receivers: readonly string[],
  blocked: ReadonlySet<string>,
): boolean {
  for (let i = 0; i < order.length; i += 1) {
    const giver = order[i]!;
    const receiver = receivers[i]!;
    if (giver === receiver) return false;
    if (blocked.has(`${giver}\0${receiver}`)) return false;
  }
  return true;
}

function shuffleInPlace<T>(arr: T[], random: () => number): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

/**
 * Uniform random derangement among permutations that respect exclusions.
 * Rejection sampling is fair for typical party sizes.
 */
export function drawSecretSanta(
  names: readonly string[],
  exclusions: readonly Exclusion[] = [],
  random: () => number = Math.random,
  maxAttempts = 10_000,
): SantaResult {
  if (names.length < 2) {
    return {
      assignments: [],
      error: "need_two",
    };
  }

  const blocked = new Set(
    exclusions.map((e) => `${e.giver}\0${e.receiver}`),
  );

  const order = [...names];
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const receivers = [...names];
    shuffleInPlace(receivers, random);
    if (!isValidDerangement(order, receivers, blocked)) continue;
    return {
      assignments: order.map((giver, i) => ({
        giver,
        receiver: receivers[i]!,
      })),
    };
  }

  return { assignments: [], error: "impossible" };
}

export function formatAssignments(
  assignments: readonly SantaAssignment[],
  arrow = "→",
): string {
  return assignments.map((a) => `${a.giver} ${arrow} ${a.receiver}`).join("\n");
}
