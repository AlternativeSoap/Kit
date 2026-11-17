function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Format a local datetime-local value as floating ICS local time. */
export function toIcsLocal(datetimeLocal: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(datetimeLocal);
  if (!m) return null;
  return `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}00`;
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n");
}

export function buildIcs(opts: {
  title: string;
  startLocal: string;
  endLocal: string;
  location?: string;
  description?: string;
}): string | null {
  const dtStart = toIcsLocal(opts.startLocal);
  const dtEnd = toIcsLocal(opts.endLocal);
  const title = opts.title.trim();
  if (!dtStart || !dtEnd || !title) return null;
  if (dtEnd <= dtStart) return null;
  const stamp = new Date();
  const dtStamp = `${stamp.getUTCFullYear()}${pad(stamp.getUTCMonth() + 1)}${pad(stamp.getUTCDate())}T${pad(stamp.getUTCHours())}${pad(stamp.getUTCMinutes())}${pad(stamp.getUTCSeconds())}Z`;
  const uid = `${dtStamp}-${Math.random().toString(36).slice(2, 10)}@kit.local`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kit//ICS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(title)}`,
  ];
  if (opts.location?.trim()) {
    lines.push(`LOCATION:${escapeText(opts.location.trim())}`);
  }
  if (opts.description?.trim()) {
    lines.push(`DESCRIPTION:${escapeText(opts.description.trim())}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
