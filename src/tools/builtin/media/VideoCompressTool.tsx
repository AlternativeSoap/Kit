"use client";

import { useCallback, useRef, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { downloadBlob, formatBytes } from "./canvas";
import { ProgressBar } from "./ProgressBar";

const MAX_BYTES = 80 * 1024 * 1024;
const FFMPEG_ESM = "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/+esm";
const UTIL_ESM = "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.1/+esm";
const CORE_BASE = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";

/** Dynamic import that Turbopack cannot statically resolve. */
function importFromUrl<T>(url: string): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const dyn = new Function("u", "return import(u)") as (u: string) => Promise<T>;
  return dyn(url);
}

type FFmpegLike = {
  on: (event: "progress", cb: (data: { progress: number }) => void) => void;
  load: (config: { coreURL: string; wasmURL: string }) => Promise<void>;
  writeFile: (name: string, data: Uint8Array) => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  readFile: (name: string) => Promise<Uint8Array | string>;
  terminate: () => Promise<void>;
};

type ReadyResult = {
  blob: Blob;
  filename: string;
  info: string;
};

export function VideoCompressTool() {
  const dictionary = useDictionary();
  const t = dictionary.videoTool;
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<ReadyResult | null>(null);
  const [crf, setCrf] = useState("28");
  const [trimStart, setTrimStart] = useState("");
  const [trimEnd, setTrimEnd] = useState("");
  const loadingRef = useRef(false);

  const onFile = useCallback(
    (f: File | null) => {
      setError(null);
      setReady(null);
      setProgress(0);
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
    setProgress(0);
  }

  async function run() {
    if (!file || loadingRef.current) return;
    loadingRef.current = true;
    setBusy(true);
    setError(null);
    setReady(null);
    setProgress(2);
    try {
      const ffmpegMod = await importFromUrl<{ FFmpeg: new () => FFmpegLike }>(
        FFMPEG_ESM,
      );
      const utilMod = await importFromUrl<{
        fetchFile: (file: File | string) => Promise<Uint8Array>;
        toBlobURL: (url: string, type: string) => Promise<string>;
      }>(UTIL_ESM);

      setProgress(8);
      const ffmpeg = new ffmpegMod.FFmpeg();
      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.min(96, 12 + Math.round((p || 0) * 84)));
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

      setProgress(12);
      const inputName = "input" + (file.name.match(/\.[^.]+$/)?.[0] ?? ".mp4");
      await ffmpeg.writeFile(inputName, await utilMod.fetchFile(file));

      const args = ["-i", inputName];
      const start = Number(trimStart);
      const end = Number(trimEnd);
      if (Number.isFinite(start) && start >= 0 && trimStart.trim()) {
        args.push("-ss", String(start));
      }
      if (Number.isFinite(end) && end > 0 && trimEnd.trim()) {
        args.push("-to", String(end));
      }
      const crfN = Math.min(40, Math.max(18, Number(crf) || 28));
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
        "output.mp4",
      );

      const code = await ffmpeg.exec(args);
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
      setReady({
        blob,
        filename,
        info: `${formatBytes(file.size)} → ${formatBytes(blob.size)}`,
      });
      await ffmpeg.terminate();
    } catch {
      setError(t.processError);
      setProgress(0);
    } finally {
      setBusy(false);
      loadingRef.current = false;
    }
  }

  function downloadReady() {
    if (!ready) return;
    downloadBlob(ready.blob, ready.filename);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <p className="text-sm text-muted">{t.localNote}</p>
      <p className="text-xs text-muted">
        {t.limitNote.replace("{max}", formatBytes(MAX_BYTES))}
      </p>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          {t.pickVideo}
        </span>
        <input
          type="file"
          accept="video/*"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-background"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {file ? (
        <p className="text-xs text-muted">
          {file.name} · {formatBytes(file.size)}
        </p>
      ) : null}
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          {t.crf}
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={crf}
          onChange={(e) => {
            setCrf(e.target.value);
            markSettingsChanged();
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs text-muted">{t.crfHint}</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            {t.trimStart}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={trimStart}
            onChange={(e) => {
              setTrimStart(e.target.value);
              markSettingsChanged();
            }}
            placeholder="0"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            {t.trimEnd}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={trimEnd}
            onChange={(e) => {
              setTrimEnd(e.target.value);
              markSettingsChanged();
            }}
            placeholder={t.optional}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>

      {busy || (progress > 0 && !ready) ? (
        <ProgressBar value={progress} label={t.progress} />
      ) : null}

      {ready ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">{ready.info}</p>
          <p className="text-sm font-medium text-foreground">{t.ready}</p>
          <button
            type="button"
            onClick={downloadReady}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            {t.download}
          </button>
          <button
            type="button"
            disabled={!file || busy}
            onClick={() => void run()}
            className="ml-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
          >
            {t.processAgain}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!file || busy}
          onClick={() => void run()}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
        >
          {busy ? t.working : t.process}
        </button>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
