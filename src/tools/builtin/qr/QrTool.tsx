"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitSelect,
  fieldClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useDictionary, useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import {
  buildContentPayload,
  canvasPngDataUrl,
  downloadDataUrl,
  downloadFilename,
  downloadTextFile,
  drawQrOnCanvas,
  eccLabel,
  qrToSvg,
  type QrContentType,
  type QrEcc,
  type WifiSecurity,
} from "./calc";

const CONTENT_TYPES: readonly QrContentType[] = [
  "url",
  "text",
  "wifi",
  "email",
  "phone",
  "sms",
  "vcard",
  "geo",
  "event",
];

const ECC_LEVELS: readonly QrEcc[] = ["L", "M", "Q", "H"];

const PRESETS = [
  { fg: "#111111", bg: "#ffffff" },
  { fg: "#0f766e", bg: "#ecfdf5" },
  { fg: "#1d4ed8", bg: "#eff6ff" },
  { fg: "#9a3412", bg: "#fff7ed" },
  { fg: "#ffffff", bg: "#111111" },
] as const;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

export function QrTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const { locale } = useLanguage();
  const da = locale === "da";
  const t = dictionary.qr;

  const initialType =
    prefillChoice(prefill, "mode", ["text", "wifi"] as const) === "wifi"
      ? "wifi"
      : prefillChoice(prefill, "type", CONTENT_TYPES) ?? "url";

  const [type, setType] = useState<QrContentType>(initialType);
  const [fields, setFields] = useState<Record<string, string>>(() => ({
    text: prefill?.text?.trim() || prefill?.value?.trim() || "https://",
    to: prefill?.to ?? "",
    subject: prefill?.subject ?? "",
    body: prefill?.body ?? "",
    phone: prefill?.phone ?? "",
    firstName: prefill?.firstName ?? "",
    lastName: prefill?.lastName ?? "",
    org: prefill?.org ?? "",
    title: prefill?.title ?? "",
    email: prefill?.email ?? "",
    url: prefill?.url ?? "",
    lat: prefill?.lat ?? "",
    lng: prefill?.lng ?? "",
    start: prefill?.start ?? "",
    end: prefill?.end ?? "",
    location: prefill?.location ?? "",
    description: prefill?.description ?? "",
  }));

  const [ssid, setSsid] = useState(prefill?.ssid ?? "");
  const [password, setPassword] = useState(prefill?.password ?? "");
  const [security, setSecurity] = useState<WifiSecurity>(
    prefillChoice(prefill, "security", ["WPA", "WEP", "nopass"] as const) ??
      "WPA",
  );
  const [hidden, setHidden] = useState(prefill?.hidden === "1");

  const [ecc, setEcc] = useState<QrEcc>(
    prefillChoice(prefill, "ecc", ECC_LEVELS) ?? "M",
  );
  const [foreground, setForeground] = useState("#111111");
  const [background, setBackground] = useState("#ffffff");
  const [transparentBg, setTransparentBg] = useState(false);
  const [scale, setScale] = useState(10);
  const [margin, setMargin] = useState(2);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const setField = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const payload = useMemo(
    () =>
      buildContentPayload(type, fields, {
        ssid,
        password,
        security,
        hidden,
      }),
    [type, fields, ssid, password, security, hidden],
  );

  const effectiveEcc: QrEcc = logo ? "H" : ecc;

  const typeLabel = (id: QrContentType): string => {
    const labels: Record<QrContentType, [string, string]> = {
      url: ["Link", "URL"],
      text: ["Tekst", "Text"],
      wifi: ["Wi‑Fi", "Wi‑Fi"],
      email: ["E-mail", "Email"],
      phone: ["Telefon", "Phone"],
      sms: ["SMS", "SMS"],
      vcard: ["Kontakt", "Contact"],
      geo: ["Sted", "Location"],
      event: ["Kalender", "Event"],
    };
    return da ? labels[id][0] : labels[id][1];
  };

  const emptyHint = (): string => {
    if (type === "wifi") {
      return da
        ? "Udfyld netværksnavn (og kode, hvis nettet er beskyttet)."
        : "Enter the network name (and password if the network is protected).";
    }
    if (type === "vcard") {
      return da
        ? "Angiv mindst fornavn eller efternavn."
        : "Enter at least a first or last name.";
    }
    if (type === "event") {
      return da
        ? "Angiv titel og starttidspunkt."
        : "Enter a title and start time.";
    }
    return t.empty;
  };

  const repaint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) {
      setReady(false);
      return;
    }
    setReady(
      drawQrOnCanvas(canvas, {
        text: payload,
        ecc: effectiveEcc,
        scale,
        margin,
        foreground,
        background,
        transparentBg,
        logo,
        logoScale: 0.22,
      }),
    );
  }, [
    payload,
    effectiveEcc,
    scale,
    margin,
    foreground,
    background,
    transparentBg,
    logo,
  ]);

  useEffect(() => {
    repaint();
  }, [repaint]);

  const onLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError(
        da ? "Vælg en billedfil (PNG eller JPG)." : "Choose an image file (PNG or JPG).",
      );
      return;
    }
    try {
      const img = await loadImage(file);
      setLogo(img);
      setLogoName(file.name);
      setLogoError(null);
      setEcc("H");
    } catch {
      setLogoError(da ? "Kunne ikke læse billedet." : "Could not read the image.");
    }
  };

  const clearLogo = () => {
    setLogo(null);
    setLogoName(null);
    setLogoError(null);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const url = canvasPngDataUrl(canvas);
    if (!url) return;
    downloadDataUrl(url, `${downloadFilename(type)}.png`);
  };

  const downloadSvg = () => {
    if (!payload) return;
    const svg = qrToSvg({
      text: payload,
      ecc: effectiveEcc,
      margin,
      foreground,
      background,
      transparentBg,
    });
    if (!svg) return;
    downloadTextFile(svg, `${downloadFilename(type)}.svg`);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            {t.contentType}
          </p>
          <div className="kit-h-scroll gap-2">
            {CONTENT_TYPES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setType(id)}
                className={`kit-touch-target shrink-0 rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
                  type === id
                    ? "border-accent bg-accent text-on-accent"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {typeLabel(id)}
              </button>
            ))}
          </div>
        </div>

        {type === "url" || type === "text" ? (
          <Field label={type === "url" ? t.url : t.text}>
            <textarea
              value={fields.text}
              onChange={(e) => setField("text", e.target.value)}
              rows={type === "url" ? 2 : 5}
              className={fieldClass}
              placeholder={type === "url" ? "https://" : undefined}
            />
          </Field>
        ) : null}

        {type === "wifi" ? (
          <div className="space-y-4">
            <Field label="SSID">
              <input
                className={fieldClass}
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field label={t.security}>
              <KitSelect
                value={security}
                onChange={(e) => setSecurity(e.target.value as WifiSecurity)}
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">{t.openNetwork}</option>
              </KitSelect>
            </Field>
            {security !== "nopass" ? (
              <Field label={t.password}>
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
                className="h-4 w-4 rounded border-border accent-[var(--accent)]"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
              />
              {t.hiddenNetwork}
            </label>
          </div>
        ) : null}

        {type === "email" ? (
          <div className="space-y-4">
            <Field label={t.emailTo}>
              <input
                type="email"
                className={fieldClass}
                value={fields.to}
                onChange={(e) => setField("to", e.target.value)}
              />
            </Field>
            <Field label={t.emailSubject}>
              <input
                className={fieldClass}
                value={fields.subject}
                onChange={(e) => setField("subject", e.target.value)}
              />
            </Field>
            <Field label={t.emailBody}>
              <textarea
                rows={4}
                className={fieldClass}
                value={fields.body}
                onChange={(e) => setField("body", e.target.value)}
              />
            </Field>
          </div>
        ) : null}

        {type === "phone" || type === "sms" ? (
          <div className="space-y-4">
            <Field label={t.phone}>
              <input
                type="tel"
                className={fieldClass}
                value={fields.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+45 …"
              />
            </Field>
            {type === "sms" ? (
              <Field label={t.smsBody}>
                <textarea
                  rows={3}
                  className={fieldClass}
                  value={fields.body}
                  onChange={(e) => setField("body", e.target.value)}
                />
              </Field>
            ) : null}
          </div>
        ) : null}

        {type === "vcard" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.firstName}>
              <input
                className={fieldClass}
                value={fields.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
              />
            </Field>
            <Field label={t.lastName}>
              <input
                className={fieldClass}
                value={fields.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
              />
            </Field>
            <Field label={t.org}>
              <input
                className={fieldClass}
                value={fields.org}
                onChange={(e) => setField("org", e.target.value)}
              />
            </Field>
            <Field label={t.jobTitle}>
              <input
                className={fieldClass}
                value={fields.title}
                onChange={(e) => setField("title", e.target.value)}
              />
            </Field>
            <Field label={t.phone}>
              <input
                className={fieldClass}
                value={fields.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </Field>
            <Field label={t.email}>
              <input
                type="email"
                className={fieldClass}
                value={fields.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t.website}>
                <input
                  className={fieldClass}
                  value={fields.url}
                  onChange={(e) => setField("url", e.target.value)}
                  placeholder="https://"
                />
              </Field>
            </div>
          </div>
        ) : null}

        {type === "geo" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.latitude}>
              <input
                className={fieldClass}
                value={fields.lat}
                onChange={(e) => setField("lat", e.target.value)}
                placeholder="55.6761"
              />
            </Field>
            <Field label={t.longitude}>
              <input
                className={fieldClass}
                value={fields.lng}
                onChange={(e) => setField("lng", e.target.value)}
                placeholder="12.5683"
              />
            </Field>
          </div>
        ) : null}

        {type === "event" ? (
          <div className="space-y-4">
            <Field label={t.eventTitle}>
              <input
                className={fieldClass}
                value={fields.title}
                onChange={(e) => setField("title", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.eventStart} hint={t.eventTimeHint}>
                <input
                  type="datetime-local"
                  className={fieldClass}
                  value={fields.start}
                  onChange={(e) => setField("start", e.target.value)}
                />
              </Field>
              <Field label={t.eventEnd}>
                <input
                  type="datetime-local"
                  className={fieldClass}
                  value={fields.end}
                  onChange={(e) => setField("end", e.target.value)}
                />
              </Field>
            </div>
            <Field label={t.eventLocation}>
              <input
                className={fieldClass}
                value={fields.location}
                onChange={(e) => setField("location", e.target.value)}
              />
            </Field>
            <Field label={t.eventDescription}>
              <textarea
                rows={3}
                className={fieldClass}
                value={fields.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </Field>
          </div>
        ) : null}

        <section className="space-y-4 rounded-[12px] border border-border bg-surface px-4 py-4">
          <h2 className="text-sm font-medium text-foreground">{t.design}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.foreground}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
                  aria-label={t.foreground}
                />
                <input
                  className={`${fieldClass} font-mono`}
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  spellCheck={false}
                />
              </div>
            </Field>
            <Field label={t.background}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  disabled={transparentBg}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-[10px] border border-border bg-surface p-1 disabled:opacity-40"
                  aria-label={t.background}
                />
                <input
                  className={`${fieldClass} font-mono`}
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  disabled={transparentBg}
                  spellCheck={false}
                />
              </div>
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={`${preset.fg}-${preset.bg}`}
                type="button"
                title={da ? "Farvepalet" : "Color preset"}
                onClick={() => {
                  setForeground(preset.fg);
                  setBackground(preset.bg);
                  setTransparentBg(false);
                }}
                className="kit-touch-target inline-flex h-9 w-9 items-center justify-center rounded-full border border-border sm:min-h-0 sm:min-w-0"
                style={{
                  background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
                }}
              />
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-[var(--accent)]"
              checked={transparentBg}
              onChange={(e) => setTransparentBg(e.target.checked)}
            />
            {t.transparentBg}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.errorCorrection} hint={logo ? t.logoForcesH : t.eccHint}>
              <KitSelect
                value={effectiveEcc}
                disabled={Boolean(logo)}
                onChange={(e) => setEcc(e.target.value as QrEcc)}
              >
                {ECC_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {eccLabel(level, da)}
                  </option>
                ))}
              </KitSelect>
            </Field>
            <Field label={t.size}>
              <input
                type="range"
                min={4}
                max={16}
                step={1}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="kit-range w-full accent-[var(--accent)]"
              />
            </Field>
          </div>

          <Field label={t.quietZone}>
            <input
              type="range"
              min={0}
              max={6}
              step={1}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="kit-range w-full accent-[var(--accent)]"
            />
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t.logo}</p>
            <p className="text-xs text-muted">{t.logoHint}</p>
            <div className="flex flex-wrap items-center gap-2">
              <label className={`${secondaryBtnClass} cursor-pointer`}>
                {t.uploadLogo}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => void onLogo(e)}
                />
              </label>
              {logo ? (
                <button type="button" className={secondaryBtnClass} onClick={clearLogo}>
                  {t.removeLogo}
                </button>
              ) : null}
              {logoName ? (
                <span className="truncate text-xs text-muted">{logoName}</span>
              ) : null}
            </div>
            {logoError ? (
              <p className="text-sm text-foreground" role="alert">
                {logoError}
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="space-y-4 lg:sticky lg:top-[calc(var(--kit-chrome-offset)+0.75rem)] lg:self-start">
        <div className="flex flex-col items-center gap-3 rounded-[12px] border border-border bg-surface px-4 py-6">
          <canvas
            ref={canvasRef}
            className="max-h-[min(22rem,70vw)] max-w-full rounded-[8px] border border-border"
            style={{
              background: transparentBg
                ? "repeating-conic-gradient(#e8e8e8 0% 25%, #fff 0% 50%) 50% / 16px 16px"
                : background,
            }}
            aria-label={t.preview}
          />
          {!ready ? (
            <p className="text-center text-sm text-muted">{emptyHint()}</p>
          ) : (
            <p className="text-center text-xs text-muted">
              {t.modulesHint.replace("{ecc}", effectiveEcc)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadPng}
            disabled={!ready}
            className={primaryBtnClass}
          >
            {t.downloadPng}
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            disabled={!ready}
            className={secondaryBtnClass}
          >
            {t.downloadSvg}
          </button>
          {payload?.trim() ? (
            <CopyButton
              value={payload.trim()}
              label={t.copy}
              copiedLabel={t.copied}
            />
          ) : null}
        </div>

        {logo && ready ? (
          <p className="text-xs text-muted">{t.logoSvgNote}</p>
        ) : null}

        <p className="text-xs text-muted">{t.disclaimer}</p>
      </div>
    </div>
  );
}
