"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Field,
  KitSelect,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { canvasPngDataUrl, drawQrOnCanvas } from "../qr/calc";
import { buildWifiQrPayload, type WifiSecurity } from "./calc";

export function WifiQrTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<WifiSecurity>("WPA");
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const payload = buildWifiQrPayload({ ssid, password, security, hidden });

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

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Field label="SSID">
        <input
          className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
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
            className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
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

      <div className="flex flex-col items-center gap-3 rounded-[12px] border border-border bg-surface px-4 py-6">
        <canvas
          ref={canvasRef}
          className="max-w-full rounded-[8px] border border-border bg-paper"
        />
        {!ready ? (
          <p className="text-sm text-muted">
            {da
              ? "Udfyld netværksnavn og kode for at lave QR."
              : "Enter the network name and password to make a QR code."}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primaryBtnClass}
          disabled={!ready}
          onClick={() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const url = canvasPngDataUrl(canvas);
            if (!url) return;
            const a = document.createElement("a");
            a.href = url;
            a.download = "wifi-qr.png";
            a.click();
          }}
        >
          {da ? "Download PNG" : "Download PNG"}
        </button>
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => {
            setSsid("");
            setPassword("");
            setHidden(false);
          }}
        >
          {da ? "Ryd" : "Clear"}
        </button>
      </div>
      <p className="text-xs text-muted">
        {da
          ? "QR-koden laves i din browser. Gæster scanner den for at forbinde."
          : "The QR code is made in your browser. Guests scan it to connect."}
      </p>
    </div>
  );
}
