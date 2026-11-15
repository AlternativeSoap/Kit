import {
  calculateCidr,
  parseCidrInput,
  type CidrResult,
} from "@/tools/builtin/cidr/calc";

export type CidrAnswer = {
  kind: "cidr";
  input: string;
  result: CidrResult;
};

export function parseCidr(query: string): CidrAnswer | null {
  const trimmed = query.trim();
  if (!parseCidrInput(trimmed)) return null;
  const result = calculateCidr(trimmed);
  if (!result) return null;
  return { kind: "cidr", input: trimmed, result };
}