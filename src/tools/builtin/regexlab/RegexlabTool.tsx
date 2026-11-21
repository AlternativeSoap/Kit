"use client";

import { useMemo, useState } from "react";
import {
  Field,
  KitInput,
  Segmented,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  type FlagKey,
  type SuiteCase,
  CHEATSHEET,
  buildFlags,
  explainPattern,
  highlightSegments,
  runSuite,
  suiteId,
  testRegex,
} from "./calc";

type Mode = "lab" | "suite" | "cheat";

const FLAG_KEYS: FlagKey[] = ["g", "i", "m", "s", "u", "y"];

const FLAG_HINT: Record<FlagKey, { da: string; en: string }> = {
  g: { da: "Global", en: "Global" },
  i: { da: "Ignore case", en: "Ignore case" },
  m: { da: "Multiline ^$", en: "Multiline ^$" },
  s: { da: "Dotall (.)", en: "Dotall (.)" },
  u: { da: "Unicode", en: "Unicode" },
  y: { da: "Sticky", en: "Sticky" },
};

export function RegexlabTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [mode, setMode] = useState<Mode>("lab");
  const [pattern, setPattern] = useState("\\b(\\w+)@(\\w+)\\.(\\w+)\\b");
  const [text, setText] = useState(
    "Contact ada@kit.dev or bob@example.com\nSkip not-an-email and Ada@KIT.DEV",
  );
  const [flags, setFlags] = useState<Partial<Record<FlagKey, boolean>>>({
    g: true,
    i: true,
  });
  const [suite, setSuite] = useState<SuiteCase[]>(() => [
    { id: suiteId(), text: "ada@kit.dev", expectMatch: true },
    { id: suiteId(), text: "not-an-email", expectMatch: false },
    { id: suiteId(), text: "bob@example.com", expectMatch: true },
    { id: suiteId(), text: "@missing.user", expectMatch: false },
  ]);
  const [draft, setDraft] = useState("");
  const [draftExpect, setDraftExpect] = useState(true);

  const flagString = useMemo(() => buildFlags(flags), [flags]);
  const result = useMemo(
    () => testRegex(pattern, flagString, text),
    [pattern, flagString, text],
  );
  const segments = useMemo(
    () =>
      result.ok
        ? highlightSegments(text, result.matches)
        : [{ text, hit: false as const }],
    [result, text],
  );
  const explain = useMemo(() => explainPattern(pattern), [pattern]);
  const suiteResults = useMemo(
    () => runSuite(pattern, flagString, suite),
    [pattern, flagString, suite],
  );
  const suitePass = suiteResults.filter((r) => r.ok).length;

  function addCase() {
    const t = draft.trim();
    if (!t) return;
    setSuite((prev) => [
      ...prev,
      { id: suiteId(), text: t, expectMatch: draftExpect },
    ]);
    setDraft("");
  }

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Test mønstre med fremhævede matches, grupper, en lokal forklaring af tokens, og en suite af bestå/fejle-cases. Alt kører lokalt i browseren."
          : "Test patterns with highlighted matches, groups, a local token explain panel, and a pass/fail case suite. Everything runs locally in the browser."}
      </p>

      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Tilstand" : "Mode"}
        options={[
          { id: "lab", label: da ? "Lab" : "Lab" },
          { id: "suite", label: da ? "Suite" : "Suite" },
          { id: "cheat", label: da ? "Cheatsheet" : "Cheatsheet" },
        ]}
      />

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Field label={da ? "Mønster" : "Pattern"}>
            <KitInput
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              className={`${fieldClass} font-mono`}
            />
          </Field>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              {da ? "Flag" : "Flags"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {FLAG_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  title={FLAG_HINT[key][da ? "da" : "en"]}
                  onClick={() =>
                    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  className={`kit-touch-target rounded-[8px] border px-2.5 py-2 font-mono text-sm sm:min-h-0 ${
                    flags[key]
                      ? "border-accent bg-accent text-on-accent"
                      : "border-border bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>

        {mode === "lab" ? (
          <div className="kit-fade-in space-y-4">
            <Field label={da ? "Tekst" : "Sample text"}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                spellCheck={false}
                className={`${fieldClass} font-mono`}
              />
            </Field>

            {!result.ok ? (
              <p
                role="alert"
                className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm"
              >
                <span className="font-medium">
                  {da ? "Ugyldigt mønster" : "Invalid pattern"}
                </span>
                <span className="mt-1 block break-words text-muted">
                  {result.error}
                </span>
              </p>
            ) : (
              <>
                <div className="rounded-[12px] border border-border bg-overlay/40 px-3 py-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {result.matches.length === 1
                        ? "1 match"
                        : `${result.matches.length} matches`}
                    </p>
                    <span className="font-mono text-xs text-muted">
                      /{pattern}/{flagString}
                    </span>
                  </div>
                  <pre className="kit-scrollbar max-h-[min(14rem,42dvh)] overflow-auto overscroll-contain touch-pan-y whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-foreground">
                    {segments.map((part, index) =>
                      part.hit ? (
                        <mark
                          key={index}
                          className="rounded-[3px] bg-accent/30 px-0.5 text-foreground"
                          title={
                            part.matchIndex != null
                              ? `#${part.matchIndex + 1}`
                              : undefined
                          }
                        >
                          {part.text || " "}
                        </mark>
                      ) : (
                        <span key={index}>{part.text}</span>
                      ),
                    )}
                  </pre>
                </div>

                {result.matches.length > 0 ? (
                  <div className="space-y-2">
                    <h2 className="text-sm font-medium">
                      {da ? "Matchliste" : "Match list"}
                    </h2>
                    <ul className="space-y-2">
                      {result.matches.map((m, i) => (
                        <li
                          key={`${m.index}-${i}`}
                          className="rounded-[10px] border border-border bg-surface px-3 py-2 font-mono text-sm"
                        >
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="text-muted">
                              #{i + 1} @ {m.index}
                            </span>
                            <span className="text-foreground">
                              {m.text || "(empty)"}
                            </span>
                          </div>
                          {m.groups.some(Boolean) ? (
                            <p className="mt-1 text-xs text-muted">
                              {da ? "Grupper" : "Groups"}:{" "}
                              {m.groups
                                .map((g, gi) => `$${gi + 1}=${JSON.stringify(g)}`)
                                .join(" ")}
                            </p>
                          ) : null}
                          {Object.keys(m.named).length > 0 ? (
                            <p className="mt-1 text-xs text-muted">
                              {da ? "Navngivne" : "Named"}:{" "}
                              {Object.entries(m.named)
                                .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                                .join(" ")}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {explain.length > 0 ? (
                  <div className="space-y-2">
                    <h2 className="text-sm font-medium">
                      {da ? "Hvad matcher mønsteret?" : "What does the pattern use?"}
                    </h2>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {explain.map((e) => (
                        <li
                          key={e.token}
                          className="rounded-[8px] border border-border bg-surface px-2.5 py-1.5 text-sm"
                        >
                          <code className="font-mono text-accent">{e.token}</code>
                          <span className="ml-2 text-muted">
                            {da ? e.noteDa : e.noteEn}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted">
                      {da
                        ? "Lokal oversigt over tokens i dit mønster. Ingen AI-kald."
                        : "Local overview of tokens in your pattern. No AI calls."}
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {mode === "suite" ? (
          <div className="kit-fade-in space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {da
                  ? `Suite: ${suitePass}/${suiteResults.length} bestået`
                  : `Suite: ${suitePass}/${suiteResults.length} passed`}
              </p>
              <span className="font-mono text-xs text-muted">
                /{pattern}/{flagString}
              </span>
            </div>

            <ul className="space-y-2">
              {suiteResults.map((c) => (
                <li
                  key={c.id}
                  className={`flex flex-wrap items-start gap-2 rounded-[10px] border px-3 py-2 ${
                    c.ok
                      ? "border-border bg-surface"
                      : "border-border bg-overlay"
                  }`}
                >
                  <span
                    className={`mt-0.5 rounded-[6px] px-1.5 py-0.5 text-xs font-semibold ${
                      c.ok
                        ? "bg-accent/20 text-foreground"
                        : "bg-border text-muted"
                    }`}
                  >
                    {c.ok ? (da ? "PASS" : "PASS") : da ? "FAIL" : "FAIL"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-mono text-sm text-foreground">
                      {c.text}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {da ? "Forvent match" : "Expect match"}:{" "}
                      {c.expectMatch ? (da ? "ja" : "yes") : da ? "nej" : "no"}
                      {" · "}
                      {c.error
                        ? c.error
                        : da
                          ? `${c.matchCount} fundet`
                          : `${c.matchCount} found`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className={secondaryBtnClass}
                      onClick={() =>
                        setSuite((prev) =>
                          prev.map((x) =>
                            x.id === c.id
                              ? { ...x, expectMatch: !x.expectMatch }
                              : x,
                          ),
                        )
                      }
                    >
                      {da ? "Vend forventning" : "Flip expect"}
                    </button>
                    <button
                      type="button"
                      className={secondaryBtnClass}
                      onClick={() =>
                        setSuite((prev) => prev.filter((x) => x.id !== c.id))
                      }
                    >
                      {da ? "Fjern" : "Remove"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
              <div className="min-w-[12rem] flex-1">
                <Field label={da ? "Ny teststreng" : "New test string"}>
                  <KitInput
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCase();
                    }}
                    spellCheck={false}
                    className={`${fieldClass} font-mono`}
                  />
                </Field>
              </div>
              <button
                type="button"
                className={draftExpect ? primaryBtnClass : secondaryBtnClass}
                onClick={() => setDraftExpect((v) => !v)}
                aria-pressed={draftExpect}
              >
                {draftExpect
                  ? da
                    ? "Forvent: match"
                    : "Expect: match"
                  : da
                    ? "Forvent: intet"
                    : "Expect: none"}
              </button>
              <button type="button" className={primaryBtnClass} onClick={addCase}>
                {da ? "Tilføj case" : "Add case"}
              </button>
            </div>
          </div>
        ) : null}

        {mode === "cheat" ? (
          <div className="kit-fade-in space-y-3">
            <ul className="grid gap-2 sm:grid-cols-2">
              {CHEATSHEET.map((row) => (
                <li
                  key={row.token}
                  className="flex items-start gap-2 rounded-[10px] border border-border bg-surface px-3 py-2"
                >
                  <code className="shrink-0 font-mono text-sm text-accent">
                    {row.token}
                  </code>
                  <span className="text-sm text-muted">
                    {da ? row.da : row.en}
                  </span>
                </li>
              ))}
            </ul>
            <div className="kit-h-scroll flex gap-2 pt-1">
              {[
                { p: "\\d+", label: da ? "Tal" : "Digits" },
                { p: "^\\S+@\\S+\\.\\S+$", label: "Email-ish" },
                { p: "https?:\\/\\/\\S+", label: "URL" },
                { p: "(?<=\\#)[a-fA-F0-9]{3,8}", label: "Hex color" },
              ].map((ex) => (
                <button
                  key={ex.p}
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() => {
                    setPattern(ex.p);
                    setMode("lab");
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
