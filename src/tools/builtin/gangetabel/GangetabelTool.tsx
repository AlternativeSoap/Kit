"use client";

import { useMemo, useState } from "react";
import {
  Field,
  KitInput,
  Segmented,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Mode = "table" | "quiz";

function clampSize(n: number) {
  return Math.min(12, Math.max(2, Math.floor(n) || 10));
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function GangetabelTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [size, setSize] = useState(10);
  const [mode, setMode] = useState<Mode>("table");
  const [focus, setFocus] = useState<{ r: number; c: number } | null>(null);
  const [pinned, setPinned] = useState(false);
  const [quiz, setQuiz] = useState(() => ({
    a: 3,
    b: 4,
    answer: "",
    streak: 0,
    best: 0,
    feedback: "" as "" | "ok" | "bad",
  }));

  const n = clampSize(size);
  const rows = useMemo(
    () => Array.from({ length: n }, (_, i) => i + 1),
    [n],
  );

  function nextQuestion(streak: number, best: number) {
    setQuiz({
      a: randomInt(1, n),
      b: randomInt(1, n),
      answer: "",
      streak,
      best,
      feedback: "",
    });
  }

  function checkQuiz() {
    const expected = quiz.a * quiz.b;
    const got = Number(quiz.answer.replace(",", "."));
    if (!Number.isFinite(got)) return;
    if (got === expected) {
      const streak = quiz.streak + 1;
      const best = Math.max(quiz.best, streak);
      setQuiz((q) => ({ ...q, streak, best, feedback: "ok" }));
      window.setTimeout(() => nextQuestion(streak, best), 450);
    } else {
      setQuiz((q) => ({ ...q, streak: 0, feedback: "bad" }));
    }
  }

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Interaktiv gangetabel og hurtig quiz. Tryk på en celle for at fastholde den."
          : "Interactive times table and a quick quiz. Tap a cell to pin it."}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={mode}
          onChange={(id) => {
            setMode(id);
            if (id === "quiz") nextQuestion(0, quiz.best);
          }}
          ariaLabel={da ? "Tilstand" : "Mode"}
          options={[
            { id: "table", label: da ? "Tabel" : "Table" },
            { id: "quiz", label: "Quiz" },
          ]}
        />
        <div className="kit-h-scroll">
          {[5, 10, 12].map((v) => (
            <button
              key={v}
              type="button"
              className={secondaryBtnClass}
              onClick={() => {
                setSize(v);
                if (mode === "quiz") nextQuestion(quiz.streak, quiz.best);
              }}
            >
              {v}×{v}
            </button>
          ))}
        </div>
      </div>

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <Field
          label={da ? "Op til" : "Up to"}
          hint={
            size !== n
              ? da
                ? `Viser ${n}×${n}`
                : `Showing ${n}×${n}`
              : undefined
          }
        >
          <KitInput
            inputMode="numeric"
            value={String(size)}
            onChange={(e) => setSize(Number(e.target.value) || 2)}
            onBlur={() => setSize(n)}
          />
        </Field>

        {mode === "quiz" ? (
          <div className="kit-fade-in space-y-5 py-2">
            <p className="text-center text-4xl font-semibold tabular-nums tracking-tight text-foreground">
              {quiz.a} × {quiz.b} = ?
            </p>
            <div className="mx-auto flex max-w-sm flex-wrap items-center justify-center gap-2">
              <KitInput
                inputMode="numeric"
                value={quiz.answer}
                onChange={(e) =>
                  setQuiz((q) => ({
                    ...q,
                    answer: e.target.value,
                    feedback: "",
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") checkQuiz();
                }}
                aria-label={da ? "Svar" : "Answer"}
                autoFocus
              />
              <button
                type="button"
                className={primaryBtnClass}
                onClick={checkQuiz}
              >
                {da ? "Tjek" : "Check"}
              </button>
            </div>
            <p
              className={`text-center text-sm transition-colors duration-150 ${
                quiz.feedback === "ok"
                  ? "text-accent"
                  : quiz.feedback === "bad"
                    ? "text-foreground"
                    : "text-muted"
              }`}
              aria-live="polite"
            >
              {quiz.feedback === "ok"
                ? da
                  ? "Rigtigt"
                  : "Correct"
                : quiz.feedback === "bad"
                  ? da
                    ? `Forkert. Rigtigt svar er ${quiz.a * quiz.b}.`
                    : `Wrong. The answer is ${quiz.a * quiz.b}.`
                  : da
                    ? `Streak ${quiz.streak} · Bedst ${quiz.best}`
                    : `Streak ${quiz.streak} · Best ${quiz.best}`}
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                className={secondaryBtnClass}
                onClick={() => nextQuestion(quiz.streak, quiz.best)}
              >
                {da ? "Spring over" : "Skip"}
              </button>
            </div>
          </div>
        ) : (
          <div className="kit-fade-in space-y-4">
            <div className="min-h-[2rem]">
              {focus ? (
                <p className="text-xl font-medium tabular-nums tracking-tight text-foreground">
                  {focus.r} × {focus.c} ={" "}
                  <span className="text-accent">{focus.r * focus.c}</span>
                  {pinned ? (
                    <span className="ml-2 text-xs font-normal text-muted">
                      {da ? "(låst)" : "(pinned)"}
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="text-sm text-muted">
                  {da
                    ? "Peg på eller tryk på en celle."
                    : "Point at or tap a cell."}
                </p>
              )}
            </div>

            <div
              className="kit-scrollbar overflow-x-auto rounded-[12px] border border-border bg-background/60 p-2"
              onMouseLeave={() => {
                if (!pinned) setFocus(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setPinned(false);
                  setFocus(null);
                }
              }}
            >
              <table className="border-collapse text-center text-sm tabular-nums">
                <thead>
                  <tr>
                    <th className="p-1.5 text-muted">×</th>
                    {rows.map((c) => (
                      <th
                        key={c}
                        className={`p-1.5 font-medium transition-colors duration-150 ${
                          focus?.c === c ? "text-accent" : "text-muted"
                        }`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r}>
                      <th
                        className={`p-1.5 font-medium transition-colors duration-150 ${
                          focus?.r === r ? "text-accent" : "text-muted"
                        }`}
                      >
                        {r}
                      </th>
                      {rows.map((c) => {
                        const active = focus?.r === r && focus?.c === c;
                        const related =
                          focus && (focus.r === r || focus.c === c) && !active;
                        return (
                          <td key={c} className="p-0.5">
                            <button
                              type="button"
                              onMouseEnter={() => {
                                if (!pinned) setFocus({ r, c });
                              }}
                              onPointerDown={() => {
                                if (!pinned) setFocus({ r, c });
                              }}
                              onFocus={() => setFocus({ r, c })}
                              onClick={() => {
                                setFocus({ r, c });
                                setPinned(true);
                              }}
                              className={`kit-table-cell kit-touch-target min-w-10 rounded-[8px] px-2 py-1.5 sm:min-h-0 sm:min-w-9 ${
                                active
                                  ? "is-active bg-accent text-on-accent"
                                  : related
                                    ? "bg-accent-soft text-foreground"
                                    : "text-foreground hover:bg-overlay"
                              }`}
                            >
                              {r * c}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pinned ? (
              <button
                type="button"
                className={secondaryBtnClass}
                onClick={() => {
                  setPinned(false);
                  setFocus(null);
                }}
              >
                {da ? "Frigør celle" : "Unpin cell"}
              </button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
