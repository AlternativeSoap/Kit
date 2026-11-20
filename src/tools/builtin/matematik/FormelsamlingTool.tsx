"use client";

import { useMemo, useState } from "react";
import { Field, KitInput } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { SHEET_FORMULAS } from "./formulas";

export function FormelsamlingTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SHEET_FORMULAS;
    return SHEET_FORMULAS.filter((r) => {
      const hay = [
        r.topicDa,
        r.topicEn,
        r.nameDa,
        r.nameEn,
        r.noteDa,
        r.noteEn,
        r.search,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <div className="space-y-4">
      <Field label={da ? "Søg i formler" : "Search formulas"}>
        <KitInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={da ? "fx pythagoras, brøk, sin…" : "e.g. pythagoras, fraction, sin…"}
          autoComplete="off"
        />
      </Field>

      <div className="overflow-x-auto rounded-[12px] border border-border">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="bg-overlay/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">{da ? "Emne" : "Topic"}</th>
              <th className="px-3 py-2.5 font-medium">{da ? "Navn" : "Name"}</th>
              <th className="px-3 py-2.5 font-medium">{da ? "Formel" : "Formula"}</th>
              <th className="px-3 py-2.5 font-medium">{da ? "Niveau" : "Level"}</th>
              <th className="px-3 py-2.5 font-medium">{da ? "Note" : "Note"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t border-border align-middle odd:bg-surface even:bg-overlay/20"
              >
                <td className="px-3 py-3 text-muted">
                  {da ? r.topicDa : r.topicEn}
                </td>
                <td className="px-3 py-3 font-medium text-foreground">
                  {da ? r.nameDa : r.nameEn}
                </td>
                <td className="px-3 py-3">
                  <div className="rounded-[10px] border border-border/70 bg-overlay/30 px-3 py-2">
                    {r.view}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block rounded-[6px] px-1.5 py-0.5 text-[11px] font-medium ${
                      r.level === "simple"
                        ? "bg-accent-soft text-foreground"
                        : "bg-overlay text-muted"
                    }`}
                  >
                    {r.level === "simple"
                      ? da
                        ? "Simpelt"
                        : "Simple"
                      : da
                        ? "Avanceret"
                        : "Advanced"}
                  </span>
                </td>
                <td className="px-3 py-3 text-muted">
                  {da ? r.noteDa : r.noteEn}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">
                  {da ? "Ingen formler matcher." : "No formulas match."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
