"use client";

import { useMemo, useState } from "react";
import { Field, KitInput } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { compareRentBuy } from "./calc";

function money(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-US", {
    maximumFractionDigits: 0,
  }).format(n);
}

export function LejevsobTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [rentMonthly, setRentMonthly] = useState("12000");
  const [buyPrice, setBuyPrice] = useState("3000000");
  const [downPayment, setDownPayment] = useState("600000");
  const [rate, setRate] = useState("4");
  const [years, setYears] = useState("20");
  const [ownership, setOwnership] = useState("3500");
  const [appreciation, setAppreciation] = useState("2");

  const result = useMemo(() => {
    const num = (s: string) => Number(s.replace(",", "."));
    return compareRentBuy({
      rentMonthly: num(rentMonthly),
      buyPrice: num(buyPrice),
      downPayment: num(downPayment),
      interestRatePct: num(rate),
      years: num(years),
      ownershipMonthly: num(ownership),
      appreciationPct: num(appreciation),
    });
  }, [
    rentMonthly,
    buyPrice,
    downPayment,
    rate,
    years,
    ownership,
    appreciation,
  ]);

  return (
    <div className="mx-auto grid max-w-3xl gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label={da ? "Månedlig husleje" : "Monthly rent"}>
          <KitInput value={rentMonthly} onChange={(e) => setRentMonthly(e.target.value)} />
        </Field>
        <Field label={da ? "Købspris" : "Purchase price"}>
          <KitInput value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
        </Field>
        <Field label={da ? "Udbetaling" : "Down payment"}>
          <KitInput value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
        </Field>
        <Field label={da ? "Rente % p.a." : "Interest % / year"}>
          <KitInput value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label={da ? "År" : "Years"}>
          <KitInput value={years} onChange={(e) => setYears(e.target.value)} />
        </Field>
        <Field
          label={da ? "Ejerudgift pr. måned" : "Ownership cost / month"}
          hint={da ? "Skat, fællesudgifter, vedligehold m.m." : "Tax, fees, maintenance, etc."}
        >
          <KitInput value={ownership} onChange={(e) => setOwnership(e.target.value)} />
        </Field>
        <Field label={da ? "Værdistigning % p.a." : "Appreciation % / year"}>
          <KitInput
            value={appreciation}
            onChange={(e) => setAppreciation(e.target.value)}
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-[12px] border border-border bg-surface p-4">
        {!result ? (
          <p className="text-sm text-muted">
            {da ? "Udfyld gyldige tal." : "Enter valid numbers."}
          </p>
        ) : (
          <>
            <p className="text-sm">
              {da ? "Månedlig ydelse (lån)" : "Monthly loan payment"}:{" "}
              <strong>{money(result.monthlyLoanPayment, locale)}</strong>
            </p>
            <p className="text-sm">
              {da ? "Samlet husleje betalt" : "Total rent paid"}:{" "}
              <strong>{money(result.totalRentPaid, locale)}</strong>
            </p>
            <p className="text-sm">
              {da ? "Samlet kontant ud ved køb" : "Total cash out if buying"}:{" "}
              <strong>{money(result.totalBuyCashOut, locale)}</strong>
            </p>
            <p className="text-sm">
              {da ? "Estimeret friværdi" : "Estimated equity"}:{" "}
              <strong>{money(result.homeEquity, locale)}</strong>
            </p>
            <p className="text-sm">
              {da ? "Nettoudgift leje" : "Net cost of renting"}:{" "}
              <strong>{money(result.rentNetCost, locale)}</strong>
            </p>
            <p className="text-sm">
              {da ? "Nettoudgift køb" : "Net cost of buying"}:{" "}
              <strong>{money(result.buyNetCost, locale)}</strong>
            </p>
            <p className="pt-2 text-sm font-medium">
              {result.better === "close"
                ? da
                  ? "Cirka lige over perioden."
                  : "About even over the period."
                : result.better === "buy"
                  ? da
                    ? "Køb ser billigere ud i denne model."
                    : "Buying looks cheaper in this model."
                  : da
                    ? "Leje ser billigere ud i denne model."
                    : "Renting looks cheaper in this model."}
            </p>
          </>
        )}
        <p className="text-xs text-muted">
          {da
            ? "Illustrativt estimat. Ikke rådgivning. Skat, gebyrer og vilkår varierer."
            : "Illustrative estimate. Not advice. Tax, fees, and terms vary."}
        </p>
      </div>
    </div>
  );
}
