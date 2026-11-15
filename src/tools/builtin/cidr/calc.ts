export type CidrResult = {
  input: string;
  address: string;
  prefix: number;
  network: string;
  broadcast: string;
  firstUsable: string | null;
  lastUsable: string | null;
  hostCount: number;
  netmask: string;
  wildcard: string;
};

const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

const CIDR_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\/(\d{1,2})$/;

function ipToInt(ip: string): number | null {
  if (!IPV4_RE.test(ip)) return null;
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return null;
  }
  return (
    ((parts[0]! << 24) >>> 0) +
    ((parts[1]! << 16) >>> 0) +
    ((parts[2]! << 8) >>> 0) +
    (parts[3]! >>> 0)
  );
}

function intToIp(value: number): string {
  const v = value >>> 0;
  return [
    (v >>> 24) & 255,
    (v >>> 16) & 255,
    (v >>> 8) & 255,
    v & 255,
  ].join(".");
}

export function parseCidrInput(raw: string): { address: string; prefix: number } | null {
  const trimmed = raw.trim();
  const direct = CIDR_RE.exec(trimmed);
  if (direct) {
    const prefix = Number(direct[1]);
    if (prefix < 0 || prefix > 32) return null;
    const address = trimmed.slice(0, trimmed.indexOf("/"));
    return { address, prefix };
  }
  const slash = trimmed.split(/\s+/);
  if (slash.length === 2 && IPV4_RE.test(slash[0]!) && /^\d{1,2}$/.test(slash[1]!)) {
    const prefix = Number(slash[1]);
    if (prefix < 0 || prefix > 32) return null;
    return { address: slash[0]!, prefix };
  }
  return null;
}

export function calculateCidr(raw: string): CidrResult | null {
  const parsed = parseCidrInput(raw);
  if (!parsed) return null;

  const ipInt = ipToInt(parsed.address);
  if (ipInt === null) return null;

  const prefix = parsed.prefix;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;

  let firstUsable: string | null = null;
  let lastUsable: string | null = null;
  let hostCount = 0;

  if (prefix <= 30) {
    firstUsable = intToIp(network + 1);
    lastUsable = intToIp(broadcast - 1);
    hostCount = Math.max(0, 2 ** (32 - prefix) - 2);
  } else if (prefix === 31) {
    firstUsable = intToIp(network);
    lastUsable = intToIp(broadcast);
    hostCount = 2;
  } else {
    firstUsable = intToIp(network);
    lastUsable = intToIp(network);
    hostCount = 1;
  }

  return {
    input: raw.trim(),
    address: parsed.address,
    prefix,
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstUsable,
    lastUsable,
    hostCount,
    netmask: intToIp(mask),
    wildcard: intToIp(wildcard),
  };
}