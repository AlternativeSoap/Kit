export type FractionId =
  | "restaffald"
  | "mad"
  | "papir"
  | "pap"
  | "plast"
  | "metal"
  | "glas"
  | "tekstil"
  | "farligt"
  | "pant"
  | "elektronik"
  | "have";

export type Fraction = {
  id: FractionId;
  nameDa: string;
  nameEn: string;
  color: string;
  explainDa: string;
  explainEn: string;
};

export type WasteItem = {
  id: string;
  nameDa: string;
  nameEn: string;
  fraction: FractionId;
  tipDa?: string;
  tipEn?: string;
};

export const FRACTIONS: Fraction[] = [
  {
    id: "restaffald",
    nameDa: "Restaffald",
    nameEn: "Residual waste",
    color: "#5c5c5c",
    explainDa:
      "Det der ikke kan genanvendes i de andre fraktioner. Går typisk til forbrænding med energiudnyttelse.",
    explainEn:
      "What cannot be recycled in the other fractions. Usually goes to incineration with energy recovery.",
  },
  {
    id: "mad",
    nameDa: "Madaffald",
    nameEn: "Food waste",
    color: "#6b8f3c",
    explainDa:
      "Madrester og madrester uden emballage. Bliver til biogas og gødning i mange kommuner.",
    explainEn:
      "Food scraps without packaging. Becomes biogas and fertilizer in many municipalities.",
  },
  {
    id: "papir",
    nameDa: "Papir",
    nameEn: "Paper",
    color: "#3d6ea8",
    explainDa:
      "Aviser, kontorpapir og magasiner. Hold det tørt og uden madrester.",
    explainEn:
      "Newspapers, office paper, and magazines. Keep dry and free of food residue.",
  },
  {
    id: "pap",
    nameDa: "Pap",
    nameEn: "Cardboard",
    color: "#a67c52",
    explainDa:
      "Papkasser og bølgepap. Fold sammen. Fjern plastic og flamingo når du kan.",
    explainEn:
      "Cardboard boxes and corrugated board. Flatten. Remove plastic and foam when you can.",
  },
  {
    id: "plast",
    nameDa: "Plast",
    nameEn: "Plastic",
    color: "#c45c26",
    explainDa:
      "Rensede plastemballager. Skruelåg kan ofte blive på. Blød film følger lokale regler.",
    explainEn:
      "Rinsed plastic packaging. Caps can often stay on. Soft film follows local rules.",
  },
  {
    id: "metal",
    nameDa: "Metal",
    nameEn: "Metal",
    color: "#8a8f98",
    explainDa:
      "Dåser, låg og små metalgenstande. Skyl madrester af.",
    explainEn:
      "Cans, lids, and small metal items. Rinse off food residue.",
  },
  {
    id: "glas",
    nameDa: "Glas",
    nameEn: "Glass",
    color: "#2f8f6b",
    explainDa:
      "Flasker og glasemballager uden pant. Spejle og keramik hører ikke her.",
    explainEn:
      "Bottles and glass packaging without deposit. Mirrors and ceramics do not belong here.",
  },
  {
    id: "tekstil",
    nameDa: "Tekstil",
    nameEn: "Textiles",
    color: "#8b5a9e",
    explainDa:
      "Tøj og tekstiler til genbrug eller genanvendelse. Helst tørt og i pose.",
    explainEn:
      "Clothes and textiles for reuse or recycling. Preferably dry and bagged.",
  },
  {
    id: "farligt",
    nameDa: "Farligt affald",
    nameEn: "Hazardous waste",
    color: "#c0392b",
    explainDa:
      "Kemikalier, batterier, maling og spraydåser. Afleveres på genbrugsstation eller i særskilt ordning.",
    explainEn:
      "Chemicals, batteries, paint, and aerosols. Take to a recycling centre or a dedicated scheme.",
  },
  {
    id: "pant",
    nameDa: "Pant",
    nameEn: "Deposit return",
    color: "#1a7a4c",
    explainDa:
      "Flasker og dåser med dansk pantmærke. Aflever i pantautomat.",
    explainEn:
      "Bottles and cans with the Danish deposit mark. Return in a reverse-vending machine.",
  },
  {
    id: "elektronik",
    nameDa: "Elektronik",
    nameEn: "Electronics",
    color: "#2c5aa0",
    explainDa:
      "El-apparater, kabler og små elektronik. Afleveres til WEEE-ordning eller genbrugsstation.",
    explainEn:
      "Appliances, cables, and small electronics. Use WEEE take-back or a recycling centre.",
  },
  {
    id: "have",
    nameDa: "Haveaffald",
    nameEn: "Garden waste",
    color: "#4a7c3f",
    explainDa:
      "Grene, blade og græsafklip. Kommunale ordninger eller hjemmekompost.",
    explainEn:
      "Branches, leaves, and grass clippings. Municipal schemes or home compost.",
  },
];

