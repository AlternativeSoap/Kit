"use client";

import { useMemo, useState } from "react";
import {
  Field,
  KitSelect,
  Segmented,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type TopicId =
  | "maillard"
  | "caramel"
  | "emulsion"
  | "gel"
  | "smoke"
  | "leaven"
  | "gluten";

type SmokeOil = {
  id: string;
  nameDa: string;
  nameEn: string;
  smokeC: number;
};

const OILS: SmokeOil[] = [
  { id: "butter", nameDa: "Smør", nameEn: "Butter", smokeC: 175 },
  { id: "evoo", nameDa: "Ekstra jomfru olivenolie", nameEn: "Extra virgin olive oil", smokeC: 190 },
  { id: "coconut", nameDa: "Kokosolie (uraffineret)", nameEn: "Coconut oil (unrefined)", smokeC: 177 },
  { id: "rapeseed", nameDa: "Rapsolie", nameEn: "Rapeseed / canola", smokeC: 204 },
  { id: "peanut", nameDa: "Jordnøddeolie", nameEn: "Peanut oil", smokeC: 230 },
  { id: "avocado", nameDa: "Avocadoolie", nameEn: "Avocado oil", smokeC: 270 },
  { id: "ghee", nameDa: "Ghee", nameEn: "Ghee", smokeC: 250 },
];

const TOPICS: { id: TopicId; da: string; en: string }[] = [
  { id: "maillard", da: "Maillard", en: "Maillard" },
  { id: "caramel", da: "Karamellisering", en: "Caramelization" },
  { id: "emulsion", da: "Emulsion", en: "Emulsion" },
  { id: "gel", da: "Gel / sæt", en: "Gel / set" },
  { id: "smoke", da: "Røgpunkt", en: "Smoke points" },
  { id: "leaven", da: "Hævemidler", en: "Leavening" },
  { id: "gluten", da: "Gluten", en: "Gluten" },
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function MaillardPanel({ da }: { da: boolean }) {
  const [temp, setTemp] = useState(140);
  const stage =
    temp < 120
      ? da
        ? "For det meste fordampning. Lidt brun farve."
        : "Mostly moisture loss. Little browning."
      : temp < 140
        ? da
          ? "Maillard starter. Aminosyrer + sukker danner aroma."
          : "Maillard begins. Amino acids + sugars form aroma."
        : temp < 165
          ? da
            ? "Stærk bruning og nøddeagtige noter. Hold øje med tørhed."
            : "Strong browning and nutty notes. Watch for dryness."
          : temp < 180
            ? da
              ? "Dyb skorpe. Risiko for bitre forbindelser stiger."
              : "Deep crust. Risk of bitter compounds rises."
            : da
              ? "Nær forkulning. Træk ned i varme eller flyt panden."
              : "Near charring. Lower heat or move the pan.";

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Maillard-reaktionen sker mellem aminosyrer og reducerende sukker ved tør varme. Den giver skorpe på kød, brød og ristede grøntsager. Den er ikke det samme som karamellisering."
          : "The Maillard reaction happens between amino acids and reducing sugars under dry heat. It builds crust on meat, bread, and roasted vegetables. It is not the same as caramelization."}
      </p>
      <Field label={da ? `Overfladetemperatur ≈ ${temp} °C` : `Surface temp ≈ ${temp} °C`}>
        <input
          type="range"
          min={80}
          max={200}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="kit-range"
          aria-label={da ? "Temperatur" : "Temperature"}
        />
      </Field>
      <div className="rounded-[10px] border border-border bg-background/50 px-3 py-3 text-sm text-foreground">
        {stage}
      </div>
      <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-muted sm:text-xs">
        <span>80–120</span>
        <span>120–140</span>
        <span>140–165</span>
        <span>165+</span>
      </div>
    </div>
  );
}

