"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { canvasPngDataUrl, drawQrOnCanvas } from "./calc";

export function QrTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.qr;

  const [text, setText] = useState(() => prefill?.text?.trim() || "https://");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ok = drawQrOnCanvas(canvas, text);
    setReady(ok);
  }, [text]);

  useEffect(() => {
    repaint();
  }, [repaint]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const url = canvasPngDataUrl(canvas);
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "qr-code.png";
    anchor.click();
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">{t.text}</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-[15px] outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
        />
      </label>

      <div className="flex flex-col items-center gap-3 rounded-[12px] border border-border bg-surface px-4 py-6">
        <canvas
          ref={canvasRef}
          className="max-w-full rounded-[8px] border border-border bg-white"
          aria-label={t.preview}
        />
        {!ready ? <p className="text-sm text-muted">{t.empty}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadPng}
          disabled={!ready}
          className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 sm:min-h-0"
        >
          {t.download}
        </button>
        {text.trim() ? (
          <CopyButton value={text.trim()} label={t.copy} copiedLabel={t.copied} />
        ) : null}
      </div>

      <p className="text-xs text-muted">{t.disclaimer}</p>
    </div>
  );
}