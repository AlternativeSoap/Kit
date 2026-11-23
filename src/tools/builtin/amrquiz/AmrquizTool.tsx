"use client";

import { useMemo, useState } from "react";
import {
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  ActionBar,
  ChoiceRow,
  Panel,
  PanelHeader,
  ProgressBar,
  Stat,
  StatStrip,
  ToneBadge,
  ToolShell,
} from "../_amo/ui";
import {
  QUIZ_QUESTIONS,
  scoreMessage,
  scoreQuiz,
  shuffleInPlace,
  type QuizAnswerMap,
} from "./calc";

export function AmrquizTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [seed, setSeed] = useState(() => Date.now());
  const [answers, setAnswers] = useState<QuizAnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  const order = useMemo(
    () => shuffleInPlace([...QUIZ_QUESTIONS], seed),
    [seed],
  );

  const answered = Object.keys(answers).length;
  const progress = (answered / QUIZ_QUESTIONS.length) * 100;
  const result = useMemo(
    () => (submitted ? scoreQuiz(answers) : null),
    [submitted, answers],
  );

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setSeed(Date.now());
  };

  const scoreTone =
    result && result.percent >= 80
      ? "ok"
      : result && result.percent >= 50
        ? "warn"
        : "bad";

  return (
    <ToolShell
      intro={
        da
          ? "15 korte spørgsmål om AMR, AMO, APV og ansvar. Når du er færdig, får du en forklaring på hvert svar."
          : "15 short questions about the representative role, organisation, workplace assessment, and responsibility. When you finish, you get an explanation for each answer."
      }
    >
      <Panel>
        <PanelHeader
          title={da ? "Test dig selv" : "Test yourself"}
          subtitle={
            da
              ? `${QUIZ_QUESTIONS.length} spørgsmål`
              : `${QUIZ_QUESTIONS.length} questions`
          }
          action={
            result ? (
              <ToneBadge tone={scoreTone}>
                {result.correct}/{result.total} · {result.percent}%
              </ToneBadge>
            ) : null
          }
        />
        <ProgressBar
          value={submitted && result ? result.percent : progress}
          tone={submitted ? scoreTone : "info"}
          label={
            submitted
              ? da
                ? "Resultat"
                : "Score"
              : da
                ? "Besvaret"
                : "Answered"
          }
        />
        {result ? (
          <p className="text-sm leading-relaxed text-muted">
            {scoreMessage(result.percent, da)}
          </p>
        ) : (
          <StatStrip>
            <Stat
              label={da ? "Besvaret" : "Answered"}
              value={`${answered}/${QUIZ_QUESTIONS.length}`}
              accent
            />
            <Stat
              label={da ? "Tilbage" : "Left"}
              value={QUIZ_QUESTIONS.length - answered}
            />
          </StatStrip>
        )}
      </Panel>

      <div className="space-y-3">
        {order.map((q, index) => {
          const selected = answers[q.id];
          const detail = result?.details.find((d) => d.questionId === q.id);
          const options = shuffleInPlace([...q.options], seed + index * 17);

          return (
            <Panel key={q.id}>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                {da ? `Spørgsmål ${index + 1}` : `Question ${index + 1}`}
              </p>
              <h3 className="text-sm font-semibold leading-snug text-foreground">
                {da ? q.promptDa : q.promptEn}
              </h3>
              <div className="space-y-2">
                {options.map((opt) => {
                  const isSelected = selected === opt.id;
                  const isCorrect = opt.id === q.correctId;
                  let tone: "ok" | "bad" | undefined;
                  if (submitted) {
                    if (isCorrect) tone = "ok";
                    else if (isSelected) tone = "bad";
                  }
                  return (
                    <ChoiceRow
                      key={opt.id}
                      selected={isSelected && !submitted}
                      tone={tone}
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                      }
                    >
                      {da ? opt.textDa : opt.textEn}
                    </ChoiceRow>
                  );
                })}
              </div>
              {submitted && detail ? (
                <p className="rounded-[10px] border border-border bg-overlay/50 px-3 py-2.5 text-sm leading-relaxed text-muted">
                  {da ? q.explainDa : q.explainEn}
                </p>
              ) : null}
            </Panel>
          );
        })}
      </div>

      <ActionBar>
        {!submitted ? (
          <button
            type="button"
            className={primaryBtnClass}
            disabled={answered < QUIZ_QUESTIONS.length}
            onClick={() => setSubmitted(true)}
          >
            {da ? "Ret mine svar" : "Check answers"}
          </button>
        ) : (
          <button type="button" className={primaryBtnClass} onClick={reset}>
            {da ? "Prøv igen" : "Try again"}
          </button>
        )}
        <button type="button" className={secondaryBtnClass} onClick={reset}>
          {da ? "Nulstil" : "Reset"}
        </button>
      </ActionBar>
    </ToolShell>
  );
}
