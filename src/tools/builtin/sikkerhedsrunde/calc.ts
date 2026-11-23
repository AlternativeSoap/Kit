export type CheckStatus = "ok" | "issue" | "na" | "unset";

export type CheckItem = {
  id: string;
  textDa: string;
  textEn: string;
  status: CheckStatus;
  note: string;
};

export type RoundTemplateId =
  | "lager"
  | "truck"
  | "fysisk"
  | "psykisk"
  | "kemisk";

export type RoundTemplate = {
  id: RoundTemplateId;
  titleDa: string;
  titleEn: string;
  items: Array<{ id: string; textDa: string; textEn: string }>;
};

export const ROUND_TEMPLATES: readonly RoundTemplate[] = [
  {
    id: "lager",
    titleDa: "Lager / terminal",
    titleEn: "Warehouse / terminal",
    items: [
      {
        id: "l1",
        textDa: "Er gange og udgange fri for gods og affald?",
        textEn: "Are aisles and exits clear of goods and waste?",
      },
      {
        id: "l2",
        textDa: "Står paller stabilt og inden for mærkningen?",
        textEn: "Are pallets stacked stably and inside markings?",
      },
      {
        id: "l3",
        textDa: "Er der afspærring ved lastning og losning?",
        textEn: "Are barriers in place during loading and unloading?",
      },
      {
        id: "l4",
        textDa: "Er lyset godt nok til arbejdet?",
        textEn: "Is the lighting good enough for the work?",
      },
      {
        id: "l5",
        textDa: "Er gulvene tørre og uden snublefare?",
        textEn: "Are floors dry and free of trip hazards?",
      },
      {
        id: "l6",
        textDa: "Bruges værnemidler dér, hvor det kræves?",
        textEn: "Is protective equipment used where required?",
      },
      {
        id: "l7",
        textDa: "Er gods sikret, så det ikke kan falde ned?",
        textEn: "Is goods secured so it cannot fall?",
      },
      {
        id: "l8",
        textDa: "Kan man hurtigt finde førstehjælp og brandudstyr?",
        textEn: "Can people quickly find first aid and fire equipment?",
      },
    ],
  },
  {
    id: "truck",
    titleDa: "Truck / intern transport",
    titleEn: "Forklift / internal transport",
    items: [
      {
        id: "t1",
        textDa: "Kører kun personer med gyldigt certifikat?",
        textEn: "Do only certified people drive?",
      },
      {
        id: "t2",
        textDa: "Er dagens tjek lavet (bremser, horn, lys, gafler)?",
        textEn: "Has today's check been done (brakes, horn, lights, forks)?",
      },
      {
        id: "t3",
        textDa: "Er fodgængere og truck tydeligt adskilt eller markeret?",
        textEn: "Are pedestrians and forklifts clearly separated or marked?",
      },
      {
        id: "t4",
        textDa: "Køres der i en hastighed der passer til området?",
        textEn: "Is the speed suited to the area?",
      },
      {
        id: "t5",
        textDa: "Er lasten sikret under kørsel?",
        textEn: "Is the load secured while moving?",
      },
      {
        id: "t6",
        textDa: "Er opladning eller brændstof håndteret forsvarligt?",
        textEn: "Is charging or fuel handled safely?",
      },
      {
        id: "t7",
        textDa: "Er udsyn og spejle frie?",
        textEn: "Are visibility and mirrors clear?",
      },
    ],
  },
  {
    id: "fysisk",
    titleDa: "Fysisk / ergonomi",
    titleEn: "Physical / ergonomics",
    items: [
      {
        id: "f1",
        textDa: "Undgås tunge løft, eller bruges hjælpemidler?",
        textEn: "Are heavy lifts avoided, or are aids used?",
      },
      {
        id: "f2",
        textDa: "Kan folk skifte arbejdsstilling undervejs?",
        textEn: "Can people change posture during the work?",
      },
      {
        id: "f3",
        textDa: "Er rækkeafstand og løftehøjde rimelige?",
        textEn: "Are reach and lift height reasonable?",
      },
      {
        id: "f4",
        textDa: "Er støjen til at holde ud, eller er den dæmpet?",
        textEn: "Is noise manageable, or has it been reduced?",
      },
      {
        id: "f5",
        textDa: "Er temperatur og træk til at arbejde i?",
        textEn: "Are temperature and draughts workable?",
      },
      {
        id: "f6",
        textDa: "Bruges pauser og opgaverotation ved tungt arbejde?",
        textEn: "Are breaks and task rotation used for heavy work?",
      },
    ],
  },
  {
    id: "psykisk",
    titleDa: "Psykisk arbejdsmiljø",
    titleEn: "Psychosocial working environment",
    items: [
      {
        id: "p1",
        textDa: "Er opgaver og forventninger klare?",
        textEn: "Are tasks and expectations clear?",
      },
      {
        id: "p2",
        textDa: "Kan tidspres tages op uden problemer?",
        textEn: "Can time pressure be raised without trouble?",
      },
      {
        id: "p3",
        textDa: "Kan konflikter meldes og håndteres?",
        textEn: "Can conflicts be reported and handled?",
      },
      {
        id: "p4",
        textDa: "Har folk indflydelse på eget arbejde?",
        textEn: "Do people have influence on their own work?",
      },
      {
        id: "p5",
        textDa: "Når vigtig information ud i tide?",
        textEn: "Does important information arrive in time?",
      },
      {
        id: "p6",
        textDa: "Er der respekt og støtte mellem kolleger?",
        textEn: "Is there respect and support between colleagues?",
      },
    ],
  },
  {
    id: "kemisk",
    titleDa: "Kemisk arbejdsmiljø",
    titleEn: "Chemical working environment",
    items: [
      {
        id: "k1",
        textDa: "Er kemikalier mærket og opbevaret sikkert?",
        textEn: "Are chemicals labelled and stored safely?",
      },
      {
        id: "k2",
        textDa: "Kan man finde sikkerhedsdatabladet dér, hvor stoffet bruges?",
        textEn: "Can people find the safety data sheet where the substance is used?",
      },
      {
        id: "k3",
        textDa: "Passer handsker og andre værnemidler til stoffet?",
        textEn: "Do gloves and other protection match the substance?",
      },
      {
        id: "k4",
        textDa: "Ved I hvad I gør ved spild?",
        textEn: "Do you know what to do if something spills?",
      },
      {
        id: "k5",
        textDa: "Virker udsugning eller ventilation, hvor det skal?",
        textEn: "Does extraction or ventilation work where it should?",
      },
      {
        id: "k6",
        textDa: "Er hudkontakt og indånding begrænset så meget som muligt?",
        textEn: "Are skin contact and inhalation limited as much as possible?",
      },
    ],
  },
];

