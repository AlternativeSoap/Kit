"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { getSimpleDef } from "./defs";

export function SimpleTool({ id }: { id: string }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const def = getSimpleDef(id);
  const da = locale === "da";
  const copyLabel = dictionary.contrast.copy;
  const copiedLabel = dictionary.contrast.copied;

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of def?.fields ?? []) {
      init[f.key] = f.defaultValue ?? "";
    }
    return init;
  });

  const rows = useMemo(() => {
    if (!def) return null;
    try {
      return def.compute(values);
    } catch {
      return null;
    }
  }, [def, values]);

  if (!def) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        {def.fields.map((field) => {
          const label = da ? field.labelDa : field.labelEn;
          const hint = da ? field.hintDa : field.hintEn;
          return (
            <label key={field.key} className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">
                {label}
              </span>
              {field.kind === "select" && field.options ? (
                <select
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {da ? opt.labelDa : opt.labelEn}
                    </option>
                  ))}
                </select>
              ) : field.multiline ? (
                <textarea
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  rows={8}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              )}
              {hint ? (
                <span className="mt-1 block text-xs text-muted">{hint}</span>
              ) : null}
            </label>
          );
        })}
        {def.fields.length === 0 ? (
          <p className="text-sm text-muted">
            {da ? "Resultatet opdateres automatisk." : "Results update automatically."}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">
        {rows?.length ? (
          rows.map((row) => (
            <div
              key={row.labelEn}
              className="rounded-lg border border-border bg-black/[0.02] p-4"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  {da ? row.labelDa : row.labelEn}
                </span>
                <CopyButton
                  value={row.value}
                  label={copyLabel}
                  copiedLabel={copiedLabel}
                />
              </div>
              <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">
                {row.value}
              </pre>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">
            {da ? "Udfyld felterne for at se resultatet." : "Fill in the fields to see results."}
          </p>
        )}
      </div>
    </div>
  );
}
