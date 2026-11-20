import { FORMULA_IDS, type FormulaId } from "./formulas";

/**
 * Keywords that open the advanced calculator on a specific formula.
 * Kept separate from i18n so search can stay sync and lightweight.
 */
const KEYWORDS: Record<FormulaId, readonly string[]> = {
  percentOf: ["procent af", "percent of", "pct af", "% af"],
  percentChange: [
    "procentvis",
    "percent change",
    "procent ændring",
    "procent aendring",
  ],
  fraction: ["brøk", "brok", "fraction"],
  compoundInterest: [
    "renters rente",
    "compound interest",
    "compound",
    "sammensat rente",
  ],
  simpleInterest: ["simpel rente", "simple interest"],
  bmi: ["bmi", "body mass"],
  circleArea: ["cirkel areal", "circle area", "areal cirkel"],
  rectangleArea: ["rektangel", "rectangle area", "areal rektangel"],
  triangleArea: ["trekant areal", "triangle area", "areal trekant"],
  boxVolume: ["rumfang", "box volume", "kasse volumen"],
  speed: ["hastighed", "speed distance", "fart"],
  proportion: ["forhold", "proportion", "krydsprodukt"],
  pythagoras: ["pythagoras", "hypotenuse", "retvinklet"],
  power: ["potens", "power", "a^"],
  sqrt: ["kvadratrod", "square root", "sqrt"],
};

export type FormulaSearchHit = {
  id: FormulaId;
  score: number;
  matched: string;
};

export function searchCalculatorFormulas(
  query: string,
  limit = 3,
): FormulaSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 3 || /^\d+$/.test(q)) return [];

  const scored: FormulaSearchHit[] = [];
  for (const id of FORMULA_IDS) {
    const words = KEYWORDS[id] ?? [];
    let best = -1;
    let matched = "";
    for (const word of words) {
      if (q === word) {
        best = 100;
        matched = word;
        break;
      }
      if (word.startsWith(q) || q.startsWith(word)) {
        if (90 > best) {
          best = 90;
          matched = word;
        }
      } else if (word.includes(q) || q.includes(word)) {
        if (70 > best) {
          best = 70;
          matched = word;
        }
      }
    }
    if (best >= 0) scored.push({ id, score: best, matched });
  }

  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored.slice(0, limit);
}