function CaramelPanel({ da }: { da: boolean }) {
  const [temp, setTemp] = useState(160);
  const stage =
    temp < 110
      ? da
        ? "Sukker opløses. Ingen brun farve endnu."
        : "Sugar dissolves. No browning yet."
      : temp < 160
        ? da
          ? "Vand fordamper. Sirup bliver klar."
          : "Water evaporates. Syrup turns clear."
        : temp < 170
          ? da
            ? "Lys karamel. Nøddeagtig sødme."
            : "Light caramel. Nutty sweetness."
          : temp < 180
            ? da
              ? "Mellem karamel. Mere bitterhed og dybde."
              : "Medium caramel. More bitterness and depth."
            : temp < 190
              ? da
                ? "Mørk karamel. Hurtigt tæt på brændt."
                : "Dark caramel. Quickly close to burnt."
              : da
                ? "Brændt sukker. Bitter og røgfyldt."
                : "Burnt sugar. Bitter and smoky.";

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Karamellisering er termisk nedbrydning af sukker. Uden protein. Farve og smag ændrer sig hurtigt over ca. 160 °C."
          : "Caramelization is thermal breakdown of sugar. No protein required. Color and flavor change quickly above about 160 °C."}
      </p>
      <Field label={da ? `Sukker ≈ ${temp} °C` : `Sugar ≈ ${temp} °C`}>
        <input
          type="range"
          min={100}
          max={200}
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="kit-range"
          aria-label={da ? "Temperatur" : "Temperature"}
        />
      </Field>
      <div
        className="h-10 rounded-[10px] border border-border transition-colors duration-200"
        style={{
          background: `linear-gradient(90deg, #f5e6c8 0%, hsl(${clamp(45 - (temp - 100) * 0.4, 8, 45)} 70% ${clamp(55 - (temp - 100) * 0.25, 18, 55)}%) 100%)`,
        }}
        aria-hidden
      />
      <p className="text-sm text-foreground">{stage}</p>
    </div>
  );
}

function EmulsionPanel({ da }: { da: boolean }) {
  const [oil, setOil] = useState(70);
  const vinegar = 100 - oil;
  const status =
    oil < 55
      ? da
        ? "Tynd vinaigrette. Let at ryste sammen, skilles hurtigt."
        : "Thin vinaigrette. Easy to shake, separates quickly."
      : oil < 80
        ? da
          ? "Klassisk balance. Emulgator (sennep) hjælper stabiliteten."
          : "Classic balance. Emulsifier (mustard) helps stability."
        : da
          ? "Meget olie. Risiko for at skille uden kraftig emulgator."
          : "Very oily. Likely to break without a strong emulsifier.";

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "En emulsion holder olie og vandfasen midlertidigt sammen. Sennep, æggeblomme eller lecithin stabiliserer dråberne."
          : "An emulsion keeps oil and a water phase briefly together. Mustard, egg yolk, or lecithin stabilize the droplets."}
      </p>
      <Field
        label={
          da
            ? `Olie ${oil}% · Eddike/syre ${vinegar}%`
            : `Oil ${oil}% · Vinegar/acid ${vinegar}%`
        }
      >
        <input
          type="range"
          min={40}
          max={90}
          value={oil}
          onChange={(e) => setOil(Number(e.target.value))}
          className="kit-range"
          aria-label={da ? "Olieandel" : "Oil ratio"}
        />
      </Field>
      <div className="flex h-12 overflow-hidden rounded-[10px] border border-border">
        <div
          className="flex items-center justify-center text-xs text-white"
          style={{ width: `${oil}%`, background: "hsl(40 55% 42%)" }}
        >
          {da ? "Olie" : "Oil"}
        </div>
        <div
          className="flex items-center justify-center text-xs text-foreground"
          style={{ width: `${vinegar}%`, background: "hsl(50 60% 88%)" }}
        >
          {da ? "Syre" : "Acid"}
        </div>
      </div>
      <p className="text-sm text-foreground">{status}</p>
    </div>
  );
}

