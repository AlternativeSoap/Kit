"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitInput,
  KitSelect,
  Segmented,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  ActionBar,
  Panel,
  PanelHeader,
  Stat,
  StatStrip,
  ToneBadge,
  ToolShell,
  type Tone,
} from "../_amo/ui";
import {
  assessLift,
  levelLabel,
  liftToText,
  type LiftFrequency,
  type LiftGrip,
  type LiftHeight,
  type LiftLevel,
  type LiftPosture,
} from "./calc";

function toneFor(level: LiftLevel): Tone {
  if (level === "stop") return "critical";
  if (level === "high") return "bad";
  if (level === "attention") return "warn";
  return "ok";
}

export function LoeftTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [weightKg, setWeightKg] = useState("18");
  const [frequency, setFrequency] = useState<LiftFrequency>("often");
  const [posture, setPosture] = useState<LiftPosture>("bent");
  const [height, setHeight] = useState<LiftHeight>("floor");
  const [grip, setGrip] = useState<LiftGrip>("poor");
  const [distanceM, setDistanceM] = useState("4");
  const [twoPerson, setTwoPerson] = useState(false);
  const [aidsAvailable, setAidsAvailable] = useState(false);

  const result = useMemo(() => {
    const w = Number(weightKg.replace(",", "."));
    const d = Number(distanceM.replace(",", "."));
    return assessLift(
      {
        weightKg: w,
        frequency,
        posture,
        height,
        grip,
        distanceM: d,
        twoPerson,
        aidsAvailable,
      },
      da,
    );
  }, [
    weightKg,
    frequency,
    posture,
    height,
    grip,
    distanceM,
    twoPerson,
    aidsAvailable,
    da,
  ]);

  const exportText = useMemo(() => {
    if (!result) return "";
    const w = Number(weightKg.replace(",", "."));
    const d = Number(distanceM.replace(",", "."));
    return liftToText(
      {
        weightKg: w,
        frequency,
        posture,
        height,
        grip,
        distanceM: d,
        twoPerson,
        aidsAvailable,
      },
      result,
      da,
    );
  }, [
    result,
    weightKg,
    frequency,
    posture,
    height,
    grip,
    distanceM,
    twoPerson,
    aidsAvailable,
    da,
  ]);

  return (
    <ToolShell
      intro={
        da
          ? "Svar på et par spørgsmål om løftet. Du får en score og konkrete råd. Det er til samtale, ikke en erstatning for Arbejdstilsynets vejledning."
          : "Answer a few questions about the lift. You get a score and concrete advice. It is for discussion, not a replacement for official guidance."
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel>
          <PanelHeader title={da ? "Løftet" : "The lift"} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? "Vægt (kg)" : "Weight (kg)"}>
              <KitInput
                inputMode="decimal"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </Field>
            <Field label={da ? "Bæreafstand (m)" : "Carry distance (m)"}>
              <KitInput
                inputMode="decimal"
                value={distanceM}
                onChange={(e) => setDistanceM(e.target.value)}
              />
            </Field>
          </div>

          <Field label={da ? "Hyppighed" : "Frequency"}>
            <Segmented
              value={frequency}
              onChange={setFrequency}
              options={[
                { id: "rare", label: da ? "Sjældent" : "Rare" },
                { id: "often", label: da ? "Ofte" : "Often" },
                { id: "constant", label: da ? "Konstant" : "Constant" },
              ]}
            />
          </Field>

          <Field label={da ? "Arbejdsstilling" : "Posture"}>
            <Segmented
              value={posture}
              onChange={setPosture}
              options={[
                { id: "good", label: da ? "God" : "Good" },
                { id: "bent", label: da ? "Bøjet" : "Bent" },
                { id: "twisted", label: da ? "Vredet" : "Twisted" },
              ]}
            />
          </Field>

          <Field label={da ? "Løftehøjde" : "Lift height"}>
            <Segmented
              value={height}
              onChange={setHeight}
              options={[
                { id: "waist", label: da ? "Midte" : "Waist" },
                { id: "floor", label: da ? "Gulv" : "Floor" },
                { id: "shoulder", label: da ? "Skulder+" : "Shoulder+" },
              ]}
            />
          </Field>

          <Field label={da ? "Greb" : "Grip"}>
            <Segmented
              value={grip}
              onChange={setGrip}
              options={[
                { id: "good", label: da ? "Godt" : "Good" },
                { id: "poor", label: da ? "Dårligt" : "Poor" },
              ]}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={da ? "To personer" : "Two people"}>
              <KitSelect
                value={twoPerson ? "yes" : "no"}
                onChange={(e) => setTwoPerson(e.target.value === "yes")}
              >
                <option value="no">{da ? "Nej" : "No"}</option>
                <option value="yes">{da ? "Ja" : "Yes"}</option>
              </KitSelect>
            </Field>
            <Field label={da ? "Hjælpemidler" : "Aids"}>
              <KitSelect
                value={aidsAvailable ? "yes" : "no"}
                onChange={(e) => setAidsAvailable(e.target.value === "yes")}
              >
                <option value="no">{da ? "Nej" : "No"}</option>
                <option value="yes">{da ? "Ja" : "Yes"}</option>
              </KitSelect>
            </Field>
          </div>
        </Panel>

        <div className="space-y-4">
          <section className="kit-tool-panel kit-tool-hero !gap-3 p-5">
            {result ? (
              <>
                <ToneBadge tone={toneFor(result.level)}>
                  {levelLabel(result.level, da)}
                </ToneBadge>
                <p className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
                  {result.score}
                  <span className="ml-2 align-middle text-sm font-medium text-muted">
                    {da ? "score" : "score"}
                  </span>
                </p>
                <StatStrip>
                  <Stat label={da ? "Vægt" : "Weight"} value={`${weightKg} kg`} />
                  <Stat
                    label={da ? "Afstand" : "Distance"}
                    value={`${distanceM} m`}
                  />
                </StatStrip>
              </>
            ) : (
              <p className="text-sm text-muted">
                {da
                  ? "Angiv en gyldig vægt og bæreafstand."
                  : "Enter a valid weight and carry distance."}
              </p>
            )}
          </section>

          {result ? (
            <>
              <Panel>
                <PanelHeader
                  title={da ? "Hvad trækker op?" : "What adds points?"}
                />
                <ul className="space-y-2">
                  {result.factors.map((f) => (
                    <li
                      key={`${f.labelDa}-${f.points}`}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-muted">
                        {da ? f.labelDa : f.labelEn}
                      </span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {f.points > 0 ? "+" : ""}
                        {f.points}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel>
                <PanelHeader title={da ? "Gode næste skridt" : "Good next steps"} />
                <ul className="space-y-2.5">
                  {result.tips.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                        aria-hidden
                      />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          ) : null}
        </div>
      </div>

      {result ? (
        <ActionBar>
          <CopyButton
            value={exportText}
            label={da ? "Kopiér vurdering" : "Copy assessment"}
            copiedLabel={da ? "Kopieret" : "Copied"}
          />
        </ActionBar>
      ) : null}
    </ToolShell>
  );
}
