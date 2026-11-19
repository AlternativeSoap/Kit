export type Atom = {
  el: string;
  x: number;
  y: number;
  z: number;
};

export type Bond = { a: number; b: number; order?: 1 | 2 | 3 };

export type Molecule = {
  id: string;
  formula: string;
  nameDa: string;
  nameEn: string;
  molarMass: number;
  aboutDa: string;
  aboutEn: string;
  usesDa: string;
  usesEn: string;
  atoms: Atom[];
  bonds: Bond[];
  /** Optional 2D sketch: atom index → planar xy (normalized). */
  sketch2d?: { x: number; y: number }[];
};

const ATOM_COLORS: Record<string, string> = {
  H: "#e8e8e8",
  C: "#3a3a3a",
  O: "#e04848",
  N: "#3b6fd8",
  Cl: "#3db86a",
  Na: "#9b59d0",
  S: "#e0c040",
  P: "#e08030",
  Fe: "#b07040",
  Ca: "#80c080",
  Mg: "#8ac070",
  K: "#a060d0",
  F: "#70d0c0",
};

const ATOM_RADIUS: Record<string, number> = {
  H: 0.35,
  C: 0.55,
  O: 0.5,
  N: 0.5,
  Cl: 0.65,
  Na: 0.75,
  S: 0.6,
  P: 0.6,
  Fe: 0.7,
  Ca: 0.8,
  Mg: 0.7,
  K: 0.85,
  F: 0.45,
};

export function atomColor(el: string): string {
  return ATOM_COLORS[el] ?? "#888888";
}

export function atomRadius(el: string): number {
  return ATOM_RADIUS[el] ?? 0.5;
}