function GelPanel({ da }: { da: boolean }) {
  const [agent, setAgent] = useState<"gelatin" | "pectin" | "agar" | "starch">(
    "gelatin",
  );
  const [strength, setStrength] = useState(50);

  const copy = {
    gelatin: {
      title: da ? "Gelatine" : "Gelatin",
      body: da
        ? "Proteingel fra kollagen. Smelter i munden. Kræver opsvulmning og varmeopløsning."
        : "Protein gel from collagen. Melts in the mouth. Needs bloom and warm dissolving.",
      tip:
        strength < 40
          ? da
            ? "Blød gelé. God til mousse-agtige teksturer."
            : "Soft jelly. Good for mousse-like textures."
          : strength < 70
            ? da
              ? "Standard dessertgelé."
              : "Standard dessert jelly."
            : da
              ? "Fast gel. Kan føles gummiagtig."
              : "Firm gel. Can feel rubbery.",
    },
    pectin: {
      title: da ? "Pektin" : "Pectin",
      body: da
        ? "Plantefiber i frugt. Højmetoxyl-pektin sætter med sukker og syre."
        : "Plant fiber in fruit. High-methoxyl pectin sets with sugar and acid.",
      tip:
        strength < 40
          ? da
            ? "Løs syltetøj. Mere frugtflow."
            : "Loose jam. More fruit flow."
          : strength < 70
            ? da
              ? "Klassisk marmelade-sæt."
              : "Classic jam set."
            : da
              ? "Fast gelé. Skærbar."
              : "Firm jelly. Sliceable.",
    },
    agar: {
      title: da ? "Agar" : "Agar",
      body: da
        ? "Tang-polysakkarid. Sætter ved afkøling og tåler højere serveringstemperatur end gelatine."
        : "Seaweed polysaccharide. Sets on cooling and tolerates higher serving temps than gelatin.",
      tip:
        strength < 40
          ? da
            ? "Skrøbelig gel. Let at knække."
            : "Brittle gel. Breaks easily."
          : da
            ? "Fast, sprød gel typisk for agar."
            : "Firm, brittle gel typical of agar.",
    },
    starch: {
      title: da ? "Stivelse" : "Starch",
      body: da
        ? "Kartoffel, majs eller tapioka fortykker ved gelatinisering i varm væske."
        : "Potato, corn, or tapioca thicken by gelatinizing in hot liquid.",
      tip:
        strength < 40
          ? da
            ? "Let sovs. Mere flydende."
            : "Light sauce. More pourable."
          : strength < 70
            ? da
              ? "Klassisk sovskonsistens."
              : "Classic sauce body."
            : da
              ? "Tæt budding. Risiko for melet smag hvis underkogt."
              : "Dense pudding. Risk of pasty taste if undercooked.",
    },
  }[agent];

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Geler og fortykkere låser vand i et netværk. Valg af middel styrer smeltepunkt, klarhed og mundfølelse."
          : "Gels and thickeners trap water in a network. The agent choice controls melt point, clarity, and mouthfeel."}
      </p>
      <Segmented
        value={agent}
        onChange={setAgent}
        ariaLabel={da ? "Gelmiddel" : "Gelling agent"}
        options={[
          { id: "gelatin", label: da ? "Gelatine" : "Gelatin" },
          { id: "pectin", label: da ? "Pektin" : "Pectin" },
          { id: "agar", label: "Agar" },
          { id: "starch", label: da ? "Stivelse" : "Starch" },
        ]}
      />
      <p className="text-sm text-muted">{copy.body}</p>
      <Field label={da ? `Styrke ${strength}%` : `Strength ${strength}%`}>
        <input
          type="range"
          min={20}
          max={100}
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          className="kit-range"
        />
      </Field>
      <div className="flex items-end gap-2" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[6px] bg-accent/70"
            style={{
              height: `${20 + (strength / 100) * 40 + (i % 3) * 4}px`,
              opacity: 0.45 + strength / 200,
            }}
          />
        ))}
      </div>
      <p className="text-sm text-foreground">{copy.tip}</p>
    </div>
  );
}

