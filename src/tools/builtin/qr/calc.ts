import { qrcodegen } from "./qrcodegen";
import {
  buildWifiQrPayload,
  type WifiSecurity,
} from "../wifiqr/calc";

const { QrCode } = qrcodegen;

export const QR_MAX_TEXT = 2000;
export const QR_DEFAULT_MARGIN = 2;
export const QR_DEFAULT_SCALE = 8;

export type QrEcc = "L" | "M" | "Q" | "H";
export type QrContentType =
  | "url"
  | "text"
  | "wifi"
  | "email"
  | "phone"
  | "sms"
  | "vcard"
  | "geo"
  | "event";

export type QrRenderOptions = {
  text: string;
  ecc?: QrEcc;
  scale?: number;
  margin?: number;
  foreground?: string;
  background?: string;
  transparentBg?: boolean;
  /** When set, drawn centered with a light pad. Prefer ECC H. */
  logo?: HTMLImageElement | ImageBitmap | null;
  logoScale?: number;
};

const ECC_MAP: Record<QrEcc, qrcodegen.QrCode.Ecc> = {
  L: QrCode.Ecc.LOW,
  M: QrCode.Ecc.MEDIUM,
  Q: QrCode.Ecc.QUARTILE,
  H: QrCode.Ecc.HIGH,
};

export function eccLabel(level: QrEcc, da: boolean): string {
  const pct = { L: "7%", M: "15%", Q: "25%", H: "30%" }[level];
  if (da) {
    return `${level} (ca. ${pct} genopretning)`;
  }
  return `${level} (~${pct} recovery)`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Local datetime as YYYYMMDDTHHMMSS (no Z) for calendar apps. */
export function toIcsLocal(isoLocal: string): string | null {
  const trimmed = isoLocal.trim();
  if (!trimmed) return null;
  const match = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (!match) return null;
  const [, y, mo, d, h = "00", mi = "00", s = "00"] = match;
  return `${y}${mo}${d}T${h}${mi}${s}`;
}

export function buildEmailPayload(opts: {
  to: string;
  subject?: string;
  body?: string;
}): string | null {
  const to = opts.to.trim();
  if (!to) return null;
  const params = new URLSearchParams();
  if (opts.subject?.trim()) params.set("subject", opts.subject.trim());
  if (opts.body?.trim()) params.set("body", opts.body.trim());
  const query = params.toString();
  return query ? `mailto:${to}?${query}` : `mailto:${to}`;
}

export function buildSmsPayload(opts: {
  number: string;
  body?: string;
}): string | null {
  const number = opts.number.trim().replace(/\s+/g, "");
  if (!number) return null;
  const body = opts.body?.trim();
  if (body) {
    return `sms:${number}?body=${encodeURIComponent(body)}`;
  }
  return `sms:${number}`;
}

export function buildPhonePayload(number: string): string | null {
  const cleaned = number.trim().replace(/\s+/g, "");
  if (!cleaned) return null;
  return `tel:${cleaned}`;
}

export function buildGeoPayload(opts: {
  lat: string;
  lng: string;
}): string | null {
  const lat = Number(opts.lat.replace(",", "."));
  const lng = Number(opts.lng.replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return `geo:${lat},${lng}`;
}

export function buildVcardPayload(opts: {
  firstName: string;
  lastName: string;
  org?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
}): string | null {
  const first = opts.firstName.trim();
  const last = opts.lastName.trim();
  if (!first && !last) return null;
  const full = [first, last].filter(Boolean).join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${first};;;`,
    `FN:${full}`,
  ];
  if (opts.org?.trim()) lines.push(`ORG:${opts.org.trim()}`);
  if (opts.title?.trim()) lines.push(`TITLE:${opts.title.trim()}`);
  if (opts.phone?.trim()) lines.push(`TEL;TYPE=CELL:${opts.phone.trim()}`);
  if (opts.email?.trim()) lines.push(`EMAIL:${opts.email.trim()}`);
  if (opts.url?.trim()) lines.push(`URL:${opts.url.trim()}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export function buildEventPayload(opts: {
  title: string;
  start: string;
  end?: string;
  location?: string;
  description?: string;
}): string | null {
  const title = opts.title.trim();
  const start = toIcsLocal(opts.start);
  if (!title || !start) return null;
  const end = opts.end?.trim() ? toIcsLocal(opts.end) : null;
  const lines = [
    "BEGIN:VEVENT",
    `SUMMARY:${escapeIcsText(title)}`,
    `DTSTART:${start}`,
  ];
  if (end) lines.push(`DTEND:${end}`);
  if (opts.location?.trim()) {
    lines.push(`LOCATION:${escapeIcsText(opts.location.trim())}`);
  }
  if (opts.description?.trim()) {
    lines.push(`DESCRIPTION:${escapeIcsText(opts.description.trim())}`);
  }
  lines.push("END:VEVENT");
  return lines.join("\n");
}

export function buildUrlOrTextPayload(value: string, asUrl: boolean): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!asUrl) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[\w.-]+(\/|\?|#|$)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function buildContentPayload(
  type: QrContentType,
  fields: Record<string, string>,
  wifi: {
    ssid: string;
    password: string;
    security: WifiSecurity;
    hidden: boolean;
  },
): string | null {
  switch (type) {
    case "url":
      return buildUrlOrTextPayload(fields.text ?? "", true);
    case "text":
      return buildUrlOrTextPayload(fields.text ?? "", false);
    case "wifi":
      return buildWifiQrPayload(wifi);
    case "email":
      return buildEmailPayload({
        to: fields.to ?? "",
        subject: fields.subject,
        body: fields.body,
      });
    case "phone":
      return buildPhonePayload(fields.phone ?? "");
    case "sms":
      return buildSmsPayload({
        number: fields.phone ?? "",
        body: fields.body,
      });
    case "vcard":
      return buildVcardPayload({
        firstName: fields.firstName ?? "",
        lastName: fields.lastName ?? "",
        org: fields.org,
        title: fields.title,
        phone: fields.phone,
        email: fields.email,
        url: fields.url,
      });
    case "geo":
      return buildGeoPayload({
        lat: fields.lat ?? "",
        lng: fields.lng ?? "",
      });
    case "event":
      return buildEventPayload({
        title: fields.title ?? "",
        start: fields.start ?? "",
        end: fields.end,
        location: fields.location,
        description: fields.description,
      });
    default:
      return null;
  }
}

export function encodeQr(
  text: string,
  ecc: QrEcc = "M",
): qrcodegen.QrCode | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > QR_MAX_TEXT) return null;
  try {
    return QrCode.encodeText(trimmed, ECC_MAP[ecc] ?? QrCode.Ecc.MEDIUM);
  } catch {
    return null;
  }
}