export function buildItems(templateId: RoundTemplateId): CheckItem[] {
  const tpl = ROUND_TEMPLATES.find((t) => t.id === templateId)!;
  return tpl.items.map((i) => ({
    id: i.id,
    textDa: i.textDa,
    textEn: i.textEn,
    status: "unset" as const,
    note: "",
  }));
}

export function roundStats(items: CheckItem[]) {
  const ok = items.filter((i) => i.status === "ok").length;
  const issue = items.filter((i) => i.status === "issue").length;
  const na = items.filter((i) => i.status === "na").length;
  const unset = items.filter((i) => i.status === "unset").length;
  const scored = ok + issue;
  const percentOk = scored ? Math.round((ok / scored) * 100) : 0;
  return { ok, issue, na, unset, scored, percentOk, total: items.length };
}

export function roundToText(
  templateId: RoundTemplateId,
  items: CheckItem[],
  meta: { date: string; area: string; by: string },
  da: boolean,
): string {
  const tpl = ROUND_TEMPLATES.find((t) => t.id === templateId)!;
  const stats = roundStats(items);
  const statusMap = da
    ? { ok: "OK", issue: "Afvigelse", na: "N/A", unset: "—" }
    : { ok: "OK", issue: "Issue", na: "N/A", unset: "—" };
  const lines = [
    da ? "Sikkerhedsrunde" : "Safety walk",
    `${da ? "Skabelon" : "Template"}: ${da ? tpl.titleDa : tpl.titleEn}`,
    `${da ? "Dato" : "Date"}: ${meta.date || "—"}`,
    `${da ? "Område" : "Area"}: ${meta.area || "—"}`,
    `${da ? "Udført af" : "Done by"}: ${meta.by || "—"}`,
    da
      ? `Resultat: ${stats.ok} OK, ${stats.issue} afvigelser (${stats.percentOk}% OK af bedømte)`
      : `Result: ${stats.ok} OK, ${stats.issue} issues (${stats.percentOk}% OK of scored)`,
    "",
  ];
  for (const item of items) {
    const text = da ? item.textDa : item.textEn;
    lines.push(`[${statusMap[item.status]}] ${text}`);
    if (item.note.trim()) lines.push(`  ${item.note.trim()}`);
  }
  return lines.join("\n");
}
