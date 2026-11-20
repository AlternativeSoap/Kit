export type EarthLayer = {
  id: string;
  nameDa: string;
  nameEn: string;
  /** Approximate thickness in km */
  thicknessKm: number;
  color: string;
  factDa: string;
  factEn: string;
};

export type BoundaryType = "divergent" | "convergent" | "transform" | "mixed";

export type TectonicPlate = {
  id: string;
  nameDa: string;
  nameEn: string;
  /** Focus point on the 1000×500 world map */
  mx: number;
  my: number;
  /**
   * Schematic plate polygon in 1000×500 map space (space-separated x,y pairs).
   * Oriented to the world outline; not a precise geologic boundary.
   */
  path: string;
  boundary: BoundaryType;
  boundaryDa: string;
  boundaryEn: string;
  exampleDa: string;
  exampleEn: string;
  factDa: string;
  factEn: string;
};

/** Fill colors for map regions by dominant boundary story. */
export const BOUNDARY_FILL: Record<BoundaryType, string> = {
  divergent: "#3d9b8f",
  convergent: "#c45c3e",
  transform: "#c9a227",
  mixed: "#6b7fd7",
};

export const BOUNDARY_SOFT: Record<BoundaryType, string> = {
  divergent: "rgba(61, 155, 143, 0.38)",
  convergent: "rgba(196, 92, 62, 0.38)",
  transform: "rgba(201, 162, 39, 0.40)",
  mixed: "rgba(107, 127, 215, 0.38)",
};

/** Outer to inner for drawing (crust first). Thicknesses are approximate means. */
export const LAYERS: EarthLayer[] = [
  {
    id: "crust",
    nameDa: "Jordskorpe",
    nameEn: "Crust",
    thicknessKm: 40,
    color: "#d2b48c",
    factDa:
      "Tynd yderste skal. Kontinentalskorpe er tykkere og lettere end oceanbund. Typisk 5 til 70 km.",
    factEn:
      "Thin outer shell. Continental crust is thicker and lighter than oceanic crust. Typically 5 to 70 km.",
  },
  {
    id: "mantle",
    nameDa: "Kappe",
    nameEn: "Mantle",
    thicknessKm: 2900,
    color: "#a84a2e",
    factDa:
      "Største volumen. Fast sten der flyder langsomt over millioner af år og driver pladerne.",
    factEn:
      "Largest volume. Solid rock that flows slowly over millions of years and drives the plates.",
  },
  {
    id: "outer-core",
    nameDa: "Ydre kerne",
    nameEn: "Outer core",
    thicknessKm: 2200,
    color: "#e8a020",
    factDa:
      "Flydende jern og nikkel. Bevægelsen skaber Jordens magnetfelt.",
    factEn:
      "Liquid iron and nickel. Motion here generates Earth’s magnetic field.",
  },
  {
    id: "inner-core",
    nameDa: "Indre kerne",
    nameEn: "Inner core",
    thicknessKm: 1220,
    color: "#f5d76e",
    factDa:
      "Fast metalkerne under enormt tryk. Omkring 1200 km i radius.",
    factEn:
      "Solid metal core under enormous pressure. About 1,220 km in radius.",
  },
];

