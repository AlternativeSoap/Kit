"use client";

import { useMemo, useState } from "react";
import { Segmented, secondaryBtnClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  type GateKind,
  type PresetId,
  bit,
  runPreset,
  truthTable,
} from "./calc";

const GATES: GateKind[] = ["AND", "OR", "NOT", "XOR", "NAND"];

function SignalDot({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          on ? "bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" : "bg-border"
        }`}
        aria-hidden
      />
      <span className={on ? "font-medium text-foreground" : "text-muted"}>
        {label}={bit(on)}
      </span>
    </span>
  );
}

function ToggleBit({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`kit-touch-target flex min-w-[4.5rem] flex-col items-center gap-1 rounded-[12px] border px-3 py-3 transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] sm:min-h-0 ${
        value
          ? "border-accent bg-accent text-on-accent"
          : "border-border bg-surface text-muted hover:text-foreground"
      }`}
      aria-pressed={value}
    >
      <span className="text-xs font-medium opacity-80">{label}</span>
      <span className="font-mono text-2xl font-semibold tabular-nums">{bit(value)}</span>
    </button>
  );
}

function GateGlyph({ kind, active }: { kind: GateKind; active: boolean }) {
  const stroke = active ? "var(--accent)" : "var(--foreground)";
  const fill = active
    ? "color-mix(in srgb, var(--accent) 18%, transparent)"
    : "var(--surface)";
  return (
    <svg viewBox="0 0 88 56" className="h-14 w-[5.5rem]" aria-hidden>
      {kind === "AND" || kind === "NAND" ? (
        <>
          <path
            d="M12 8 H40 C58 8 72 18 72 28 C72 38 58 48 40 48 H12 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
          />
          {kind === "NAND" ? (
            <circle cx={78} cy={28} r={5} fill={fill} stroke={stroke} strokeWidth={2} />
          ) : null}
        </>
      ) : null}
      {kind === "OR" ? (
        <path
          d="M10 8 C28 8 40 16 48 28 C40 40 28 48 10 48 C22 36 22 20 10 8 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
      ) : null}
      {kind === "XOR" ? (
        <>
          <path
            d="M6 10 C16 20 16 36 6 46"
            fill="none"
            stroke={stroke}
            strokeWidth={2}
          />
          <path
            d="M14 8 C32 8 44 16 52 28 C44 40 32 48 14 48 C26 36 26 20 14 8 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={2}
          />
        </>
      ) : null}
      {kind === "NOT" ? (
        <>
          <path d="M14 8 L62 28 L14 48 Z" fill={fill} stroke={stroke} strokeWidth={2} />
          <circle cx={70} cy={28} r={5} fill={fill} stroke={stroke} strokeWidth={2} />
        </>
      ) : null}
      <text
        x={kind === "NOT" ? 32 : kind === "XOR" ? 30 : 36}
        y={32}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        fill={stroke}
      >
        {kind}
      </text>
    </svg>
  );
}

function CircuitCanvas({
  preset,
  gate,
  a,
  b,
  result,
  da,
}: {
  preset: PresetId;
  gate: GateKind;
  a: boolean;
  b: boolean;
  result: ReturnType<typeof runPreset>;
  da: boolean;
}) {
  const wire = (on: boolean) => (on ? "var(--accent)" : "var(--border)");
  const wireW = (on: boolean) => (on ? 3 : 2);

  return (
    <div className="overflow-x-auto rounded-[12px] border border-border bg-overlay/40 p-3">
      <svg
        viewBox="0 0 360 160"
        className="mx-auto h-auto w-full min-w-[280px] max-w-[420px]"
        role="img"
        aria-label={da ? "Kredsløbsdiagram" : "Logic diagram"}
      >
        {/* Input A */}
        <circle cx={28} cy={48} r={10} fill={a ? "var(--accent)" : "var(--surface)"} stroke={wire(a)} strokeWidth={2} />
        <text
          x={28}
          y={52}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={a ? "var(--on-accent)" : "var(--muted)"}
        >
          A
        </text>
        <line x1={38} y1={48} x2={120} y2={48} stroke={wire(a)} strokeWidth={wireW(a)} />

        {/* Input B (hidden visually path for NOT) */}
        {!(preset === "custom2" && gate === "NOT") ? (
          <>
            <circle
              cx={28}
              cy={112}
              r={10}
              fill={b ? "var(--accent)" : "var(--surface)"}
              stroke={wire(b)}
              strokeWidth={2}
            />
            <text
              x={28}
              y={116}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={b ? "var(--on-accent)" : "var(--muted)"}
            >
              B
            </text>
            <line x1={38} y1={112} x2={120} y2={112} stroke={wire(b)} strokeWidth={wireW(b)} />
          </>
        ) : (
          <line x1={120} y1={48} x2={120} y2={80} stroke={wire(a)} strokeWidth={wireW(a)} />
        )}

        {/* Gate body */}
        <rect
          x={120}
          y={40}
          width={100}
          height={80}
          rx={12}
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth={1.5}
        />
        <text x={170} y={72} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--foreground)">
          {preset === "halfAdder"
            ? "½ ADD"
            : preset === "equality"
              ? "A=B"
              : gate}
        </text>
        <text x={170} y={92} textAnchor="middle" fontSize={10} fill="var(--muted)">
          {preset === "halfAdder"
            ? "XOR+AND"
            : preset === "equality"
              ? "XNOR"
              : da
                ? "gate"
                : "gate"}
        </text>

        {/* Outputs */}
        {result.outputs.map((out, i) => {
          const y = result.outputs.length === 1 ? 80 : 52 + i * 56;
          return (
            <g key={out.id}>
              <line
                x1={220}
                y1={y}
                x2={300}
                y2={y}
                stroke={wire(out.value)}
                strokeWidth={wireW(out.value)}
              />
              <circle
                cx={318}
                cy={y}
                r={12}
                fill={out.value ? "var(--accent)" : "var(--surface)"}
                stroke={wire(out.value)}
                strokeWidth={2}
              />
              <text
                x={318}
                y={y + 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill={out.value ? "var(--on-accent)" : "var(--muted)"}
              >
                {bit(out.value)}
              </text>
              <text x={300} y={y - 14} textAnchor="end" fontSize={10} fill="var(--muted)">
                {da ? out.labelDa : out.labelEn}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function LogikTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [preset, setPreset] = useState<PresetId>("halfAdder");
  const [gate, setGate] = useState<GateKind>("AND");
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);

  const result = useMemo(
    () => runPreset(preset, { a, b }, gate),
    [preset, a, b, gate],
  );
  const table = useMemo(() => truthTable(preset, gate), [preset, gate]);

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Byg simple logikkredsløb, skift binære indgange, og se udgange samt sandhedstabel opdatere med det samme."
          : "Build simple logic circuits, flip binary inputs, and watch outputs and the truth table update live."}
      </p>

      <Segmented
        value={preset}
        onChange={setPreset}
        ariaLabel={da ? "Kredsløb" : "Circuit"}
        options={[
          { id: "halfAdder", label: da ? "Halvadder" : "Half-adder" },
          { id: "equality", label: da ? "Lighed" : "Equality" },
          { id: "custom2", label: da ? "2-input" : "2-input" },
        ]}
      />

      {preset === "custom2" ? (
        <div className="kit-h-scroll flex gap-2">
          {GATES.map((g) => (
            <button
              key={g}
              type="button"
              className={`${secondaryBtnClass} ${
                gate === g ? "!border-accent !bg-accent !text-on-accent" : ""
              }`}
              onClick={() => setGate(g)}
              aria-pressed={gate === g}
            >
              <span className="inline-flex items-center gap-2">
                <GateGlyph kind={g} active={gate === g} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {(preset === "halfAdder"
            ? (["XOR", "AND"] as GateKind[])
            : (["XOR"] as GateKind[])
          ).map((g) => (
            <div
              key={g}
              className="rounded-[12px] border border-border bg-surface px-2 py-1"
            >
              <GateGlyph kind={g} active={result.wires.some((w) => w.on)} />
            </div>
          ))}
          {preset === "equality" ? (
            <p className="self-center text-sm text-muted">
              {da ? "EQ er sand, når A og B er ens (XNOR)." : "EQ is true when A and B match (XNOR)."}
            </p>
          ) : (
            <p className="self-center text-sm text-muted">
              {da
                ? "Sum = A XOR B. Carry = A AND B."
                : "Sum = A XOR B. Carry = A AND B."}
            </p>
          )}
        </div>
      )}

      <section className="kit-tool-panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-end gap-3">
          <ToggleBit label="A" value={a} onChange={setA} />
          {!(preset === "custom2" && gate === "NOT") ? (
            <ToggleBit label="B" value={b} onChange={setB} />
          ) : null}
          <div className="ml-auto flex flex-wrap gap-3 pb-1">
            {result.outputs.map((o) => (
              <SignalDot
                key={o.id}
                on={o.value}
                label={da ? o.labelDa : o.labelEn}
              />
            ))}
          </div>
        </div>

        <CircuitCanvas
          preset={preset}
          gate={gate}
          a={a}
          b={b}
          result={result}
          da={da}
        />

        <div className="flex flex-wrap gap-2">
          {result.wires.map((w) => (
            <span
              key={w.id}
              className={`rounded-[8px] border px-2.5 py-1 font-mono text-xs ${
                w.on
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border bg-surface text-muted"
              }`}
            >
              {w.id}: {bit(w.on)}
            </span>
          ))}
        </div>
      </section>

      <section className="kit-tool-panel space-y-3 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-foreground">
          {da ? "Sandhedstabel" : "Truth table"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[240px] border-collapse text-center text-sm tabular-nums">
            <thead>
              <tr>
                {table.headers.map((h) => (
                  <th
                    key={h}
                    className="border-b border-border px-2 py-2 text-xs font-medium text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => {
                const live =
                  row.a === a &&
                  (preset === "custom2" && gate === "NOT" ? true : row.b === b);
                return (
                  <tr
                    key={i}
                    className={live ? "bg-accent/10" : undefined}
                  >
                    <td className="border-b border-border/70 px-2 py-2 font-mono">
                      {bit(row.a)}
                    </td>
                    {!(preset === "custom2" && gate === "NOT") ? (
                      <td className="border-b border-border/70 px-2 py-2 font-mono">
                        {bit(row.b)}
                      </td>
                    ) : null}
                    {row.values.map((v, j) => (
                      <td
                        key={j}
                        className={`border-b border-border/70 px-2 py-2 font-mono font-semibold ${
                          v ? "text-accent" : "text-muted"
                        }`}
                      >
                        {bit(v)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          {da
            ? "Den markerede række matcher dine aktuelle indgange."
            : "The highlighted row matches your current inputs."}
        </p>
      </section>
    </div>
  );
}
