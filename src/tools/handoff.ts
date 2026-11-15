/**
 * Typed handoff helpers on top of URL prefill. Destinations validate and fall
 * back to defaults when values are missing or invalid.
 */
import {
  prefillChoice,
  prefillFlag,
  prefillNumber,
  toolHref,
  type ToolPrefill,
} from "./prefill";

export { toolHref, type ToolPrefill };

export type HandoffMoments = {
  amount?: number;
  mode?: "add" | "remove";
  rate?: number;
};

export type HandoffProcent = {
  mode?: "of" | "change" | "share";
  a?: number;
  b?: number;
};

export type HandoffEnheder = {
  category?: string;
  value?: number;
  from?: string;
  to?: string;
};

export type HandoffDato = {
  start?: string;
  end?: string;
  offset?: number;
  business?: boolean;
};

export type HandoffLon = {
  mode?: "monthly" | "hourly";
  gross?: number;
  rate?: number;
};

export type HandoffCountdown = {
  hours?: number;
  minutes?: number;
  seconds?: number;
  takt?: number;
  demand?: number;
  available?: number;
};

export type HandoffPassword = {
  length?: number;
};

export type HandoffLommeregner = {
  value?: number;
  mode?: "simple" | "advanced";
  formula?: string;
};

export type HandoffLadmeter = {
  length?: number;
  width?: number;
  height?: number;
  pallets?: number;
};

export type HandoffBarsel = {
  start?: string;
  weeks?: number;
};

export function momsHref(values: HandoffMoments): string {
  return toolHref("moms", {
    amount: values.amount,
    mode: values.mode,
    rate: values.rate,
  });
}

export function procentHref(values: HandoffProcent): string {
  return toolHref("procent", {
    mode: values.mode,
    a: values.a,
    b: values.b,
  });
}

export function enhederHref(values: HandoffEnheder): string {
  return toolHref("enheder", {
    category: values.category,
    value: values.value,
    from: values.from,
    to: values.to,
  });
}

export function datoHref(values: HandoffDato): string {
  return toolHref("dato", {
    start: values.start,
    end: values.end,
    offset: values.offset,
    business: values.business,
  });
}

export function lonHref(values: HandoffLon): string {
  return toolHref("lon", {
    mode: values.mode,
    gross: values.gross,
    rate: values.rate,
  });
}

export function countdownHref(values: HandoffCountdown): string {
  return toolHref("countdown", {
    hours: values.hours,
    minutes: values.minutes,
    seconds: values.seconds,
    takt: values.takt,
    demand: values.demand,
    available: values.available,
  });
}

export function passwordHref(values: HandoffPassword): string {
  return toolHref("password", { length: values.length });
}

export function lommeregnerHref(values: HandoffLommeregner): string {
  return toolHref("lommeregner", {
    value: values.value,
    mode: values.mode,
    formula: values.formula,
  });
}

export function ladmeterHref(values: HandoffLadmeter): string {
  return toolHref("ladmeter", {
    length: values.length,
    width: values.width,
    height: values.height,
    pallets: values.pallets,
  });
}

export function barselHref(values: HandoffBarsel): string {
  return toolHref("barsel", {
    start: values.start,
    weeks: values.weeks,
  });
}

/** Read helpers used by destination tools. */
export const handoff = {
  number: prefillNumber,
  choice: prefillChoice,
  flag: prefillFlag,
} as const;
