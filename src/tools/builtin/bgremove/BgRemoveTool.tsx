"use client";

import { useCallback, useEffect, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { downloadBlob, formatBytes } from "../media/canvas";
import { ProgressBar } from "../media/ProgressBar";

function importFromUrl<T>(url: string): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  const dyn = new Function("u", "return import(u)") as (u: string) => Promise<T>;
  return dyn(url);
}

export function BgRemoveTool() {
  const dictionary = useDictionary();
  const t = dictionary.bgremoveTool;
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [info, setInfo] = useState<string | null>(null);

  const clearUrls = useCallback(() => {
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setResultUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setResultBlob(null);
  }, []);

  useEffect(() => () => clearUrls(), [clearUrls]);

  async function onFile(file: File | null) {
    setError(null);
    setInfo(null);
    clearUrls();
    setProgress(0);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t.invalidImage);
      return;
    }
    setFileName(file.name.replace(/\.[^.]+$/, "") || "image");
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    setProgress(4);
    try {
      const mod = await importFromUrl<{
        removeBackground: (
          image: Blob | File,
          config?: {
            progress?: (key: string, current: number, total: number) => void;
            publicPath?: string;
          },
        ) => Promise<Blob>;
      }>("https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm");

      setProgress(12);
      const blob = await mod.removeBackground(file, {
        publicPath:
          "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/dist/",
        progress: (_key, current, total) => {
          const ratio = total > 0 ? current / total : 0;
          setProgress(Math.min(96, 12 + Math.round(ratio * 84)));
        },
      });
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      setProgress(100);
      setInfo(`${formatBytes(file.size)} → ${formatBytes(blob.size)}`);
    } catch {
      setError(t.processError);
      setProgress(0);
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!resultBlob) return;
    downloadBlob(resultBlob, `${fileName}-no-bg.png`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-muted">{t.intro}</p>
      <p className="text-xs text-muted">{t.note}</p>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.pickImage}</span>
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-[8px] file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {busy || (progress > 0 && !resultUrl) ? (
        <ProgressBar value={progress} label={busy ? t.working : t.progress} />
      ) : null}

      {error ? <p className="text-sm text-muted">{error}</p> : null}
      {info ? <p className="text-sm text-muted">{info}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-[12px] border border-border bg-black/5 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {t.original}
          </p>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="mx-auto max-h-72 max-w-full object-contain"
            />
          ) : (
            <p className="flex h-40 items-center justify-center text-sm text-muted">
              {t.empty}
            </p>
          )}
        </div>
        <div className="overflow-hidden rounded-[12px] border border-border bg-[linear-gradient(45deg,#eee_25%,transparent_25%,transparent_75%,#eee_75%),linear-gradient(45deg,#eee_25%,transparent_25%,transparent_75%,#eee_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {t.result}
          </p>
          {resultUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resultUrl}
              alt=""
              className="mx-auto max-h-72 max-w-full object-contain"
            />
          ) : (
            <p className="flex h-40 items-center justify-center bg-surface/80 text-sm text-muted">
              {t.emptyResult}
            </p>
          )}
        </div>
      </div>

      {resultBlob ? (
        <button
          type="button"
          onClick={download}
          className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white sm:min-h-0"
        >
          {t.download}
        </button>
      ) : null}
    </div>
  );
}
