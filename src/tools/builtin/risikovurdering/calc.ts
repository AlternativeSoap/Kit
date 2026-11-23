export type Likelihood = 1 | 2 | 3 | 4 | 5;
export type Consequence = 1 | 2 | 3 | 4 | 5;

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskItemInput = {
  id: string;
  title: string;
  area: string;
  likelihood: Likelihood;
  consequence: Consequence;
  notes: string;
  mitigation: string;
};

export type RiskItemResult = RiskItemInput & {
  score: number;
  level: RiskLevel;
};

export const LIKELIHOOD_LABELS = {
  da: [
    "Næsten aldrig",
    "Sjældent",
    "Kan ske",
    "Sker ofte",
    "Sker meget ofte",
  ],
  en: [
    "Almost never",
    "Rarely",
    "Possible",
    "Often",
    "Very often",
  ],
} as const;

export const CONSEQUENCE_LABELS = {
  da: [
    "Lille gene",
    "Mindre skade",
    "Mærkbar skade",
    "Alvorlig skade",
    "Meget alvorlig skade",
  ],
  en: [
    "Minor nuisance",
    "Minor harm",
    "Noticeable harm",
    "Serious harm",
    "Very serious harm",
  ],
} as const;

export const AREA_OPTIONS = {
  da: [
    "Fysisk",
    "Sikkerhed",
    "Psykisk",
    "Kemisk",
    "Løft og ergonomi",
    "Andet",
  ],
  en: [
    "Physical",
    "Safety",
    "Mental",
    "Chemical",
    "Lifting and ergonomics",
    "Other",
  ],
} as const;

export function riskScore(
  likelihood: Likelihood,
  consequence: Consequence,
): number {
  return likelihood * consequence;
}

export function riskLevel(score: number): RiskLevel {
  if (score >= 20) return "critical";
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
}

export function assessRisks(items: RiskItemInput[]): RiskItemResult[] {
  return items
    .filter((i) => i.title.trim().length > 0)
    .map((i) => {
      const score = riskScore(i.likelihood, i.consequence);
      return { ...i, score, level: riskLevel(score) };
    })
    .sort((a, b) => b.score - a.score);
}

export function levelLabel(level: RiskLevel, da: boolean): string {
  if (da) {
    if (level === "critical") return "Meget høj risiko";
    if (level === "high") return "Høj risiko";
    if (level === "medium") return "Mellem risiko";
    return "Lav risiko";
  }
  if (level === "critical") return "Very high risk";
  if (level === "high") return "High risk";
  if (level === "medium") return "Medium risk";
  return "Low risk";
}

export function levelHint(level: RiskLevel, da: boolean): string {
  if (da) {
    if (level === "critical")
      return "Stop eller begræns arbejdet, indtil I har en sikker løsning.";
    if (level === "high")
      return "Lav en plan med det samme. Sæt en ansvarlig og en frist.";
    if (level === "medium")
      return "Planlæg en forbedring, og følg op inden for en rimelig tid.";
    return "Hold øje, og gør det bedre når I kan.";
  }
  if (level === "critical")
    return "Stop or limit the work until you have a safe solution.";
  if (level === "high")
    return "Make a plan straight away. Set an owner and a deadline.";
  if (level === "medium")
    return "Plan an improvement and follow up within a reasonable time.";
  return "Keep an eye on it, and improve it when you can.";
}

export function risksToText(items: RiskItemResult[], da: boolean): string {
  if (!items.length) {
    return da
      ? "Ingen risici er udfyldt endnu."
      : "No risks have been filled in yet.";
  }
  return items
    .map((r, i) => {
      const lines = [
        `${i + 1}. ${r.title}`,
        da
          ? `Område: ${r.area || "—"} | Hvor sandsynligt: ${r.likelihood} | Hvor slemt: ${r.consequence} | Score: ${r.score} (${levelLabel(r.level, true)})`
          : `Area: ${r.area || "—"} | How likely: ${r.likelihood} | How bad: ${r.consequence} | Score: ${r.score} (${levelLabel(r.level, false)})`,
      ];
      if (r.notes.trim()) {
        lines.push(
          da ? `Hvad sker der: ${r.notes.trim()}` : `What happens: ${r.notes.trim()}`,
        );
      }
      if (r.mitigation.trim()) {
        lines.push(
          da
            ? `Sådan gør I det sikrere: ${r.mitigation.trim()}`
            : `How to make it safer: ${r.mitigation.trim()}`,
        );
      }
      lines.push(levelHint(r.level, da));
      return lines.join("\n");
    })
    .join("\n\n");
}

export function matrixCell(l: Likelihood, c: Consequence): RiskLevel {
  return riskLevel(riskScore(l, c));
}
