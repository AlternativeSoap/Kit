"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";

const CITIES = [
  { id: "cph", zone: "Europe/Copenhagen", en: "Copenhagen", da: "København" },
  { id: "lon", zone: "Europe/London", en: "London", da: "London" },
  { id: "nyc", zone: "America/New_York", en: "New York", da: "New York" },
  { id: "lax", zone: "America/Los_Angeles", en: "Los Angeles", da: "Los Angeles" },
  { id: "sao", zone: "America/Sao_Paulo", en: "São Paulo", da: "São Paulo" },
  { id: "dub", zone: "Asia/Dubai", en: "Dubai", da: "Dubai" },
  { id: "del", zone: "Asia/Kolkata", en: "Delhi", da: "Delhi" },
  { id: "sin", zone: "Asia/Singapore", en: "Singapore", da: "Singapore" },
  { id: "tok", zone: "Asia/Tokyo", en: "Tokyo", da: "Tokyo" },
  { id: "syd", zone: "Australia/Sydney", en: "Sydney", da: "Sydney" },
] as const;

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatInZone(date: Date, zone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: zone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function offsetLabel(date: Date, zone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

export function WorldClockTool() {
  const dictionary = useDictionary();
  const { locale } = useLanguage();
  const t = dictionary.worldclockTool;
  const da = locale === "da";
  const [now, setNow] = useState(() => new Date());
  const localZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      : "UTC";

  const [meetLocal, setMeetLocal] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toDatetimeLocalValue(d);
  });
  const [fromZone, setFromZone] = useState(localZone);
  const [toZone, setToZone] = useState("America/New_York");

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const meetDate = useMemo(() => {
    const raw = new Date(meetLocal);
    return Number.isNaN(raw.getTime()) ? null : raw;
  }, [meetLocal]);

  const meetFmt = useMemo(() => {
    if (!meetDate) return null;
    try {
      return {
        from: formatInZone(meetDate, fromZone, da ? "da-DK" : "en-GB"),
        to: formatInZone(meetDate, toZone, da ? "da-DK" : "en-GB"),
      };
    } catch {
      return null;
    }
  }, [da, fromZone, meetDate, toZone]);

  const localLabel = da ? "Din tid" : "Your time";
  const localFormatted = formatInZone(now, localZone, da ? "da-DK" : "en-GB");

  const zoneOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { zone: string; label: string }[] = [
      { zone: localZone, label: localLabel },
    ];
    seen.add(localZone);
    for (const city of CITIES) {
      if (seen.has(city.zone)) continue;
      seen.add(city.zone);
      opts.push({ zone: city.zone, label: da ? city.da : city.en });
    }
    return opts;
  }, [da, localLabel, localZone]);

  const copyAll = [
    `${localLabel}: ${localFormatted}`,
    ...CITIES.map((city) => {
      const label = da ? city.da : city.en;
      return `${label}: ${formatInZone(now, city.zone, da ? "da-DK" : "en-GB")}`;
    }),
  ].join("\n");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{t.live}</p>
        <CopyButton value={copyAll} label={t.copy} copiedLabel={t.copied} />
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {localLabel}
        </p>
        <p className="mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
          {localFormatted}
        </p>
        <p className="mt-2 text-sm text-muted">
          {localZone} · {offsetLabel(now, localZone)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CITIES.map((city) => (
          <div
            key={city.id}
            className="rounded-[12px] border border-border bg-surface px-4 py-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {da ? city.da : city.en}
              </p>
              <p className="text-xs text-muted">{offsetLabel(now, city.zone)}</p>
            </div>
            <p className="mt-1 font-mono text-lg tabular-nums text-foreground">
              {formatInZone(now, city.zone, da ? "da-DK" : "en-GB")}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-[12px] border border-border bg-surface p-4">
        <p className="text-sm font-medium">{t.meeting}</p>
        <p className="text-xs text-muted">{t.localHint}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block sm:col-span-1">
            <span className="mb-1.5 block text-xs text-muted">{t.when}</span>
            <input
              type="datetime-local"
              value={meetLocal}
              onChange={(event) => setMeetLocal(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">{t.fromZone}</span>
            <select
              value={fromZone}
              onChange={(event) => setFromZone(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm"
            >
              {zoneOptions.map((opt) => (
                <option key={opt.zone} value={opt.zone}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">{t.toZone}</span>
            <select
              value={toZone}
              onChange={(event) => setToZone(event.target.value)}
              className="w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm"
            >
              {zoneOptions.map((opt) => (
                <option key={`to-${opt.zone}`} value={opt.zone}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {meetFmt ? (
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted">{t.fromZone}: </span>
              <span className="font-mono">{meetFmt.from}</span>
            </p>
            <p>
              <span className="text-muted">{t.toZone}: </span>
              <span className="font-mono">{meetFmt.to}</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">{t.invalidTime}</p>
        )}
      </div>
    </div>
  );
}
