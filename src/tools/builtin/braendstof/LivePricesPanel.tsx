"use client";

import { useEffect, useState } from "react";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import type { DayAheadSnapshot, PriceArea } from "@/lib/energy/dayAhead";

type LivePricesPanelProps = {
  onApplyElectricPrice: (krPerKwh: number) => void;
};

/** `hourDk` is already Danish local wall time from Energi Data Service. */
function formatHourLabel(hourDk: string, locale: "en" | "da"): string {
  const [datePart, timePart = "00:00:00"] = hourDk.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour] = timePart.split(":").map(Number);
  if (!year || !month || !day || hour === undefined) {
    return hourDk.slice(11, 16) || hourDk;
  }
  // Use UTC constructor so weekday matches the wall-clock date, not a shifted zone.
  const date = new Date(Date.UTC(year, month - 1, day, hour));
  const weekday = new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
  return `${weekday} ${String(hour).padStart(2, "0")}:00`;
}

function HourList({
  title,
  hours,
  locale,
  empty,
}: {
  title: string;
  hours: DayAheadSnapshot["past"];
  locale: "en" | "da";
  empty: string;
}) {
  if (hours.length === 0) {
    return (
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
          {title}
        </p>
        <p className="mt-2 text-sm text-muted">{empty}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
        {title}
      </p>
      <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto kit-scrollbar text-sm">
        {hours.map((hour) => (
          <li
            key={hour.hourDk}
            className="flex items-center justify-between gap-3 border-b border-border/70 py-1.5 last:border-b-0"
          >
            <span className="text-muted">
              {formatHourLabel(hour.hourDk, locale)}
            </span>
            <span className="font-medium tabular-nums">
              {formatNumber(hour.krPerKwh, locale, 2)} kr/kWh
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type FuelLinkId = "fdm" | "circlek" | "ok";

const FUEL_LINKS: Array<{ id: FuelLinkId; href: string }> = [
  {
    id: "fdm",
    href: "https://fdm.dk/alt-om-biler/test-udstyr/priser/benzinpriser",
  },
  {
    id: "circlek",
    href: "https://www.circlek.dk/da-DK/bilisten/braendstofpriser",
  },
  {
    id: "ok",
    href: "https://www.ok.dk/privat/produkter/benzin-og-diesel",
  },
];

export function LivePricesPanel({ onApplyElectricPrice }: LivePricesPanelProps) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const t = dictionary.braendstof;

  const [area, setArea] = useState<PriceArea>("DK1");
  const [snapshot, setSnapshot] = useState<DayAheadSnapshot | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    void (async () => {
      try {
        const response = await fetch(`/api/energy/day-ahead?area=${area}`);
        if (!response.ok) throw new Error("bad status");
        const data = (await response.json()) as DayAheadSnapshot;
        if (cancelled) return;
        setSnapshot(data);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setSnapshot(null);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [area]);

  return (
    <section className="space-y-8 border-t border-border pt-8">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">{t.liveTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t.liveIntro}</p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-medium">{t.liveElectricTitle}</h3>
          <div
            role="group"
            aria-label={t.liveAreaLabel}
            className="flex flex-wrap gap-1"
          >
            {(["DK1", "DK2"] as const).map((option) => {
              const active = option === area;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setArea(option)}
                  className={`kit-touch-target inline-flex items-center rounded-[10px] px-3 py-2 text-xs font-medium transition-colors sm:min-h-0 ${
                    active
                      ? "bg-accent text-white"
                      : "text-muted hover:bg-accent-soft hover:text-foreground"
                  }`}
                >
                  {option === "DK1" ? t.liveAreaWest : t.liveAreaEast}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-xs text-muted">{t.liveElectricHint}</p>

        {status === "loading" ? (
          <p className="mt-6 text-sm text-muted">{t.liveLoading}</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-6 text-sm text-muted">{t.liveError}</p>
        ) : null}

        {status === "ready" && snapshot ? (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs text-muted">{t.liveNow}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                  {snapshot.current
                    ? `${formatNumber(snapshot.current.krPerKwh, locale, 2)} kr/kWh`
                    : t.liveNowMissing}
                </p>
                {snapshot.current ? (
                  <p className="mt-1 text-xs text-muted">
                    {formatHourLabel(snapshot.current.hourDk, locale)}
                  </p>
                ) : null}
              </div>
              {snapshot.current ? (
                <button
                  type="button"
                  onClick={() =>
                    onApplyElectricPrice(snapshot.current!.krPerKwh)
                  }
                  className="kit-touch-target inline-flex items-center rounded-[10px] border border-border px-3 py-2 text-sm font-medium hover:bg-background sm:min-h-0"
                >
                  {t.liveUsePrice}
                </button>
              ) : null}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <HourList
                title={t.livePast}
                hours={snapshot.past}
                locale={locale}
                empty={t.livePastEmpty}
              />
              <HourList
                title={t.liveUpcoming}
                hours={snapshot.upcoming}
                locale={locale}
                empty={t.liveUpcomingEmpty}
              />
            </div>

            <p className="text-xs text-muted">{t.liveSource}</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-[12px] border border-border bg-surface p-5">
        <h3 className="text-sm font-medium">{t.liveFuelTitle}</h3>
        <p className="mt-2 text-sm text-muted">{t.liveFuelBody}</p>
        <ul className="mt-4 space-y-3">
          <li className="text-sm">
            <span className="font-medium">{t.liveFuel95}</span>
            <span className="text-muted"> · {t.liveFuelPumpNote}</span>
          </li>
          <li className="text-sm">
            <span className="font-medium">{t.liveFuelDiesel}</span>
            <span className="text-muted"> · {t.liveFuelPumpNote}</span>
          </li>
        </ul>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FUEL_LINKS.map((link) => {
            const label =
              link.id === "fdm"
                ? t.liveFuelLinkFdm
                : link.id === "circlek"
                  ? t.liveFuelLinkCirclek
                  : t.liveFuelLinkOk;
            return (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kit-touch-target inline-flex items-center rounded-[10px] border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-background sm:min-h-0"
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
