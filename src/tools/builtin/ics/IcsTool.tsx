"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, primaryBtnClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { downloadTextFile } from "../media/canvas";
import { buildIcs } from "./calc";

function defaultStart() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
}

function defaultEnd() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 2);
  return d.toISOString().slice(0, 16);
}

export function IcsTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [title, setTitle] = useState(da ? "Møde" : "Meeting");
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const ics = useMemo(
    () =>
      buildIcs({
        title,
        startLocal: start,
        endLocal: end,
        location,
        description,
      }),
    [title, start, end, location, description],
  );

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Field label={da ? "Titel" : "Title"}>
        <input
          className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={da ? "Start" : "Start"}>
          <input
            type="datetime-local"
            className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>
        <Field label={da ? "Slut" : "End"}>
          <input
            type="datetime-local"
            className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </Field>
      </div>
      <Field label={da ? "Sted" : "Location"}>
        <input
          className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </Field>
      <Field label={da ? "Beskrivelse" : "Description"}>
        <textarea
          rows={3}
          className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primaryBtnClass}
          disabled={!ics}
          onClick={() => {
            if (!ics) return;
            downloadTextFile(ics, "event.ics", "text/calendar;charset=utf-8");
          }}
        >
          {da ? "Download .ics" : "Download .ics"}
        </button>
        {ics ? (
          <CopyButton
            value={ics}
            label={da ? "Kopiér" : "Copy"}
            copiedLabel={da ? "Kopieret" : "Copied"}
          />
        ) : null}
      </div>
      <p className="text-xs text-muted">
        {da
          ? "Filen åbnes i kalenderen på din telefon eller computer. Intet uploades."
          : "Open the file in your phone or computer calendar. Nothing is uploaded."}
      </p>
    </div>
  );
}
