"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Mode = "coffee" | "wine" | "beer";

type Note = {
  id: string;
  nameDa: string;
  nameEn: string;
  descDa: string;
  descEn: string;
  related?: string[];
};

type Category = {
  id: string;
  nameDa: string;
  nameEn: string;
  color: string;
  notes: Note[];
};

const COFFEE: Category[] = [
  {
    id: "fruity",
    nameDa: "Frugt",
    nameEn: "Fruity",
    color: "hsl(8 62% 48%)",
    notes: [
      {
        id: "berry",
        nameDa: "Bær",
        nameEn: "Berry",
        descDa: "Blåbær, jordbær eller ribs. Ofte i vaskede afrikanske kaffer.",
        descEn: "Blueberry, strawberry, or currant. Common in washed African coffees.",
        related: ["citrus", "floral"],
      },
      {
        id: "citrus",
        nameDa: "Citrus",
        nameEn: "Citrus",
        descDa: "Citron, lime eller grapefrugt. Lys syre og klar finish.",
        descEn: "Lemon, lime, or grapefruit. Bright acidity and a clean finish.",
        related: ["berry", "floral"],
      },
    ],
  },
  {
    id: "floral",
    nameDa: "Blomst",
    nameEn: "Floral",
    color: "hsl(320 45% 52%)",
    notes: [
      {
        id: "jasmine",
        nameDa: "Jasmin",
        nameEn: "Jasmine",
        descDa: "Sød blomsternote, ofte sammen med te-lignende finish.",
        descEn: "Sweet floral note, often with a tea-like finish.",
        related: ["citrus", "honey"],
      },
    ],
  },
  {
    id: "sweet",
    nameDa: "Sød",
    nameEn: "Sweet",
    color: "hsl(35 70% 45%)",
    notes: [
      {
        id: "honey",
        nameDa: "Honning",
        nameEn: "Honey",
        descDa: "Rund sødme uden skarp sukkerkant.",
        descEn: "Rounded sweetness without sharp sugar edges.",
        related: ["caramel", "chocolate"],
      },
      {
        id: "caramel",
        nameDa: "Karamel",
        nameEn: "Caramel",
        descDa: "Brunet sukker og blød sødme fra mellemriste.",
        descEn: "Brown sugar and soft sweetness from medium roasts.",
        related: ["honey", "nutty"],
      },
    ],
  },
  {
    id: "nutty",
    nameDa: "Nød",
    nameEn: "Nutty",
    color: "hsl(28 48% 38%)",
    notes: [
      {
        id: "almond",
        nameDa: "Mandel",
        nameEn: "Almond",
        descDa: "Tør nød og mild sødme. Typisk i mellemamerikanske profiler.",
        descEn: "Dry nut and mild sweetness. Typical in Central American profiles.",
        related: ["caramel", "chocolate"],
      },
    ],
  },
  {
    id: "chocolate",
    nameDa: "Kakao",
    nameEn: "Cocoa",
    color: "hsl(20 40% 28%)",
    notes: [
      {
        id: "dark-choc",
        nameDa: "Mørk chokolade",
        nameEn: "Dark chocolate",
        descDa: "Kakao og bitter-sød dybde, ofte i mørkere ristninger.",
        descEn: "Cocoa and bitter-sweet depth, often in darker roasts.",
        related: ["caramel", "spice"],
      },
    ],
  },
  {
    id: "spice",
    nameDa: "Krydderi",
    nameEn: "Spice",
    color: "hsl(12 55% 40%)",
    notes: [
      {
        id: "cinnamon",
        nameDa: "Kanel",
        nameEn: "Cinnamon",
        descDa: "Varm krydderi uden røg. Kan følge med mørkere rist.",
        descEn: "Warm spice without smoke. Can appear with darker roasts.",
        related: ["dark-choc", "roasted"],
      },
    ],
  },
  {
    id: "roasted",
    nameDa: "Ristet",
    nameEn: "Roasted",
    color: "hsl(15 25% 22%)",
    notes: [
      {
        id: "toast",
        nameDa: "Toast",
        nameEn: "Toast",
        descDa: "Brunt brød og ristede korn. Signal om udvikling i risten.",
        descEn: "Brown bread and roasted grain. A sign of roast development.",
        related: ["cinnamon", "dark-choc"],
      },
    ],
  },
  {
    id: "earthy",
    nameDa: "Jord",
    nameEn: "Earthy",
    color: "hsl(90 20% 32%)",
    notes: [
      {
        id: "forest",
        nameDa: "Skovbund",
        nameEn: "Forest floor",
        descDa: "Fugtigt jord og blade. Mere typisk i nogle indonesiske profiler.",
        descEn: "Damp earth and leaves. More typical in some Indonesian profiles.",
        related: ["toast", "spice"],
      },
    ],
  },
  {
    id: "fermented",
    nameDa: "Gæret",
    nameEn: "Fermented",
    color: "hsl(280 30% 40%)",
    notes: [
      {
        id: "winey",
        nameDa: "Vinøs",
        nameEn: "Winey",
        descDa: "Rødvin-lignende frugt og gæringstoner fra processering.",
        descEn: "Red-wine-like fruit and fermentation tones from processing.",
        related: ["berry", "honey"],
      },
    ],
  },
];

