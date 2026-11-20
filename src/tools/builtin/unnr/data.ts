/** Curated ADR-oriented UN entries for education and quick lookup. Not a full Table A. */

export type PackingGroup = "I" | "II" | "III" | null;

export type TransportCategory = 0 | 1 | 2 | 3 | 4;

/** Practical stacking policy for packages (CTU Code / ADR stowage). */
export type StackPolicy =
  | "no"
  | "upright_limited"
  | "with_board"
  | "same_only"
  | "careful";

export type StackInfo = {
  policy: StackPolicy;
  summaryDa: string;
  summaryEn: string;
  /** What may sit on top when the top is flat and a board/sheet is used */
  mayOnTopDa: string;
  mayOnTopEn: string;
  /** What must not be stacked on / with this goods */
  neverDa: string;
  neverEn: string;
  /** Intermediate layer / mellemlægsplade guidance */
  boardDa: string;
  boardEn: string;
};

export type UnEntry = {
  un: string;
  nameDa: string;
  nameEn: string;
  /** ADR class, e.g. "3", "8", "2.1" */
  hazardClass: string;
  classificationCode: string;
  packingGroup: PackingGroup;
  labels: string;
  tunnelCode: string;
  transportCategory: TransportCategory;
  /** Max under 1.1.3.6 for this category alone (L or kg), null if none */
  exemptionLimit: number | null;
  limitedQuantity: string;
  exceptedQuantity: string;
  vehicleDa: string;
  vehicleEn: string;
  handlingDa: string;
  handlingEn: string;
  spillDa: string;
  spillEn: string;
  fireDa: string;
  fireEn: string;
  ppeDa: string;
  ppeEn: string;
  notesDa: string;
  notesEn: string;
  stack: StackInfo;
};

export const STACK_POLICY_LABEL: Record<
  StackPolicy,
  { da: string; en: string }
> = {
  no: { da: "Må ikke stakkes", en: "Do not stack" },
  upright_limited: {
    da: "Kun opretstående / begrænset stak",
    en: "Upright only / limited stack",
  },
  with_board: {
    da: "Stak kun hvis designet til det + mellemlæg",
    en: "Stack only if designed + intermediate sheet",
  },
  same_only: {
    da: "Kun ens / kompatible kolli",
    en: "Same / compatible packages only",
  },
  careful: {
    da: "Forsigtig stakning",
    en: "Careful stacking",
  },
};

/** System rules from ADR CTU packing + CTU Code (teaching summary). */
export const STACK_SYSTEM_DA = [
  "Kolli må ikke stakkes, medmindre de er designet til det (ADR/CTU).",
  "Forskellige stak-designs skal være kompatible. Brug lastfordelende plader (fiberplade, krydsfiner eller palle) mellem lag, når toppen er flad, og der er sideværts spillerum.",
  "Tungere gods under lettere. Flydende farligt gods under tørt farligt gods, når det er muligt. Skarpe kanter ikke på svage flader.",
  "Tromler med farligt gods stuves opretstående, medmindre myndighed tillader andet.",
  "Følg pile “denne vej op” og mærkning “må ikke dobbeltstakkes”.",
];

export const STACK_SYSTEM_EN = [
  "Packages must not be stacked unless designed for that purpose (ADR/CTU).",
  "Different stacking designs must be compatible. Use load-spreading sheets (fibreboard, plywood, or pallets) between layers when the top is flat and there is lateral play.",
  "Heavier goods below lighter. Liquid dangerous goods below dry dangerous goods when possible. No sharp edges on weak surfaces.",
  "Drums of dangerous goods are stowed upright unless the authority allows otherwise.",
  "Obey “this way up” arrows and “do not double stack” marks.",
];

export const TRANSPORT_CAT_LIMITS: Record<
  TransportCategory,
  { limit: number | null; multiplier: number; labelDa: string; labelEn: string }
> = {
  0: {
    limit: 0,
    multiplier: 0,
    labelDa: "Ingen fritagelse (kat. 0)",
    labelEn: "No exemption (cat. 0)",
  },
  1: {
    limit: 20,
    multiplier: 50,
    labelDa: "Op til 20 L/kg (multiplikator ×50)",
    labelEn: "Up to 20 L/kg (multiplier ×50)",
  },
  2: {
    limit: 333,
    multiplier: 3,
    labelDa: "Op til 333 L/kg (multiplikator ×3)",
    labelEn: "Up to 333 L/kg (multiplier ×3)",
  },
  3: {
    limit: 1000,
    multiplier: 1,
    labelDa: "Op til 1.000 L/kg (multiplikator ×1)",
    labelEn: "Up to 1,000 L/kg (multiplier ×1)",
  },
  4: {
    limit: null,
    multiplier: 0,
    labelDa: "Ingen mængdegrænse under 1.1.3.6 (kat. 4)",
    labelEn: "No quantity limit under 1.1.3.6 (cat. 4)",
  },
};

