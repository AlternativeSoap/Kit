"use client";

import { useMemo, useState } from "react";
import { Field,
  KitInput,
  KitSelect,
  primaryBtnClass,
  secondaryBtnClass, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Category =
  | "fruit"
  | "veg"
  | "grain"
  | "dairy"
  | "protein"
  | "fat"
  | "other";

type Food = {
  id: string;
  nameDa: string;
  nameEn: string;
  category: Category;
  /** Approximate values per 100 g. */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  noteDa?: string;
  noteEn?: string;
};

type TrayItem = {
  key: string;
  foodId: string;
  grams: number;
};

const FOODS: Food[] = [
  {
    id: "apple",
    nameDa: "Æble",
    nameEn: "Apple",
    category: "fruit",
    kcal: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    noteDa: "Med skræl. Naturligt sukker og fiber.",
    noteEn: "With skin. Natural sugars and fiber.",
  },
  {
    id: "banana",
    nameDa: "Banan",
    nameEn: "Banana",
    category: "fruit",
    kcal: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
  },
  {
    id: "orange",
    nameDa: "Appelsin",
    nameEn: "Orange",
    category: "fruit",
    kcal: 47,
    protein: 0.9,
    carbs: 12,
    fat: 0.1,
  },
  {
    id: "strawberry",
    nameDa: "Jordbær",
    nameEn: "Strawberry",
    category: "fruit",
    kcal: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
  },
  {
    id: "blueberry",
    nameDa: "Blåbær",
    nameEn: "Blueberry",
    category: "fruit",
    kcal: 57,
    protein: 0.7,
    carbs: 14,
    fat: 0.3,
  },
  {
    id: "grape",
    nameDa: "Druer",
    nameEn: "Grapes",
    category: "fruit",
    kcal: 69,
    protein: 0.7,
    carbs: 18,
    fat: 0.2,
  },
  {
    id: "avocado",
    nameDa: "Avocado",
    nameEn: "Avocado",
    category: "fruit",
    kcal: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    noteDa: "Højt fedtindhold, mest umættet.",
    noteEn: "High fat, mostly unsaturated.",
  },
  {
    id: "carrot",
    nameDa: "Gulerod",
    nameEn: "Carrot",
    category: "veg",
    kcal: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
  },
  {
    id: "broccoli",
    nameDa: "Broccoli",
    nameEn: "Broccoli",
    category: "veg",
    kcal: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
  },
  {
    id: "spinach",
    nameDa: "Spinat",
    nameEn: "Spinach",
    category: "veg",
    kcal: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
  },
  {
    id: "tomato",
    nameDa: "Tomat",
    nameEn: "Tomato",
    category: "veg",
    kcal: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
  },
  {
    id: "cucumber",
    nameDa: "Agurk",
    nameEn: "Cucumber",
    category: "veg",
    kcal: 15,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
  },
  {
    id: "potato",
    nameDa: "Kartoffel",
    nameEn: "Potato",
    category: "veg",
    kcal: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    noteDa: "Kogt, uden tilsat fedt.",
    noteEn: "Boiled, no added fat.",
  },
  {
    id: "onion",
    nameDa: "Løg",
    nameEn: "Onion",
    category: "veg",
    kcal: 40,
    protein: 1.1,
    carbs: 9,
    fat: 0.1,
  },
  {
    id: "bell-pepper",
    nameDa: "Peberfrugt",
    nameEn: "Bell pepper",
    category: "veg",
    kcal: 31,
    protein: 1,
    carbs: 6,
    fat: 0.3,
  },
  {
    id: "oats",
    nameDa: "Havregryn",
    nameEn: "Oats",
    category: "grain",
    kcal: 389,
    protein: 17,
    carbs: 66,
    fat: 7,
    noteDa: "Tørre gryn før tilberedning.",
    noteEn: "Dry oats before cooking.",
  },
  {
    id: "rice-white",
    nameDa: "Hvid ris",
    nameEn: "White rice",
    category: "grain",
    kcal: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    noteDa: "Kogt.",
    noteEn: "Cooked.",
  },
  {
    id: "rice-brown",
    nameDa: "Brun ris",
    nameEn: "Brown rice",
    category: "grain",
    kcal: 112,
    protein: 2.3,
    carbs: 24,
    fat: 0.8,
    noteDa: "Kogt.",
    noteEn: "Cooked.",
  },
  {
    id: "pasta",
    nameDa: "Pasta",
    nameEn: "Pasta",
    category: "grain",
    kcal: 131,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    noteDa: "Kogt, almindelig hvedepasta.",
    noteEn: "Cooked wheat pasta.",
  },
  {
    id: "bread-wheat",
    nameDa: "Hvedebrød",
    nameEn: "Wheat bread",
    category: "grain",
    kcal: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2,
  },
  {
    id: "rye-bread",
    nameDa: "Rugbrød",
    nameEn: "Rye bread",
    category: "grain",
    kcal: 220,
    protein: 7,
    carbs: 42,
    fat: 1.8,
  },
  {
    id: "quinoa",
    nameDa: "Quinoa",
    nameEn: "Quinoa",
    category: "grain",
    kcal: 120,
    protein: 4.4,
    carbs: 21,
    fat: 1.9,
    noteDa: "Kogt.",
    noteEn: "Cooked.",
  },
  {
    id: "milk-semi",
    nameDa: "Letmælk",
    nameEn: "Semi-skimmed milk",
    category: "dairy",
    kcal: 46,
    protein: 3.4,
    carbs: 4.8,
    fat: 1.5,
  },
  {
    id: "yogurt-plain",
    nameDa: "Naturel yoghurt",
    nameEn: "Plain yogurt",
    category: "dairy",
    kcal: 61,
    protein: 3.5,
    carbs: 4.7,
    fat: 3.3,
  },
  {
    id: "cheese-cheddar",
    nameDa: "Cheddar",
    nameEn: "Cheddar",
    category: "dairy",
    kcal: 403,
    protein: 25,
    carbs: 1.3,
    fat: 33,
  },
  {
    id: "cottage",
    nameDa: "Hytteost",
    nameEn: "Cottage cheese",
    category: "dairy",
    kcal: 98,
    protein: 11,
    carbs: 3.4,
    fat: 4.3,
  },
  {
    id: "egg",
    nameDa: "Æg",
    nameEn: "Egg",
    category: "protein",
    kcal: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    noteDa: "Hele æg, kogt eller rå vægt.",
    noteEn: "Whole egg, cooked or raw weight.",
  },
  {
    id: "chicken-breast",
    nameDa: "Kyllingebryst",
    nameEn: "Chicken breast",
    category: "protein",
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    noteDa: "Stegt, uden skind.",
    noteEn: "Cooked, skinless.",
  },
  {
    id: "salmon",
    nameDa: "Laks",
    nameEn: "Salmon",
    category: "protein",
    kcal: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
  },
  {
    id: "tuna",
    nameDa: "Tun",
    nameEn: "Tuna",
    category: "protein",
    kcal: 132,
    protein: 28,
    carbs: 0,
    fat: 1.3,
    noteDa: "Dåsetun i vand, afdryppet.",
    noteEn: "Canned in water, drained.",
  },
  {
    id: "beef-lean",
    nameDa: "Oksekød magert",
    nameEn: "Lean beef",
    category: "protein",
    kcal: 217,
    protein: 26,
    carbs: 0,
    fat: 12,
  },
  {
    id: "pork-loin",
    nameDa: "Svinekam",
    nameEn: "Pork loin",
    category: "protein",
    kcal: 242,
    protein: 27,
    carbs: 0,
    fat: 14,
  },
  {
    id: "tofu",
    nameDa: "Tofu",
    nameEn: "Tofu",
    category: "protein",
    kcal: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
  },
  {
    id: "lentils",
    nameDa: "Linser",
    nameEn: "Lentils",
    category: "protein",
    kcal: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    noteDa: "Kogte.",
    noteEn: "Cooked.",
  },
  {
    id: "chickpeas",
    nameDa: "Kikærter",
    nameEn: "Chickpeas",
    category: "protein",
    kcal: 164,
    protein: 8.9,
    carbs: 27,
    fat: 2.6,
    noteDa: "Kogte.",
    noteEn: "Cooked.",
  },
  {
    id: "almonds",
    nameDa: "Mandler",
    nameEn: "Almonds",
    category: "fat",
    kcal: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
  },
  {
    id: "walnuts",
    nameDa: "Valnødder",
    nameEn: "Walnuts",
    category: "fat",
    kcal: 654,
    protein: 15,
    carbs: 14,
    fat: 65,
  },
  {
    id: "peanut-butter",
    nameDa: "Jordnøddesmør",
    nameEn: "Peanut butter",
    category: "fat",
    kcal: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
  },
  {
    id: "olive-oil",
    nameDa: "Olivenolie",
    nameEn: "Olive oil",
    category: "fat",
    kcal: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
  },
  {
    id: "butter",
    nameDa: "Smør",
    nameEn: "Butter",
    category: "fat",
    kcal: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
  },
  {
    id: "honey",
    nameDa: "Honning",
    nameEn: "Honey",
    category: "other",
    kcal: 304,
    protein: 0.3,
    carbs: 82,
    fat: 0,
  },
  {
    id: "sugar",
    nameDa: "Sukker",
    nameEn: "Sugar",
    category: "other",
    kcal: 387,
    protein: 0,
    carbs: 100,
    fat: 0,
  },
  {
    id: "dark-chocolate",
    nameDa: "Mørk chokolade",
    nameEn: "Dark chocolate",
    category: "other",
    kcal: 546,
    protein: 4.9,
    carbs: 61,
    fat: 31,
    noteDa: "Ca. 70 % kakao.",
    noteEn: "About 70% cocoa.",
  },
  {
    id: "hummus",
    nameDa: "Hummus",
    nameEn: "Hummus",
    category: "other",
    kcal: 166,
    protein: 7.9,
    carbs: 14,
    fat: 9.6,
  },
  {
    id: "greek-yogurt",
    nameDa: "Græsk yoghurt",
    nameEn: "Greek yogurt",
    category: "dairy",
    kcal: 97,
    protein: 9,
    carbs: 3.6,
    fat: 5,
  },
  {
    id: "skim-milk",
    nameDa: "Skummetmælk",
    nameEn: "Skim milk",
    category: "dairy",
    kcal: 34,
    protein: 3.4,
    carbs: 5,
    fat: 0.1,
  },
  {
    id: "sweet-potato",
    nameDa: "Søde kartoffel",
    nameEn: "Sweet potato",
    category: "veg",
    kcal: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    noteDa: "Kogt.",
    noteEn: "Boiled.",
  },
  {
    id: "corn",
    nameDa: "Majs",
    nameEn: "Corn",
    category: "veg",
    kcal: 96,
    protein: 3.4,
    carbs: 21,
    fat: 1.5,
  },
  {
    id: "shrimp",
    nameDa: "Rejer",
    nameEn: "Shrimp",
    category: "protein",
    kcal: 99,
    protein: 24,
    carbs: 0.2,
    fat: 0.3,
  },
  {
    id: "cod",
    nameDa: "Torsk",
    nameEn: "Cod",
    category: "protein",
    kcal: 82,
    protein: 18,
    carbs: 0,
    fat: 0.7,
  },
  {
    id: "beans-black",
    nameDa: "Sorte bønner",
    nameEn: "Black beans",
    category: "protein",
    kcal: 132,
    protein: 8.9,
    carbs: 24,
    fat: 0.5,
    noteDa: "Kogte.",
    noteEn: "Cooked.",
  },
  {
    id: "coconut-milk",
    nameDa: "Kokosmælk",
    nameEn: "Coconut milk",
    category: "fat",
    kcal: 230,
    protein: 2.3,
    carbs: 6,
    fat: 24,
  },
];

const CATEGORY_IDS: Array<Category | "all"> = [
  "all",
  "fruit",
  "veg",
  "grain",
  "dairy",
  "protein",
  "fat",
  "other",
];

function foodById(id: string) {
  return FOODS.find((f) => f.id === id);
}

function scale(per100: number, grams: number) {
  return (per100 * grams) / 100;
}

function MacroBar({
  label,
  grams,
  max,
  color,
}: {
  label: string;
  grams: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(100, (grams / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-xs text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{grams.toFixed(1)} g</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-overlay">
        <div
          className="h-full rounded-full transition-[width] duration-200"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ErnaringTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [selectedId, setSelectedId] = useState(FOODS[0]!.id);
  const [gramsDraft, setGramsDraft] = useState("100");
  const [tray, setTray] = useState<TrayItem[]>([]);

  const selected = foodById(selectedId) ?? FOODS[0]!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter((f) => {
      if (category !== "all" && f.category !== category) return false;
      if (!q) return true;
      const name = (da ? f.nameDa : f.nameEn).toLowerCase();
      return name.includes(q) || f.id.includes(q);
    });
  }, [query, category, da]);

  const totals = useMemo(() => {
    let kcal = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    for (const item of tray) {
      const food = foodById(item.foodId);
      if (!food) continue;
      kcal += scale(food.kcal, item.grams);
      protein += scale(food.protein, item.grams);
      carbs += scale(food.carbs, item.grams);
      fat += scale(food.fat, item.grams);
    }
    return { kcal, protein, carbs, fat };
  }, [tray]);

  const macroMax = Math.max(totals.protein, totals.carbs, totals.fat, 1);

  function categoryLabel(c: Category | "all") {
    if (c === "all") return da ? "Alle" : "All";
    const map: Record<Category, [string, string]> = {
      fruit: ["Frugt", "Fruit"],
      veg: ["Grønt", "Veg"],
      grain: ["Korn", "Grain"],
      dairy: ["Mejeri", "Dairy"],
      protein: ["Protein", "Protein"],
      fat: ["Fedt", "Fat"],
      other: ["Andet", "Other"],
    };
    return da ? map[c][0] : map[c][1];
  }

  function addToTray() {
    const grams = Number(String(gramsDraft).replace(",", "."));
    if (!Number.isFinite(grams) || grams <= 0) return;
    setTray((prev) => [
      ...prev,
      {
        key: `${selected.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        foodId: selected.id,
        grams,
      },
    ]);
  }

  function updateGrams(key: string, raw: string) {
    const grams = Number(String(raw).replace(",", "."));
    if (!Number.isFinite(grams) || grams <= 0) return;
    setTray((prev) =>
      prev.map((item) => (item.key === key ? { ...item, grams } : item)),
    );
  }

  function removeItem(key: string) {
    setTray((prev) => prev.filter((item) => item.key !== key));
  }

  const portionGrams = Number(String(gramsDraft).replace(",", ".")) || 100;

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Søg i en kurateret madliste med estimerede næringsværdier pr. 100 g. Tilføj portioner til bakken og se live makroer. Tallene er omtrentlige."
          : "Search a curated food list with estimated nutrients per 100 g. Add portions to the tray and see live macros. Values are approximate."}
      </p>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Field label={da ? "Søg" : "Search"}>
            <KitInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={da ? "Fx havre, laks…" : "e.g. oats, salmon…"}
            />
          </Field>
          <Field label={da ? "Kategori" : "Category"}>
            <KitSelect
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as Category | "all")
              }
            >
              {CATEGORY_IDS.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </KitSelect>
          </Field>
        </div>

        <div className="kit-scrollbar max-h-[min(14rem,42dvh)] overflow-y-auto overscroll-contain rounded-[10px] border border-border touch-pan-y">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted">
              {da ? "Ingen match." : "No matches."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((f) => {
                const active = f.id === selectedId;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(f.id)}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "bg-accent-soft text-foreground"
                          : "hover:bg-overlay"
                      }`}
                    >
                      <span className="font-medium">
                        {da ? f.nameDa : f.nameEn}
                      </span>
                      <span className="shrink-0 tabular-nums text-xs text-muted">
                        {f.kcal} kcal/100 g
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              {da ? selected.nameDa : selected.nameEn}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {categoryLabel(selected.category)} ·{" "}
              {da ? "estimat pr. 100 g" : "estimate per 100 g"}
            </p>
          </div>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
            {da ? "Estimat" : "Estimate"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              [da ? "Kcal" : "kcal", selected.kcal, ""],
              [da ? "Protein" : "Protein", selected.protein, "g"],
              [da ? "Kulhydrat" : "Carbs", selected.carbs, "g"],
              [da ? "Fedt" : "Fat", selected.fat, "g"],
            ] as const
          ).map(([label, value, unit]) => (
            <div
              key={label}
              className="rounded-[10px] border border-border bg-background/50 px-3 py-2.5"
            >
              <p className="text-xs text-muted">{label}</p>
              <p className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
                {value}
                {unit ? ` ${unit}` : ""}
              </p>
            </div>
          ))}
        </div>

        {(selected.noteDa || selected.noteEn) && (
          <p className="text-sm leading-relaxed text-muted">
            {da ? selected.noteDa : selected.noteEn}
          </p>
        )}

        <div className="rounded-[10px] border border-border bg-background/40 px-3 py-3 text-sm">
          <p className="text-xs text-muted">
            {da
              ? `For ${portionGrams} g i bakke-feltet`
              : `For ${portionGrams} g in the tray field`}
          </p>
          <p className="mt-1 tabular-nums text-foreground">
            {scale(selected.kcal, portionGrams).toFixed(0)} kcal · P{" "}
            {scale(selected.protein, portionGrams).toFixed(1)} · C{" "}
            {scale(selected.carbs, portionGrams).toFixed(1)} · F{" "}
            {scale(selected.fat, portionGrams).toFixed(1)}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label={da ? "Gram" : "Grams"}>
            <KitInput
              value={gramsDraft}
              onChange={(e) => setGramsDraft(e.target.value)}
              inputMode="decimal"
              className={`${fieldClass} w-28`}
            />
          </Field>
          <button type="button" className={primaryBtnClass} onClick={addToTray}>
            {da ? "Tilføj til bakke" : "Add to tray"}
          </button>
        </div>
      </section>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-foreground">
            {da ? "Måltidsbakke" : "Meal tray"}
          </h2>
          {tray.length > 0 ? (
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={() => setTray([])}
            >
              {da ? "Tøm bakke" : "Clear tray"}
            </button>
          ) : null}
        </div>

        {tray.length === 0 ? (
          <p className="text-sm text-muted">
            {da
              ? "Ingen varer endnu. Vælg en madvare og tilføj gram."
              : "No items yet. Pick a food and add grams."}
          </p>
        ) : (
          <ul className="space-y-2">
            {tray.map((item) => {
              const food = foodById(item.foodId);
              if (!food) return null;
              return (
                <li
                  key={item.key}
                  className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                    {da ? food.nameDa : food.nameEn}
                  </span>
                  <KitInput
                    value={String(item.grams)}
                    onChange={(e) => updateGrams(item.key, e.target.value)}
                    inputMode="decimal"
                    aria-label={da ? "Gram" : "Grams"}
                    className="kit-field w-20 rounded-[10px] border border-border bg-surface px-2 py-1.5 text-sm tabular-nums outline-none focus:border-accent"
                  />
                  <span className="text-xs text-muted">g</span>
                  <span className="w-16 text-right text-xs tabular-nums text-muted">
                    {scale(food.kcal, item.grams).toFixed(0)} kcal
                  </span>
                  <button
                    type="button"
                    className={secondaryBtnClass}
                    onClick={() => removeItem(item.key)}
                  >
                    {da ? "Fjern" : "Remove"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">
            {da ? "Live total" : "Live total"}
          </p>
          <p className="text-2xl font-medium tabular-nums text-foreground">
            {totals.kcal.toFixed(0)}{" "}
            <span className="text-base font-normal text-muted">kcal</span>
          </p>
          <div className="space-y-2.5">
            <MacroBar
              label={da ? "Protein" : "Protein"}
              grams={totals.protein}
              max={macroMax}
              color="var(--accent)"
            />
            <MacroBar
              label={da ? "Kulhydrat" : "Carbs"}
              grams={totals.carbs}
              max={macroMax}
              color="hsl(35 70% 45%)"
            />
            <MacroBar
              label={da ? "Fedt" : "Fat"}
              grams={totals.fat}
              max={macroMax}
              color="hsl(200 55% 42%)"
            />
          </div>
          <p className="text-xs tabular-nums text-muted">
            P {totals.protein.toFixed(0)} · C {totals.carbs.toFixed(0)} · F{" "}
            {totals.fat.toFixed(0)}
          </p>
        </div>
      </section>
    </div>
  );
}
