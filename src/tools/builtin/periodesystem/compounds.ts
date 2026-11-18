/** Well-known compounds for instant educational combine results. */
export type CuratedCompound = {
  /** Unique element symbols in the compound (order does not matter). */
  elements: string[];
  formula: string;
  nameEn: string;
  nameDa: string;
  noteEn: string;
  noteDa: string;
};

export const CURATED_COMPOUNDS: CuratedCompound[] = [
  {
    elements: ["H", "O"],
    formula: "H2O",
    nameEn: "Water",
    nameDa: "Vand",
    noteEn: "The most familiar oxide of hydrogen. Essential for life.",
    noteDa: "Den mest kendte oxid af hydrogen. Nødvendig for liv.",
  },
  {
    elements: ["H", "O"],
    formula: "H2O2",
    nameEn: "Hydrogen peroxide",
    nameDa: "Hydrogenperoxid",
    noteEn: "A bleaching and disinfectant agent that breaks down to water and oxygen.",
    noteDa: "Blegemiddel og desinfektionsmiddel, der henfalder til vand og ilt.",
  },
  {
    elements: ["C", "O"],
    formula: "CO2",
    nameEn: "Carbon dioxide",
    nameDa: "Carbondioxid",
    noteEn: "Product of respiration and combustion. Used by plants in photosynthesis.",
    noteDa: "Produkt af respiration og forbrænding. Bruges af planter i fotosyntese.",
  },
  {
    elements: ["C", "O"],
    formula: "CO",
    nameEn: "Carbon monoxide",
    nameDa: "Carbonmonoxid",
    noteEn: "A toxic gas from incomplete combustion that binds strongly to haemoglobin.",
    noteDa: "Giftig gas fra ufuldstændig forbrænding, der binder stærkt til hæmoglobin.",
  },
  {
    elements: ["Na", "Cl"],
    formula: "NaCl",
    nameEn: "Sodium chloride",
    nameDa: "Natriumchlorid",
    noteEn: "Table salt. An ionic solid from a group 1 metal and a halogen.",
    noteDa: "Bordsalt. Et ionisk salt af et gruppe 1-metal og et halogen.",
  },
  {
    elements: ["H", "Cl"],
    formula: "HCl",
    nameEn: "Hydrogen chloride",
    nameDa: "Hydrogenchlorid",
    noteEn: "A gas that dissolves in water to make hydrochloric acid.",
    noteDa: "En gas, der opløses i vand og danner saltsyre.",
  },
  {
    elements: ["N", "H"],
    formula: "NH3",
    nameEn: "Ammonia",
    nameDa: "Ammoniak",
    noteEn: "Made industrially by the Haber-Bosch process for fertiliser.",
    noteDa: "Fremstilles industrielt i Haber-Bosch-processen til gødning.",
  },
  {
    elements: ["C", "H"],
    formula: "CH4",
    nameEn: "Methane",
    nameDa: "Methan",
    noteEn: "The simplest hydrocarbon and the main component of natural gas.",
    noteDa: "Det simpleste carbonhydrid og hovedbestanddelen i naturgas.",
  },
  {
    elements: ["C", "H", "O"],
    formula: "C6H12O6",
    nameEn: "Glucose (example sugar)",
    nameDa: "Glukose (eksempel på sukker)",
    noteEn: "A sugar formula used by cells. Many isomers share C6H12O6.",
    noteDa: "En sukkerformel brugt af celler. Mange isomerer deler C6H12O6.",
  },
  {
    elements: ["Fe", "O"],
    formula: "Fe2O3",
    nameEn: "Iron(III) oxide",
    nameDa: "Jern(III)oxid",
    noteEn: "A common form of rust and an important iron ore (haematite).",
    noteDa: "En almindelig form for rust og en vigtig jernmalm (hæmatit).",
  },
  {
    elements: ["Al", "O"],
    formula: "Al2O3",
    nameEn: "Aluminium oxide",
    nameDa: "Aluminiumoxid",
    noteEn: "Forms the protective skin on aluminium and is the mineral corundum.",
    noteDa: "Danner den beskyttende hinde på aluminium og er mineralet korund.",
  },
  {
    elements: ["Ca", "O"],
    formula: "CaO",
    nameEn: "Calcium oxide",
    nameDa: "Calciumoxid",
    noteEn: "Quicklime, made by heating limestone. Used in cement and steelmaking.",
    noteDa: "Brændt kalk, fremstillet ved opvarmning af kalksten. Bruges i cement og stål.",
  },
  {
    elements: ["Ca", "C", "O"],
    formula: "CaCO3",
    nameEn: "Calcium carbonate",
    nameDa: "Calciumcarbonat",
    noteEn: "Chalk, limestone and marble. Also the main mineral in shells.",
    noteDa: "Kridt, kalksten og marmor. Også hovedmineralet i skaller.",
  },
  {
    elements: ["Si", "O"],
    formula: "SiO2",
    nameEn: "Silicon dioxide",
    nameDa: "Siliciumdioxid",
    noteEn: "Quartz and sand. The backbone of glass and many rocks.",
    noteDa: "Kvarts og sand. Rygraden i glas og mange bjergarter.",
  },
  {
    elements: ["S", "O"],
    formula: "SO2",
    nameEn: "Sulfur dioxide",
    nameDa: "Svovldioxid",
    noteEn: "Formed when sulfur burns. A precursor of acid rain if not cleaned from flue gas.",
    noteDa: "Dannes når svovl brænder. Forstadie til sur nedbør, hvis det ikke renses fra røggas.",
  },
  {
    elements: ["N", "O"],
    formula: "NO2",
    nameEn: "Nitrogen dioxide",
    nameDa: "Nitrogendioxid",
    noteEn: "A brown air pollutant from engines and a step toward nitric acid.",
    noteDa: "En brun luftforurening fra motorer og et trin på vej til salpetersyre.",
  },
  {
    elements: ["H", "S"],
    formula: "H2S",
    nameEn: "Hydrogen sulfide",
    nameDa: "Hydrogensulfid",
    noteEn: "A toxic gas with a rotten-egg smell, made by some microbes.",
    noteDa: "En giftig gas med lugt af rådne æg, dannet af nogle mikrober.",
  },
  {
    elements: ["K", "Cl"],
    formula: "KCl",
    nameEn: "Potassium chloride",
    nameDa: "Kaliumchlorid",
    noteEn: "Used in fertilisers and as a low-sodium salt substitute.",
    noteDa: "Bruges i gødning og som salt med lavt natriumindhold.",
  },
  {
    elements: ["Mg", "O"],
    formula: "MgO",
    nameEn: "Magnesium oxide",
    nameDa: "Magnesiumoxid",
    noteEn: "A refractory white solid used in heat-resistant linings.",
    noteDa: "Et ildfast hvidt stof brugt i varmebestandige foringer.",
  },
  {
    elements: ["Cu", "O"],
    formula: "CuO",
    nameEn: "Copper(II) oxide",
    nameDa: "Kobber(II)oxid",
    noteEn: "A black oxide used in ceramics and some batteries.",
    noteDa: "Et sort oxid brugt i keramik og nogle batterier.",
  },
  {
    elements: ["Ag", "Cl"],
    formula: "AgCl",
    nameEn: "Silver chloride",
    nameDa: "Sølvchlorid",
    noteEn: "Light-sensitive salt once central to photographic film.",
    noteDa: "Lysfølsomt salt, der engang var centralt i fotografisk film.",
  },
  {
    elements: ["H", "F"],
    formula: "HF",
    nameEn: "Hydrogen fluoride",
    nameDa: "Hydrogenfluorid",
    noteEn: "A highly corrosive compound used to etch glass.",
    noteDa: "En meget ætsende forbindelse brugt til ætsning af glas.",
  },
  {
    elements: ["C", "H", "Cl"],
    formula: "CHCl3",
    nameEn: "Chloroform",
    nameDa: "Chloroform",
    noteEn: "A chlorinated solvent once used as an anaesthetic.",
    noteDa: "Et kloreret opløsningsmiddel, der engang blev brugt som bedøvelse.",
  },
  {
    elements: ["Na", "O", "H"],
    formula: "NaOH",
    nameEn: "Sodium hydroxide",
    nameDa: "Natriumhydroxid",
    noteEn: "Caustic soda from the chlor-alkali process. A strong base.",
    noteDa: "Kaustisk soda fra chlor-alkali-processen. En stærk base.",
  },
  {
    elements: ["C", "H", "O"],
    formula: "C2H5OH",
    nameEn: "Ethanol",
    nameDa: "Ethanol",
    noteEn: "Drinking alcohol and a common biofuel and solvent.",
    noteDa: "Drikkealkohol og et almindeligt biobrændstof og opløsningsmiddel.",
  },
  {
    elements: ["Fe", "S"],
    formula: "FeS2",
    nameEn: "Iron disulfide (pyrite)",
    nameDa: "Jerndisulfid (pyrit)",
    noteEn: "Fool's gold. A common sulfide mineral.",
    noteDa: "Kattenguld. Et almindeligt sulfidmineral.",
  },
  {
    elements: ["Ti", "O"],
    formula: "TiO2",
    nameEn: "Titanium dioxide",
    nameDa: "Titandioxid",
    noteEn: "A bright white pigment in paint, sunscreen and food.",
    noteDa: "Et klart hvidt pigment i maling, solcreme og fødevarer.",
  },
  {
    elements: ["Zn", "S"],
    formula: "ZnS",
    nameEn: "Zinc sulfide",
    nameDa: "Zinksulfid",
    noteEn: "Used in phosphors and as the mineral sphalerite, the main zinc ore.",
    noteDa: "Bruges i fosforstoffer og som mineralet zinkblende, den vigtigste zinkmalm.",
  },
  {
    elements: ["P", "O"],
    formula: "P4O10",
    nameEn: "Phosphorus pentoxide",
    nameDa: "Phosphorpentoxid",
    noteEn: "A powerful drying agent that reacts with water to make phosphoric acid.",
    noteDa: "Et kraftigt tørremiddel, der reagerer med vand til phosphorsyre.",
  },
  {
    elements: ["O"],
    formula: "O2",
    nameEn: "Oxygen gas",
    nameDa: "Iltgas",
    noteEn: "The diatomic form we breathe. Ozone is O3.",
    noteDa: "Den diatomare form vi indånder. Ozon er O3.",
  },
  {
    elements: ["N"],
    formula: "N2",
    nameEn: "Nitrogen gas",
    nameDa: "Kvælstofgas",
    noteEn: "Most of Earth's atmosphere. Very strong triple bond.",
    noteDa: "Det meste af Jordens atmosfære. Meget stærk tripelbinding.",
  },
  {
    elements: ["H"],
    formula: "H2",
    nameEn: "Hydrogen gas",
    nameDa: "Brintgas",
    noteEn: "The lightest molecule. Used as a clean-burning fuel when pure.",
    noteDa: "Det letteste molekyle. Bruges som rent brændende brændstof, når det er rent.",
  },
  {
    elements: ["Cl"],
    formula: "Cl2",
    nameEn: "Chlorine gas",
    nameDa: "Klorgas",
    noteEn: "A reactive halogen gas used to make PVC and to disinfect water.",
    noteDa: "En reaktiv halogengas brugt til PVC og til at desinficere vand.",
  },
];

