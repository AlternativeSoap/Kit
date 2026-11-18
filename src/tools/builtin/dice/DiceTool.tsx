"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Field,
  KitInput,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
const PIP_LAYOUT: Record<number, string[]> = {
  1: ["mm"],
  2: ["tl", "br"],
  3: ["tl", "mm", "br"],
  4: ["tl", "tr", "bl", "br"],
  5: ["tl", "tr", "mm", "bl", "br"],
  6: ["tl", "tr", "ml", "mr", "bl", "br"],
};

const LAND_OFFSETS: Array<[number, number]> = [
  [0, 0],
  [-18, 10],
  [16, -8],
  [-10, -14],
  [14, 12],
  [-22, 4],
  [8, -16],
  [20, 6],
];

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Unbiased crypto integer in [min, max]. */
function randomInt(min: number, max: number) {
  const span = max - min + 1;
  if (span <= 1) return min;
  const limit = Math.floor(0x100000000 / span) * span;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0]! >= limit);
  return min + (buf[0]! % span);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type DieState = {
  id: string;
  value: number;
  display: number;
  rolling: boolean;
  settled: boolean;
  landX: number;
  landY: number;
  landRot: number;
  throwFromX: number;
  throwFromY: number;
  spinStart: number;
  spinMid: number;
  throwDelay: number;
};

function makeDie(id: string, value = 1): DieState {
  return {
    id,
    value,
    display: value,
    rolling: false,
    settled: false,
    landX: 0,
    landY: 0,
    landRot: 0,
    throwFromX: 0,
    throwFromY: -80,
    spinStart: -90,
    spinMid: 240,
    throwDelay: 0,
  };
}

function DieFace({ value, classic }: { value: number; classic: boolean }) {
  if (!classic) {
    return (
      <div className="kit-die-face-flat" aria-hidden>
        <span className="kit-die-num">{value}</span>
      </div>
    );
  }

  const pips = PIP_LAYOUT[Math.min(6, Math.max(1, value))] ?? PIP_LAYOUT[1]!;
  return (
    <div className="kit-die-face-flat" aria-hidden>
      <div className="kit-die-pips">
        {pips.map((pos) => (
          <span key={pos} className="kit-die-pip" data-pos={pos} />
        ))}
      </div>
    </div>
  );
}

