import { minutesBetweenClocks, parseClockToken } from "@/lib/answers/clock";

export type ArbejdstidResult = {
  startMinutes: number;
  endMinutes: number;
  breakMinutes: number;
  grossMinutes: number;
  netMinutes: number;
};

export function parseWorkTime(value: string): number | null {
  return parseClockToken(value.trim());
}

export function calculateArbejdstid(
  startRaw: string,
  endRaw: string,
  breakMinutes: number,
): ArbejdstidResult | null {
  const startMinutes = parseWorkTime(startRaw);
  const endMinutes = parseWorkTime(endRaw);
  if (startMinutes === null || endMinutes === null) return null;
  if (
    !Number.isFinite(breakMinutes) ||
    breakMinutes < 0 ||
    !Number.isInteger(breakMinutes)
  ) {
    return null;
  }

  const grossMinutes = minutesBetweenClocks(startMinutes, endMinutes);
  const netMinutes = Math.max(0, grossMinutes - breakMinutes);

  return {
    startMinutes,
    endMinutes,
    breakMinutes,
    grossMinutes,
    netMinutes,
  };
}

export function splitHoursMinutes(totalMinutes: number): {
  hours: number;
  minutes: number;
} {
  const safe = Math.max(0, Math.floor(totalMinutes));
  return { hours: Math.floor(safe / 60), minutes: safe % 60 };
}