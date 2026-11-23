export type ApvStep = 1 | 2 | 3 | 4 | 5;

export type ApvFinding = {
  id: string;
  description: string;
  area: string;
  severity: "low" | "medium" | "high";
};

export type ApvAction = {
  id: string;
  findingId: string;
  action: string;
  owner: string;
  deadline: string;
  status: "open" | "doing" | "done";
  followUp: string;
};

export type ApvDocument = {
  workplace: string;
  revisedAt: string;
  nextReview: string;
  mappingNotes: string;
  findings: ApvFinding[];
  actions: ApvAction[];
};

export const APV_STEPS = {
  da: [
    "Find forholdene",
    "Find problemer",
    "Vurder dem",
    "Lav en plan",
    "Tjek op",
  ],
  en: [
    "Map the work",
    "Find problems",
    "Judge them",
    "Make a plan",
    "Follow up",
  ],
} as const;

export const APV_STEP_HELP = {
  da: [
    "Beskriv kort hvor I arbejder, og hvad der typisk belaster kroppen, tempoet eller sikkerheden.",
    "Skriv de konkrete problemer, I ser eller hører fra kolleger.",
    "Marker hvor alvorligt hvert problem er. Start med de værste.",
    "Skriv hvad der skal gøres, hvem der gør det, og hvornår.",
    "Se om planen bliver fulgt, og om løsningerne faktisk hjælper.",
  ],
  en: [
    "Briefly describe where people work, and what usually strains the body, the pace, or safety.",
    "Write the concrete problems you see or hear from colleagues.",
    "Mark how serious each problem is. Start with the worst ones.",
    "Write what will be done, who will do it, and by when.",
    "Check whether the plan is followed, and whether the fixes actually help.",
  ],
} as const;

export const APV_AREAS = {
  da: ["Fysisk", "Sikkerhed", "Psykisk", "Kemisk", "Løft og ergonomi", "Andet"],
  en: ["Physical", "Safety", "Mental", "Chemical", "Lifting and ergonomics", "Other"],
} as const;

export function emptyApv(da: boolean): ApvDocument {
  const today = new Date().toISOString().slice(0, 10);
  const next = new Date();
  next.setFullYear(next.getFullYear() + 3);
  return {
    workplace: "",
    revisedAt: today,
    nextReview: next.toISOString().slice(0, 10),
    mappingNotes: da
      ? "Eksempel: Lager og terminal. Tunge løft af gods, truckkørsel, omlæsning og tidspres i spidsbelastning."
      : "Example: Warehouse and terminal. Heavy lifting, forklift work, reloading, and time pressure at peaks.",
    findings: [],
    actions: [],
  };
}

export function exampleFinding(da: boolean): ApvFinding {
  return {
    id: `f-example-${Date.now()}`,
    description: da
      ? "Tunge og uhåndterlige emner løftes fra lave paller uden hjælpemidler."
      : "Heavy and awkward items are lifted from low pallets without aids.",
    area: da ? "Løft og ergonomi" : "Lifting and ergonomics",
    severity: "high",
  };
}

export function severityLabel(
  s: ApvFinding["severity"],
  da: boolean,
): string {
  if (da) {
    if (s === "high") return "Alvorligt";
    if (s === "medium") return "Mærkbart";
    return "Mindre";
  }
  if (s === "high") return "Serious";
  if (s === "medium") return "Noticeable";
  return "Minor";
}

export function statusLabel(s: ApvAction["status"], da: boolean): string {
  if (da) {
    if (s === "done") return "Færdig";
    if (s === "doing") return "I gang";
    return "Ikke startet";
  }
  if (s === "done") return "Done";
  if (s === "doing") return "In progress";
  return "Not started";
}

export function apvStats(doc: ApvDocument) {
  const open = doc.actions.filter((a) => a.status !== "done").length;
  const done = doc.actions.filter((a) => a.status === "done").length;
  const high = doc.findings.filter((f) => f.severity === "high").length;
  const missingOwner = doc.actions.filter(
    (a) => a.status !== "done" && !a.owner.trim(),
  ).length;
  const missingDeadline = doc.actions.filter(
    (a) => a.status !== "done" && !a.deadline.trim(),
  ).length;
  return {
    findings: doc.findings.length,
    actions: doc.actions.length,
    open,
    done,
    high,
    missingOwner,
    missingDeadline,
  };
}

export function apvToText(doc: ApvDocument, da: boolean): string {
  const stats = apvStats(doc);
  const lines: string[] = [
    da ? "Arbejdspladsvurdering (APV)" : "Workplace assessment (APV)",
    da
      ? `Arbejdssted: ${doc.workplace || "Ikke angivet"}`
      : `Workplace: ${doc.workplace || "Not set"}`,
    da
      ? `Opdateret: ${doc.revisedAt || "—"} | Næste gennemgang: ${doc.nextReview || "—"}`
      : `Updated: ${doc.revisedAt || "—"} | Next review: ${doc.nextReview || "—"}`,
    "",
    da ? "1. Find forholdene" : "1. Map the work",
    doc.mappingNotes.trim() || "—",
    "",
    da
      ? `2–3. Problemer (${stats.findings})`
      : `2–3. Problems (${stats.findings})`,
  ];

  if (!doc.findings.length) {
    lines.push(da ? "Ingen problemer er skrevet endnu." : "No problems written yet.");
  } else {
    for (const f of doc.findings) {
      lines.push(
        `- [${severityLabel(f.severity, da)}] ${f.area}: ${f.description}`,
      );
    }
  }

  lines.push("");
  lines.push(
    da
      ? `4. Plan (${stats.actions}, ${stats.open} ikke færdige)`
      : `4. Plan (${stats.actions}, ${stats.open} not done)`,
  );

  if (!doc.actions.length) {
    lines.push(da ? "Ingen handlinger endnu." : "No actions yet.");
  } else {
    for (const a of doc.actions) {
      const finding = doc.findings.find((f) => f.id === a.findingId);
      lines.push(
        `- [${statusLabel(a.status, da)}] ${a.action}` +
          (finding ? ` (${finding.description.slice(0, 40)})` : ""),
      );
      lines.push(
        da
          ? `  Ansvarlig: ${a.owner || "Mangler"} | Frist: ${a.deadline || "Mangler"}`
          : `  Owner: ${a.owner || "Missing"} | Deadline: ${a.deadline || "Missing"}`,
      );
      if (a.followUp.trim()) {
        lines.push(
          da
            ? `  Opfølgning: ${a.followUp.trim()}`
            : `  Follow-up: ${a.followUp.trim()}`,
        );
      }
    }
  }

  lines.push("");
  lines.push(da ? "5. Tjek op" : "5. Follow up");
  lines.push(
    da
      ? `Færdige: ${stats.done}. Mangler ansvarlig: ${stats.missingOwner}. Mangler frist: ${stats.missingDeadline}.`
      : `Done: ${stats.done}. Missing owner: ${stats.missingOwner}. Missing deadline: ${stats.missingDeadline}.`,
  );

  return lines.join("\n");
}

export function isApvDocument(value: unknown): value is ApvDocument {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.workplace === "string" &&
    typeof v.mappingNotes === "string" &&
    Array.isArray(v.findings) &&
    Array.isArray(v.actions)
  );
}