const WINE: Category[] = [
  {
    id: "citrus-w",
    nameDa: "Citrus",
    nameEn: "Citrus",
    color: "hsl(50 75% 48%)",
    notes: [
      {
        id: "lemon",
        nameDa: "Citron",
        nameEn: "Lemon",
        descDa: "Frisk syre i mange hvide vine, især cool-climate.",
        descEn: "Fresh acidity in many white wines, especially cool-climate.",
        related: ["green-apple", "floral-w"],
      },
    ],
  },
  {
    id: "tree-fruit",
    nameDa: "Træfrugt",
    nameEn: "Tree fruit",
    color: "hsl(40 70% 50%)",
    notes: [
      {
        id: "green-apple",
        nameDa: "Grønt æble",
        nameEn: "Green apple",
        descDa: "Sprød frugt og grøn syre. Typisk i Riesling og Chardonnay.",
        descEn: "Crisp fruit and green acidity. Typical in Riesling and Chardonnay.",
        related: ["lemon", "mineral"],
      },
      {
        id: "peach",
        nameDa: "Fersken",
        nameEn: "Peach",
        descDa: "Blød stenfrugt i modne hvide og nogle rosés.",
        descEn: "Soft stone fruit in ripe whites and some rosés.",
        related: ["honey-w", "floral-w"],
      },
    ],
  },
  {
    id: "berry-w",
    nameDa: "Bær",
    nameEn: "Berry",
    color: "hsl(350 55% 42%)",
    notes: [
      {
        id: "cherry",
        nameDa: "Kirsebær",
        nameEn: "Cherry",
        descDa: "Rød frugt i Pinot Noir og lette røde.",
        descEn: "Red fruit in Pinot Noir and lighter reds.",
        related: ["plum", "spice-w"],
      },
      {
        id: "plum",
        nameDa: "Blomme",
        nameEn: "Plum",
        descDa: "Mørkere stenfrugt i mellemfyldige røde.",
        descEn: "Darker stone fruit in medium-bodied reds.",
        related: ["cherry", "oak"],
      },
    ],
  },
  {
    id: "floral-w",
    nameDa: "Blomst",
    nameEn: "Floral",
    color: "hsl(300 40% 55%)",
    notes: [
      {
        id: "rose",
        nameDa: "Rose",
        nameEn: "Rose",
        descDa: "Blomsterduft i Gewürztraminer og nogle røde.",
        descEn: "Floral aroma in Gewürztraminer and some reds.",
        related: ["peach", "spice-w"],
      },
    ],
  },
  {
    id: "herbal",
    nameDa: "Urte",
    nameEn: "Herbal",
    color: "hsl(120 35% 36%)",
    notes: [
      {
        id: "grass",
        nameDa: "Græs",
        nameEn: "Grass",
        descDa: "Grøn urteagtig note, ofte i Sauvignon Blanc.",
        descEn: "Green herbal note, often in Sauvignon Blanc.",
        related: ["lemon", "mineral"],
      },
    ],
  },
  {
    id: "spice-w",
    nameDa: "Krydderi",
    nameEn: "Spice",
    color: "hsl(18 60% 42%)",
    notes: [
      {
        id: "pepper",
        nameDa: "Peber",
        nameEn: "Pepper",
        descDa: "Sort peber i Syrah og nogle kølige røde.",
        descEn: "Black pepper in Syrah and some cool-climate reds.",
        related: ["cherry", "oak"],
      },
    ],
  },
  {
    id: "oak",
    nameDa: "Eg",
    nameEn: "Oak",
    color: "hsl(30 35% 34%)",
    notes: [
      {
        id: "vanilla",
        nameDa: "Vanilje",
        nameEn: "Vanilla",
        descDa: "Fra fadlagring. Blød sødme og cremet mundfølelse.",
        descEn: "From barrel aging. Soft sweetness and creamy mouthfeel.",
        related: ["toast-w", "plum"],
      },
      {
        id: "toast-w",
        nameDa: "Toast",
        nameEn: "Toast",
        descDa: "Ristet eg og brødskorpe fra tøndebehandling.",
        descEn: "Toasted oak and bread crust from barrel treatment.",
        related: ["vanilla", "honey-w"],
      },
    ],
  },
  {
    id: "mineral",
    nameDa: "Mineral",
    nameEn: "Mineral",
    color: "hsl(200 20% 45%)",
    notes: [
      {
        id: "flint",
        nameDa: "Flint",
        nameEn: "Flint",
        descDa: "Sten og kridt. Ofte diskuteret i Chablis og Mosel.",
        descEn: "Stone and chalk. Often discussed in Chablis and Mosel.",
        related: ["green-apple", "grass"],
      },
    ],
  },
  {
    id: "sweet-w",
    nameDa: "Sød",
    nameEn: "Sweet",
    color: "hsl(42 65% 48%)",
    notes: [
      {
        id: "honey-w",
        nameDa: "Honning",
        nameEn: "Honey",
        descDa: "Sødme og voksagtig dybde i sent høstede vine.",
        descEn: "Sweetness and waxy depth in late-harvest wines.",
        related: ["peach", "toast-w"],
      },
    ],
  },
];

