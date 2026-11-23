"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitInput,
  KitSelect,
  Segmented,
  fieldClass,
  secondaryBtnClass,
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
  INCIDENT_KINDS,
  LEVELS,
  emptyReport,
  isCompleteEnough,
  priorityLabel,
  priorityScore,
  reportToText,
  type IncidentKind,
  type IncidentReport,
} from "./calc";

function priorityTone(score: number): Tone {
  if (score >= 6) return "critical";
  if (score >= 3) return "warn";
  return "ok";
}

export function NaervedTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [report, setReport] = useState<IncidentReport>(() => emptyReport());

  const text = useMemo(() => reportToText(report, da), [report, da]);
  const score = priorityScore(report);
  const ready = isCompleteEnough(report);
  const tone = priorityTone(score);

  const patch = (p: Partial<IncidentReport>) =>
    setReport((prev) => ({ ...prev, ...p }));

  return (
    <ToolShell
      intro={
        da
          ? "Skriv ned hvad der næsten gik galt. Brug rapporten til at tale med leder eller AMO, før nogen kommer til skade. Intet sendes til en server."
          : "Write down what almost went wrong. Use the report to talk with a supervisor or the health and safety organisation before someone gets hurt. Nothing is sent to a server."
      }
    >
      <Panel>
        <PanelHeader
          title={da ? "Type" : "Type"}
          action={<ToneBadge tone={tone}>{priorityLabel(score, da)}</ToneBadge>}
        />
        <Segmented
          value={report.kind}
          onChange={(kind) => patch({ kind })}
          ariaLabel={da ? "Hændelsestype" : "Incident type"}
          options={(Object.keys(INCIDENT_KINDS.da) as IncidentKind[]).map(
            (id) => ({
              id,
              label: INCIDENT_KINDS[da ? "da" : "en"][id],
            }),
          )}
        />
        <StatStrip>
          <Stat label={da ? "Prioritet" : "Priority"} value={score} accent />
          <Stat
            label={da ? "Konsekvens" : "Consequence"}
            value={LEVELS[da ? "da" : "en"][report.potentialConsequence]}
          />
          <Stat
            label={da ? "Gentagelse" : "Recurrence"}
            value={LEVELS[da ? "da" : "en"][report.recurrence]}
          />
          <Stat
            label={da ? "Klarhed" : "Ready"}
            value={ready ? (da ? "Ja" : "Yes") : da ? "Nej" : "No"}
          />
        </StatStrip>
      </Panel>

      <Panel>
        <PanelHeader title={da ? "Hændelse" : "Event"} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={da ? "Hvornår" : "When"}>
            <KitInput
              type="datetime-local"
              value={report.when}
              onChange={(e) => patch({ when: e.target.value })}
            />
          </Field>
          <Field label={da ? "Hvor skete det?" : "Where did it happen?"}>
            <KitInput
              value={report.where}
              onChange={(e) => patch({ where: e.target.value })}
              placeholder={
                da ? "Fx terminal, reol B" : "e.g. terminal, aisle B"
              }
            />
          </Field>
        </div>
        <Field label={da ? "Hvilket område?" : "Which area?"}>
          <KitInput
            value={report.area}
            onChange={(e) => patch({ area: e.target.value })}
            placeholder={
              da
                ? "Fx løft, truck, tidspres eller kemi"
                : "e.g. lifting, forklift, time pressure, or chemicals"
            }
          />
        </Field>
        <Field label={da ? "Hvad skete der?" : "What happened?"}>
          <textarea
            className={fieldClass}
            rows={5}
            value={report.what}
            onChange={(e) => patch({ what: e.target.value })}
            placeholder={
              da
                ? "Beskriv det kort. Undgå unødvendige navne og personoplysninger."
                : "Keep it short. Avoid unnecessary names and personal details."
            }
          />
        </Field>
      </Panel>

      <Panel>
        <PanelHeader
          title={da ? "Hvad gør I nu?" : "What do you do now?"}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={da ? "Hvor slemt kunne det være blevet?" : "How bad could it have been?"}>
            <KitSelect
              value={report.potentialConsequence}
              onChange={(e) =>
                patch({
                  potentialConsequence: e.target
                    .value as IncidentReport["potentialConsequence"],
                })
              }
            >
              {(["low", "medium", "high"] as const).map((k) => (
                <option key={k} value={k}>
                  {LEVELS[da ? "da" : "en"][k]}
                </option>
              ))}
            </KitSelect>
          </Field>
          <Field label={da ? "Kan det ske igen?" : "Could it happen again?"}>
            <KitSelect
              value={report.recurrence}
              onChange={(e) =>
                patch({
                  recurrence: e.target.value as IncidentReport["recurrence"],
                })
              }
            >
              {(["low", "medium", "high"] as const).map((k) => (
                <option key={k} value={k}>
                  {LEVELS[da ? "da" : "en"][k]}
                </option>
              ))}
            </KitSelect>
          </Field>
        </div>
        <Field label={da ? "Hvad gjorde I med det samme?" : "What did you do right away?"}>
          <textarea
            className={fieldClass}
            rows={2}
            value={report.immediateAction}
            onChange={(e) => patch({ immediateAction: e.target.value })}
            placeholder={
              da ? "Fx stoppede arbejdet eller sikrede området" : "e.g. stopped the work or secured the area"
            }
          />
        </Field>
        <Field label={da ? "Hvad bør ændres?" : "What should change?"}>
          <textarea
            className={fieldClass}
            rows={2}
            value={report.suggestedFix}
            onChange={(e) => patch({ suggestedFix: e.target.value })}
            placeholder={
              da ? "Fx bedre placering, afspærring eller hjælpemiddel" : "e.g. better placement, barriers, or an aid"
            }
          />
        </Field>
        <Field label={da ? "Gives til" : "Give to"}>
          <KitInput
            value={report.reportedTo}
            onChange={(e) => patch({ reportedTo: e.target.value })}
            placeholder={da ? "Arbejdsleder eller AMO" : "Supervisor or health and safety group"}
          />
        </Field>
      </Panel>

      <ActionBar>
        <CopyButton
          value={text}
          label={da ? "Kopiér rapport" : "Copy report"}
          copiedLabel={da ? "Kopieret" : "Copied"}
        />
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => setReport(emptyReport())}
        >
          {da ? "Ny rapport" : "New report"}
        </button>
      </ActionBar>
    </ToolShell>
  );
}
