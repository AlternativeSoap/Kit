export type LangNode = {
  id: string;
  nameDa: string;
  nameEn: string;
  /** Approximate speaker count in millions; null for extinct / family nodes */
  speakersM: number | null;
  regionDa: string;
  regionEn: string;
  notesDa: string;
  notesEn: string;
  children?: LangNode[];
};

export const LANGUAGE_TREE: LangNode[] = [
  {
    id: "ie",
    nameDa: "Indoeuropæisk",
    nameEn: "Indo-European",
    speakersM: 3200,
    regionDa: "Europa, Sydasien, Amerika, Oceanien",
    regionEn: "Europe, South Asia, Americas, Oceania",
    notesDa:
      "Den største dokumenterede sprogfamilie. Proto-indoeuropæisk rekonstrueres fra fælles ord for slægt, husdyr og natur.",
    notesEn:
      "The largest documented language family. Proto-Indo-European is reconstructed from shared words for kinship, livestock, and nature.",
    children: [
      {
        id: "germanic",
        nameDa: "Germansk",
        nameEn: "Germanic",
        speakersM: 550,
        regionDa: "Nordeuropa, Nordamerika, Sydafrika, Oceanien",
        regionEn: "Northern Europe, North America, Southern Africa, Oceania",
        notesDa:
          "Deles i nord-, vest- og østgermansk. Dansk, svensk og norsk er nordgermanske.",
        notesEn:
          "Split into North, West, and East Germanic. Danish, Swedish, and Norwegian are North Germanic.",
        children: [
          {
            id: "da",
            nameDa: "Dansk",
            nameEn: "Danish",
            speakersM: 6,
            regionDa: "Danmark, Færøerne, Grønland, Sydslesvig",
            regionEn: "Denmark, Faroe Islands, Greenland, South Schleswig",
            notesDa:
              "Nordgermansk med bløde konsonanter og stød. Nært beslægtet med norsk og svensk.",
            notesEn:
              "North Germanic with soft consonants and stød. Closely related to Norwegian and Swedish.",
          },
          {
            id: "en",
            nameDa: "Engelsk",
            nameEn: "English",
            speakersM: 1400,
            regionDa: "Globalt (modersmål og andetsprog)",
            regionEn: "Global (first and second language)",
            notesDa:
              "Vestgermansk med tungt fransk/latin lån efter 1066. Verdens mest udbredte andetsprog.",
            notesEn:
              "West Germanic with heavy French/Latin borrowing after 1066. The world's most widespread second language.",
          },
          {
            id: "de",
            nameDa: "Tysk",
            nameEn: "German",
            speakersM: 130,
            regionDa: "Tyskland, Østrig, Schweiz, Liechtenstein",
            regionEn: "Germany, Austria, Switzerland, Liechtenstein",
            notesDa:
              "Vestgermansk med kasus og sammensatte ord. Standardtysk bygger på højtyske dialekter.",
            notesEn:
              "West Germanic with cases and compound words. Standard German builds on High German dialects.",
          },
          {
            id: "nl",
            nameDa: "Nederlandsk",
            nameEn: "Dutch",
            speakersM: 25,
            regionDa: "Nederlandene, Belgien, Surinam, Caribien",
            regionEn: "Netherlands, Belgium, Suriname, Caribbean",
            notesDa:
              "Vestgermansk mellem engelsk og tysk i lyd og ordforråd.",
            notesEn:
              "West Germanic, sitting between English and German in sound and vocabulary.",
          },
          {
            id: "sv",
            nameDa: "Svensk",
            nameEn: "Swedish",
            speakersM: 10,
            regionDa: "Sverige, Finland",
            regionEn: "Sweden, Finland",
            notesDa:
              "Nordgermansk med tonale accenter i mange dialekter.",
            notesEn:
              "North Germanic with pitch accent in many dialects.",
          },
        ],
      },
      {
        id: "romance",
        nameDa: "Romansk",
        nameEn: "Romance",
        speakersM: 900,
        regionDa: "Sydeuropa, Latinamerika, dele af Afrika",
        regionEn: "Southern Europe, Latin America, parts of Africa",
        notesDa:
          "Efterkommer af vulgærlatin. Fransk, spansk, portugisisk, italiensk og rumænsk er hovedgrene.",
        notesEn:
          "Descended from Vulgar Latin. French, Spanish, Portuguese, Italian, and Romanian are major branches.",
        children: [
          {
            id: "es",
            nameDa: "Spansk",
            nameEn: "Spanish",
            speakersM: 550,
            regionDa: "Spanien, Latinamerika, USA",
            regionEn: "Spain, Latin America, United States",
            notesDa:
              "Verdens næstmest talte modersmål. Klar stavelsesstruktur og rigt verbalsystem.",
            notesEn:
              "The world's second most spoken first language. Clear syllable structure and a rich verb system.",
          },
          {
            id: "fr",
            nameDa: "Fransk",
            nameEn: "French",
            speakersM: 300,
            regionDa: "Frankrig, Belgien, Schweiz, Vestafrika, Canada",
            regionEn: "France, Belgium, Switzerland, West Africa, Canada",
            notesDa:
              "Nasalvokaler og stumme bogstaver præger udtalen. Stærk litterær tradition.",
            notesEn:
              "Nasal vowels and silent letters shape pronunciation. A strong literary tradition.",
          },
          {
            id: "pt",
            nameDa: "Portugisisk",
            nameEn: "Portuguese",
            speakersM: 260,
            regionDa: "Portugal, Brasilien, Angola, Mozambique",
            regionEn: "Portugal, Brazil, Angola, Mozambique",
            notesDa:
              "Nært beslægtet med galicisk. Brasiliansk og europæisk portugisisk adskiller sig i udtale.",
            notesEn:
              "Closely related to Galician. Brazilian and European Portuguese differ in pronunciation.",
          },
          {
            id: "it",
            nameDa: "Italiensk",
            nameEn: "Italian",
            speakersM: 65,
            regionDa: "Italien, Schweiz, San Marino",
            regionEn: "Italy, Switzerland, San Marino",
            notesDa:
              "Bevarer mange latinske træk. Dialekter kan være meget forskellige fra standarden.",
            notesEn:
              "Keeps many Latin traits. Dialects can differ sharply from the standard.",
          },
        ],
      },
      {
        id: "slavic",
        nameDa: "Slavisk",
        nameEn: "Slavic",
        speakersM: 300,
        regionDa: "Øst-, Central- og Sydøsteuropa",
        regionEn: "Eastern, Central, and Southeastern Europe",
        notesDa:
          "Øst-, vest- og sydslavisk. Fælles træk er aspektsystem og rig morfologi.",
        notesEn:
          "East, West, and South Slavic. Shared traits include aspect and rich morphology.",
        children: [
          {
            id: "ru",
            nameDa: "Russisk",
            nameEn: "Russian",
            speakersM: 250,
            regionDa: "Rusland, Centralasien, Østeuropa",
            regionEn: "Russia, Central Asia, Eastern Europe",
            notesDa:
              "Østslavisk med kyrillisk skrift. Vigtigt lingua franca i det tidligere Sovjetunionen.",
            notesEn:
              "East Slavic with Cyrillic script. An important lingua franca in the former Soviet Union.",
          },
          {
            id: "pl",
            nameDa: "Polsk",
            nameEn: "Polish",
            speakersM: 40,
            regionDa: "Polen, diaspora i Europa og USA",
            regionEn: "Poland, diaspora in Europe and the U.S.",
            notesDa:
              "Vestslavisk med komplekse konsonantklynger og syv kasus.",
            notesEn:
              "West Slavic with complex consonant clusters and seven cases.",
          },
        ],
      },
      {
        id: "indo-iranian",
        nameDa: "Indoiransk",
        nameEn: "Indo-Iranian",
        speakersM: 1500,
        regionDa: "Sydasien, Iran, Afghanistan, Centralasien",
        regionEn: "South Asia, Iran, Afghanistan, Central Asia",
        notesDa:
          "Omfatter indoariske og iranske sprog. Sanskrit og avestisk er tidlige skriftformer.",
        notesEn:
          "Includes Indo-Aryan and Iranian languages. Sanskrit and Avestan are early written forms.",
        children: [
          {
            id: "hi",
            nameDa: "Hindi",
            nameEn: "Hindi",
            speakersM: 600,
            regionDa: "Nordindien, diaspora",
            regionEn: "Northern India, diaspora",
            notesDa:
              "Indoarisk med devanagari. Nært knyttet til urdu i talesprog.",
            notesEn:
              "Indo-Aryan with Devanagari script. Closely tied to Urdu in spoken form.",
          },
          {
            id: "fa",
            nameDa: "Persisk",
            nameEn: "Persian (Farsi)",
            speakersM: 110,
            regionDa: "Iran, Afghanistan (dari), Tadsjikistan",
            regionEn: "Iran, Afghanistan (Dari), Tajikistan",
            notesDa:
              "Iransk sprog med arabisk skrift i Iran. Rig digtertradition.",
            notesEn:
              "Iranian language with Arabic script in Iran. A rich poetic tradition.",
          },
        ],
      },
      {
        id: "celtic",
        nameDa: "Keltisk",
        nameEn: "Celtic",
        speakersM: 2,
        regionDa: "Irland, Skotland, Wales, Bretagne",
        regionEn: "Ireland, Scotland, Wales, Brittany",
        notesDa:
          "En lille men levende gren. Irsk, walisisk og bretonsk har officiel status i deres områder.",
        notesEn:
          "A small but living branch. Irish, Welsh, and Breton hold official status in their regions.",
        children: [
          {
            id: "ga",
            nameDa: "Irsk",
            nameEn: "Irish",
            speakersM: 1.2,
            regionDa: "Irland",
            regionEn: "Ireland",
            notesDa:
              "Goidelisk keltisk. Officielt sprog i Irland og EU, men engelsk dominerer i daglig brug.",
            notesEn:
              "Goidelic Celtic. Official in Ireland and the EU, though English dominates daily use.",
          },
        ],
      },
      {
        id: "hellenic",
        nameDa: "Hellensk",
        nameEn: "Hellenic",
        speakersM: 13,
        regionDa: "Grækenland, Cypern",
        regionEn: "Greece, Cyprus",
        notesDa:
          "Græsk har en ubrudt skrifttradition på over 3000 år.",
        notesEn:
          "Greek has an unbroken written tradition of over 3,000 years.",
        children: [
          {
            id: "el",
            nameDa: "Græsk",
            nameEn: "Greek",
            speakersM: 13,
            regionDa: "Grækenland, Cypern, diaspora",
            regionEn: "Greece, Cyprus, diaspora",
            notesDa:
              "Moderne græsk bygger på koiné og byzantinsk græsk. Eget alfabet.",
            notesEn:
              "Modern Greek builds on Koine and Byzantine Greek. Its own alphabet.",
          },
        ],
      },
    ],
  },
  {
    id: "sino-tibetan",
    nameDa: "Sino-tibetansk",
    nameEn: "Sino-Tibetan",
    speakersM: 1400,
    regionDa: "Kina, Himalaya, Sydøstasien",
    regionEn: "China, Himalayas, Southeast Asia",
    notesDa:
      "Omfatter kinesiske og tibeto-burmanske sprog. Mange er tonesprog.",
    notesEn:
      "Includes Chinese and Tibeto-Burman languages. Many are tonal.",
    children: [
      {
        id: "zh",
        nameDa: "Mandarin-kinesisk",
        nameEn: "Mandarin Chinese",
        speakersM: 1100,
        regionDa: "Kina, Taiwan, Singapore, diaspora",
        regionEn: "China, Taiwan, Singapore, diaspora",
        notesDa:
          "Største enkelt-sprog efter talere. Skrift bygger på tegn, der deles med andre kinesiske varieteter.",
        notesEn:
          "Largest single language by speakers. Writing uses characters shared with other Chinese varieties.",
      },
      {
        id: "bo",
        nameDa: "Tibetansk",
        nameEn: "Tibetan",
        speakersM: 6,
        regionDa: "Tibet, Nepal, Bhutan, Indien",
        regionEn: "Tibet, Nepal, Bhutan, India",
        notesDa:
          "Tibeto-burmansk med eget alfabet og vigtig buddhistisk litteratur.",
        notesEn:
          "Tibeto-Burman with its own alphabet and important Buddhist literature.",
      },
    ],
  },
  {
    id: "afro-asiatic",
    nameDa: "Afroasiatisk",
    nameEn: "Afro-Asiatic",
    speakersM: 500,
    regionDa: "Nordafrika, Sahel, Afrikas Horn, Mellemøsten",
    regionEn: "North Africa, Sahel, Horn of Africa, Middle East",
    notesDa:
      "Omfatter semitiske, berbiske, kushitiske og tchadiske grene. Ægyptisk er en uddød gren.",
    notesEn:
      "Includes Semitic, Berber, Cushitic, and Chadic branches. Egyptian is an extinct branch.",
    children: [
      {
        id: "ar",
        nameDa: "Arabisk",
        nameEn: "Arabic",
        speakersM: 370,
        regionDa: "Mellemøsten, Nordafrika",
        regionEn: "Middle East, North Africa",
        notesDa:
          "Semitisk med diglossi: modern standard arabisk ved siden af lokale dialekter.",
        notesEn:
          "Semitic with diglossia: Modern Standard Arabic alongside local dialects.",
      },
      {
        id: "he",
        nameDa: "Hebraisk",
        nameEn: "Hebrew",
        speakersM: 9,
        regionDa: "Israel, jødisk diaspora",
        regionEn: "Israel, Jewish diaspora",
        notesDa:
          "Genoplivet som dagligsprog i det 20. århundrede. Semitisk med konsontantskrift.",
        notesEn:
          "Revived as an everyday language in the 20th century. Semitic with a consonant script.",
      },
      {
        id: "am",
        nameDa: "Amharisk",
        nameEn: "Amharic",
        speakersM: 32,
        regionDa: "Etiopien",
        regionEn: "Ethiopia",
        notesDa:
          "Semitisk med etiopisk skrift (fidal). Officielt arbejdssprog i Etiopien.",
        notesEn:
          "Semitic with Ethiopic script (fidal). An official working language of Ethiopia.",
      },
    ],
  },
  {
    id: "uralic",
    nameDa: "Uralsk",
    nameEn: "Uralic",
    speakersM: 25,
    regionDa: "Nordeuropa, Ural, Vestibirien",
    regionEn: "Northern Europe, Urals, Western Siberia",
    notesDa:
      "Finsk-ugrisk og samojedisk. Ikke beslægtet med indoeuropæisk trods geografisk naboskab.",
    notesEn:
      "Finno-Ugric and Samoyedic. Not related to Indo-European despite geographic neighbors.",
    children: [
      {
        id: "fi",
        nameDa: "Finsk",
        nameEn: "Finnish",
        speakersM: 5,
        regionDa: "Finland, Sverige",
        regionEn: "Finland, Sweden",
        notesDa:
          "Agglutinerende med 15 kasus. Vokalharmoni er et kendetegn.",
        notesEn:
          "Agglutinative with 15 cases. Vowel harmony is a hallmark.",
      },
      {
        id: "hu",
        nameDa: "Ungarsk",
        nameEn: "Hungarian",
        speakersM: 13,
        regionDa: "Ungarn, nabolande",
        regionEn: "Hungary, neighboring countries",
        notesDa:
          "Ugrisk gren. Rig kasusbrug og lange sammensatte ord.",
        notesEn:
          "Ugric branch. Rich case use and long compound words.",
      },
    ],
  },
  {
    id: "austronesian",
    nameDa: "Austronesisk",
    nameEn: "Austronesian",
    speakersM: 380,
    regionDa: "Taiwan, Filippinerne, Indonesien, Madagaskar, Oceanien",
    regionEn: "Taiwan, Philippines, Indonesia, Madagascar, Oceania",
    notesDa:
      "En af verdens mest spredte familier til søs. Fra Taiwan til Påskeøen og Madagaskar.",
    notesEn:
      "One of the world's most widely spread families by sea. From Taiwan to Easter Island and Madagascar.",
    children: [
      {
        id: "id",
        nameDa: "Indonesisk",
        nameEn: "Indonesian",
        speakersM: 200,
        regionDa: "Indonesien",
        regionEn: "Indonesia",
        notesDa:
          "Standardiseret malajisk som nationalsprog. Relativt enkel morfologi.",
        notesEn:
          "Standardized Malay as a national language. Relatively simple morphology.",
      },
      {
        id: "tl",
        nameDa: "Tagalog / filippinsk",
        nameEn: "Tagalog / Filipino",
        speakersM: 80,
        regionDa: "Filippinerne",
        regionEn: "Philippines",
        notesDa:
          "Austronesisk med spansk og engelsk lån. Basis for filippinsk standardsprog.",
        notesEn:
          "Austronesian with Spanish and English loans. Basis for the Filipino standard.",
      },
    ],
  },
  {
    id: "niger-congo",
    nameDa: "Niger-congo",
    nameEn: "Niger-Congo",
    speakersM: 700,
    regionDa: "Afrika syd for Sahara",
    regionEn: "Sub-Saharan Africa",
    notesDa:
      "Verdens største familie efter antal sprog. Omfatter blandt andet bantu-grenen.",
    notesEn:
      "The world's largest family by number of languages. Includes the Bantu branch.",
    children: [
      {
        id: "sw",
        nameDa: "Swahili",
        nameEn: "Swahili",
        speakersM: 200,
        regionDa: "Østafrika",
        regionEn: "East Africa",
        notesDa:
          "Bantu med arabiske lån. Lingua franca i Østafrika.",
        notesEn:
          "Bantu with Arabic loans. A lingua franca of East Africa.",
      },
      {
        id: "yo",
        nameDa: "Yoruba",
        nameEn: "Yoruba",
        speakersM: 45,
        regionDa: "Nigeria, Benin, Togo",
        regionEn: "Nigeria, Benin, Togo",
        notesDa:
          "Tonesprog i Vestafrika med rig mundtlig og litterær tradition.",
        notesEn:
          "A tonal language of West Africa with a rich oral and literary tradition.",
      },
    ],
  },
  {
    id: "turkic",
    nameDa: "Tyrkisk (familie)",
    nameEn: "Turkic",
    speakersM: 180,
    regionDa: "Tyrkiet, Centralasien, Sibirien, Xinjiang",
    regionEn: "Turkey, Central Asia, Siberia, Xinjiang",
    notesDa:
      "Agglutinerende sprog med vokalharmoni. Tyrkisk, usbekisk og kasakhisk er store medlemmer.",
    notesEn:
      "Agglutinative languages with vowel harmony. Turkish, Uzbek, and Kazakh are major members.",
    children: [
      {
        id: "tr",
        nameDa: "Tyrkisk",
        nameEn: "Turkish",
        speakersM: 85,
        regionDa: "Tyrkiet, Cypern, diaspora i Europa",
        regionEn: "Turkey, Cyprus, diaspora in Europe",
        notesDa:
          "Latinsk alfabet siden 1928. SOV-ordstilling og tilføjede endelser.",
        notesEn:
          "Latin alphabet since 1928. SOV word order and suffixing.",
      },
    ],
  },
  {
    id: "japonic",
    nameDa: "Japonisk",
    nameEn: "Japonic",
    speakersM: 125,
    regionDa: "Japan, Ryukyu-øerne",
    regionEn: "Japan, Ryukyu Islands",
    notesDa:
      "Japansk og ryukyuanske sprog. Ofte behandlet som isolat-familie.",
    notesEn:
      "Japanese and Ryukyuan languages. Often treated as their own family.",
    children: [
      {
        id: "ja",
        nameDa: "Japansk",
        nameEn: "Japanese",
        speakersM: 125,
        regionDa: "Japan",
        regionEn: "Japan",
        notesDa:
          "Blander kana og kanji. Høflighedssystem og SOV-struktur præger grammatikken.",
        notesEn:
          "Mixes kana and kanji. Politeness systems and SOV structure shape the grammar.",
      },
    ],
  },
  {
    id: "koreanic",
    nameDa: "Koreansk (familie)",
    nameEn: "Koreanic",
    speakersM: 80,
    regionDa: "Korea, diaspora",
    regionEn: "Korea, diaspora",
    notesDa:
      "Koreansk med hangul-alfabetet. Ofte regnet som isolat eller egen familie.",
    notesEn:
      "Korean with the Hangul alphabet. Often counted as an isolate or its own family.",
    children: [
      {
        id: "ko",
        nameDa: "Koreansk",
        nameEn: "Korean",
        speakersM: 80,
        regionDa: "Nord- og Sydkorea, diaspora",
        regionEn: "North and South Korea, diaspora",
        notesDa:
          "Hangul er designet til sprogets lydsystem. Agglutinerende verbalsystem.",
        notesEn:
          "Hangul is designed for the language's sound system. Agglutinative verb system.",
      },
    ],
  },
];

export function flattenTree(nodes: LangNode[]): LangNode[] {
  const out: LangNode[] = [];
  const walk = (list: LangNode[]) => {
    for (const n of list) {
      out.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export function findNode(
  nodes: LangNode[],
  id: string,
): LangNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findNode(n.children, id);
      if (hit) return hit;
    }
  }
  return undefined;
}

export function formatSpeakers(m: number | null, da: boolean): string {
  if (m == null) return da ? "Ukendt / ikke relevant" : "Unknown / not applicable";
  if (m < 1) {
    const thousands = Math.round(m * 1000);
    return da ? `ca. ${thousands}.000` : `about ${thousands},000`;
  }
  if (m >= 1000) {
    const b = (m / 1000).toFixed(1).replace(/\.0$/, "");
    return da ? `ca. ${b} mia.` : `about ${b} billion`;
  }
  return da ? `ca. ${m} mio.` : `about ${m} million`;
}
