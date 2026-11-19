export type EmissionFactors = {
  /** kg CO2e per car-km (average petrol/diesel mix). */
  carKgPerKm: number;
  /** kg CO2e per short/medium flight passenger (one-way average). */
  flightShortKg: number;
  /** kg CO2e per long-haul flight passenger (one-way average). */
  flightLongKg: number;
  /** kg CO2e per kWh electricity (DK grid rough). */
  electricityKgPerKwh: number;
  /** kg CO2e per kWh heat (district/gas blend rough). */
  heatingKgPerKwh: number;
};

export const DEFAULT_FACTORS: EmissionFactors = {
  carKgPerKm: 0.17,
  flightShortKg: 250,
  flightLongKg: 900,
  electricityKgPerKwh: 0.12,
  heatingKgPerKwh: 0.08,
};

/** Rough Danish lifestyle average used for comparison bars (tonnes CO2e / year). */
export const DK_AVERAGE_T_CO2E = 11;

export type DietPattern = "meatHeavy" | "average" | "flexitarian" | "vegetarian" | "vegan";

/** Rough food footprint tonnes CO2e / person / year by diet pattern. */
export const DIET_T_CO2E: Record<DietPattern, number> = {
  meatHeavy: 2.5,
  average: 1.8,
  flexitarian: 1.3,
  vegetarian: 1.0,
  vegan: 0.7,
};

export type KlimaInput = {
  carKmPerYear: number;
  flightsShort: number;
  flightsLong: number;
  diet: DietPattern;
  electricityKwhPerYear: number;
  heatingKwhPerYear: number;
  factors: EmissionFactors;
};

export type KlimaCategory = {
  id: "transport" | "food" | "home";
  kg: number;
};

export type KlimaResult = {
  categories: KlimaCategory[];
  totalKg: number;
  totalTonnes: number;
  largest: KlimaCategory["id"];
  vsDkAverageTonnes: number;
};

export function calculateKlima(input: KlimaInput): KlimaResult | null {
  const {
    carKmPerYear,
    flightsShort,
    flightsLong,
    diet,
    electricityKwhPerYear,
    heatingKwhPerYear,
    factors,
  } = input;

  const nums = [
    carKmPerYear,
    flightsShort,
    flightsLong,
    electricityKwhPerYear,
    heatingKwhPerYear,
    factors.carKgPerKm,
    factors.flightShortKg,
    factors.flightLongKg,
    factors.electricityKgPerKwh,
    factors.heatingKgPerKwh,
  ];
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (!(diet in DIET_T_CO2E)) return null;

  const transportKg =
    carKmPerYear * factors.carKgPerKm +
    flightsShort * factors.flightShortKg +
    flightsLong * factors.flightLongKg;
  const foodKg = DIET_T_CO2E[diet] * 1000;
  const homeKg =
    electricityKwhPerYear * factors.electricityKgPerKwh +
    heatingKwhPerYear * factors.heatingKgPerKwh;

  const categories: KlimaCategory[] = [
    { id: "transport", kg: transportKg },
    { id: "food", kg: foodKg },
    { id: "home", kg: homeKg },
  ];
  const totalKg = transportKg + foodKg + homeKg;
  const largest = categories.reduce((a, b) => (b.kg > a.kg ? b : a)).id;

  return {
    categories,
    totalKg,
    totalTonnes: totalKg / 1000,
    largest,
    vsDkAverageTonnes: totalKg / 1000 - DK_AVERAGE_T_CO2E,
  };
}

export type Tip = { id: string; category: KlimaCategory["id"]; da: string; en: string };

export const TIPS: Tip[] = [
  {
    id: "car-less",
    category: "transport",
    da: "Erstat korte bilure med cykel, gang eller kollektiv trafik når det er realistisk.",
    en: "Replace short car trips with bike, walking, or public transit when realistic.",
  },
  {
    id: "carpool",
    category: "transport",
    da: "Del bil eller vælg elbil/hybrid hvis du kører mange kilometer årligt.",
    en: "Share rides or choose an EV/hybrid if you drive many kilometres each year.",
  },
  {
    id: "flights",
    category: "transport",
    da: "Færre flyrejser, især langdistance, reducerer typisk aftrykket hurtigt.",
    en: "Fewer flights, especially long-haul, usually cuts the footprint quickly.",
  },
  {
    id: "meat",
    category: "food",
    da: "Skær ned på oksekød og mejeri nogle dage om ugen.",
    en: "Cut beef and dairy on some days of the week.",
  },
  {
    id: "seasonal",
    category: "food",
    da: "Vælg sæsonvarer og mindre madspild i hverdagen.",
    en: "Choose seasonal food and cut everyday food waste.",
  },
  {
    id: "plant",
    category: "food",
    da: "Flere plantebaserede måltider sænker typisk mad-delen markant.",
    en: "More plant-based meals usually lower the food share a lot.",
  },
  {
    id: "heat",
    category: "home",
    da: "Sænk rumtemperaturen 1°C og luft kort og effektivt.",
    en: "Lower room temperature by 1°C and air rooms briefly and well.",
  },
  {
    id: "power",
    category: "home",
    da: "Skift til LED, sluk standby, og kør vaskemaskine på lavere temperatur.",
    en: "Use LEDs, cut standby power, and wash clothes at lower temperatures.",
  },
  {
    id: "heat-pump",
    category: "home",
    da: "Overvej varmepumpe eller fjernvarme med lavere emissionsfaktor hvis relevant.",
    en: "Consider a heat pump or lower-emission district heat where it applies.",
  },
];

export function tipsForLargest(largest: KlimaCategory["id"]): Tip[] {
  return TIPS.filter((t) => t.category === largest);
}
