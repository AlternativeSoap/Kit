/** Extra Unicode points Helvetica WinAnsi can encode (smart quotes, dashes, euro…). */
const WIN_ANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160,
  0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

/** Helvetica/WinAnsi keeps ASCII + Latin-1 + common Word punctuation. */
export function toWinAnsiSafe(text: string): { text: string; dropped: boolean } {
  let dropped = false;
  let out = "";
  // Tabs are not encodable in WinAnsi, so expand them first.
  const source = text.replace(/\t/g, "    ");
  for (const ch of source) {
    const code = ch.codePointAt(0) ?? 0;
    if (code === 10 || code === 13) {
      out += ch;
      continue;
    }
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) {
      out += ch;
      continue;
    }
    if (WIN_ANSI_EXTRA.has(code)) {
      out += ch;
      continue;
    }
    dropped = true;
    out += "?";
  }
  return { text: out, dropped };
}