function buildStack(
  un: string,
  hazardClass: string,
  override?: Partial<StackInfo>,
): StackInfo {
  let base: StackInfo;

  // Gas cylinders / pressure receptacles
  if (hazardClass.startsWith("2") && un !== "1950" && un !== "1845" && un !== "2187") {
    base = {
      policy: "no",
      summaryDa:
        "Trykflasker stakkes normalt ikke frit ovenpå hinanden. Brug godkendt stativ/bur, eller stuv i ét lag med solid fastholdelse.",
      summaryEn:
        "Pressure cylinders are normally not free-stacked on each other. Use an approved rack/cage, or stow in a single layer with solid securing.",
      mayOnTopDa:
        "Intet frit gods ovenpå flasker. Kun hvis flaskerne sidder i et certificeret stativ der er beregnet til stakning.",
      mayOnTopEn:
        "No free cargo on top of cylinders. Only if cylinders sit in a certified rack designed for stacking.",
      neverDa:
        "Ikke væske-tromler, paller eller tunge kolli direkte på ventiler/flasker. Ikke liggende flasker under last.",
      neverEn:
        "No liquid drums, pallets, or heavy packages directly on valves/cylinders. No lying cylinders under cargo.",
      boardDa:
        "En mellemlægsplade erstatter ikke et flaskestativ. Plader hjælper kun mellem lag i godkendte stativer.",
      boardEn:
        "An intermediate sheet does not replace a cylinder rack. Boards only help between layers in approved racks.",
    };
  } else if (un === "1950") {
    base = {
      policy: "with_board",
      summaryDa:
        "Aerosol-kartoner må stakkes, hvis kartonen er beregnet til det. Beskyt mod knusning og varme.",
      summaryEn:
        "Aerosol cartons may be stacked if the carton is designed for it. Protect from crushing and heat.",
      mayOnTopDa:
        "Lette ens kartoner af samme type. Flad top + mellemlægsplade (fiberplade/krydsfiner) mellem lag.",
      mayOnTopEn:
        "Light cartons of the same type. Flat top + intermediate sheet (fibreboard/plywood) between layers.",
      neverDa:
        "Ikke tungt gods, tromler eller spidse kolli ovenpå. Ikke stak beskadigede kartoner.",
      neverEn:
        "No heavy goods, drums, or sharp packages on top. Do not stack damaged cartons.",
      boardDa:
        "Brug plade mellem lag, så vægten fordeles på kartonernes sidevægge, ikke midt på lågene.",
      boardEn:
        "Use a sheet between layers so load transfers into the carton side walls, not mid-lid.",
    };
  } else if (un === "1845" || un === "2187") {
    base = {
      policy: "careful",
      summaryDa:
        "Kulde-/kryokolli: begrænset stakning. Emballage skal kunne lufte. Undgå tæt tillukket tryk under last.",
      summaryEn:
        "Cold/cryo packages: limited stacking. Packaging must vent. Avoid a sealed pressure build-up under load.",
      mayOnTopDa:
        "Lette kolli af samme type, hvis emballagen er designet til stakning og ventilation bevares.",
      mayOnTopEn:
        "Light packages of the same type if the packaging is designed for stacking and ventilation remains.",
      neverDa:
        "Ikke tæt forseglet under tung last. Ikke gods der blokerer udluftning.",
      neverEn:
        "Not tightly sealed under heavy load. No cargo that blocks venting.",
      boardDa:
        "Mellemlæg må ikke tætne emballagen. Brug åbne/ventilerede lag.",
      boardEn:
        "Intermediate sheets must not seal the packaging. Use open/ventilated layers.",
    };
  } else if (
    un === "3090" ||
    un === "3091" ||
    un === "3480" ||
    un === "3481"
  ) {
    base = {
      policy: "no",
      summaryDa:
        "Lithiumbatterier: undgå knusning. Stak ikke tungt gods ovenpå batterikolli. Følg emballageinstruktionen.",
      summaryEn:
        "Lithium batteries: avoid crushing. Do not stack heavy cargo on battery packages. Follow the packing instruction.",
      mayOnTopDa:
        "Højst let gods af samme type, og kun hvis emballagen er eksplicit designet og testet til stakbelastning.",
      mayOnTopEn:
        "At most light goods of the same type, and only if packaging is explicitly designed and tested for stacking load.",
      neverDa:
        "Ikke tromler, IBC, maskiner eller andre tunge kolli ovenpå. Ikke stak beskadigede/defekte batterier.",
      neverEn:
        "No drums, IBCs, machinery, or other heavy packages on top. Do not stack damaged/defective batteries.",
      boardDa:
        "En plade fordeler tryk, men tillader ikke højere last end emballagens staktest. Ved tvivl: ét lag.",
      boardEn:
        "A board spreads pressure but does not allow more load than the package stacking test. When unsure: single layer.",
    };
  } else if (un === "2794") {
    base = {
      policy: "upright_limited",
      summaryDa:
        "Våde batterier opretstående. Begrænset stakning af bakker/kasser kun hvis designet til det.",
      summaryEn:
        "Wet batteries upright. Limited stacking of trays/boxes only if designed for it.",
      mayOnTopDa:
        "Ens batteribakker med flad top og mellemlæg, inden for designlast. Poler stadig beskyttet.",
      mayOnTopEn:
        "Matching battery trays with a flat top and intermediate sheet, within design load. Terminals still protected.",
      neverDa:
        "Ikke tippe. Ikke lægge andre kolli så poler kan kortslutte. Ikke væsker der kan løbe ned på poler.",
      neverEn:
        "Do not tip. Do not place packages so terminals can short. No liquids that can run onto terminals.",
      boardDa:
        "Isolerende/syrefast mellemlæg mellem bakker kan hjælpe, hvis det ikke skjuler lækage eller blokerer ventilation.",
      boardEn:
        "Insulating/acid-resistant sheets between trays can help if they do not hide leaks or block ventilation.",
    };
  } else if (un === "3166") {
    base = {
      policy: "no",
      summaryDa: "Køretøjer stakkes ikke. Sikres mod rulle i ét lag.",
      summaryEn: "Vehicles are not stacked. Secure against rolling in a single layer.",
      mayOnTopDa: "Intet gods ovenpå køretøjet, medmindre en særlig transportløsning er godkendt.",
      mayOnTopEn: "No cargo on the vehicle unless a special approved transport solution is used.",
      neverDa: "Ikke paller, tromler eller andet ovenpå karrosseri/tag uden særlig tilladelse.",
      neverEn: "No pallets, drums, or other cargo on the body/roof without special approval.",
      boardDa: "Mellemlægsplade er ikke relevant til stakning af hele køretøjer.",
      boardEn: "An intermediate sheet is not relevant for stacking whole vehicles.",
    };
  } else if (hazardClass.startsWith("6.2") || un === "3291" || un === "3373") {
    base = {
      policy: "careful",
      summaryDa:
        "Biologisk/klinisk: følg orientering og P650/emballage. Undgå knusning. Stak kun hvis ydre emballage er designet til det.",
      summaryEn:
        "Biological/clinical: follow orientation and P650/packaging. Avoid crushing. Stack only if outer packaging is designed for it.",
      mayOnTopDa:
        "Lette ens forsendelser med flad top og mellemlæg, uden at overskride staklast.",
      mayOnTopEn:
        "Light matching consignments with a flat top and intermediate sheet, without exceeding stacking load.",
      neverDa:
        "Ikke tungt eller skarpt gods ovenpå. Ikke stak lækkende eller beskadigede kolli.",
      neverEn:
        "No heavy or sharp cargo on top. Do not stack leaking or damaged packages.",
      boardDa:
        "Plade mellem lag må ikke skjule lækage eller vende “denne vej op” forkert.",
      boardEn:
        "A sheet between layers must not hide leaks or reverse “this way up”.",
    };
  } else if (hazardClass === "8" || hazardClass.startsWith("5")) {
    base = {
      policy: "with_board",
      summaryDa:
        "Ætsende/oxiderende væsker i dunke/tromler: opretstående. Stak kun designet emballage med lastfordeling.",
      summaryEn:
        "Corrosive/oxidizing liquids in jerrycans/drums: upright. Stack only designed packaging with load spreading.",
      mayOnTopDa:
        "Ens dunke/kartoner med flad top. Mellemlægsplade mellem lag. Lettere gods ovenpå tungere.",
      mayOnTopEn:
        "Matching jerrycans/cartons with a flat top. Intermediate sheet between layers. Lighter goods above heavier.",
      neverDa:
        "Ikke inkompatible stoffer (fx syre på base). Ikke skarpe eller punktbelastende kolli. Flydende under tørt når muligt.",
      neverEn:
        "No incompatible substances (e.g. acid on base). No sharp or point-loading packages. Liquids below dry goods when possible.",
      boardDa:
        "Brug syrefast/egnet plade eller palle mellem lag, så vægten fordeles og underkolli ikke deformeres.",
      boardEn:
        "Use an acid-safe/suitable board or pallet between layers so weight spreads and lower packages are not crushed.",
    };
  } else if (hazardClass === "3" || un === "1993" || un === "1863") {
    base = {
      policy: "with_board",
      summaryDa:
        "Brandfarlige væsker: tromler/dunke opretstående. Stak kun hvis emballagen er staktestet.",
      summaryEn:
        "Flammable liquids: drums/jerrycans upright. Stack only if packaging is stacking-tested.",
      mayOnTopDa:
        "Ens kolli med flad top. Mellemlægsplade (fiberplade, krydsfiner eller palle) mellem lag. Lettere ovenpå.",
      mayOnTopEn:
        "Matching packages with a flat top. Intermediate sheet (fibreboard, plywood, or pallet) between layers. Lighter on top.",
      neverDa:
        "Ikke oxidationsmidler eller andre inkompatible stoffer i samme stak uden adskillelse. Ikke knusende maskindele ovenpå.",
      neverEn:
        "No oxidizers or other incompatibles in the same stack without segregation. No crushing machinery parts on top.",
      boardDa:
        "Ved flad top og sideværts spillerum: læg plade mellem lag, så lasten går i sidevæggene. Overskrid ikke stakhøjde/-last.",
      boardEn:
        "With a flat top and lateral play: place a sheet between layers so load goes into the side walls. Do not exceed stack height/load.",
    };
  } else if (un === "3077") {
    base = {
      policy: "with_board",
      summaryDa:
        "Faste miljøfarlige stoffer i sække/IBC: stak efter emballagens design. Hold tørt.",
      summaryEn:
        "Solid environmentally hazardous goods in bags/IBCs: stack per packaging design. Keep dry.",
      mayOnTopDa:
        "Ens sække i krydsbinding eller kartoner/IBC med flad top og mellemlæg.",
      mayOnTopEn:
        "Matching bags in a cross-tie pattern, or cartons/IBCs with a flat top and intermediate sheet.",
      neverDa:
        "Ikke våde eller lækkende kolli i stakken. Ikke tungt punktlast på svage sække.",
      neverEn:
        "No wet or leaking packages in the stack. No heavy point loads on weak bags.",
      boardDa:
        "Plader/paller mellem lag stabiliserer og fordeler last. Hold stakken tør (H1 hvis relevant).",
      boardEn:
        "Boards/pallets between layers stabilize and spread load. Keep the stack dry (H1 if relevant).",
    };
  } else if (hazardClass === "9" || un === "3082") {
    base = {
      policy: "with_board",
      summaryDa:
        "Klasse 9-kolli: stak kun hvis designet til det. Brug mellemlæg ved flad top.",
      summaryEn:
        "Class 9 packages: stack only if designed for it. Use an intermediate sheet on a flat top.",
      mayOnTopDa:
        "Lette, kompatible kolli med flad top og mellemlægsplade.",
      mayOnTopEn:
        "Light, compatible packages with a flat top and intermediate sheet.",
      neverDa:
        "Ikke tungere gods ovenpå lettere. Ikke stak ved “do not double stack”-mærke.",
      neverEn:
        "No heavier goods on lighter. Do not stack when marked “do not double stack”.",
      boardDa:
        "Fiberplade, krydsfiner eller palle mellem lag for at fordele lasten.",
      boardEn:
        "Fibreboard, plywood, or a pallet between layers to spread the load.",
    };
  } else {
    base = {
      policy: "careful",
      summaryDa:
        "Stak kun kolli der er designet til stakning. Tjek emballagemærkning og staklast.",
      summaryEn:
        "Stack only packages designed for stacking. Check packaging marks and stacking load.",
      mayOnTopDa:
        "Kompatible, lettere kolli med flad top og mellemlægsplade.",
      mayOnTopEn:
        "Compatible, lighter packages with a flat top and intermediate sheet.",
      neverDa:
        "Ikke stak hvis emballagen er beskadiget, lækker eller er mærket imod stakning.",
      neverEn:
        "Do not stack if packaging is damaged, leaking, or marked against stacking.",
      boardDa:
        "Brug lastfordelende plade mellem lag, når toppen er flad.",
      boardEn:
        "Use a load-spreading sheet between layers when the top is flat.",
    };
  }

  return {
    ...base,
    ...override,
    policy: override?.policy ?? base.policy,
  };
}

function e(
  partial: Omit<UnEntry, "stack"> & { stack?: Partial<StackInfo> },
): UnEntry {
  const { stack: stackOverride, ...rest } = partial;
  return {
    ...rest,
    stack: buildStack(rest.un, rest.hazardClass, stackOverride),
  };
}

