"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  fieldClass,
  primaryBtnClass,
  Segmented,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  ALL_FIELDS,
  generatePeople,
  rowsToCsv,
  rowsToJson,
  type DataLocale,
  type FieldKey,
} from "./calc";

const FIELD_LABELS: Record<FieldKey, { da: string; en: string }> = {
  name: { da: "Navn", en: "Name" },
  email: { da: "E-mail", en: "Email" },
  phone: { da: "Telefon", en: "Phone" },
  address: { da: "Adresse", en: "Address" },
  company: { da: "Virksomhed", en: "Company" },
  birthdate: { da: "Fødselsdato", en: "Birthdate" },
};

export function TestdataTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [count, setCount] = useState("10");
  const [dataLocale, setDataLocale] = useState<DataLocale>(da ? "da" : "en");
  const [seed, setSeed] = useState("");
  const [fields, setFields] = useState<FieldKey[]>([...ALL_FIELDS]);
  const [version, setVersion] = useState(0);

  const countN = Math.min(
    50,
    Math.max(1, Math.floor(Number(count.replace(",", ".")) || 0)),
  );

  const rows = useMemo(() => {
    if (fields.length === 0 || countN < 1) return [];
    return generatePeople({
      count: countN,
      locale: dataLocale,
      fields,
      seed: seed.trim() || `auto-${version}`,
    });
  }, [countN, dataLocale, fields, seed, version]);

  const csv = useMemo(() => rowsToCsv(rows, fields), [rows, fields]);
  const json = useMemo(() => rowsToJson(rows, fields), [rows, fields]);

  const toggleField = (key: FieldKey) => {
    setFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  };

  const copiedLabel = da ? "Kopieret" : "Copied";

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          label={da ? "Antal rækker" : "Row count"}
          hint={da ? "1–50 personer" : "1–50 people"}
        >
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="50"
            step="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Datasprog" : "Data locale"}
          </p>
          <Segmented
            value={dataLocale}
            onChange={setDataLocale}
            ariaLabel={da ? "Datasprog" : "Data locale"}
            options={[
              { id: "da", label: "Dansk" },
              { id: "en", label: "English" },
            ]}
          />
        </div>

        <Field
          label={da ? "Seed (valgfri)" : "Seed (optional)"}
          hint={
            da
              ? "Samme seed giver samme data. Tom = ny ved regenerering."
              : "Same seed yields the same data. Empty = new on regenerate."
          }
        >
          <input
            type="text"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className={fieldClass}
            placeholder={da ? "fx demo-42" : "e.g. demo-42"}
            autoComplete="off"
          />
        </Field>

        <div className="flex items-end">
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() => setVersion((v) => v + 1)}
          >
            {da ? "Generér igen" : "Regenerate"}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          {da ? "Felter" : "Fields"}
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_FIELDS.map((key) => {
            const active = fields.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleField(key)}
                className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm transition-colors sm:min-h-0 ${
                  active
                    ? "border-accent bg-accent text-on-accent"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {da ? FIELD_LABELS[key].da : FIELD_LABELS[key].en}
              </button>
            );
          })}
        </div>
      </div>

      {rows.length > 0 && fields.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              value={csv}
              label={da ? "Kopiér CSV" : "Copy CSV"}
              copiedLabel={copiedLabel}
            />
            <CopyButton
              value={json}
              label={da ? "Kopiér JSON" : "Copy JSON"}
              copiedLabel={copiedLabel}
            />
          </div>

          <div className="overflow-x-auto rounded-[12px] border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface">
                <tr>
                  {fields.map((key) => (
                    <th
                      key={key}
                      className="whitespace-nowrap px-3 py-2.5 font-medium"
                    >
                      {da ? FIELD_LABELS[key].da : FIELD_LABELS[key].en}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0"
                  >
                    {fields.map((key) => (
                      <td
                        key={key}
                        className="max-w-[220px] truncate px-3 py-2 align-top text-muted"
                        title={row[key]}
                      >
                        {row[key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted">
          {da
            ? "Vælg mindst ét felt for at generere testdata."
            : "Select at least one field to generate test data."}
        </p>
      )}

    </div>
  );
}
