"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitInput,
  KitSelect,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  ActionBar,
  EmptyState,
  Panel,
  PanelHeader,
  Stat,
  StatStrip,
  StepRail,
  ToneBadge,
  ToolShell,
} from "../_amo/ui";
import {
  APV_AREAS,
  APV_STEP_HELP,
  APV_STEPS,
  apvStats,
  apvToText,
  emptyApv,
  exampleFinding,
  isApvDocument,
  severityLabel,
  statusLabel,
  type ApvAction,
  type ApvDocument,
  type ApvFinding,
  type ApvStep,
} from "./calc";

const STORAGE_KEY = "kit-apv-v1";

let seq = 1;
function uid(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now()}-${seq}`;
}

export function ApvTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [step, setStep] = useState<ApvStep>(1);
  const [doc, setDoc] = useState<ApvDocument>(() => emptyApv(da));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (isApvDocument(parsed)) setDoc(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      /* ignore */
    }
  }, [doc, hydrated]);

  const stats = useMemo(() => apvStats(doc), [doc]);
  const exportText = useMemo(() => apvToText(doc, da), [doc, da]);

  const addFinding = () => {
    const finding: ApvFinding = {
      id: uid("f"),
      description: "",
      area: APV_AREAS[da ? "da" : "en"][0],
      severity: "medium",
    };
    setDoc((prev) => ({ ...prev, findings: [...prev.findings, finding] }));
  };

  const addAction = () => {
    const action: ApvAction = {
      id: uid("a"),
      findingId: doc.findings[0]?.id ?? "",
      action: "",
      owner: "",
      deadline: "",
      status: "open",
      followUp: "",
    };
    setDoc((prev) => ({ ...prev, actions: [...prev.actions, action] }));
  };

  return (
    <ToolShell
      wide
      intro={
        da
          ? "Gå trin for trin gennem en APV. Skriv problemer, lav en plan, og tjek op. Alt gemmes kun i din browser."
          : "Go step by step through a workplace assessment. Write problems, make a plan, and follow up. Everything stays only in your browser."
      }
    >
      <StepRail
        steps={[...APV_STEPS[da ? "da" : "en"]]}
        current={step}
        onSelect={(n) => setStep(n as ApvStep)}
      />

      <StatStrip>
        <Stat label={da ? "Problemer" : "Problems"} value={stats.findings} accent />
        <Stat label={da ? "Alvorlige" : "Serious"} value={stats.high} />
        <Stat label={da ? "Ikke færdige" : "Not done"} value={stats.open} />
        <Stat label={da ? "Færdige" : "Done"} value={stats.done} />
      </StatStrip>

      <Panel>
        <PanelHeader
          title={da ? "Stedet" : "The place"}
          subtitle={
            da
              ? "Opdater APV når noget vigtigt ændrer sig, og mindst hvert tredje år."
              : "Update the APV when something important changes, and at least every three years."
          }
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={da ? "Arbejdssted" : "Workplace"}>
            <KitInput
              value={doc.workplace}
              onChange={(e) =>
                setDoc((prev) => ({ ...prev, workplace: e.target.value }))
              }
              placeholder={da ? "Fx lager og terminal" : "e.g. warehouse and terminal"}
            />
          </Field>
          <Field label={da ? "Sidst opdateret" : "Last updated"}>
            <KitInput
              type="date"
              value={doc.revisedAt}
              onChange={(e) =>
                setDoc((prev) => ({ ...prev, revisedAt: e.target.value }))
              }
            />
          </Field>
          <Field label={da ? "Næste gennemgang" : "Next review"}>
            <KitInput
              type="date"
              value={doc.nextReview}
              onChange={(e) =>
                setDoc((prev) => ({ ...prev, nextReview: e.target.value }))
              }
            />
          </Field>
        </div>
      </Panel>

      {step === 1 ? (
        <Panel>
          <PanelHeader
            title={da ? "1. Find forholdene" : "1. Map the work"}
            subtitle={APV_STEP_HELP[da ? "da" : "en"][0]}
          />
          <textarea
            className={fieldClass}
            rows={10}
            value={doc.mappingNotes}
            onChange={(e) =>
              setDoc((prev) => ({ ...prev, mappingNotes: e.target.value }))
            }
          />
        </Panel>
      ) : null}

      {step === 2 || step === 3 ? (
        <Panel>
          <PanelHeader
            title={
              da
                ? step === 2
                  ? "2. Find problemer"
                  : "3. Vurder dem"
                : step === 2
                  ? "2. Find problems"
                  : "3. Judge them"
            }
            subtitle={APV_STEP_HELP[da ? "da" : "en"][step - 1]}
            action={
              <div className="flex flex-wrap gap-2">
                {!doc.findings.length ? (
                  <button
                    type="button"
                    className={secondaryBtnClass}
                    onClick={() =>
                      setDoc((prev) => ({
                        ...prev,
                        findings: [...prev.findings, exampleFinding(da)],
                      }))
                    }
                  >
                    {da ? "Indsæt eksempel" : "Insert example"}
                  </button>
                ) : null}
                <button type="button" className={primaryBtnClass} onClick={addFinding}>
                  {da ? "Tilføj problem" : "Add problem"}
                </button>
              </div>
            }
          />
          {doc.findings.length ? (
            <div className="space-y-3">
              {doc.findings.map((f, i) => (
                <article
                  key={f.id}
                  className="space-y-3 rounded-[14px] border border-border bg-overlay/40 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <ToneBadge
                      tone={
                        f.severity === "high"
                          ? "bad"
                          : f.severity === "medium"
                            ? "warn"
                            : "ok"
                      }
                    >
                      {da ? `Problem ${i + 1}` : `Problem ${i + 1}`} ·{" "}
                      {severityLabel(f.severity, da)}
                    </ToneBadge>
                    <button
                      type="button"
                      className={secondaryBtnClass}
                      onClick={() =>
                        setDoc((prev) => ({
                          ...prev,
                          findings: prev.findings.filter((x) => x.id !== f.id),
                          actions: prev.actions.map((a) =>
                            a.findingId === f.id ? { ...a, findingId: "" } : a,
                          ),
                        }))
                      }
                    >
                      {da ? "Fjern" : "Remove"}
                    </button>
                  </div>
                  <textarea
                    className={fieldClass}
                    rows={2}
                    value={f.description}
                    placeholder={
                      da ? "Beskriv problemet" : "Describe the problem"
                    }
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        findings: prev.findings.map((x) =>
                          x.id === f.id
                            ? { ...x, description: e.target.value }
                            : x,
                        ),
                      }))
                    }
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <KitSelect
                      value={f.area}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          findings: prev.findings.map((x) =>
                            x.id === f.id ? { ...x, area: e.target.value } : x,
                          ),
                        }))
                      }
                    >
                      {APV_AREAS[da ? "da" : "en"].map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </KitSelect>
                    <KitSelect
                      value={f.severity}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          findings: prev.findings.map((x) =>
                            x.id === f.id
                              ? {
                                  ...x,
                                  severity: e.target
                                    .value as ApvFinding["severity"],
                                }
                              : x,
                          ),
                        }))
                      }
                    >
                      <option value="low">{severityLabel("low", da)}</option>
                      <option value="medium">
                        {severityLabel("medium", da)}
                      </option>
                      <option value="high">{severityLabel("high", da)}</option>
                    </KitSelect>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>
              {da ? "Ingen problemer endnu." : "No problems yet."}
            </EmptyState>
          )}
        </Panel>
      ) : null}

      {step === 4 ? (
        <Panel>
          <PanelHeader
            title={da ? "4. Lav en plan" : "4. Make a plan"}
            subtitle={APV_STEP_HELP[da ? "da" : "en"][3]}
            action={
              <button type="button" className={primaryBtnClass} onClick={addAction}>
                {da ? "Tilføj handling" : "Add action"}
              </button>
            }
          />
          {doc.actions.length ? (
            <div className="space-y-3">
              {doc.actions.map((a, i) => (
                <article
                  key={a.id}
                  className="space-y-3 rounded-[14px] border border-border bg-overlay/40 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <ToneBadge
                      tone={
                        a.status === "done"
                          ? "ok"
                          : a.status === "doing"
                            ? "info"
                            : "warn"
                      }
                    >
                      {da ? `Handling ${i + 1}` : `Action ${i + 1}`} ·{" "}
                      {statusLabel(a.status, da)}
                    </ToneBadge>
                    <button
                      type="button"
                      className={secondaryBtnClass}
                      onClick={() =>
                        setDoc((prev) => ({
                          ...prev,
                          actions: prev.actions.filter((x) => x.id !== a.id),
                        }))
                      }
                    >
                      {da ? "Fjern" : "Remove"}
                    </button>
                  </div>
                  <textarea
                    className={fieldClass}
                    rows={2}
                    value={a.action}
                    placeholder={
                      da ? "Hvad skal gøres?" : "What should be done?"
                    }
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        actions: prev.actions.map((x) =>
                          x.id === a.id ? { ...x, action: e.target.value } : x,
                        ),
                      }))
                    }
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <KitSelect
                      value={a.findingId}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          actions: prev.actions.map((x) =>
                            x.id === a.id
                              ? { ...x, findingId: e.target.value }
                              : x,
                          ),
                        }))
                      }
                    >
                      <option value="">
                        {da
                          ? "Knyt til problem (valgfri)"
                          : "Link problem (optional)"}
                      </option>
                      {doc.findings.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.description.slice(0, 48) || f.area}
                        </option>
                      ))}
                    </KitSelect>
                    <KitSelect
                      value={a.status}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          actions: prev.actions.map((x) =>
                            x.id === a.id
                              ? {
                                  ...x,
                                  status: e.target
                                    .value as ApvAction["status"],
                                }
                              : x,
                          ),
                        }))
                      }
                    >
                      <option value="open">{statusLabel("open", da)}</option>
                      <option value="doing">{statusLabel("doing", da)}</option>
                      <option value="done">{statusLabel("done", da)}</option>
                    </KitSelect>
                    <KitInput
                      value={a.owner}
                      placeholder={da ? "Ansvarlig" : "Owner"}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          actions: prev.actions.map((x) =>
                            x.id === a.id ? { ...x, owner: e.target.value } : x,
                          ),
                        }))
                      }
                    />
                    <KitInput
                      type="date"
                      value={a.deadline}
                      onChange={(e) =>
                        setDoc((prev) => ({
                          ...prev,
                          actions: prev.actions.map((x) =>
                            x.id === a.id
                              ? { ...x, deadline: e.target.value }
                              : x,
                          ),
                        }))
                      }
                    />
                  </div>
                  <KitInput
                    value={a.followUp}
                    placeholder={
                      da ? "Opfølgning / resultat" : "Follow-up / result"
                    }
                    onChange={(e) =>
                      setDoc((prev) => ({
                        ...prev,
                        actions: prev.actions.map((x) =>
                          x.id === a.id
                            ? { ...x, followUp: e.target.value }
                            : x,
                        ),
                      }))
                    }
                  />
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>{da ? "Ingen handlinger." : "No actions."}</EmptyState>
          )}
        </Panel>
      ) : null}

      {step === 5 ? (
        <Panel>
          <PanelHeader
            title={da ? "5. Tjek op" : "5. Follow up"}
            subtitle={APV_STEP_HELP[da ? "da" : "en"][4]}
          />
          <StatStrip>
            <Stat
              label={da ? "Mangler ansvarlig" : "Missing owner"}
              value={stats.missingOwner}
              accent={stats.missingOwner > 0}
            />
            <Stat
              label={da ? "Mangler frist" : "Missing deadline"}
              value={stats.missingDeadline}
              accent={stats.missingDeadline > 0}
            />
            <Stat label={da ? "Ikke færdige" : "Not done"} value={stats.open} />
            <Stat label={da ? "Færdige" : "Done"} value={stats.done} />
          </StatStrip>
          <p className="text-sm text-muted">
            {da
              ? "Hvis noget mangler ansvarlig eller frist, er planen ikke klar endnu."
              : "If something is missing an owner or deadline, the plan is not ready yet."}
          </p>
        </Panel>
      ) : null}

      <ActionBar>
        <CopyButton
          value={exportText}
          label={da ? "Kopiér APV" : "Copy APV"}
          copiedLabel={da ? "Kopieret" : "Copied"}
        />
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => {
            setDoc(emptyApv(da));
            setStep(1);
          }}
        >
          {da ? "Nulstil" : "Reset"}
        </button>
        {step < 5 ? (
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => setStep((s) => (s + 1) as ApvStep)}
          >
            {da ? "Næste trin" : "Next step"}
          </button>
        ) : null}
      </ActionBar>
    </ToolShell>
  );
}
