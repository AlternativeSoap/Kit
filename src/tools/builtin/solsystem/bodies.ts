export type BodyId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type Body = {
  id: BodyId;
  kind: "star" | "planet" | "moon" | "dwarf";
  nameDa: string;
  nameEn: string;
  /** AU from Sun (Moon: from Earth, stored as Earth AU). */
  distanceAu: number;
  /** Mean radius km */
  radiusKm: number;
  /** Mass relative to Earth (Sun uses solar masses separately via massEarth) */
  massEarth: number;
  /** Sidereal day in Earth hours (negative = retrograde) */
  dayHours: number;
  moons: number;
  color: string;
  factDa: string;
  factEn: string;
  /** Schematic orbit index 0=sun, 1..8 planets; extras use nearby */
  orbitIndex: number;
  gravityG: number;
};

export const BODIES: Body[] = [
  {
    id: "sun",
    kind: "star",
    nameDa: "Solen",
    nameEn: "Sun",
    distanceAu: 0,
    radiusKm: 696340,
    massEarth: 333000,
    dayHours: 609.12,
    moons: 0,
    color: "#f5c542",
    factDa: "En stjerne af typen G2V. Dens tyngdekraft holder planeterne i kredsløb.",
    factEn: "A G2V star. Its gravity keeps the planets in orbit.",
    orbitIndex: 0,
    gravityG: 27.9,
  },
  {
    id: "mercury",
    kind: "planet",
    nameDa: "Merkur",
    nameEn: "Mercury",
    distanceAu: 0.387,
    radiusKm: 2439.7,
    massEarth: 0.055,
    dayHours: 1407.6,
    moons: 0,
    color: "#b0a090",
    factDa: "Den mindste planet og den tætteste på Solen. Overfladen ligner Månens.",
    factEn: "The smallest planet and closest to the Sun. Its surface looks like the Moon.",
    orbitIndex: 1,
    gravityG: 0.38,
  },
  {
    id: "venus",
    kind: "planet",
    nameDa: "Venus",
    nameEn: "Venus",
    distanceAu: 0.723,
    radiusKm: 6051.8,
    massEarth: 0.815,
    dayHours: -5832.5,
    moons: 0,
    color: "#e8c070",
    factDa: "Tyk atmosfære af CO₂ giver ekstrem drivhuseffekt. Roterer baglæns.",
    factEn: "A thick CO₂ atmosphere drives extreme greenhouse heating. It spins backward.",
    orbitIndex: 2,
    gravityG: 0.91,
  },
  {
    id: "earth",
    kind: "planet",
    nameDa: "Jorden",
    nameEn: "Earth",
    distanceAu: 1,
    radiusKm: 6371,
    massEarth: 1,
    dayHours: 23.93,
    moons: 1,
    color: "#4a8fd8",
    factDa: "Den eneste kendte planet med flydende overfladevand og liv.",
    factEn: "The only known planet with liquid surface water and life.",
    orbitIndex: 3,
    gravityG: 1,
  },
  {
    id: "moon",
    kind: "moon",
    nameDa: "Månen",
    nameEn: "Moon",
    distanceAu: 1.00257,
    radiusKm: 1737.4,
    massEarth: 0.0123,
    dayHours: 655.72,
    moons: 0,
    color: "#c8c4bc",
    factDa: "Jordens eneste naturlige satellit. Stabiliserer planetens hældning.",
    factEn: "Earth's only natural satellite. It stabilizes Earth's axial tilt.",
    orbitIndex: 3,
    gravityG: 0.165,
  },
  {
    id: "mars",
    kind: "planet",
    nameDa: "Mars",
    nameEn: "Mars",
    distanceAu: 1.524,
    radiusKm: 3389.5,
    massEarth: 0.107,
    dayHours: 24.62,
    moons: 2,
    color: "#c06040",
    factDa: "Rød pga. jernoxid. Har de største vulkaner i solsystemet.",
    factEn: "Red from iron oxide. Home to the solar system's tallest volcanoes.",
    orbitIndex: 4,
    gravityG: 0.38,
  },
  {
    id: "jupiter",
    kind: "planet",
    nameDa: "Jupiter",
    nameEn: "Jupiter",
    distanceAu: 5.203,
    radiusKm: 69911,
    massEarth: 317.8,
    dayHours: 9.93,
    moons: 95,
    color: "#d4a070",
    factDa: "Gasgigant med Den Store Røde Plet. Har flere måner end nogen anden planet.",
    factEn: "Gas giant with the Great Red Spot. Has more moons than any other planet.",
    orbitIndex: 5,
    gravityG: 2.53,
  },
  {
    id: "saturn",
    kind: "planet",
    nameDa: "Saturn",
    nameEn: "Saturn",
    distanceAu: 9.537,
    radiusKm: 58232,
    massEarth: 95.2,
    dayHours: 10.66,
    moons: 146,
    color: "#e8d090",
    factDa: "Kendte for sine isringe. Dens densitet er lavere end vand.",
    factEn: "Famous for icy rings. Its density is lower than water.",
    orbitIndex: 6,
    gravityG: 1.07,
  },
  {
    id: "uranus",
    kind: "planet",
    nameDa: "Uranus",
    nameEn: "Uranus",
    distanceAu: 19.19,
    radiusKm: 25362,
    massEarth: 14.5,
    dayHours: -17.24,
    moons: 28,
    color: "#7ec8d8",
    factDa: "Isgigant der næsten ligger på siden. Svag ringsystem.",
    factEn: "Ice giant that rolls nearly on its side. Has a faint ring system.",
    orbitIndex: 7,
    gravityG: 0.89,
  },
  {
    id: "neptune",
    kind: "planet",
    nameDa: "Neptun",
    nameEn: "Neptune",
    distanceAu: 30.07,
    radiusKm: 24622,
    massEarth: 17.1,
    dayHours: 16.11,
    moons: 16,
    color: "#4060d0",
    factDa: "Yderste store planet. Har de kraftigste vinde i solsystemet.",
    factEn: "Outermost major planet. Has the strongest winds in the solar system.",
    orbitIndex: 8,
    gravityG: 1.14,
  },
  {
    id: "pluto",
    kind: "dwarf",
    nameDa: "Pluto",
    nameEn: "Pluto",
    distanceAu: 39.48,
    radiusKm: 1188.3,
    massEarth: 0.0022,
    dayHours: -153.3,
    moons: 5,
    color: "#c0a898",
    factDa: "Dværgplanet i Kuiperbæltet. Har en stor måne, Charon.",
    factEn: "Dwarf planet in the Kuiper Belt. Has a large moon, Charon.",
    orbitIndex: 9,
    gravityG: 0.06,
  },
];

