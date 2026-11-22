export type TeamMode = "teams" | "size";

export type TeamSplitResult = {
  teams: string[][];
  leftoverNote?: "balanced";
};

/** Names, one per line. Duplicates ignored case-insensitively. */
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

function shuffleInPlace<T>(arr: T[], random: () => number): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

/**
 * Split names into teams. Leftovers are spread so team sizes differ by at most one.
 * `count` is number of teams (mode "teams") or people per team (mode "size").
 */
export function splitTeams(
  names: readonly string[],
  mode: TeamMode,
  count: number,
  random: () => number = Math.random,
): TeamSplitResult | null {
  if (names.length === 0) return null;
  if (!Number.isInteger(count) || count < 1) return null;

  let teamCount: number;
  if (mode === "teams") {
    teamCount = Math.min(count, names.length);
  } else {
    // team size: number of teams = ceil(n / size), leftover balanced across teams
    teamCount = Math.ceil(names.length / count);
    teamCount = Math.max(1, Math.min(teamCount, names.length));
  }

  const pool = [...names];
  shuffleInPlace(pool, random);

  const teams: string[][] = Array.from({ length: teamCount }, () => []);
  for (let i = 0; i < pool.length; i += 1) {
    teams[i % teamCount]!.push(pool[i]!);
  }

  return { teams, leftoverNote: "balanced" };
}

export function formatTeams(
  teams: readonly string[][],
  teamLabel: (index: number) => string,
): string {
  return teams
    .map((members, i) => `${teamLabel(i)}\n${members.join("\n")}`)
    .join("\n\n");
}