export const ITEMS: WasteItem[] = [
  { id: "banan", nameDa: "Banan-skræl", nameEn: "Banana peel", fraction: "mad" },
  { id: "kaffe", nameDa: "Kaffegrums", nameEn: "Coffee grounds", fraction: "mad" },
  { id: "ben", nameDa: "Kødben", nameEn: "Meat bones", fraction: "mad", tipDa: "Små mængder i madaffald i de fleste kommuner.", tipEn: "Small amounts go in food waste in most municipalities." },
  { id: "madolie", nameDa: "Brugt madolie (lille mængde)", nameEn: "Used cooking oil (small amount)", fraction: "mad", tipDa: "Større mængder: genbrugsstation.", tipEn: "Larger amounts: recycling centre." },
  { id: "avis", nameDa: "Avis", nameEn: "Newspaper", fraction: "papir" },
  { id: "kuvert", nameDa: "Kuvert uden rude", nameEn: "Envelope without window", fraction: "papir" },
  { id: "magasin", nameDa: "Magasin", nameEn: "Magazine", fraction: "papir" },
  { id: "kontor", nameDa: "Printerpapir", nameEn: "Printer paper", fraction: "papir" },
  { id: "gavepapir", nameDa: "Gavepapir (blankt)", nameEn: "Wrapping paper (plain)", fraction: "papir", tipDa: "Meget blankt eller plastbelagt: restaffald.", tipEn: "Very glossy or plastic-coated: residual waste." },
  { id: "papkasse", nameDa: "Papkasse", nameEn: "Cardboard box", fraction: "pap" },
  { id: "aeggebakke", nameDa: "Æggebakke (pap)", nameEn: "Egg carton (paper)", fraction: "pap" },
  { id: "toeruller", nameDa: "Toiletruller", nameEn: "Toilet-roll cores", fraction: "pap" },
  { id: "pizzabakke", nameDa: "Pizzabakke (fedtet)", nameEn: "Pizza box (greasy)", fraction: "restaffald", tipDa: "Meget fedtet pap hører til restaffald.", tipEn: "Very greasy cardboard belongs in residual waste." },
  { id: "plastflaske", nameDa: "Plastflaske uden pant", nameEn: "Plastic bottle without deposit", fraction: "plast" },
  { id: "shampoo", nameDa: "Shampooflaske", nameEn: "Shampoo bottle", fraction: "plast" },
  { id: "yoghurt", nameDa: "Yoghurtbæger", nameEn: "Yoghurt pot", fraction: "plast" },
  { id: "plastpose", nameDa: "Plastpose", nameEn: "Plastic bag", fraction: "plast", tipDa: "Nogle kommuner har særskilt blød plast.", tipEn: "Some municipalities have a separate soft-plastic stream." },
  { id: "film", nameDa: "Madfilm", nameEn: "Cling film", fraction: "plast" },
  { id: "flamingo", nameDa: "Flamingo / EPS", nameEn: "Styrofoam / EPS", fraction: "restaffald", tipDa: "Ofte restaffald eller genbrugsstation.", tipEn: "Often residual waste or recycling centre." },
  { id: "sodavandsdaase", nameDa: "Sodavandsdåse med pant", nameEn: "Soft-drink can with deposit", fraction: "pant" },
  { id: "olflaske", nameDa: "Ølflaske med pant", nameEn: "Beer bottle with deposit", fraction: "pant" },
  { id: "vandflaske", nameDa: "Vandflaske med pant", nameEn: "Water bottle with deposit", fraction: "pant" },
  { id: "konserves", nameDa: "Konservesdåse", nameEn: "Food can", fraction: "metal" },
  { id: "alum", nameDa: "Alufolie (rent)", nameEn: "Aluminium foil (clean)", fraction: "metal" },
  { id: "laag", nameDa: "Metållåg", nameEn: "Metal lid", fraction: "metal" },
  { id: "bestik", nameDa: "Ødelagt bestik", nameEn: "Broken cutlery", fraction: "metal" },
  { id: "glasflaske", nameDa: "Glasflaske uden pant", nameEn: "Glass bottle without deposit", fraction: "glas" },
  { id: "syltetoej", nameDa: "Syltetøjsglas", nameEn: "Jam jar", fraction: "glas" },
  { id: "drikkeglas", nameDa: "Knust drikkeglas", nameEn: "Broken drinking glass", fraction: "glas", tipDa: "Emballageglas ja. Spejl og keramik nej.", tipEn: "Packaging glass yes. Mirror and ceramics no." },
  { id: "spejl", nameDa: "Spejl", nameEn: "Mirror", fraction: "restaffald" },
  { id: "porcelaen", nameDa: "Porcelæn", nameEn: "Porcelain", fraction: "restaffald" },
  { id: "ble", nameDa: "Ble", nameEn: "Nappy / diaper", fraction: "restaffald" },
  { id: "cigaret", nameDa: "Cigaretteskod", nameEn: "Cigarette butt", fraction: "restaffald" },
  { id: "stoevsuger", nameDa: "Støvsugerpose", nameEn: "Vacuum bag", fraction: "restaffald" },
  { id: "tyggegummi", nameDa: "Tyggegummi", nameEn: "Chewing gum", fraction: "restaffald" },
  { id: "kattegrus", nameDa: "Kattegrus", nameEn: "Cat litter", fraction: "restaffald" },
  { id: "tshirt", nameDa: "T-shirt", nameEn: "T-shirt", fraction: "tekstil" },
  { id: "handklaede", nameDa: "Håndklæde", nameEn: "Towel", fraction: "tekstil" },
  { id: "sokker", nameDa: "Hullerede sokker", nameEn: "Holey socks", fraction: "tekstil", tipDa: "Ødelagt tekstil kan stadig genanvendes.", tipEn: "Damaged textiles can still be recycled." },
  { id: "batteri", nameDa: "Batteri", nameEn: "Battery", fraction: "farligt" },
  { id: "maling", nameDa: "Malingrest", nameEn: "Leftover paint", fraction: "farligt" },
  { id: "spray", nameDa: "Spraydåse", nameEn: "Aerosol can", fraction: "farligt" },
  { id: "medicin", nameDa: "Udløbet medicin", nameEn: "Expired medicine", fraction: "farligt", tipDa: "Aflever på apotek.", tipEn: "Return to a pharmacy." },
  { id: "energi", nameDa: "Elpære / LED", nameEn: "Light bulb / LED", fraction: "farligt", tipDa: "Ofte særskilt indsamling i butik eller genbrugsstation.", tipEn: "Often separate take-back in stores or recycling centres." },
  { id: "telefon", nameDa: "Mobiltelefon", nameEn: "Mobile phone", fraction: "elektronik" },
  { id: "oplader", nameDa: "Oplader / kabel", nameEn: "Charger / cable", fraction: "elektronik" },
  { id: "headset", nameDa: "Hovedtelefoner", nameEn: "Headphones", fraction: "elektronik" },
  { id: "toaster", nameDa: "Brødrister", nameEn: "Toaster", fraction: "elektronik" },
  { id: "blade", nameDa: "Blade", nameEn: "Leaves", fraction: "have" },
  { id: "grene", nameDa: "Grene", nameEn: "Branches", fraction: "have" },
  { id: "graes", nameDa: "Græsafklip", nameEn: "Grass clippings", fraction: "have" },
  { id: "jord", nameDa: "Havejord", nameEn: "Garden soil", fraction: "have" },
  { id: "tork", nameDa: "Brugt køkkenrulle med mad", nameEn: "Used kitchen paper with food", fraction: "mad" },
  { id: "serviet", nameDa: "Papirserviet (ren)", nameEn: "Paper napkin (clean)", fraction: "papir", tipDa: "Fedtet serviet: madaffald eller restaffald efter lokal regel.", tipEn: "Greasy napkin: food or residual waste per local rule." },
  { id: "tetra", nameDa: "Mælkekarton", nameEn: "Milk carton", fraction: "plast", tipDa: "Mange steder med plast/drikkekarton-fraktion. Tjek skiltningen.", tipEn: "Often with plastic or beverage-carton stream. Check local labels." },
  { id: "kaffekapsel", nameDa: "Kaffekapsel (aluminium)", nameEn: "Coffee capsule (aluminium)", fraction: "metal", tipDa: "Tøm rester. Plastkapsler følger lokal plastordning.", tipEn: "Empty residue. Plastic capsules follow local plastic rules." },
  { id: "tandpasta", nameDa: "Tandpastatube", nameEn: "Toothpaste tube", fraction: "plast" },
  { id: "vatpind", nameDa: "Vatpind med plastik", nameEn: "Cotton bud with plastic", fraction: "restaffald" },
  { id: "bind", nameDa: "Menstruationsbind", nameEn: "Sanitary pad", fraction: "restaffald" },
  { id: "aske", nameDa: "Askebæger-aske (kold)", nameEn: "Ashtray ash (cold)", fraction: "restaffald" },
];

export function fractionById(id: FractionId): Fraction {
  return FRACTIONS.find((f) => f.id === id)!;
}

export function searchItems(query: string): WasteItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return ITEMS;
  return ITEMS.filter((item) => {
    const frac = fractionById(item.fraction);
    return (
      item.nameDa.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      frac.nameDa.toLowerCase().includes(q) ||
      frac.nameEn.toLowerCase().includes(q)
    );
  });
}
