"use client";

import type { ReactNode } from "react";
import {
  M,
  MFrac,
  MOp,
  MPow,
  MSqrt,
  MSub,
  MText,
} from "./MathFormula";

/** Visual formula for a suite tool id. */
export const TOOL_FORMULAS: Record<string, ReactNode> = {
  lommeregner: (
    <M>
      <MText>a</MText>
      <MOp>+</MOp>
      <MText>b</MText>
      <MOp>×</MOp>
      <MText>c</MText>
      <MOp>÷</MOp>
      <MText>d</MText>
    </M>
  ),
  procent: (
    <M>
      <MText>p</MText>
      <MOp>%</MOp>
      <MOp>·</MOp>
      <MText>a</MText>
      <MOp>=</MOp>
      <MFrac num={<>p · a</>} den={<>100</>} />
    </M>
  ),
  gangetabel: (
    <M>
      <MText>a</MText>
      <MOp>×</MOp>
      <MText>b</MText>
      <MOp>=</MOp>
      <MText>c</MText>
    </M>
  ),
  fractionsimplify: (
    <M>
      <MFrac num={<>24</>} den={<>36</>} />
      <MOp>=</MOp>
      <MFrac num={<>2</>} den={<>3</>} />
    </M>
  ),
  percentfraction: (
    <M>
      <MText>37,5%</MText>
      <MOp>=</MOp>
      <MFrac num={<>3</>} den={<>8</>} />
    </M>
  ),
  fractionops: (
    <M>
      <MFrac num={<>a</>} den={<>b</>} />
      <MOp>±</MOp>
      <MFrac num={<>c</>} den={<>d</>} />
      <MOp>=</MOp>
      <MFrac num={<>ad ± bc</>} den={<>bd</>} />
    </M>
  ),
  powerroot: (
    <M>
      <MPow base={<MText>a</MText>} exp={<>n</>} />
      <MOp>,</MOp>
      <MSqrt index={<>n</>}>
        <MText>a</MText>
      </MSqrt>
    </M>
  ),
  roundnum: (
    <M>
      <MText>12,3456</MText>
      <MOp>→</MOp>
      <MText>12,35</MText>
    </M>
  ),
  gcdlcm: (
    <M>
      <MText>SFD</MText>
      <MOp>(</MOp>
      <MText>a,b</MText>
      <MOp>)</MOp>
      <MOp>,</MOp>
      <MText>MFM</MText>
      <MOp>(</MOp>
      <MText>a,b</MText>
      <MOp>)</MOp>
    </M>
  ),
  prime: (
    <M>
      <MText>n</MText>
      <MOp>=</MOp>
      <MText>p</MText>
      <MOp>?</MOp>
    </M>
  ),
  factorize: (
    <M>
      <MText>360</MText>
      <MOp>=</MOp>
      <MPow base={<>2</>} exp={<>3</>} />
      <MOp>·</MOp>
      <MPow base={<>3</>} exp={<>2</>} />
      <MOp>·</MOp>
      <MText>5</MText>
    </M>
  ),
  ratio: (
    <M>
      <MText>a : b</MText>
      <MOp>=</MOp>
      <MFrac num={<>a</>} den={<>d</>} />
      <MOp>:</MOp>
      <MFrac num={<>b</>} den={<>d</>} />
    </M>
  ),
  roman: (
    <M>
      <MText>14</MText>
      <MOp>↔</MOp>
      <MText>XIV</MText>
    </M>
  ),
  numberbase: (
    <M>
      <MSub base={<>1010</>} sub={<>2</>} />
      <MOp>=</MOp>
      <MSub base={<>10</>} sub={<>10</>} />
    </M>
  ),
  binary: (
    <M>
      <MText>13</MText>
      <MOp>=</MOp>
      <MSub base={<>1101</>} sub={<>2</>} />
    </M>
  ),
  lineareq: (
    <M>
      <MText>ax</MText>
      <MOp>+</MOp>
      <MText>b</MText>
      <MOp>=</MOp>
      <MText>c</MText>
      <MOp>⇒</MOp>
      <MText>x</MText>
      <MOp>=</MOp>
      <MFrac num={<>c − b</>} den={<>a</>} />
    </M>
  ),
  quadraticeq: (
    <M>
      <MText>x</MText>
      <MOp>=</MOp>
      <MFrac
        num={
          <>
            −b ± <MSqrt>b² − 4ac</MSqrt>
          </>
        }
        den={<>2a</>}
      />
    </M>
  ),
  grade: (
    <M>
      <MFrac num={<>point</>} den={<>max</>} />
      <MOp>·</MOp>
      <MText>100%</MText>
    </M>
  ),
  pythagoras: (
    <M>
      <MPow base={<MText>a</MText>} exp={<>2</>} />
      <MOp>+</MOp>
      <MPow base={<MText>b</MText>} exp={<>2</>} />
      <MOp>=</MOp>
      <MPow base={<MText>c</MText>} exp={<>2</>} />
    </M>
  ),
  area: (
    <M>
      <MText>A</MText>
      <MOp>=</MOp>
      <MText>l · b</MText>
      <MOp>,</MOp>
      <MText>π</MText>
      <MPow base={<MText>r</MText>} exp={<>2</>} />
    </M>
  ),
  volume: (
    <M>
      <MText>V</MText>
      <MOp>=</MOp>
      <MText>l · b · h</MText>
      <MOp>,</MOp>
      <MFrac num={<>4</>} den={<>3</>} />
      <MText>π</MText>
      <MPow base={<MText>r</MText>} exp={<>3</>} />
    </M>
  ),
  circlemath: (
    <M>
      <MText>O</MText>
      <MOp>=</MOp>
      <MText>2πr</MText>
      <MOp>,</MOp>
      <MText>A</MText>
      <MOp>=</MOp>
      <MText>π</MText>
      <MPow base={<MText>r</MText>} exp={<>2</>} />
    </M>
  ),
  angleconvert: (
    <M>
      <MText>θ</MText>
      <MOp>=</MOp>
      <MText>θ°</MText>
      <MOp>·</MOp>
      <MFrac num={<>π</>} den={<>180</>} />
    </M>
  ),
  trigsolve: (
    <M>
      <MText>sin θ</MText>
      <MOp>=</MOp>
      <MFrac num={<>mod</>} den={<>hyp</>} />
      <MOp>,</MOp>
      <MText>cos θ</MText>
      <MOp>=</MOp>
      <MFrac num={<>hos</>} den={<>hyp</>} />
    </M>
  ),
  coordgeom: (
    <M>
      <MText>d</MText>
      <MOp>=</MOp>
      <MSqrt>
        <MPow base={<>Δx</>} exp={<>2</>} />
        <MOp>+</MOp>
        <MPow base={<>Δy</>} exp={<>2</>} />
      </MSqrt>
    </M>
  ),
  geometri: (
    <M>
      <MText>A</MText>
      <MOp>,</MOp>
      <MText>O</MText>
      <MOp>,</MOp>
      <MText>∠</MText>
    </M>
  ),
  funkplot: (
    <M>
      <MText>y</MText>
      <MOp>=</MOp>
      <MText>f</MText>
      <MOp>(</MOp>
      <MText>x</MText>
      <MOp>)</MOp>
    </M>
  ),
  formellab: (
    <M>
      <MText>v</MText>
      <MOp>=</MOp>
      <MFrac num={<>s</>} den={<>t</>} />
      <MOp>,</MOp>
      <MText>F</MText>
      <MOp>=</MOp>
      <MText>m · a</MText>
    </M>
  ),
  average: (
    <M>
      <MText>x̄</MText>
      <MOp>=</MOp>
      <MFrac
        num={
          <>
            <MSub base={<>x</>} sub={<>1</>} /> + ⋯ +{" "}
            <MSub base={<>x</>} sub={<>n</>} />
          </>
        }
        den={<>n</>}
      />
    </M>
  ),
  statistik: (
    <M>
      <MText>σ</MText>
      <MOp>,</MOp>
      <MText>x̄</MText>
      <MOp>,</MOp>
      <MText>n</MText>
    </M>
  ),
  combinatorics: (
    <M>
      <MText>C</MText>
      <MOp>(</MOp>
      <MText>n,k</MText>
      <MOp>)</MOp>
      <MOp>=</MOp>
      <MFrac
        num={
          <>
            <MText>n!</MText>
          </>
        }
        den={
          <>
            <MText>k!</MText>
            <MOp>(</MOp>
            <MText>n − k</MText>
            <MOp>)</MOp>
            <MText>!</MText>
          </>
        }
      />
    </M>
  ),
  fraktal: (
    <M>
      <MSub base={<>z</>} sub={<>n+1</>} />
      <MOp>=</MOp>
      <MPow base={<MSub base={<>z</>} sub={<>n</>} />} exp={<>2</>} />
      <MOp>+</MOp>
      <MText>c</MText>
    </M>
  ),
  logik: (
    <M>
      <MText>A</MText>
      <MOp>∧</MOp>
      <MText>B</MText>
      <MOp>,</MOp>
      <MText>A</MText>
      <MOp>∨</MOp>
      <MText>B</MText>
      <MOp>,</MOp>
      <MOp>¬</MOp>
      <MText>A</MText>
    </M>
  ),
  formelsamling: (
    <M>
      <MPow base={<MText>a</MText>} exp={<>2</>} />
      <MOp>+</MOp>
      <MPow base={<MText>b</MText>} exp={<>2</>} />
      <MOp>=</MOp>
      <MPow base={<MText>c</MText>} exp={<>2</>} />
    </M>
  ),
};

