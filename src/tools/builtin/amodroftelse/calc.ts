export type DiscussItem = {
  id: string;
  titleDa: string;
  titleEn: string;
  hintDa: string;
  hintEn: string;
  done: boolean;
  notes: string;
};

export type DiscussMeta = {
  date: string;
  participants: string;
  workplace: string;
};

export const DISCUSS_AGENDA: ReadonlyArray<
  Omit<DiscussItem, "done" | "notes">
> = [
  {
    id: "d1",
    titleDa: "Hvordan er arbejdsmiljøarbejdet gået det seneste år?",
    titleEn: "How has health and safety work gone over the past year?",
    hintDa: "Hvad lykkedes, og hvad haltede?",
    hintEn: "What worked, and what struggled?",
  },
  {
    id: "d2",
    titleDa: "Hvor står APV og handlingsplanerne?",
    titleEn: "Where do the APV and action plans stand?",
    hintDa: "Hvad er åbent, hvem har ansvaret, og hvilke frister er overskredet?",
    hintEn: "What is open, who owns it, and which deadlines are overdue?",
  },
  {
    id: "d3",
    titleDa: "Ulykker og nærved-ulykker",
    titleEn: "Accidents and near misses",
    hintDa: "Hvad siger tallene, og hvad fortæller kollegerne?",
    hintEn: "What do the numbers say, and what do colleagues report?",
  },
  {
    id: "d4",
    titleDa: "Kroppen i arbejdet: løft, stillinger, støj og truck",
    titleEn: "The body at work: lifting, postures, noise, and forklifts",
    hintDa: "Hvor slides folk mest i hverdagen?",
    hintEn: "Where do people strain most in daily work?",
  },
  {
    id: "d5",
    titleDa: "Psykisk arbejdsmiljø",
    titleEn: "Mental working environment",
    hintDa: "Tidspres, kommunikation, konflikter og indflydelse.",
    hintEn: "Time pressure, communication, conflicts, and influence.",
  },
  {
    id: "d6",
    titleDa: "Kemikalier og værnemidler",
    titleEn: "Chemicals and protective equipment",
    hintDa: "Er datablade, opbevaring og brug i orden?",
    hintEn: "Are data sheets, storage, and use in order?",
  },
  {
    id: "d7",
    titleDa: "Virker AMO i praksis?",
    titleEn: "Does the health and safety organisation work in practice?",
    hintDa: "Møder, tid til hvervet, uddannelse og klare roller.",
    hintEn: "Meetings, time for the role, training, and clear roles.",
  },
  {
    id: "d8",
    titleDa: "Hvad prioriterer I næste år?",
    titleEn: "What do you prioritise next year?",
    hintDa: "Sæt få, konkrete mål med ansvar og opfølgning.",
    hintEn: "Set a few concrete goals with owners and follow-up.",
  },
];

export function buildAgenda(): DiscussItem[] {
  return DISCUSS_AGENDA.map((a) => ({
    ...a,
    done: false,
    notes: "",
  }));
}

export function discussStats(items: DiscussItem[]) {
  const done = items.filter((i) => i.done).length;
  const withNotes = items.filter((i) => i.notes.trim()).length;
  return { done, total: items.length, withNotes };
}

export function discussToText(
  meta: DiscussMeta,
  items: DiscussItem[],
  da: boolean,
): string {
  const stats = discussStats(items);
  const lines = [
    da ? "Årlig arbejdsmiljødrøftelse" : "Annual health and safety discussion",
    `${da ? "Dato" : "Date"}: ${meta.date || "—"}`,
    `${da ? "Arbejdssted" : "Workplace"}: ${meta.workplace || "—"}`,
    `${da ? "Deltagere" : "Participants"}: ${meta.participants || "—"}`,
    da
      ? `Gennemgået: ${stats.done}/${stats.total}`
      : `Covered: ${stats.done}/${stats.total}`,
    "",
  ];
  for (const item of items) {
    const title = da ? item.titleDa : item.titleEn;
    lines.push(`${item.done ? "[x]" : "[ ]"} ${title}`);
    if (item.notes.trim()) lines.push(`  ${item.notes.trim()}`);
  }
  return lines.join("\n");
}
