import type { CountryId } from "./countries";
import type { PostnrRow } from "./data";

type ZippoPlace = {
  "place name": string;
  longitude: string;
  latitude: string;
  state: string;
  "state abbreviation"?: string;
};

type ZippoResponse = {
  "post code": string;
  country: string;
  "country abbreviation": string;
  places: ZippoPlace[];
};

function normalizeCode(country: CountryId, raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (country === "SE") {
    const digits = trimmed.replace(/\s+/g, "");
    if (!/^\d{5}$/.test(digits)) return null;
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }
  if (country === "DE") {
    const digits = trimmed.replace(/\D/g, "");
    return /^\d{5}$/.test(digits) ? digits : null;
  }
  if (country === "FI") {
    const digits = trimmed.replace(/\D/g, "");
    return /^\d{5}$/.test(digits) ? digits : null;
  }
  if (country === "IS" || country === "FO") {
    const digits = trimmed.replace(/\D/g, "");
    return /^\d{3}$/.test(digits) ? digits : null;
  }
  if (country === "GL") {
    const digits = trimmed.replace(/\D/g, "");
    return /^\d{4}$/.test(digits) ? digits : null;
  }
  // DK / NO: 4 digits
  const digits = trimmed.replace(/\D/g, "");
  return /^\d{4}$/.test(digits) ? digits : null;
}

export function looksLikePostcode(country: CountryId, query: string): boolean {
  return normalizeCode(country, query) !== null;
}

export async function lookupPostcode(
  country: CountryId,
  query: string,
  signal?: AbortSignal,
): Promise<PostnrRow[]> {
  const code = normalizeCode(country, query);
  if (!code) return [];

  const pathCode = encodeURIComponent(code);
  const url = `https://api.zippopotam.us/${country}/${pathCode}`;
  const res = await fetch(url, { signal });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
  const data = (await res.json()) as ZippoResponse;
  if (!data.places?.length) return [];

  return data.places.map((p, i) => {
    const region = p.state || p["state abbreviation"] || "—";
    return {
      id: `${country}-${data["post code"]}-${i}`,
      country,
      nr: data["post code"],
      name: p["place name"],
      region,
      kommune: region,
      lat: Number(p.latitude),
      lon: Number(p.longitude),
      pop: null,
      source: "api" as const,
    };
  });
}
