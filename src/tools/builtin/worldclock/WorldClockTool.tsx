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
  const [meetLocal, setMeetLocal] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [fromZone, setFromZone] = useState("Europe/Copenhagen");
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

  const copyAll = CITIES.map((city) => {
    const label = da ? city.da : city.en;
    return `${label}: ${formatInZone(now, city.zone, da ? "da-DK" : "en-GB")}`;
  }).join("\n");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{t.live}</p>
        <CopyButton value={copyAll} label={t.copy} copiedLabel={t.copied} />
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

      <div className="rounded-[12px] border border-border bg-surface p-4 space-y-4">
        <p className="text-sm font-medium">{t.meeting}</p>
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
              {CITIES.map((city) => (
                <option key={city.id} value={city.zone}>
                  {da ? city.da : city.en}
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
              {CITIES.map((city) => (
                <option key={`to-${city.id}`} value={city.zone}>
                  {da ? city.da : city.en}
                </option>
              ))}
            </select>
          </label>
        </div>
        {meetFmt ? (
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
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
