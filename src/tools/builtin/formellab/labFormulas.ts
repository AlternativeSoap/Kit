export type LabFormulaId =
  | "ohm"
  | "kinetic"
  | "density"
  | "fma"
  | "idealGas"
  | "wavelength"
  | "power"
  | "potential"
  | "period"
  | "pressure"
  | "work"
  | "coulomb"
  | "snell"
  | "avgSpeed";

export type LabInput = {
  id: string;
  labelDa: string;
  labelEn: string;
  unitDa: string;
  unitEn: string;
  defaultValue: string;
};

export type LabFormula = {
  id: LabFormulaId;
  nameDa: string;
  nameEn: string;
  expression: string;
  aboutDa: string;
  aboutEn: string;
  inputs: LabInput[];
  resultUnitDa: string;
  resultUnitEn: string;
  evaluate: (values: Record<string, number>) => number | null;
};

function num(values: Record<string, number>, id: string): number | null {
  const v = values[id];
  if (v === undefined || !Number.isFinite(v)) return null;
  return v;
}

export const LAB_FORMULAS: LabFormula[] = [
  {
    id: "ohm",
    nameDa: "Ohms lov",
    nameEn: "Ohm's law",
    expression: "V = I · R",
    aboutDa: "Spænding er strøm gange modstand.",
    aboutEn: "Voltage equals current times resistance.",
    inputs: [
      { id: "I", labelDa: "Strøm I", labelEn: "Current I", unitDa: "A", unitEn: "A", defaultValue: "2" },
      { id: "R", labelDa: "Modstand R", labelEn: "Resistance R", unitDa: "Ω", unitEn: "Ω", defaultValue: "10" },
    ],
    resultUnitDa: "V",
    resultUnitEn: "V",
    evaluate: (v) => {
      const I = num(v, "I");
      const R = num(v, "R");
      if (I == null || R == null) return null;
      return I * R;
    },
  },
  {
    id: "kinetic",
    nameDa: "Kinetisk energi",
    nameEn: "Kinetic energy",
    expression: "Eₖ = ½ m v²",
    aboutDa: "Energi hos et objekt i bevægelse.",
    aboutEn: "Energy of an object in motion.",
    inputs: [
      { id: "m", labelDa: "Masse m", labelEn: "Mass m", unitDa: "kg", unitEn: "kg", defaultValue: "1" },
      { id: "v", labelDa: "Hastighed v", labelEn: "Speed v", unitDa: "m/s", unitEn: "m/s", defaultValue: "10" },
    ],
    resultUnitDa: "J",
    resultUnitEn: "J",
    evaluate: (v) => {
      const m = num(v, "m");
      const speed = num(v, "v");
      if (m == null || speed == null) return null;
      return 0.5 * m * speed * speed;
    },
  },
  {
    id: "density",
    nameDa: "Massefylde",
    nameEn: "Density",
    expression: "ρ = m / V",
    aboutDa: "Masse divideret med volumen.",
    aboutEn: "Mass divided by volume.",
    inputs: [
      { id: "m", labelDa: "Masse m", labelEn: "Mass m", unitDa: "kg", unitEn: "kg", defaultValue: "1" },
      { id: "V", labelDa: "Volumen V", labelEn: "Volume V", unitDa: "m³", unitEn: "m³", defaultValue: "0.001" },
    ],
    resultUnitDa: "kg/m³",
    resultUnitEn: "kg/m³",
    evaluate: (v) => {
      const m = num(v, "m");
      const V = num(v, "V");
      if (m == null || V == null || V === 0) return null;
      return m / V;
    },
  },
  {
    id: "fma",
    nameDa: "Newtons 2. lov",
    nameEn: "Newton's 2nd law",
    expression: "F = m · a",
    aboutDa: "Kraft er masse gange acceleration.",
    aboutEn: "Force equals mass times acceleration.",
    inputs: [
      { id: "m", labelDa: "Masse m", labelEn: "Mass m", unitDa: "kg", unitEn: "kg", defaultValue: "5" },
      { id: "a", labelDa: "Acceleration a", labelEn: "Acceleration a", unitDa: "m/s²", unitEn: "m/s²", defaultValue: "9.81" },
    ],
    resultUnitDa: "N",
    resultUnitEn: "N",
    evaluate: (v) => {
      const m = num(v, "m");
      const a = num(v, "a");
      if (m == null || a == null) return null;
      return m * a;
    },
  },
  {
    id: "idealGas",
    nameDa: "Idealgasligning (forenklet)",
    nameEn: "Ideal gas (simplified)",
    expression: "p V = n R T",
    aboutDa: "Beregner tryk ud fra n, V og T. R = 8,314 J/(mol·K).",
    aboutEn: "Computes pressure from n, V, and T. R = 8.314 J/(mol·K).",
    inputs: [
      { id: "n", labelDa: "Stofmængde n", labelEn: "Amount n", unitDa: "mol", unitEn: "mol", defaultValue: "1" },
      { id: "V", labelDa: "Volumen V", labelEn: "Volume V", unitDa: "m³", unitEn: "m³", defaultValue: "0.0224" },
      { id: "T", labelDa: "Temperatur T", labelEn: "Temperature T", unitDa: "K", unitEn: "K", defaultValue: "273.15" },
    ],
    resultUnitDa: "Pa",
    resultUnitEn: "Pa",
    evaluate: (v) => {
      const n = num(v, "n");
      const V = num(v, "V");
      const T = num(v, "T");
      if (n == null || V == null || T == null || V === 0) return null;
      return (n * 8.314462618 * T) / V;
    },
  },
  {
    id: "wavelength",
    nameDa: "Bølgelængde",
    nameEn: "Wavelength",
    expression: "λ = v / f",
    aboutDa: "Bølgelængde er hastighed divideret med frekvens.",
    aboutEn: "Wavelength is speed divided by frequency.",
    inputs: [
      { id: "v", labelDa: "Bølgehastighed v", labelEn: "Wave speed v", unitDa: "m/s", unitEn: "m/s", defaultValue: "340" },
      { id: "f", labelDa: "Frekvens f", labelEn: "Frequency f", unitDa: "Hz", unitEn: "Hz", defaultValue: "440" },
    ],
    resultUnitDa: "m",
    resultUnitEn: "m",
    evaluate: (v) => {
      const speed = num(v, "v");
      const f = num(v, "f");
      if (speed == null || f == null || f === 0) return null;
      return speed / f;
    },
  },
  {
    id: "power",
    nameDa: "Elektrisk effekt",
    nameEn: "Electric power",
    expression: "P = U · I",
    aboutDa: "Effekt er spænding gange strøm.",
    aboutEn: "Power equals voltage times current.",
    inputs: [
      { id: "U", labelDa: "Spænding U", labelEn: "Voltage U", unitDa: "V", unitEn: "V", defaultValue: "230" },
      { id: "I", labelDa: "Strøm I", labelEn: "Current I", unitDa: "A", unitEn: "A", defaultValue: "2" },
    ],
    resultUnitDa: "W",
    resultUnitEn: "W",
    evaluate: (v) => {
      const U = num(v, "U");
      const I = num(v, "I");
      if (U == null || I == null) return null;
      return U * I;
    },
  },
  {
    id: "potential",
    nameDa: "Potentiel energi",
    nameEn: "Gravitational potential energy",
    expression: "Eₚ = m g h",
    aboutDa: "Energi i forhold til højde i tyngdefelt. g ≈ 9,81 m/s².",
    aboutEn: "Energy due to height in a gravity field. g ≈ 9.81 m/s².",
    inputs: [
      { id: "m", labelDa: "Masse m", labelEn: "Mass m", unitDa: "kg", unitEn: "kg", defaultValue: "2" },
      { id: "h", labelDa: "Højde h", labelEn: "Height h", unitDa: "m", unitEn: "m", defaultValue: "5" },
      { id: "g", labelDa: "g", labelEn: "g", unitDa: "m/s²", unitEn: "m/s²", defaultValue: "9.81" },
    ],
    resultUnitDa: "J",
    resultUnitEn: "J",
    evaluate: (v) => {
      const m = num(v, "m");
      const h = num(v, "h");
      const g = num(v, "g");
      if (m == null || h == null || g == null) return null;
      return m * g * h;
    },
  },
  {
    id: "period",
    nameDa: "Pendulperiode (lille vinkel)",
    nameEn: "Pendulum period (small angle)",
    expression: "T = 2π √(L/g)",
    aboutDa: "Svingningstid for et enkelt pendul ved små udsving.",
    aboutEn: "Period of a simple pendulum for small swings.",
    inputs: [
      { id: "L", labelDa: "Længde L", labelEn: "Length L", unitDa: "m", unitEn: "m", defaultValue: "1" },
      { id: "g", labelDa: "g", labelEn: "g", unitDa: "m/s²", unitEn: "m/s²", defaultValue: "9.81" },
    ],
    resultUnitDa: "s",
    resultUnitEn: "s",
    evaluate: (v) => {
      const L = num(v, "L");
      const g = num(v, "g");
      if (L == null || g == null || g <= 0 || L < 0) return null;
      return 2 * Math.PI * Math.sqrt(L / g);
    },
  },
  {
    id: "pressure",
    nameDa: "Tryk",
    nameEn: "Pressure",
    expression: "p = F / A",
    aboutDa: "Tryk er kraft divideret med areal.",
    aboutEn: "Pressure is force divided by area.",
    inputs: [
      { id: "F", labelDa: "Kraft F", labelEn: "Force F", unitDa: "N", unitEn: "N", defaultValue: "100" },
      { id: "A", labelDa: "Areal A", labelEn: "Area A", unitDa: "m²", unitEn: "m²", defaultValue: "0.01" },
    ],
    resultUnitDa: "Pa",
    resultUnitEn: "Pa",
    evaluate: (v) => {
      const F = num(v, "F");
      const A = num(v, "A");
      if (F == null || A == null || A === 0) return null;
      return F / A;
    },
  },
  {
    id: "work",
    nameDa: "Arbejde",
    nameEn: "Work",
    expression: "W = F · d",
    aboutDa: "Arbejde når kraft og forskydning er parallelle.",
    aboutEn: "Work when force and displacement are parallel.",
    inputs: [
      { id: "F", labelDa: "Kraft F", labelEn: "Force F", unitDa: "N", unitEn: "N", defaultValue: "50" },
      { id: "d", labelDa: "Strækning d", labelEn: "Distance d", unitDa: "m", unitEn: "m", defaultValue: "3" },
    ],
    resultUnitDa: "J",
    resultUnitEn: "J",
    evaluate: (v) => {
      const F = num(v, "F");
      const d = num(v, "d");
      if (F == null || d == null) return null;
      return F * d;
    },
  },
  {
    id: "coulomb",
    nameDa: "Coulombs lov (størrelse)",
    nameEn: "Coulomb's law (magnitude)",
    expression: "F = k |q₁ q₂| / r²",
    aboutDa: "Kraft mellem to punktladninger. k ≈ 8,99×10⁹ N·m²/C².",
    aboutEn: "Force between two point charges. k ≈ 8.99×10⁹ N·m²/C².",
    inputs: [
      { id: "q1", labelDa: "Ladning q₁", labelEn: "Charge q₁", unitDa: "C", unitEn: "C", defaultValue: "1e-6" },
      { id: "q2", labelDa: "Ladning q₂", labelEn: "Charge q₂", unitDa: "C", unitEn: "C", defaultValue: "1e-6" },
      { id: "r", labelDa: "Afstand r", labelEn: "Distance r", unitDa: "m", unitEn: "m", defaultValue: "0.1" },
    ],
    resultUnitDa: "N",
    resultUnitEn: "N",
    evaluate: (v) => {
      const q1 = num(v, "q1");
      const q2 = num(v, "q2");
      const r = num(v, "r");
      if (q1 == null || q2 == null || r == null || r === 0) return null;
      const k = 8.9875517923e9;
      return (k * Math.abs(q1 * q2)) / (r * r);
    },
  },
  {
    id: "snell",
    nameDa: "Snells lov (finder θ₂)",
    nameEn: "Snell's law (find θ₂)",
    expression: "n₁ sin θ₁ = n₂ sin θ₂",
    aboutDa: "Brydning mellem to medier. Vinkler i grader.",
    aboutEn: "Refraction between two media. Angles in degrees.",
    inputs: [
      { id: "n1", labelDa: "n₁", labelEn: "n₁", unitDa: "", unitEn: "", defaultValue: "1" },
      { id: "n2", labelDa: "n₂", labelEn: "n₂", unitDa: "", unitEn: "", defaultValue: "1.33" },
      { id: "theta1", labelDa: "θ₁", labelEn: "θ₁", unitDa: "°", unitEn: "°", defaultValue: "30" },
    ],
    resultUnitDa: "°",
    resultUnitEn: "°",
    evaluate: (v) => {
      const n1 = num(v, "n1");
      const n2 = num(v, "n2");
      const theta1 = num(v, "theta1");
      if (n1 == null || n2 == null || theta1 == null || n2 === 0) return null;
      const s = (n1 / n2) * Math.sin((theta1 * Math.PI) / 180);
      if (Math.abs(s) > 1) return null;
      return (Math.asin(s) * 180) / Math.PI;
    },
  },
  {
    id: "avgSpeed",
    nameDa: "Gennemsnitshastighed",
    nameEn: "Average speed",
    expression: "v = Δs / Δt",
    aboutDa: "Strækning divideret med tid.",
    aboutEn: "Distance divided by time.",
    inputs: [
      { id: "s", labelDa: "Strækning Δs", labelEn: "Distance Δs", unitDa: "m", unitEn: "m", defaultValue: "100" },
      { id: "t", labelDa: "Tid Δt", labelEn: "Time Δt", unitDa: "s", unitEn: "s", defaultValue: "10" },
    ],
    resultUnitDa: "m/s",
    resultUnitEn: "m/s",
    evaluate: (v) => {
      const s = num(v, "s");
      const t = num(v, "t");
      if (s == null || t == null || t === 0) return null;
      return s / t;
    },
  },
];
