"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitInput,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { downloadTextFile } from "../media/canvas";

type Row = { id: string; date: string; hours: string; note: string };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TimeseddelTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [rows, setRows] = useState<Row[]>([
    { id: "1", date: today(), hours: "7.5", note: "" },
  ]);

  const total = useMemo(
    () =>
      rows.reduce((sum, row) => {
        const n = Number(row.hours.replace(",", "."));
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0),
    [rows],
  );

  const csv = useMemo(() => {
    const header = da ? "Dato;Timer;Note" : "Date;Hours;Note";
    const body = rows
      .map((r) => `${r.date};${r.hours.replace(".", ",")};${r.note.replace(/;/g, ",")}`)
      .join("\n");
    return `${header}\n${body}\n${da ? "Total" : "Total"};${String(total).replace(".", ",")};`;
  }, [rows, total, da]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid gap-2 rounded-[12px] border border-border bg-surface p-3 sm:grid-cols-[9rem_6rem_1fr_auto]"
          >
            <Field label={da ? "Dato" : "Date"}>
              <KitInput
                type="date"
                value={row.date}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((r, i) =>
                      i === index ? { ...r, date: e.target.value } : r,
                    ),
                  )
                }
              />
            </Field>
            <Field label={da ? "Timer" : "Hours"}>
              <KitInput
                value={row.hours}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((r, i) =>
                      i === index ? { ...r, hours: e.target.value } : r,
                    ),
                  )
                }
              />
            </Field>
            <Field label={da ? "Note" : "Note"}>
              <KitInput
                value={row.note}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((r, i) =>
                      i === index ? { ...r, note: e.target.value } : r,
                    ),
                  )
                }
              />
            </Field>
            <div className="flex items-end">
              <button
                type="button"
                className={secondaryBtnClass}
                disabled={rows.length <= 1}
                onClick={() =>
                  setRows((prev) => prev.filter((_, i) => i !== index))
                }
              >
                {da ? "Fjern" : "Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={secondaryBtnClass}
        onClick={() =>
          setRows((prev) => [
            ...prev,
            { id: String(Date.now()), date: today(), hours: "0", note: "" },
          ])
        }
      >
        {da ? "Tilføj dag" : "Add day"}
      </button>

      <p className="text-sm font-medium">
        {da ? "Total" : "Total"}: {total.toFixed(2)} {da ? "timer" : "hours"}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primaryBtnClass}
          onClick={() =>
            downloadTextFile(csv, "timesheet.csv", "text/csv;charset=utf-8")
          }
        >
          {da ? "Download CSV" : "Download CSV"}
        </button>
        <CopyButton
          value={csv}
          label={da ? "Kopiér" : "Copy"}
          copiedLabel={da ? "Kopieret" : "Copied"}
        />
      </div>
    </div>
  );
}
