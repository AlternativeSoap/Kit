export type AmTerm = {
  id: string;
  abbr: string;
  nameDa: string;
  nameEn: string;
  meaningDa: string;
  meaningEn: string;
  tipDa: string;
  tipEn: string;
};

export type AmRole = {
  id: string;
  roleDa: string;
  roleEn: string;
  dutyDa: string;
  dutyEn: string;
};

export type AmArea = {
  id: string;
  titleDa: string;
  titleEn: string;
  examplesDa: string[];
  examplesEn: string[];
};

export const AM_TERMS: readonly AmTerm[] = [
  {
    id: "amr",
    abbr: "AMR",
    nameDa: "Arbejdsmiljørepræsentant",
    nameEn: "Health and safety representative",
    meaningDa:
      "Du er kollegernes stemme i arbejdsmiljøet. Du hjælper med at finde problemer tidligt og forebygge ulykker og slid.",
    meaningEn:
      "You are the colleagues' voice on health and safety. You help spot problems early and prevent accidents and strain.",
    tipDa:
      "Din vigtigste opgave er at repræsentere medarbejderne. Du skal ikke selv løse alt, og du er ikke ledelsens kontrollør.",
    tipEn:
      "Your main job is to represent employees. You do not have to fix everything yourself, and you are not management's inspector.",
  },
  {
    id: "amo",
    abbr: "AMO",
    nameDa: "Arbejdsmiljøorganisation",
    nameEn: "Health and safety organisation",
    meaningDa:
      "Samarbejdet mellem ledelse og medarbejderrepræsentanter om et sikkert og sundt arbejdsmiljø.",
    meaningEn:
      "The cooperation between management and employee representatives on a safe and healthy workplace.",
    tipDa:
      "AMO er stedet, hvor I aftaler, hvad der skal gøres, hvem der gør det, og hvornår I følger op.",
    tipEn:
      "AMO is where you agree what to do, who does it, and when you follow up.",
  },
  {
    id: "apv",
    abbr: "APV",
    nameDa: "Arbejdspladsvurdering",
    nameEn: "Workplace assessment",
    meaningDa:
      "En fast måde at finde arbejdsmiljøproblemer, vurdere dem, lave en plan og tjekke om løsningerne virker.",
    meaningEn:
      "A clear way to find workplace problems, judge how serious they are, make a plan, and check that fixes work.",
    tipDa:
      "APV skal opdateres, når noget vigtigt ændrer sig, og mindst hvert tredje år. Arbejdsgiveren skal sørge for, at den findes.",
    tipEn:
      "Update the APV when something important changes, and at least every three years. The employer must make sure it exists.",
  },
  {
    id: "at",
    abbr: "AT",
    nameDa: "Arbejdstilsynet",
    nameEn: "Working Environment Authority",
    meaningDa:
      "Myndigheden der tjekker, om arbejdsmiljøreglerne overholdes, og som kan give påbud.",
    meaningEn:
      "The authority that checks whether health and safety rules are followed, and that can issue orders.",
    tipDa:
      "Et påbud betyder, at noget skal rettes. Det er arbejdsgiverens ansvar at få det gjort.",
    tipEn:
      "An order means something must be fixed. It is the employer's responsibility to get it done.",
  },
  {
    id: "amg",
    abbr: "AMG",
    nameDa: "Arbejdsmiljøgruppe",
    nameEn: "Health and safety group",
    meaningDa:
      "Den lokale gruppe tæt på arbejdet. Den består typisk af en arbejdsleder og en AMR.",
    meaningEn:
      "The local group close to the work. It usually includes a supervisor and a health and safety representative.",
    tipDa:
      "Brug gruppen til konkrete problemer i hverdagen: løft, truck, rod, støj og tidspres.",
    tipEn:
      "Use the group for everyday problems: lifting, forklifts, clutter, noise, and time pressure.",
  },
  {
    id: "amu",
    abbr: "AMU",
    nameDa: "Arbejdsmarkedsuddannelse",
    nameEn: "Labour market training",
    meaningDa:
      "Efteruddannelse på arbejdsmarkedet. Det er noget andet end den lovpligtige arbejdsmiljøuddannelse.",
    meaningEn:
      "Continuing education for the labour market. It is different from the mandatory health and safety course.",
    tipDa:
      "Forveksl ikke AMU med AMR-kurset. AMR og arbejdsledere skal have arbejdsmiljøuddannelsen.",
    tipEn:
      "Do not confuse AMU with the representative course. Representatives and supervisors need the health and safety training.",
  },
  {
    id: "naerved",
    abbr: "Nærved",
    nameDa: "Nærved-ulykke",
    nameEn: "Near miss",
    meaningDa:
      "Noget gik næsten galt, men ingen kom til skade. Det er et vigtigt signal om risiko.",
    meaningEn:
      "Something almost went wrong, but nobody was hurt. It is an important warning about risk.",
    tipDa:
      "Skriv det ned og tag det op. Det er lettere at rette en fare før nogen bliver skadet.",
    tipEn:
      "Write it down and raise it. It is easier to fix a hazard before someone gets hurt.",
  },
  {
    id: "handlingsplan",
    abbr: "Plan",
    nameDa: "Handlingsplan",
    nameEn: "Action plan",
    meaningDa:
      "Listen over hvad der skal gøres ved et arbejdsmiljøproblem, hvem der gør det, og hvornår.",
    meaningEn:
      "The list of what will be done about a workplace problem, who will do it, and by when.",
    tipDa:
      "Uden ansvarlig og frist bliver planen sjældent til noget. Opfølgning hører med.",
    tipEn:
      "Without an owner and a deadline, plans rarely happen. Follow-up belongs with the plan.",
  },
  {
    id: "aarsdroeftelse",
    abbr: "Årlig",
    nameDa: "Årlig arbejdsmiljødrøftelse",
    nameEn: "Annual health and safety discussion",
    meaningDa:
      "Et årligt møde, hvor ledelse og AMO taler om, hvordan arbejdsmiljøarbejdet er gået, og hvad I prioriterer næste år.",
    meaningEn:
      "A yearly meeting where management and the health and safety organisation talk about how the work went and what to prioritise next year.",
    tipDa:
      "Medbring APV-status, ulykker, nærved-hændelser og konkrete forslag fra hverdagen.",
    tipEn:
      "Bring APV status, accidents, near misses, and concrete suggestions from daily work.",
  },
  {
    id: "risiko",
    abbr: "Risiko",
    nameDa: "Risikovurdering",
    nameEn: "Risk assessment",
    meaningDa:
      "Du spørger: Hvor sandsynligt er det, at noget går galt? Og hvor slemt kan det blive? Derefter finder I en løsning.",
    meaningEn:
      "You ask: How likely is something to go wrong? And how bad could it be? Then you find a fix.",
    tipDa:
      "Det er ikke nok at sige, at noget er farligt. Find også en praktisk måde at gøre det sikrere.",
    tipEn:
      "It is not enough to say something is dangerous. Also find a practical way to make it safer.",
  },
  {
    id: "beskyttelse",
    abbr: "Beskyttelse",
    nameDa: "AMR-beskyttelse",
    nameEn: "Representative protection",
    meaningDa:
      "Der gælder særlige regler, så du ikke må stilles dårligere eller afskediges på grund af dit hverv som AMR.",
    meaningEn:
      "Special rules apply so you must not be treated worse or dismissed because of your role as representative.",
    tipDa:
      "Du må bruge den nødvendige arbejdstid på hvervet. Tal med ledelsen om tid og praktiske rammer.",
    tipEn:
      "You may use the working time needed for the role. Talk with management about time and practical arrangements.",
  },
  {
    id: "sikkerhedsdatablad",
    abbr: "SDB",
    nameDa: "Sikkerhedsdatablad",
    nameEn: "Safety data sheet",
    meaningDa:
      "Dokumentet der fortæller, hvordan et kemikalie skal bruges sikkert, og hvilke værnemidler der skal til.",
    meaningEn:
      "The document that explains how to use a chemical safely and which protective equipment is needed.",
    tipDa:
      "Databladet skal være tilgængeligt dér, hvor kemikaliet bruges. Ikke kun i et kontorskab.",
    tipEn:
      "The sheet should be available where the chemical is used. Not only in an office cupboard.",
  },
];

