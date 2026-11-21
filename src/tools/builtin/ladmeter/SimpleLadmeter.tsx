"use client";

import { useMemo, useState } from "react";
import { fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import { prefillNumber, type ToolPrefill } from "@/tools/prefill";
import { calculateLadmeter, type PalletType } from "./calc";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  step = "0.01",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  step?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      min="0"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClass}
    />
  );
}

export function SimpleLadmeter({ prefill }: { prefill?: ToolPrefill }) {
  const { locale, dictionary } = useLanguage();
  const t = dictionary.loadingMeter;

  const [lengthM, setLengthM] = useState(
    () => prefillNumber(prefill, "length", { min: 0 }) ?? "2.4",
  );
  const [widthM, setWidthM] = useState(
    () => prefillNumber(prefill, "width", { min: 0 }) ?? "1.2",
  );
  const [heightM, setHeightM] = useState(
    () => prefillNumber(prefill, "height", { min: 0 }) ?? "",
  );
  const [palletCount, setPalletCount] = useState(
    () => prefillNumber(prefill, "pallets", { min: 0 }) ?? "4",
  );
  const [palletType, setPalletType] = useState<PalletType>("eur");
  const [customPalletLm, setCustomPalletLm] = useState("0.4");

  const result = useMemo(() => {
    const parse = (value: string) => {
      if (!value.trim()) return undefined;
      const n = Number(value.replace(",", "."));
      return Number.isFinite(n) ? n : undefined;
    };

    return calculateLadmeter({
      lengthM: parse(lengthM),
      widthM: parse(widthM),
      heightM: parse(heightM),
      palletCount: parse(palletCount),
      palletType,
      customPalletLm: parse(customPalletLm),
    });
  }, [lengthM, widthM, heightM, palletCount, palletType, customPalletLm]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t.length}>
            <NumberInput value={lengthM} onChange={setLengthM} placeholder="2.4" />
          </Field>
          <Field label={t.width}>
            <NumberInput value={widthM} onChange={setWidthM} placeholder="1.2" />
          </Field>
          <Field label={t.height} hint={t.heightHint}>
            <NumberInput value={heightM} onChange={setHeightM} placeholder="1.8" />
          </Field>
        </div>

        <Field label={t.palletCount}>
          <NumberInput
            value={palletCount}
            onChange={setPalletCount}
            placeholder="4"
            step="1"
          />
        </Field>

        <Field label={t.palletType}>
          <select
            value={palletType}
            onChange={(event) => setPalletType(event.target.value as PalletType)}
            className={fieldClass}
          >
            <option value="eur">{t.eur}</option>
            <option value="industri">{t.industrial}</option>
            <option value="custom">{t.custom}</option>
          </select>
        </Field>

        {palletType === "custom" ? (
          <Field label={t.customLm}>
            <NumberInput
              value={customPalletLm}
              onChange={setCustomPalletLm}
              placeholder="0.4"
            />
          </Field>
        ) : null}
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-5 py-4">
        <p className="text-xs text-muted">{t.recommended}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">
          {result.recommended !== null
            ? `${formatNumber(result.recommended, locale, 2)} ldm`
            : "—"}
        </p>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <dt className="text-muted">{t.fromDimensions}</dt>
            <dd className="font-medium">
              {result.fromDimensions !== null
                ? `${formatNumber(result.fromDimensions, locale, 2)} ldm`
                : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <dt className="text-muted">{t.fromPallets}</dt>
            <dd className="font-medium">
              {result.fromPallets !== null
                ? `${formatNumber(result.fromPallets, locale, 2)} ldm`
                : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">{t.volume}</dt>
            <dd className="font-medium">
              {result.volumeM3 !== null
                ? `${formatNumber(result.volumeM3, locale, 2)} m³`
                : "—"}
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-muted">{t.disclaimer}</p>
      </div>
    </div>
  );
}
