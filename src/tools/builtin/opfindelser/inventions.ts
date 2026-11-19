export type Invention = {
  id: string;
  year: number;
  titleDa: string;
  titleEn: string;
  regionDa: string;
  regionEn: string;
  inventorDa: string;
  inventorEn: string;
  whyDa: string;
  whyEn: string;
  /** Prerequisite invention ids */
  dependsOn: string[];
};

export const INVENTIONS: Invention[] = [
  {
    id: "fire",
    year: -400000,
    titleDa: "Kontrolleret ild",
    titleEn: "Controlled fire",
    regionDa: "Afrika / Eurasien",
    regionEn: "Africa / Eurasia",
    inventorDa: "Tidlige mennesker (ukendt)",
    inventorEn: "Early humans (unknown)",
    whyDa:
      "Ild giver varme, lys, madlavning og beskyttelse. Den ændrer kost og socialt liv.",
    whyEn:
      "Fire gives heat, light, cooking, and protection. It changes diet and social life.",
    dependsOn: [],
  },
  {
    id: "agriculture",
    year: -10000,
    titleDa: "Landbrug",
    titleEn: "Agriculture",
    regionDa: "Frugtbare Halvmåne, Kina, Mesoamerika m.fl.",
    regionEn: "Fertile Crescent, China, Mesoamerica, and more",
    inventorDa: "Mange uafhængige samfund",
    inventorEn: "Many independent societies",
    whyDa:
      "Faste afgrøder gør landsbyer og byer mulige. Overskud understøtter specialisering.",
    whyEn:
      "Settled crops make villages and cities possible. Surplus supports specialization.",
    dependsOn: ["fire"],
  },
  {
    id: "wheel",
    year: -3500,
    titleDa: "Hjulet",
    titleEn: "The wheel",
    regionDa: "Mesopotamien / Kaukasus",
    regionEn: "Mesopotamia / Caucasus",
    inventorDa: "Ukendt",
    inventorEn: "Unknown",
    whyDa:
      "Hjul og aksler gør tung transport og keramikproduktion lettere.",
    whyEn:
      "Wheels and axles make heavy transport and pottery production easier.",
    dependsOn: ["agriculture"],
  },
  {
    id: "writing",
    year: -3200,
    titleDa: "Skrift",
    titleEn: "Writing",
    regionDa: "Mesopotamien, Egypten, Kina, Mesoamerika",
    regionEn: "Mesopotamia, Egypt, China, Mesoamerica",
    inventorDa: "Flere tidlige civilisationer",
    inventorEn: "Several early civilizations",
    whyDa:
      "Skrift lagrer love, handel og viden ud over menneskelig hukommelse.",
    whyEn:
      "Writing stores laws, trade, and knowledge beyond human memory.",
    dependsOn: ["agriculture"],
  },
  {
    id: "bronze",
    year: -3000,
    titleDa: "Bronze",
    titleEn: "Bronze",
    regionDa: "Nærøsten, senere globalt",
    regionEn: "Near East, later worldwide",
    inventorDa: "Metalarbejdere i bronzealderen",
    inventorEn: "Bronze Age metalworkers",
    whyDa:
      "Legering af kobber og tin giver stærkere værktøj og våben end sten.",
    whyEn:
      "Alloying copper and tin gives stronger tools and weapons than stone.",
    dependsOn: ["fire", "agriculture"],
  },
  {
    id: "iron",
    year: -1200,
    titleDa: "Jernbearbejdning",
    titleEn: "Iron working",
    regionDa: "Nærøsten, Afrika, senere Europa og Asien",
    regionEn: "Near East, Africa, later Europe and Asia",
    inventorDa: "Jernalderens smede",
    inventorEn: "Iron Age smiths",
    whyDa:
      "Jern er mere tilgængeligt end tinbronze og ændrer landbrug og krig.",
    whyEn:
      "Iron is more available than tin bronze and reshapes farming and war.",
    dependsOn: ["bronze", "fire"],
  },
  {
    id: "paper",
    year: 105,
    titleDa: "Papir",
    titleEn: "Paper",
    regionDa: "Kina",
    regionEn: "China",
    inventorDa: "Cai Lun (forbedring)",
    inventorEn: "Cai Lun (improvement)",
    whyDa:
      "Let, billigt skrivemateriale erstatter gradvist papyrus og pergament.",
    whyEn:
      "Light, cheap writing material gradually replaces papyrus and parchment.",
    dependsOn: ["writing"],
  },
  {
    id: "compass",
    year: 1088,
    titleDa: "Magnetisk kompas",
    titleEn: "Magnetic compass",
    regionDa: "Kina",
    regionEn: "China",
    inventorDa: "Kinesiske navigatører og lærde",
    inventorEn: "Chinese navigators and scholars",
    whyDa:
      "Retningssans uafhængig af himlen. Afgørende for langdistance-sørejser.",
    whyEn:
      "Direction sense independent of the sky. Crucial for long-distance sea travel.",
    dependsOn: ["iron"],
  },
  {
    id: "gunpowder",
    year: 850,
    titleDa: "Krudt",
    titleEn: "Gunpowder",
    regionDa: "Kina",
    regionEn: "China",
    inventorDa: "Tang-tidens alkymister",
    inventorEn: "Tang-era alchemists",
    whyDa:
      "Eksplosiv blanding der senere driver skydevåben og minedrift.",
    whyEn:
      "An explosive mix that later powers firearms and mining.",
    dependsOn: ["fire"],
  },
  {
    id: "printing",
    year: 1450,
    titleDa: "Trykpresse med løse typer",
    titleEn: "Movable-type printing press",
    regionDa: "Europa (Mainz); tidlige tryk også i Østasien",
    regionEn: "Europe (Mainz); earlier printing also in East Asia",
    inventorDa: "Johannes Gutenberg (europæisk press)",
    inventorEn: "Johannes Gutenberg (European press)",
    whyDa:
      "Bøger bliver billigere og mere ensartede. Reformation og videnskab spredes hurtigere.",
    whyEn:
      "Books become cheaper and more uniform. Reformation and science spread faster.",
    dependsOn: ["paper", "writing"],
  },
  {
    id: "newspapers",
    year: 1605,
    titleDa: "Aviser",
    titleEn: "Newspapers",
    regionDa: "Europa",
    regionEn: "Europe",
    inventorDa: "Tidlige forlæggere (fx Strasbourg)",
    inventorEn: "Early publishers (e.g. Strasbourg)",
    whyDa:
      "Regelmæssige nyheder skaber en offentlig sfære og fælles dagsorden.",
    whyEn:
      "Regular news creates a public sphere and a shared agenda.",
    dependsOn: ["printing"],
  },
  {
    id: "telescope",
    year: 1608,
    titleDa: "Teleskop",
    titleEn: "Telescope",
    regionDa: "Nederlandene / Italien",
    regionEn: "Netherlands / Italy",
    inventorDa: "Hans Lippershey m.fl.; Galileo forbedrer",
    inventorEn: "Hans Lippershey and others; Galileo improves",
    whyDa:
      "Himmellegemer kan ses i detalje. Astronomi bliver empirisk på en ny måde.",
    whyEn:
      "Celestial bodies can be seen in detail. Astronomy becomes empirical in a new way.",
    dependsOn: ["glass"],
  },
  {
    id: "glass",
    year: -1500,
    titleDa: "Glas",
    titleEn: "Glass",
    regionDa: "Mesopotamien / Egypten",
    regionEn: "Mesopotamia / Egypt",
    inventorDa: "Tidlige glasmagere",
    inventorEn: "Early glassmakers",
    whyDa:
      "Gennemsigtigt materiale til kar, vinduer og senere linser.",
    whyEn:
      "Transparent material for vessels, windows, and later lenses.",
    dependsOn: ["fire"],
  },
  {
    id: "microscope",
    year: 1590,
    titleDa: "Mikroskop",
    titleEn: "Microscope",
    regionDa: "Nederlandene",
    regionEn: "Netherlands",
    inventorDa: "Zacharias Janssen m.fl. (omstridt)",
    inventorEn: "Zacharias Janssen and others (disputed)",
    whyDa:
      "Små organismer og celler bliver synlige. Biologi får et nyt skala-niveau.",
    whyEn:
      "Tiny organisms and cells become visible. Biology gains a new scale.",
    dependsOn: ["glass"],
  },
  {
    id: "steam",
    year: 1776,
    titleDa: "Praktisk dampmaskine",
    titleEn: "Practical steam engine",
    regionDa: "Storbritannien",
    regionEn: "Britain",
    inventorDa: "James Watt (forbedring af Newcomen)",
    inventorEn: "James Watt (improvement on Newcomen)",
    whyDa:
      "Pålidelig mekanisk kraft uden vind eller vandfald. Fabrikker kan stå hvor som helst.",
    whyEn:
      "Reliable mechanical power without wind or waterfalls. Factories can stand anywhere.",
    dependsOn: ["iron", "coal"],
  },
  {
    id: "coal",
    year: 1700,
    titleDa: "Kul som industribrændsel",
    titleEn: "Coal as industrial fuel",
    regionDa: "Storbritannien, senere globalt",
    regionEn: "Britain, later worldwide",
    inventorDa: "Industrielle samfund",
    inventorEn: "Industrial societies",
    whyDa:
      "Tæt energikilde driver dampkraft og jernproduktion i stor skala.",
    whyEn:
      "A dense energy source drives steam power and large-scale iron production.",
    dependsOn: ["fire", "iron"],
  },
  {
    id: "railroad",
    year: 1825,
    titleDa: "Jernbane",
    titleEn: "Railroad",
    regionDa: "Storbritannien",
    regionEn: "Britain",
    inventorDa: "George Stephenson m.fl.",
    inventorEn: "George Stephenson and others",
    whyDa:
      "Gods og mennesker flyttes hurtigt over land. Markeder bliver nationale.",
    whyEn:
      "Goods and people move quickly over land. Markets become national.",
    dependsOn: ["steam", "iron", "wheel"],
  },
  {
    id: "telegraph",
    year: 1844,
    titleDa: "Elektrisk telegraf",
    titleEn: "Electric telegraph",
    regionDa: "USA / Storbritannien",
    regionEn: "United States / Britain",
    inventorDa: "Samuel Morse, Wheatstone m.fl.",
    inventorEn: "Samuel Morse, Wheatstone, and others",
    whyDa:
      "Beskeder krydser kontinenter på minutter. Nyheds- og finansmarkeder forandres.",
    whyEn:
      "Messages cross continents in minutes. News and finance markets change.",
    dependsOn: ["electricity", "writing"],
  },
  {
    id: "electricity",
    year: 1831,
    titleDa: "Elektromagnetisk induktion",
    titleEn: "Electromagnetic induction",
    regionDa: "Storbritannien",
    regionEn: "Britain",
    inventorDa: "Michael Faraday",
    inventorEn: "Michael Faraday",
    whyDa:
      "Grundlag for generatorer og motorer. Elektricitet kan produceres i stor skala.",
    whyEn:
      "Foundation for generators and motors. Electricity can be produced at scale.",
    dependsOn: ["iron"],
  },
  {
    id: "telephone",
    year: 1876,
    titleDa: "Telefon",
    titleEn: "Telephone",
    regionDa: "USA",
    regionEn: "United States",
    inventorDa: "Alexander Graham Bell (patent); flere samtidige",
    inventorEn: "Alexander Graham Bell (patent); several contemporaries",
    whyDa:
      "Stemme over afstand. Personlig kommunikation bliver øjeblikkelig.",
    whyEn:
      "Voice over distance. Personal communication becomes instant.",
    dependsOn: ["telegraph", "electricity"],
  },
  {
    id: "lightbulb",
    year: 1879,
    titleDa: "Praktisk glødelampe",
    titleEn: "Practical light bulb",
    regionDa: "USA / Storbritannien",
    regionEn: "United States / Britain",
    inventorDa: "Thomas Edison, Joseph Swan m.fl.",
    inventorEn: "Thomas Edison, Joseph Swan, and others",
    whyDa:
      "Elektrisk lys forlænger arbejdsdagen og ændrer byliv om natten.",
    whyEn:
      "Electric light extends the workday and changes city life at night.",
    dependsOn: ["electricity", "glass"],
  },
  {
    id: "automobile",
    year: 1886,
    titleDa: "Automobil",
    titleEn: "Automobile",
    regionDa: "Tyskland",
    regionEn: "Germany",
    inventorDa: "Karl Benz (patent)",
    inventorEn: "Karl Benz (patent)",
    whyDa:
      "Personlig motorkraft uden skinner. Byer, forstæder og arbejde omformes.",
    whyEn:
      "Personal motor power without rails. Cities, suburbs, and work are reshaped.",
    dependsOn: ["wheel", "oil", "engine"],
  },
  {
    id: "oil",
    year: 1859,
    titleDa: "Kommerciel olieboring",
    titleEn: "Commercial oil drilling",
    regionDa: "USA (Pennsylvania)",
    regionEn: "United States (Pennsylvania)",
    inventorDa: "Edwin Drake m.fl.",
    inventorEn: "Edwin Drake and others",
    whyDa:
      "Petroleum bliver en central energikilde til belysning, derefter transport.",
    whyEn:
      "Petroleum becomes a central energy source for lighting, then transport.",
    dependsOn: ["fire"],
  },
  {
    id: "engine",
    year: 1876,
    titleDa: "Forbrændingsmotor",
    titleEn: "Internal combustion engine",
    regionDa: "Tyskland",
    regionEn: "Germany",
    inventorDa: "Nikolaus Otto (firetaktsmotor)",
    inventorEn: "Nikolaus Otto (four-stroke engine)",
    whyDa:
      "Kompakt kraft fra flydende brændstof. Basis for biler, fly og mange maskiner.",
    whyEn:
      "Compact power from liquid fuel. Basis for cars, planes, and many machines.",
    dependsOn: ["oil", "iron"],
  },
  {
    id: "radio",
    year: 1895,
    titleDa: "Radio",
    titleEn: "Radio",
    regionDa: "Europa / globalt",
    regionEn: "Europe / global",
    inventorDa: "Marconi, Tesla, Popov m.fl.",
    inventorEn: "Marconi, Tesla, Popov, and others",
    whyDa:
      "Trådløs udsendelse når mange på én gang. Nyheds- og underholdningsmedie.",
    whyEn:
      "Wireless broadcast reaches many at once. A news and entertainment medium.",
    dependsOn: ["electricity", "telegraph"],
  },
  {
    id: "airplane",
    year: 1903,
    titleDa: "Motordrevet fly",
    titleEn: "Powered airplane",
    regionDa: "USA",
    regionEn: "United States",
    inventorDa: "Wright-brødrene",
    inventorEn: "Wright brothers",
    whyDa:
      "Kontrolleret flyvning åbner luften. Afstand krympes yderligere.",
    whyEn:
      "Controlled flight opens the air. Distance shrinks further.",
    dependsOn: ["engine", "wheel"],
  },
  {
    id: "penicillin",
    year: 1928,
    titleDa: "Penicillin",
    titleEn: "Penicillin",
    regionDa: "Storbritannien",
    regionEn: "Britain",
    inventorDa: "Alexander Fleming; senere Florey & Chain",
    inventorEn: "Alexander Fleming; later Florey & Chain",
    whyDa:
      "Antibiotika gør bakterielle infektioner behandlingsbare i stor skala.",
    whyEn:
      "Antibiotics make bacterial infections treatable at scale.",
    dependsOn: ["microscope"],
  },
  {
    id: "transistor",
    year: 1947,
    titleDa: "Transistor",
    titleEn: "Transistor",
    regionDa: "USA (Bell Labs)",
    regionEn: "United States (Bell Labs)",
    inventorDa: "Bardeen, Brattain, Shockley",
    inventorEn: "Bardeen, Brattain, Shockley",
    whyDa:
      "Lille, pålidelig elektronisk kontakt. Basis for computere og mobiltelefoner.",
    whyEn:
      "A small, reliable electronic switch. Basis for computers and mobile phones.",
    dependsOn: ["electricity"],
  },
  {
    id: "computer",
    year: 1945,
    titleDa: "Elektronisk computer",
    titleEn: "Electronic computer",
    regionDa: "USA / Storbritannien",
    regionEn: "United States / Britain",
    inventorDa: "Turing, von Neumann, Eckert & Mauchly m.fl.",
    inventorEn: "Turing, von Neumann, Eckert & Mauchly, and others",
    whyDa:
      "Programmerbar beregning. Fra militær kode til forretning og videnskab.",
    whyEn:
      "Programmable calculation. From military code to business and science.",
    dependsOn: ["electricity", "writing"],
  },
  {
    id: "internet",
    year: 1969,
    titleDa: "Pakkekoblet netværk (ARPANET)",
    titleEn: "Packet network (ARPANET)",
    regionDa: "USA",
    regionEn: "United States",
    inventorDa: "ARPA / CERF, Kahn m.fl. (senere TCP/IP)",
    inventorEn: "ARPA / Cerf, Kahn, and others (later TCP/IP)",
    whyDa:
      "Computere deler data robust over afstand. Fundament for internettet.",
    whyEn:
      "Computers share data robustly over distance. Foundation for the internet.",
    dependsOn: ["computer", "telephone"],
  },
  {
    id: "www",
    year: 1991,
    titleDa: "World Wide Web",
    titleEn: "World Wide Web",
    regionDa: "CERN (Schweiz)",
    regionEn: "CERN (Switzerland)",
    inventorDa: "Tim Berners-Lee",
    inventorEn: "Tim Berners-Lee",
    whyDa:
      "Links og sider gør internettet brugbart for alle. Information bliver klikbar.",
    whyEn:
      "Links and pages make the internet usable for everyone. Information becomes clickable.",
    dependsOn: ["internet", "computer"],
  },
  {
    id: "gps",
    year: 1995,
    titleDa: "GPS (fuld drift)",
    titleEn: "GPS (full operation)",
    regionDa: "USA",
    regionEn: "United States",
    inventorDa: "Det amerikanske forsvar",
    inventorEn: "U.S. Department of Defense",
    whyDa:
      "Præcis position overalt. Navigation, logistik og kortlægning ændres.",
    whyEn:
      "Precise position anywhere. Navigation, logistics, and mapping change.",
    dependsOn: ["radio", "computer", "satellite"],
  },
  {
    id: "satellite",
    year: 1957,
    titleDa: "Kunstig satellit",
    titleEn: "Artificial satellite",
    regionDa: "Sovjetunionen",
    regionEn: "Soviet Union",
    inventorDa: "Sovjetisk rumprogram (Sputnik)",
    inventorEn: "Soviet space program (Sputnik)",
    whyDa:
      "Objekter i kredsløb muliggør kommunikation, vejrdata og navigation.",
    whyEn:
      "Objects in orbit enable communication, weather data, and navigation.",
    dependsOn: ["airplane", "radio", "computer"],
  },
  {
    id: "smartphone",
    year: 2007,
    titleDa: "Smartphone",
    titleEn: "Smartphone",
    regionDa: "USA / globalt",
    regionEn: "United States / global",
    inventorDa: "Flere producenter; iPhone markerer massemarkedet",
    inventorEn: "Several makers; iPhone marks the mass market",
    whyDa:
      "Computer, kamera og net i lommen. App-økonomi og konstant forbindelse.",
    whyEn:
      "Computer, camera, and net in a pocket. App economy and constant connection.",
    dependsOn: ["transistor", "www", "gps", "telephone"],
  },
  {
    id: "vaccination",
    year: 1796,
    titleDa: "Vaccination",
    titleEn: "Vaccination",
    regionDa: "Storbritannien",
    regionEn: "Britain",
    inventorDa: "Edward Jenner (kopper)",
    inventorEn: "Edward Jenner (smallpox)",
    whyDa:
      "Sygdomsforebyggelse via immunsystemet. Grundlag for moderne folkesundhed.",
    whyEn:
      "Disease prevention via the immune system. Foundation of modern public health.",
    dependsOn: ["microscope"],
  },
  {
    id: "dna",
    year: 1953,
    titleDa: "DNA-struktur forstået",
    titleEn: "DNA structure understood",
    regionDa: "Storbritannien",
    regionEn: "Britain",
    inventorDa: "Watson, Crick, Franklin, Wilkins",
    inventorEn: "Watson, Crick, Franklin, Wilkins",
    whyDa:
      "Arvematerialets form forklarer replikation. Basis for genetik og biotek.",
    whyEn:
      "The form of genetic material explains replication. Basis for genetics and biotech.",
    dependsOn: ["microscope"],
  },
  {
    id: "crispr",
    year: 2012,
    titleDa: "CRISPR-genredigering",
    titleEn: "CRISPR gene editing",
    regionDa: "USA / Europa",
    regionEn: "United States / Europe",
    inventorDa: "Doudna, Charpentier m.fl.",
    inventorEn: "Doudna, Charpentier, and others",
    whyDa:
      "Præcis, relativt billig redigering af DNA. Nye muligheder og nye etiske spørgsmål.",
    whyEn:
      "Precise, relatively cheap DNA editing. New possibilities and new ethical questions.",
    dependsOn: ["dna", "computer"],
  },
];

export function getInvention(id: string): Invention | undefined {
  return INVENTIONS.find((i) => i.id === id);
}

/** Path from node back to roots (includes node). */
export function pathToRoots(id: string): string[] {
  const visited = new Set<string>();
  const path: string[] = [];

  const walk = (current: string) => {
    if (visited.has(current)) return;
    visited.add(current);
    path.push(current);
    const inv = getInvention(current);
    if (!inv) return;
    for (const dep of inv.dependsOn) walk(dep);
  };

  walk(id);
  return path;
}

export function formatInvYear(year: number, da: boolean): string {
  if (year < 0) {
    const abs = Math.abs(year);
    if (abs >= 1000) {
      const k = Math.round(abs / 1000);
      return da ? `ca. ${k}.000 f.Kr.` : `c. ${k},000 BCE`;
    }
    return da ? `${abs} f.Kr.` : `${abs} BCE`;
  }
  return String(year);
}
