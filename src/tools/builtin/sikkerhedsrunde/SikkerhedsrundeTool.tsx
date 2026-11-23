"use client";

import { useMemo, useState } from "react";
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
  Panel,
  PanelHeader,
  ProgressBar,
  Stat,
  StatStrip,
  ToneBadge,
  ToolShell,
} from "../_amo/ui";
import {
  ROUND_TEMPLATES,
  buildItems,
  roundStats,
  roundToText,
  type CheckItem,
  type CheckStatus,
  type RoundTemplateId,
} from "./calc";

export function SikkerhedsrundeTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [templateId, setTemplateId] = useState<RoundTemplateId>("lager");
  const [items, setItems] = useState<CheckItem[]>(() => buildItems("lager"));
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [area, setArea] = useState("");
  const [by, setBy] = useState("");

  const stats = useMemo(() => roundStats(items), [items]);
  const exportText = useMemo(
    () => roundToText(templateId, items, { date, area, by }, da),
    [templateId, items, date, area, by, da],
  );
  const answeredPct =
    stats.total > 0
      ? Math.round(((stats.total - stats.unset) / stats.total) * 100)
      : 0;

  const setStatus = (id: string, status: CheckStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const loadTemplate = (id: RoundTemplateId) => {
    setTemplateId(id);
    setItems(buildItems(id));
  };

  return (
    <ToolShell
      intro={
        da
          ? "Gå en runde med klare ja/nej-spørgsmål. Markér OK, afvigelse eller ikke relevant, og skriv en note dér hvor noget skal rettes."
          : "Walk through clear yes/no questions. Mark OK, issue, or not relevant, and write a note where something needs fixing."
      }
    >
      <Panel>
        <PanelHeader
          title={da ? "Runde" : "Walk"}
          action={
            stats.issue > 0 ? (
              <ToneBadge tone="bad">
                {stats.issue} {da ? "afvigelser" : "issues"}
              </ToneBadge>
            ) : (
              <ToneBadge tone="ok">
                {da ? "Ingen afvigelser" : "No issues"}
              </ToneBadge>
            )
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={da ? "Skabelon" : "Template"}>
            <KitSelect
              value={templateId}
              onChange={(e) => loadTemplate(e.target.value as RoundTemplateId)}
            >
              {ROUND_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {da ? t.titleDa : t.titleEn}
                </option>
              ))}
            </KitSelect>
          </Field>
          <Field label={da ? "Dato" : "Date"}>
            <KitInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label={da ? "Område" : "Area"}>
            <KitInput
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={da ? "Fx terminal A" : "e.g. terminal A"}
            />
          </Field>
          <Field label={da ? "Udført af" : "Done by"}>
            <KitInput value={by} onChange={(e) => setBy(e.target.value)} />
          </Field>
        </div>
        <ProgressBar
          value={answeredPct}
          tone={stats.issue > 0 ? "warn" : "ok"}
          label={da ? "Gennemgået" : "Reviewed"}
        />
        <StatStrip>
          <Stat label="OK" value={stats.ok} accent />
          <Stat
            label={da ? "Afvigelser" : "Issues"}
            value={stats.issue}
          />
          <Stat label="N/A" value={stats.na} />
          <Stat
            label={da ? "% OK" : "% OK"}
            value={stats.scored ? `${stats.percentOk}%` : "—"}
          />
        </StatStrip>
      </Panel>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`kit-tool-panel space-y-3 p-4 ${
              item.status === "issue"
                ? "border-orange-500/35"
                : item.status === "ok"
                  ? "border-emerald-500/25"
                  : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-overlay text-xs font-semibold text-muted">
                {index + 1}
              </span>
              <p className="text-sm font-medium leading-snug text-foreground">
                {da ? item.textDa : item.textEn}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pl-9">
              {(
                [
                  ["ok", da ? "OK" : "OK", "ok"],
                  ["issue", da ? "Afvigelse" : "Issue", "bad"],
                  ["na", "N/A", "neutral"],
                ] as const
              ).map(([status, label]) => (
                <button
                  key={status}
                  type="button"
                  className={
                    item.status === status
                      ? primaryBtnClass
                      : secondaryBtnClass
                  }
                  onClick={() => setStatus(item.id, status)}
                >
                  {label}
                </button>
              ))}
            </div>
            {item.status === "issue" || item.note ? (
              <div className="pl-9">
                <textarea
                  className={fieldClass}
                  rows={2}
                  value={item.note}
                  placeholder={da ? "Note / forslag" : "Note / suggestion"}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, note: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <ActionBar>
        <CopyButton
          value={exportText}
          label={da ? "Kopiér runde" : "Copy walk"}
          copiedLabel={da ? "Kopieret" : "Copied"}
        />
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() =>
            setItems((prev) =>
              prev.map((item) =>
                item.status === "unset" ? { ...item, status: "ok" } : item,
              ),
            )
          }
        >
          {da ? "Resten er OK" : "Mark rest OK"}
        </button>
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => setItems(buildItems(templateId))}
        >
          {da ? "Nulstil svar" : "Clear answers"}
        </button>
      </ActionBar>
    </ToolShell>
  );
}
