"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Field,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type NodeId = "osc" | "filter" | "gain" | "env" | "delay" | "out";
type PortSide = "in" | "out";

type Cable = { from: NodeId; to: NodeId };

type NodeDef = {
  id: NodeId;
  labelEn: string;
  labelDa: string;
  x: number;
  y: number;
  hasIn: boolean;
  hasOut: boolean;
};

const NODES: NodeDef[] = [
  { id: "osc", labelEn: "Oscillator", labelDa: "Oscillator", x: 40, y: 48, hasIn: false, hasOut: true },
  { id: "filter", labelEn: "Filter", labelDa: "Filter", x: 220, y: 48, hasIn: true, hasOut: true },
  { id: "gain", labelEn: "Gain / VCA", labelDa: "Gain / VCA", x: 400, y: 48, hasIn: true, hasOut: true },
  { id: "env", labelEn: "Envelope", labelDa: "Envelope", x: 400, y: 170, hasIn: false, hasOut: true },
  { id: "delay", labelEn: "Delay", labelDa: "Delay", x: 220, y: 170, hasIn: true, hasOut: true },
  { id: "out", labelEn: "Output", labelDa: "Output", x: 40, y: 170, hasIn: true, hasOut: false },
];

const DEFAULT_CABLES: Cable[] = [
  { from: "osc", to: "filter" },
  { from: "filter", to: "gain" },
  { from: "env", to: "gain" },
  { from: "gain", to: "delay" },
  { from: "delay", to: "out" },
];

const W = 560;
const H = 280;
const NODE_W = 118;
const NODE_H = 56;

function portPos(node: NodeDef, side: PortSide) {
  const cx = side === "in" ? node.x : node.x + NODE_W;
  const cy = node.y + NODE_H / 2;
  return { x: cx, y: cy };
}

function cableKey(c: Cable) {
  return `${c.from}->${c.to}`;
}