export const PLATES: TectonicPlate[] = [
  {
    id: "pacific",
    nameDa: "Stillehavspladen",
    nameEn: "Pacific Plate",
    mx: 120,
    my: 240,
    path: "20,90 180,80 240,140 250,220 230,320 160,380 40,390 10,300 15,180",
    boundary: "convergent",
    boundaryDa: "Primært konvergent (subduktion) langs ildringen.",
    boundaryEn: "Mostly convergent (subduction) along the Ring of Fire.",
    exampleDa: "Japan, Chile, Alaska: jordskælv og vulkaner.",
    exampleEn: "Japan, Chile, Alaska: earthquakes and volcanoes.",
    factDa: "Største oceanplade. Synker under naboer mange steder.",
    factEn: "Largest oceanic plate. Subducts beneath neighbors in many places.",
  },
  {
    id: "north-america",
    nameDa: "Nordamerikanske plade",
    nameEn: "North American Plate",
    mx: 220,
    my: 140,
    path: "130,50 280,40 340,90 320,170 280,210 220,220 170,190 140,120",
    boundary: "mixed",
    boundaryDa: "Transform ved San Andreas, divergerende i Atlanterhavet.",
    boundaryEn: "Transform at San Andreas, divergent in the Atlantic.",
    exampleDa: "Californien (San Andreas), Island (Midtatlantiske ryg).",
    exampleEn: "California (San Andreas), Iceland (Mid-Atlantic Ridge).",
    factDa: "Dækker det meste af Nordamerika og en del af Atlanterhavet.",
    factEn: "Covers most of North America and part of the Atlantic.",
  },
  {
    id: "south-america",
    nameDa: "Sydamerikanske plade",
    nameEn: "South American Plate",
    mx: 270,
    my: 320,
    path: "235,250 295,245 310,300 300,380 270,410 245,390 235,320",
    boundary: "convergent",
    boundaryDa: "Konvergent mod vest hvor Nazca synker under kontinentet.",
    boundaryEn: "Convergent on the west where Nazca sinks under the continent.",
    exampleDa: "Andesbjergene og stærke skælv i Chile og Peru.",
    exampleEn: "The Andes and strong quakes in Chile and Peru.",
    factDa: "Andes dannes af subduktion af Nazca-pladen.",
    factEn: "The Andes form from Nazca Plate subduction.",
  },
  {
    id: "eurasian",
    nameDa: "Eurasiske plade",
    nameEn: "Eurasian Plate",
    mx: 620,
    my: 120,
    path: "470,50 760,40 820,90 800,160 720,180 600,185 520,170 470,120",
    boundary: "convergent",
    boundaryDa: "Konvergent mod Indien og Afrika; divergerende i Atlanterhavet.",
    boundaryEn: "Convergent with India and Africa; divergent in the Atlantic.",
    exampleDa: "Himalaya, Alperne, vulkansk aktivitet i Italien og Island.",
    exampleEn: "Himalayas, Alps, volcanic activity in Italy and Iceland.",
    factDa: "Stor kontinentalplade fra Europa til Østasien.",
    factEn: "Large continental plate from Europe to East Asia.",
  },
  {
    id: "african",
    nameDa: "Afrikanske plade",
    nameEn: "African Plate",
    mx: 520,
    my: 250,
    path: "455,155 555,145 580,200 570,300 530,340 480,325 455,230",
    boundary: "mixed",
    boundaryDa: "Divergerende i Østafrika og Midtatlanten; konvergent i Middelhavet.",
    boundaryEn: "Divergent in East Africa and the Mid-Atlantic; convergent in the Mediterranean.",
    exampleDa: "Østafrikanske Rift, Etna, vulkanøer i Atlanterhavet.",
    exampleEn: "East African Rift, Etna, Atlantic volcanic islands.",
    factDa: "Afrika er ved at flække langs den østafrikanske rift.",
    factEn: "Africa is slowly splitting along the East African Rift.",
  },
  {
    id: "indo-australian",
    nameDa: "Indo-australske plade",
    nameEn: "Indo-Australian Plate",
    mx: 740,
    my: 280,
    path: "620,190 780,180 900,230 910,310 860,370 740,380 650,330 615,250",
    boundary: "convergent",
    boundaryDa: "Konvergent mod Eurasien (Himalaya) og langs Indonesien.",
    boundaryEn: "Convergent into Eurasia (Himalayas) and along Indonesia.",
    exampleDa: "Himalaya, Sumatra-skælvet 2004, vulkaner i Indonesien.",
    exampleEn: "Himalayas, 2004 Sumatra quake, Indonesian volcanoes.",
    factDa: "Ofte behandlet som Indien og Australien, der kan skilles i to.",
    factEn: "Often treated as India and Australia, which may be separating.",
  },
  {
    id: "antarctic",
    nameDa: "Antarktiske plade",
    nameEn: "Antarctic Plate",
    mx: 500,
    my: 460,
    path: "160,430 400,415 640,415 860,435 820,490 500,498 180,490",
    boundary: "divergent",
    boundaryDa: "Omkringliggende midtoceanrygge (divergerende).",
    boundaryEn: "Surrounded by mid-ocean ridges (divergent).",
    exampleDa: "Rolige rygge rundt om Antarktis; få store skælv på kontinentet.",
    exampleEn: "Quiet ridges around Antarctica; few large quakes on the continent.",
    factDa: "Næsten omsluttet af spredningszoner.",
    factEn: "Almost enclosed by spreading centers.",
  },
  {
    id: "nazca",
    nameDa: "Nazca-pladen",
    nameEn: "Nazca Plate",
    mx: 210,
    my: 310,
    path: "170,250 235,245 245,310 230,380 175,385 155,310",
    boundary: "convergent",
    boundaryDa: "Synker under Sydamerika (konvergent).",
    boundaryEn: "Subducts under South America (convergent).",
    exampleDa: "Peru-Chile-graven, Andes-vulkaner.",
    exampleEn: "Peru-Chile Trench, Andean volcanoes.",
    factDa: "Oceanplade øst for Stillehavet. Driver Andeskæden.",
    factEn: "Oceanic plate east of the Pacific. Drives the Andes.",
  },
  {
    id: "cocos",
    nameDa: "Cocos-pladen",
    nameEn: "Cocos Plate",
    mx: 195,
    my: 230,
    path: "165,205 225,198 235,235 210,255 165,245",
    boundary: "convergent",
    boundaryDa: "Subduktion under Mellemamerika.",
    boundaryEn: "Subduction under Central America.",
    exampleDa: "Vulkaner i Mexico, Guatemala og Costa Rica.",
    exampleEn: "Volcanoes in Mexico, Guatemala, and Costa Rica.",
    factDa: "Lille oceanplade ud for Mellemamerika.",
    factEn: "Small oceanic plate off Central America.",
  },
  {
    id: "caribbean",
    nameDa: "Caribiske plade",
    nameEn: "Caribbean Plate",
    mx: 260,
    my: 230,
    path: "230,210 300,205 315,240 285,260 230,250",
    boundary: "transform",
    boundaryDa: "Transform og konvergente kanter omkring Caribien.",
    boundaryEn: "Transform and convergent edges around the Caribbean.",
    exampleDa: "Haiti 2010, vulkanøer i De Små Antiller.",
    exampleEn: "Haiti 2010, volcanic islands in the Lesser Antilles.",
    factDa: "Lille plade mellem Nord- og Sydamerika.",
    factEn: "Small plate between North and South America.",
  },
  {
    id: "arabian",
    nameDa: "Arabiske plade",
    nameEn: "Arabian Plate",
    mx: 570,
    my: 195,
    path: "545,165 595,158 610,200 585,225 545,215",
    boundary: "divergent",
    boundaryDa: "Divergerende i Det Røde Hav; konvergent i Zagros.",
    boundaryEn: "Divergent in the Red Sea; convergent in the Zagros.",
    exampleDa: "Rødehavs-rift, jordskælv i Iran og Tyrkiet.",
    exampleEn: "Red Sea rift, quakes in Iran and Turkey.",
    factDa: "Bevæger sig nordpå ind i Eurasien.",
    factEn: "Moving north into Eurasia.",
  },
  {
    id: "philippine",
    nameDa: "Filippinske plade",
    nameEn: "Philippine Sea Plate",
    mx: 820,
    my: 200,
    path: "780,145 870,135 900,190 870,245 790,250 760,185",
    boundary: "convergent",
    boundaryDa: "Kompleks subduktion rundt om Filippinerne og Japan.",
    boundaryEn: "Complex subduction around the Philippines and Japan.",
    exampleDa: "Filippinerne, Marianerne, vulkanbuer i Veststillehavet.",
    exampleEn: "Philippines, Marianas, volcanic arcs in the west Pacific.",
    factDa: "Oceanplade med dybe grave og ildring-aktivitet.",
    factEn: "Oceanic plate with deep trenches and Ring of Fire activity.",
  },
];

export function boundaryLabel(type: BoundaryType, da: boolean): string {
  switch (type) {
    case "divergent":
      return da ? "Divergerende" : "Divergent";
    case "convergent":
      return da ? "Konvergent" : "Convergent";
    case "transform":
      return da ? "Transform" : "Transform";
    case "mixed":
      return da ? "Blandet" : "Mixed";
  }
}

export function matchesPlate(plate: TectonicPlate, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    plate.nameDa.toLowerCase().includes(q) ||
    plate.nameEn.toLowerCase().includes(q) ||
    plate.exampleDa.toLowerCase().includes(q) ||
    plate.exampleEn.toLowerCase().includes(q)
  );
}
