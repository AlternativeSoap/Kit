"use client";

import { useMemo, useState } from "react";
import { Field, KitInput, Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { simulateBolig, withHigherRate, type BoligResult, type YearRow } from "./calc";

function num(s: string) {
  return Number(s.replace(",", "."));
}

function money(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function NetWorthChart({
  base,
  stress,
  da,
}: {
  base: YearRow[];
  stress: YearRow[] | null;
  da: boolean;
}) {
  const w = 560;
  const h = 220;
  const pad = { t: 16, r: 12, b: 28, l: 48 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const allVals = [
    ...base.flatMap((r) => [r.buyNetWorth, r.rentNetWorth]),
    ...(stress?.flatMap((r) => [r.buyNetWorth, r.rentNetWorth]) ?? []),
  ];
  const minY = Math.min(0, ...allVals);
  const maxY = Math.max(...allVals, 1);
  const span = maxY - minY || 1;

  const x = (year: number, maxYear: number) =>
    pad.l + ((year - 1) / Math.max(1, maxYear - 1)) * innerW;
  const y = (v: number) => pad.t + innerH - ((v - minY) / span) * innerH;

  const path = (rows: YearRow[], key: "buyNetWorth" | "rentNetWorth") =>
    rows
      .map((r, i) => `${i === 0 ? "M" : "L"} ${x(r.year, rows.length)} ${y(r[key])}`)
      .join(" ");

  const zeroY = y(0);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="img"
      aria-label={da ? "Formue over tid" : "Net worth over time"}
    >
      <line
        x1={pad.l}
        y1={zeroY}
        x2={w - pad.r}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.15}
      />
      <path d={path(base, "buyNetWorth")} fill="none" stroke="var(--accent)" strokeWidth={2} />
      <path
        d={path(base, "rentNetWorth")}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.55}
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      {stress ? (
        <path
          d={path(stress, "buyNetWorth")}
          fill="none"
          stroke="var(--accent)"
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="2 3"
        />
      ) : null}
      <text x={pad.l} y={h - 6} className="fill-current text-[10px]" opacity={0.55}>
        {da ? "År" : "Year"} 1 → {base.length}
      </text>
      <text x={w - pad.r} y={14} textAnchor="end" className="fill-current text-[10px]" opacity={0.55}>
        {money(maxY, da ? "da" : "en")}
      </text>
    </svg>
  );
}

function SummaryCard({
  title,
  result,
  locale,
  da,
  rateLabel,
}: {
  title: string;
  result: BoligResult;
  locale: string;
  da: boolean;
  rateLabel: string;
}) {
  return (
    <div className="space-y-2 rounded-[12px] border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">{title}</p>
      <p className="text-xs text-muted">{rateLabel}</p>
      <p className="text-sm">
        {da ? "Månedlig ydelse" : "Monthly loan payment"}:{" "}
        <strong>{money(result.monthlyLoanPayment, locale)}</strong>
      </p>
      <p className="text-sm">
        {da ? "Formue ved køb (slut)" : "Buy net worth (end)"}:{" "}
        <strong>{money(result.finalBuyNetWorth, locale)}</strong>
      </p>
      <p className="text-sm">
        {da ? "Formue ved leje (slut)" : "Rent net worth (end)"}:{" "}
        <strong>{money(result.finalRentNetWorth, locale)}</strong>
      </p>
      <p className="text-sm">
        {da ? "Break-even (køb ≥ leje)" : "Break-even (buy ≥ rent)"}:{" "}
        <strong>
          {result.breakEvenYear == null
            ? da
              ? "Ikke inden for perioden"
              : "Not within the period"
            : da
              ? `År ${result.breakEvenYear}`
              : `Year ${result.breakEvenYear}`}
        </strong>
      </p>
      <p className="pt-1 text-sm font-medium">
        {result.betterAtHorizon === "close"
          ? da
            ? "Cirka lige ved slutningen af perioden."
            : "About even at the end of the period."
          : result.betterAtHorizon === "buy"
            ? da
              ? "Køb ser stærkere ud i denne model."
              : "Buying looks stronger in this model."
            : da
              ? "Leje ser stærkere ud i denne model."
              : "Renting looks stronger in this model."}
      </p>
    </div>
  );
}

