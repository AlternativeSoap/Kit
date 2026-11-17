export type WifiSecurity = "WPA" | "WEP" | "nopass";

/** Escape special chars for WIFI: QR payloads. */
export function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildWifiQrPayload(opts: {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden?: boolean;
}): string | null {
  const ssid = opts.ssid.trim();
  if (!ssid) return null;
  const security = opts.security;
  const password =
    security === "nopass" ? "" : escapeWifiValue(opts.password);
  if (security !== "nopass" && !opts.password) return null;
  const hidden = opts.hidden ? "H:true;" : "";
  return `WIFI:T:${security};S:${escapeWifiValue(ssid)};P:${password};${hidden};`;
}