function normalizeHex(color: string, fallback: string): string {
  const value = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const r = value[1];
    const g = value[2];
    const b = value[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return fallback;
}

export function drawQrOnCanvas(
  canvas: HTMLCanvasElement,
  options: QrRenderOptions,
): boolean {
  const ecc = options.logo ? "H" : (options.ecc ?? "M");
  const qr = encodeQr(options.text, ecc);
  if (!qr) return false;

  const scale = Math.max(2, Math.min(24, options.scale ?? QR_DEFAULT_SCALE));
  const margin = Math.max(0, Math.min(8, options.margin ?? QR_DEFAULT_MARGIN));
  const modules = qr.size;
  const pixels = (modules + margin * 2) * scale;
  canvas.width = pixels;
  canvas.height = pixels;

  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const fg = normalizeHex(options.foreground ?? "#111111", "#111111");
  const bg = normalizeHex(options.background ?? "#ffffff", "#ffffff");

  ctx.clearRect(0, 0, pixels, pixels);
  if (!options.transparentBg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, pixels, pixels);
  }

  ctx.fillStyle = fg;
  for (let y = 0; y < modules; y += 1) {
    for (let x = 0; x < modules; x += 1) {
      if (qr.getModule(x, y)) {
        ctx.fillRect((x + margin) * scale, (y + margin) * scale, scale, scale);
      }
    }
  }

  const logo = options.logo;
  if (logo && logo.width > 0 && logo.height > 0) {
    const logoScale = Math.min(0.32, Math.max(0.12, options.logoScale ?? 0.22));
    const logoBox = pixels * logoScale;
    const pad = Math.max(4, scale);
    const box = logoBox + pad * 2;
    const left = (pixels - box) / 2;
    const top = (pixels - box) / 2;

    ctx.fillStyle = options.transparentBg ? "#ffffff" : bg;
    const radius = Math.max(6, scale);
    roundRect(ctx, left, top, box, box, radius);
    ctx.fill();

    const ratio = Math.min(logoBox / logo.width, logoBox / logo.height);
    const w = logo.width * ratio;
    const h = logo.height * ratio;
    ctx.drawImage(logo, (pixels - w) / 2, (pixels - h) / 2, w, h);
  }

  return true;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function qrToSvg(options: QrRenderOptions): string | null {
  const ecc = options.logo ? "H" : (options.ecc ?? "M");
  const qr = encodeQr(options.text, ecc);
  if (!qr) return null;

  const margin = Math.max(0, Math.min(8, options.margin ?? QR_DEFAULT_MARGIN));
  const modules = qr.size;
  const size = modules + margin * 2;
  const fg = normalizeHex(options.foreground ?? "#111111", "#111111");
  const bg = normalizeHex(options.background ?? "#ffffff", "#ffffff");

  const parts: string[] = [];
  if (!options.transparentBg) {
    parts.push(
      `<rect width="${size}" height="${size}" fill="${bg}"/>`,
    );
  }
  for (let y = 0; y < modules; y += 1) {
    for (let x = 0; x < modules; x += 1) {
      if (qr.getModule(x, y)) {
        parts.push(
          `<rect x="${x + margin}" y="${y + margin}" width="1" height="1"/>`,
        );
      }
    }
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`,
    `<g fill="${fg}">`,
    ...parts,
    `</g>`,
    `</svg>`,
  ].join("");
}

export function canvasPngDataUrl(canvas: HTMLCanvasElement): string | null {
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export function downloadTextFile(
  text: string,
  filename: string,
  mime = "image/svg+xml",
) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadFilename(type: QrContentType): string {
  const map: Record<QrContentType, string> = {
    url: "qr-url",
    text: "qr-text",
    wifi: "qr-wifi",
    email: "qr-email",
    phone: "qr-phone",
    sms: "qr-sms",
    vcard: "qr-contact",
    geo: "qr-location",
    event: "qr-event",
  };
  return map[type] ?? "qr-code";
}

export { type WifiSecurity };
