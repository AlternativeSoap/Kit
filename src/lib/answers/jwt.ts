import { decodeJwt, looksLikeJwt } from "@/tools/builtin/jwt/calc";

export type JwtAnswer = {
  kind: "jwt";
  token: string;
  alg: string | null;
  typ: string | null;
};

export function parseJwt(query: string): JwtAnswer | null {
  const trimmed = query.trim();
  if (!looksLikeJwt(trimmed)) return null;
  const decoded = decodeJwt(trimmed);
  if (!decoded) return null;
  return {
    kind: "jwt",
    token: trimmed,
    alg: decoded.alg,
    typ: decoded.typ,
  };
}