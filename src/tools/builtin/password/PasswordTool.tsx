"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, KitSelect, Segmented, fieldClass } from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, prefillNumber, type ToolPrefill } from "@/tools/prefill";
import {
  generatePassword,
  PASSWORD_DEFAULT_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./calc";

type Mode = "generate" | "phrase" | "strength";

const EN_WORDS =
  "apple river quiet yellow garden planet silver mountain ocean candle window forest canyon harbor lantern orbit pebble quarry raven sunset tunnel valley willow zebra coral meadow".split(
    " ",
  );
const DA_WORDS =
  "æble flod stille gul have planet sølv bjerg hav stearinlys vindue skov kløft havn lygte kredsløb stenbrud ravn solnedgang tunnel dal piletræ zebra koral eng".split(
    " ",
  );

function randomInt(min: number, max: number) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0]! % (max - min + 1));
}

function scorePassword(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (value.length >= 16) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score <= 2) return { level: "weak" as const, score };
  if (score <= 4) return { level: "ok" as const, score };
  return { level: "strong" as const, score };
}

export function PasswordTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const { locale } = useLanguage();
  const da = locale === "da";
  const t = dictionary.password;

  const [mode, setMode] = useState<Mode>(
    prefillChoice(prefill, "mode", ["generate", "phrase", "strength"] as const) ??
      "generate",
  );
  const [length, setLength] = useState(() =>
    Number(
      prefillNumber(prefill, "length", {
        min: PASSWORD_MIN_LENGTH,
        max: PASSWORD_MAX_LENGTH,
        integer: true,
      }) ?? PASSWORD_DEFAULT_LENGTH,
    ),
  );
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [wordCount, setWordCount] = useState(4);
  const [sep, setSep] = useState("-");
  const [wordLang, setWordLang] = useState<"en" | "da">(da ? "da" : "en");
  const [phrase, setPhrase] = useState("");
  const [checkValue, setCheckValue] = useState("");

  const canGenerate = useMemo(
    () => lower || upper || numbers || symbols,
    [lower, upper, numbers, symbols],
  );

  const regenerate = () => {
    const next = generatePassword({ length, lower, upper, numbers, symbols });
    if (next) setPassword(next);
  };

  const regeneratePhrase = () => {
    const vocab = wordLang === "da" ? DA_WORDS : EN_WORDS;
    const count = Math.min(10, Math.max(3, wordCount));
    const picked: string[] = [];
    for (let i = 0; i < count; i++) {
      picked.push(vocab[randomInt(0, vocab.length - 1)]!);
    }
    setPhrase(picked.join(sep));
  };

  useEffect(() => {
    if (mode !== "generate") return;
    if (!canGenerate) {
      setPassword("");
      return;
    }
    const next = generatePassword({ length, lower, upper, numbers, symbols });
    if (next) setPassword(next);
  }, [canGenerate, length, lower, numbers, symbols, upper, mode]);

  useEffect(() => {
    if (mode === "phrase" && !phrase) regeneratePhrase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const strength = scorePassword(checkValue);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Adgangskode-tilstand" : "Password mode"}
        options={[
          { id: "generate", label: da ? "Generér" : "Generate" },
          { id: "phrase", label: da ? "Sætning" : "Passphrase" },
          { id: "strength", label: da ? "Styrke" : "Strength" },
        ]}
      />

      {mode === "generate" ? (
        <>
          <div className="rounded-[12px] border border-border bg-surface px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="break-all font-mono text-lg tracking-tight">
                {password || "—"}
              </p>
              {password ? (
                <CopyButton value={password} label={t.copy} copiedLabel={t.copied} />
              ) : null}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
              <span>{t.length}</span>
              <span className="text-muted">{length}</span>
            </span>
            <input
              type="range"
              min={PASSWORD_MIN_LENGTH}
              max={PASSWORD_MAX_LENGTH}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              className="kit-range w-full accent-[var(--accent)]"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["lower", lower, setLower, t.lower],
                ["upper", upper, setUpper, t.upper],
                ["numbers", numbers, setNumbers, t.numbers],
                ["symbols", symbols, setSymbols, t.symbols],
              ] as const
            ).map(([key, value, setter, label]) => (
              <label
                key={key}
                className="kit-touch-target flex cursor-pointer items-center gap-2 text-sm sm:min-h-0"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[var(--accent)]"
                />
                {label}
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={regenerate}
            disabled={!canGenerate}
            className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-on-accent hover:opacity-90 disabled:opacity-50 sm:min-h-0"
          >
            {t.generate}
          </button>
          {!canGenerate ? <p className="text-sm text-muted">{t.empty}</p> : null}
        </>
      ) : null}

      {mode === "phrase" ? (
        <>
          <div className="rounded-[12px] border border-border bg-surface px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="break-all font-mono text-lg tracking-tight">
                {phrase || "—"}
              </p>
              {phrase ? (
                <CopyButton value={phrase} label={t.copy} copiedLabel={t.copied} />
              ) : null}
            </div>
          </div>
          <Field label={da ? "Antal ord" : "Word count"}>
            <input
              type="range"
              min={3}
              max={10}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="kit-range w-full accent-[var(--accent)]"
            />
            <span className="text-xs text-muted">{wordCount}</span>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? "Ordliste" : "Word list"}>
              <KitSelect
                value={wordLang}
                onChange={(e) => setWordLang(e.target.value as "en" | "da")}
              >
                <option value="en">{da ? "Engelsk" : "English"}</option>
                <option value="da">{da ? "Dansk" : "Danish"}</option>
              </KitSelect>
            </Field>
            <Field label={da ? "Separator" : "Separator"}>
              <KitSelect value={sep} onChange={(e) => setSep(e.target.value)}>
                <option value="-">{da ? "Bindestreg" : "Hyphen"}</option>
                <option value=" ">{da ? "Mellemrum" : "Space"}</option>
                <option value=".">{da ? "Punktum" : "Dot"}</option>
              </KitSelect>
            </Field>
          </div>
          <button
            type="button"
            onClick={regeneratePhrase}
            className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-on-accent hover:opacity-90 sm:min-h-0"
          >
            {da ? "Generér igen" : "Generate again"}
          </button>
        </>
      ) : null}

      {mode === "strength" ? (
        <>
          <Field label={da ? "Adgangskode at tjekke" : "Password to check"}>
            <input
              type="text"
              value={checkValue}
              onChange={(e) => setCheckValue(e.target.value)}
              className={`${fieldClass} font-mono`}
              autoComplete="off"
            />
          </Field>
          <div className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm">
            <p className="font-medium">
              {strength.level === "weak"
                ? da
                  ? "Svag"
                  : "Weak"
                : strength.level === "ok"
                  ? da
                    ? "Okay"
                    : "Okay"
                  : da
                    ? "Stærk"
                    : "Strong"}
            </p>
            <p className="text-xs text-muted">
              {da
                ? "Lokal vurdering. Brug en password manager når du kan."
                : "Local estimate. Use a password manager when you can."}
            </p>
          </div>
        </>
      ) : null}

      <p className="text-xs text-muted">{t.disclaimer}</p>
    </div>
  );
}
