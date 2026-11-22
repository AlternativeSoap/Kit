"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { analyzeIsbn } from "./calc";

export function IsbnTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [raw, setRaw] = useState("978-3-16-148410-0");

  const result = useMemo(() => analyzeIsbn(raw), [raw]);

  const copyLabel = da ? "Kopiér" : "Copy";
  const copiedLabel = da ? "Kopieret" : "Copied";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <Field
          label="ISBN"
          hint={
            da
              ? "ISBN-10 eller ISBN-13. Bindestreger og mellemrum er tilladt."
              : "ISBN-10 or ISBN-13. Hyphens and spaces are allowed."
          }
        >
          <input
            type="text"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className={fieldClass}
            autoComplete="off"
            spellCheck={false}
            placeholder="978-3-16-148410-0"
          />
        </Field>
        <p className="text-sm text-muted">
          {da
            ? "Værktøjet tjekker kontrolcifret, viser en læsbar form og konverterer mellem ISBN-10 og ISBN-13 når det er muligt (kun 978-præfiks)."
            : "The tool checks the check digit, shows a readable form, and converts between ISBN-10 and ISBN-13 when possible (978 prefix only)."}
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-2">
        {result.valid ? (
          <>
            <div className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">
                    {da ? "Gyldigt" : "Valid"}{" "}
                    {result.kind === "isbn10" ? "ISBN-10" : "ISBN-13"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {result.hyphenated}
                  </p>
                </div>
                <CopyButton
                  value={result.digits}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
            </div>
            <dl className="space-y-2 border-t border-border py-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  {da ? "Kontrolciffer" : "Check digit"}
                </dt>
                <dd className="font-medium">{result.checkDigit}</dd>
              </div>
              {result.hyphenated10 ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">ISBN-10</dt>
                  <dd className="flex items-center gap-2 font-medium">
                    <span>{result.hyphenated10}</span>
                    <CopyButton
                      value={result.isbn10 ?? ""}
                      label={copyLabel}
                      copiedLabel={copiedLabel}
                    />
                  </dd>
                </div>
              ) : (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">ISBN-10</dt>
                  <dd className="text-muted">
                    {da
                      ? "Kan ikke konverteres (kun 978 → ISBN-10)."
                      : "Cannot convert (only 978 → ISBN-10)."}
                  </dd>
                </div>
              )}
              {result.hyphenated13 ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted">ISBN-13</dt>
                  <dd className="flex items-center gap-2 font-medium">
                    <span>{result.hyphenated13}</span>
                    <CopyButton
                      value={result.isbn13 ?? ""}
                      label={copyLabel}
                      copiedLabel={copiedLabel}
                    />
                  </dd>
                </div>
              ) : null}
            </dl>
          </>
        ) : raw.trim() ? (
          <div className="py-6">
            <p className="text-sm font-medium text-foreground">
              {da ? "Ugyldigt ISBN" : "Invalid ISBN"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {da ? result.reasonDa : result.reason}
            </p>
          </div>
        ) : (
          <p className="py-8 text-sm text-muted">
            {da
              ? "Indtast et ISBN for at validere og konvertere."
              : "Enter an ISBN to validate and convert."}
          </p>
        )}
      </div>
    </div>
  );
}
