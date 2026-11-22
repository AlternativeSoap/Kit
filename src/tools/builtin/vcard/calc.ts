export type VcardInput = {
  name: string;
  org?: string;
  title?: string;
  phones?: string;
  email?: string;
  url?: string;
  address?: string;
  note?: string;
};

function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n");
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

function splitPhones(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;\n]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 4);
}

/** Build a vCard 3.0 (.vcf) string. Returns null if name is empty. */
export function buildVcard(input: VcardInput): string | null {
  const name = input.name.trim();
  if (!name) return null;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVcard(name)}`,
    `N:;${escapeVcard(name)};;;`,
  ];

  if (input.org?.trim()) {
    lines.push(`ORG:${escapeVcard(input.org.trim())}`);
  }
  if (input.title?.trim()) {
    lines.push(`TITLE:${escapeVcard(input.title.trim())}`);
  }

  const phones = splitPhones(input.phones);
  phones.forEach((phone, index) => {
    const type = index === 0 ? "CELL" : "VOICE";
    lines.push(`TEL;TYPE=${type}:${escapeVcard(phone)}`);
  });

  if (input.email?.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(input.email.trim())}`);
  }
  if (input.url?.trim()) {
    lines.push(`URL:${escapeVcard(input.url.trim())}`);
  }
  if (input.address?.trim()) {
    // ADR: PO Box; Extended; Street; City; Region; Postal; Country
    lines.push(
      `ADR;TYPE=HOME:;;${escapeVcard(input.address.trim())};;;;`,
    );
  }
  if (input.note?.trim()) {
    lines.push(`NOTE:${escapeVcard(input.note.trim())}`);
  }

  lines.push("END:VCARD");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function vcardFilename(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9æøåäöü]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${slug || "contact"}.vcf`;
}
