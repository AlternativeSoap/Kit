"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitInput,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { CurrencyCombobox } from "./CurrencyCombobox";

function parseAmount(raw: string) {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function CurrencyApproxTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const dictionary = useDictionary();
  const da = locale === "da";

  const [amount, setAmount] = useState(
    prefillNumber(prefill, "amount") ?? prefill?.value ?? "100",
  );
  const [rate, setRate] = useState(prefillNumber(prefill, "rate") ?? "7.45");
  const [from, setFrom] = useState(
    (prefill?.from ?? "EUR").trim().toUpperCase() || "EUR",
  );
  const [to, setTo] = useState(
    (prefill?.to ?? "DKK").trim().toUpperCase() || "DKK",
  );

  const result = useMemo(() => {
    const amountN = parseAmount(amount);
    const rateN = parseAmount(rate);
    if (amountN === null || rateN === null || rateN <= 0) return null;
    const converted = amountN * rateN;
    return {
      converted,
      rate: rateN,
      back: converted / rateN,
      from: from || "FROM",
      to: to || "TO",
    };
  }, [amount, rate, from, to]);

  function swap() {
    setFrom(to);
    setTo(from);
    const rateN = parseAmount(rate);
    if (rateN && rateN > 0) {
      setRate(String(Number((1 / rateN).toPrecision(6))));
    }
  }

  function reset() {
    setAmount("100");
    setRate("7.45");
    setFrom("EUR");
    setTo("DKK");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Field label={da ? "Beløb" : "Amount"}>
        <KitInput
          value={amount}
          inputMode="decimal"
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>

      <Field
        label={da ? "Kurs (1 fra = ? til)" : "Rate (1 from = ? to)"}
        hint={
          da
            ? "Eksempel: 1 EUR = 7,45 DKK. Du angiver selv kursen."
            : "Example: 1 EUR = 7.45 DKK. You provide the rate."
        }
      >
        <KitInput
          value={rate}
          inputMode="decimal"
          onChange={(e) => setRate(e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <Field label={da ? "Fra valuta" : "From currency"}>
          <CurrencyCombobox
            value={from}
            onChange={setFrom}
            da={da}
            label={da ? "Fra valuta" : "From currency"}
          />
        </Field>
        <button
          type="button"
          className={`${secondaryBtnClass} sm:mb-0.5`}
          onClick={swap}
          aria-label={da ? "Byt valutaer" : "Swap currencies"}
        >
          ⇄
        </button>
        <Field label={da ? "Til valuta" : "To currency"}>
          <CurrencyCombobox
            value={to}
            onChange={setTo}
            da={da}
            label={da ? "Til valuta" : "To currency"}
          />
        </Field>
      </div>

      {result ? (
        <div className="space-y-3 rounded-[12px] border border-border bg-surface px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted">
                {da ? `Beløb i ${result.to}` : `Amount in ${result.to}`}
              </p>
              <p className="mt-1 text-2xl font-medium tabular-nums text-accent">
                {formatNumber(result.converted, locale, 2)} {result.to}
              </p>
            </div>
            <CopyButton
              value={formatNumber(result.converted, locale, 2)}
              label={dictionary.contrast.copy}
              copiedLabel={dictionary.contrast.copied}
            />
          </div>
          <p className="text-sm text-muted">
            {da ? "Pr." : "Per"} 1 {result.from} ={" "}
            <span className="tabular-nums text-foreground">
              {formatNumber(result.rate, locale, 4)} {result.to}
            </span>
          </p>
          <p className="text-sm text-muted">
            {da ? "Tilbage til" : "Back to"} {result.from}:{" "}
            <span className="tabular-nums text-foreground">
              {formatNumber(result.back, locale, 2)} {result.from}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">
          {da
            ? "Angiv et beløb og en positiv kurs."
            : "Enter an amount and a positive rate."}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={secondaryBtnClass} onClick={reset}>
          {da ? "Nulstil" : "Reset"}
        </button>
        <a
          href="https://www.nationalbanken.dk/da/statistik/valutakurser"
          target="_blank"
          rel="noreferrer"
          className={`${primaryBtnClass} no-underline`}
        >
          {da ? "Officielle kurser" : "Official rates"}
        </a>
      </div>

      <p className="text-xs text-muted">
        {da
          ? "Hurtigt overslag med din egen kurs. Kit henter ikke live kurser her."
          : "A quick estimate with your own rate. Kit does not fetch live rates here."}
      </p>
    </div>
  );
}