/**
 * Common road-freight UN numbers. Values follow typical ADR Table A patterns
 * for education. Always verify against the current official ADR / DGSA advice.
 */
export const UN_ENTRIES: UnEntry[] = [
  e({
    un: "1005",
    nameDa: "Ammoniak, vandfri",
    nameEn: "Ammonia, anhydrous",
    hazardClass: "2.3",
    classificationCode: "2TC",
    packingGroup: null,
    labels: "2.3 + 8",
    tunnelCode: "C/D",
    transportCategory: 1,
    exemptionLimit: 20,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Giftig gas. Ofte tank eller trykflasker. Kræver korrekt skiltning og ofte særskilt transportplan. Hold afstand til beboelse ved ophold.",
    vehicleEn:
      "Toxic gas. Often tanks or cylinders. Needs correct placarding and often a special transport plan. Keep clear of housing during stops.",
    handlingDa:
      "Undgå lækage og opvarmning. Ventiler godt. Kun uddannet personel. Følg særlige bestemmelser for giftige gasser.",
    handlingEn:
      "Avoid leaks and heating. Ventilate well. Trained staff only. Follow special provisions for toxic gases.",
    spillDa:
      "Evakuér medvind. Giftig damp. Tilkald beredskab. Brug åndedrætsværn. Neutraliser ikke selv uden anvisning.",
    spillEn:
      "Evacuate downwind. Toxic vapour. Call emergency services. Use breathing protection. Do not neutralize without guidance.",
    fireDa:
      "Køl beholdere. Giftig røg. Brandbekæmpelse kun med korrekt beskyttelse.",
    fireEn:
      "Cool receptacles. Toxic smoke. Fight fire only with proper protection.",
    ppeDa: "Gastæt dragt / åndedrætsværn efter risikovurdering, beskyttelseshandsker, øjenværn.",
    ppeEn: "Gas-tight suit / respirator per risk assessment, protective gloves, eye protection.",
    notesDa: "Højkonsekvensfarligt gods kan være relevant. Tjek ADR 1.10 og nationale regler.",
    notesEn: "High-consequence dangerous goods rules may apply. Check ADR 1.10 and national rules.",
  }),
  e({
    un: "1017",
    nameDa: "Chlor",
    nameEn: "Chlorine",
    hazardClass: "2.3",
    classificationCode: "2TC",
    packingGroup: null,
    labels: "2.3 + 8",
    tunnelCode: "C/D",
    transportCategory: 1,
    exemptionLimit: 20,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Trykflasker eller tank. Skiltning og ADR-udstyr påkrævet når grænser overskrides. Undgå tæt bebyggelse ved pause.",
    vehicleEn:
      "Cylinders or tank. Placards and ADR equipment required when limits are exceeded. Avoid dense housing during stops.",
    handlingDa: "Hold køligt og ventileret. Ingen olie/fedt på ventiler. Kun godkendte tilslutninger.",
    handlingEn: "Keep cool and ventilated. No oil/grease on valves. Approved connections only.",
    spillDa: "Evakuér. Chlor er giftig og ætsende. Beredskab med åndedrætsværn. Vandtåge kan hjælpe til at slå dampe ned.",
    spillEn: "Evacuate. Chlorine is toxic and corrosive. Responders need respirators. Water spray may knock down vapours.",
    fireDa: "Køl flasker. Undgå direkte vandstråle på lækage uden plan.",
    fireEn: "Cool cylinders. Avoid a direct water jet on a leak without a plan.",
    ppeDa: "Åndedrætsværn, kemikaliebestandige handsker, øjen-/ansigtsbeskyttelse.",
    ppeEn: "Respirator, chemical-resistant gloves, eye/face protection.",
    notesDa: "Særlig 1.1.3.6-note: ofte max 50 kg for visse giftige gasser. Bekræft i ADR.",
    notesEn: "Special 1.1.3.6 note: often max 50 kg for certain toxic gases. Confirm in ADR.",
  }),
  e({
    un: "1046",
    nameDa: "Helium, komprimeret",
    nameEn: "Helium, compressed",
    hazardClass: "2.2",
    classificationCode: "1A",
    packingGroup: null,
    labels: "2.2",
    tunnelCode: "E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "120 mL",
    exceptedQuantity: "E1",
    vehicleDa:
      "Flasker sikres mod tipning og rulle. Ventiler beskyttet. God ventilation i lukket lastrum.",
    vehicleEn:
      "Secure cylinders against tipping and rolling. Protect valves. Good ventilation in closed cargo space.",
    handlingDa: "Ikke brandfarlig, men trykfare. Åbn ventiler langsomt. Ingen stød.",
    handlingEn: "Not flammable, but pressure hazard. Open valves slowly. No impacts.",
    spillDa: "Udluft område. I lukkede rum kan iltmangel opstå. Forlad lokalet ved stor udsivning.",
    spillEn: "Ventilate. In closed rooms oxygen can be displaced. Leave the area on a large release.",
    fireDa: "Køl flasker med vand hvis de er i brandpåvirkning.",
    fireEn: "Cool cylinders with water if exposed to fire.",
    ppeDa: "Sikkerhedsbriller, handsker ved håndtering af kolde/trykdele.",
    ppeEn: "Safety glasses, gloves when handling cold/pressure parts.",
    notesDa: "Kvælende gas i lukkede rum.",
    notesEn: "Asphyxiant in confined spaces.",
  }),
  e({
    un: "1072",
    nameDa: "Oxygen, komprimeret",
    nameEn: "Oxygen, compressed",
    hazardClass: "2.2",
    classificationCode: "1O",
    packingGroup: null,
    labels: "2.2 + 5.1",
    tunnelCode: "E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Hold adskilt fra brændbare stoffer og olie/fedt. Flasker fastgjort. Ren håndtering omkring ventiler.",
    vehicleEn:
      "Keep apart from flammables and oil/grease. Secure cylinders. Keep valves clean.",
    handlingDa: "Stærkt oxiderende. Intet fedt på gevind. Rygning forbudt i nærheden.",
    handlingEn: "Strong oxidizer. No grease on threads. No smoking nearby.",
    spillDa: "Udluft. Fjern brandbare materialer. Øget brandfare i oxygenberiget luft.",
    spillEn: "Ventilate. Remove combustibles. Fire risk rises in oxygen-enriched air.",
    fireDa: "Køl flasker. Brand i oxygenberiget miljø er mere intens.",
    fireEn: "Cool cylinders. Fires in oxygen-enriched atmospheres are more intense.",
    ppeDa: "Rene handsker, øjenværn. Undgå fedtede tekstiler.",
    ppeEn: "Clean gloves, eye protection. Avoid greasy textiles.",
    notesDa: "Bland ikke med olierede værktøjer eller klude.",
    notesEn: "Do not mix with oily tools or rags.",
  }),
  e({
    un: "1075",
    nameDa: "Petroleumsgasser, flydende (LPG)",
    nameEn: "Petroleum gases, liquefied (LPG)",
    hazardClass: "2.1",
    classificationCode: "2F",
    packingGroup: null,
    labels: "2.1",
    tunnelCode: "B/D",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Brandfarlig gas. Tank eller flasker. Hold væk fra tændkilder. Korrekt skiltning ved ADR-transport.",
    vehicleEn:
      "Flammable gas. Tank or cylinders. Keep away from ignition sources. Correct placarding for ADR carriage.",
    handlingDa: "Jordet udstyr ved fyldning/tømning. Ingen gnister. Kontroller for lækage med godkendt metode.",
    handlingEn: "Earth equipment when filling/emptying. No sparks. Check for leaks with an approved method.",
    spillDa: "Fjern tændkilder. Udluft lavtliggende områder (tungere end luft). Evakuér ved større lækage.",
    spillEn: "Remove ignition sources. Ventilate low areas (heavier than air). Evacuate on larger leaks.",
    fireDa: "Køl beholdere. Lad ikke brand nå flasker uden køling. Eksplosionsfare.",
    fireEn: "Cool receptacles. Do not let fire reach cylinders without cooling. Explosion risk.",
    ppeDa: "Antistatisk tøj, handsker, øjenværn.",
    ppeEn: "Antistatic clothing, gloves, eye protection.",
    notesDa: "Dækker ofte propan/butan-blandinger. Tjek præcis PSN.",
    notesEn: "Often covers propane/butane mixes. Check the exact PSN.",
  }),
  e({
    un: "1090",
    nameDa: "Aceton",
    nameEn: "Acetone",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Brandfarlig væske i godkendt emballage. Holdes væk fra varme og gnister. Stabil stuvning.",
    vehicleEn:
      "Flammable liquid in approved packaging. Keep away from heat and sparks. Stable stowage.",
    handlingDa: "God ventilation. Undgå statisk elektricitet. Luk emballage tæt.",
    handlingEn: "Good ventilation. Avoid static. Close packaging tightly.",
    spillDa: "Absorber med inert materiale. Fjern tændkilder. Undgå afløb til kloak.",
    spillEn: "Absorb with inert material. Remove ignition sources. Keep out of drains.",
    fireDa: "Alkoholresistent skum, pulver eller CO₂. Køl nærliggende emballage.",
    fireEn: "Alcohol-resistant foam, powder, or CO₂. Cool nearby packaging.",
    ppeDa: "Handsker, øjenværn, antistatisk tøj ved større mængder.",
    ppeEn: "Gloves, eye protection, antistatic clothing for larger amounts.",
    notesDa: "Meget flygtig. Dampe kan danne eksplosiv blanding.",
    notesEn: "Highly volatile. Vapours can form an explosive mixture.",
  }),
  e({
    un: "1133",
    nameDa: "Klæbemidler",
    nameEn: "Adhesives",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "5 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Ofte i dunke/spande. Sørg for tæt lukning og opretstående stuvning. Adskil fra oxidationsmidler.",
    vehicleEn:
      "Often in jerrycans/pails. Keep tightly closed and upright. Separate from oxidizers.",
    handlingDa: "Ventilation. Undgå åbne flammer. Tjek om produktet har anden PSN/klasse.",
    handlingEn: "Ventilation. No open flames. Check if the product has another PSN/class.",
    spillDa: "Opsug. Ventiler. Fjern tændkilder. Affald som farligt gods/affald efter lokale regler.",
    spillEn: "Soak up. Ventilate. Remove ignition sources. Dispose as hazardous waste per local rules.",
    fireDa: "Skum/pulver/CO₂. Undgå spredning af brændende væske.",
    fireEn: "Foam/powder/CO₂. Avoid spreading burning liquid.",
    ppeDa: "Handsker, øjenværn.",
    ppeEn: "Gloves, eye protection.",
    notesDa: "Emballeringsgruppe kan være II eller III afhængig af produkt. Tjek sikkerhedsdatablad og ADR.",
    notesEn: "Packing group may be II or III depending on product. Check SDS and ADR.",
  }),
  e({
    un: "1170",
    nameDa: "Ethanol (ethylalkohol) eller ethanolopløsning",
    nameEn: "Ethanol (ethyl alcohol) or ethanol solution",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Brandfarlig væske. Godkendt emballage, stabil stuvning, væk fra varmekilder.",
    vehicleEn:
      "Flammable liquid. Approved packaging, stable stowage, away from heat sources.",
    handlingDa: "Undgå gnister og rygning. Jordforbindelse ved omtapning af større mængder.",
    handlingEn: "No sparks or smoking. Earth equipment when decanting larger amounts.",
    spillDa: "Absorber. Udluft. Hold væk fra kloak og tændkilder.",
    spillEn: "Absorb. Ventilate. Keep out of drains and away from ignition sources.",
    fireDa: "Alkoholresistent skum, pulver, CO₂. Vandtåge til køling.",
    fireEn: "Alcohol-resistant foam, powder, CO₂. Water spray for cooling.",
    ppeDa: "Handsker, øjenværn.",
    ppeEn: "Gloves, eye protection.",
    notesDa: "Højt alkoholindhold øger brandfaren. Fortyndede opløsninger kan have anden PG.",
    notesEn: "High alcohol content raises fire risk. Dilute solutions may have another packing group.",
  }),
  e({
    un: "1202",
    nameDa: "Dieselolie / gasolie / fyringsolie, let",
    nameEn: "Gas oil / diesel fuel / heating oil, light",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "III",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "5 L",
    exceptedQuantity: "E1",
    vehicleDa:
      "I emballage: stuv opretstående og tæt. I tank: ADR-tankkode og skiltning. Under 1.1.3.6 i emballage kan mange krav lempes (ikke tank/bulk).",
    vehicleEn:
      "In packages: stow upright and sealed. In tanks: ADR tank code and placarding. Under 1.1.3.6 in packages many duties can be eased (not tank/bulk).",
    handlingDa: "Undgå spild og gnister. Brug godkendt emballage (fx P001). Hold miljøet for øje ved lækage.",
    handlingEn: "Avoid spills and sparks. Use approved packaging (e.g. P001). Watch the environment on leaks.",
    spillDa: "Stop kilden hvis sikkert. Absorber. Undgå kloak og vandløb. Saml op som olieaffald.",
    spillEn: "Stop the source if safe. Absorb. Keep out of drains and waterways. Collect as oil waste.",
    fireDa: "Skum, pulver eller CO₂. Køl nærliggende emballage/tank.",
    fireEn: "Foam, powder, or CO₂. Cool nearby packaging/tank.",
    ppeDa: "Oliebestandige handsker, øjenværn, antistatisk tøj ved større arbejde.",
    ppeEn: "Oil-resistant gloves, eye protection, antistatic clothing for larger jobs.",
    notesDa: "Flashpoint og SP 640 kan påvirke tankkrav. Bekræft variant i ADR Table A.",
    notesEn: "Flash point and SP 640 can affect tank requirements. Confirm the variant in ADR Table A.",
  }),
  e({
    un: "1203",
    nameDa: "Benzin eller benzinblandinger",
    nameEn: "Petrol / gasoline or gasoline mixtures",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Meget brandfarlig. Emballage eller tank efter ADR. Hold væk fra tændkilder. Korrekt orange skilte/faresedler når ADR gælder fuldt ud.",
    vehicleEn:
      "Highly flammable. Packaging or tank per ADR. Keep away from ignition sources. Correct orange plates/placards when full ADR applies.",
    handlingDa: "Jordforbindelse ved fyldning. Ingen rygning. Dampe er tungere end luft i begyndelsen og samler sig lavt.",
    handlingEn: "Earth when filling. No smoking. Vapours can collect low at first.",
    spillDa: "Fjern tændkilder. Absorber. Evakuér ved større spild. Undgå kloak.",
    spillEn: "Remove ignition sources. Absorb. Evacuate on larger spills. Keep out of drains.",
    fireDa: "Skum/pulver/CO₂. Eksplosionsfare for dampe.",
    fireEn: "Foam/powder/CO₂. Vapour explosion hazard.",
    ppeDa: "Antistatisk tøj, handsker, øjenværn.",
    ppeEn: "Antistatic clothing, gloves, eye protection.",
    notesDa: "Strengere end diesel (typisk PG II, kat. 2).",
    notesEn: "Stricter than diesel (typically PG II, cat. 2).",
  }),
  e({
    un: "1223",
    nameDa: "Petroleum",
    nameEn: "Kerosene",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "III",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "5 L",
    exceptedQuantity: "E1",
    vehicleDa: "Som andre brandfarlige væsker PG III: stabil emballage, væk fra varme.",
    vehicleEn: "Like other PG III flammable liquids: stable packaging, away from heat.",
    handlingDa: "Ventilation. Undgå åbne flammer.",
    handlingEn: "Ventilation. No open flames.",
    spillDa: "Absorber. Miljøbeskyttelse. Fjern tændkilder.",
    spillEn: "Absorb. Protect the environment. Remove ignition sources.",
    fireDa: "Skum, pulver, CO₂.",
    fireEn: "Foam, powder, CO₂.",
    ppeDa: "Handsker, øjenværn.",
    ppeEn: "Gloves, eye protection.",
    notesDa: "Jet fuel kan være andre UN-numre (fx 1863).",
    notesEn: "Jet fuel may use other UN numbers (e.g. 1863).",
  }),
  e({
    un: "1230",
    nameDa: "Methanol",
    nameEn: "Methanol",
    hazardClass: "3",
    classificationCode: "FT1",
    packingGroup: "II",
    labels: "3 + 6.1",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Brandfarlig og giftig. Adskil fra fødevarer. Tæt emballage. Markering efter ADR.",
    vehicleEn:
      "Flammable and toxic. Separate from foodstuffs. Tight packaging. Marking per ADR.",
    handlingDa: "Undgå indånding og hudkontakt. God ventilation. Ingen gnister.",
    handlingEn: "Avoid inhalation and skin contact. Good ventilation. No sparks.",
    spillDa: "Absorber med forsigtighed. Udluft. Brug åndedrætsværn ved dampe. Undgå kloak.",
    spillEn: "Absorb carefully. Ventilate. Use a respirator for vapours. Keep out of drains.",
    fireDa: "Alkoholresistent skum. Giftig røg mulig.",
    fireEn: "Alcohol-resistant foam. Toxic smoke possible.",
    ppeDa: "Kemikaliehandsker, øjenværn, åndedrætsværn ved dampe.",
    ppeEn: "Chemical gloves, eye protection, respirator for vapours.",
    notesDa: "Giftig ved indtagelse (kan give synsskader). Tag sikkerhedsdatabladet alvorligt.",
    notesEn: "Toxic if swallowed (can damage vision). Take the SDS seriously.",
  }),
  e({
    un: "1263",
    nameDa: "Maling (herunder lak, emalje, bejdse, shellak, fernis, polish, flydende fyldstof og flydende lakbase)",
    nameEn: "Paint (including paint, lacquer, enamel, stain, shellac, varnish, polish, liquid filler and liquid lacquer base)",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "5 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Spande/dunke opretstående. Sikr lågene. Adskil fra oxidationsmidler og fødevarer hvis relevant.",
    vehicleEn:
      "Pails/cans upright. Secure lids. Separate from oxidizers and foodstuffs if relevant.",
    handlingDa: "Tjek om produktet er PG II eller III. Nogle vandbaserede malinger er ikke ADR.",
    handlingEn: "Check whether the product is PG II or III. Some water-based paints are not ADR.",
    spillDa: "Opsug. Ventiler. Affald efter lokale regler for malingaffald.",
    spillEn: "Soak up. Ventilate. Dispose per local paint-waste rules.",
    fireDa: "Skum/pulver. Undgå spredning.",
    fireEn: "Foam/powder. Avoid spreading.",
    ppeDa: "Handsker, øjenværn.",
    ppeEn: "Gloves, eye protection.",
    notesDa: "Meget brugt UN. PG og LQ afhænger af produktet.",
    notesEn: "Very common UN. PG and LQ depend on the product.",
  }),
  e({
    un: "1266",
    nameDa: "Parfumerivarer",
    nameEn: "Perfumery products",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "5 L",
    exceptedQuantity: "E2",
    vehicleDa: "Små flasker i ydre emballage. Hold opretstående og polstret.",
    vehicleEn: "Small bottles in outer packaging. Keep upright and cushioned.",
    handlingDa: "Brandfarlige dampe mulige. Undgå varme.",
    handlingEn: "Flammable vapours possible. Avoid heat.",
    spillDa: "Absorber. Udluft. Fjern tændkilder.",
    spillEn: "Absorb. Ventilate. Remove ignition sources.",
    fireDa: "Skum/pulver/CO₂.",
    fireEn: "Foam/powder/CO₂.",
    ppeDa: "Handsker, øjenværn.",
    ppeEn: "Gloves, eye protection.",
    notesDa: "LQ bruges ofte til detailsendinger.",
    notesEn: "LQ is often used for retail consignments.",
  }),
  e({
    un: "1294",
    nameDa: "Toluen",
    nameEn: "Toluene",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa: "Brandfarlig væske i godkendt emballage. Stabil stuvning.",
    vehicleEn: "Flammable liquid in approved packaging. Stable stowage.",
    handlingDa: "Undgå indånding. God ventilation. Ingen gnister.",
    handlingEn: "Avoid inhalation. Good ventilation. No sparks.",
    spillDa: "Absorber. Udluft. Undgå kloak.",
    spillEn: "Absorb. Ventilate. Keep out of drains.",
    fireDa: "Skum, pulver, CO₂.",
    fireEn: "Foam, powder, CO₂.",
    ppeDa: "Handsker, øjenværn, åndedrætsværn ved dampe.",
    ppeEn: "Gloves, eye protection, respirator for vapours.",
    notesDa: "Opløsningsmiddel. Sundhedsfare ved længere eksponering.",
    notesEn: "Solvent. Health hazard with prolonged exposure.",
  }),
  e({
    un: "1760",
    nameDa: "Ætsende væske, n.o.s.",
    nameEn: "Corrosive liquid, n.o.s.",
    hazardClass: "8",
    classificationCode: "C9",
    packingGroup: "II",
    labels: "8",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Emballage opretstående, syrefast underlag/opsamling hvis muligt. Adskil fra stoffer der reagerer (fx baser vs syrer, cyanider).",
    vehicleEn:
      "Packaging upright, acid-resistant tray/secondary containment if possible. Separate from reactive partners (e.g. acids vs bases, cyanides).",
    handlingDa: "Teknisk navn kræves ofte (SP 274). Tjek blandbarhed før samlæsning.",
    handlingEn: "Technical name often required (SP 274). Check compatibility before mixed loading.",
    spillDa: "Absorber med egnet materiale. Neutraliser kun efter anvisning. Skyl ikke i kloak.",
    spillEn: "Absorb with suitable material. Neutralize only as directed. Do not flush to drains.",
    fireDa: "Køl emballage. Undgå vand på nogle stoffer (tjek SDS).",
    fireEn: "Cool packaging. Avoid water on some substances (check SDS).",
    ppeDa: "Kemikaliedragt/-handsker, ansigtsskærm, støvler.",
    ppeEn: "Chemical suit/gloves, face shield, boots.",
    notesDa: "n.o.s. kræver korrekt teknisk navn i dokumenter.",
    notesEn: "n.o.s. needs the correct technical name on documents.",
  }),
  e({
    un: "1789",
    nameDa: "Saltsyre",
    nameEn: "Hydrochloric acid",
    hazardClass: "8",
    classificationCode: "C1",
    packingGroup: "II",
    labels: "8",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Opretstående dunke/IBC. Syrefast opsamling. Hold adskilt fra baser, cyanider og metalpulver.",
    vehicleEn:
      "Upright jerrycans/IBCs. Acid-resistant containment. Keep apart from bases, cyanides, and metal powders.",
    handlingDa: "Undgå metal der kan korrodere. God ventilation for dampe.",
    handlingEn: "Avoid metals that can corrode. Good ventilation for vapours.",
    spillDa: "Absorber. Neutraliser forsigtigt med egnet base hvis anvist. Skyl ikke ukontrolleret i afløb.",
    spillEn: "Absorb. Neutralize carefully with a suitable base if directed. Do not flush uncontrolled to drains.",
    fireDa: "Ikke brandfarlig, men dampe/ætsning. Køl emballage.",
    fireEn: "Not flammable, but vapours/corrosion. Cool packaging.",
    ppeDa: "Syrebestandige handsker, ansigtsskærm, forklæde, støvler.",
    ppeEn: "Acid-resistant gloves, face shield, apron, boots.",
    notesDa: "Koncentration påvirker PG (II/III).",
    notesEn: "Concentration affects packing group (II/III).",
  }),
  e({
    un: "1824",
    nameDa: "Natriumhydroxidopløsning",
    nameEn: "Sodium hydroxide solution",
    hazardClass: "8",
    classificationCode: "C5",
    packingGroup: "II",
    labels: "8",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Basisk ætsende. Opretstående emballage. Adskil fra syrer og aluminium hvis relevant.",
    vehicleEn:
      "Alkaline corrosive. Upright packaging. Separate from acids and aluminium if relevant.",
    handlingDa: "Undgå hud/øjne. Ved fortynding: syre i vand? Nej, her base, tilsæt forsigtigt efter SDS.",
    handlingEn: "Avoid skin/eyes. Dilute carefully per SDS.",
    spillDa: "Absorber. Neutraliser med egnet syre kun efter anvisning. Masser af vand på hud efter kontakt (skylle).",
    spillEn: "Absorb. Neutralize with a suitable acid only as directed. Flush skin with plenty of water after contact.",
    fireDa: "Ikke brandfarlig. Køl emballage.",
    fireEn: "Not flammable. Cool packaging.",
    ppeDa: "Alkali-bestandige handsker, ansigtsskærm, forklæde.",
    ppeEn: "Alkali-resistant gloves, face shield, apron.",
    notesDa: "Også kaldet lud. PG afhænger af koncentration.",
    notesEn: "Also called caustic soda solution. PG depends on concentration.",
  }),
  e({
    un: "1830",
    nameDa: "Svovlsyre",
    nameEn: "Sulphuric acid",
    hazardClass: "8",
    classificationCode: "C1",
    packingGroup: "II",
    labels: "8",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Stærkt ætsende. Syrefast emballage og opsamling. Hold væk fra organiske stoffer og baser.",
    vehicleEn:
      "Strongly corrosive. Acid-resistant packaging and containment. Keep away from organics and bases.",
    handlingDa: "Ved fortynding: syre i vand, aldrig omvendt. Kraftig varmeudvikling.",
    handlingEn: "When diluting: acid into water, never the reverse. Strong heat release.",
    spillDa: "Absorber med inert materiale. Neutraliser forsigtigt. Stor varme ved kontakt med vand.",
    spillEn: "Absorb with inert material. Neutralize carefully. Much heat on contact with water.",
    fireDa: "Kan reagere med mange stoffer. Køl emballage. Undgå ukontrolleret vand på koncentreret syre.",
    fireEn: "Can react with many substances. Cool packaging. Avoid uncontrolled water on concentrated acid.",
    ppeDa: "Syrefast dragt, handsker, ansigtsskærm, støvler.",
    ppeEn: "Acid-resistant suit, gloves, face shield, boots.",
    notesDa: "Batterisyre kan være UN 2796.",
    notesEn: "Battery acid may be UN 2796.",
  }),
  e({
    un: "1845",
    nameDa: "Carbondioxid, fast (tøris)",
    nameEn: "Carbon dioxide, solid (dry ice)",
    hazardClass: "9",
    classificationCode: "M11",
    packingGroup: "III",
    labels: "9",
    tunnelCode: "E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Ventileret lastrum. Emballage der kan slippe gas ud. Undgå tæt tillukket kasse uden ventilation.",
    vehicleEn:
      "Ventilated cargo space. Packaging that can vent gas. Avoid a tightly sealed box without ventilation.",
    handlingDa: "Kuldeskader. Brug handsker. Dampe fortrænger ilt.",
    handlingEn: "Cold burns. Use gloves. Vapour displaces oxygen.",
    spillDa: "Udluft. Undgå lukkede kældre/rum. Lad sublimere under kontrol.",
    spillEn: "Ventilate. Avoid closed basements/rooms. Allow controlled sublimation.",
    fireDa: "Ikke brandfarlig. Køl omgivelser hvis nødvendigt.",
    fireEn: "Not flammable. Cool surroundings if needed.",
    ppeDa: "Kuldehandsker, øjenværn.",
    ppeEn: "Cold gloves, eye protection.",
    notesDa: "Ofte brugt til kølekæde. Marker clearly på emballage.",
    notesEn: "Often used in cold chain. Mark packaging clearly.",
  }),
  e({
    un: "1863",
    nameDa: "Brændstof til turbinemotorer",
    nameEn: "Fuel, aviation, turbine engine",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "5 L",
    exceptedQuantity: "E2",
    vehicleDa: "Brandfarlig jetfuel-type. Emballage/tank efter ADR. Stabil stuvning.",
    vehicleEn: "Flammable jet-fuel type. Packaging/tank per ADR. Stable stowage.",
    handlingDa: "Som andre brandfarlige væsker. Tjek PG (I/II/III) for det konkrete produkt.",
    handlingEn: "Like other flammable liquids. Check PG (I/II/III) for the specific product.",
    spillDa: "Absorber. Miljøbeskyttelse. Fjern tændkilder.",
    spillEn: "Absorb. Protect the environment. Remove ignition sources.",
    fireDa: "Skum, pulver, CO₂.",
    fireEn: "Foam, powder, CO₂.",
    ppeDa: "Handsker, øjenværn, antistatisk tøj.",
    ppeEn: "Gloves, eye protection, antistatic clothing.",
    notesDa: "PG kan variere. Bekræft i dokument/SDS.",
    notesEn: "PG can vary. Confirm in documents/SDS.",
  }),
  e({
    un: "1950",
    nameDa: "Aerosoler",
    nameEn: "Aerosols",
    hazardClass: "2.1",
    classificationCode: "5F",
    packingGroup: null,
    labels: "2.1",
    tunnelCode: "D",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E0",
    vehicleDa:
      "Beskyt mod varme og knusning. Ofte i karton på palle. Undgå over 50 °C i lastrum hvis muligt.",
    vehicleEn:
      "Protect from heat and crushing. Often cartons on a pallet. Avoid over 50 °C in the cargo space if possible.",
    handlingDa: "Brandfarlige drivgasser mulige. Ikke punktere. Klasse kan også være 2.2 for ikke-brandfarlige.",
    handlingEn: "Flammable propellants possible. Do not puncture. Class may also be 2.2 for non-flammable.",
    spillDa: "Ventiler. Fjern tændkilder. Saml dåser der lækker forsigtigt.",
    spillEn: "Ventilate. Remove ignition sources. Collect leaking cans carefully.",
    fireDa: "Køl. Eksplosionsfare for dåser i brand.",
    fireEn: "Cool. Cans in a fire can explode.",
    ppeDa: "Handsker, øjenværn.",
    ppeEn: "Gloves, eye protection.",
    notesDa: "Meget almindelig i stykgods. Tjek om 2.1 eller 2.2.",
    notesEn: "Very common in general cargo. Check whether 2.1 or 2.2.",
  }),
  e({
    un: "1965",
    nameDa: "Kulbrintegasblanding, flydende, n.o.s.",
    nameEn: "Hydrocarbon gas mixture, liquefied, n.o.s.",
    hazardClass: "2.1",
    classificationCode: "2F",
    packingGroup: null,
    labels: "2.1",
    tunnelCode: "B/D",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa: "Brandfarlig gas. Teknisk navn kræves. Flasker/tank sikret.",
    vehicleEn: "Flammable gas. Technical name required. Secure cylinders/tank.",
    handlingDa: "Som LPG-type gods. Ingen gnister. Lækagetjek.",
    handlingEn: "Like LPG-type goods. No sparks. Leak checks.",
    spillDa: "Fjern tændkilder. Udluft lavpunkter. Evakuér ved større lækage.",
    spillEn: "Remove ignition sources. Ventilate low points. Evacuate on larger leaks.",
    fireDa: "Køl beholdere. Eksplosionsfare.",
    fireEn: "Cool receptacles. Explosion risk.",
    ppeDa: "Antistatisk tøj, handsker, øjenværn.",
    ppeEn: "Antistatic clothing, gloves, eye protection.",
    notesDa: "n.o.s. med teknisk navn i transportpapirer.",
    notesEn: "n.o.s. with technical name on transport documents.",
  }),
  e({
    un: "1978",
    nameDa: "Propan",
    nameEn: "Propane",
    hazardClass: "2.1",
    classificationCode: "2F",
    packingGroup: null,
    labels: "2.1",
    tunnelCode: "B/D",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa: "Brandfarlig gas på flaske/tank. Fastgør flasker. Væk fra tændkilder.",
    vehicleEn: "Flammable gas in cylinders/tank. Secure cylinders. Away from ignition sources.",
    handlingDa: "Åbn ventiler langsomt. Ingen rygning. Kontroller slanger og koblinger.",
    handlingEn: "Open valves slowly. No smoking. Check hoses and couplings.",
    spillDa: "Dampe tungere end luft. Udluft lavt. Fjern tændkilder.",
    spillEn: "Vapour heavier than air. Ventilate low areas. Remove ignition sources.",
    fireDa: "Køl flasker. Luk tilførsel hvis muligt.",
    fireEn: "Cool cylinders. Shut off supply if possible.",
    ppeDa: "Antistatisk tøj, handsker, øjenværn.",
    ppeEn: "Antistatic clothing, gloves, eye protection.",
    notesDa: "Relateret til UN 1075 for blandinger.",
    notesEn: "Related to UN 1075 for mixtures.",
  }),
  e({
    un: "1993",
    nameDa: "Brandfarlig væske, n.o.s.",
    nameEn: "Flammable liquid, n.o.s.",
    hazardClass: "3",
    classificationCode: "F1",
    packingGroup: "II",
    labels: "3",
    tunnelCode: "D/E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa: "Generel brandfarlig væske. Teknisk navn kræves. Stabil stuvning.",
    vehicleEn: "General flammable liquid. Technical name required. Stable stowage.",
    handlingDa: "Følg SDS. PG I/II/III afgør strenghed.",
    handlingEn: "Follow the SDS. PG I/II/III sets how strict the rules are.",
    spillDa: "Absorber. Fjern tændkilder. Undgå kloak.",
    spillEn: "Absorb. Remove ignition sources. Keep out of drains.",
    fireDa: "Skum/pulver/CO₂ efter stof.",
    fireEn: "Foam/powder/CO₂ depending on the substance.",
    ppeDa: "Handsker, øjenværn, antistatisk tøj.",
    ppeEn: "Gloves, eye protection, antistatic clothing.",
    notesDa: "Bruges når et mere specifikt UN ikke passer. Kræver teknisk navn.",
    notesEn: "Used when a more specific UN does not fit. Needs a technical name.",
  }),
  e({
    un: "2014",
    nameDa: "Hydrogenperoxid, vandig opløsning",
    nameEn: "Hydrogen peroxide, aqueous solution",
    hazardClass: "5.1",
    classificationCode: "OC1",
    packingGroup: "II",
    labels: "5.1 + 8",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa:
      "Oxidationsmiddel. Hold adskilt fra brændbare stoffer. Ren emballage. Undgå forurening.",
    vehicleEn:
      "Oxidizer. Keep apart from combustibles. Clean packaging. Avoid contamination.",
    handlingDa: "Kan nedbrydes og danne ilt/varme. Brug kun rene redskaber.",
    handlingEn: "Can decompose and release oxygen/heat. Use only clean tools.",
    spillDa: "Fortynd med meget vand hvis anvist. Undgå organiske materialer. Absorber ikke med savsmuld.",
    spillEn: "Dilute with plenty of water if directed. Avoid organic materials. Do not absorb with sawdust.",
    fireDa: "Øger brandintensitet. Køl. Brug meget vand.",
    fireEn: "Increases fire intensity. Cool. Use plenty of water.",
    ppeDa: "Handsker, øjenværn, forklæde.",
    ppeEn: "Gloves, eye protection, apron.",
    notesDa: "Koncentration afgør klasse/PG. Stærke opløsninger er farligere.",
    notesEn: "Concentration decides class/PG. Stronger solutions are more hazardous.",
  }),
  e({
    un: "2187",
    nameDa: "Carbondioxid, kølet flydende",
    nameEn: "Carbon dioxide, refrigerated liquid",
    hazardClass: "2.2",
    classificationCode: "3A",
    packingGroup: null,
    labels: "2.2",
    tunnelCode: "C/E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa: "Kryogen væske. Ventilation. Holdes i godkendte kryobeholdere. Kulde- og kvælningsfare.",
    vehicleEn: "Cryogenic liquid. Ventilation. Approved cryogenic receptacles. Cold and asphyxiation hazards.",
    handlingDa: "Ekstrem kulde. Ansigt/hænder beskyttet. Undgå indelukkede rum.",
    handlingEn: "Extreme cold. Protect face/hands. Avoid confined spaces.",
    spillDa: "Udluft grundigt. Iltmangel. Hold afstand til dampsky.",
    spillEn: "Ventilate thoroughly. Oxygen deficiency. Keep clear of the vapour cloud.",
    fireDa: "Ikke brandfarlig. Køl udstyr.",
    fireEn: "Not flammable. Cool equipment.",
    ppeDa: "Kryohandsker, ansigtsskærm, lukket fodtøj.",
    ppeEn: "Cryo gloves, face shield, closed footwear.",
    notesDa: "Forskellig fra tøris (UN 1845).",
    notesEn: "Different from dry ice (UN 1845).",
  }),
  e({
    un: "2794",
    nameDa: "Batterier, våde, fyldt med syre",
    nameEn: "Batteries, wet, filled with acid",
    hazardClass: "8",
    classificationCode: "C11",
    packingGroup: null,
    labels: "8",
    tunnelCode: "E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "1 L",
    exceptedQuantity: "E0",
    vehicleDa:
      "Opretstående. Beskyt terminaler mod kortslutning. Syrebestandig opsamling under batterier.",
    vehicleEn:
      "Upright. Protect terminals against short circuit. Acid-resistant tray under batteries.",
    handlingDa: "Undgå tipning. Isoler poler. Ingen metalværktøj der kan kortslutte.",
    handlingEn: "Avoid tipping. Insulate poles. No metal tools that can short-circuit.",
    spillDa: "Syrespild: absorber, neutraliser forsigtigt. Undgå hudkontakt.",
    spillEn: "Acid spill: absorb, neutralize carefully. Avoid skin contact.",
    fireDa: "Eksplosiv gas (hydrogen) mulig ved ladning. Ventiler. Køl.",
    fireEn: "Explosive gas (hydrogen) possible when charging. Ventilate. Cool.",
    ppeDa: "Syrehandsker, øjenværn, forklæde.",
    ppeEn: "Acid gloves, eye protection, apron.",
    notesDa: "Lithiumbatterier er andre UN-numre (fx 3480).",
    notesEn: "Lithium batteries use other UN numbers (e.g. 3480).",
  }),
  e({
    un: "2796",
    nameDa: "Batterisyre, flydende",
    nameEn: "Battery fluid, acid",
    hazardClass: "8",
    classificationCode: "C1",
    packingGroup: "II",
    labels: "8",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa: "Ætsende væske. Opretstående, tæt emballage. Syrefast opsamling.",
    vehicleEn: "Corrosive liquid. Upright, tight packaging. Acid-resistant containment.",
    handlingDa: "Som fortyndet svovlsyre. Undgå metaller der korroderer.",
    handlingEn: "Like dilute sulphuric acid. Avoid metals that corrode.",
    spillDa: "Absorber. Neutraliser forsigtigt. Skyl hud med vand.",
    spillEn: "Absorb. Neutralize carefully. Flush skin with water.",
    fireDa: "Ikke brandfarlig. Køl emballage.",
    fireEn: "Not flammable. Cool packaging.",
    ppeDa: "Syrehandsker, ansigtsskærm.",
    ppeEn: "Acid gloves, face shield.",
    notesDa: "Bruges til batterivæske separat fra batterier.",
    notesEn: "Used for battery fluid separate from batteries.",
  }),
  e({
    un: "3077",
    nameDa: "Miljøfarligt stof, fast, n.o.s.",
    nameEn: "Environmentally hazardous substance, solid, n.o.s.",
    hazardClass: "9",
    classificationCode: "M7",
    packingGroup: "III",
    labels: "9",
    tunnelCode: "E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "5 kg",
    exceptedQuantity: "E1",
    vehicleDa:
      "Ofte sække/IBC. Hold tørt. Undgå støvspredning. Markering for miljøfare når krævet.",
    vehicleEn:
      "Often bags/IBCs. Keep dry. Avoid dust spread. Environmentally hazardous marking when required.",
    handlingDa: "Teknisk navn. Undgå udslip til jord/vand.",
    handlingEn: "Technical name. Avoid release to soil/water.",
    spillDa: "Fej/støvsug forsigtigt. Undgå afløb. Affald som farligt/miljøfarligt.",
    spillEn: "Sweep/vacuum carefully. Keep out of drains. Waste as hazardous/environmentally hazardous.",
    fireDa: "Afhænger af stoffet. Generelt undgå spredning til miljø.",
    fireEn: "Depends on the substance. Generally avoid spread to the environment.",
    ppeDa: "Handsker, støvmaske hvis støvende, øjenværn.",
    ppeEn: "Gloves, dust mask if dusty, eye protection.",
    notesDa: "Meget brugt til pesticider/kemikalier med miljøfare.",
    notesEn: "Often used for pesticides/chemicals with environmental hazard.",
  }),
  e({
    un: "3082",
    nameDa: "Miljøfarligt stof, flydende, n.o.s.",
    nameEn: "Environmentally hazardous substance, liquid, n.o.s.",
    hazardClass: "9",
    classificationCode: "M6",
    packingGroup: "III",
    labels: "9",
    tunnelCode: "E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "5 L",
    exceptedQuantity: "E1",
    vehicleDa:
      "Dunke/IBC opretstående. Opsamling under. Undgå lækage til vej og vandløb.",
    vehicleEn:
      "Jerrycans/IBCs upright. Secondary containment. Avoid leaks to road and waterways.",
    handlingDa: "Teknisk navn kræves. Tjek om det også har anden klasse.",
    handlingEn: "Technical name required. Check whether another class also applies.",
    spillDa: "Absorber. Spær afløb. Indrapporter større miljøudslip efter lokale regler.",
    spillEn: "Absorb. Block drains. Report larger environmental releases per local rules.",
    fireDa: "Afhænger af indhold. Prioritér miljøbeskyttelse ved slukning.",
    fireEn: "Depends on contents. Prioritize environmental protection when extinguishing.",
    ppeDa: "Handsker, øjenværn, forklæde.",
    ppeEn: "Gloves, eye protection, apron.",
    notesDa: "Klassisk “fisk-og-træ”-mærke når kravene gælder.",
    notesEn: "Classic fish-and-tree mark when the requirements apply.",
  }),
  e({
    un: "3090",
    nameDa: "Lithiummetalbatterier",
    nameEn: "Lithium metal batteries",
    hazardClass: "9",
    classificationCode: "M4",
    packingGroup: null,
    labels: "9A",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Beskyt mod kortslutning og knusning. Ofte forbud/begrænsninger i passagerfly. På vej: følg emballageinstruktioner og SoC-krav hvor relevant.",
    vehicleEn:
      "Protect from short circuit and crushing. Often restricted on passenger aircraft. On road: follow packing instructions and SoC rules where relevant.",
    handlingDa: "Ikke beskadigede batterier. Isoler poler. Undgå stabling der knuser celler.",
    handlingEn: "No damaged batteries. Insulate terminals. Avoid stacking that crushes cells.",
    spillDa: "Ved lækage/brand: evakuér røg. Specialt slukningsudstyr. Undgå metalstøv-kontakt.",
    spillEn: "On leak/fire: evacuate smoke. Special extinguishing equipment. Avoid metal-dust contact.",
    fireDa: "Lithiumbrand er vanskelig. Meget vand / specialslukker efter anvisning. Isolér fra andre batterier.",
    fireEn: "Lithium fires are hard. Plenty of water / special extinguisher as directed. Isolate from other batteries.",
    ppeDa: "Handsker, øjenværn, åndedrætsværn ved røg.",
    ppeEn: "Gloves, eye protection, respirator for smoke.",
    notesDa: "Skeln mellem 3090 (metal), 3091 (i/med udstyr), 3480/3481 (Li-ion).",
    notesEn: "Distinguish 3090 (metal), 3091 (in/with equipment), 3480/3481 (Li-ion).",
  }),
  e({
    un: "3480",
    nameDa: "Lithiumionbatterier",
    nameEn: "Lithium ion batteries",
    hazardClass: "9",
    classificationCode: "M4",
    packingGroup: null,
    labels: "9A",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Poler beskyttet, stærk ydre emballage, undgå knusning. Beskadigede/defekte batterier har skærpede regler.",
    vehicleEn:
      "Protected terminals, strong outer packaging, avoid crushing. Damaged/defective batteries have stricter rules.",
    handlingDa: "Følg emballageinstruktion P903 m.fl. State of charge begrænsninger kan gælde.",
    handlingEn: "Follow packing instruction P903 and related rules. State-of-charge limits may apply.",
    spillDa: "Termisk runaway: hold afstand, køl med meget vand hvis anvist, adskil fra last.",
    spillEn: "Thermal runaway: keep clear, cool with plenty of water if directed, separate from cargo.",
    fireDa: "Kan genantænde. Langvarig køling. Informér beredskab om lithium.",
    fireEn: "Can reignite. Prolonged cooling. Tell responders it is lithium.",
    ppeDa: "Handsker, øjenværn, åndedrætsværn ved røg.",
    ppeEn: "Gloves, eye protection, respirator for smoke.",
    notesDa: "Et af de mest kontrollerede stykgods-områder. Tjek aktuelle ADR/IATA-tillæg.",
    notesEn: "One of the most controlled general-cargo topics. Check current ADR/IATA addenda.",
  }),
  e({
    un: "3481",
    nameDa: "Lithiumionbatterier i udstyr eller med udstyr",
    nameEn: "Lithium ion batteries contained in equipment or packed with equipment",
    hazardClass: "9",
    classificationCode: "M4",
    packingGroup: null,
    labels: "9A",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Udstyr sikret mod tænding og bevægelse. Batterier beskyttet inden i/udenpå udstyr efter instruktion.",
    vehicleEn:
      "Secure equipment against switching on and movement. Protect batteries in/with equipment per instruction.",
    handlingDa: "Undgå at udstyr kan tændes under transport. Følg P903/P908 m.fl.",
    handlingEn: "Prevent equipment from powering on in transit. Follow P903/P908 and related rules.",
    spillDa: "Som lithiumion: køl, adskil, undgå røg.",
    spillEn: "As for lithium ion: cool, separate, avoid smoke.",
    fireDa: "Informér om batterier i udstyr. Lang køling.",
    fireEn: "Tell responders batteries are in equipment. Long cooling.",
    ppeDa: "Handsker, øjenværn, åndedrætsværn ved røg.",
    ppeEn: "Gloves, eye protection, respirator for smoke.",
    notesDa: "Bruges når batteriet sidder i eller sendes sammen med udstyr.",
    notesEn: "Used when the battery is in or packed with equipment.",
  }),
  e({
    un: "3166",
    nameDa: "Køretøj, brandfarlig væske drevet / brændstofcelle m.m.",
    nameEn: "Vehicle, flammable liquid powered / fuel cell etc.",
    hazardClass: "9",
    classificationCode: "M11",
    packingGroup: null,
    labels: "9",
    tunnelCode: "E",
    transportCategory: 3,
    exemptionLimit: 1000,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Køretøjer på lastbil/trailer: sikret mod rulle, brændstofniveau efter regler, batteri afbrudt hvis krævet.",
    vehicleEn:
      "Vehicles on a truck/trailer: secured against rolling, fuel level per rules, battery disconnected if required.",
    handlingDa: "Tjek særlige bestemmelser for hybrider/el/brændstof. Lækagetjek.",
    handlingEn: "Check special provisions for hybrid/EV/fuel types. Leak checks.",
    spillDa: "Olie/benzin: som brandfarlig væske + miljø. El: batteriprocedurer.",
    spillEn: "Oil/petrol: as flammable liquid + environment. EV: battery procedures.",
    fireDa: "Afhænger af drivlinje. Elbiler: lithiumprocedurer.",
    fireEn: "Depends on drivetrain. EVs: lithium procedures.",
    ppeDa: "Efter situation (olie vs batteri).",
    ppeEn: "Per situation (oil vs battery).",
    notesDa: "Komplekst UN med mange SP. Læs den konkrete variant.",
    notesEn: "Complex UN with many special provisions. Read the exact variant.",
  }),
  e({
    un: "3264",
    nameDa: "Ætsende væske, sur, uorganisk, n.o.s.",
    nameEn: "Corrosive liquid, acidic, inorganic, n.o.s.",
    hazardClass: "8",
    classificationCode: "C1",
    packingGroup: "II",
    labels: "8",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa: "Syrer. Opretstående, opsamling, adskilt fra baser.",
    vehicleEn: "Acids. Upright, containment, separated from bases.",
    handlingDa: "Teknisk navn. Tjek kompatibilitet.",
    handlingEn: "Technical name. Check compatibility.",
    spillDa: "Absorber. Neutraliser forsigtigt. Undgå kloak.",
    spillEn: "Absorb. Neutralize carefully. Keep out of drains.",
    fireDa: "Køl. Undgå ukritisk vand på nogle koncentrater.",
    fireEn: "Cool. Avoid uncritical water on some concentrates.",
    ppeDa: "Syre-PPE: handsker, ansigtsskærm, forklæde.",
    ppeEn: "Acid PPE: gloves, face shield, apron.",
    notesDa: "n.o.s. for sure uorganiske væsker.",
    notesEn: "n.o.s. for acidic inorganic liquids.",
  }),
  e({
    un: "3266",
    nameDa: "Ætsende væske, basisk, uorganisk, n.o.s.",
    nameEn: "Corrosive liquid, basic, inorganic, n.o.s.",
    hazardClass: "8",
    classificationCode: "C5",
    packingGroup: "II",
    labels: "8",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "1 L",
    exceptedQuantity: "E2",
    vehicleDa: "Baser. Opretstående, adskilt fra syrer.",
    vehicleEn: "Bases. Upright, separated from acids.",
    handlingDa: "Teknisk navn. Undgå aluminium hvor relevant.",
    handlingEn: "Technical name. Avoid aluminium where relevant.",
    spillDa: "Absorber. Neutraliser forsigtigt. Skyl hud.",
    spillEn: "Absorb. Neutralize carefully. Flush skin.",
    fireDa: "Køl emballage.",
    fireEn: "Cool packaging.",
    ppeDa: "Alkali-PPE.",
    ppeEn: "Alkali PPE.",
    notesDa: "n.o.s. for basiske uorganiske væsker.",
    notesEn: "n.o.s. for basic inorganic liquids.",
  }),
  e({
    un: "3291",
    nameDa: "Klinisk affald, uspecificeret, n.o.s.",
    nameEn: "Clinical waste, unspecified, n.o.s.",
    hazardClass: "6.2",
    classificationCode: "I3",
    packingGroup: "II",
    labels: "6.2",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Lukkede, godkendte emballager. Adskilt fra fødevarer. Let at rengøre lastrum.",
    vehicleEn:
      "Closed, approved packaging. Separated from foodstuffs. Easy-to-clean cargo space.",
    handlingDa: "Undgå stik og lækage. Kun autoriseret affaldskæde.",
    handlingEn: "Avoid sharps and leaks. Authorized waste chain only.",
    spillDa: "Afspær. Desinficér efter procedure. Brug skarpe-beholdere korrekt.",
    spillEn: "Cord off. Disinfect per procedure. Use sharps containers correctly.",
    fireDa: "Undgå røg. Informér om smittefare.",
    fireEn: "Avoid smoke. Inform about infection risk.",
    ppeDa: "Handsker, kitler, øjenværn, evt. åndedrætsværn.",
    ppeEn: "Gloves, gowns, eye protection, respirator if needed.",
    notesDa: "Sundhedsfarligt gods. Nationale sundhedsregler oveni ADR.",
    notesEn: "Infectious substance rules. National health rules on top of ADR.",
  }),
  e({
    un: "3373",
    nameDa: "Biologisk stof, kategori B",
    nameEn: "Biological substance, Category B",
    hazardClass: "6.2",
    classificationCode: "I3",
    packingGroup: null,
    labels: "6.2",
    tunnelCode: "E",
    transportCategory: 2,
    exemptionLimit: 333,
    limitedQuantity: "0",
    exceptedQuantity: "E0",
    vehicleDa:
      "Tripel-emballage (P650). Markering “BIOLOGICAL SUBSTANCE, CATEGORY B”. Orientering tydelig.",
    vehicleEn:
      "Triple packaging (P650). Marked “BIOLOGICAL SUBSTANCE, CATEGORY B”. Orientation clear.",
    handlingDa: "Følg P650 stramt. Ingen beskadiget emballage.",
    handlingEn: "Follow P650 strictly. No damaged packaging.",
    spillDa: "Afspær. Desinficér. Kontakt afsender/laboratorium.",
    spillEn: "Cord off. Disinfect. Contact shipper/lab.",
    fireDa: "Informér om biologisk materiale.",
    fireEn: "Inform about biological material.",
    ppeDa: "Handsker, øjenværn, kitler.",
    ppeEn: "Gloves, eye protection, gowns.",
    notesDa: "Prøver til laboratorier. Kategori A er strengere (UN 2814/2900).",
    notesEn: "Lab specimens. Category A is stricter (UN 2814/2900).",
  }),
];

