/** School math suite catalog: groups, level, and which builtin to open. */

export type MathLevel = "simple" | "advanced";

export type MathGroupId =
  | "regning"
  | "tal"
  | "algebra"
  | "geometri"
  | "funktioner"
  | "statistik"
  | "udforsk"
  | "hjaelp";

export type MathToolKind = "simple" | "custom";

export type MathCatalogEntry = {
  id: string;
  group: MathGroupId;
  level: MathLevel;
  kind: MathToolKind;
  /** Short blurb for the suite table (DA / EN). */
  blurbDa: string;
  blurbEn: string;
  nameDa: string;
  nameEn: string;
};

export const MATH_GROUPS: {
  id: MathGroupId;
  nameDa: string;
  nameEn: string;
}[] = [
  { id: "regning", nameDa: "Regning", nameEn: "Arithmetic" },
  { id: "tal", nameDa: "Tal", nameEn: "Numbers" },
  { id: "algebra", nameDa: "Algebra", nameEn: "Algebra" },
  { id: "geometri", nameDa: "Geometri", nameEn: "Geometry" },
  { id: "funktioner", nameDa: "Funktioner", nameEn: "Functions" },
  { id: "statistik", nameDa: "Statistik", nameEn: "Statistics" },
  { id: "udforsk", nameDa: "Udforsk", nameEn: "Explore" },
  { id: "hjaelp", nameDa: "Hjælp", nameEn: "Help" },
];