function SmokePanel({ da }: { da: boolean }) {
  const [selected, setSelected] = useState(OILS[0]!.id);
  const [panTemp, setPanTemp] = useState(180);
  const oil = OILS.find((o) => o.id === selected) ?? OILS[0]!;
  const over = panTemp >= oil.smokeC;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Røgpunktet er den temperatur, hvor olien begynder at ryge og nedbrydes. Tallene er typiske estimater og varierer med raffinering."
          : "Smoke point is the temperature where oil starts to smoke and break down. Figures are typical estimates and vary with refining."}
      </p>
      <Field label={da ? "Olie" : "Oil"}>
        <KitSelect
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {OILS.map((o) => (
            <option key={o.id} value={o.id}>
              {da ? o.nameDa : o.nameEn} ({o.smokeC} °C)
            </option>
          ))}
        </KitSelect>
      </Field>
      <Field label={da ? `Pandetemperatur ${panTemp} °C` : `Pan temp ${panTemp} °C`}>
        <input
          type="range"
          min={140}
          max={280}
          value={panTemp}
          onChange={(e) => setPanTemp(Number(e.target.value))}
          className="kit-range"
        />
      </Field>
      <p
        className={`rounded-[10px] border px-3 py-2.5 text-sm ${
          over
            ? "border-border bg-overlay text-foreground"
            : "border-border bg-background/50 text-foreground"
        }`}
      >
        {over
          ? da
            ? `${oil.nameDa} ryger sandsynligvis. Skru ned eller skift olie.`
            : `${oil.nameEn} is likely smoking. Lower heat or switch oil.`
          : da
            ? `Under røgpunktet (${oil.smokeC} °C). Stabil til stegning ved denne varme.`
            : `Below smoke point (${oil.smokeC} °C). Stable for frying at this heat.`}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted">
              <th className="py-2 pr-2 font-medium">{da ? "Olie" : "Oil"}</th>
              <th className="py-2 font-medium">°C</th>
            </tr>
          </thead>
          <tbody>
            {OILS.map((o) => (
              <tr
                key={o.id}
                className={`border-b border-border/70 ${
                  o.id === selected ? "bg-accent-soft" : ""
                }`}
              >
                <td className="py-2 pr-2">
                  <button
                    type="button"
                    className="text-left hover:underline"
                    onClick={() => setSelected(o.id)}
                  >
                    {da ? o.nameDa : o.nameEn}
                  </button>
                </td>
                <td className="py-2 tabular-nums">{o.smokeC}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeavenPanel({ da }: { da: boolean }) {
  const [method, setMethod] = useState<"baking-powder" | "yeast" | "steam">(
    "baking-powder",
  );
  const [heat, setHeat] = useState(180);

  function changeMethod(next: "baking-powder" | "yeast" | "steam") {
    setMethod(next);
    if (next === "yeast") setHeat((h) => clamp(h, 20, 220));
    else setHeat((h) => clamp(h < 140 ? 180 : h, 140, 250));
  }

  const text = {
    "baking-powder": {
      body: da
        ? "Bagepulver frigiver CO₂ fra syre + base. Noget gas kommer ved blanding, resten i ovnen."
        : "Baking powder releases CO₂ from acid + base. Some gas on mixing, the rest in the oven.",
      stage:
        heat < 160
          ? da
            ? "Langsom hævning. Risiko for tæt krumme."
            : "Slow rise. Risk of dense crumb."
          : heat < 200
            ? da
              ? "Typisk kageinterval. Gas udvider sig, protein sætter struktur."
              : "Typical cake range. Gas expands, protein sets structure."
            : da
              ? "Hurtig skorpe. Indersiden kan sætte før fuld hævning."
              : "Fast crust. Interior may set before full rise.",
    },
    yeast: {
      body: da
        ? "Gær omdanner sukker til CO₂ og alkohol. Tid og temperatur styrer smag og volumen."
        : "Yeast converts sugar to CO₂ and alcohol. Time and temperature steer flavor and volume.",
      stage:
        heat < 40
          ? da
            ? "Hævning (dej). Gær er aktiv i dejen, ikke i varm ovn."
            : "Proofing (dough). Yeast is active in dough, not in a hot oven."
          : heat < 100
            ? da
              ? "Ovnspring starter. Gærceller dør, men gas udvider sig."
              : "Oven spring begins. Yeast dies, but gas still expands."
            : da
              ? "Struktur sætter. Alkohol fordamper, skorpe dannes."
              : "Structure sets. Alcohol evaporates, crust forms.",
    },
    steam: {
      body: da
        ? "Vand bliver til damp og udvider sig kraftigt. Driver souffléer, choux og popovers."
        : "Water turns to steam and expands sharply. Drives soufflés, choux, and popovers.",
      stage:
        heat < 180
          ? da
            ? "For lidt dampkraft til mange dampdrevne deje."
            : "Too little steam power for many steam-driven batters."
          : heat < 220
            ? da
              ? "God startvarme til choux og popovers."
              : "Good start heat for choux and popovers."
            : da
              ? "Høj startvarme. Sænk senere så midten bages færdig."
              : "High start heat. Lower later so the center finishes.",
    },
  }[method];

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Hævemidler skaber gas. Kemisk pulver, biologisk gær eller fysisk damp. Ovntemperatur afgør om strukturen sætter i tide."
          : "Leaveners create gas. Chemical powder, biological yeast, or physical steam. Oven temperature decides whether structure sets in time."}
      </p>
      <Segmented
        value={method}
        onChange={changeMethod}
        ariaLabel={da ? "Hævemetode" : "Leavening method"}
        options={[
          { id: "baking-powder", label: da ? "Bagepulver" : "Baking powder" },
          { id: "yeast", label: da ? "Gær" : "Yeast" },
          { id: "steam", label: da ? "Damp" : "Steam" },
        ]}
      />
      <p className="text-sm text-muted">{text.body}</p>
      <Field label={da ? `Varme ${heat} °C` : `Heat ${heat} °C`}>
        <input
          type="range"
          min={method === "yeast" ? 20 : 140}
          max={method === "yeast" ? 220 : 250}
          value={heat}
          onChange={(e) => setHeat(Number(e.target.value))}
          className="kit-range"
        />
      </Field>
      <p className="rounded-[10px] border border-border bg-background/50 px-3 py-2.5 text-sm text-foreground">
        {text.stage}
      </p>
    </div>
  );
}

function GlutenPanel({ da }: { da: boolean }) {
  const [hydration, setHydration] = useState(65);
  const [knead, setKnead] = useState(40);

  const network =
    knead < 25
      ? da
        ? "Svagt netværk. Dejen river let."
        : "Weak network. Dough tears easily."
      : knead < 60
        ? da
          ? "Udviklet gluten. God elasticitet til brød."
          : "Developed gluten. Good elasticity for bread."
        : da
          ? "Meget stærkt netværk. Risiko for sej krumme hvis overæltes."
          : "Very strong network. Risk of tough crumb if over-kneaded.";

  const water =
    hydration < 55
      ? da
        ? "Tæt dej. Svært at strække."
        : "Tight dough. Hard to stretch."
      : hydration < 70
        ? da
          ? "Klassisk brødhydratisering."
          : "Classic bread hydration."
        : da
          ? "Høj hydratisering. Åben krumme, kræver teknik."
          : "High hydration. Open crumb, needs technique.";

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Gluten dannes når gliadin og glutenin i hvedemel møder vand og mekanisk arbejde. Det holder gasbobler i brød."
          : "Gluten forms when gliadin and glutenin in wheat flour meet water and mechanical work. It holds gas bubbles in bread."}
      </p>
      <Field label={da ? `Hydratisering ${hydration}%` : `Hydration ${hydration}%`}>
        <input
          type="range"
          min={45}
          max={85}
          value={hydration}
          onChange={(e) => setHydration(Number(e.target.value))}
          className="kit-range"
        />
      </Field>
      <Field label={da ? `Æltning ${knead}%` : `Kneading ${knead}%`}>
        <input
          type="range"
          min={0}
          max={100}
          value={knead}
          onChange={(e) => setKnead(Number(e.target.value))}
          className="kit-range"
        />
      </Field>
      <div className="grid gap-2 sm:grid-cols-2">
        <p className="rounded-[10px] border border-border px-3 py-2.5 text-sm text-foreground">
          {water}
        </p>
        <p className="rounded-[10px] border border-border px-3 py-2.5 text-sm text-foreground">
          {network}
        </p>
      </div>
      <div
        className="h-16 rounded-[10px] border border-border"
        style={{
          background: `repeating-linear-gradient(${90 + knead * 0.3}deg, hsl(35 30% 70% / ${0.3 + knead / 200}), hsl(35 30% 70% / ${0.3 + knead / 200}) 4px, transparent 4px, transparent ${8 + hydration / 10}px)`,
        }}
        aria-hidden
      />
    </div>
  );
}