export function formatUn(un: string): string {
  const digits = un.replace(/\D/g, "").padStart(4, "0").slice(-4);
  return digits;
}

export function searchUn(query: string, limit = 40): UnEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const digits = q.replace(/\D/g, "");
  const scored: { row: UnEntry; score: number }[] = [];

  for (const row of UN_ENTRIES) {
    const un = row.un;
    const nameDa = row.nameDa.toLowerCase();
    const nameEn = row.nameEn.toLowerCase();
    const cls = row.hazardClass.toLowerCase();
    let score = -1;

    if (digits) {
      if (un.startsWith(digits)) score = 200 - (un.length - digits.length);
      else if (un.includes(digits)) score = 120;
    }
    if (nameDa.startsWith(q) || nameEn.startsWith(q)) score = Math.max(score, 90);
    else if (nameDa.includes(q) || nameEn.includes(q)) score = Math.max(score, 70);
    else if (cls === q || `klasse ${cls}` === q || `class ${cls}` === q) {
      score = Math.max(score, 50);
    } else if (row.labels.toLowerCase().includes(q)) score = Math.max(score, 40);

    if (score >= 0) scored.push({ row, score });
  }

  scored.sort(
    (a, b) => b.score - a.score || a.row.un.localeCompare(b.row.un),
  );
  return scored.slice(0, limit).map((s) => s.row);
}

export function getUn(un: string): UnEntry | undefined {
  const id = formatUn(un);
  return UN_ENTRIES.find((r) => r.un === id);
}
