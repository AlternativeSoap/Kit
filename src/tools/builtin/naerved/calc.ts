export type IncidentKind = "nearMiss" | "accident" | "unsafe";

export type IncidentReport = {
  kind: IncidentKind;
  when: string;
  where: string;
  what: string;
  area: string;
  potentialConsequence: "low" | "medium" | "high";
  recurrence: "low" | "medium" | "high";
  immediateAction: string;
  suggestedFix: string;
  reportedTo: string;
};

export const INCIDENT_KINDS = {
  da: {
    nearMiss: "Nærved-ulykke",
    accident: "Ulykke",
    unsafe: "Usikker situation",
  },
  en: {
    nearMiss: "Near miss",
    accident: "Accident",
    unsafe: "Unsafe situation",
  },
} as const;

export const LEVELS = {
  da: { low: "Lav", medium: "Mellem", high: "Høj" },
  en: { low: "Low", medium: "Medium", high: "High" },
} as const;

export function emptyReport(): IncidentReport {
  return {
    kind: "nearMiss",
    when: new Date().toISOString().slice(0, 16),
    where: "",
    what: "",
    area: "",
    potentialConsequence: "medium",
    recurrence: "medium",
    immediateAction: "",
    suggestedFix: "",
    reportedTo: "",
  };
}

export function priorityScore(report: IncidentReport): number {
  const map = { low: 1, medium: 2, high: 3 } as const;
  return map[report.potentialConsequence] * map[report.recurrence];
}

export function priorityLabel(score: number, da: boolean): string {
  if (score >= 6) return da ? "Skal tages op hurtigt" : "Raise this quickly";
  if (score >= 3) return da ? "Skal planlægges" : "Plan a follow-up";
  return da ? "Hold øje" : "Keep an eye on it";
}

export function reportToText(report: IncidentReport, da: boolean): string {
  const kinds = INCIDENT_KINDS[da ? "da" : "en"];
  const levels = LEVELS[da ? "da" : "en"];
  const score = priorityScore(report);
  const lines = [
    da ? "Rapport om nærved eller hændelse" : "Near miss or incident report",
    `${da ? "Type" : "Type"}: ${kinds[report.kind]}`,
    `${da ? "Hvornår" : "When"}: ${report.when || "—"}`,
    `${da ? "Hvor" : "Where"}: ${report.where || "—"}`,
    `${da ? "Område" : "Area"}: ${report.area || "—"}`,
    "",
    da ? "Hvad skete der?" : "What happened?",
    report.what.trim() || "—",
    "",
    da
      ? `Hvor slemt kunne det være blevet: ${levels[report.potentialConsequence]}`
      : `How bad could it have been: ${levels[report.potentialConsequence]}`,
    da
      ? `Kan det ske igen: ${levels[report.recurrence]}`
      : `Could it happen again: ${levels[report.recurrence]}`,
    da
      ? `Prioritet: ${priorityLabel(score, true)}`
      : `Priority: ${priorityLabel(score, false)}`,
    "",
    da ? "Hvad gjorde I med det samme:" : "What you did right away:",
    report.immediateAction.trim() || "—",
    "",
    da ? "Hvad bør ændres:" : "What should change:",
    report.suggestedFix.trim() || "—",
    "",
    da
      ? `Gives til: ${report.reportedTo || "—"}`
      : `Give to: ${report.reportedTo || "—"}`,
  ];
  return lines.join("\n");
}

export function isCompleteEnough(report: IncidentReport): boolean {
  return report.where.trim().length > 0 && report.what.trim().length > 10;
}