const BEER: Category[] = [
  {
    id: "malt",
    nameDa: "Malt",
    nameEn: "Malt",
    color: "hsl(32 55% 42%)",
    notes: [
      {
        id: "bread",
        nameDa: "Brød",
        nameEn: "Bread",
        descDa: "Frisk bagt brød fra basismalt. Fundament i mange lagere.",
        descEn: "Fresh baked bread from base malt. Foundation in many lagers.",
        related: ["caramel-b", "toast-b"],
      },
      {
        id: "caramel-b",
        nameDa: "Karamel",
        nameEn: "Caramel",
        descDa: "Sød malt og toffee i amber ales og bocks.",
        descEn: "Sweet malt and toffee in amber ales and bocks.",
        related: ["bread", "roast-b"],
      },
    ],
  },
  {
    id: "hop-citrus",
    nameDa: "Humle citrus",
    nameEn: "Hop citrus",
    color: "hsl(70 55% 42%)",
    notes: [
      {
        id: "grapefruit",
        nameDa: "Grapefrugt",
        nameEn: "Grapefruit",
        descDa: "Klassisk i amerikanske IPA-humler som Cascade og Centennial.",
        descEn: "Classic in American IPA hops such as Cascade and Centennial.",
        related: ["pine", "tropical"],
      },
    ],
  },
  {
    id: "hop-pine",
    nameDa: "Humle fyr",
    nameEn: "Hop pine",
    color: "hsl(140 30% 32%)",
    notes: [
      {
        id: "pine",
        nameDa: "Fyr",
        nameEn: "Pine",
        descDa: "Harsk, grøn bitterhed fra hopolie.",
        descEn: "Resinous green bitterness from hop oils.",
        related: ["grapefruit", "herbal-b"],
      },
    ],
  },
  {
    id: "tropical",
    nameDa: "Tropisk",
    nameEn: "Tropical",
    color: "hsl(45 70% 48%)",
    notes: [
      {
        id: "mango",
        nameDa: "Mango",
        nameEn: "Mango",
        descDa: "Moden tropisk frugt i moderne IPA og NEIPA.",
        descEn: "Ripe tropical fruit in modern IPA and NEIPA.",
        related: ["grapefruit", "ester"],
      },
    ],
  },
  {
    id: "yeast",
    nameDa: "Gær",
    nameEn: "Yeast",
    color: "hsl(280 25% 45%)",
    notes: [
      {
        id: "ester",
        nameDa: "Ester",
        nameEn: "Ester",
        descDa: "Frugtester fra ale-gær. Banan og pære i weissbier.",
        descEn: "Fruit esters from ale yeast. Banana and pear in weissbier.",
        related: ["mango", "clove"],
      },
      {
        id: "clove",
        nameDa: "Nellike",
        nameEn: "Clove",
        descDa: "Fenoler fra hvedeølsgær. Krydret og tør.",
        descEn: "Phenols from wheat beer yeast. Spicy and dry.",
        related: ["ester", "herbal-b"],
      },
    ],
  },
  {
    id: "roast-b",
    nameDa: "Rist",
    nameEn: "Roast",
    color: "hsl(20 30% 22%)",
    notes: [
      {
        id: "coffee-b",
        nameDa: "Kaffe",
        nameEn: "Coffee",
        descDa: "Ristet malt i stout og porter.",
        descEn: "Roasted malt in stout and porter.",
        related: ["caramel-b", "toast-b"],
      },
      {
        id: "toast-b",
        nameDa: "Toast",
        nameEn: "Toast",
        descDa: "Brunt brød og ristede korn uden fuld bitter rist.",
        descEn: "Brown bread and toasted grain without full roast bitterness.",
        related: ["bread", "coffee-b"],
      },
    ],
  },
  {
    id: "herbal-b",
    nameDa: "Urte",
    nameEn: "Herbal",
    color: "hsl(110 28% 36%)",
    notes: [
      {
        id: "tea",
        nameDa: "Te",
        nameEn: "Tea",
        descDa: "Tør urteagtig finish i nogle europæiske humler.",
        descEn: "Dry herbal finish in some European hops.",
        related: ["pine", "clove"],
      },
    ],
  },
  {
    id: "smoke",
    nameDa: "Røg",
    nameEn: "Smoke",
    color: "hsl(0 0% 30%)",
    notes: [
      {
        id: "rauch",
        nameDa: "Røgmalt",
        nameEn: "Smoked malt",
        descDa: "Røget korn, klassisk i rauchbier.",
        descEn: "Smoked grain, classic in rauchbier.",
        related: ["coffee-b", "toast-b"],
      },
    ],
  },
  {
    id: "acid",
    nameDa: "Syre",
    nameEn: "Acid",
    color: "hsl(160 40% 38%)",
    notes: [
      {
        id: "tart",
        nameDa: "Syre",
        nameEn: "Tart",
        descDa: "Mælke- eller eddikesyre i sour beer og lambic.",
        descEn: "Lactic or acetic acid in sour beer and lambic.",
        related: ["ester", "mango"],
      },
    ],
  },
];

