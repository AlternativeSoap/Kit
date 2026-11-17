"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ErrorBanner,
  Field,
  KitInput,
  Segmented,
  fileInputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { CdnLoadError, importFromUrl } from "@/lib/cdnImport";
import { useStoredMode } from "@/hooks/useStoredMode";
import { useDictionary } from "@/i18n/LanguageProvider";
import { downloadBlob, formatBytes } from "./canvas";
import { ProgressBar } from "./ProgressBar";

const MAX_BYTES = 80 * 1024 * 1024;
const FFMPEG_ESM = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/+esm";
const UTIL_ESM = "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/+esm";
const CORE_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";

type FFmpegLike = {
  on: (event: "progress", cb: (data: { progress: number }) => void) => void;
  load: (config: { coreURL: string; wasmURL: string }) => Promise<void>;
  writeFile: (name: string, data: Uint8Array) => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  readFile: (name: string) => Promise<Uint8Array | string>;
  terminate: () => void | Promise<void>;
};

type ReadyResult = {
  blob: Blob;
  filename: string;
  info: string;
};

type Phase = "idle" | "loading" | "encoding";

type Preset = "small" | "balanced" | "high";
type MaxRes = "original" | "1080" | "720";

const PRESET_IDS = ["small", "balanced", "high"] as const;
const RES_IDS = ["original", "1080", "720"] as const;

const PRESET_CRF: Record<Preset, number> = {
  small: 28,
  balanced: 23,
  high: 18,
};

/** Parse "90", "1.5", "1:30" or "0:01:30" into seconds. Returns null when invalid. */
function parseTimeInput(raw: string): number | null {
  const value = raw.trim();
  if (!value) return null;
  const parts = value.split(":");
  if (parts.length > 3) return null;
  let total = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!.trim();
    const isLast = i === parts.length - 1;
    const pattern = isLast ? /^\d+(\.\d+)?$/ : /^\d+$/;
    if (!pattern.test(part)) return null;
    total = total * 60 + Number(part);
  }
  return Number.isFinite(total) ? total : null;
}

async function safeTerminate(ffmpeg: FFmpegLike | null) {
  if (!ffmpeg) return;
  try {
    await ffmpeg.terminate();
  } catch {
    /* already terminated */
  }
}