const VALENCE: Record<string, number[]> = {
  H: [1],
  Li: [1],
  Na: [1],
  K: [1],
  Rb: [1],
  Cs: [1],
  Be: [2],
  Mg: [2],
  Ca: [2],
  Sr: [2],
  Ba: [2],
  B: [3],
  Al: [3],
  C: [4, 2],
  Si: [4],
  N: [3, 5],
  P: [3, 5],
  O: [2],
  S: [2, 4, 6],
  F: [1],
  Cl: [1],
  Br: [1],
  I: [1],
  Fe: [2, 3],
  Cu: [1, 2],
  Zn: [2],
  Ag: [1],
  Ti: [4],
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function formulaFromCounts(counts: Record<string, number>): string {
  // Hill system-ish: C then H then alphabetical, else alphabetical.
  const keys = Object.keys(counts).filter((k) => counts[k] > 0);
  keys.sort((a, b) => {
    if (a === "C") return -1;
    if (b === "C") return 1;
    if (a === "H" && b !== "C") return -1;
    if (b === "H" && a !== "C") return 1;
    return a.localeCompare(b);
  });
  return keys.map((k) => `${k}${counts[k] === 1 ? "" : counts[k]}`).join("");
}

/** Suggest simple molecular formulas for PubChem lookup. */
export function suggestFormulas(symbols: string[]): string[] {
  const uniq = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  const out = new Set<string>();

  if (uniq.length === 1) {
    const s = uniq[0];
    out.add(s);
    out.add(`${s}2`);
    if (s === "O") out.add("O3");
    if (s === "P") out.add("P4");
    if (s === "S") out.add("S8");
  }

  if (uniq.length === 2) {
    const [a, b] = uniq;
    const va = VALENCE[a] ?? [1, 2, 3];
    const vb = VALENCE[b] ?? [1, 2, 3];
    for (const x of va) {
      for (const y of vb) {
        const g = gcd(x, y);
        const ca = y / g;
        const cb = x / g;
        out.add(formulaFromCounts({ [a]: ca, [b]: cb }));
      }
    }
    out.add(formulaFromCounts({ [a]: 1, [b]: 1 }));
    out.add(formulaFromCounts({ [a]: 2, [b]: 1 }));
    out.add(formulaFromCounts({ [a]: 1, [b]: 2 }));
    out.add(formulaFromCounts({ [a]: 2, [b]: 3 }));
    out.add(formulaFromCounts({ [a]: 3, [b]: 2 }));
  }

  if (uniq.length === 3) {
    const [a, b, c] = uniq;
    // Common ternary patterns: hydroxides, carbonates, sulfates-ish.
    out.add(formulaFromCounts({ [a]: 1, [b]: 1, [c]: 1 }));
    out.add(formulaFromCounts({ [a]: 1, [b]: 1, [c]: 3 }));
    out.add(formulaFromCounts({ [a]: 2, [b]: 1, [c]: 3 }));
    out.add(formulaFromCounts({ [a]: 1, [b]: 2, [c]: 4 }));
    if (uniq.includes("O") && uniq.includes("H")) {
      const metal = uniq.find((s) => s !== "O" && s !== "H");
      if (metal) out.add(formulaFromCounts({ [metal]: 1, O: 1, H: 1 }));
    }
    if (uniq.includes("C") && uniq.includes("O")) {
      const metal = uniq.find((s) => s !== "C" && s !== "O");
      if (metal) out.add(formulaFromCounts({ [metal]: 1, C: 1, O: 3 }));
    }
  }

  return [...out].slice(0, 12);
}

export function curatedFor(symbols: string[]): CuratedCompound[] {
  const set = new Set(symbols.map((s) => s.trim().toLowerCase()).filter(Boolean));
  return CURATED_COMPOUNDS.filter((c) => {
    if (c.elements.length !== set.size) return false;
    return c.elements.every((el) => set.has(el.toLowerCase()));
  });
}
