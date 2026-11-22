export type Criterion = {
  id: string;
  name: string;
  weight: number;
};

export type Option = {
  id: string;
  name: string;
  /** Scores keyed by criterion id, expected 1–10. */
  scores: Record<string, number>;
};

export type DecisionScore = {
  optionId: string;
  total: number;
  /** Contribution per criterion after weight normalization. */
  parts: Record<string, number>;
};

export type DecisionResult = {
  scores: DecisionScore[];
  winnerId: string | null;
  weightSum: number;
};

export const MAX_CRITERIA = 8;
export const MAX_OPTIONS = 8;
export const MIN_CRITERIA = 1;
export const MIN_OPTIONS = 2;

export function normalizeWeights(
  criteria: readonly Criterion[],
): Record<string, number> {
  const sum = criteria.reduce(
    (acc, c) => acc + (Number.isFinite(c.weight) && c.weight > 0 ? c.weight : 0),
    0,
  );
  const out: Record<string, number> = {};
  if (sum <= 0) {
    for (const c of criteria) out[c.id] = 0;
    return out;
  }
  for (const c of criteria) {
    const w = Number.isFinite(c.weight) && c.weight > 0 ? c.weight : 0;
    out[c.id] = (w / sum) * 100;
  }
  return out;
}

function clampScore(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  if (value < 1 || value > 10) return null;
  return value;
}

export function scoreDecision(
  criteria: readonly Criterion[],
  options: readonly Option[],
): DecisionResult | null {
  if (criteria.length < MIN_CRITERIA || options.length < MIN_OPTIONS) {
    return null;
  }

  const weights = normalizeWeights(criteria);
  const weightSum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (weightSum <= 0) return null;

  const scores: DecisionScore[] = [];
  for (const option of options) {
    const parts: Record<string, number> = {};
    let total = 0;
    let complete = true;
    for (const criterion of criteria) {
      const raw = option.scores[criterion.id];
      const score = clampScore(raw);
      if (score === null) {
        complete = false;
        break;
      }
      const part = (score * (weights[criterion.id] ?? 0)) / 100;
      parts[criterion.id] = part;
      total += part;
    }
    if (!complete) return null;
    scores.push({ optionId: option.id, total, parts });
  }

  if (scores.length === 0) return null;
  const winner = scores.reduce((a, b) => (b.total > a.total ? b : a));
  return { scores, winnerId: winner.optionId, weightSum };
}
