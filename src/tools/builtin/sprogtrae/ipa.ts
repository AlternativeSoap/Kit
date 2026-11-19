export type IpaSymbol = {
  ipa: string;
  /** Approximate speechSynthesis text */
  speak: string;
  exampleDa: string;
  exampleEn: string;
  /** Danish gloss of the example when useful */
  glossDa?: string;
  glossEn?: string;
  kind: "consonant" | "vowel";
  row: string;
};

export const IPA_SYMBOLS: IpaSymbol[] = [
  // Bilabial / labiodental
  {
    ipa: "p",
    speak: "p",
    exampleDa: "pære",
    exampleEn: "spin",
    glossDa: "som i pære",
    glossEn: "as in spin (unaspirated)",
    kind: "consonant",
    row: "bilabial",
  },
  {
    ipa: "b",
    speak: "b",
    exampleDa: "bil",
    exampleEn: "bat",
    kind: "consonant",
    row: "bilabial",
  },
  {
    ipa: "m",
    speak: "m",
    exampleDa: "mor",
    exampleEn: "mom",
    kind: "consonant",
    row: "bilabial",
  },
  {
    ipa: "f",
    speak: "f",
    exampleDa: "fisk",
    exampleEn: "fish",
    kind: "consonant",
    row: "labiodental",
  },
  {
    ipa: "v",
    speak: "v",
    exampleDa: "vin",
    exampleEn: "vine",
    kind: "consonant",
    row: "labiodental",
  },
  // Alveolar
  {
    ipa: "t",
    speak: "t",
    exampleDa: "tak",
    exampleEn: "stop",
    glossEn: "as in stop (unaspirated)",
    kind: "consonant",
    row: "alveolar",
  },
  {
    ipa: "d",
    speak: "d",
    exampleDa: "dag",
    exampleEn: "dog",
    kind: "consonant",
    row: "alveolar",
  },
  {
    ipa: "n",
    speak: "n",
    exampleDa: "næse",
    exampleEn: "no",
    kind: "consonant",
    row: "alveolar",
  },
  {
    ipa: "s",
    speak: "s",
    exampleDa: "sol",
    exampleEn: "see",
    kind: "consonant",
    row: "alveolar",
  },
  {
    ipa: "z",
    speak: "z",
    exampleDa: "zoo (engelsk)",
    exampleEn: "zoo",
    glossDa: "sjælden i dansk",
    glossEn: "rare in Danish",
    kind: "consonant",
    row: "alveolar",
  },
  {
    ipa: "l",
    speak: "l",
    exampleDa: "lys",
    exampleEn: "light",
    kind: "consonant",
    row: "alveolar",
  },
  {
    ipa: "ɹ",
    speak: "r",
    exampleDa: "red (engelsk)",
    exampleEn: "red",
    glossDa: "engelsk approximant-r",
    glossEn: "English approximant r",
    kind: "consonant",
    row: "alveolar",
  },
  // Postalveolar / palatal
  {
    ipa: "ʃ",
    speak: "sh",
    exampleDa: "sjov",
    exampleEn: "ship",
    glossDa: "som i sjov",
    glossEn: "as in ship",
    kind: "consonant",
    row: "postalveolar",
  },
  {
    ipa: "ʒ",
    speak: "zh",
    exampleDa: "garage (fransk)",
    exampleEn: "measure",
    kind: "consonant",
    row: "postalveolar",
  },
  {
    ipa: "tʃ",
    speak: "ch",
    exampleDa: "chips",
    exampleEn: "chip",
    kind: "consonant",
    row: "postalveolar",
  },
  {
    ipa: "dʒ",
    speak: "j",
    exampleDa: "jazz",
    exampleEn: "judge",
    kind: "consonant",
    row: "postalveolar",
  },
  {
    ipa: "j",
    speak: "y",
    exampleDa: "ja",
    exampleEn: "yes",
    kind: "consonant",
    row: "palatal",
  },
  // Velar / glottal
  {
    ipa: "k",
    speak: "k",
    exampleDa: "kat",
    exampleEn: "skill",
    glossEn: "as in skill (unaspirated)",
    kind: "consonant",
    row: "velar",
  },
  {
    ipa: "g",
    speak: "g",
    exampleDa: "gå",
    exampleEn: "go",
    kind: "consonant",
    row: "velar",
  },
  {
    ipa: "ŋ",
    speak: "ng",
    exampleDa: "sang",
    exampleEn: "sing",
    kind: "consonant",
    row: "velar",
  },
  {
    ipa: "x",
    speak: "kh",
    exampleDa: "ach (tysk)",
    exampleEn: "loch (Scottish)",
    glossDa: "ikke standard i dansk",
    glossEn: "not standard in Danish",
    kind: "consonant",
    row: "velar",
  },
  {
    ipa: "h",
    speak: "h",
    exampleDa: "hus",
    exampleEn: "house",
    kind: "consonant",
    row: "glottal",
  },
  {
    ipa: "ʔ",
    speak: "uh-oh",
    exampleDa: "stød (som i hun')",
    exampleEn: "uh-oh",
    glossDa: "glottalt stop / dansk stød-relateret",
    glossEn: "glottal stop; related to Danish stød",
    kind: "consonant",
    row: "glottal",
  },
  // Vowels
  {
    ipa: "i",
    speak: "ee",
    exampleDa: "is",
    exampleEn: "see",
    kind: "vowel",
    row: "close",
  },
  {
    ipa: "y",
    speak: "ü",
    exampleDa: "lys (y-agtig)",
    exampleEn: "über (German)",
    glossDa: "rundet lukket frontvokal",
    glossEn: "rounded close front vowel",
    kind: "vowel",
    row: "close",
  },
  {
    ipa: "u",
    speak: "oo",
    exampleDa: "ugle",
    exampleEn: "food",
    kind: "vowel",
    row: "close",
  },
  {
    ipa: "e",
    speak: "eh",
    exampleDa: "se",
    exampleEn: "bait (without glide)",
    kind: "vowel",
    row: "close-mid",
  },
  {
    ipa: "ø",
    speak: "ö",
    exampleDa: "øl",
    exampleEn: "feu (French)",
    glossDa: "typisk dansk/nordisk vokal",
    glossEn: "typical Danish/Nordic vowel",
    kind: "vowel",
    row: "close-mid",
  },
  {
    ipa: "o",
    speak: "o",
    exampleDa: "sol",
    exampleEn: "boat (without glide)",
    kind: "vowel",
    row: "close-mid",
  },
  {
    ipa: "ɛ",
    speak: "eh",
    exampleDa: "hæl",
    exampleEn: "bed",
    kind: "vowel",
    row: "open-mid",
  },
  {
    ipa: "œ",
    speak: "ö",
    exampleDa: "høn",
    exampleEn: "œuf (French)",
    kind: "vowel",
    row: "open-mid",
  },
  {
    ipa: "ɔ",
    speak: "aw",
    exampleDa: "år",
    exampleEn: "thought (some accents)",
    kind: "vowel",
    row: "open-mid",
  },
  {
    ipa: "æ",
    speak: "a",
    exampleDa: "kat",
    exampleEn: "cat",
    kind: "vowel",
    row: "near-open",
  },
  {
    ipa: "ɑ",
    speak: "ah",
    exampleDa: "far",
    exampleEn: "father",
    kind: "vowel",
    row: "open",
  },
  {
    ipa: "ə",
    speak: "uh",
    exampleDa: "ende (e)",
    exampleEn: "about",
    glossDa: "schwa, tryksvag vokal",
    glossEn: "schwa, unstressed vowel",
    kind: "vowel",
    row: "mid-central",
  },
  {
    ipa: "ɪ",
    speak: "i",
    exampleDa: "sit (engelsk)",
    exampleEn: "sit",
    kind: "vowel",
    row: "near-close",
  },
  {
    ipa: "ʊ",
    speak: "u",
    exampleDa: "put (engelsk)",
    exampleEn: "put",
    kind: "vowel",
    row: "near-close",
  },
];

