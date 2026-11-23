"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitInput,
  fieldClass,
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
  ToolShell,
} from "../_amo/ui";
import {
  buildAgenda,
  discussStats,
  discussToText,
  type DiscussItem,
  type DiscussMeta,
} from "./calc";

export function AmodroftelseTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [meta, setMeta] = useState<DiscussMeta>({
    date: new Date().toISOString().slice(0, 10),
    participants: "",
    workplace: "",
  });
  const [items, setItems] = useState<DiscussItem[]>(() => buildAgenda());

  const stats = useMemo(() => discussStats(items), [items]);
  const exportText = useMemo(
    () => discussToText(meta, items, da),
    [meta, items, da],
  );
  const progress = stats.total ? (stats.done / stats.total) * 100 : 0;

  return (
    <ToolShell
      intro={
        da
          ? "Brug listen til den årlige drøftelse. Kryds af undervejs, skriv aftaler, og kopiér et kort referat til dem der ikke var med."
          : "Use the list for the yearly discussion. Tick items as you go, write agreements, and copy a short record for people who were not there."
      }
    >
      <Panel>
        <PanelHeader
          title={da ? "Møde" : "Meeting"}
          subtitle={
            da
              ? "Ledelse og AMO mindst én gang om året."
              : "Management and the OHS organisation at least once a year."
          }
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={da ? "Dato" : "Date"}>
            <KitInput
              type="date"
              value={meta.date}
              onChange={(e) =>
                setMeta((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </Field>
          <Field label={da ? "Arbejdssted" : "Workplace"}>
            <KitInput
              value={meta.workplace}
              onChange={(e) =>
                setMeta((prev) => ({ ...prev, workplace: e.target.value }))
              }
            />
          </Field>
          <Field label={da ? "Deltagere" : "Participants"}>
            <KitInput
              value={meta.participants}
              onChange={(e) =>
                setMeta((prev) => ({ ...prev, participants: e.target.value }))
              }
            />
          </Field>
        </div>
        <ProgressBar
          value={progress}
          tone={progress === 100 ? "ok" : "info"}
          label={da ? "Gennemgået" : "Covered"}
        />
        <StatStrip>
          <Stat
            label={da ? "Punkter" : "Items"}
            value={`${stats.done}/${stats.total}`}
            accent
          />
          <Stat label={da ? "Med noter" : "With notes"} value={stats.withNotes} />
        </StatStrip>
      </Panel>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`kit-tool-panel space-y-3 p-4 transition-colors ${
              item.done ? "border-accent/30 bg-accent-soft" : ""
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
                checked={item.done}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x) =>
                      x.id === item.id ? { ...x, done: e.target.checked } : x,
                    ),
                  )
                }
              />
              <span className="min-w-0">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-muted">
                  {da ? `Punkt ${index + 1}` : `Item ${index + 1}`}
                </span>
                <span className="mt-0.5 block text-sm font-semibold leading-snug text-foreground">
                  {da ? item.titleDa : item.titleEn}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {da ? item.hintDa : item.hintEn}
                </span>
              </span>
            </label>
            <textarea
              className={fieldClass}
              rows={2}
              value={item.notes}
              placeholder={da ? "Noter / aftaler" : "Notes / agreements"}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((x) =>
                    x.id === item.id ? { ...x, notes: e.target.value } : x,
                  ),
                )
              }
            />
          </article>
        ))}
      </div>

      <ActionBar>
        <CopyButton
          value={exportText}
          label={da ? "Kopiér referat" : "Copy notes"}
          copiedLabel={da ? "Kopieret" : "Copied"}
        />
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => {
            setItems(buildAgenda());
            setMeta({
              date: new Date().toISOString().slice(0, 10),
              participants: "",
              workplace: "",
            });
          }}
        >
          {da ? "Nulstil" : "Reset"}
        </button>
      </ActionBar>
    </ToolShell>
  );
}
