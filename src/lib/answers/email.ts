/** Email recognition. Never opens a mail client or external site. */

export type EmailAnswer = {
  kind: "email";
  address: string;
  local: string;
  domain: string;
};

const EMAIL_RE =
  /^([a-z0-9.!#$%&'*+/=?^_`{|}~-]+)@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+)$/i;

export function parseEmail(query: string): EmailAnswer | null {
  const trimmed = query.trim();
  if (trimmed.length > 254 || trimmed.includes(" ")) return null;
  const match = EMAIL_RE.exec(trimmed);
  if (!match) return null;
  return {
    kind: "email",
    address: trimmed.toLowerCase(),
    local: match[1]!.toLowerCase(),
    domain: match[2]!.toLowerCase(),
  };
}