export function BoligokonomiTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [homePrice, setHomePrice] = useState("3500000");
  const [downPayment, setDownPayment] = useState("700000");
  const [rate, setRate] = useState("4");
  const [loanYears, setLoanYears] = useState("30");
  const [rent, setRent] = useState("14000");
  const [ownership, setOwnership] = useState("4000");
  const [appreciation, setAppreciation] = useState("2");
  const [investReturn, setInvestReturn] = useState("5");
  const [horizon, setHorizon] = useState<"10" | "20" | "30">("20");
  const [stressExtra, setStressExtra] = useState("2");
  const [view, setView] = useState<"chart" | "table">("chart");

  const input = useMemo(
    () => ({
      homePrice: num(homePrice),
      downPayment: num(downPayment),
      interestRatePct: num(rate),
      loanYears: num(loanYears),
      rentMonthly: num(rent),
      ownershipMonthly: num(ownership),
      appreciationPct: num(appreciation),
      investmentReturnPct: num(investReturn),
      horizonYears: num(horizon),
    }),
    [
      homePrice,
      downPayment,
      rate,
      loanYears,
      rent,
      ownership,
      appreciation,
      investReturn,
      horizon,
    ],
  );

  const base = useMemo(() => simulateBolig(input), [input]);
  const stress = useMemo(() => {
    const extra = num(stressExtra);
    if (!Number.isFinite(extra) || extra < 0) return null;
    return simulateBolig(withHigherRate(input, extra));
  }, [input, stressExtra]);

  return (
    <div className="kit-tool mx-auto max-w-5xl space-y-6">
      <p className="text-sm text-muted">
        {da
          ? "Sammenlign formue ved leje og køb over 10, 20 eller 30 år. Tallene er estimater."
          : "Compare net worth when renting versus buying over 10, 20, or 30 years. Figures are estimates."}
      </p>

      <Segmented
        ariaLabel={da ? "Tidshorisont" : "Horizon"}
        value={horizon}
        onChange={setHorizon}
        options={[
          { id: "10", label: da ? "10 år" : "10 years" },
          { id: "20", label: da ? "20 år" : "20 years" },
          { id: "30", label: da ? "30 år" : "30 years" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label={da ? "Boligpris" : "Home price"}>
            <KitInput value={homePrice} onChange={(e) => setHomePrice(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label={da ? "Udbetaling" : "Down payment"}>
            <KitInput value={downPayment} onChange={(e) => setDownPayment(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label={da ? "Rente % p.a." : "Interest % / year"}>
            <KitInput value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label={da ? "Løbetid (år)" : "Loan term (years)"}>
            <KitInput value={loanYears} onChange={(e) => setLoanYears(e.target.value)} inputMode="numeric" />
          </Field>
          <Field label={da ? "Husleje pr. måned" : "Rent / month"}>
            <KitInput value={rent} onChange={(e) => setRent(e.target.value)} inputMode="decimal" />
          </Field>
          <Field
            label={da ? "Ejerudgift pr. måned" : "Ownership cost / month"}
            hint={da ? "Skat, fællesudgifter, vedligehold m.m." : "Tax, fees, maintenance, and similar."}
          >
            <KitInput value={ownership} onChange={(e) => setOwnership(e.target.value)} inputMode="decimal" />
          </Field>
          <Field label={da ? "Værdistigning % p.a." : "Appreciation % / year"}>
            <KitInput value={appreciation} onChange={(e) => setAppreciation(e.target.value)} inputMode="decimal" />
          </Field>
          <Field
            label={da ? "Investeringsafkast % p.a. (ved leje)" : "Investment return % / year (if renting)"}
            hint={
              da
                ? "Udbetaling og månedlig forskel vs. køb forrentes her."
                : "Down payment and monthly cash difference versus buying grow at this rate."
            }
          >
            <KitInput value={investReturn} onChange={(e) => setInvestReturn(e.target.value)} inputMode="decimal" />
          </Field>
          <Field
            label={da ? "Stresstest: +rente (procentpoint)" : "Stress test: +rate (percentage points)"}
            hint={da ? "Sammenlign basisscenarie med højere rente." : "Compare the base case with a higher interest rate."}
          >
            <KitInput value={stressExtra} onChange={(e) => setStressExtra(e.target.value)} inputMode="decimal" />
          </Field>
        </div>

        <div className="space-y-4">
          {!base ? (
            <p className="text-sm text-muted">{da ? "Udfyld gyldige tal." : "Enter valid numbers."}</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryCard
                  title={da ? "Basisscenarie" : "Base case"}
                  result={base}
                  locale={locale}
                  da={da}
                  rateLabel={`${da ? "Rente" : "Rate"} ${input.interestRatePct}%`}
                />
                {stress ? (
                  <SummaryCard
                    title={da ? "Højere rente" : "Higher rate"}
                    result={stress}
                    locale={locale}
                    da={da}
                    rateLabel={`${da ? "Rente" : "Rate"} ${(input.interestRatePct + num(stressExtra)).toFixed(2)}%`}
                  />
                ) : null}
              </div>

              <div className="rounded-[12px] border border-border bg-surface p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                    {da ? "Formuestier" : "Net worth paths"}
                  </p>
                  <Segmented
                    ariaLabel={da ? "Visning" : "View"}
                    value={view}
                    onChange={setView}
                    options={[
                      { id: "chart", label: da ? "Graf" : "Chart" },
                      { id: "table", label: da ? "Tabel" : "Table" },
                    ]}
                  />
                </div>
                <div className="mb-2 flex flex-wrap gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 bg-accent" />
                    {da ? "Køb" : "Buy"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-current opacity-60" />
                    {da ? "Leje (investeret)" : "Rent (invested)"}
                  </span>
                  {stress ? (
                    <span className="inline-flex items-center gap-1.5 opacity-70">
                      <span className="inline-block h-0.5 w-4 bg-accent opacity-40" />
                      {da ? "Køb (højere rente)" : "Buy (higher rate)"}
                    </span>
                  ) : null}
                </div>
                {view === "chart" ? (
                  <NetWorthChart base={base.rows} stress={stress?.rows ?? null} da={da} />
                ) : (
                  <div className="kit-scrollbar max-h-[min(18rem,50dvh)] overflow-auto overscroll-contain touch-pan-y">
                    <table className="w-full min-w-[480px] border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted">
                          <th className="py-1.5 pr-2 font-medium">{da ? "År" : "Year"}</th>
                          <th className="py-1.5 pr-2 font-medium">{da ? "Køb formue" : "Buy NW"}</th>
                          <th className="py-1.5 pr-2 font-medium">{da ? "Leje formue" : "Rent NW"}</th>
                          <th className="py-1.5 font-medium">{da ? "Forskel" : "Diff"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {base.rows.map((r) => (
                          <tr key={r.year} className="border-b border-border/60">
                            <td className="py-1.5 pr-2">{r.year}</td>
                            <td className="py-1.5 pr-2">{money(r.buyNetWorth, locale)}</td>
                            <td className="py-1.5 pr-2">{money(r.rentNetWorth, locale)}</td>
                            <td className="py-1.5">{money(r.buyAdvantage, locale)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        {da
          ? "Kun et illustrativt estimat. Ikke økonomisk rådgivning. Skat, gebyrer, afdragsfrihed, inflation og markedssvingninger er forenklet eller udeladt."
          : "Illustrative estimate only. Not financial advice. Tax, fees, interest-only periods, inflation, and market swings are simplified or omitted."}
      </p>
    </div>
  );
}