export const AM_ROLES: readonly AmRole[] = [
  {
    id: "employer",
    roleDa: "Arbejdsgiver",
    roleEn: "Employer",
    dutyDa:
      "Har det overordnede ansvar for et sikkert og sundt arbejdsmiljø. Det ansvar kan ikke gives videre til AMR.",
    dutyEn:
      "Has overall responsibility for a safe and healthy workplace. That duty cannot be handed over to the representative.",
  },
  {
    id: "supervisor",
    roleDa: "Arbejdsleder",
    roleEn: "Supervisor",
    dutyDa:
      "Skal sørge for, at det daglige arbejde kan udføres sikkert, og følge op når der er problemer.",
    dutyEn:
      "Must make sure daily work can be done safely, and follow up when problems appear.",
  },
  {
    id: "amr",
    roleDa: "AMR",
    roleEn: "Representative",
    dutyDa:
      "Repræsenterer medarbejderne, hjælper med at finde problemer og medvirker til at forebygge dem. Samarbejder med ledelsen.",
    dutyEn:
      "Represents employees, helps find problems, and helps prevent them. Cooperates with management.",
  },
  {
    id: "employee",
    roleDa: "Medarbejder",
    roleEn: "Employee",
    dutyDa:
      "Skal medvirke til sikkerheden, følge instruktioner og sige til, når noget er farligt eller slidende.",
    dutyEn:
      "Must contribute to safety, follow instructions, and speak up when something is dangerous or straining.",
  },
  {
    id: "amo",
    roleDa: "AMO",
    roleEn: "Health and safety organisation",
    dutyDa:
      "Organiserer samarbejdet om arbejdsmiljøet, så problemer bliver til aftaler og opfølgning.",
    dutyEn:
      "Organises cooperation on health and safety so problems turn into agreements and follow-up.",
  },
];