export const MATH_CATALOG: MathCatalogEntry[] = [
  // Regning
  {
    id: "lommeregner",
    group: "regning",
    level: "simple",
    kind: "custom",
    nameDa: "Lommeregner",
    nameEn: "Calculator",
    blurbDa: "Plus, minus, gange, dividér og parenteser.",
    blurbEn: "Add, subtract, multiply, divide, and parentheses.",
  },
  {
    id: "procent",
    group: "regning",
    level: "simple",
    kind: "custom",
    nameDa: "Procent",
    nameEn: "Percent",
    blurbDa: "Procent af, ændring og omvendt procent.",
    blurbEn: "Percent of, change, and reverse percent.",
  },
  {
    id: "gangetabel",
    group: "regning",
    level: "simple",
    kind: "custom",
    nameDa: "Gangetabel",
    nameEn: "Times table",
    blurbDa: "Interaktiv tabel og hurtig quiz.",
    blurbEn: "Interactive table and a quick quiz.",
  },
  {
    id: "fractionsimplify",
    group: "regning",
    level: "simple",
    kind: "simple",
    nameDa: "Forkort brøk",
    nameEn: "Simplify fraction",
    blurbDa: "Forkort brøk og se blandet tal.",
    blurbEn: "Reduce a fraction and see the mixed number.",
  },
  {
    id: "percentfraction",
    group: "regning",
    level: "simple",
    kind: "simple",
    nameDa: "Procent til brøk",
    nameEn: "Percent to fraction",
    blurbDa: "Omregn procent til forkortet brøk.",
    blurbEn: "Convert a percent into a simplified fraction.",
  },
  {
    id: "fractionops",
    group: "regning",
    level: "simple",
    kind: "simple",
    nameDa: "Brøkregning",
    nameEn: "Fraction arithmetic",
    blurbDa: "Plus, minus, gange og dividér to brøker.",
    blurbEn: "Add, subtract, multiply, and divide two fractions.",
  },
  {
    id: "powerroot",
    group: "regning",
    level: "simple",
    kind: "simple",
    nameDa: "Potens og rod",
    nameEn: "Powers and roots",
    blurbDa: "aⁿ, kvadratrod og n’te rod.",
    blurbEn: "aⁿ, square root, and nth root.",
  },
  {
    id: "roundnum",
    group: "regning",
    level: "simple",
    kind: "simple",
    nameDa: "Afrunding",
    nameEn: "Rounding",
    blurbDa: "Afrund til heltal, decimaler eller betydende cifre.",
    blurbEn: "Round to integers, decimals, or significant figures.",
  },

  // Tal
  {
    id: "gcdlcm",
    group: "tal",
    level: "simple",
    kind: "simple",
    nameDa: "SFD og MFM",
    nameEn: "GCD & LCM",
    blurbDa: "Største fælles divisor og mindste fælles multiplum.",
    blurbEn: "Greatest common divisor and least common multiple.",
  },
  {
    id: "prime",
    group: "tal",
    level: "simple",
    kind: "simple",
    nameDa: "Primtal",
    nameEn: "Prime check",
    blurbDa: "Tjek om et heltal er et primtal.",
    blurbEn: "Check whether an integer is prime.",
  },
  {
    id: "factorize",
    group: "tal",
    level: "simple",
    kind: "simple",
    nameDa: "Faktorisering",
    nameEn: "Factorization",
    blurbDa: "Primfaktorer og faktorprodukt.",
    blurbEn: "Prime factors and factor product.",
  },
  {
    id: "ratio",
    group: "tal",
    level: "simple",
    kind: "simple",
    nameDa: "Forhold",
    nameEn: "Ratio",
    blurbDa: "Forenkle et forhold A:B.",
    blurbEn: "Simplify a ratio A:B.",
  },
  {
    id: "roman",
    group: "tal",
    level: "simple",
    kind: "simple",
    nameDa: "Romertal",
    nameEn: "Roman numerals",
    blurbDa: "Arabiske tal ↔ romertal.",
    blurbEn: "Arabic numbers ↔ Roman numerals.",
  },
  {
    id: "numberbase",
    group: "tal",
    level: "advanced",
    kind: "simple",
    nameDa: "Talsystemer",
    nameEn: "Number bases",
    blurbDa: "Omregn mellem base 2 til 36.",
    blurbEn: "Convert between bases 2 to 36.",
  },
  {
    id: "binary",
    group: "tal",
    level: "advanced",
    kind: "simple",
    nameDa: "Binær",
    nameEn: "Binary",
    blurbDa: "Hurtig omregning til og fra binær.",
    blurbEn: "Quick convert to and from binary.",
  },

  // Algebra
  {
    id: "lineareq",
    group: "algebra",
    level: "simple",
    kind: "simple",
    nameDa: "Førstegradsligning",
    nameEn: "Linear equation",
    blurbDa: "Løs ax + b = c trin for trin.",
    blurbEn: "Solve ax + b = c step by step.",
  },
  {
    id: "quadraticeq",
    group: "algebra",
    level: "advanced",
    kind: "simple",
    nameDa: "Andengradsligning",
    nameEn: "Quadratic equation",
    blurbDa: "Diskriminant, rødder og toppunkt.",
    blurbEn: "Discriminant, roots, and vertex.",
  },
  {
    id: "grade",
    group: "algebra",
    level: "simple",
    kind: "simple",
    nameDa: "Karakter / score",
    nameEn: "Grade calculator",
    blurbDa: "Omregn point til procent.",
    blurbEn: "Convert points into a percent score.",
  },

  // Geometri
  {
    id: "pythagoras",
    group: "geometri",
    level: "simple",
    kind: "simple",
    nameDa: "Pythagoras",
    nameEn: "Pythagoras",
    blurbDa: "Find hypotenusen eller et ben.",
    blurbEn: "Find the hypotenuse or a leg.",
  },
  {
    id: "area",
    group: "geometri",
    level: "simple",
    kind: "simple",
    nameDa: "Areal",
    nameEn: "Area",
    blurbDa: "Rektangel, cirkel og trekant.",
    blurbEn: "Rectangle, circle, and triangle.",
  },
  {
    id: "volume",
    group: "geometri",
    level: "simple",
    kind: "simple",
    nameDa: "Volumen",
    nameEn: "Volume",
    blurbDa: "Kasse, cylinder og kugle.",
    blurbEn: "Box, cylinder, and sphere.",
  },
  {
    id: "circlemath",
    group: "geometri",
    level: "simple",
    kind: "simple",
    nameDa: "Cirkel",
    nameEn: "Circle",
    blurbDa: "Radius, diameter, omkreds og areal.",
    blurbEn: "Radius, diameter, circumference, and area.",
  },
  {
    id: "angleconvert",
    group: "geometri",
    level: "simple",
    kind: "simple",
    nameDa: "Vinkler",
    nameEn: "Angles",
    blurbDa: "Grader ↔ radianer.",
    blurbEn: "Degrees ↔ radians.",
  },
  {
    id: "trigsolve",
    group: "geometri",
    level: "advanced",
    kind: "simple",
    nameDa: "Trigonometri",
    nameEn: "Trigonometry",
    blurbDa: "sin, cos, tan og retvinklet trekant.",
    blurbEn: "sin, cos, tan, and right triangles.",
  },
  {
    id: "coordgeom",
    group: "geometri",
    level: "advanced",
    kind: "simple",
    nameDa: "Koordinatsystem",
    nameEn: "Coordinate geometry",
    blurbDa: "Afstand, midtpunkt og hældning.",
    blurbEn: "Distance, midpoint, and slope.",
  },
  {
    id: "geometri",
    group: "geometri",
    level: "advanced",
    kind: "custom",
    nameDa: "Geometri-lab",
    nameEn: "Geometry lab",
    blurbDa: "Tegn figurer og se mål live.",
    blurbEn: "Draw shapes and see measures update live.",
  },

  // Funktioner
  {
    id: "funkplot",
    group: "funktioner",
    level: "advanced",
    kind: "custom",
    nameDa: "Funktionsplot",
    nameEn: "Function plotter",
    blurbDa: "Tegn grafer, zoom og aflæs værdier.",
    blurbEn: "Plot graphs, zoom, and read values.",
  },
  {
    id: "formellab",
    group: "funktioner",
    level: "advanced",
    kind: "custom",
    nameDa: "Formel-lab",
    nameEn: "Formula lab",
    blurbDa: "Enhedskæder og fælles formler.",
    blurbEn: "Unit chains and common formulas.",
  },

  // Statistik
  {
    id: "average",
    group: "statistik",
    level: "simple",
    kind: "simple",
    nameDa: "Gennemsnit",
    nameEn: "Average",
    blurbDa: "Aritmetisk middelværdi af en liste.",
    blurbEn: "Arithmetic mean of a list.",
  },
  {
    id: "statistik",
    group: "statistik",
    level: "advanced",
    kind: "custom",
    nameDa: "Statistik-lab",
    nameEn: "Statistics lab",
    blurbDa: "Fordeling, stikprøve og spredning.",
    blurbEn: "Distributions, sampling, and spread.",
  },
  {
    id: "combinatorics",
    group: "statistik",
    level: "advanced",
    kind: "simple",
    nameDa: "Kombinatorik",
    nameEn: "Combinatorics",
    blurbDa: "n!, P(n,k) og C(n,k).",
    blurbEn: "n!, P(n,k), and C(n,k).",
  },

  // Udforsk
  {
    id: "fraktal",
    group: "udforsk",
    level: "advanced",
    kind: "custom",
    nameDa: "Fraktaler",
    nameEn: "Fractals",
    blurbDa: "Mandelbrot og Julia med zoom.",
    blurbEn: "Mandelbrot and Julia with zoom.",
  },
  {
    id: "logik",
    group: "udforsk",
    level: "advanced",
    kind: "custom",
    nameDa: "Logikporte",
    nameEn: "Logic gates",
    blurbDa: "AND, OR, NOT og sandhedstabel.",
    blurbEn: "AND, OR, NOT, and truth tables.",
  },

  // Hjælp
  {
    id: "formelsamling",
    group: "hjaelp",
    level: "simple",
    kind: "custom",
    nameDa: "Formelsamling",
    nameEn: "Formula sheet",
    blurbDa: "Søgbar tabel med skoleformler.",
    blurbEn: "Searchable table of school formulas.",
  },
];

export const MATH_SUITE_IDS = new Set(MATH_CATALOG.map((e) => e.id));

export function mathEntryById(id: string): MathCatalogEntry | undefined {
  return MATH_CATALOG.find((e) => e.id === id);
}

export function mathEntriesFor(
  group: MathGroupId,
  level: MathLevel | "all",
): MathCatalogEntry[] {
  return MATH_CATALOG.filter(
    (e) => e.group === group && (level === "all" || e.level === level),
  );
}
