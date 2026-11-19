export type DirectionId = "ltr" | "rtl" | "ttb" | "mixed";

export type WritingSystem = {
  id: string;
  nameDa: string;
  nameEn: string;
  glyphs: string;
  direction: DirectionId;
  regionDa: string;
  regionEn: string;
  factDa: string;
  factEn: string;
  tags: string[];
};

export const DIRECTION_LABEL: Record<
  DirectionId,
  { da: string; en: string }
> = {
  ltr: { da: "Venstre → højre", en: "Left → right" },
  rtl: { da: "Højre → venstre", en: "Right → left" },
  ttb: { da: "Top → bund (søjler)", en: "Top → bottom (columns)" },
  mixed: { da: "Blandet / kontekstafhængig", en: "Mixed / context-dependent" },
};

export const SCRIPTS: WritingSystem[] = [
  {
    id: "latin",
    nameDa: "Latinske alfabet",
    nameEn: "Latin alphabet",
    glyphs: "Aa Bb Cc … Ææ Øø Åå",
    direction: "ltr",
    regionDa: "Europa, Amerika, Afrika, Oceanien (mange sprog)",
    regionEn: "Europe, the Americas, Africa, Oceania (many languages)",
    factDa:
      "Det mest udbredte alfabet globalt. Dansk bruger tre ekstra bogstaver: æ, ø og å.",
    factEn:
      "The world's most widely used alphabet. Danish adds three letters: æ, ø, and å.",
    tags: ["alphabet", "europe", "danish"],
  },
  {
    id: "cyrillic",
    nameDa: "Kyrilliske alfabet",
    nameEn: "Cyrillic alphabet",
    glyphs: "Аа Бб Вв Гг Дд … Яя",
    direction: "ltr",
    regionDa: "Rusland, Ukraine, Bulgarien, Serbien, Centralasien m.fl.",
    regionEn: "Russia, Ukraine, Bulgaria, Serbia, Central Asia, and more",
    factDa:
      "Opkaldt efter missionæren Kyrillos. Flere sprog har egne ekstra bogstaver.",
    factEn:
      "Named after the missionary Cyril. Many languages add their own extra letters.",
    tags: ["alphabet", "slavic", "europe", "asia"],
  },
  {
    id: "greek",
    nameDa: "Græske alfabet",
    nameEn: "Greek alphabet",
    glyphs: "Αα Ββ Γγ Δδ … Ωω",
    direction: "ltr",
    regionDa: "Grækenland og Cypern",
    regionEn: "Greece and Cyprus",
    factDa:
      "Kilde til både latinske og kyrilliske bogstaver. Bruges også i matematik og fysik.",
    factEn:
      "Source of both Latin and Cyrillic letters. Also used in mathematics and physics.",
    tags: ["alphabet", "europe", "science"],
  },
  {
    id: "arabic",
    nameDa: "Arabiske skrift",
    nameEn: "Arabic script",
    glyphs: "ا ب ت ث ج ح خ … ي",
    direction: "rtl",
    regionDa: "Mellemøsten, Nordafrika og store dele af den muslimske verden",
    regionEn: "Middle East, North Africa, and much of the Muslim world",
    factDa:
      "Bogstaverne skifter form efter placering i ordet. Bruges også til farsi og urdu med tilpasninger.",
    factEn:
      "Letters change shape by position in the word. Also adapted for Persian and Urdu.",
    tags: ["abjad", "rtl", "asia", "africa"],
  },
  {
    id: "hebrew",
    nameDa: "Hebræiske alfabet",
    nameEn: "Hebrew alphabet",
    glyphs: "א ב ג ד ה ו ז … ת",
    direction: "rtl",
    regionDa: "Israel og jødiske diasporasamfund",
    regionEn: "Israel and Jewish diaspora communities",
    factDa:
      "Skrevet højre-til-venstre. Vokaler markeres ofte med punkter under bogstaverne.",
    factEn:
      "Written right to left. Vowels are often marked with dots under letters.",
    tags: ["abjad", "rtl", "middle-east"],
  },
  {
    id: "devanagari",
    nameDa: "Devanagari",
    nameEn: "Devanagari",
    glyphs: "अ आ इ ई उ ऊ … क ख ग",
    direction: "ltr",
    regionDa: "Indien og Nepal (hindi, marathi, nepali m.fl.)",
    regionEn: "India and Nepal (Hindi, Marathi, Nepali, and more)",
    factDa:
      "En abugida: konsonanter bærer en indbygget vokal, der kan ændres med tegn.",
    factEn:
      "An abugida: consonants carry an inherent vowel that diacritics can change.",
    tags: ["abugida", "india", "asia"],
  },
  {
    id: "hangul",
    nameDa: "Hangul",
    nameEn: "Hangul",
    glyphs: "ㄱ ㄴ ㄷ ㄹ … ㅏ ㅓ ㅗ ㅜ",
    direction: "ltr",
    regionDa: "Korea",
    regionEn: "Korea",
    factDa:
      "Bevidst designet i 1400-tallet. Bogstaver grupperes i stavelsesblokke.",
    factEn:
      "Deliberately designed in the 1400s. Letters group into syllable blocks.",
    tags: ["alphabet", "korea", "asia"],
  },
  {
    id: "han",
    nameDa: "Han-tegn (kinesiske tegn)",
    nameEn: "Han characters (Chinese)",
    glyphs: "人 大 小 山 水 日 月 火",
    direction: "mixed",
    regionDa: "Kina, Taiwan, Singapore; også i japansk og koreansk skrift",
    regionEn: "China, Taiwan, Singapore; also in Japanese and Korean writing",
    factDa:
      "Tusindvis af tegn. Historisk skrevet i søjler; moderne tekst er ofte venstre-til-højre.",
    factEn:
      "Thousands of characters. Historically in columns; modern text is often left to right.",
    tags: ["logographic", "china", "asia"],
  },
  {
    id: "kana",
    nameDa: "Hiragana og katakana",
    nameEn: "Hiragana and katakana",
    glyphs: "あいうえお / アイウエオ",
    direction: "mixed",
    regionDa: "Japan",
    regionEn: "Japan",
    factDa:
      "To stavelsessystemer. Hiragana til japanske ord; katakana til lånord og vægt.",
    factEn:
      "Two syllabaries. Hiragana for Japanese words; katakana for loanwords and emphasis.",
    tags: ["syllabary", "japan", "asia"],
  },
  {
    id: "runes",
    nameDa: "Runer (futhark)",
    nameEn: "Runes (futhark)",
    glyphs: "ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ",
    direction: "ltr",
    regionDa: "Nord- og Centraleuropa i jernalder og vikingetid",
    regionEn: "Northern and Central Europe in the Iron Age and Viking Age",
    factDa:
      "Ældre futhark har 24 tegn. Danske runesten bruger især den yngre futhark.",
    factEn:
      "Elder Futhark has 24 signs. Danish rune stones mostly use the Younger Futhark.",
    tags: ["alphabet", "nordic", "historic", "denmark"],
  },
  {
    id: "cherokee",
    nameDa: "Cherokee-stavelsesskrift",
    nameEn: "Cherokee syllabary",
    glyphs: "Ꭰ Ꭱ Ꭲ Ꭳ Ꭴ Ꭵ Ꭶ Ꭷ",
    direction: "ltr",
    regionDa: "Cherokee Nation (Nordamerika)",
    regionEn: "Cherokee Nation (North America)",
    factDa:
      "Skabt af Sequoyah i begyndelsen af 1800-tallet. Hvert tegn er en stavelse.",
    factEn:
      "Created by Sequoyah in the early 1800s. Each character is a syllable.",
    tags: ["syllabary", "americas", "indigenous"],
  },
  {
    id: "braille",
    nameDa: "Braille",
    nameEn: "Braille",
    glyphs: "⠁ ⠃ ⠉ ⠙ ⠑ ⠋ ⠛ ⠓",
    direction: "ltr",
    regionDa: "Globalt (taktilt system for blinde og svagsynede)",
    regionEn: "Global (tactile system for blind and low-vision readers)",
    factDa:
      "Ikke et eget sprog, men en kode der spejler andre skriftsystemer. Krydsforbindelse: kan gengive latin, arabisk m.fl.",
    factEn:
      "Not a language of its own, but a code that mirrors other scripts. Cross-link: can represent Latin, Arabic, and more.",
    tags: ["tactile", "accessibility", "global"],
  },
];

export function searchScripts(query: string, da: boolean): WritingSystem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SCRIPTS;
  return SCRIPTS.filter((s) => {
    const name = (da ? s.nameDa : s.nameEn).toLowerCase();
    const region = (da ? s.regionDa : s.regionEn).toLowerCase();
    const fact = (da ? s.factDa : s.factEn).toLowerCase();
    return (
      name.includes(q) ||
      region.includes(q) ||
      fact.includes(q) ||
      s.glyphs.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q)) ||
      s.direction.includes(q)
    );
  });
}