export const AM_AREAS: readonly AmArea[] = [
  {
    id: "physical",
    titleDa: "Fysisk arbejdsmiljø",
    titleEn: "Physical working environment",
    examplesDa: [
      "Tunge løft og dårlige arbejdsstillinger",
      "Støj og vibrationer",
      "Kulde, varme og træk",
      "Truckkørsel og intern transport",
    ],
    examplesEn: [
      "Heavy lifting and awkward postures",
      "Noise and vibration",
      "Cold, heat, and draughts",
      "Forklift work and internal transport",
    ],
  },
  {
    id: "safety",
    titleDa: "Sikkerhed og ulykker",
    titleEn: "Safety and accidents",
    examplesDa: [
      "Påkørsler og snublefare",
      "Klemning og faldende gods",
      "Manglende afspærring",
      "Usikre steder ved lastning og losning",
    ],
    examplesEn: [
      "Collisions and trip hazards",
      "Crushing and falling goods",
      "Missing barriers",
      "Unsafe spots during loading and unloading",
    ],
  },
  {
    id: "psych",
    titleDa: "Psykisk arbejdsmiljø",
    titleEn: "Mental working environment",
    examplesDa: [
      "Stress og tidspres",
      "Uklares forventninger",
      "Konflikter og dårlig tone",
      "Lille indflydelse på eget arbejde",
    ],
    examplesEn: [
      "Stress and time pressure",
      "Unclear expectations",
      "Conflicts and a poor tone",
      "Little influence on your own work",
    ],
  },
  {
    id: "chemical",
    titleDa: "Kemisk arbejdsmiljø",
    titleEn: "Chemical working environment",
    examplesDa: [
      "Rengøringsmidler, olie og andre kemikalier",
      "Hudkontakt og dampe",
      "Manglende sikkerhedsdatablade",
      "Forkerte handsker eller værnemidler",
    ],
    examplesEn: [
      "Cleaning agents, oils, and other chemicals",
      "Skin contact and vapours",
      "Missing safety data sheets",
      "Wrong gloves or protective equipment",
    ],
  },
];

export function filterTerms(query: string): AmTerm[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...AM_TERMS];
  return AM_TERMS.filter((t) => {
    const hay = [
      t.abbr,
      t.nameDa,
      t.nameEn,
      t.meaningDa,
      t.meaningEn,
      t.tipDa,
      t.tipEn,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function termsExport(da: boolean): string {
  return AM_TERMS.map((t) => {
    const name = da ? t.nameDa : t.nameEn;
    const meaning = da ? t.meaningDa : t.meaningEn;
    const tip = da ? t.tipDa : t.tipEn;
    return `${t.abbr} – ${name}\n${meaning}\n${da ? "Husk" : "Remember"}: ${tip}`;
  }).join("\n\n");
}
