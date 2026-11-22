export type RateMode = "average" | "total";

export type MeetingCostInput = {
  attendees: number;
  hourlyRate: number;
  rateMode: RateMode;
  hours: number;
  minutes: number;
  prepMinutes: number;
  weeklyMeetings: number;
};

export type MeetingCostResult = {
  durationMinutes: number;
  totalHourlyCost: number;
  totalCost: number;
  costPerMinute: number;
  yearlyCost: number | null;
};

export function calculateMeetingCost(
  input: MeetingCostInput,
): MeetingCostResult | null {
  const {
    attendees,
    hourlyRate,
    rateMode,
    hours,
    minutes,
    prepMinutes,
    weeklyMeetings,
  } = input;

  if (![attendees, hourlyRate, hours, minutes, prepMinutes, weeklyMeetings].every(
    Number.isFinite,
  )) {
    return null;
  }
  if (attendees < 1 || hourlyRate < 0) return null;
  if (hours < 0 || minutes < 0 || prepMinutes < 0) return null;
  if (weeklyMeetings < 0) return null;

  const meetingMinutes = hours * 60 + minutes;
  const durationMinutes = meetingMinutes + prepMinutes;
  if (durationMinutes <= 0) return null;

  const totalHourlyCost =
    rateMode === "total" ? hourlyRate : hourlyRate * attendees;
  const totalCost = totalHourlyCost * (durationMinutes / 60);
  const costPerMinute = totalCost / durationMinutes;
  const yearlyCost =
    weeklyMeetings > 0 ? totalCost * weeklyMeetings * 52 : null;

  return {
    durationMinutes,
    totalHourlyCost,
    totalCost,
    costPerMinute,
    yearlyCost,
  };
}