export function ModularTool() {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [cables, setCables] = useState<Cable[]>(DEFAULT_CABLES);
  const [pendingFrom, setPendingFrom] = useState<NodeId | null>(null);
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [freq, setFreq] = useState(220);
  const [cutoff, setCutoff] = useState(1200);
  const [q, setQ] = useState(1.2);
  const [delayTime, setDelayTime] = useState(0.22);
  const [msg, setMsg] = useState("");

  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const delayFbRef = useRef<GainNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const envTimerRef = useRef<number | null>(null);

  const nodeMap = useMemo(() => {
    const m = new Map<NodeId, NodeDef>();
    for (const n of NODES) m.set(n.id, n);
    return m;
  }, []);

  function ensureCtx() {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) {
      const ctx = new AudioCtx();
      ctxRef.current = ctx;
    }
    return ctxRef.current;
  }

  async function unlockAudio() {
    const ctx = ensureCtx();
    if (!ctx) {
      setMsg(da ? "Web Audio er ikke tilgængelig." : "Web Audio is not available.");
      return null;
    }
    if (ctx.state === "suspended") await ctx.resume();
    setReady(true);
    setMsg("");
    return ctx;
  }

  const tearDownGraph = useCallback(() => {
    if (envTimerRef.current != null) {
      window.clearTimeout(envTimerRef.current);
      envTimerRef.current = null;
    }
    try {
      oscRef.current?.stop();
    } catch {
      /* already stopped */
    }
    oscRef.current?.disconnect();
    filterRef.current?.disconnect();
    gainRef.current?.disconnect();
    delayRef.current?.disconnect();
    delayFbRef.current?.disconnect();
    masterRef.current?.disconnect();
    oscRef.current = null;
    filterRef.current = null;
    gainRef.current = null;
    delayRef.current = null;
    delayFbRef.current = null;
    masterRef.current = null;
  }, []);

  const buildAndStart = useCallback(
    async (cableList: Cable[], params: {
      freq: number;
      cutoff: number;
      q: number;
      delayTime: number;
    }) => {
      const ctx = await unlockAudio();
      if (!ctx) return false;

      tearDownGraph();

      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = Math.max(40, Math.min(2000, params.freq));

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = Math.max(80, Math.min(12000, params.cutoff));
      filter.Q.value = Math.max(0.1, Math.min(18, params.q));

      const gain = ctx.createGain();
      gain.gain.value = 0.0001;

      const delay = ctx.createDelay(1.5);
      delay.delayTime.value = Math.max(0.01, Math.min(1.2, params.delayTime));
      const delayFb = ctx.createGain();
      delayFb.gain.value = 0.28;

      const master = ctx.createGain();
      master.gain.value = 0.35;

      oscRef.current = osc;
      filterRef.current = filter;
      gainRef.current = gain;
      delayRef.current = delay;
      delayFbRef.current = delayFb;
      masterRef.current = master;

      const audioNodes: Record<Exclude<NodeId, "env">, AudioNode> = {
        osc,
        filter,
        gain,
        delay,
        out: master,
      };

      const envToGain = cableList.some((c) => c.from === "env" && c.to === "gain");
      const audioCables = cableList.filter((c) => c.from !== "env");

      const reachable = new Set<NodeId>();
      const queue: NodeId[] = ["osc"];
      while (queue.length) {
        const id = queue.shift()!;
        if (reachable.has(id)) continue;
        reachable.add(id);
        for (const c of audioCables) {
          if (c.from === id) queue.push(c.to);
        }
      }

      if (!reachable.has("out")) {
        setMsg(
          da
            ? "Forbind oscillatoren til Output for at høre lyd."
            : "Connect the oscillator path to Output to hear sound.",
        );
      } else {
        setMsg("");
      }

      for (const c of audioCables) {
        const from = audioNodes[c.from as Exclude<NodeId, "env">];
        const to = audioNodes[c.to as Exclude<NodeId, "env">];
        if (!from || !to) continue;
        if (c.from === "delay" && c.to === "delay") continue;
        try {
          from.connect(to);
        } catch {
          /* invalid cycle handled softly */
        }
      }

      // Local delay feedback (internal to delay module)
      delay.connect(delayFb);
      delayFb.connect(delay);

      master.connect(ctx.destination);

      const now = ctx.currentTime;
      if (envToGain) {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.85, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.45, now + 0.22);
      } else {
        gain.gain.setValueAtTime(0.55, now);
      }

      osc.start(now);
      return true;
    },
    // unlockAudio closes over da; tearDown is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [da, tearDownGraph],
  );

  async function toggleRun() {
    if (running) {
      const ctx = ctxRef.current;
      const gain = gainRef.current;
      if (ctx && gain) {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        envTimerRef.current = window.setTimeout(() => {
          tearDownGraph();
        }, 160);
      } else {
        tearDownGraph();
      }
      setRunning(false);
      return;
    }
    const ok = await buildAndStart(cables, { freq, cutoff, q, delayTime });
    if (ok) setRunning(true);
  }

  useEffect(() => {
    if (!running) return;
    if (oscRef.current) oscRef.current.frequency.value = Math.max(40, Math.min(2000, freq));
    if (filterRef.current) {
      filterRef.current.frequency.value = Math.max(80, Math.min(12000, cutoff));
      filterRef.current.Q.value = Math.max(0.1, Math.min(18, q));
    }
    if (delayRef.current) {
      delayRef.current.delayTime.value = Math.max(0.01, Math.min(1.2, delayTime));
    }
  }, [freq, cutoff, q, delayTime, running]);

  useEffect(() => {
    if (!running) return;
    void buildAndStart(cables, { freq, cutoff, q, delayTime });
    // Rebuild graph when patch wiring changes while playing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cables]);

  useEffect(() => {
    return () => {
      tearDownGraph();
      void ctxRef.current?.close();
    };
  }, [tearDownGraph]);

  function onPortClick(nodeId: NodeId, side: PortSide) {
    const def = nodeMap.get(nodeId);
    if (!def) return;

    if (side === "out") {
      if (!def.hasOut) return;
      setPendingFrom(nodeId);
      setMsg(da ? "Vælg en indgang at forbinde til." : "Pick an input to connect to.");
      return;
    }

    if (!def.hasIn) return;
    if (!pendingFrom) {
      setMsg(da ? "Klik først på en udgang." : "Click an output first.");
      return;
    }
    if (pendingFrom === nodeId) {
      setPendingFrom(null);
      setMsg("");
      return;
    }

    const next: Cable = { from: pendingFrom, to: nodeId };
    setCables((prev) => {
      // One audio source per input; envelope may share the Gain input.
      const withoutDupIn =
        next.from === "env"
          ? prev.filter((c) => !(c.from === "env" && c.to === next.to))
          : prev.filter((c) => !(c.to === next.to && c.from !== "env"));
      const withoutExact = withoutDupIn.filter(
        (c) => !(c.from === next.from && c.to === next.to),
      );
      return [...withoutExact, next];
    });
    setPendingFrom(null);
    setMsg(da ? "Kabel tilføjet." : "Cable connected.");
  }

  function removeCable(c: Cable) {
    setCables((prev) => prev.filter((x) => cableKey(x) !== cableKey(c)));
  }

  function resetPatch() {
    setCables(DEFAULT_CABLES);
    setPendingFrom(null);
    setMsg(da ? "Standard-patch gendannet." : "Default patch restored.");
  }

  const label = (n: NodeDef) => (da ? n.labelDa : n.labelEn);

  return (
    <div className="kit-tool mx-auto max-w-3xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Mini modulær patch. Klik en udgang, derefter en indgang, for at trække kabler. Lyden bygges med Web Audio bagved."
          : "Mini modular patch. Click an output, then an input, to draw cables. Sound is built with Web Audio behind the board."}
      </p>

      <section className="kit-tool-panel space-y-3 p-3 sm:p-4">
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto h-auto w-full min-w-[320px] max-w-[560px] touch-manipulation"
            role="img"
            aria-label={da ? "Modulær patch" : "Modular patch"}
          >
            <rect x={0} y={0} width={W} height={H} rx={12} className="fill-[var(--surface)] stroke-[var(--border)]" strokeWidth={1} />
            {cables.map((c) => {
              const a = nodeMap.get(c.from);
              const b = nodeMap.get(c.to);
              if (!a || !b) return null;
              const p1 = portPos(a, "out");
              const p2 = portPos(b, "in");
              const mx = (p1.x + p2.x) / 2;
              const isEnv = c.from === "env";
              return (
                <path
                  key={cableKey(c)}
                  d={`M ${p1.x} ${p1.y} C ${mx} ${p1.y}, ${mx} ${p2.y}, ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={isEnv ? "var(--muted)" : "var(--accent)"}
                  strokeWidth={isEnv ? 1.5 : 2.25}
                  strokeDasharray={isEnv ? "4 3" : undefined}
                  opacity={0.9}
                  className="cursor-pointer"
                  onClick={() => removeCable(c)}
                >
                  <title>{da ? "Klik for at fjerne" : "Click to remove"}</title>
                </path>
              );
            })}
            {NODES.map((n) => {
              const active = pendingFrom === n.id;
              return (
                <g key={n.id}>
                  <rect
                    x={n.x}
                    y={n.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    className="fill-[var(--background)] stroke-[var(--border)]"
                    strokeWidth={active ? 2.5 : 1.25}
                    style={active ? { stroke: "var(--accent)" } : undefined}
                  />
                  <text
                    x={n.x + NODE_W / 2}
                    y={n.y + NODE_H / 2 + 4}
                    textAnchor="middle"
                    className="fill-[var(--foreground)]"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    {label(n)}
                  </text>
                  {n.hasIn ? (
                    <circle
                      cx={portPos(n, "in").x}
                      cy={portPos(n, "in").y}
                      r={7}
                      className="fill-[var(--surface)] stroke-[var(--accent)] cursor-pointer"
                      strokeWidth={2}
                      onClick={() => onPortClick(n.id, "in")}
                    />
                  ) : null}
                  {n.hasOut ? (
                    <circle
                      cx={portPos(n, "out").x}
                      cy={portPos(n, "out").y}
                      r={7}
                      className="fill-[var(--accent)] stroke-[var(--accent)] cursor-pointer"
                      strokeWidth={2}
                      onClick={() => onPortClick(n.id, "out")}
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-xs text-muted">
          {msg ||
            (ready
              ? da
                ? "Audio er klar. Klik et kabel for at fjerne det."
                : "Audio is ready. Click a cable to remove it."
              : da
                ? "Start tonen for at låse audio op (browserkrav)."
                : "Start the tone to unlock audio (browser requirement).")}
        </p>
        <div className="kit-h-scroll">
          <button type="button" className={primaryBtnClass} onClick={() => void toggleRun()}>
            {running ? (da ? "Stop tone" : "Stop tone") : da ? "Start tone" : "Start tone"}
          </button>
          <button type="button" className={secondaryBtnClass} onClick={resetPatch}>
            {da ? "Nulstil patch" : "Reset patch"}
          </button>
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={() => void unlockAudio()}
          >
            {da ? "Lås audio op" : "Unlock audio"}
          </button>
        </div>
      </section>

      <section className="kit-tool-panel grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <Field label={da ? "Frekvens (Hz)" : "Frequency (Hz)"} hint={`${Math.round(freq)} Hz`}>
          <input
            type="range"
            min={60}
            max={880}
            step={1}
            value={freq}
            onChange={(e) => setFreq(Number(e.target.value))}
            className="kit-range w-full"
          />
        </Field>
        <Field label={da ? "Cutoff (Hz)" : "Cutoff (Hz)"} hint={`${Math.round(cutoff)} Hz`}>
          <input
            type="range"
            min={120}
            max={8000}
            step={10}
            value={cutoff}
            onChange={(e) => setCutoff(Number(e.target.value))}
            className="kit-range w-full"
          />
        </Field>
        <Field label="Q" hint={q.toFixed(2)}>
          <input
            type="range"
            min={0.2}
            max={12}
            step={0.05}
            value={q}
            onChange={(e) => setQ(Number(e.target.value))}
            className="kit-range w-full"
          />
        </Field>
        <Field
          label={da ? "Delay-tid (s)" : "Delay time (s)"}
          hint={`${delayTime.toFixed(2)} s`}
        >
          <input
            type="range"
            min={0.05}
            max={0.9}
            step={0.01}
            value={delayTime}
            onChange={(e) => setDelayTime(Number(e.target.value))}
            className="kit-range w-full"
          />
        </Field>
      </section>
    </div>
  );
}