export function VideoCompressTool() {
  const dictionary = useDictionary();
  const t = dictionary.videoTool;
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [ready, setReady] = useState<ReadyResult | null>(null);
  const [preset, setPreset] = useStoredMode<Preset>(
    "kit.video.preset",
    "balanced",
    PRESET_IDS,
  );
  const [maxRes, setMaxRes] = useStoredMode<MaxRes>(
    "kit.video.maxRes",
    "original",
    RES_IDS,
  );
  const [trimStart, setTrimStart] = useState("");
  const [trimEnd, setTrimEnd] = useState("");
  const loadingRef = useRef(false);
  const cancelledRef = useRef(false);
  const ffmpegRef = useRef<FFmpegLike | null>(null);

  useEffect(
    () => () => {
      cancelledRef.current = true;
      const instance = ffmpegRef.current;
      ffmpegRef.current = null;
      void safeTerminate(instance);
    },
    [],
  );

  const onFile = useCallback(
    (f: File | null) => {
      setError(null);
      setCancelled(false);
      setReady(null);
      setProgress(0);
      setPhase("idle");
      setFile(null);
      if (!f) return;
      if (f.size > MAX_BYTES) {
        setError(t.tooLarge.replace("{max}", formatBytes(MAX_BYTES)));
        return;
      }
      setFile(f);
    },
    [t.tooLarge],
  );

  function markSettingsChanged() {
    setReady(null);
    setCancelled(false);
    setProgress(0);
    setPhase("idle");
  }

  function cancel() {
    if (!loadingRef.current) return;
    cancelledRef.current = true;
    const instance = ffmpegRef.current;
    ffmpegRef.current = null;
    void safeTerminate(instance);
  }

  async function run() {
    if (!file || loadingRef.current) return;

    const startSec = parseTimeInput(trimStart);
    const endSec = parseTimeInput(trimEnd);
    if (
      (trimStart.trim() && startSec === null) ||
      (trimEnd.trim() && endSec === null) ||
      (startSec !== null && endSec !== null && endSec <= startSec)
    ) {
      setError(t.invalidTrim);
      return;
    }

    loadingRef.current = true;
    cancelledRef.current = false;
    setBusy(true);
    setError(null);
    setCancelled(false);
    setReady(null);
    setPhase("loading");
    setProgress(2);
    try {
      const ffmpegMod = await importFromUrl<{ FFmpeg: new () => FFmpegLike }>(
        FFMPEG_ESM,
      );
      const utilMod = await importFromUrl<{
        fetchFile: (file: File | string) => Promise<Uint8Array>;
        toBlobURL: (url: string, type: string) => Promise<string>;
      }>(UTIL_ESM);
      if (cancelledRef.current) throw new Error("cancelled");

      setProgress(6);
      const ffmpeg = new ffmpegMod.FFmpeg();
      ffmpegRef.current = ffmpeg;
      ffmpeg.on("progress", ({ progress: p }) => {
        if (cancelledRef.current) return;
        setPhase("encoding");
        setProgress(Math.min(96, 18 + Math.round((p || 0) * 78)));
      });
      await ffmpeg.load({
        coreURL: await utilMod.toBlobURL(
          `${CORE_BASE}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await utilMod.toBlobURL(
          `${CORE_BASE}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });
      if (cancelledRef.current) throw new Error("cancelled");

      setProgress(14);
      setPhase("encoding");
      const inputName = "input" + (file.name.match(/\.[^.]+$/)?.[0] ?? ".mp4");
      await ffmpeg.writeFile(inputName, await utilMod.fetchFile(file));

      const args = ["-i", inputName];
      if (startSec !== null && startSec > 0) args.push("-ss", String(startSec));
      if (endSec !== null && endSec > 0) args.push("-to", String(endSec));

      if (maxRes !== "original") {
        args.push("-vf", `scale=-2:min(${maxRes}\\,ih)`);
      }

      const crfN = Math.min(40, Math.max(18, PRESET_CRF[preset]));
      args.push(
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        String(crfN),
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        "output.mp4",
      );

      const code = await ffmpeg.exec(args);
      if (cancelledRef.current) throw new Error("cancelled");
      if (code !== 0) throw new Error("ffmpeg failed");

      const data = await ffmpeg.readFile("output.mp4");
      const bytes =
        data instanceof Uint8Array
          ? data
          : new TextEncoder().encode(String(data));
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const blob = new Blob([copy.buffer], { type: "video/mp4" });
      const base = file.name.replace(/\.[^.]+$/, "");
      const filename = `${base}-compressed.mp4`;
      setProgress(100);
      setPhase("idle");
      setReady({
        blob,
        filename,
        info: `${formatBytes(file.size)} → ${formatBytes(blob.size)}`,
      });
    } catch (err) {
      setProgress(0);
      setPhase("idle");
      if (cancelledRef.current) {
        setCancelled(true);
      } else if (err instanceof CdnLoadError) {
        setError(t.cdnError);
      } else {
        setError(t.processError);
      }
    } finally {
      const instance = ffmpegRef.current;
      ffmpegRef.current = null;
      await safeTerminate(instance);
      setBusy(false);
      loadingRef.current = false;
    }
  }

  function downloadReady() {
    if (!ready) return;
    downloadBlob(ready.blob, ready.filename);
  }

  const progressLabel =
    phase === "loading"
      ? t.loadingEngine
      : phase === "encoding"
        ? t.encoding
        : t.progress;

  const workingLabel = phase === "loading" ? t.loadingEngine : t.working;

  const presetOptions: { id: Preset; label: string }[] = [
    { id: "small", label: t.presetSmall },
    { id: "balanced", label: t.presetBalanced },
    { id: "high", label: t.presetHigh },
  ];
  const resOptions: { id: MaxRes; label: string }[] = [
    { id: "original", label: t.resOriginal },
    { id: "1080", label: t.res1080 },
    { id: "720", label: t.res720 },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="text-sm text-muted">{t.localNote}</p>
      <p className="text-xs text-muted">
        {t.limitNote.replace("{max}", formatBytes(MAX_BYTES))}
      </p>
      <p className="text-xs text-muted">{t.firstUseNote}</p>
      <Field label={t.pickVideo}>
        <input
          type="file"
          accept="video/*"
          disabled={busy}
          className={fileInputClass}
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </Field>
      {file ? (
        <p className="text-xs text-muted">
          {file.name} · {formatBytes(file.size)}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-foreground">{t.crf}</span>
        <Segmented
          ariaLabel={t.crf}
          value={preset}
          options={presetOptions}
          onChange={(next) => {
            if (busy) return;
            setPreset(next);
            markSettingsChanged();
          }}
        />
        <span className="block text-xs text-muted">{t.crfHint}</span>
      </div>

      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-foreground">
          {t.maxResolution}
        </span>
        <Segmented
          ariaLabel={t.maxResolution}
          value={maxRes}
          options={resOptions}
          onChange={(next) => {
            if (busy) return;
            setMaxRes(next);
            markSettingsChanged();
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t.trimStart}>
          <KitInput
            type="text"
            inputMode="decimal"
            value={trimStart}
            disabled={busy}
            onChange={(e) => {
              setTrimStart(e.target.value);
              markSettingsChanged();
            }}
            placeholder="0:00"
          />
        </Field>
        <Field label={t.trimEnd}>
          <KitInput
            type="text"
            inputMode="decimal"
            value={trimEnd}
            disabled={busy}
            onChange={(e) => {
              setTrimEnd(e.target.value);
              markSettingsChanged();
            }}
            placeholder={t.optional}
          />
        </Field>
      </div>
      <p className="-mt-3 text-xs text-muted">{t.trimHint}</p>

      {busy || (progress > 0 && !ready) ? (
        <ProgressBar value={progress} label={progressLabel} />
      ) : null}

      {ready ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">{ready.info}</p>
          <p className="text-sm font-medium text-foreground">{t.ready}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadReady}
              className={primaryBtnClass}
            >
              {t.download}
            </button>
            <button
              type="button"
              disabled={!file || busy}
              onClick={() => void run()}
              className={secondaryBtnClass}
            >
              {t.processAgain}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!file || busy}
            onClick={() => void run()}
            className={primaryBtnClass}
          >
            {busy ? workingLabel : t.process}
          </button>
          {busy ? (
            <button
              type="button"
              onClick={cancel}
              className={secondaryBtnClass}
            >
              {t.cancel}
            </button>
          ) : null}
        </div>
      )}

      {cancelled ? <p className="text-sm text-muted">{t.cancelled}</p> : null}
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
    </div>
  );
}