export const PLANETS = BODIES.filter((b) => b.kind === "planet");
export const EXTRAS = BODIES.filter((b) => b.kind === "moon" || b.kind === "dwarf");

export function formatMass(body: Body, da: boolean): string {
  if (body.id === "sun") {
    return da ? "1 solmasse (~333.000 Jord)" : "1 solar mass (~333,000 Earths)";
  }
  if (body.massEarth >= 1) {
    return `${body.massEarth.toLocaleString(da ? "da-DK" : "en-US", {
      maximumFractionDigits: 1,
    })} × ${da ? "Jorden" : "Earth"}`;
  }
  return `${body.massEarth.toLocaleString(da ? "da-DK" : "en-US", {
    maximumSignificantDigits: 3,
  })} × ${da ? "Jorden" : "Earth"}`;
}

export function formatDay(hours: number, da: boolean): string {
  const abs = Math.abs(hours);
  const retro = hours < 0;
  let core: string;
  if (abs >= 48) {
    const days = abs / 24;
    core = `${days.toLocaleString(da ? "da-DK" : "en-US", {
      maximumFractionDigits: 1,
    })} ${da ? "jorddøgn" : "Earth days"}`;
  } else {
    core = `${abs.toLocaleString(da ? "da-DK" : "en-US", {
      maximumFractionDigits: 2,
    })} ${da ? "timer" : "hours"}`;
  }
  if (retro) {
    return da ? `${core} (baglæns)` : `${core} (retrograde)`;
  }
  return core;
}