export const MOLECULES: Molecule[] = [
  {
    id: "h2o",
    formula: "H₂O",
    nameDa: "Vand",
    nameEn: "Water",
    molarMass: 18.015,
    aboutDa: "Det mest almindelige molekyle på Jordens overflade. Vinklen mellem H-O-H er omkring 104,5°.",
    aboutEn: "The most common molecule on Earth's surface. The H-O-H bond angle is about 104.5°.",
    usesDa: "Drikkevand, opløsningsmiddel, køling og næsten alle biologiske processer.",
    usesEn: "Drinking water, solvent, cooling, and almost all biological processes.",
    atoms: [
      { el: "O", x: 0, y: 0, z: 0 },
      { el: "H", x: 0.96, y: 0.26, z: 0 },
      { el: "H", x: -0.96, y: 0.26, z: 0 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
    ],
    sketch2d: [
      { x: 0, y: 0.15 },
      { x: 0.55, y: -0.35 },
      { x: -0.55, y: -0.35 },
    ],
  },
  {
    id: "co2",
    formula: "CO₂",
    nameDa: "Kuldioxid",
    nameEn: "Carbon dioxide",
    molarMass: 44.01,
    aboutDa: "Lineært molekyle. Planter bruger det til fotosyntese. Det er en vigtig drivhusgas.",
    aboutEn: "A linear molecule. Plants use it in photosynthesis. It is a major greenhouse gas.",
    usesDa: "Kulsyre i drikke, brandslukning, tøris og gødning i væksthuse.",
    usesEn: "Carbonation of drinks, fire suppression, dry ice, and greenhouse enrichment.",
    atoms: [
      { el: "C", x: 0, y: 0, z: 0 },
      { el: "O", x: 1.16, y: 0, z: 0 },
      { el: "O", x: -1.16, y: 0, z: 0 },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
    sketch2d: [
      { x: 0, y: 0 },
      { x: 0.7, y: 0 },
      { x: -0.7, y: 0 },
    ],
  },
  {
    id: "o2",
    formula: "O₂",
    nameDa: "Ilt",
    nameEn: "Oxygen",
    molarMass: 31.998,
    aboutDa: "Diatomisk gas med dobbeltbinding. Nødvendig for respiration hos de fleste dyr.",
    aboutEn: "A diatomic gas with a double bond. Required for respiration in most animals.",
    usesDa: "Åndedræt, svejsning, medicinsk oxygen og raketbrændstofoxidant.",
    usesEn: "Breathing, welding, medical oxygen, and rocket oxidizer.",
    atoms: [
      { el: "O", x: -0.6, y: 0, z: 0 },
      { el: "O", x: 0.6, y: 0, z: 0 },
    ],
    bonds: [{ a: 0, b: 1, order: 2 }],
    sketch2d: [
      { x: -0.4, y: 0 },
      { x: 0.4, y: 0 },
    ],
  },
  {
    id: "n2",
    formula: "N₂",
    nameDa: "Kvælstof",
    nameEn: "Nitrogen",
    molarMass: 28.014,
    aboutDa: "Ca. 78 % af luftens volumen. Meget stabil trippelbinding.",
    aboutEn: "About 78% of air by volume. A very stable triple bond.",
    usesDa: "Inert atmosfære, gødning (via ammoniak), køling med flydende N₂.",
    usesEn: "Inert atmosphere, fertilizers via ammonia, and liquid-N₂ cooling.",
    atoms: [
      { el: "N", x: -0.55, y: 0, z: 0 },
      { el: "N", x: 0.55, y: 0, z: 0 },
    ],
    bonds: [{ a: 0, b: 1, order: 3 }],
    sketch2d: [
      { x: -0.35, y: 0 },
      { x: 0.35, y: 0 },
    ],
  },
  {
    id: "ch4",
    formula: "CH₄",
    nameDa: "Metan",
    nameEn: "Methane",
    molarMass: 16.043,
    aboutDa: "Tetraedrisk form. Hovedbestanddel i naturgas og en kraftig drivhusgas.",
    aboutEn: "Tetrahedral shape. Main component of natural gas and a potent greenhouse gas.",
    usesDa: "Brændstof til opvarmning og el, råstof til kemikalier.",
    usesEn: "Fuel for heating and power, feedstock for chemicals.",
    atoms: [
      { el: "C", x: 0, y: 0, z: 0 },
      { el: "H", x: 0.63, y: 0.63, z: 0.63 },
      { el: "H", x: -0.63, y: -0.63, z: 0.63 },
      { el: "H", x: -0.63, y: 0.63, z: -0.63 },
      { el: "H", x: 0.63, y: -0.63, z: -0.63 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 0, b: 4 },
    ],
    sketch2d: [
      { x: 0, y: 0 },
      { x: 0.5, y: -0.45 },
      { x: -0.5, y: -0.45 },
      { x: -0.35, y: 0.5 },
      { x: 0.35, y: 0.5 },
    ],
  },
  {
    id: "nh3",
    formula: "NH₃",
    nameDa: "Ammoniak",
    nameEn: "Ammonia",
    molarMass: 17.031,
    aboutDa: "Pyramideformet. Skarp lugt. Basis i Haber-Bosch-processen til gødning.",
    aboutEn: "Pyramidal shape. Sharp smell. Basis of the Haber-Bosch process for fertilizer.",
    usesDa: "Gødning, rengøringsmidler, kølemiddel og kemisk mellemprodukt.",
    usesEn: "Fertilizer, cleaners, refrigerant, and chemical intermediate.",
    atoms: [
      { el: "N", x: 0, y: 0.2, z: 0 },
      { el: "H", x: 0.94, y: -0.2, z: 0 },
      { el: "H", x: -0.47, y: -0.2, z: 0.81 },
      { el: "H", x: -0.47, y: -0.2, z: -0.81 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
    ],
    sketch2d: [
      { x: 0, y: 0.35 },
      { x: 0.55, y: -0.25 },
      { x: -0.55, y: -0.25 },
      { x: 0, y: -0.45 },
    ],
  },
  {
    id: "glucose",
    formula: "C₆H₁₂O₆",
    nameDa: "Glukose",
    nameEn: "Glucose",
    molarMass: 180.156,
    aboutDa: "Enkel sukkerart. Cellernes primære energikilde. Ringstruktur i vandig opløsning.",
    aboutEn: "A simple sugar. Primary energy source for cells. Ring form in water.",
    usesDa: "Energi i mad, medicinske infusioner og gæring til ethanol.",
    usesEn: "Food energy, medical infusions, and fermentation to ethanol.",
    atoms: [
      { el: "C", x: 1.2, y: 0, z: 0 },
      { el: "C", x: 0.6, y: 1.04, z: 0 },
      { el: "C", x: -0.6, y: 1.04, z: 0 },
      { el: "C", x: -1.2, y: 0, z: 0 },
      { el: "C", x: -0.6, y: -1.04, z: 0 },
      { el: "O", x: 0.6, y: -1.04, z: 0 },
      { el: "O", x: 2.1, y: 0, z: 0.5 },
      { el: "O", x: 0.9, y: 2.0, z: -0.4 },
      { el: "O", x: -0.9, y: 2.0, z: 0.4 },
      { el: "O", x: -2.1, y: 0, z: -0.5 },
      { el: "O", x: -0.9, y: -2.0, z: 0.3 },
      { el: "C", x: 1.9, y: -0.3, z: -1.1 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
      { a: 4, b: 5 },
      { a: 5, b: 0 },
      { a: 0, b: 6 },
      { a: 1, b: 7 },
      { a: 2, b: 8 },
      { a: 3, b: 9 },
      { a: 4, b: 10 },
      { a: 0, b: 11 },
    ],
    sketch2d: [
      { x: 0.55, y: 0 },
      { x: 0.28, y: 0.48 },
      { x: -0.28, y: 0.48 },
      { x: -0.55, y: 0 },
      { x: -0.28, y: -0.48 },
      { x: 0.28, y: -0.48 },
      { x: 0.85, y: 0.15 },
      { x: 0.45, y: 0.75 },
      { x: -0.45, y: 0.75 },
      { x: -0.85, y: 0.15 },
      { x: -0.45, y: -0.75 },
      { x: 0.75, y: -0.25 },
    ],
  },
  {
    id: "nacl",
    formula: "NaCl",
    nameDa: "Natriumsalt",
    nameEn: "Sodium chloride",
    molarMass: 58.44,
    aboutDa: "Ionisk forbindelse. Danner kubisk krystalgitter. Opløses let i vand.",
    aboutEn: "Ionic compound. Forms a cubic crystal lattice. Dissolves readily in water.",
    usesDa: "Bordssalt, konservering, vejsalt og elektrolyse til klor og natriumhydroxid.",
    usesEn: "Table salt, food preservation, road salt, and electrolysis feedstock.",
    atoms: [
      { el: "Na", x: -0.9, y: 0, z: 0 },
      { el: "Cl", x: 0.9, y: 0, z: 0 },
    ],
    bonds: [{ a: 0, b: 1 }],
    sketch2d: [
      { x: -0.4, y: 0 },
      { x: 0.4, y: 0 },
    ],
  },
  {
    id: "ethanol",
    formula: "C₂H₅OH",
    nameDa: "Ethanol",
    nameEn: "Ethanol",
    molarMass: 46.068,
    aboutDa: "Alkohol i drikkevarer. Også opløsningsmiddel og brændstofadditiv.",
    aboutEn: "The alcohol in beverages. Also a solvent and fuel additive.",
    usesDa: "Drikkevarer, desinfektion, brændstof og ekstraktion af smagsstoffer.",
    usesEn: "Beverages, disinfection, fuel, and flavor extraction.",
    atoms: [
      { el: "C", x: -1.1, y: 0, z: 0 },
      { el: "C", x: 0.2, y: 0, z: 0 },
      { el: "O", x: 0.9, y: 1.1, z: 0 },
      { el: "H", x: 1.7, y: 1.0, z: 0.3 },
      { el: "H", x: -1.5, y: 0.9, z: 0.5 },
      { el: "H", x: -1.5, y: -0.9, z: 0.5 },
      { el: "H", x: -1.5, y: 0, z: -1.0 },
      { el: "H", x: 0.5, y: -0.9, z: 0.7 },
      { el: "H", x: 0.5, y: -0.5, z: -0.9 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 0, b: 4 },
      { a: 0, b: 5 },
      { a: 0, b: 6 },
      { a: 1, b: 7 },
      { a: 1, b: 8 },
    ],
    sketch2d: [
      { x: -0.55, y: 0 },
      { x: 0.05, y: 0 },
      { x: 0.45, y: 0.45 },
      { x: 0.75, y: 0.35 },
      { x: -0.75, y: 0.4 },
      { x: -0.75, y: -0.4 },
      { x: -0.85, y: 0 },
      { x: 0.25, y: -0.45 },
      { x: 0.15, y: -0.25 },
    ],
  },
  {
    id: "caffeine",
    formula: "C₈H₁₀N₄O₂",
    nameDa: "Koffein",
    nameEn: "Caffeine",
    molarMass: 194.19,
    aboutDa: "Stimulerende alkaloid i kaffe, te og kakao. Forenklet ringstruktur her.",
    aboutEn: "Stimulant alkaloid in coffee, tea, and cocoa. Simplified ring geometry here.",
    usesDa: "Kaffe og te, energidrikke og medicin mod hovedpine.",
    usesEn: "Coffee and tea, energy drinks, and headache medicine.",
    atoms: [
      { el: "N", x: 0.0, y: 1.2, z: 0 },
      { el: "C", x: 1.1, y: 0.6, z: 0 },
      { el: "N", x: 1.1, y: -0.6, z: 0 },
      { el: "C", x: 0.0, y: -1.2, z: 0 },
      { el: "C", x: -1.1, y: -0.6, z: 0 },
      { el: "C", x: -1.1, y: 0.6, z: 0 },
      { el: "O", x: 2.2, y: 1.0, z: 0.2 },
      { el: "O", x: 0.0, y: -2.3, z: 0.2 },
      { el: "N", x: -2.2, y: -1.1, z: 0 },
      { el: "C", x: -2.2, y: 1.1, z: 0 },
      { el: "N", x: 2.0, y: -1.3, z: 0 },
      { el: "C", x: 2.9, y: -0.4, z: 0 },
      { el: "C", x: -3.3, y: -0.5, z: 0 },
      { el: "C", x: -3.1, y: 1.8, z: 0 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
      { a: 4, b: 5 },
      { a: 5, b: 0 },
      { a: 1, b: 6, order: 2 },
      { a: 3, b: 7, order: 2 },
      { a: 4, b: 8 },
      { a: 5, b: 9 },
      { a: 2, b: 10 },
      { a: 10, b: 11 },
      { a: 11, b: 1 },
      { a: 8, b: 12 },
      { a: 9, b: 13 },
    ],
    sketch2d: [
      { x: 0, y: 0.55 },
      { x: 0.45, y: 0.28 },
      { x: 0.45, y: -0.28 },
      { x: 0, y: -0.55 },
      { x: -0.45, y: -0.28 },
      { x: -0.45, y: 0.28 },
      { x: 0.8, y: 0.4 },
      { x: 0, y: -0.9 },
      { x: -0.85, y: -0.45 },
      { x: -0.85, y: 0.45 },
      { x: 0.8, y: -0.5 },
      { x: 1.05, y: -0.1 },
      { x: -1.2, y: -0.2 },
      { x: -1.15, y: 0.7 },
    ],
  },
  {
    id: "h2o2",
    formula: "H₂O₂",
    nameDa: "Hydrogenperoxid",
    nameEn: "Hydrogen peroxide",
    molarMass: 34.015,
    aboutDa: "Ustabil oxidant. Brydes ned til vand og ilt. Bruges fortyndet til desinfektion.",
    aboutEn: "Unstable oxidizer. Breaks down to water and oxygen. Dilute solutions disinfect.",
    usesDa: "Desinfektion, blegning og laboratorieoxidant.",
    usesEn: "Disinfection, bleaching, and lab oxidizer.",
    atoms: [
      { el: "O", x: -0.7, y: 0.2, z: 0 },
      { el: "O", x: 0.7, y: -0.2, z: 0 },
      { el: "H", x: -1.2, y: 0.9, z: 0.3 },
      { el: "H", x: 1.2, y: -0.9, z: -0.3 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
      { a: 1, b: 3 },
    ],
    sketch2d: [
      { x: -0.35, y: 0.1 },
      { x: 0.35, y: -0.1 },
      { x: -0.65, y: 0.45 },
      { x: 0.65, y: -0.45 },
    ],
  },
  {
    id: "hcl",
    formula: "HCl",
    nameDa: "Hydrogenchlorid",
    nameEn: "Hydrogen chloride",
    molarMass: 36.46,
    aboutDa: "Gas der danner saltsyre i vand. Stærk syre.",
    aboutEn: "A gas that forms hydrochloric acid in water. A strong acid.",
    usesDa: "Syrebehandling, PVC-produktion og pH-regulering.",
    usesEn: "Acid treatments, PVC production, and pH control.",
    atoms: [
      { el: "H", x: -0.85, y: 0, z: 0 },
      { el: "Cl", x: 0.55, y: 0, z: 0 },
    ],
    bonds: [{ a: 0, b: 1 }],
    sketch2d: [
      { x: -0.4, y: 0 },
      { x: 0.35, y: 0 },
    ],
  },
  {
    id: "so2",
    formula: "SO₂",
    nameDa: "Svovldioxid",
    nameEn: "Sulfur dioxide",
    molarMass: 64.066,
    aboutDa: "Bøjet molekyle. Dannes ved forbrænding af svovl. Bidrager til syreregn.",
    aboutEn: "Bent molecule. Formed when sulfur burns. Contributes to acid rain.",
    usesDa: "Konserveringsmiddel i mad, blegning og kemisk mellemprodukt.",
    usesEn: "Food preservative, bleaching, and chemical intermediate.",
    atoms: [
      { el: "S", x: 0, y: 0.2, z: 0 },
      { el: "O", x: 1.2, y: -0.4, z: 0 },
      { el: "O", x: -1.2, y: -0.4, z: 0 },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2, order: 2 },
    ],
    sketch2d: [
      { x: 0, y: 0.25 },
      { x: 0.55, y: -0.3 },
      { x: -0.55, y: -0.3 },
    ],
  },
  {
    id: "cacl2",
    formula: "CaCl₂",
    nameDa: "Calciumchlorid",
    nameEn: "Calcium chloride",
    molarMass: 110.98,
    aboutDa: "Salt der trækker vand til sig. Bruges til afisning og tørring.",
    aboutEn: "Hygroscopic salt used for de-icing and drying.",
    usesDa: "Vejsalt i frost, fugtabsorbering og fødevaretilsætning.",
    usesEn: "Road de-icing, moisture absorption, and food additive.",
    atoms: [
      { el: "Ca", x: 0, y: 0, z: 0 },
      { el: "Cl", x: 1.6, y: 0.3, z: 0 },
      { el: "Cl", x: -1.6, y: 0.3, z: 0 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
    ],
    sketch2d: [
      { x: 0, y: 0 },
      { x: 0.65, y: 0.15 },
      { x: -0.65, y: 0.15 },
    ],
  },
  {
    id: "ozone",
    formula: "O₃",
    nameDa: "Ozon",
    nameEn: "Ozone",
    molarMass: 47.998,
    aboutDa: "Bøjet triatomisk ilt. Beskytter Jorden i stratosfæren, irriterer lungerne ved jordoverfladen.",
    aboutEn: "Bent triatomic oxygen. Protects Earth in the stratosphere; irritates lungs at ground level.",
    usesDa: "Vandbehandling, desinfektion og atmosfærisk UV-beskyttelse.",
    usesEn: "Water treatment, disinfection, and atmospheric UV shielding.",
    atoms: [
      { el: "O", x: 0, y: 0.35, z: 0 },
      { el: "O", x: 1.1, y: -0.35, z: 0 },
      { el: "O", x: -1.1, y: -0.35, z: 0 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 0, b: 2 },
    ],
    sketch2d: [
      { x: 0, y: 0.3 },
      { x: 0.5, y: -0.25 },
      { x: -0.5, y: -0.25 },
    ],
  },
  {
    id: "acetic",
    formula: "CH₃COOH",
    nameDa: "Eddikesyre",
    nameEn: "Acetic acid",
    molarMass: 60.052,
    aboutDa: "Svag organisk syre. Giver eddike dens smag og lugt.",
    aboutEn: "A weak organic acid. Gives vinegar its taste and smell.",
    usesDa: "Madlavning, konservering og kemisk råstof.",
    usesEn: "Cooking, food preservation, and chemical feedstock.",
    atoms: [
      { el: "C", x: -1.2, y: 0, z: 0 },
      { el: "C", x: 0.2, y: 0, z: 0 },
      { el: "O", x: 0.85, y: 1.1, z: 0 },
      { el: "O", x: 0.9, y: -1.05, z: 0 },
      { el: "H", x: 1.75, y: -1.0, z: 0.2 },
      { el: "H", x: -1.6, y: 0.9, z: 0.5 },
      { el: "H", x: -1.6, y: -0.9, z: 0.5 },
      { el: "H", x: -1.7, y: 0, z: -1.0 },
    ],
    bonds: [
      { a: 0, b: 1 },
      { a: 1, b: 2, order: 2 },
      { a: 1, b: 3 },
      { a: 3, b: 4 },
      { a: 0, b: 5 },
      { a: 0, b: 6 },
      { a: 0, b: 7 },
    ],
    sketch2d: [
      { x: -0.55, y: 0 },
      { x: 0.1, y: 0 },
      { x: 0.45, y: 0.45 },
      { x: 0.45, y: -0.45 },
      { x: 0.8, y: -0.4 },
      { x: -0.8, y: 0.4 },
      { x: -0.8, y: -0.4 },
      { x: -0.85, y: 0 },
    ],
  },
  {
    id: "urea",
    formula: "CO(NH₂)₂",
    nameDa: "Urea",
    nameEn: "Urea",
    molarMass: 60.056,
    aboutDa: "Nitrogenholdigt affaldsprodukt hos pattedyr. Også vigtig gødning.",
    aboutEn: "Nitrogen waste product in mammals. Also a major fertilizer.",
    usesDa: "Gødning, hudpleje og laboratoriekemi.",
    usesEn: "Fertilizer, skincare, and lab chemistry.",
    atoms: [
      { el: "C", x: 0, y: 0, z: 0 },
      { el: "O", x: 0, y: 1.2, z: 0 },
      { el: "N", x: -1.15, y: -0.7, z: 0 },
      { el: "N", x: 1.15, y: -0.7, z: 0 },
      { el: "H", x: -1.9, y: -0.3, z: 0.4 },
      { el: "H", x: -1.2, y: -1.5, z: -0.4 },
      { el: "H", x: 1.9, y: -0.3, z: 0.4 },
      { el: "H", x: 1.2, y: -1.5, z: -0.4 },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
      { a: 0, b: 2 },
      { a: 0, b: 3 },
      { a: 2, b: 4 },
      { a: 2, b: 5 },
      { a: 3, b: 6 },
      { a: 3, b: 7 },
    ],
    sketch2d: [
      { x: 0, y: 0 },
      { x: 0, y: 0.55 },
      { x: -0.55, y: -0.35 },
      { x: 0.55, y: -0.35 },
      { x: -0.85, y: -0.1 },
      { x: -0.65, y: -0.7 },
      { x: 0.85, y: -0.1 },
      { x: 0.65, y: -0.7 },
    ],
  },
];

export function findMolecule(query: string): Molecule | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return MOLECULES.find(
    (m) =>
      m.id === q ||
      m.formula.toLowerCase().replace(/[₂₃₄₅₆₇₈₉₀]/g, (c) => {
        const map: Record<string, string> = {
          "₂": "2",
          "₃": "3",
          "₄": "4",
          "₅": "5",
          "₆": "6",
          "₇": "7",
          "₈": "8",
          "₉": "9",
          "₀": "0",
        };
        return map[c] ?? c;
      }).includes(q) ||
      m.nameDa.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q),
  );
}

export function matchesMolecule(m: Molecule, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const flat = m.formula
    .toLowerCase()
    .replace(/[₂₃₄₅₆₇₈₉₀]/g, (c) => {
      const map: Record<string, string> = {
        "₂": "2",
        "₃": "3",
        "₄": "4",
        "₅": "5",
        "₆": "6",
        "₇": "7",
        "₈": "8",
        "₉": "9",
        "₀": "0",
      };
      return map[c] ?? c;
    });
  return (
    m.id.includes(q) ||
    flat.includes(q) ||
    m.nameDa.toLowerCase().includes(q) ||
    m.nameEn.toLowerCase().includes(q) ||
    m.aboutDa.toLowerCase().includes(q) ||
    m.aboutEn.toLowerCase().includes(q)
  );
}