export function DiceTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [count, setCount] = useState(() => {
    const raw = Number(prefillNumber(prefill, "count") ?? "1");
    return String(Math.min(8, Math.max(1, Math.floor(raw) || 1)));
  });
  const [sides, setSides] = useState(() => {
    const raw = Number(prefillNumber(prefill, "sides") ?? "6");
    return String(Math.min(100, Math.max(2, Math.floor(raw) || 6)));
  });
  const [dice, setDice] = useState<DieState[]>(() => [makeDie("1")]);
  const [rolling, setRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const timers = useRef<number[]>([]);
  const scrambleRef = useRef<number | null>(null);

  const countN = Math.min(
    8,
    Math.max(1, Math.floor(Number(count.replace(",", ".")) || 1)),
  );
  const sidesN = Math.min(
    100,
    Math.max(2, Math.floor(Number(sides.replace(",", ".")) || 6)),
  );
  const isClassic = sidesN === 6;

  const total = useMemo(
    () => dice.slice(0, countN).reduce((sum, die) => sum + die.value, 0),
    [dice, countN],
  );

  useEffect(() => {
    return () => {
      for (const id of timers.current) window.clearTimeout(id);
      if (scrambleRef.current != null) {
        window.clearInterval(scrambleRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setDice((prev) => {
      const next: DieState[] = [];
      for (let i = 0; i < countN; i++) {
        const existing = prev[i];
        next.push(existing ?? makeDie(`${Date.now()}-${i}`));
      }
      return next;
    });
  }, [countN]);

  function clearTimers() {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
    if (scrambleRef.current != null) {
      window.clearInterval(scrambleRef.current);
      scrambleRef.current = null;
    }
  }

  function roll() {
    if (rolling) return;
    clearTimers();
    setRolling(true);
    setHasRolled(true);

    const results: number[] = [];
    for (let i = 0; i < countN; i++) {
      results.push(randomInt(1, sidesN));
    }

    const reduced = prefersReducedMotion();
    const duration = reduced ? 40 : 1320;
    const stagger = reduced ? 0 : 95;

    setDice((prev) =>
      prev.slice(0, countN).map((die, index) => {
        const value = results[index]!;
        const [ox, oy] = LAND_OFFSETS[index % LAND_OFFSETS.length]!;
        const landX = ox + randomBetween(-10, 10);
        const landY = oy + randomBetween(-10, 10);
        const landRot = randomBetween(-36, 36);
        const fromLeft = index % 2 === 0;
        return {
          ...die,
          // Remount animation when rolling again.
          id: `${Date.now()}-${index}`,
          value,
          display: reduced ? value : randomInt(1, sidesN),
          rolling: true,
          settled: false,
          landX,
          landY,
          landRot,
          throwFromX: fromLeft
            ? randomBetween(-110, -48)
            : randomBetween(48, 110),
          throwFromY: randomBetween(-150, -88),
          spinStart: randomBetween(-280, -120),
          spinMid: randomBetween(300, 540),
          throwDelay: index * stagger,
        };
      }),
    );

    if (!reduced) {
      scrambleRef.current = window.setInterval(() => {
        setDice((prev) =>
          prev.map((die) =>
            die.rolling
              ? { ...die, display: randomInt(1, sidesN) }
              : die,
          ),
        );
      }, 55);
    }

    const settleAt = duration + (countN > 1 ? (countN - 1) * stagger : 0);
    const doneId = window.setTimeout(() => {
      if (scrambleRef.current != null) {
        window.clearInterval(scrambleRef.current);
        scrambleRef.current = null;
      }
      setDice((prev) =>
        prev.map((die) => ({
          ...die,
          display: die.value,
          rolling: false,
          settled: true,
        })),
      );
      setRolling(false);
    }, settleAt);
    timers.current.push(doneId);
  }

  const sizeRem = countN >= 6 ? 3.6 : countN >= 4 ? 4.1 : countN >= 3 ? 4.5 : 5;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={da ? "Antal terninger" : "Number of dice"}>
          <KitInput
            value={count}
            inputMode="numeric"
            onChange={(e) => setCount(e.target.value)}
          />
        </Field>
        <Field
          label={da ? "Sider" : "Sides"}
          hint={
            da
              ? "6 sider: klassiske terninger med øjne. Andre værdier viser tal."
              : "6 sides: classic pip dice. Other values show numbers."
          }
        >
          <KitInput
            value={sides}
            inputMode="numeric"
            onChange={(e) => setSides(e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            className={secondaryBtnClass}
            onClick={() => {
              setCount(String(n));
              setSides("6");
            }}
          >
            {n}d6
          </button>
        ))}
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => {
            setCount("1");
            setSides("20");
          }}
        >
          1d20
        </button>
      </div>

      <div className="kit-die-table" aria-live="polite">
        <div className="kit-die-table-felt">
          {dice.slice(0, countN).map((die) => (
            <div
              key={die.id}
              className={`kit-die-piece${die.rolling ? " is-rolling" : ""}${
                die.settled && hasRolled && !die.rolling ? " is-settled" : ""
              }`}
              style={
                {
                  ["--kit-die-size"]: `${sizeRem}rem`,
                  ["--land-x"]: `${die.landX}px`,
                  ["--land-y"]: `${die.landY}px`,
                  ["--land-rot"]: `${die.landRot}deg`,
                  ["--throw-from-x"]: `${die.throwFromX}px`,
                  ["--throw-from-y"]: `${die.throwFromY}px`,
                  ["--spin-start"]: `${die.spinStart}deg`,
                  ["--spin-mid"]: `${die.spinMid}deg`,
                  ["--throw-delay"]: `${die.throwDelay}ms`,
                } as CSSProperties
              }
              aria-label={String(die.rolling ? die.display : die.value)}
            >
              <DieFace
                value={die.rolling ? die.display : die.value}
                classic={isClassic}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1 text-sm" aria-live="polite">
          {rolling ? (
            <p className="text-muted">
              {da ? "Terningerne lander…" : "Dice are landing…"}
            </p>
          ) : hasRolled ? (
            <>
              <p className="text-muted">
                {da ? "Kast" : "Rolls"}:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {dice
                    .slice(0, countN)
                    .map((die) => die.value)
                    .join(", ")}
                </span>
              </p>
              <p className="text-base font-medium text-foreground">
                {da ? "Sum" : "Total"}:{" "}
                <span className="tabular-nums text-accent">{total}</span>
              </p>
            </>
          ) : (
            <p className="text-muted">
              {da
                ? "Tryk kast for at kaste terningerne på bordet."
                : "Press roll to toss the dice onto the table."}
            </p>
          )}
        </div>
        <button
          type="button"
          className={primaryBtnClass}
          disabled={rolling}
          onClick={roll}
        >
          {rolling
            ? da
              ? "Kaster…"
              : "Rolling…"
            : hasRolled
              ? da
                ? "Kast igen"
                : "Roll again"
              : da
                ? "Kast"
                : "Roll"}
        </button>
      </div>
    </div>
  );
}
