export type EventCategory =
  | "science"
  | "culture"
  | "conflict"
  | "exploration";

export type TimelineEvent = {
  id: string;
  /** Negative = BCE */
  year: number;
  titleDa: string;
  titleEn: string;
  category: EventCategory;
  blurbDa: string;
  blurbEn: string;
};

export const EVENTS: TimelineEvent[] = [
  {
    id: "writing",
    year: -3200,
    titleDa: "Skrift i Mesopotamien",
    titleEn: "Writing in Mesopotamia",
    category: "culture",
    blurbDa:
      "Kileskrift gør det muligt at føre regnskab, love og historier. Det er et af de tidligste skridt mod permanente optegnelser.",
    blurbEn:
      "Cuneiform lets people keep accounts, laws, and stories. It is one of the earliest steps toward lasting records.",
  },
  {
    id: "pyramids",
    year: -2560,
    titleDa: "Den Store Pyramide ved Giza",
    titleEn: "Great Pyramid of Giza",
    category: "culture",
    blurbDa:
      "Khufus pyramide viser egyptisk ingeniørkunst og organisation i stor skala. Den forbliver et ikon for oldtidens arkitektur.",
    blurbEn:
      "Khufu's pyramid shows Egyptian engineering and large-scale organization. It remains an icon of ancient architecture.",
  },
  {
    id: "hammurabi",
    year: -1754,
    titleDa: "Hammurabis lov",
    titleEn: "Code of Hammurabi",
    category: "culture",
    blurbDa:
      "Babylonske love mejsles i sten. De giver et tidligt eksempel på offentlig ret og straf.",
    blurbEn:
      "Babylonian laws are carved in stone. They give an early example of public rules and penalties.",
  },
  {
    id: "troy",
    year: -1180,
    titleDa: "Trojas fald (traditionelt)",
    titleEn: "Fall of Troy (traditional)",
    category: "conflict",
    blurbDa:
      "Den traditionelle dato for Trojas fald knytter myte og arkæologi sammen i den østlige Middelhavsverden.",
    blurbEn:
      "The traditional date for Troy's fall links myth and archaeology across the eastern Mediterranean.",
  },
  {
    id: "olympics",
    year: -776,
    titleDa: "Første olympiske lege",
    titleEn: "First Olympic Games",
    category: "culture",
    blurbDa:
      "Lege i Olympia bliver et fælles ritual for de græske bystater. Sport og religion mødes.",
    blurbEn:
      "Games at Olympia become a shared ritual for Greek city-states. Sport and religion meet.",
  },
  {
    id: "rome-found",
    year: -753,
    titleDa: "Roms grundlæggelse (traditionelt)",
    titleEn: "Founding of Rome (traditional)",
    category: "culture",
    blurbDa:
      "Den traditionelle grundlæggelse markerer starten på en by, der senere former Europas politik og jura.",
    blurbEn:
      "The traditional founding marks the start of a city that later shapes European politics and law.",
  },
  {
    id: "confucius",
    year: -551,
    titleDa: "Konfucius fødes",
    titleEn: "Birth of Confucius",
    category: "culture",
    blurbDa:
      "Hans lære om etik, familie og styre påvirker Østasien i årtusinder.",
    blurbEn:
      "His teaching on ethics, family, and government influences East Asia for millennia.",
  },
  {
    id: "buddha",
    year: -480,
    titleDa: "Buddha (omtrentlig levetid)",
    titleEn: "Buddha (approximate lifetime)",
    category: "culture",
    blurbDa:
      "Buddhismen opstår i Indien og spredes langs handelsveje til store dele af Asien.",
    blurbEn:
      "Buddhism arises in India and spreads along trade routes across much of Asia.",
  },
  {
    id: "persian-wars",
    year: -490,
    titleDa: "Slaget ved Marathon",
    titleEn: "Battle of Marathon",
    category: "conflict",
    blurbDa:
      "Athenerne stopper en persisk invasion. Begivenheden bliver et symbol på græsk forsvar af bystaterne.",
    blurbEn:
      "Athenians halt a Persian invasion. The event becomes a symbol of Greek city-state defense.",
  },
  {
    id: "parthenon",
    year: -447,
    titleDa: "Parthenon bygges",
    titleEn: "Parthenon construction begins",
    category: "culture",
    blurbDa:
      "Templet på Akropolis viser klassisk græsk arkitektur og Athens politiske selvtillid.",
    blurbEn:
      "The temple on the Acropolis shows classical Greek architecture and Athenian political confidence.",
  },
  {
    id: "alexander",
    year: -323,
    titleDa: "Alexander den Stores død",
    titleEn: "Death of Alexander the Great",
    category: "conflict",
    blurbDa:
      "Hans rige fragmenteres, men hellenistisk kultur spredes fra Middelhavet til Centralasien.",
    blurbEn:
      "His empire fragments, yet Hellenistic culture spreads from the Mediterranean to Central Asia.",
  },
  {
    id: "ashoka",
    year: -250,
    titleDa: "Ashokas edikter",
    titleEn: "Ashoka's edicts",
    category: "culture",
    blurbDa:
      "Indiens Maurya-kejser udbreder buddhistiske og moralske budskaber på stenstøtter.",
    blurbEn:
      "India's Mauryan emperor spreads Buddhist and moral messages on stone pillars.",
  },
  {
    id: "great-wall",
    year: -220,
    titleDa: "Tidlig kinesisk murbygning",
    titleEn: "Early Chinese wall building",
    category: "conflict",
    blurbDa:
      "Qin-dynastiet forbinder forsvarsværker. Senere dynastier udvider dem til den berømte mur.",
    blurbEn:
      "The Qin dynasty links defensive works. Later dynasties expand them into the famous wall.",
  },
  {
    id: "caesar",
    year: -44,
    titleDa: "Cæsars mord",
    titleEn: "Assassination of Caesar",
    category: "conflict",
    blurbDa:
      "Mordet udløser borgerkrig og baner vej for det romerske kejserrige.",
    blurbEn:
      "The killing triggers civil war and opens the path to the Roman Empire.",
  },
  {
    id: "year-zero",
    year: 1,
    titleDa: "Skiftet til den kristne tidsregning",
    titleEn: "Turn to the Common Era calendar",
    category: "culture",
    blurbDa:
      "Den senere kristne tidsregning sætter skel mellem f.Kr. og e.Kr. Den bruges stadig globalt.",
    blurbEn:
      "The later Christian calendar sets the divide between BCE and CE. It is still used worldwide.",
  },
  {
    id: "jesus",
    year: 30,
    titleDa: "Kristendommens begyndelse",
    titleEn: "Beginnings of Christianity",
    category: "culture",
    blurbDa:
      "En ny religiøs bevægelse vokser i det romerske Judæa og spredes over imperiet.",
    blurbEn:
      "A new religious movement grows in Roman Judea and spreads across the empire.",
  },
  {
    id: "pompeii",
    year: 79,
    titleDa: "Vesuvs udbrud",
    titleEn: "Eruption of Vesuvius",
    category: "science",
    blurbDa:
      "Pompeji og Herculaneum begraves. Asken bevarer en by for senere arkæologi.",
    blurbEn:
      "Pompeii and Herculaneum are buried. Ash preserves a city for later archaeology.",
  },
  {
    id: "paper",
    year: 105,
    titleDa: "Papir i Kina",
    titleEn: "Paper in China",
    category: "science",
    blurbDa:
      "Cai Luns forbedrede papir gør skrivning billigere og lettere at sprede.",
    blurbEn:
      "Cai Lun's improved paper makes writing cheaper and easier to spread.",
  },
  {
    id: "constantine",
    year: 313,
    titleDa: "Milano-ediktet",
    titleEn: "Edict of Milan",
    category: "culture",
    blurbDa:
      "Kristendommen bliver lovlig i Romerriget. Religion og magt nærmer sig hinanden.",
    blurbEn:
      "Christianity becomes legal in the Roman Empire. Religion and power draw closer.",
  },
  {
    id: "rome-fall",
    year: 476,
    titleDa: "Vestromerske riges fald",
    titleEn: "Fall of the Western Roman Empire",
    category: "conflict",
    blurbDa:
      "Den sidste vestromerske kejser afsættes. Europa går ind i en mere fragmenteret periode.",
    blurbEn:
      "The last western Roman emperor is deposed. Europe enters a more fragmented period.",
  },
  {
    id: "islam",
    year: 622,
    titleDa: "Hijra",
    titleEn: "Hijra",
    category: "culture",
    blurbDa:
      "Muhammeds udvandring til Medina markerer starten på den islamiske tidsregning.",
    blurbEn:
      "Muhammad's migration to Medina marks the start of the Islamic calendar.",
  },
  {
    id: "baghdad",
    year: 762,
    titleDa: "Baghdad grundlægges",
    titleEn: "Founding of Baghdad",
    category: "culture",
    blurbDa:
      "Abbasidernes hovedstad bliver et centrum for handel, oversættelse og videnskab.",
    blurbEn:
      "The Abbasid capital becomes a hub of trade, translation, and science.",
  },
  {
    id: "vikings",
    year: 793,
    titleDa: "Angrebet på Lindisfarne",
    titleEn: "Raid on Lindisfarne",
    category: "exploration",
    blurbDa:
      "Vikingernes angreb åbner en æra med søfart, handel og bosættelse i Nordatlanten.",
    blurbEn:
      "The Viking raid opens an era of seafaring, trade, and settlement in the North Atlantic.",
  },
  {
    id: "charlemagne",
    year: 800,
    titleDa: "Karl den Store krones",
    titleEn: "Charlemagne crowned",
    category: "conflict",
    blurbDa:
      "Kroningen i Rom knytter frankisk magt til kirkelig autoritet i Vesteuropa.",
    blurbEn:
      "The coronation in Rome links Frankish power to church authority in Western Europe.",
  },
  {
    id: "gunpowder",
    year: 850,
    titleDa: "Kinesisk krudt (omtrent)",
    titleEn: "Chinese gunpowder (approx.)",
    category: "science",
    blurbDa:
      "Alkymister i Tang-Kina blander krudt. Opfindelsen ændrer senere krigsførelse globalt.",
    blurbEn:
      "Alchemists in Tang China mix gunpowder. The invention later changes warfare worldwide.",
  },
  {
    id: "compass",
    year: 1088,
    titleDa: "Magnetisk kompas i Kina",
    titleEn: "Magnetic compass in China",
    category: "exploration",
    blurbDa:
      "Kompasset gør navigation mere pålidelig til lands og til søs.",
    blurbEn:
      "The compass makes navigation more reliable on land and at sea.",
  },
  {
    id: "crusades",
    year: 1096,
    titleDa: "Første korstog",
    titleEn: "First Crusade",
    category: "conflict",
    blurbDa:
      "Europæiske hære drager mod Jerusalem. Konflikten præger relationerne mellem kristne og muslimer i århundreder.",
    blurbEn:
      "European armies march toward Jerusalem. The conflict shapes relations between Christians and Muslims for centuries.",
  },
  {
    id: "magna-carta",
    year: 1215,
    titleDa: "Magna Carta",
    titleEn: "Magna Carta",
    category: "culture",
    blurbDa:
      "Engelske baroner begrænser kongens magt. Dokumentet inspirerer senere retsidéer.",
    blurbEn:
      "English barons limit the king's power. The document later inspires ideas of law.",
  },
  {
    id: "mongols",
    year: 1279,
    titleDa: "Yuan-dynastiet i Kina",
    titleEn: "Yuan dynasty in China",
    category: "conflict",
    blurbDa:
      "Mongolsk styre forener store dele af Eurasien under ét handels- og postnet.",
    blurbEn:
      "Mongol rule unites large parts of Eurasia under one trade and postal network.",
  },
  {
    id: "black-death",
    year: 1347,
    titleDa: "Den sorte død når Europa",
    titleEn: "Black Death reaches Europe",
    category: "science",
    blurbDa:
      "Pesten dræber en stor del af befolkningen og ændrer økonomi, arbejde og tro.",
    blurbEn:
      "Plague kills a large share of the population and reshapes economy, labor, and belief.",
  },
  {
    id: "printing",
    year: 1450,
    titleDa: "Gutenbergs trykpresse",
    titleEn: "Gutenberg's printing press",
    category: "science",
    blurbDa:
      "Bevægelige typer gør bøger billigere. Viden spredes hurtigere end nogensinde før.",
    blurbEn:
      "Movable type makes books cheaper. Knowledge spreads faster than ever before.",
  },
  {
    id: "constantinople",
    year: 1453,
    titleDa: "Konstantinopels fald",
    titleEn: "Fall of Constantinople",
    category: "conflict",
    blurbDa:
      "Osmannerne indtager byen. Det markerer slutningen på det byzantinske rige.",
    blurbEn:
      "The Ottomans take the city. It marks the end of the Byzantine Empire.",
  },
  {
    id: "columbus",
    year: 1492,
    titleDa: "Columbus når Amerika",
    titleEn: "Columbus reaches the Americas",
    category: "exploration",
    blurbDa:
      "Rejsen starter vedvarende kontakt mellem Europa og Amerika med enorme følger.",
    blurbEn:
      "The voyage begins lasting contact between Europe and the Americas with huge consequences.",
  },
  {
    id: "da-gama",
    year: 1498,
    titleDa: "Vasco da Gama når Indien",
    titleEn: "Vasco da Gama reaches India",
    category: "exploration",
    blurbDa:
      "Søvejen rundt om Afrika forbinder Europa direkte med det indiske handelsnet.",
    blurbEn:
      "The sea route around Africa links Europe directly to the Indian Ocean trade network.",
  },
  {
    id: "luther",
    year: 1517,
    titleDa: "Luthers teser",
    titleEn: "Luther's theses",
    category: "culture",
    blurbDa:
      "Reformationen splitter den vestlige kirke og ændrer europæisk politik og sprog.",
    blurbEn:
      "The Reformation splits the western church and reshapes European politics and language.",
  },
  {
    id: "copernicus",
    year: 1543,
    titleDa: "Kopernikus' heliocentriske model",
    titleEn: "Copernicus' heliocentric model",
    category: "science",
    blurbDa:
      "Solen sættes i centrum. Det udfordrer geocentriske verdensbilleder.",
    blurbEn:
      "The Sun is placed at the center. It challenges Earth-centered worldviews.",
  },
  {
    id: "galileo",
    year: 1610,
    titleDa: "Galileos teleskopiske opdagelser",
    titleEn: "Galileo's telescopic discoveries",
    category: "science",
    blurbDa:
      "Måner omkring Jupiter og Venus' faser støtter et solcentreret system.",
    blurbEn:
      "Moons around Jupiter and phases of Venus support a Sun-centered system.",
  },
  {
    id: "thirty-years",
    year: 1618,
    titleDa: "Trediveårskrigen begynder",
    titleEn: "Thirty Years' War begins",
    category: "conflict",
    blurbDa:
      "Religions- og magtkampe hærger Centraleuropa og koster enorme menneskeliv.",
    blurbEn:
      "Religious and power struggles ravage Central Europe and cost enormous lives.",
  },
  {
    id: "newton",
    year: 1687,
    titleDa: "Newtons Principia",
    titleEn: "Newton's Principia",
    category: "science",
    blurbDa:
      "Tyngdekraft og bevægelseslove samles i én matematisk fysik.",
    blurbEn:
      "Gravity and laws of motion are united in one mathematical physics.",
  },
  {
    id: "enlightenment",
    year: 1751,
    titleDa: "Encyclopédie udkommer",
    titleEn: "Encyclopédie published",
    category: "culture",
    blurbDa:
      "Oplysningstidens leksikon samler viden og kritiserer traditionel autoritet.",
    blurbEn:
      "The Enlightenment encyclopedia gathers knowledge and challenges traditional authority.",
  },
  {
    id: "watt",
    year: 1776,
    titleDa: "Watts dampmaskine i drift",
    titleEn: "Watt steam engine in use",
    category: "science",
    blurbDa:
      "Effektiv dampkraft driver fabrikker og transporterer den industrielle revolution.",
    blurbEn:
      "Efficient steam power drives factories and carries the Industrial Revolution.",
  },
  {
    id: "us-independence",
    year: 1776,
    titleDa: "USA's uafhængighedserklæring",
    titleEn: "U.S. Declaration of Independence",
    category: "conflict",
    blurbDa:
      "Tretten kolonier erklærer sig frie. Ideer om rettigheder spredes videre.",
    blurbEn:
      "Thirteen colonies declare themselves free. Ideas of rights travel further.",
  },
  {
    id: "french-rev",
    year: 1789,
    titleDa: "Den franske revolution",
    titleEn: "French Revolution",
    category: "conflict",
    blurbDa:
      "Monarkiet falder. Folkestyre, rettigheder og terror præger det følgende årti.",
    blurbEn:
      "The monarchy falls. Popular rule, rights, and terror mark the following decade.",
  },
  {
    id: "haiti",
    year: 1804,
    titleDa: "Haitis uafhængighed",
    titleEn: "Haitian independence",
    category: "conflict",
    blurbDa:
      "En slaveopstand skaber den første uafhængige sorte republik i Amerika.",
    blurbEn:
      "A slave uprising creates the first independent Black republic in the Americas.",
  },
  {
    id: "darwin",
    year: 1859,
    titleDa: "Darwins Origin of Species",
    titleEn: "Darwin's Origin of Species",
    category: "science",
    blurbDa:
      "Naturlig udvælgelse forklarer arternes udvikling uden et fast hierarki.",
    blurbEn:
      "Natural selection explains how species change without a fixed hierarchy.",
  },
  {
    id: "telegraph",
    year: 1844,
    titleDa: "Morse-telegrafen",
    titleEn: "Morse telegraph",
    category: "science",
    blurbDa:
      "Beskeder krydser kontinenter på minutter. Afstand mister noget af sin magt.",
    blurbEn:
      "Messages cross continents in minutes. Distance loses some of its power.",
  },
  {
    id: "meiji",
    year: 1868,
    titleDa: "Meiji-restaurationen",
    titleEn: "Meiji Restoration",
    category: "culture",
    blurbDa:
      "Japan moderniserer stat, industri og hær og bliver en stormagt i Østasien.",
    blurbEn:
      "Japan modernizes state, industry, and army and becomes a power in East Asia.",
  },
  {
    id: "berlin",
    year: 1884,
    titleDa: "Berlinerkonferencen",
    titleEn: "Berlin Conference",
    category: "conflict",
    blurbDa:
      "Europæiske magter deler Afrika uden afrikansk deltagelse. Kolonitiden intensiveres.",
    blurbEn:
      "European powers divide Africa without African participation. Colonial rule intensifies.",
  },
  {
    id: "xrays",
    year: 1895,
    titleDa: "Röntgen opdager røntgenstråler",
    titleEn: "Röntgen discovers X-rays",
    category: "science",
    blurbDa:
      "Læger kan se indeni kroppen uden kirurgi. Diagnostik ændres for alvor.",
    blurbEn:
      "Doctors can see inside the body without surgery. Diagnosis changes for good.",
  },
  {
    id: "flight",
    year: 1903,
    titleDa: "Wright-brødrenes flyvning",
    titleEn: "Wright brothers' flight",
    category: "exploration",
    blurbDa:
      "Kontrolleret motordrevet flyvning åbner luften som transportvej.",
    blurbEn:
      "Controlled powered flight opens the air as a route for travel.",
  },
  {
    id: "ww1",
    year: 1914,
    titleDa: "Første verdenskrig begynder",
    titleEn: "World War I begins",
    category: "conflict",
    blurbDa:
      "Industrialiseret krig i Europa spreder sig globalt og omformer grænser og samfund.",
    blurbEn:
      "Industrialized war in Europe spreads globally and remakes borders and societies.",
  },
  {
    id: "relativity",
    year: 1915,
    titleDa: "Einsteins generelle relativitet",
    titleEn: "Einstein's general relativity",
    category: "science",
    blurbDa:
      "Rum og tid bøjes af masse. Fysikkens verdensbillede fornyes.",
    blurbEn:
      "Space and time bend with mass. Physics' picture of the world is renewed.",
  },
  {
    id: "russian-rev",
    year: 1917,
    titleDa: "Den russiske revolution",
    titleEn: "Russian Revolution",
    category: "conflict",
    blurbDa:
      "Zarstyret falder. Sovjetstaten bliver en ny magtfaktor i det 20. århundrede.",
    blurbEn:
      "Tsarist rule falls. The Soviet state becomes a new power of the 20th century.",
  },
  {
    id: "penicillin",
    year: 1928,
    titleDa: "Penicillin opdages",
    titleEn: "Penicillin discovered",
    category: "science",
    blurbDa:
      "Alexander Fleming finder et antibiotikum. Bakterielle infektioner bliver behandlingsbare.",
    blurbEn:
      "Alexander Fleming finds an antibiotic. Bacterial infections become treatable.",
  },
  {
    id: "ww2",
    year: 1939,
    titleDa: "Anden verdenskrig begynder",
    titleEn: "World War II begins",
    category: "conflict",
    blurbDa:
      "En global krig med holocaust, atomvåben og nye alliancer ændrer verdensordenen.",
    blurbEn:
      "A global war with the Holocaust, nuclear weapons, and new alliances remakes world order.",
  },
  {
    id: "un",
    year: 1945,
    titleDa: "FN grundlægges",
    titleEn: "United Nations founded",
    category: "culture",
    blurbDa:
      "Efter krigen forsøger stater at skabe et forum for fred, menneskerettigheder og samarbejde.",
    blurbEn:
      "After the war, states try to build a forum for peace, human rights, and cooperation.",
  },
  {
    id: "india",
    year: 1947,
    titleDa: "Indiens og Pakistans uafhængighed",
    titleEn: "Independence of India and Pakistan",
    category: "conflict",
    blurbDa:
      "Det britiske kolonistyre ender. Delingen fører til massiv migration og vold.",
    blurbEn:
      "British colonial rule ends. Partition brings massive migration and violence.",
  },
  {
    id: "dna",
    year: 1953,
    titleDa: "DNA-dobbelthelix",
    titleEn: "DNA double helix",
    category: "science",
    blurbDa:
      "Watson, Crick, Franklin og Wilkins afklarer arvematerialets struktur.",
    blurbEn:
      "Watson, Crick, Franklin, and Wilkins clarify the structure of genetic material.",
  },
  {
    id: "sputnik",
    year: 1957,
    titleDa: "Sputnik 1",
    titleEn: "Sputnik 1",
    category: "exploration",
    blurbDa:
      "Den første satellit starter rumkapløbet mellem USA og Sovjetunionen.",
    blurbEn:
      "The first satellite starts the space race between the U.S. and the Soviet Union.",
  },
  {
    id: "moon",
    year: 1969,
    titleDa: "Månelanding",
    titleEn: "Moon landing",
    category: "exploration",
    blurbDa:
      "Apollo 11 sætter mennesker på Månen. Et teknologisk og symbolsk højdepunkt.",
    blurbEn:
      "Apollo 11 puts people on the Moon. A technological and symbolic peak.",
  },
  {
    id: "internet",
    year: 1983,
    titleDa: "TCP/IP bliver standard",
    titleEn: "TCP/IP becomes standard",
    category: "science",
    blurbDa:
      "Et fælles netprotokol-sæt forbinder forskningsnet til det moderne internet.",
    blurbEn:
      "A shared network protocol suite links research nets into the modern internet.",
  },
  {
    id: "berlin-wall",
    year: 1989,
    titleDa: "Berlinmurens fald",
    titleEn: "Fall of the Berlin Wall",
    category: "conflict",
    blurbDa:
      "Øst- og Vestberlin åbnes. Den kolde krigs deling af Europa begynder at smuldre.",
    blurbEn:
      "East and West Berlin open. The Cold War divide of Europe begins to crumble.",
  },
  {
    id: "www",
    year: 1991,
    titleDa: "World Wide Web offentliggøres",
    titleEn: "World Wide Web made public",
    category: "science",
    blurbDa:
      "Tim Berners-Lees web gør internettet brugbart for almindelige mennesker.",
    blurbEn:
      "Tim Berners-Lee's web makes the internet usable for ordinary people.",
  },
  {
    id: "genome",
    year: 2003,
    titleDa: "Det menneskelige genom kortlægges",
    titleEn: "Human genome mapped",
    category: "science",
    blurbDa:
      "Et næsten komplet menneskeligt genom åbner nye veje i medicin og biologi.",
    blurbEn:
      "A near-complete human genome opens new paths in medicine and biology.",
  },
  {
    id: "smartphone",
    year: 2007,
    titleDa: "Smartphone-æraen begynder",
    titleEn: "Smartphone era begins",
    category: "science",
    blurbDa:
      "Berøringsskærme og app-butikker gør internettet til noget, man bærer i lommen.",
    blurbEn:
      "Touchscreens and app stores make the internet something you carry in a pocket.",
  },
  {
    id: "paris",
    year: 2015,
    titleDa: "Paris-aftalen",
    titleEn: "Paris Agreement",
    category: "culture",
    blurbDa:
      "Stater aftaler at begrænse den globale opvarmning. Klima bliver en fælles politisk sag.",
    blurbEn:
      "States agree to limit global warming. Climate becomes a shared political cause.",
  },
  {
    id: "covid",
    year: 2020,
    titleDa: "Covid-19-pandemien",
    titleEn: "Covid-19 pandemic",
    category: "science",
    blurbDa:
      "En global pandemi tester sundhedssystemer, videnskab og samfund på samme tid.",
    blurbEn:
      "A global pandemic tests health systems, science, and societies at once.",
  },
];

export function formatYear(year: number, da: boolean): string {
  if (year < 0) {
    const abs = Math.abs(year);
    return da ? `${abs} f.Kr.` : `${abs} BCE`;
  }
  if (year === 0) return da ? "år 0" : "year 0";
  return da ? `${year}` : `${year} CE`;
}

export function yearGap(a: number, b: number): number {
  return Math.abs(a - b);
}
