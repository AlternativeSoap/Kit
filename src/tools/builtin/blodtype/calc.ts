export type AboType = "A" | "B" | "AB" | "O";
export type RhType = "+" | "-";

export type BloodType = { abo: AboType; rh: RhType };

export type ChildOutcome = {
  abo: AboType;
  rh: RhType;
  label: string;
  probability: number;
};

export type BloodResult = {
  outcomes: ChildOutcome[];
};

type AboAllele = "A" | "B" | "O";
type AboGenotype = readonly [AboAllele, AboAllele];
type RhAllele = "D" | "d";
type RhGenotype = readonly [RhAllele, RhAllele];

const ABO: readonly AboType[] = ["A", "B", "AB", "O"];
const RH: readonly RhType[] = ["+", "-"];

function aboPhenotype(g: AboGenotype): AboType {
  const hasA = g.includes("A");
  const hasB = g.includes("B");
  if (hasA && hasB) return "AB";
  if (hasA) return "A";
  if (hasB) return "B";
  return "O";
}

/** Possible genotypes for a phenotype, equal prior (educational simplification). */
function aboGenotypes(type: AboType): AboGenotype[] {
  switch (type) {
    case "O":
      return [["O", "O"]];
    case "A":
      return [
        ["A", "A"],
        ["A", "O"],
      ];
    case "B":
      return [
        ["B", "B"],
        ["B", "O"],
      ];
    case "AB":
      return [["A", "B"]];
  }
}

function rhGenotypes(rh: RhType): RhGenotype[] {
  if (rh === "-") return [["d", "d"]];
  return [
    ["D", "D"],
    ["D", "d"],
  ];
}

function rhPhenotype(g: RhGenotype): RhType {
  return g.includes("D") ? "+" : "-";
}

function allelePairs<T extends string>(
  a: readonly [T, T],
  b: readonly [T, T],
): [T, T][] {
  const out: [T, T][] = [];
  for (const x of a) {
    for (const y of b) {
      // Canonical order for ABO: A before B before O
      const ordered =
        x === y
          ? ([x, y] as [T, T])
          : sortAllele(x, y);
      out.push(ordered);
    }
  }
  return out;
}

function sortAllele<T extends string>(x: T, y: T): [T, T] {
  const rank = (v: string) =>
    v === "A" || v === "D" ? 0 : v === "B" ? 1 : 2;
  return rank(x) <= rank(y) ? [x, y] : [y, x];
}

function combineAbo(parent1: AboType, parent2: AboType): Map<AboType, number> {
  const g1 = aboGenotypes(parent1);
  const g2 = aboGenotypes(parent2);
  const counts = new Map<AboType, number>();
  let total = 0;
  for (const a of g1) {
    for (const b of g2) {
      const kids = allelePairs(a, b);
      for (const kid of kids) {
        const ph = aboPhenotype(kid as AboGenotype);
        counts.set(ph, (counts.get(ph) ?? 0) + 1);
        total += 1;
      }
    }
  }
  const probs = new Map<AboType, number>();
  for (const [k, v] of counts) {
    probs.set(k, v / total);
  }
  return probs;
}

function combineRh(parent1: RhType, parent2: RhType): Map<RhType, number> {
  const g1 = rhGenotypes(parent1);
  const g2 = rhGenotypes(parent2);
  const counts = new Map<RhType, number>();
  let total = 0;
  for (const a of g1) {
    for (const b of g2) {
      const kids = allelePairs(a, b);
      for (const kid of kids) {
        const ph = rhPhenotype(kid as RhGenotype);
        counts.set(ph, (counts.get(ph) ?? 0) + 1);
        total += 1;
      }
    }
  }
  const probs = new Map<RhType, number>();
  for (const [k, v] of counts) {
    probs.set(k, v / total);
  }
  return probs;
}

export function calculateInheritance(
  mother: BloodType,
  father: BloodType,
): BloodResult {
  const abo = combineAbo(mother.abo, father.abo);
  const rh = combineRh(mother.rh, father.rh);

  const outcomes: ChildOutcome[] = [];
  for (const a of ABO) {
    const pa = abo.get(a);
    if (!pa) continue;
    for (const r of RH) {
      const pr = rh.get(r);
      if (!pr) continue;
      const probability = pa * pr;
      if (probability <= 0) continue;
      outcomes.push({
        abo: a,
        rh: r,
        label: `${a}${r}`,
        probability,
      });
    }
  }

  outcomes.sort((x, y) => y.probability - x.probability);
  return { outcomes };
}

export const ABO_TYPES: readonly AboType[] = ABO;
export const RH_TYPES: readonly RhType[] = RH;
