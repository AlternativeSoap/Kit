"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, KitSelect, Segmented, fieldClass } from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import {
  buildWifiQrPayload,
  type WifiSecurity,
} from "../wifiqr/calc";
import { canvasPngDataUrl, drawQrOnCanvas } from "./calc";

type QrMode = "text" | "wifi";

export function QrTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const { locale } = useLanguage();
  const da = locale === "da";
  const t = dictionary.qr;

  const [mode, setMode] = useState<QrMode>(
    prefillChoice(prefill, "mode", ["text", "wifi"] as const) ?? "text",
  );
  const [text, setText] = useState(() => prefill?.text?.trim() || "https://");
  const [ssid, setSsid] = useState(prefill?.ssid ?? "");
  const [password, setPassword] = useState(prefill?.password ?? "");
  const [security, setSecurity] = useState<WifiSecurity>(
    prefillChoice(prefill, "security", ["WPA", "WEP", "nopass"] as const) ??
      "WPA",
  );
  const [hidden, setHidden] = useState(prefill?.hidden === "1");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const payload =
    mode === "wifi"
      ? buildWifiQrPayload({ ssid, password, security, hidden })
      : text;

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) {
      setReady(false);
      return;
    }
    setReady(drawQrOnCanvas(canvas, payload));
  }, [payload]);

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
    anchor.download = mode === "wifi" ? "wifi-qr.png" : "qr-code.png";
    anchor.click();
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel="QR"
        options={[
          { id: "text", label: da ? "Tekst / URL" : "Text / URL" },
          { id: "wifi", label: "Wi‑Fi" },
        ]}
      />

      {mode === "text" ? (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.text}</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            className={fieldClass}
          />
        </label>
      ) : (
        <div className="space-y-4">
          <Field label="SSID">
            <input
              className={fieldClass}
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label={da ? "Sikkerhed" : "Security"}>
            <KitSelect
              value={security}
              onChange={(e) => setSecurity(e.target.value as WifiSecurity)}
            >
              <option value="WPA">WPA / WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">{da ? "Åbent net" : "Open network"}</option>
            </KitSelect>
          </Field>
          {security !== "nopass" ? (
            <Field label={da ? "Adgangskode" : "Password"}>
              <input
                type="text"
                className={fieldClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </Field>
          ) : null}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
            />
            {da ? "Skjult netværk" : "Hidden network"}
          </label>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 rounded-[12px] border border-border bg-surface px-4 py-6">
        <canvas
          ref={canvasRef}
          className="max-w-full rounded-[8px] border border-border bg-paper"
          aria-label={t.preview}
        />
        {!ready ? (
          <p className="text-sm text-muted">
            {mode === "wifi"
              ? da
                ? "Udfyld netværksnavn og kode for at lave QR."
                : "Enter the network name and password to make a QR code."
              : t.empty}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadPng}
          disabled={!ready}
          className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-on-accent hover:opacity-90 disabled:opacity-50 sm:min-h-0"
        >
          {t.download}
        </button>
        {payload?.trim() ? (
          <CopyButton
            value={payload.trim()}
            label={t.copy}
            copiedLabel={t.copied}
          />
        ) : null}
      </div>

      <p className="text-xs text-muted">{t.disclaimer}</p>
    </div>
  );
}