export function rowLabel(row: string, da: boolean): string {
  const map: Record<string, { da: string; en: string }> = {
    bilabial: { da: "Bilabial", en: "Bilabial" },
    labiodental: { da: "Labiodental", en: "Labiodental" },
    alveolar: { da: "Alveolar", en: "Alveolar" },
    postalveolar: { da: "Postalveolar", en: "Postalveolar" },
    palatal: { da: "Palatal", en: "Palatal" },
    velar: { da: "Velar", en: "Velar" },
    glottal: { da: "Glottal", en: "Glottal" },
    close: { da: "Lukket", en: "Close" },
    "close-mid": { da: "Halvlukket", en: "Close-mid" },
    "open-mid": { da: "Halvåben", en: "Open-mid" },
    "near-open": { da: "Næsten åben", en: "Near-open" },
    open: { da: "Åben", en: "Open" },
    "mid-central": { da: "Midt-central", en: "Mid-central" },
    "near-close": { da: "Næsten lukket", en: "Near-close" },
  };
  const hit = map[row];
  if (!hit) return row;
  return da ? hit.da : hit.en;
}

export function speakIpa(sym: IpaSymbol, da: boolean): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const text = da ? sym.exampleDa : sym.exampleEn;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = da ? "da-DK" : "en-US";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
  return true;
}
