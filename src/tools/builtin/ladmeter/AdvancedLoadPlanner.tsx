"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/lib/format";
import {
  layoutLoad,
  placedCountByLine,
  type LoadLine,
} from "./layout";
import {
  PALLET_PRESETS,
  TRAILER_PRESETS,
  type PalletPresetId,
  type TrailerPresetId,
} from "./presets";

type DraftLine = {
  id: string;
  label: string;
  preset: PalletPresetId;
  lengthM: string;
  widthM: string;
  heightM: string;
  quantity: string;
  autoRotate: boolean;
};

function newId() {
  return `line-${Math.random().toString(36).slice(2, 10)}`;
}

function defaultEurLine(): DraftLine {
  const preset = PALLET_PRESETS.eur;
  return {
    id: newId(),
    label: "EUR",
    preset: "eur",
    lengthM: String(preset.lengthM),
    widthM: String(preset.widthM),
    heightM: String(preset.heightM),
    quantity: "1",
    autoRotate: true,
  };
}

function parsePositive(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const LINE_FILL = [
  "var(--accent-soft)",
  "color-mix(in oklab, var(--accent) 16%, var(--surface))",
  "color-mix(in oklab, var(--foreground) 6%, var(--surface))",
];

const fieldClass =
  "kit-field w-full rounded-[8px] border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-accent";

export function AdvancedLoadPlanner() {
  const { locale, dictionary } = useLanguage();
  const t = dictionary.loadingMeter;

  const [presetId, setPresetId] = useState<TrailerPresetId>("trailer136");
  const [lengthM, setLengthM] = useState(String(TRAILER_PRESETS.trailer136.lengthM));
  const [widthM, setWidthM] = useState(String(TRAILER_PRESETS.trailer136.widthM));
  const [heightM, setHeightM] = useState(String(TRAILER_PRESETS.trailer136.heightM));
  const [lines, setLines] = useState<DraftLine[]>(() => [
    {
      id: newId(),
      label: "2×2",
      preset: "custom",
      lengthM: "2",
      widthM: "2",
      heightM: "2",
      quantity: "1",
      autoRotate: true,
    },
    {
      ...defaultEurLine(),
      quantity: "20",
    },
  ]);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  const applyTrailerPreset = (id: TrailerPresetId) => {
    setPresetId(id);
    if (id === "custom") return;
    const preset = TRAILER_PRESETS[id];
    setLengthM(String(preset.lengthM));
    setWidthM(String(preset.widthM));
    setHeightM(String(preset.heightM));
  };

  const trailer = useMemo(
    () => ({
      lengthM: parsePositive(lengthM) || TRAILER_PRESETS.trailer136.lengthM,
      widthM: parsePositive(widthM) || TRAILER_PRESETS.trailer136.widthM,
      heightM: parsePositive(heightM) || TRAILER_PRESETS.trailer136.heightM,
    }),
    [heightM, lengthM, widthM],
  );

  const loadLines: LoadLine[] = useMemo(
    () =>
      lines.map((line) => ({
        id: line.id,
        label: line.label.trim() || t.itemFallback,
        lengthM: parsePositive(line.lengthM),
        widthM: parsePositive(line.widthM),
        heightM: parsePositive(line.heightM),
        quantity: Math.max(0, Math.floor(parsePositive(line.quantity) || 0)),
        autoRotate: line.autoRotate,
      })),
    [lines, t.itemFallback],
  );

  const result = useMemo(
    () => layoutLoad(trailer, loadLines),
    [loadLines, trailer],
  );

  const overflowByLine = useMemo(() => {
    const map = new Map<
      string,
      { count: number; reason: "no_floor_space" | "too_wide" }
    >();
    for (const item of result.overflowSummary) {
      const existing = map.get(item.lineId);
      if (existing) {
        existing.count += item.count;
        if (item.reason === "too_wide") existing.reason = "too_wide";
      } else {
        map.set(item.lineId, { count: item.count, reason: item.reason });
      }
    }
    return map;
  }, [result.overflowSummary]);

  const updateLine = (id: string, patch: Partial<DraftLine>) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  };

  const applyPalletPreset = (id: string, preset: PalletPresetId) => {
    if (preset === "custom") {
      updateLine(id, { preset });
      return;
    }
    const values = PALLET_PRESETS[preset];
    updateLine(id, {
      preset,
      label: preset === "eur" ? "EUR" : t.industrialShort,
      lengthM: String(values.lengthM),
      widthM: String(values.widthM),
      heightM: String(values.heightM),
    });
  };

  const moveLine = (id: string, direction: -1 | 1) => {
    setLines((prev) => {
      const index = prev.findIndex((line) => line.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  };

  const duplicateLine = (id: string) => {
    setLines((prev) => {
      const index = prev.findIndex((line) => line.id === id);
      if (index < 0) return prev;
      const copy = [...prev];
      copy.splice(index + 1, 0, { ...prev[index], id: newId() });
      return copy;
    });
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const fixOverflow = () => {
    const placed = placedCountByLine(result);
    setLines((prev) =>
      prev
        .map((line) => {
          const kept = placed.get(line.id) ?? 0;
          return { ...line, quantity: String(kept) };
        })
        .filter((line) => Number(line.quantity) > 0),
    );
  };

  // Horizontal floor: length along X, width along Y.
  const padX = 1.15;
  const padY = 0.35;
  const svgW = trailer.lengthM + padX * 2;
  const svgH = trailer.widthM + padY * 2;
  const ox = padX;
  const oy = padY;

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={presetId}
            aria-label={t.vehicle}
            onChange={(event) =>
              applyTrailerPreset(event.target.value as TrailerPresetId)
            }
            className="kit-touch-target rounded-[8px] border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent sm:min-h-0 sm:py-1.5"
          >
            <option value="trailer136">{t.vehicleTrailer136}</option>
            <option value="link">{t.vehicleLink}</option>
            <option value="tractor">{t.vehicleTractor}</option>
            <option value="custom">{t.vehicleCustom}</option>
          </select>
          {(
            [
              [lengthM, setLengthM, t.length],
              [widthM, setWidthM, t.width],
              [heightM, setHeightM, t.height],
            ] as const
          ).map(([value, setter, label]) => (
            <label
              key={label}
              className="flex items-center gap-1.5 text-sm text-muted"
            >
              <span className="text-xs font-medium text-muted">{label}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={value}
                aria-label={label}
                onChange={(event) => {
                  setPresetId("custom");
                  setter(event.target.value);
                }}
                className="kit-field w-[5.25rem] rounded-[8px] border border-border bg-surface px-2 py-2 text-sm tabular-nums outline-none focus:border-accent sm:w-[4.5rem] sm:py-1.5"
              />
            </label>
          ))}
        </div>
        <p className="max-w-3xl text-xs leading-relaxed text-muted">
          {presetId === "trailer136"
            ? t.vehicleNoteTrailer136
            : presetId === "link"
              ? t.vehicleNoteLink
              : presetId === "tractor"
                ? t.vehicleNoteTractor
                : t.vehicleLegalNote}
        </p>
      </div>

      <div className="rounded-[12px] border border-border bg-surface p-3 sm:p-4">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs text-muted">{t.topViewHint}</p>
          <p className="text-xs tabular-nums text-muted">
            {formatNumber(trailer.lengthM, locale, 1)} ×{" "}
            {formatNumber(trailer.widthM, locale, 1)} m
          </p>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="mx-auto block h-44 w-full max-w-3xl touch-manipulation sm:h-52"
            role="img"
            aria-label={t.topViewLabel}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern
                id="ladmeter-waste"
                width="0.18"
                height="0.18"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(35)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="0.18"
                  stroke="var(--muted)"
                  strokeOpacity="0.28"
                  strokeWidth="0.035"
                />
              </pattern>
            </defs>

            {/* Full trailer floor so empty length still reads as the vehicle. */}
            <rect
              x={ox}
              y={oy}
              width={trailer.lengthM}
              height={trailer.widthM}
              fill="color-mix(in oklab, var(--border) 55%, var(--surface))"
              stroke="var(--border)"
              strokeWidth={0.05}
              rx={0.06}
            />

            {/* Front on the left (first loaded), door on the right (rear). */}
            <line
              x1={ox}
              y1={oy + 0.08}
              x2={ox}
              y2={oy + trailer.widthM - 0.08}
              stroke="var(--border)"
              strokeWidth={0.06}
              strokeLinecap="round"
            />
            <text
              x={ox - 0.08}
              y={oy + trailer.widthM / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fill="var(--muted)"
              style={{ fontSize: 0.26, fontWeight: 500 }}
            >
              {t.frontEnd}
            </text>
            <line
              x1={ox + trailer.lengthM}
              y1={oy + 0.08}
              x2={ox + trailer.lengthM}
              y2={oy + trailer.widthM - 0.08}
              stroke="var(--accent)"
              strokeWidth={0.08}
              strokeLinecap="round"
            />
            <text
              x={ox + trailer.lengthM + 0.08}
              y={oy + trailer.widthM / 2}
              textAnchor="start"
              dominantBaseline="middle"
              fill="var(--muted)"
              style={{ fontSize: 0.26, fontWeight: 500 }}
            >
              {t.doorEnd}
            </text>

            {/* Meaningful wasted width only (tiny gaps stay in the totals). */}
            {result.waste
              .filter((rect) => rect.widthM >= 0.15)
              .map((rect, index) => (
                <rect
                  key={`waste-${index}`}
                  x={ox + rect.y}
                  y={oy + rect.x}
                  width={rect.lengthM}
                  height={rect.widthM}
                  fill="url(#ladmeter-waste)"
                  stroke="color-mix(in oklab, var(--muted) 25%, transparent)"
                  strokeWidth={0.02}
                />
              ))}

            {result.placements.map((placement) => {
              const active = placement.lineId === activeLineId;
              const colorIndex =
                Math.max(
                  0,
                  lines.findIndex((line) => line.id === placement.lineId),
                ) % LINE_FILL.length;
              const cx = ox + placement.y + placement.lengthM / 2;
              const cy = oy + placement.x + placement.widthM / 2;
              const fontSize = Math.min(
                0.34,
                Math.max(
                  0.18,
                  Math.min(placement.lengthM, placement.widthM) * 0.42,
                ),
              );
              return (
                <g
                  key={`${placement.lineId}-${placement.sequence}`}
                  onMouseEnter={() => setActiveLineId(placement.lineId)}
                  onMouseLeave={() => setActiveLineId(null)}
                  onClick={() => setActiveLineId(placement.lineId)}
                  className="cursor-pointer"
                >
                  <rect
                    x={ox + placement.y}
                    y={oy + placement.x}
                    width={placement.lengthM}
                    height={placement.widthM}
                    fill={LINE_FILL[colorIndex]}
                    stroke={active ? "var(--accent)" : "var(--border)"}
                    strokeWidth={active ? 0.06 : 0.03}
                    rx={0.04}
                  />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--foreground)"
                    fillOpacity={0.7}
                    style={{ fontSize, fontWeight: 600 }}
                  >
                    {placement.sequence}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border/80 pt-3 text-sm">
          <p>
            <span className="text-muted">{t.usedLdm}</span>{" "}
            <span className="font-medium tabular-nums">
              {formatNumber(result.usedLdm, locale, 2)} ldm
            </span>
          </p>
          <p>
            <span className="text-muted">{t.usedArea}</span>{" "}
            <span className="font-medium tabular-nums">
              {formatNumber(result.usedAreaM2, locale, 2)} m²
            </span>
          </p>
          <p>
            <span className="text-muted">{t.wasteArea}</span>{" "}
            <span className="font-medium tabular-nums">
              {formatNumber(result.wasteAreaM2, locale, 2)} m²
            </span>
          </p>
          <p>
            <span className="text-muted">{t.remainingLength}</span>{" "}
            <span className="font-medium tabular-nums">
              {formatNumber(result.remainingLengthM, locale, 2)} m
            </span>
          </p>
        </div>

        {result.overflowCount > 0 ? (
          <div
            role="alert"
            className="mt-3 flex items-center gap-3 rounded-[10px] border-2 px-3 py-2.5"
            style={{
              background: "#ffe9a3",
              borderColor: "#f0c000",
              color: "#5c4200",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={22}
              height={22}
              className="shrink-0"
              aria-hidden="true"
            >
              <path fill="#f0c000" stroke="#c48a00" strokeWidth="1.2" d="M12 3.4 21.5 20.5h-19L12 3.4Z" />
              <rect x="11" y="9" width="2" height="5.5" rx="0.4" fill="#5c4200" />
              <rect x="11" y="16" width="2" height="2" rx="0.4" fill="#5c4200" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug" style={{ color: "#5c4200" }}>
                {t.overflowTitle}
                <span className="font-normal opacity-80">
                  {" "}
                  · {result.overflowCount}
                </span>
              </p>
              <p className="mt-0.5 text-sm leading-snug opacity-90" style={{ color: "#5c4200" }}>
                {result.overflowSummary
                  .map((item) => {
                    const template =
                      item.reason === "too_wide"
                        ? t.overflowTooWide
                        : t.overflowNoSpace;
                    return template
                      .replace("{label}", item.label)
                      .replace("{count}", String(item.count));
                  })
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={fixOverflow}
              className="kit-touch-target shrink-0 rounded-[8px] px-3 py-1.5 text-sm font-medium sm:min-h-0"
              style={{
                background: "#fff8e0",
                border: "1px solid #e0b000",
                color: "#5c4200",
              }}
            >
              {t.fixOverflow}
            </button>
          </div>
        ) : null}
        {result.placements.some((p) => p.tooTall) ? (
          <p className="mt-2 text-sm text-muted">{t.heightOverflow}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium">{t.loadList}</h3>
          <button
            type="button"
            onClick={() => setLines((prev) => [...prev, defaultEurLine()])}
            className="kit-touch-target inline-flex items-center rounded-[8px] border border-border px-2.5 py-1.5 text-sm font-medium hover:bg-surface sm:min-h-0"
          >
            {t.addItem}
          </button>
        </div>

        <ul className="divide-y divide-border overflow-hidden rounded-[12px] border border-border bg-surface">
          {lines.map((line, index) => {
            const active = line.id === activeLineId;
            const overflow = overflowByLine.get(line.id);
            return (
              <li
                key={line.id}
                className={`px-3 py-3 transition-colors ${
                  overflow
                    ? ""
                    : active
                      ? "bg-accent-soft/50"
                      : ""
                }`}
                style={
                  overflow
                    ? {
                        background: active ? "#ffe08a" : "#fff4cc",
                        boxShadow: "inset 3px 0 0 #f0c000",
                      }
                    : undefined
                }
                onMouseEnter={() => setActiveLineId(line.id)}
                onMouseLeave={() => setActiveLineId(null)}
                onClick={() => setActiveLineId(line.id)}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-xs font-medium tabular-nums text-muted">
                      #{index + 1}
                    </span>
                    {overflow ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          background: "#ffe9a3",
                          color: "#5c4200",
                          border: "1px solid #f0c000",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width={12}
                          height={12}
                          aria-hidden="true"
                        >
                          <path
                            fill="#f0c000"
                            stroke="#c48a00"
                            strokeWidth="1.2"
                            d="M12 3.4 21.5 20.5h-19L12 3.4Z"
                          />
                          <rect
                            x="11"
                            y="9"
                            width="2"
                            height="5.5"
                            rx="0.4"
                            fill="#5c4200"
                          />
                          <rect
                            x="11"
                            y="16"
                            width="2"
                            height="2"
                            rx="0.4"
                            fill="#5c4200"
                          />
                        </svg>
                        {(overflow.reason === "too_wide"
                          ? t.overflowBadgeWide
                          : t.overflowBadgeMissing
                        ).replace("{count}", String(overflow.count))}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      aria-label={t.moveUp}
                      onClick={(event) => {
                        event.stopPropagation();
                        moveLine(line.id, -1);
                      }}
                      className="kit-touch-target inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs text-muted hover:bg-background hover:text-foreground sm:min-h-0 sm:min-w-0"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={t.moveDown}
                      onClick={(event) => {
                        event.stopPropagation();
                        moveLine(line.id, 1);
                      }}
                      className="kit-touch-target inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs text-muted hover:bg-background hover:text-foreground sm:min-h-0 sm:min-w-0"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        duplicateLine(line.id);
                      }}
                      className="kit-touch-target inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs text-muted hover:bg-background hover:text-foreground sm:min-h-0 sm:min-w-0"
                    >
                      {t.duplicate}
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeLine(line.id);
                      }}
                      className="kit-touch-target inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs text-muted hover:bg-background hover:text-foreground sm:min-h-0 sm:min-w-0"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                  <label className="col-span-2 block sm:col-span-2 lg:col-span-2">
                    <span className="mb-1 block text-xs text-muted">
                      {t.itemLabel}
                    </span>
                    <input
                      value={line.label}
                      onChange={(event) =>
                        updateLine(line.id, { label: event.target.value })
                      }
                      className={fieldClass}
                    />
                  </label>
                  <label className="col-span-2 block sm:col-span-2 lg:col-span-2">
                    <span className="mb-1 block text-xs text-muted">
                      {t.palletType}
                    </span>
                    <select
                      value={line.preset}
                      onChange={(event) =>
                        applyPalletPreset(
                          line.id,
                          event.target.value as PalletPresetId,
                        )
                      }
                      className={fieldClass}
                    >
                      <option value="eur">{t.eurShort}</option>
                      <option value="industri">{t.industrialShort}</option>
                      <option value="custom">{t.customSize}</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted">
                      {t.length}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={line.lengthM}
                      onChange={(event) =>
                        updateLine(line.id, {
                          lengthM: event.target.value,
                          preset: "custom",
                        })
                      }
                      className={`${fieldClass} tabular-nums`}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted">
                      {t.width}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={line.widthM}
                      onChange={(event) =>
                        updateLine(line.id, {
                          widthM: event.target.value,
                          preset: "custom",
                        })
                      }
                      className={`${fieldClass} tabular-nums`}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted">
                      {t.height}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={line.heightM}
                      onChange={(event) =>
                        updateLine(line.id, {
                          heightM: event.target.value,
                          preset: "custom",
                        })
                      }
                      className={`${fieldClass} tabular-nums`}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted">
                      {t.quantity}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(line.id, { quantity: event.target.value })
                      }
                      className={`${fieldClass} tabular-nums`}
                    />
                  </label>
                </div>

                <label className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={line.autoRotate}
                    onChange={(event) =>
                      updateLine(line.id, {
                        autoRotate: event.target.checked,
                      })
                    }
                    className="size-3.5 rounded border-border"
                  />
                  <span>{t.autoRotate}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="text-xs leading-relaxed text-muted">
          {t.advancedDisclaimer}
        </p>
      </div>
    </div>
  );
}