export type SheetFormula = {
  id: string;
  topicDa: string;
  topicEn: string;
  nameDa: string;
  nameEn: string;
  noteDa: string;
  noteEn: string;
  level: "simple" | "advanced";
  /** Plain text used for search. */
  search: string;
  view: ReactNode;
};

export const SHEET_FORMULAS: SheetFormula[] = [
  {
    id: "pct-of",
    topicDa: "Procent",
    topicEn: "Percent",
    nameDa: "Procent af",
    nameEn: "Percent of",
    noteDa: "Find delen af en helhed.",
    noteEn: "Find a part of a whole.",
    level: "simple",
    search: "procent af percent p% a",
    view: (
      <M>
        <MText>p</MText>
        <MOp>%</MOp>
        <MOp>·</MOp>
        <MText>a</MText>
        <MOp>=</MOp>
        <MFrac num={<>p · a</>} den={<>100</>} />
      </M>
    ),
  },
  {
    id: "pct-change",
    topicDa: "Procent",
    topicEn: "Percent",
    nameDa: "Procentvis ændring",
    nameEn: "Percent change",
    noteDa: "Positiv er stigning, negativ er fald.",
    noteEn: "Positive is increase, negative is decrease.",
    level: "simple",
    search: "procentvis ændring percent change",
    view: (
      <M>
        <MFrac num={<>ny − gammel</>} den={<>gammel</>} />
        <MOp>·</MOp>
        <MText>100%</MText>
      </M>
    ),
  },
  {
    id: "frac-add",
    topicDa: "Brøk",
    topicEn: "Fractions",
    nameDa: "Plus / minus",
    nameEn: "Add / subtract",
    noteDa: "Fælles nævner først.",
    noteEn: "Common denominator first.",
    level: "simple",
    search: "brøk plus minus add subtract",
    view: (
      <M>
        <MFrac num={<>a</>} den={<>b</>} />
        <MOp>±</MOp>
        <MFrac num={<>c</>} den={<>d</>} />
        <MOp>=</MOp>
        <MFrac num={<>ad ± bc</>} den={<>bd</>} />
      </M>
    ),
  },
  {
    id: "frac-mul",
    topicDa: "Brøk",
    topicEn: "Fractions",
    nameDa: "Gange",
    nameEn: "Multiply",
    noteDa: "Forkort før eller efter.",
    noteEn: "Cancel before or after.",
    level: "simple",
    search: "brøk gange multiply",
    view: (
      <M>
        <MFrac num={<>a</>} den={<>b</>} />
        <MOp>×</MOp>
        <MFrac num={<>c</>} den={<>d</>} />
        <MOp>=</MOp>
        <MFrac num={<>ac</>} den={<>bd</>} />
      </M>
    ),
  },
  {
    id: "frac-div",
    topicDa: "Brøk",
    topicEn: "Fractions",
    nameDa: "Dividér",
    nameEn: "Divide",
    noteDa: "Gange med den omvendte brøk.",
    noteEn: "Multiply by the reciprocal.",
    level: "simple",
    search: "brøk divider divide",
    view: (
      <M>
        <MFrac num={<>a</>} den={<>b</>} />
        <MOp>÷</MOp>
        <MFrac num={<>c</>} den={<>d</>} />
        <MOp>=</MOp>
        <MFrac num={<>a</>} den={<>b</>} />
        <MOp>×</MOp>
        <MFrac num={<>d</>} den={<>c</>} />
      </M>
    ),
  },
  {
    id: "power",
    topicDa: "Potens",
    topicEn: "Powers",
    nameDa: "Potensregler",
    nameEn: "Power rules",
    noteDa: "Samme grundtal.",
    noteEn: "Same base.",
    level: "simple",
    search: "potens power a^m",
    view: (
      <M>
        <MPow base={<MText>a</MText>} exp={<>m</>} />
        <MOp>·</MOp>
        <MPow base={<MText>a</MText>} exp={<>n</>} />
        <MOp>=</MOp>
        <MPow base={<MText>a</MText>} exp={<>m + n</>} />
      </M>
    ),
  },
  {
    id: "pythagoras",
    topicDa: "Geometri",
    topicEn: "Geometry",
    nameDa: "Pythagoras",
    nameEn: "Pythagoras",
    noteDa: "Kun retvinklet trekant. c er hypotenusen.",
    noteEn: "Right triangle only. c is the hypotenuse.",
    level: "simple",
    search: "pythagoras a2 b2 c2",
    view: (
      <M>
        <MPow base={<MText>a</MText>} exp={<>2</>} />
        <MOp>+</MOp>
        <MPow base={<MText>b</MText>} exp={<>2</>} />
        <MOp>=</MOp>
        <MPow base={<MText>c</MText>} exp={<>2</>} />
      </M>
    ),
  },
  {
    id: "circle",
    topicDa: "Geometri",
    topicEn: "Geometry",
    nameDa: "Cirkel",
    nameEn: "Circle",
    noteDa: "O omkreds, A areal.",
    noteEn: "O circumference, A area.",
    level: "simple",
    search: "cirkel omkreds areal circle",
    view: (
      <M>
        <MText>O</MText>
        <MOp>=</MOp>
        <MText>2πr</MText>
        <MOp>,</MOp>
        <MText>A</MText>
        <MOp>=</MOp>
        <MText>π</MText>
        <MPow base={<MText>r</MText>} exp={<>2</>} />
      </M>
    ),
  },
  {
    id: "triangle-area",
    topicDa: "Geometri",
    topicEn: "Geometry",
    nameDa: "Trekantsareal",
    nameEn: "Triangle area",
    noteDa: "g er grundlinje, h er højde.",
    noteEn: "g is base, h is height.",
    level: "simple",
    search: "trekant areal triangle area",
    view: (
      <M>
        <MText>A</MText>
        <MOp>=</MOp>
        <MFrac num={<>1</>} den={<>2</>} />
        <MOp>·</MOp>
        <MText>g</MText>
        <MOp>·</MOp>
        <MText>h</MText>
      </M>
    ),
  },
  {
    id: "trig",
    topicDa: "Trigonometri",
    topicEn: "Trigonometry",
    nameDa: "sin, cos, tan",
    nameEn: "sin, cos, tan",
    noteDa: "I retvinklet trekant.",
    noteEn: "In a right triangle.",
    level: "advanced",
    search: "sin cos tan trigonometri",
    view: (
      <M>
        <MText>sin</MText>
        <MOp>=</MOp>
        <MFrac num={<>mod</>} den={<>hyp</>} />
        <MOp>,</MOp>
        <MText>cos</MText>
        <MOp>=</MOp>
        <MFrac num={<>hos</>} den={<>hyp</>} />
        <MOp>,</MOp>
        <MText>tan</MText>
        <MOp>=</MOp>
        <MFrac num={<>mod</>} den={<>hos</>} />
      </M>
    ),
  },
  {
    id: "rad",
    topicDa: "Trigonometri",
    topicEn: "Trigonometry",
    nameDa: "Grader og radianer",
    nameEn: "Degrees and radians",
    noteDa: "En fuld cirkel er 2π radianer.",
    noteEn: "A full circle is 2π radians.",
    level: "advanced",
    search: "radianer grader degrees radians",
    view: (
      <M>
        <MSub base={<>θ</>} sub={<>rad</>} />
        <MOp>=</MOp>
        <MSub base={<>θ</>} sub={<>deg</>} />
        <MOp>·</MOp>
        <MFrac num={<>π</>} den={<>180</>} />
      </M>
    ),
  },
  {
    id: "linear",
    topicDa: "Algebra",
    topicEn: "Algebra",
    nameDa: "Førstegrad",
    nameEn: "Linear",
    noteDa: "a ≠ 0.",
    noteEn: "a ≠ 0.",
    level: "simple",
    search: "førstegrad linear ax+b",
    view: (
      <M>
        <MText>ax</MText>
        <MOp>+</MOp>
        <MText>b</MText>
        <MOp>=</MOp>
        <MText>c</MText>
        <MOp>⇒</MOp>
        <MText>x</MText>
        <MOp>=</MOp>
        <MFrac num={<>c − b</>} den={<>a</>} />
      </M>
    ),
  },
  {
    id: "quadratic",
    topicDa: "Algebra",
    topicEn: "Algebra",
    nameDa: "Andengrad",
    nameEn: "Quadratic",
    noteDa: "D = b² − 4ac. D < 0: ingen reelle rødder.",
    noteEn: "D = b² − 4ac. D < 0: no real roots.",
    level: "advanced",
    search: "andengrad quadratic diskriminant",
    view: (
      <M>
        <MText>x</MText>
        <MOp>=</MOp>
        <MFrac
          num={
            <>
              −b ± <MSqrt>b² − 4ac</MSqrt>
            </>
          }
          den={<>2a</>}
        />
      </M>
    ),
  },
  {
    id: "distance",
    topicDa: "Koordinater",
    topicEn: "Coordinates",
    nameDa: "Afstand",
    nameEn: "Distance",
    noteDa: "Mellem to punkter i planen.",
    noteEn: "Between two points in the plane.",
    level: "advanced",
    search: "afstand distance koordinat",
    view: (
      <M>
        <MText>d</MText>
        <MOp>=</MOp>
        <MSqrt>
          <MPow base={<>(x₂ − x₁)</>} exp={<>2</>} />
          <MOp>+</MOp>
          <MPow base={<>(y₂ − y₁)</>} exp={<>2</>} />
        </MSqrt>
      </M>
    ),
  },
  {
    id: "slope",
    topicDa: "Koordinater",
    topicEn: "Coordinates",
    nameDa: "Hældning",
    nameEn: "Slope",
    noteDa: "Linjen y = ax + b.",
    noteEn: "The line y = ax + b.",
    level: "advanced",
    search: "hældning slope",
    view: (
      <M>
        <MText>a</MText>
        <MOp>=</MOp>
        <MFrac num={<>y₂ − y₁</>} den={<>x₂ − x₁</>} />
      </M>
    ),
  },
  {
    id: "mean",
    topicDa: "Statistik",
    topicEn: "Statistics",
    nameDa: "Gennemsnit",
    nameEn: "Mean",
    noteDa: "Aritmetisk middelværdi.",
    noteEn: "Arithmetic mean.",
    level: "simple",
    search: "gennemsnit mean average",
    view: (
      <M>
        <MText>x̄</MText>
        <MOp>=</MOp>
        <MFrac
          num={
            <>
              <MSub base={<>x</>} sub={<>1</>} /> + ⋯ +{" "}
              <MSub base={<>x</>} sub={<>n</>} />
            </>
          }
          den={<>n</>}
        />
      </M>
    ),
  },
  {
    id: "combinations",
    topicDa: "Kombinatorik",
    topicEn: "Combinatorics",
    nameDa: "Kombinationer",
    nameEn: "Combinations",
    noteDa: "Uden rækkefølge.",
    noteEn: "Order does not matter.",
    level: "advanced",
    search: "kombinationer C(n,k)",
    view: (
      <M>
        <MText>C</MText>
        <MOp>(</MOp>
        <MText>n,k</MText>
        <MOp>)</MOp>
        <MOp>=</MOp>
        <MFrac num={<>n!</>} den={<>k! (n − k)!</>} />
      </M>
    ),
  },
  {
    id: "permutations",
    topicDa: "Kombinatorik",
    topicEn: "Combinatorics",
    nameDa: "Permutationer",
    nameEn: "Permutations",
    noteDa: "Med rækkefølge.",
    noteEn: "Order matters.",
    level: "advanced",
    search: "permutationer P(n,k)",
    view: (
      <M>
        <MText>P</MText>
        <MOp>(</MOp>
        <MText>n,k</MText>
        <MOp>)</MOp>
        <MOp>=</MOp>
        <MFrac num={<>n!</>} den={<>(n − k)!</>} />
      </M>
    ),
  },
];

/** Text search over the school formula sheet (ignores rendered formula nodes). */
export function searchSheetFormulas(
  query: string,
  limit = 5,
): SheetFormula[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 3 || /^\d+$/.test(q)) return [];
  const scored: { row: SheetFormula; score: number }[] = [];
  for (const row of SHEET_FORMULAS) {
    const nameDa = row.nameDa.toLowerCase();
    const nameEn = row.nameEn.toLowerCase();
    const search = row.search.toLowerCase();
    const topicDa = row.topicDa.toLowerCase();
    const topicEn = row.topicEn.toLowerCase();
    let score = -1;
    if (nameDa === q || nameEn === q) score = 100;
    else if (nameDa.startsWith(q) || nameEn.startsWith(q)) score = 90;
    else if (search.includes(q)) score = 80;
    else if (nameDa.includes(q) || nameEn.includes(q)) score = 70;
    else if (topicDa.includes(q) || topicEn.includes(q)) score = 55;
    if (score >= 0) scored.push({ row, score });
  }
  scored.sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
  return scored.slice(0, limit).map((s) => s.row);
}