export function KokkenkemiTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [topic, setTopic] = useState<TopicId>("maillard");

  const panel = useMemo(() => {
    switch (topic) {
      case "maillard":
        return <MaillardPanel da={da} />;
      case "caramel":
        return <CaramelPanel da={da} />;
      case "emulsion":
        return <EmulsionPanel da={da} />;
      case "gel":
        return <GelPanel da={da} />;
      case "smoke":
        return <SmokePanel da={da} />;
      case "leaven":
        return <LeavenPanel da={da} />;
      case "gluten":
        return <GlutenPanel da={da} />;
    }
  }, [topic, da]);

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Uddannelsesværktøj om køkkenvidenskab. Interaktive kontroller viser stadier for bruningsreaktioner, emulsioner, geler og mere."
          : "Educational kitchen science tool. Interactive controls show stages for browning reactions, emulsions, gels, and more."}
      </p>

      <p className="rounded-[10px] border border-border bg-overlay/60 px-3 py-2.5 text-xs leading-relaxed text-muted">
        {da
          ? "Sikkerhed: Dette er undervisning i køkkenkemi, ikke en opskrift eller brandrådgivning. Brug sund fornuft ved varme olie, sukker og ovn."
          : "Safety: This is educational kitchen science, not a recipe or fire guide. Use common sense with hot oil, sugar, and ovens."}
      </p>

      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={
              topic === t.id
                ? `${secondaryBtnClass} border-accent bg-accent-soft`
                : secondaryBtnClass
            }
            onClick={() => setTopic(t.id)}
          >
            {da ? t.da : t.en}
          </button>
        ))}
      </div>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">{panel}</section>
    </div>
  );
}
