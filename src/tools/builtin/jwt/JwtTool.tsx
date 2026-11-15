"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { type ToolPrefill } from "@/tools/prefill";
import { decodeJwt, formatJwtJson } from "./calc";

function formatClaimDate(date: Date | null, locale: string): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function JwtTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.jwt;

  const [token, setToken] = useState(() => prefill?.token ?? "");

  const decoded = useMemo(() => decodeJwt(token), [token]);

  const headerText = decoded ? formatJwtJson(decoded.header.json) : "";
  const payloadText = decoded ? formatJwtJson(decoded.payload.json) : "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.token}</span>
          <textarea
            value={token}
            onChange={(event) => setToken(event.target.value)}
            rows={6}
            spellCheck={false}
            placeholder={t.tokenPlaceholder}
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[13px]"
          />
          <span className="mt-1 block text-xs text-muted">{t.privacy}</span>
        </label>
        <p className="rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-foreground">
          {t.noVerify}
        </p>
        <p className="text-sm text-muted">
          {t.relatedNote}{" "}
          <Link href="/t/json" className="text-accent hover:underline">
            {t.relatedJson}
          </Link>
          {", "}
          <Link href="/t/encode" className="text-accent hover:underline">
            {t.relatedEncode}
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        {decoded ? (
          <>
            <dl className="rounded-[12px] border border-border bg-surface px-5 py-3 text-sm">
              <div className="flex justify-between gap-4 py-1">
                <dt className="text-muted">{t.alg}</dt>
                <dd className="font-medium">{decoded.alg ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4 py-1">
                <dt className="text-muted">{t.typ}</dt>
                <dd className="font-medium">{decoded.typ ?? "—"}</dd>
              </div>
              {decoded.exp ? (
                <div className="flex justify-between gap-4 py-1">
                  <dt className="text-muted">{t.exp}</dt>
                  <dd className="font-medium">
                    {formatClaimDate(decoded.exp, locale)}
                  </dd>
                </div>
              ) : null}
              {decoded.iat ? (
                <div className="flex justify-between gap-4 py-1">
                  <dt className="text-muted">{t.iat}</dt>
                  <dd className="font-medium">
                    {formatClaimDate(decoded.iat, locale)}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="rounded-[12px] border border-border bg-surface px-5 py-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{t.header}</p>
                <CopyButton
                  value={headerText}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
                {headerText || t.invalidPart}
              </pre>
            </div>

            <div className="rounded-[12px] border border-border bg-surface px-5 py-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{t.payload}</p>
                <CopyButton
                  value={payloadText}
                  label={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
                {payloadText || t.invalidPart}
              </pre>
            </div>
          </>
        ) : (
          <p className="rounded-[12px] border border-border bg-surface px-5 py-8 text-sm text-muted">
            {token.trim() ? t.invalid : t.empty}
          </p>
        )}
      </div>
    </div>
  );
}