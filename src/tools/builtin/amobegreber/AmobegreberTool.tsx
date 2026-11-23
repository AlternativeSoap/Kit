"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, KitInput, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  ActionBar,
  EmptyState,
  Panel,
  PanelHeader,
  ToolShell,
} from "../_amo/ui";
import {
  AM_AREAS,
  AM_ROLES,
  filterTerms,
  termsExport,
} from "./calc";

type Tab = "terms" | "roles" | "areas";

export function AmobegreberTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [tab, setTab] = useState<Tab>("terms");
  const [query, setQuery] = useState("");

  const terms = useMemo(() => filterTerms(query), [query]);
  const exportText = useMemo(() => termsExport(da), [da]);

  return (
    <ToolShell
      intro={
        da
          ? "Her kan du slå de vigtigste ord op, se hvem der har ansvar, og huske forskellen på fysisk, psykisk, sikkerhed og kemi."
          : "Look up the key words, see who is responsible, and remember the difference between physical, mental, safety, and chemical topics."
      }
    >
      <Segmented
        value={tab}
        onChange={setTab}
        ariaLabel={da ? "Sektion" : "Section"}
        options={[
          { id: "terms", label: da ? "Ord" : "Words" },
          { id: "roles", label: da ? "Ansvar" : "Roles" },
          { id: "areas", label: da ? "Områder" : "Areas" },
        ]}
      />

      {tab === "terms" ? (
        <Panel>
          <PanelHeader
            title={da ? "Begreber" : "Terms"}
            subtitle={
              da
                ? "Korte forklaringer du kan bruge før kurset eller i hverdagen."
                : "Short explanations you can use before a course or at work."
            }
            action={
              <CopyButton
                value={exportText}
                label={da ? "Kopiér" : "Copy"}
                copiedLabel={da ? "Kopieret" : "Copied"}
              />
            }
          />
          <Field label={da ? "Søg" : "Search"}>
            <KitInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={da ? "Prøv AMR, APV eller nærved" : "Try AMR, APV, or near miss"}
            />
          </Field>
          {terms.length ? (
            <div className="space-y-2.5">
              {terms.map((t) => (
                <article
                  key={t.id}
                  className="rounded-[14px] border border-border bg-overlay/40 px-4 py-3.5"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <span className="rounded-[8px] bg-accent-soft px-2 py-0.5 text-xs font-semibold text-foreground">
                      {t.abbr}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {da ? t.nameDa : t.nameEn}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {da ? t.meaningDa : t.meaningEn}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    <span className="font-medium text-foreground">
                      {da ? "Husk: " : "Remember: "}
                    </span>
                    {da ? t.tipDa : t.tipEn}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>
              {da
                ? "Ingen ord matchede. Prøv et andet søgeord."
                : "No words matched. Try a different search."}
            </EmptyState>
          )}
        </Panel>
      ) : null}

      {tab === "roles" ? (
        <Panel>
          <PanelHeader
            title={da ? "Hvem gør hvad?" : "Who does what?"}
            subtitle={
              da
                ? "Arbejdsgiveren har ansvaret. AMR repræsenterer kollegerne."
                : "The employer holds the responsibility. The representative speaks for colleagues."
            }
          />
          <div className="space-y-2.5">
            {AM_ROLES.map((r) => (
              <article
                key={r.id}
                className="grid gap-1 rounded-[14px] border border-border bg-overlay/40 px-4 py-3.5 sm:grid-cols-[10rem_1fr]"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {da ? r.roleDa : r.roleEn}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {da ? r.dutyDa : r.dutyEn}
                </p>
              </article>
            ))}
          </div>
        </Panel>
      ) : null}

      {tab === "areas" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {AM_AREAS.map((a) => (
            <Panel key={a.id} className="h-full">
              <PanelHeader title={da ? a.titleDa : a.titleEn} />
              <ul className="space-y-2">
                {(da ? a.examplesDa : a.examplesEn).map((ex) => (
                  <li
                    key={ex}
                    className="flex items-start gap-2 text-sm text-muted"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden
                    />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      ) : null}

      {tab !== "terms" ? (
        <ActionBar>
          <CopyButton
            value={exportText}
            label={da ? "Kopiér ordbog" : "Copy glossary"}
            copiedLabel={da ? "Kopieret" : "Copied"}
          />
        </ActionBar>
      ) : null}
    </ToolShell>
  );
}
