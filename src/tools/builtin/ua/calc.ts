export type UaInfo = {
  browser: string;
  engine: string;
  os: string;
  device: string;
  mobile: boolean;
};

export function parseUserAgent(ua: string): UaInfo {
  const text = ua.trim();
  if (!text) {
    return {
      browser: "—",
      engine: "—",
      os: "—",
      device: "—",
      mobile: false,
    };
  }

  let browser = "Unknown";
  if (/Edg\//.test(text)) browser = `Edge ${(/Edg\/([\d.]+)/.exec(text)?.[1] ?? "").split(".")[0]}`.trim();
  else if (/OPR\//.test(text) || /Opera/.test(text))
    browser = `Opera ${(/OPR\/([\d.]+)/.exec(text)?.[1] ?? "").split(".")[0]}`.trim();
  else if (/Chrome\//.test(text) && !/Chromium/.test(text))
    browser = `Chrome ${(/Chrome\/([\d.]+)/.exec(text)?.[1] ?? "").split(".")[0]}`.trim();
  else if (/Firefox\//.test(text))
    browser = `Firefox ${(/Firefox\/([\d.]+)/.exec(text)?.[1] ?? "").split(".")[0]}`.trim();
  else if (/Safari\//.test(text) && /Version\//.test(text))
    browser = `Safari ${(/Version\/([\d.]+)/.exec(text)?.[1] ?? "").split(".")[0]}`.trim();

  let engine = "Unknown";
  if (/AppleWebKit\//.test(text)) engine = "WebKit / Blink";
  else if (/Gecko\//.test(text) && /Firefox\//.test(text)) engine = "Gecko";
  else if (/Trident\//.test(text)) engine = "Trident";

  let os = "Unknown";
  if (/Windows NT 10/.test(text)) os = "Windows 10/11";
  else if (/Windows NT 6\.3/.test(text)) os = "Windows 8.1";
  else if (/Windows NT 6\.1/.test(text)) os = "Windows 7";
  else if (/Mac OS X ([\d_]+)/.test(text)) {
    const ver = /Mac OS X ([\d_]+)/.exec(text)?.[1]?.replace(/_/g, ".") ?? "";
    os = `macOS ${ver}`;
  } else if (/Android ([\d.]+)/.test(text))
    os = `Android ${/Android ([\d.]+)/.exec(text)?.[1] ?? ""}`.trim();
  else if (/iPhone|iPad|iPod/.test(text)) {
    const ver = /OS ([\d_]+)/.exec(text)?.[1]?.replace(/_/g, ".") ?? "";
    os = `iOS ${ver}`.trim();
  } else if (/Linux/.test(text)) os = "Linux";
  else if (/CrOS/.test(text)) os = "Chrome OS";

  const mobile = /Mobile|Android|iPhone|iPad|iPod/.test(text);
  let device = "Desktop";
  if (/iPad|Tablet/.test(text)) device = "Tablet";
  else if (mobile) device = "Phone";

  return { browser, engine, os, device, mobile };
}
