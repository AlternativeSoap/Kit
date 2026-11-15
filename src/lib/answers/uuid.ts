/** UUID format recognition (any version that matches the shape). */

export type UuidAnswer = {
  kind: "uuid";
  value: string;
  version: number | null;
  variant: string;
};

const UUID_RE =
  /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i;

export function parseUuid(query: string): UuidAnswer | null {
  const trimmed = query.trim();
  const match = UUID_RE.exec(trimmed);
  if (!match) return null;
  const value = trimmed.toLowerCase();
  const versionChar = match[3]![0]!;
  const version = Number.parseInt(versionChar, 16);
  const variantNibble = Number.parseInt(match[4]![0]!, 16);
  let variant = "unknown";
  if (variantNibble >= 8 && variantNibble <= 11) variant = "RFC 4122";
  else if (variantNibble >= 12) variant = "Microsoft";
  else variant = "NCS";
  return {
    kind: "uuid",
    value,
    version: Number.isFinite(version) ? version : null,
    variant,
  };
}