const BY_MODE: Record<Mode, Category[]> = {
  coffee: COFFEE,
  wine: WINE,
  beer: BEER,
};

function wedgePath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = cx + r1 * Math.cos(a0);
  const y0 = cy + r1 * Math.sin(a0);
  const x1 = cx + r1 * Math.cos(a1);
  const y1 = cy + r1 * Math.sin(a1);
  const x2 = cx + r0 * Math.cos(a1);
  const y2 = cy + r0 * Math.sin(a1);
  const x3 = cx + r0 * Math.cos(a0);
  const y3 = cy + r0 * Math.sin(a0);
  return `M ${x0} ${y0} A ${r1} ${r1} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}

function findNote(
  cats: Category[],
  noteId: string,
): { cat: Category; note: Note } | null {
  for (const cat of cats) {
    const note = cat.notes.find((n) => n.id === noteId);
    if (note) return { cat, note };
  }
  return null;
}

export function SmagshjulTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<Mode>("coffee");
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const categories = BY_MODE[mode];

  const activeCat =
    categories.find((c) => c.id === activeCatId) ?? categories[0]!;
  const activeNote =
    activeCat.notes.find((n) => n.id === activeNoteId) ??
    activeCat.notes[0] ??
    null;

  const relatedNotes = useMemo(() => {
    if (!activeNote?.related) return [];
    return activeNote.related
      .map((id) => findNote(categories, id))
      .filter(Boolean) as Array<{ cat: Category; note: Note }>;
  }, [activeNote, categories]);

  function selectMode(next: Mode) {
    setMode(next);
    const first = BY_MODE[next][0]!;
    setActiveCatId(first.id);
    setActiveNoteId(first.notes[0]?.id ?? null);
  }

  function selectCategory(catId: string) {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    setActiveCatId(cat.id);
    setActiveNoteId(cat.notes[0]?.id ?? null);
  }

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const outer = 148;
  const inner = 52;
  const n = categories.length;

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Udforsk aroma- og smagsnoter for kaffe, vin eller øl. Klik en kategori på hjulet, vælg en note, og se beslægtede toner."
          : "Explore aroma and flavor notes for coffee, wine, or beer. Click a wheel category, pick a note, and see related tones."}
      </p>

      <Segmented
        value={mode}
        onChange={selectMode}
        ariaLabel={da ? "Mode" : "Mode"}
        options={[
          { id: "coffee", label: da ? "Kaffe" : "Coffee" },
          { id: "wine", label: da ? "Vin" : "Wine" },
          { id: "beer", label: da ? "Øl" : "Beer" },
        ]}
      />

      <section className="kit-tool-panel grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:p-5">
        <div className="mx-auto w-full max-w-[320px]">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="h-auto w-full"
            role="img"
            aria-label={da ? "Smagshjul" : "Flavor wheel"}
          >
            {categories.map((cat, i) => {
              const a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
              const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
              const mid = (a0 + a1) / 2;
              const selected = cat.id === activeCat.id;
              const lx = cx + (outer + inner) / 2 * Math.cos(mid);
              const ly = cy + (outer + inner) / 2 * Math.sin(mid);
              return (
                <g key={cat.id}>
                  <path
                    d={wedgePath(cx, cy, inner, outer, a0, a1)}
                    fill={cat.color}
                    opacity={selected ? 1 : 0.78}
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth={selected ? 2.5 : 1}
                    className="cursor-pointer transition-opacity hover:opacity-100"
                    onClick={() => selectCategory(cat.id)}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none select-none fill-white text-[9px] font-medium"
                    style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.35)", strokeWidth: 2 }}
                  >
                    {(da ? cat.nameDa : cat.nameEn).slice(0, 10)}
                  </text>
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={inner - 2} className="fill-surface" />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-[11px] font-medium"
            >
              {da
                ? mode === "coffee"
                  ? "Kaffe"
                  : mode === "wine"
                    ? "Vin"
                    : "Øl"
                : mode === "coffee"
                  ? "Coffee"
                  : mode === "wine"
                    ? "Wine"
                    : "Beer"}
            </text>
          </svg>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted">
              {da ? "Kategori" : "Category"}
            </p>
            <h2 className="text-base font-medium text-foreground">
              {da ? activeCat.nameDa : activeCat.nameEn}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeCat.notes.map((note) => {
              const on = note.id === activeNote?.id;
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setActiveNoteId(note.id)}
                  className={`rounded-[10px] border px-3 py-1.5 text-sm transition-colors ${
                    on
                      ? "border-accent bg-accent-soft text-foreground"
                      : "border-border bg-surface text-foreground hover:bg-overlay"
                  }`}
                >
                  {da ? note.nameDa : note.nameEn}
                </button>
              );
            })}
          </div>

          {activeNote ? (
            <div className="space-y-3 rounded-[10px] border border-border bg-background/40 p-3">
              <h3 className="text-sm font-medium text-foreground">
                {da ? activeNote.nameDa : activeNote.nameEn}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {da ? activeNote.descDa : activeNote.descEn}
              </p>
              {relatedNotes.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">
                    {da ? "Beslægtede noter" : "Related notes"}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {relatedNotes.map(({ cat, note }) => (
                      <li key={note.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCatId(cat.id);
                            setActiveNoteId(note.id);
                          }}
                          className="rounded-full border border-border px-2.5 py-1 text-xs text-foreground hover:bg-overlay"
                        >
                          {da ? note.nameDa : note.nameEn}
                          <span className="text-muted">
                            {" "}
                            · {da ? cat.nameDa : cat.nameEn}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
