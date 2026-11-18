export type ElementCategory =
  | "alkali"
  | "alkaline-earth"
  | "transition"
  | "post-transition"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide"
  | "unknown";

export type ElementPhase = "solid" | "liquid" | "gas" | "unknown";

export type PeriodicElement = {
  z: number;
  symbol: string;
  nameEn: string;
  nameDa: string;
  /** Everyday Danish name if different from nameDa (e.g. brint for Hydrogen). */
  akaDa?: string;
  weight: string; // IUPAC 2021 abridged, brackets for radioactive e.g. "[238]"
  group: number | null; // 1-18, null for lanthanides/actinides shown in f-block (Ce-Yb, Th-No)
  period: number; // 1-7
  category: ElementCategory;
  phase: ElementPhase; // STP standard phase; synthetic unknown if not established
  electronConfig: string; // short noble-gas notation e.g. "[He] 2s1"
  summaryEn: string; // 2-3 educational sentences
  summaryDa: string;
  usesEn: string[]; // 2-5 concrete real-world uses
  usesDa: string[];
  deeperEn: string; // 1-2 paragraphs for "read more": chemistry context, history/discovery note, why it matters
  deeperDa: string;
};

export const ELEMENTS: PeriodicElement[] = [
  {
    z: 1,
    symbol: "H",
    nameEn: "Hydrogen",
    nameDa: "Hydrogen",
    akaDa: "brint",
    weight: "1.008",
    group: 1,
    period: 1,
    category: "nonmetal",
    phase: "gas",
    electronConfig: "1s1",
    summaryEn:
      "Hydrogen is the lightest and most abundant element in the universe. At room temperature it is a colourless, odourless gas made of H2 molecules. It sits in group 1 because it has one valence electron, but it behaves as a nonmetal.",
    summaryDa:
      "Brint er det letteste og mest udbredte grundstof i universet. Ved stuetemperatur er det en farveløs og lugtfri gas, der består af H2-molekyler. Det står i gruppe 1, fordi det har én valenselektron, men det opfører sig som et ikke-metal.",
    usesEn: [
      "Producing ammonia for fertiliser in the Haber-Bosch process",
      "Refining petroleum and removing sulphur from fuels",
      "Fuel for rockets and for hydrogen fuel cells",
      "Hydrogenating vegetable oils in the food industry",
    ],
    usesDa: [
      "Fremstilling af ammoniak til gødning i Haber-Bosch-processen",
      "Raffinering af olie og fjernelse af svovl fra brændstof",
      "Brændstof til raketter og brintbrændselsceller",
      "Hærdning af vegetabilske olier i fødevareindustrien",
    ],
    deeperEn:
      "Henry Cavendish identified hydrogen as a distinct substance in 1766 when he made it by dissolving metals in acid, and Antoine Lavoisier gave it its name, meaning water-former, because it burns to produce water. Most of the Sun's energy comes from fusing hydrogen nuclei into helium.\n\nOn Earth almost all hydrogen is bound in water and in organic compounds, so free H2 must be produced. Today most of it comes from natural gas, while electrolysis of water with renewable electricity is the main route to low-carbon hydrogen. Hydrogen is also central to acid-base chemistry, since an acid is a source of H+ ions.",
    deeperDa:
      "Henry Cavendish udskilte brint som et selvstændigt stof i 1766 ved at opløse metaller i syre, og Antoine Lavoisier gav det navnet, som betyder vanddanner, fordi det brænder til vand. Det meste af Solens energi stammer fra fusion af brintkerner til helium.\n\nPå Jorden er næsten al brint bundet i vand og organiske forbindelser, så frit H2 skal fremstilles. I dag kommer det meste fra naturgas, mens elektrolyse af vand med vedvarende strøm er den vigtigste vej til brint med lavt CO2-aftryk. Brint er også central i syre-base-kemi, fordi en syre er en kilde til H+-ioner.",
  },
  {
    z: 2,
    symbol: "He",
    nameEn: "Helium",
    nameDa: "Helium",
    weight: "4.0026",
    group: 18,
    period: 1,
    category: "noble-gas",
    phase: "gas",
    electronConfig: "1s2",
    summaryEn:
      "Helium is a colourless, inert noble gas and the second lightest element. It has the lowest boiling point of any substance, about 4 K at normal pressure. Its full first electron shell makes it essentially unreactive.",
    summaryDa:
      "Helium er en farveløs og inert ædelgas og det næstletteste grundstof. Det har det laveste kogepunkt af alle stoffer, omkring 4 K ved normalt tryk. Den fyldte inderste elektronskal gør det stort set uden reaktivitet.",
    usesEn: [
      "Cooling superconducting magnets in MRI scanners",
      "Lifting gas for weather balloons and airships",
      "Protective atmosphere for arc welding and crystal growth",
      "Breathing mixtures for deep diving",
    ],
    usesDa: [
      "Køling af superledende magneter i MR-scannere",
      "Løftegas i vejrballoner og luftskibe",
      "Beskyttende atmosfære ved buesvejsning og krystalvækst",
      "Åndedrætsblandinger til dybdykning",
    ],
    deeperEn:
      "Helium was first detected in 1868 as a bright yellow line in the spectrum of the Sun during an eclipse, before anyone had found it on Earth. William Ramsay isolated it from a uranium mineral in 1895. The name comes from the Greek word for the Sun, helios.\n\nTerrestrial helium is produced by the alpha decay of uranium and thorium deep underground and collects in natural gas fields. Because it is so light, it escapes into space once released, which makes it a finite resource that is increasingly recycled in laboratories. Liquid helium is essential for reaching temperatures near absolute zero, where superconductivity and superfluidity appear.",
    deeperDa:
      "Helium blev første gang observeret i 1868 som en kraftig gul linje i Solens spektrum under en solformørkelse, længe før nogen fandt det på Jorden. William Ramsay isolerede det fra et uranmineral i 1895. Navnet kommer af det græske ord for Solen, helios.\n\nHelium på Jorden dannes ved alfa-henfald af uran og thorium dybt nede og samler sig i naturgasfelter. Fordi det er så let, slipper det ud i rummet, når det først er frigivet, så det er en begrænset ressource, som i stigende grad genbruges i laboratorier. Flydende helium er nødvendigt for at nå temperaturer tæt på det absolutte nulpunkt, hvor superledning og superfluiditet optræder.",
  },
  {
    z: 3,
    symbol: "Li",
    nameEn: "Lithium",
    nameDa: "Lithium",
    weight: "6.94",
    group: 1,
    period: 2,
    category: "alkali",
    phase: "solid",
    electronConfig: "[He] 2s1",
    summaryEn:
      "Lithium is a soft, silvery alkali metal and the lightest of all metals. It reacts readily with water and air, so it is stored under oil or in an inert atmosphere. Its compounds are central to modern rechargeable batteries.",
    summaryDa:
      "Lithium er et blødt, sølvskinnende alkalimetal og det letteste af alle metaller. Det reagerer let med vand og luft og opbevares derfor under olie eller i inert atmosfære. Dets forbindelser er centrale i moderne genopladelige batterier.",
    usesEn: [
      "Rechargeable lithium-ion batteries in phones, laptops and electric cars",
      "Lithium carbonate as a mood-stabilising medicine for bipolar disorder",
      "Heat-resistant glass and ceramics",
      "Lithium grease for lubricating machinery",
    ],
    usesDa: [
      "Genopladelige lithium-ion-batterier i telefoner, computere og elbiler",
      "Lithiumcarbonat som stemningsstabiliserende medicin ved bipolar lidelse",
      "Varmebestandigt glas og keramik",
      "Lithiumfedt til smøring af maskiner",
    ],
    deeperEn:
      "Johan August Arfwedson discovered lithium in 1817 in the mineral petalite from the island of Utö in Sweden. The name comes from the Greek lithos, meaning stone, because it was found in a mineral rather than in plant or animal material.\n\nLithium has a very low reduction potential and a small ion, which lets lithium-ion batteries store a lot of energy per kilogram. Demand has grown rapidly with electric vehicles and grid storage, and the metal is obtained from brines in South America and from hard-rock ores such as spodumene in Australia. Recycling and lower-impact extraction are active areas of research.",
    deeperDa:
      "Johan August Arfwedson opdagede lithium i 1817 i mineralet petalit fra øen Utö i Sverige. Navnet kommer af det græske lithos, der betyder sten, fordi det blev fundet i et mineral og ikke i plante- eller dyremateriale.\n\nLithium har et meget lavt reduktionspotentiale og en lille ion, hvilket gør, at lithium-ion-batterier kan lagre meget energi pr. kilogram. Efterspørgslen er vokset hurtigt med elbiler og lagring af strøm til nettet, og metallet udvindes fra saltlage i Sydamerika og fra bjergarter som spodumen i Australien. Genbrug og mindre belastende udvinding er aktive forskningsområder.",
  },
  {
    z: 4,
    symbol: "Be",
    nameEn: "Beryllium",
    nameDa: "Beryllium",
    weight: "9.0122",
    group: 2,
    period: 2,
    category: "alkaline-earth",
    phase: "solid",
    electronConfig: "[He] 2s2",
    summaryEn:
      "Beryllium is a light, hard, grey alkaline earth metal with a high melting point. It is unusually stiff for its weight. Beryllium dust and its compounds are toxic and must be handled with strict precautions.",
    summaryDa:
      "Beryllium er et let, hårdt og gråt jordalkalimetal med højt smeltepunkt. Det er usædvanligt stift i forhold til sin vægt. Berylliumstøv og berylliumforbindelser er giftige og kræver strenge sikkerhedsforanstaltninger.",
    usesEn: [
      "Mirrors and structural parts in space telescopes such as the James Webb Space Telescope",
      "Beryllium copper alloys for springs, connectors and non-sparking tools",
      "X-ray windows because the metal is very transparent to X-rays",
      "Gemstones such as emerald and aquamarine, which are beryllium minerals",
    ],
    usesDa: [
      "Spejle og bærende dele i rumteleskoper som James Webb-teleskopet",
      "Beryllium-kobber-legeringer til fjedre, stikforbindelser og værktøj, der ikke giver gnister",
      "Vinduer til røntgenudstyr, fordi metallet er meget gennemsigtigt for røntgenstråler",
      "Ædelsten som smaragd og akvamarin, der er berylliummineraler",
    ],
    deeperEn:
      "Louis-Nicolas Vauquelin found beryllium in the minerals beryl and emerald in 1798, and the metal was first isolated in 1828 by Friedrich Wöhler and Antoine Bussy. The name refers to beryl.\n\nIts small, highly charged ion gives beryllium chemistry a covalent character that is unusual for a metal and resembles aluminium more than magnesium. Inhaling fine beryllium particles can cause chronic beryllium disease, a serious lung condition, so industrial use is tightly regulated. Beryllium is also rare in nature, formed mainly by cosmic-ray splitting of heavier nuclei rather than inside stars.",
    deeperDa:
      "Louis-Nicolas Vauquelin fandt beryllium i mineralerne beryl og smaragd i 1798, og metallet blev først isoleret i 1828 af Friedrich Wöhler og Antoine Bussy. Navnet henviser til beryl.\n\nBerylliums lille, stærkt ladede ion giver kemien et kovalent præg, der er usædvanligt for et metal og minder mere om aluminium end om magnesium. Indånding af fine berylliumpartikler kan give kronisk berylliumsygdom, en alvorlig lungesygdom, så industriel brug er strengt reguleret. Beryllium er også sjældent i naturen og dannes hovedsageligt ved, at kosmisk stråling splitter tungere kerner, og ikke inde i stjerner.",
  },
  {
    z: 5,
    symbol: "B",
    nameEn: "Boron",
    nameDa: "Bor",
    weight: "10.81",
    group: 13,
    period: 2,
    category: "metalloid",
    phase: "solid",
    electronConfig: "[He] 2s2 2p1",
    summaryEn:
      "Boron is a hard, brittle metalloid that is rarely found in its pure form in nature. It forms strong covalent compounds and is an essential micronutrient for plants. Its compounds range from household borax to materials harder than most steels.",
    summaryDa:
      "Bor er et hårdt og sprødt halvmetal, som sjældent findes rent i naturen. Det danner stærke kovalente forbindelser og er et livsnødvendigt mikronæringsstof for planter. Forbindelserne spænder fra borax i hjemmet til materialer, der er hårdere end de fleste stål.",
    usesEn: [
      "Borosilicate glass for laboratory glassware and ovenware",
      "Borax and boric acid in detergents, insecticides and flame retardants",
      "Boron fibres and boron carbide in armour and cutting tools",
      "Boron control rods in nuclear reactors",
      "Fertiliser additive that prevents boron deficiency in crops",
    ],
    usesDa: [
      "Borosilikatglas til laboratorieglas og ovnfaste glas",
      "Borax og borsyre i vaskemidler, insektmidler og brandhæmmende midler",
      "Borfibre og borcarbid i panser og skærende værktøj",
      "Kontrolstave med bor i atomreaktorer",
      "Gødningstilsætning, der forebygger bormangel hos afgrøder",
    ],
    deeperEn:
      "Borax has been used since antiquity for glazes and metalwork, but elemental boron was only isolated impure in 1808 by Joseph Louis Gay-Lussac, Louis-Jacques Thénard and Humphry Davy. The name comes from borax, the mineral from which boron was first prepared.\n\nBoron has only three valence electrons, so its compounds are often electron-deficient and act as Lewis acids. Boron-10 absorbs neutrons strongly, which is why it is used in reactor control and in experimental cancer treatment called boron neutron capture therapy. Large deposits of borate minerals are found in Turkey and California.",
    deeperDa:
      "Borax har været brugt siden oldtiden til glasurer og metalarbejde, men grundstoffet bor blev først isoleret i urent tilstand i 1808 af Joseph Louis Gay-Lussac, Louis-Jacques Thénard og Humphry Davy. Navnet kommer af borax, det mineral bor først blev udvundet fra.\n\nBor har kun tre valenselektroner, så forbindelserne mangler ofte elektroner og virker som Lewis-syrer. Bor-10 optager neutroner meget effektivt, hvilket bruges til regulering af atomreaktorer og i eksperimentel kræftbehandling, der kaldes bor-neutronindfangningsterapi. Store forekomster af boratmineraler findes i Tyrkiet og Californien.",
  },
  {
    z: 6,
    symbol: "C",
    nameEn: "Carbon",
    nameDa: "Carbon",
    akaDa: "kulstof",
    weight: "12.011",
    group: 14,
    period: 2,
    category: "nonmetal",
    phase: "solid",
    electronConfig: "[He] 2s2 2p2",
    summaryEn:
      "Carbon is the basis of all known life and of organic chemistry. It forms stable chains and rings and occurs as diamond, graphite, graphene and fullerenes. It is the fourth most abundant element in the universe by mass.",
    summaryDa:
      "Kulstof er grundlaget for alt kendt liv og for organisk kemi. Det danner stabile kæder og ringe og findes som diamant, grafit, grafen og fullerener. Det er det fjerdemest almindelige grundstof i universet regnet efter masse.",
    usesEn: [
      "Fuels such as coal, oil and natural gas",
      "Steel production, where carbon sets hardness",
      "Graphite in pencils, electrodes and lithium-ion battery anodes",
      "Diamond for jewellery and industrial cutting and drilling",
      "Carbon fibre in aircraft, bicycles and wind turbine blades",
    ],
    usesDa: [
      "Brændsler som kul, olie og naturgas",
      "Stålproduktion, hvor kulstof bestemmer hårdheden",
      "Grafit i blyanter, elektroder og anoder i lithium-ion-batterier",
      "Diamant til smykker og til skæring og boring i industrien",
      "Kulfiber i fly, cykler og vindmøllevinger",
    ],
    deeperEn:
      "Carbon has been known since prehistory as soot and charcoal. Lavoisier recognised it as an element in 1789, and the name comes from the Latin carbo, meaning coal. Diamond and graphite are the same element with different bonding, which shows how structure controls properties.\n\nCarbon can form four strong covalent bonds, including bonds to other carbon atoms, and this makes the millions of organic compounds possible. Carbon moves through the atmosphere, oceans, living things and rocks in the carbon cycle, and burning fossil carbon adds carbon dioxide to the air faster than natural processes remove it. The isotope carbon-14 is used to date organic remains up to about 50,000 years old.",
    deeperDa:
      "Kulstof har været kendt siden forhistorien som sod og trækul. Lavoisier anerkendte det som grundstof i 1789, og navnet kommer af latin carbo, der betyder kul. Diamant og grafit er det samme grundstof med forskellig binding, hvilket viser, hvordan strukturen styrer egenskaberne.\n\nKulstof kan danne fire stærke kovalente bindinger, også til andre kulstofatomer, og det gør de mange millioner organiske forbindelser mulige. Kulstof bevæger sig mellem atmosfære, have, levende organismer og bjergarter i kulstofkredsløbet, og afbrænding af fossilt kulstof tilfører luften kuldioxid hurtigere, end naturlige processer kan fjerne det. Isotopen kulstof-14 bruges til at datere organiske rester op til omkring 50.000 år gamle.",
  },
  {
    z: 7,
    symbol: "N",
    nameEn: "Nitrogen",
    nameDa: "Nitrogen",
    akaDa: "kvælstof",
    weight: "14.007",
    group: 15,
    period: 2,
    category: "nonmetal",
    phase: "gas",
    electronConfig: "[He] 2s2 2p3",
    summaryEn:
      "Nitrogen is a colourless, odourless gas that makes up about 78 percent of Earth's atmosphere. The triple bond in N2 makes it very unreactive. It is a key element in proteins, DNA and fertilisers.",
    summaryDa:
      "Kvælstof er en farveløs og lugtfri gas, der udgør omkring 78 procent af Jordens atmosfære. Tripelbindingen i N2 gør det meget ureaktivt. Det er et nøgleelement i proteiner, DNA og gødning.",
    usesEn: [
      "Ammonia and nitrate fertilisers that support global food production",
      "Liquid nitrogen for freezing food, samples and biological material",
      "Inert atmosphere in food packaging and electronics manufacturing",
      "Explosives and airbag propellants based on nitrogen compounds",
    ],
    usesDa: [
      "Ammoniak og nitratgødning, der understøtter verdens fødevareproduktion",
      "Flydende kvælstof til nedfrysning af fødevarer, prøver og biologisk materiale",
      "Inert atmosfære i fødevareemballage og elektronikproduktion",
      "Sprængstoffer og drivmidler i airbags baseret på kvælstofforbindelser",
    ],
    deeperEn:
      "Daniel Rutherford isolated nitrogen in 1772 as the gas left over when oxygen and carbon dioxide were removed from air. The name nitrogen, meaning nitre-former, was given later by Jean-Antoine Chaptal. The Danish name kvælstof, literally choking substance, refers to the fact that animals suffocate in pure nitrogen.\n\nPlants cannot use atmospheric N2 directly. Certain bacteria and lightning convert it into usable compounds, and since 1909 the Haber-Bosch process has done the same industrially, underpinning much of the world's nitrogen fertiliser and thereby a large share of global food production. Excess nitrogen from agriculture also runs into waterways and causes oxygen depletion in coastal waters, a major environmental concern in Denmark.",
    deeperDa:
      "Daniel Rutherford isolerede kvælstof i 1772 som den gas, der var tilbage, når ilt og kuldioxid var fjernet fra luft. Navnet nitrogen, der betyder salpeterdanner, kom senere fra Jean-Antoine Chaptal. Det danske navn kvælstof henviser til, at dyr kvæles i rent kvælstof.\n\nPlanter kan ikke bruge luftens N2 direkte. Visse bakterier og lyn omdanner det til brugbare forbindelser, og siden 1909 har Haber-Bosch-processen gjort det samme industrielt og understøtter en stor del af verdens kvælstofgødning og dermed en væsentlig andel af den globale fødevareproduktion. Overskydende kvælstof fra landbruget løber også ud i vandløb og giver iltsvind i kystnære farvande, hvilket er et stort miljøproblem i Danmark.",
  },
  {
    z: 8,
    symbol: "O",
    nameEn: "Oxygen",
    nameDa: "Oxygen",
    akaDa: "ilt",
    weight: "15.999",
    group: 16,
    period: 2,
    category: "nonmetal",
    phase: "gas",
    electronConfig: "[He] 2s2 2p4",
    summaryEn:
      "Oxygen is a reactive nonmetal that makes up about 21 percent of the atmosphere and almost half of the mass of Earth's crust. Most living organisms need it for respiration. It forms oxides with nearly every other element.",
    summaryDa:
      "Ilt er et reaktivt ikke-metal, der udgør omkring 21 procent af atmosfæren og næsten halvdelen af massen i Jordens skorpe. De fleste levende organismer har brug for det til respiration. Det danner oxider med næsten alle andre grundstoffer.",
    usesEn: [
      "Medical oxygen for patients with breathing difficulties",
      "Steelmaking, where oxygen blown into molten iron removes carbon",
      "Oxy-fuel welding and cutting",
      "Liquid oxygen as rocket oxidiser",
      "Water treatment and bleaching with ozone and peroxides",
    ],
    usesDa: [
      "Medicinsk ilt til patienter med vejrtrækningsproblemer",
      "Stålfremstilling, hvor ilt blæst ind i smeltet jern fjerner kulstof",
      "Svejsning og skæring med ilt og brændgas",
      "Flydende ilt som oxidator i raketter",
      "Vandrensning og blegning med ozon og peroxider",
    ],
    deeperEn:
      "Carl Wilhelm Scheele, Joseph Priestley and Antoine Lavoisier all contributed to the discovery of oxygen in the 1770s. Lavoisier named it oxygène, meaning acid-former, after a mistaken belief that all acids contain oxygen. The Danish name ilt refers to its role in burning.\n\nFree oxygen is a product of photosynthesis. It accumulated in the atmosphere about 2.4 billion years ago in the Great Oxidation Event, which changed life on Earth. Oxygen exists as O2 and as ozone, O3, and the ozone layer in the stratosphere absorbs harmful ultraviolet radiation. Its high electronegativity makes it a strong oxidising agent in both biology and industry.",
    deeperDa:
      "Carl Wilhelm Scheele, Joseph Priestley og Antoine Lavoisier bidrog alle til opdagelsen af ilt i 1770'erne. Lavoisier kaldte det oxygène, der betyder syredanner, ud fra en fejlagtig forestilling om, at alle syrer indeholder ilt. Det danske navn ilt henviser til dets rolle ved forbrænding.\n\nFrit ilt er et produkt af fotosyntese. Det ophobedes i atmosfæren for omkring 2,4 milliarder år siden i den store iltningsbegivenhed, som ændrede livet på Jorden. Ilt findes som O2 og som ozon, O3, og ozonlaget i stratosfæren optager skadelig ultraviolet stråling. Den høje elektronegativitet gør det til et stærkt oxidationsmiddel i både biologi og industri.",
  },
  {
    z: 9,
    symbol: "F",
    nameEn: "Fluorine",
    nameDa: "Fluor",
    weight: "18.998",
    group: 17,
    period: 2,
    category: "halogen",
    phase: "gas",
    electronConfig: "[He] 2s2 2p5",
    summaryEn:
      "Fluorine is a pale yellow, highly toxic gas and the most electronegative and reactive of all elements. It combines with almost every other element, including some noble gases. In compounds it is stable and often very inert.",
    summaryDa:
      "Fluor er en lysegul, meget giftig gas og det mest elektronegative og reaktive af alle grundstoffer. Det forbinder sig med næsten alle andre grundstoffer, også nogle ædelgasser. I forbindelser er det stabilt og ofte meget inert.",
    usesEn: [
      "Fluoride in toothpaste and drinking water to reduce tooth decay",
      "Non-stick coatings such as PTFE and waterproof fabrics",
      "Uranium enrichment through uranium hexafluoride",
      "Refrigerants and pharmaceuticals, where fluorine changes how a molecule behaves in the body",
    ],
    usesDa: [
      "Fluorid i tandpasta og drikkevand til at modvirke huller i tænderne",
      "Slipfaste belægninger som PTFE og vandafvisende stoffer",
      "Uranberigelse via uranhexafluorid",
      "Kølemidler og lægemidler, hvor fluor ændrer et molekyles opførsel i kroppen",
    ],
    deeperEn:
      "Fluorspar, the mineral calcium fluoride, was used as a flux in metalworking long before the element was known. Many chemists were injured or killed trying to isolate fluorine, and Henri Moissan finally succeeded in 1886 by electrolysing a solution of potassium fluoride in hydrogen fluoride, work that earned him the 1906 Nobel Prize in Chemistry.\n\nThe carbon-fluorine bond is one of the strongest in organic chemistry, which makes fluorinated compounds durable. That durability is useful in medicine and materials but also causes concern for persistent PFAS chemicals that accumulate in the environment. Hydrogen fluoride is dangerous and needs special handling because it penetrates skin and binds calcium in tissue.",
    deeperDa:
      "Fluorspat, mineralet calciumfluorid, blev brugt som flusmiddel i metalarbejde længe før grundstoffet var kendt. Mange kemikere kom til skade eller omkom under forsøg på at isolere fluor, og Henri Moissan lykkedes endelig i 1886 ved elektrolyse af kaliumfluorid opløst i hydrogenfluorid, et arbejde der gav ham Nobelprisen i kemi i 1906.\n\nBindingen mellem kulstof og fluor er en af de stærkeste i organisk kemi, hvilket gør fluorerede stoffer holdbare. Det er nyttigt i medicin og materialer, men giver også bekymring for vedvarende PFAS-stoffer, der ophobes i miljøet. Hydrogenfluorid er farligt og kræver særlig håndtering, fordi det trænger gennem huden og binder calcium i vævet.",
  },
  {
    z: 10,
    symbol: "Ne",
    nameEn: "Neon",
    nameDa: "Neon",
    weight: "20.180",
    group: 18,
    period: 2,
    category: "noble-gas",
    phase: "gas",
    electronConfig: "[He] 2s2 2p6",
    summaryEn:
      "Neon is a colourless, inert noble gas that glows reddish orange when an electric current passes through it. It forms no stable compounds under normal conditions. It is rare in the atmosphere, at about 18 parts per million.",
    summaryDa:
      "Neon er en farveløs, inert ædelgas, der lyser rødorange, når der sendes elektrisk strøm igennem den. Den danner ingen stabile forbindelser under normale forhold. Den er sjælden i atmosfæren, omkring 18 dele pr. million.",
    usesEn: [
      "Neon signs and decorative lighting",
      "Cryogenic refrigerant at around 27 K",
      "Helium-neon lasers used for alignment and scanning",
      "Indicator lamps and high-voltage detectors",
    ],
    usesDa: [
      "Neonskilte og dekorativ belysning",
      "Kryogent kølemiddel ved omkring 27 K",
      "Helium-neon-lasere til opstilling og scanning",
      "Indikatorlamper og højspændingsdetektorer",
    ],
    deeperEn:
      "William Ramsay and Morris Travers discovered neon in 1898 by cooling air to a liquid and letting its components boil off one at a time. Travers described the brilliant crimson glow of the new gas in a discharge tube. The name comes from the Greek neos, meaning new.\n\nNeon has a full outer shell of eight electrons, which explains its lack of reactivity. Its light comes from excited electrons dropping back to lower energy levels and emitting photons at characteristic wavelengths. Many signs called neon actually contain argon or other gases and phosphor coatings to give colours other than red. Neon is made industrially by fractional distillation of liquid air.",
    deeperDa:
      "William Ramsay og Morris Travers opdagede neon i 1898 ved at afkøle luft til væske og lade bestanddelene koge af én ad gangen. Travers beskrev den nye gas' kraftige karmoisinrøde glød i et udladningsrør. Navnet kommer af det græske neos, der betyder ny.\n\nNeon har en fyldt yderste skal med otte elektroner, hvilket forklarer, at det ikke reagerer. Lyset opstår, når exciterede elektroner falder tilbage til lavere energiniveauer og udsender fotoner med bestemte bølgelængder. Mange skilte, der kaldes neon, indeholder i virkeligheden argon eller andre gasser samt fluorescerende belægninger for at give andre farver end rød. Neon fremstilles industrielt ved fraktioneret destillation af flydende luft.",
  },
  {
    z: 11,
    symbol: "Na",
    nameEn: "Sodium",
    nameDa: "Natrium",
    weight: "22.990",
    group: 1,
    period: 3,
    category: "alkali",
    phase: "solid",
    electronConfig: "[Ne] 3s1",
    summaryEn:
      "Sodium is a soft, silvery alkali metal that reacts violently with water. It is never found free in nature because it oxidises so quickly. Sodium ions are essential for nerve signals and fluid balance in the body.",
    summaryDa:
      "Natrium er et blødt, sølvskinnende alkalimetal, der reagerer voldsomt med vand. Det findes aldrig frit i naturen, fordi det oxiderer så hurtigt. Natriumioner er nødvendige for nervesignaler og væskebalance i kroppen.",
    usesEn: [
      "Table salt, sodium chloride, for food and preservation",
      "Sodium hydroxide for soap, paper and aluminium production",
      "Sodium vapour street lamps with a yellow glow",
      "Liquid sodium as a coolant in some fast nuclear reactors",
      "Sodium bicarbonate as baking soda",
    ],
    usesDa: [
      "Køkkensalt, natriumchlorid, til mad og konservering",
      "Natriumhydroxid til sæbe, papir og aluminiumsproduktion",
      "Natriumlamper til vejbelysning med gult lys",
      "Flydende natrium som kølemiddel i nogle hurtige atomreaktorer",
      "Natriumbicarbonat som natron til bagning",
    ],
    deeperEn:
      "Humphry Davy isolated sodium in 1807 by electrolysing moist sodium hydroxide. The symbol Na comes from the Latin natrium, which in turn derives from natron, a naturally occurring sodium carbonate mineral used in ancient Egypt. The English name comes from soda.\n\nSodium has a single outer electron that it gives up easily to form Na+, which explains its strong reactivity and its role in ionic compounds. In living cells, sodium-potassium pumps maintain a concentration difference across membranes that drives nerve impulses and nutrient uptake. Industrially the metal is made by electrolysis of molten sodium chloride in the Downs process.",
    deeperDa:
      "Humphry Davy isolerede natrium i 1807 ved elektrolyse af fugtigt natriumhydroxid. Symbolet Na kommer af latin natrium, som igen stammer fra natron, et naturligt forekommende natriumcarbonatmineral, der blev brugt i det gamle Egypten. Det engelske navn kommer af soda.\n\nNatrium har én yderelektron, som det let afgiver for at danne Na+, hvilket forklarer den stærke reaktivitet og rollen i ionforbindelser. I levende celler opretholder natrium-kalium-pumper en forskel i koncentration over membranerne, som driver nerveimpulser og optagelse af næringsstoffer. Industrielt fremstilles metallet ved elektrolyse af smeltet natriumchlorid i Downs-processen.",
  },
  {
    z: 12,
    symbol: "Mg",
    nameEn: "Magnesium",
    nameDa: "Magnesium",
    weight: "24.305",
    group: 2,
    period: 3,
    category: "alkaline-earth",
    phase: "solid",
    electronConfig: "[Ne] 3s2",
    summaryEn:
      "Magnesium is a light, silvery-white alkaline earth metal that burns with a brilliant white flame. It is the eighth most abundant element in Earth's crust. Magnesium sits at the centre of chlorophyll, so it is essential for photosynthesis.",
    summaryDa:
      "Magnesium er et let, sølvhvidt jordalkalimetal, der brænder med en skarp hvid flamme. Det er det ottende mest almindelige grundstof i Jordens skorpe. Magnesium sidder i midten af klorofyl og er derfor nødvendigt for fotosyntesen.",
    usesEn: [
      "Lightweight alloys for car parts, laptops and aircraft components",
      "Alloying element in aluminium cans and engine parts",
      "Flares, fireworks and sparklers",
      "Magnesium oxide in refractory bricks and magnesium sulphate in medicine and bath salts",
    ],
    usesDa: [
      "Lette legeringer til bildele, computere og flydele",
      "Legeringselement i aluminiumsdåser og motordele",
      "Nødblus, fyrværkeri og stjernekastere",
      "Magnesiumoxid i ildfaste sten og magnesiumsulfat i medicin og badesalt",
    ],
    deeperEn:
      "Joseph Black showed in 1755 that magnesia is not the same as lime, and Humphry Davy isolated the metal in 1808. The name comes from Magnesia, a region of Greece where magnesium-rich minerals were found.\n\nMagnesium is about two thirds as dense as aluminium, which makes its alloys attractive wherever weight matters, although fine shavings and powder are a fire hazard and cannot be put out with water. In the body it activates hundreds of enzymes and plays a role in muscle function and energy metabolism. Most magnesium metal is produced from seawater or from brines and dolomite.",
    deeperDa:
      "Joseph Black viste i 1755, at magnesia ikke er det samme som kalk, og Humphry Davy isolerede metallet i 1808. Navnet kommer af Magnesia, en egn i Grækenland, hvor magnesiumrige mineraler blev fundet.\n\nMagnesium har omkring to tredjedele af aluminiums massefylde, hvilket gør legeringerne attraktive, hvor vægten betyder noget, men fine spåner og pulver er en brandfare og kan ikke slukkes med vand. I kroppen aktiverer magnesium hundredvis af enzymer og spiller en rolle for muskelfunktion og energiomsætning. Det meste magnesiummetal fremstilles af havvand eller saltlage og dolomit.",
  },
  {
    z: 13,
    symbol: "Al",
    nameEn: "Aluminium",
    nameDa: "Aluminium",
    weight: "26.982",
    group: 13,
    period: 3,
    category: "post-transition",
    phase: "solid",
    electronConfig: "[Ne] 3s2 3p1",
    summaryEn:
      "Aluminium is a light, silvery metal that resists corrosion because a thin oxide layer forms on its surface. It is the most abundant metal in Earth's crust. Recycling it needs only about five percent of the energy of making it from ore.",
    summaryDa:
      "Aluminium er et let, sølvskinnende metal, der modstår korrosion, fordi der dannes et tyndt oxidlag på overfladen. Det er det mest almindelige metal i Jordens skorpe. Genbrug kræver kun omkring fem procent af den energi, der går til at fremstille det af malm.",
    usesEn: [
      "Aircraft, trains and car bodies, where low weight saves fuel",
      "Beverage cans, foil and food packaging",
      "Overhead power lines and electrical wiring",
      "Window frames and building facades",
    ],
    usesDa: [
      "Fly, tog og karosserier, hvor lav vægt sparer brændstof",
      "Drikkevaredåser, folie og fødevareemballage",
      "Elledninger og elektriske installationer",
      "Vinduesrammer og facader på bygninger",
    ],
    deeperEn:
      "Hans Christian Ørsted, a Danish physicist, produced the first small amount of impure aluminium in 1825, and Friedrich Wöhler improved the method in 1827. For several decades the metal was more valuable than gold. In 1886 Charles Martin Hall and Paul Héroult independently invented the electrolytic process that made it cheap.\n\nAluminium is extracted from bauxite, first refined to alumina and then reduced by electrolysis in molten cryolite, which uses large amounts of electricity. Its oxide layer is self-healing, so the metal stays bright in air. Aluminium compounds also include alum for water treatment and aluminium oxide as the hard gem material in ruby and sapphire when trace impurities are present.",
    deeperDa:
      "Hans Christian Ørsted, en dansk fysiker, fremstillede i 1825 den første lille mængde uren aluminium, og Friedrich Wöhler forbedrede metoden i 1827. I flere årtier var metallet mere værdifuldt end guld. I 1886 opfandt Charles Martin Hall og Paul Héroult uafhængigt af hinanden den elektrolytiske proces, der gjorde det billigt.\n\nAluminium udvindes af bauxit, der først raffineres til aluminiumoxid og derefter reduceres ved elektrolyse i smeltet kryolit, hvilket kræver store mængder elektricitet. Oxidlaget heler sig selv, så metallet forbliver blankt i luft. Aluminiumforbindelser tæller også alun til vandrensning og aluminiumoxid, som er det hårde stof i rubin og safir, når der er spor af urenheder.",
  },
  {
    z: 14,
    symbol: "Si",
    nameEn: "Silicon",
    nameDa: "Silicium",
    weight: "28.085",
    group: 14,
    period: 3,
    category: "metalloid",
    phase: "solid",
    electronConfig: "[Ne] 3s2 3p2",
    summaryEn:
      "Silicon is a hard, brittle, blue-grey metalloid and the second most abundant element in Earth's crust after oxygen. It is the foundation of the semiconductor industry. In nature it occurs as silica and silicate minerals, never as the free element.",
    summaryDa:
      "Silicium er et hårdt, sprødt og blågråt halvmetal og det næstmest almindelige grundstof i Jordens skorpe efter ilt. Det er fundamentet for halvlederindustrien. I naturen findes det som silica og silikatmineraler, aldrig som frit grundstof.",
    usesEn: [
      "Computer chips and transistors made from ultra-pure single crystals",
      "Solar cells that convert sunlight into electricity",
      "Glass, ceramics and cement made from sand and silicates",
      "Silicones in sealants, lubricants and medical implants",
    ],
    usesDa: [
      "Computerchips og transistorer lavet af ultrarene énkrystaller",
      "Solceller, der omdanner sollys til elektricitet",
      "Glas, keramik og cement fremstillet af sand og silikater",
      "Silikoner i fugemasse, smøremidler og medicinske implantater",
    ],
    deeperEn:
      "Jöns Jacob Berzelius prepared pure amorphous silicon in 1823. The name comes from the Latin silex, meaning flint. Silicon has four valence electrons and forms a diamond-like crystal lattice, and small amounts of dopants such as phosphorus or boron control its conductivity, which is the basis of electronic devices.\n\nTo make chips, quartz sand is reduced to metallurgical silicon, purified to a level of one impurity atom in billions and grown into large single crystals. Silicon dioxide on the surface serves as an insulator. Silicones are a separate family of polymers with a backbone of alternating silicon and oxygen atoms, valued for stability across a wide temperature range.",
    deeperDa:
      "Jöns Jacob Berzelius fremstillede ren amorf silicium i 1823. Navnet kommer af latin silex, der betyder flint. Silicium har fire valenselektroner og danner et diamantlignende krystalgitter, og små mængder dopingstoffer som fosfor eller bor styrer ledningsevnen, hvilket er grundlaget for elektroniske komponenter.\n\nTil chips reduceres kvartssand til metallurgisk silicium, renses til ét urent atom pr. milliarder og dyrkes til store énkrystaller. Siliciumdioxid på overfladen fungerer som isolator. Silikoner er en særskilt familie af polymerer med en rygrad af skiftevis silicium og ilt og værdsættes for stabilitet over et bredt temperaturområde.",
  },
  {
    z: 15,
    symbol: "P",
    nameEn: "Phosphorus",
    nameDa: "Phosphor",
    akaDa: "fosfor",
    weight: "30.974",
    group: 15,
    period: 3,
    category: "nonmetal",
    phase: "solid",
    electronConfig: "[Ne] 3s2 3p3",
    summaryEn:
      "Phosphorus is a reactive nonmetal that exists in several forms, including white, red and black phosphorus. White phosphorus ignites in air and is toxic, while red phosphorus is much more stable. It is essential to DNA, cell membranes and energy transfer in all living things.",
    summaryDa:
      "Fosfor er et reaktivt ikke-metal, der findes i flere former, blandt andet hvid, rød og sort fosfor. Hvid fosfor selvantænder i luft og er giftig, mens rød fosfor er langt mere stabil. Det er nødvendigt for DNA, cellemembraner og energioverførsel i alt levende.",
    usesEn: [
      "Phosphate fertilisers for agriculture",
      "Matches, where red phosphorus is on the striking strip",
      "Detergent additives and food acidifiers such as phosphoric acid in soft drinks",
      "Flame retardants and lithium iron phosphate batteries",
    ],
    usesDa: [
      "Fosfatgødning til landbrug",
      "Tændstikker, hvor rød fosfor sidder på tændfladen",
      "Tilsætning til vaskemidler og syreregulering i fødevarer, for eksempel fosforsyre i sodavand",
      "Brandhæmmende midler og lithium-jernfosfat-batterier",
    ],
    deeperEn:
      "Hennig Brand, a German alchemist, discovered phosphorus in 1669 by heating evaporated urine, and he was struck by its pale green glow in the dark. The name comes from the Greek phosphoros, meaning light-bringer. It was the first element whose discovery was recorded with a known discoverer.\n\nPhosphate is a limiting nutrient for plant growth, and mined phosphate rock is the main source of fertiliser. Reserves are concentrated in a few countries, so recovery from wastewater and manure is becoming important. Run-off of phosphorus into lakes and seas fuels algal blooms. In the body, ATP and the backbone of DNA both contain phosphate groups.",
    deeperDa:
      "Hennig Brand, en tysk alkymist, opdagede fosfor i 1669 ved at opvarme inddampet urin og blev slået af stoffets blegt grønne glød i mørke. Navnet kommer af græsk phosphoros, der betyder lysbringer. Det var det første grundstof, hvor opdageren er kendt og dokumenteret.\n\nFosfat er et begrænsende næringsstof for planternes vækst, og udvundet fosfatsten er den vigtigste kilde til gødning. Reserverne er samlet i få lande, så genindvinding fra spildevand og gylle bliver vigtigere. Afstrømning af fosfor til søer og hav giver algeopblomstring. I kroppen indeholder både ATP og rygraden i DNA fosfatgrupper.",
  },
  {
    z: 16,
    symbol: "S",
    nameEn: "Sulfur",
    nameDa: "Svovl",
    weight: "32.06",
    group: 16,
    period: 3,
    category: "nonmetal",
    phase: "solid",
    electronConfig: "[Ne] 3s2 3p4",
    summaryEn:
      "Sulfur is a bright yellow, brittle nonmetal that burns with a blue flame and a sharp smell of sulfur dioxide. It occurs naturally near volcanoes and in many minerals. It is an essential element in proteins.",
    summaryDa:
      "Svovl er et lysegult, sprødt ikke-metal, der brænder med blå flamme og en skarp lugt af svovldioxid. Det findes naturligt ved vulkaner og i mange mineraler. Det er et nødvendigt grundstof i proteiner.",
    usesEn: [
      "Sulfuric acid, the most produced industrial chemical in the world",
      "Vulcanising rubber for tyres",
      "Fertilisers and fungicides",
      "Preservative in dried fruit and wine, as sulfur dioxide",
    ],
    usesDa: [
      "Svovlsyre, verdens mest producerede industrikemikalie",
      "Vulkanisering af gummi til dæk",
      "Gødning og svampemidler",
      "Konserveringsmiddel i tørret frugt og vin i form af svovldioxid",
    ],
    deeperEn:
      "Sulfur has been known since antiquity, and the Bible refers to it as brimstone. Lavoisier recognised it as an element in 1777. Today most sulfur is recovered as a by-product when sulfur is removed from oil and natural gas, which is needed to prevent acid rain.\n\nSulfur forms rings of eight atoms in its most stable form, S8. In living organisms it appears in the amino acids cysteine and methionine, and disulfide bridges between cysteine residues help hold proteins in their shape. Many sulfur compounds have strong smells, such as hydrogen sulfide with its rotten-egg odour, which is also toxic at higher concentrations.",
    deeperDa:
      "Svovl har været kendt siden oldtiden, og Bibelen omtaler det som svovl og ild. Lavoisier anerkendte det som grundstof i 1777. I dag udvindes det meste svovl som biprodukt, når svovl fjernes fra olie og naturgas, hvilket er nødvendigt for at forebygge sur nedbør.\n\nI sin mest stabile form danner svovl ringe med otte atomer, S8. I levende organismer indgår det i aminosyrerne cystein og methionin, og disulfidbroer mellem cystein hjælper med at holde proteiner i deres form. Mange svovlforbindelser har kraftig lugt, for eksempel hydrogensulfid med lugt af rådne æg, som i højere koncentration også er giftig.",
  },
  {
    z: 17,
    symbol: "Cl",
    nameEn: "Chlorine",
    nameDa: "Chlor",
    akaDa: "klor",
    weight: "35.45",
    group: 17,
    period: 3,
    category: "halogen",
    phase: "gas",
    electronConfig: "[Ne] 3s2 3p5",
    summaryEn:
      "Chlorine is a yellow-green, toxic gas with a sharp smell. It is a strong oxidiser and readily forms chlorides. Chloride ions are essential in the body, but the gas itself is dangerous to breathe.",
    summaryDa:
      "Klor er en gulgrøn, giftig gas med en stikkende lugt. Det er et stærkt oxidationsmiddel og danner let chlorider. Chloridioner er nødvendige i kroppen, men selve gassen er farlig at indånde.",
    usesEn: [
      "Disinfecting drinking water and swimming pools",
      "Producing PVC plastic and many other organic chemicals",
      "Bleaching paper and textiles",
      "Making hydrochloric acid and solvents",
    ],
    usesDa: [
      "Desinfektion af drikkevand og svømmebassiner",
      "Fremstilling af PVC-plast og mange andre organiske kemikalier",
      "Blegning af papir og tekstiler",
      "Fremstilling af saltsyre og opløsningsmidler",
    ],
    deeperEn:
      "Carl Wilhelm Scheele first produced chlorine in 1774, but he believed it contained oxygen. Humphry Davy showed in 1810 that it was an element and named it from the Greek chloros, meaning pale green.\n\nChlorine was used as a chemical weapon in the First World War, yet chlorination of drinking water has since prevented enormous numbers of deaths from waterborne disease. Industrially it is made together with sodium hydroxide by electrolysing salt solution in the chlor-alkali process. Some chlorinated compounds, such as chlorofluorocarbons and certain pesticides, have caused environmental harm and are now restricted.",
    deeperDa:
      "Carl Wilhelm Scheele fremstillede klor første gang i 1774, men mente, at det indeholdt ilt. Humphry Davy viste i 1810, at det var et grundstof, og navngav det efter det græske chloros, der betyder blegt grøn.\n\nKlor blev brugt som kemisk våben under første verdenskrig, men klorering af drikkevand har siden forhindret et enormt antal dødsfald fra vandbårne sygdomme. Industrielt fremstilles det sammen med natriumhydroxid ved elektrolyse af saltvand i chlor-alkali-processen. Nogle klorholdige stoffer, som freoner og visse pesticider, har skadet miljøet og er nu begrænset.",
  },
  {
    z: 18,
    symbol: "Ar",
    nameEn: "Argon",
    nameDa: "Argon",
    weight: "39.95",
    group: 18,
    period: 3,
    category: "noble-gas",
    phase: "gas",
    electronConfig: "[Ne] 3s2 3p6",
    summaryEn:
      "Argon is a colourless, odourless, inert noble gas and the third most abundant gas in the atmosphere at about 0.93 percent. It is heavier than air. It is separated industrially from liquid air.",
    summaryDa:
      "Argon er en farveløs, lugtfri og inert ædelgas og den tredjemest almindelige gas i atmosfæren med omkring 0,93 procent. Den er tungere end luft. Den udskilles industrielt fra flydende luft.",
    usesEn: [
      "Shielding gas for welding stainless steel, aluminium and titanium",
      "Fill gas in incandescent bulbs and double-glazed windows",
      "Preserving valuable documents and wine by displacing oxygen",
      "Plasma and argon lasers in laboratories and medicine",
    ],
    usesDa: [
      "Beskyttelsesgas ved svejsning af rustfrit stål, aluminium og titan",
      "Fyldgas i glødepærer og termoruder",
      "Bevarelse af værdifulde dokumenter og vin ved at fortrænge ilt",
      "Plasma og argonlasere i laboratorier og medicin",
    ],
    deeperEn:
      "In 1894 Lord Rayleigh noticed that nitrogen from air was slightly denser than nitrogen made from chemical compounds. Together with William Ramsay he found that a small amount of an unknown, unreactive gas was responsible. They named it argon, from the Greek argos, meaning lazy or inactive.\n\nThe discovery opened a whole new column of the periodic table, the noble gases. Most atmospheric argon is argon-40, formed by the radioactive decay of potassium-40 in rocks, which is also the basis for potassium-argon dating of volcanic rocks. Because it does not react, argon is used wherever oxygen or nitrogen would damage a material at high temperature.",
    deeperDa:
      "I 1894 bemærkede Lord Rayleigh, at kvælstof fra luft var en smule tættere end kvælstof fremstillet af kemiske forbindelser. Sammen med William Ramsay fandt han, at en lille mængde af en ukendt, uvirksom gas var årsagen. De kaldte den argon, af græsk argos, der betyder doven eller uvirksom.\n\nOpdagelsen åbnede en hel ny søjle i det periodiske system, ædelgasserne. Det meste argon i atmosfæren er argon-40, som dannes ved radioaktivt henfald af kalium-40 i bjergarter, og det er også grundlaget for kalium-argon-datering af vulkanske bjergarter. Fordi argon ikke reagerer, bruges det overalt, hvor ilt eller kvælstof ville skade et materiale ved høj temperatur.",
  },
  {
    z: 19,
    symbol: "K",
    nameEn: "Potassium",
    nameDa: "Kalium",
    weight: "39.098",
    group: 1,
    period: 4,
    category: "alkali",
    phase: "solid",
    electronConfig: "[Ar] 4s1",
    summaryEn:
      "Potassium is a soft, silvery alkali metal that reacts violently with water and ignites the hydrogen it releases. It is never found free in nature. Potassium ions are vital for nerve signals, muscle contraction and plant growth.",
    summaryDa:
      "Kalium er et blødt, sølvskinnende alkalimetal, der reagerer voldsomt med vand og antænder den brint, der frigives. Det findes aldrig frit i naturen. Kaliumioner er afgørende for nervesignaler, muskelsammentrækning og plantevækst.",
    usesEn: [
      "Potash fertilisers that supply potassium to crops",
      "Potassium hydroxide in soft soap and alkaline batteries",
      "Potassium nitrate in fireworks and preserved meat",
      "Potassium chloride as a salt substitute and for medical use",
    ],
    usesDa: [
      "Kaligødning, der giver afgrøder kalium",
      "Kaliumhydroxid i grøn sæbe og alkaliske batterier",
      "Kaliumnitrat i fyrværkeri og konserveret kød",
      "Kaliumchlorid som salterstatning og til medicinsk brug",
    ],
    deeperEn:
      "Humphry Davy isolated potassium in 1807 by electrolysing molten potash, the first metal to be obtained by electrolysis. The symbol K comes from the Latin kalium, derived from the Arabic al-qali, meaning ashes of plants. The English name comes from potash, the potassium carbonate once extracted from wood ash in pots.\n\nPotassium is the main positive ion inside living cells, and the balance between potassium inside and sodium outside cells creates the electrical potential used by nerves and muscles. About 0.012 percent of natural potassium is radioactive potassium-40, which contributes to the natural radiation in the human body and, with a half-life of 1.25 billion years, to heat inside the Earth.",
    deeperDa:
      "Humphry Davy isolerede kalium i 1807 ved elektrolyse af smeltet pottaske, og det var det første metal, der blev udvundet ved elektrolyse. Symbolet K kommer af latin kalium, afledt af arabisk al-qali, der betyder aske af planter. Det engelske navn potassium kommer af potash, kaliumcarbonat, som man tidligere udvandt af træaske i gryder.\n\nKalium er den vigtigste positive ion inde i levende celler, og balancen mellem kalium indeni og natrium udenfor skaber det elektriske potentiale, som nerver og muskler bruger. Omkring 0,012 procent af naturligt kalium er radioaktivt kalium-40, som bidrager til den naturlige stråling i menneskekroppen og, med en halveringstid på 1,25 milliarder år, til varmen inde i Jorden.",
  },
  {
    z: 20,
    symbol: "Ca",
    nameEn: "Calcium",
    nameDa: "Calcium",
    weight: "40.078",
    group: 2,
    period: 4,
    category: "alkaline-earth",
    phase: "solid",
    electronConfig: "[Ar] 4s2",
    summaryEn:
      "Calcium is a soft, silvery-grey alkaline earth metal and the fifth most abundant element in Earth's crust. It reacts with water and air, so it occurs in nature only in compounds. It is the main mineral in bones, teeth and shells.",
    summaryDa:
      "Calcium er et blødt, sølvgråt jordalkalimetal og det femtemest almindelige grundstof i Jordens skorpe. Det reagerer med vand og luft og findes derfor kun i forbindelser i naturen. Det er det vigtigste mineral i knogler, tænder og skaller.",
    usesEn: [
      "Limestone, cement and concrete for construction",
      "Quicklime and slaked lime in agriculture and water treatment",
      "Plaster and drywall made from gypsum, calcium sulphate",
      "Calcium supplements and fortified foods for bone health",
    ],
    usesDa: [
      "Kalksten, cement og beton til byggeri",
      "Brændt og læsket kalk i landbrug og vandrensning",
      "Gips og gipsplader af calciumsulfat",
      "Calciumtilskud og berigede fødevarer til knoglesundhed",
    ],
    deeperEn:
      "Lime, made by heating limestone, has been used in mortar since ancient times, but Humphry Davy first isolated calcium metal in 1808 by electrolysis. The name comes from the Latin calx, meaning lime.\n\nIn living organisms calcium is far more than a building material. Calcium ions act as a messenger inside cells, triggering muscle contraction, nerve signalling, blood clotting and many enzymes. Marine organisms extract calcium and carbonate from seawater to build shells and coral, and over geological time this has formed vast deposits of limestone and chalk, such as the chalk cliffs of Møn in Denmark.",
    deeperDa:
      "Kalk, som fremstilles ved at brænde kalksten, har været brugt i mørtel siden oldtiden, men Humphry Davy isolerede først calciummetal i 1808 ved elektrolyse. Navnet kommer af latin calx, der betyder kalk.\n\nI levende organismer er calcium meget mere end et byggemateriale. Calciumioner fungerer som budbringer inde i cellerne og udløser muskelsammentrækning, nervesignaler, blodets størkning og mange enzymer. Havets organismer optager calcium og carbonat fra havvand og bygger skaller og koraller, og over geologisk tid har det dannet enorme aflejringer af kalksten og kridt, som Møns Klint i Danmark.",
  },
  {
    z: 21,
    symbol: "Sc",
    nameEn: "Scandium",
    nameDa: "Scandium",
    weight: "44.956",
    group: 3,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d1 4s2",
    summaryEn:
      "Scandium is a soft, silvery-white transition metal that is often grouped with the rare earth elements. It is not especially rare in the crust but is spread thinly and hard to extract. Its main value is in making aluminium alloys stronger.",
    summaryDa:
      "Scandium er et blødt, sølvhvidt overgangsmetal, som ofte regnes med blandt de sjældne jordarter. Det er ikke særligt sjældent i skorpen, men er fordelt tyndt og svært at udvinde. Dets hovedværdi er at gøre aluminiumslegeringer stærkere.",
    usesEn: [
      "Aluminium-scandium alloys for aircraft parts, sports equipment and bicycle frames",
      "Scandium oxide in solid oxide fuel cells",
      "Metal halide stadium lamps that give daylight-like light",
      "Scandium-46 as a tracer in oil refineries",
    ],
    usesDa: [
      "Aluminium-scandium-legeringer til flydele, sportsudstyr og cykelstel",
      "Scandiumoxid i faststofbrændselsceller",
      "Metalhalogenlamper til stadionbelysning med dagslyslignende lys",
      "Scandium-46 som sporstof på olieraffinaderier",
    ],
    deeperEn:
      "Lars Fredrik Nilson discovered scandium in 1879 in the Scandinavian minerals euxenite and gadolinite, and named it after Scandinavia. It was a striking confirmation of Mendeleev's periodic table, because Mendeleev had predicted an element he called eka-boron in 1869 with properties that matched scandium closely, and Per Teodor Cleve linked the two.\n\nScandium has a stable oxidation state of +3 and behaves chemically a lot like yttrium and the lanthanides. Because it is produced only as a by-product of other metals such as uranium and titanium, supply is small and costly, and wider use in aluminium alloys depends on cheaper production. Adding less than one percent scandium to aluminium refines the grain structure and allows strong welded parts.",
    deeperDa:
      "Lars Fredrik Nilson opdagede scandium i 1879 i de skandinaviske mineraler euxenit og gadolinit og opkaldte det efter Skandinavien. Det var en markant bekræftelse af Mendeleevs periodiske system, for Mendeleev havde i 1869 forudsagt et grundstof, han kaldte eka-bor, med egenskaber der passede tæt på scandium, og Per Teodor Cleve koblede de to.\n\nScandium har den stabile oxidationstilstand +3 og opfører sig kemisk meget som yttrium og lanthaniderne. Fordi det kun fremstilles som biprodukt fra andre metaller som uran og titan, er udbuddet lille og dyrt, og bredere brug i aluminiumslegeringer afhænger af billigere produktion. Under én procent scandium i aluminium gør kornstrukturen finere og giver stærke svejste dele.",
  },
  {
    z: 22,
    symbol: "Ti",
    nameEn: "Titanium",
    nameDa: "Titan",
    weight: "47.867",
    group: 4,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d2 4s2",
    summaryEn:
      "Titanium is a strong, lightweight, silvery transition metal with excellent corrosion resistance. It is as strong as many steels but about 45 percent lighter. It is also biocompatible, so the body tolerates it well.",
    summaryDa:
      "Titan er et stærkt, let og sølvskinnende overgangsmetal med fremragende korrosionsbestandighed. Det er lige så stærkt som mange stål, men omkring 45 procent lettere. Det er også biokompatibelt, så kroppen tåler det godt.",
    usesEn: [
      "Aircraft frames and jet engines",
      "Hip and knee replacements and dental implants",
      "Titanium dioxide as a white pigment in paint, paper and sunscreen",
      "Chemical plant equipment and seawater heat exchangers",
    ],
    usesDa: [
      "Flyskrog og jetmotorer",
      "Hofte- og knæproteser og tandimplantater",
      "Titandioxid som hvidt pigment i maling, papir og solcreme",
      "Udstyr til kemiske anlæg og varmevekslere til havvand",
    ],
    deeperEn:
      "William Gregor found titanium in 1791 in a black sand in Cornwall, and Martin Heinrich Klaproth independently identified it in 1795 and named it after the Titans of Greek mythology. Pure metal was not made until 1910, and the Kroll process of 1940 made industrial production possible.\n\nTitanium resists corrosion because a thin, tough oxide film forms instantly on its surface. The metal is difficult and expensive to extract from its ores, rutile and ilmenite, because it reacts with oxygen and nitrogen at high temperature, so production is done in an inert atmosphere. Most titanium is actually consumed as titanium dioxide pigment, which gives paper, paint and plastic their bright white colour.",
    deeperDa:
      "William Gregor fandt titan i 1791 i en sort sand i Cornwall, og Martin Heinrich Klaproth identificerede det uafhængigt i 1795 og opkaldte det efter titanerne i græsk mytologi. Rent metal blev først fremstillet i 1910, og Kroll-processen fra 1940 gjorde industriel produktion mulig.\n\nTitan modstår korrosion, fordi der straks dannes en tynd, sej oxidfilm på overfladen. Metallet er svært og dyrt at udvinde af malmene rutil og ilmenit, fordi det reagerer med ilt og kvælstof ved høj temperatur, så produktionen foregår i inert atmosfære. Det meste titan bruges faktisk som titandioxid-pigment, der giver papir, maling og plast deres klare hvide farve.",
  },
  {
    z: 23,
    symbol: "V",
    nameEn: "Vanadium",
    nameDa: "Vanadium",
    weight: "50.942",
    group: 5,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d3 4s2",
    summaryEn:
      "Vanadium is a hard, silvery-grey transition metal that forms compounds in several oxidation states, each with a different colour. It is mainly used to make steel stronger and tougher. A few organisms, including some sea squirts, accumulate it.",
    summaryDa:
      "Vanadium er et hårdt, sølvgråt overgangsmetal, der danner forbindelser i flere oxidationstrin, hver med sin egen farve. Det bruges mest til at gøre stål stærkere og sejere. Enkelte organismer, blandt andet nogle sækdyr, ophober det.",
    usesEn: [
      "Vanadium steel for tools, springs and structural parts",
      "Vanadium redox flow batteries for grid energy storage",
      "Catalyst in producing sulphuric acid",
      "Titanium-vanadium alloys in aerospace",
    ],
    usesDa: [
      "Vanadiumstål til værktøj, fjedre og bærende konstruktioner",
      "Vanadium-redox-flow-batterier til lagring af strøm i elnettet",
      "Katalysator ved fremstilling af svovlsyre",
      "Titan-vanadium-legeringer i luft- og rumfart",
    ],
    deeperEn:
      "Andrés Manuel del Río first discovered the element in 1801 in Mexico but later withdrew his claim. Nils Gabriel Sefström rediscovered it in 1830 in Swedish iron and named it after Vanadís, a name of the Norse goddess Freyja, because of its beautifully coloured compounds. Vanadium alloy steels, including grades used in early automotive construction, helped make chassis lighter and stronger in the era of the Model T.\n\nIn solution vanadium shows violet, green, blue and yellow in its +2, +3, +4 and +5 states, which makes it a popular demonstration of redox chemistry. A flow battery uses these oxidation states in two tanks of liquid electrolyte, which allows long-lasting storage of surplus wind and solar power without the capacity loss seen in many other batteries.",
    deeperDa:
      "Andrés Manuel del Río opdagede grundstoffet første gang i 1801 i Mexico, men trak senere sit krav tilbage. Nils Gabriel Sefström genopdagede det i 1830 i svensk jern og opkaldte det efter Vanadís, et af den nordiske gudinde Freyas navne, på grund af de smukt farvede forbindelser. Vanadiumlegerede stål, herunder kvaliteter brugt i tidlig bilproduktion, hjalp med at gøre undervogne lettere og stærkere i Model T's tid.\n\nI opløsning viser vanadium violet, grøn, blå og gul i trinnene +2, +3, +4 og +5, hvilket gør det til en populær demonstration af redoxkemi. Et flowbatteri bruger disse oxidationstrin i to tanke med flydende elektrolyt, hvilket giver mulighed for langtidslagring af overskydende vind- og solenergi uden den kapacitetsnedgang, mange andre batterier har.",
  },
  {
    z: 24,
    symbol: "Cr",
    nameEn: "Chromium",
    nameDa: "Chrom",
    akaDa: "krom",
    weight: "51.996",
    group: 6,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d5 4s1",
    summaryEn:
      "Chromium is a hard, lustrous, silvery transition metal that resists tarnishing. It is the key ingredient that makes stainless steel stainless. Its compounds are brightly coloured, and hexavalent chromium is toxic and carcinogenic.",
    summaryDa:
      "Krom er et hårdt, blankt og sølvskinnende overgangsmetal, der ikke anløber. Det er det vigtigste stof, der gør rustfrit stål rustfrit. Forbindelserne er stærkt farvede, og seksværdigt krom er giftigt og kræftfremkaldende.",
    usesEn: [
      "Stainless steel, which contains at least 10.5 percent chromium",
      "Chrome plating on car parts, taps and tools",
      "Pigments such as chrome green and chrome yellow",
      "Leather tanning with chromium(III) salts",
    ],
    usesDa: [
      "Rustfrit stål, der indeholder mindst 10,5 procent krom",
      "Forkromning af bildele, haner og værktøj",
      "Pigmenter som kromgrøn og kromgul",
      "Garvning af læder med krom(III)-salte",
    ],
    deeperEn:
      "Louis-Nicolas Vauquelin discovered chromium in 1797 in the red mineral crocoite from Siberia and isolated the metal the next year. The name comes from the Greek chroma, meaning colour, because its compounds are so vividly coloured. Emerald gets its green colour and ruby its red from small amounts of chromium.\n\nChromium has an unusual electron configuration, with five 3d electrons and one 4s electron, because a half-filled d subshell is especially stable. Chromium in the +3 state is relatively harmless in ordinary exposure, while the +6 state in chromates and dichromates is a strong oxidiser and a known carcinogen, so industrial use and waste are tightly regulated. European food authorities no longer treat chromium as an established essential nutrient.",
    deeperDa:
      "Louis-Nicolas Vauquelin opdagede krom i 1797 i det røde mineral krokoit fra Sibirien og isolerede metallet året efter. Navnet kommer af græsk chroma, der betyder farve, fordi forbindelserne er så levende farvede. Smaragd får sin grønne farve og rubin sin røde af små mængder krom.\n\nKrom har en usædvanlig elektronkonfiguration med fem 3d-elektroner og én 4s-elektron, fordi en halvfyldt d-underskal er særlig stabil. Krom i trin +3 er relativt harmløst ved almindelig eksponering, mens trin +6 i chromater og dichromater er et stærkt oxidationsmiddel og et kendt kræftfremkaldende stof, så industriel brug og affald er strengt reguleret. Europæiske fødevaremyndigheder betragter ikke længere krom som et sikkert påvist livsnødvendigt næringsstof.",
  },
  {
    z: 25,
    symbol: "Mn",
    nameEn: "Manganese",
    nameDa: "Mangan",
    weight: "54.938",
    group: 7,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d5 4s2",
    summaryEn:
      "Manganese is a hard, brittle, silvery-grey transition metal that is essential for steelmaking. It is also a trace nutrient needed by enzymes in plants and animals. Its compounds show many oxidation states and colours, from pink to deep purple.",
    summaryDa:
      "Mangan er et hårdt, sprødt og sølvgråt overgangsmetal, der er uundværligt i stålproduktion. Det er også et sporstof, som enzymer i planter og dyr har brug for. Forbindelserne har mange oxidationstrin og farver, fra lyserød til dyb violet.",
    usesEn: [
      "Steelmaking, where manganese removes sulphur and oxygen and adds toughness",
      "Alkaline and lithium-ion batteries",
      "Potassium permanganate as a disinfectant and oxidising agent",
      "Aluminium alloys used in drinks cans",
    ],
    usesDa: [
      "Stålproduktion, hvor mangan fjerner svovl og ilt og giver sejhed",
      "Alkaliske batterier og lithium-ion-batterier",
      "Kaliumpermanganat som desinfektionsmiddel og oxidationsmiddel",
      "Aluminiumslegeringer til drikkevaredåser",
    ],
    deeperEn:
      "Manganese dioxide was used in prehistoric cave paintings and by Roman glassmakers to remove the green tint from glass. Johan Gottlieb Gahn isolated the metal in 1774. The name probably comes from Magnesia, the same region of Greece that gave magnesium its name, because both minerals were black and found there.\n\nAlmost 90 percent of manganese is used in steel, where it combines with sulphur and makes the metal easier to roll and forge. Manganese nodules on the deep sea floor contain large amounts of the metal, and whether to mine them is debated because of the potential harm to deep-sea ecosystems. Too much manganese is neurotoxic, especially when inhaled by welders and miners over long periods.",
    deeperDa:
      "Mangandioxid blev brugt i forhistoriske hulemalerier og af romerske glasmagere til at fjerne den grønne tone i glas. Johan Gottlieb Gahn isolerede metallet i 1774. Navnet kommer sandsynligvis af Magnesia, den samme egn i Grækenland, som gav magnesium sit navn, fordi begge mineraler var sorte og fandtes der.\n\nNæsten 90 procent af manganen bruges i stål, hvor den binder svovl og gør metallet lettere at valse og smede. Manganknolde på havbunden indeholder store mængder af metallet, og om de skal udvindes, er til debat på grund af den mulige skade på dybhavets økosystemer. For meget mangan er nervegiftigt, især hvis svejsere og minearbejdere indånder det over lang tid.",
  },
  {
    z: 26,
    symbol: "Fe",
    nameEn: "Iron",
    nameDa: "Jern",
    weight: "55.845",
    group: 8,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d6 4s2",
    summaryEn:
      "Iron is a strong, magnetic, silvery-grey transition metal and the most used metal in the world, mainly as steel. It is the most abundant element on Earth by mass and the main component of the planet's core. In the body it carries oxygen in haemoglobin.",
    summaryDa:
      "Jern er et stærkt, magnetisk og sølvgråt overgangsmetal og verdens mest brugte metal, især som stål. Det er det mest almindelige grundstof på Jorden regnet efter masse og hovedbestanddel af planetens kerne. I kroppen transporterer det ilt i hæmoglobin.",
    usesEn: [
      "Steel for buildings, bridges, ships, cars and machinery",
      "Cast iron for engine blocks, pipes and cookware",
      "Iron compounds in magnets and magnetic recording",
      "Iron supplements and fortified foods to treat anaemia",
    ],
    usesDa: [
      "Stål til bygninger, broer, skibe, biler og maskiner",
      "Støbejern til motorblokke, rør og køkkenudstyr",
      "Jernforbindelser i magneter og magnetisk lagring",
      "Jerntilskud og berigede fødevarer mod blodmangel",
    ],
    deeperEn:
      "Humans have worked iron for about 3,000 years, and the Iron Age is named after it. Early iron came from meteorites and later from smelting ore with charcoal in bloomeries. The symbol Fe comes from the Latin ferrum. The Danish bog iron smelting tradition, which used iron from wetland deposits, was important in the Iron Age and Viking Age.\n\nIron rusts because it reacts with oxygen and water to form hydrated iron oxides, which flake away and expose fresh metal. Alloying it with carbon gives steel, and adding chromium and nickel gives stainless steel. Iron and nickel mark the point where nuclear fusion in stars no longer releases net energy, which is why iron is so abundant in planetary cores.",
    deeperDa:
      "Mennesker har bearbejdet jern i omkring 3.000 år, og jernalderen er opkaldt efter det. Tidligt jern kom fra meteoritter og senere fra udsmeltning af malm med trækul i rendeovne. Symbolet Fe kommer af latin ferrum. Den danske tradition for at udvinde myremalm, jern fra moseaflejringer, var vigtig i jernalderen og vikingetiden.\n\nJern ruster, fordi det reagerer med ilt og vand og danner hydratiserede jernoxider, som skaller af og blotlægger frisk metal. Når jern legeres med kulstof, fås stål, og med krom og nikkel fås rustfrit stål. Jern og nikkel markerer det punkt, hvor fusion i stjerner ikke længere frigiver nettoenergi, og derfor er jern så almindeligt i planeters kerner.",
  },
  {
    z: 27,
    symbol: "Co",
    nameEn: "Cobalt",
    nameDa: "Cobolt",
    akaDa: "kobolt",
    weight: "58.933",
    group: 9,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d7 4s2",
    summaryEn:
      "Cobalt is a hard, lustrous, bluish-grey ferromagnetic transition metal. Its compounds have been used for deep blue pigments for thousands of years. Cobalt is also at the heart of vitamin B12 and of the cathodes of many rechargeable batteries.",
    summaryDa:
      "Kobolt er et hårdt, blankt og blågråt ferromagnetisk overgangsmetal. Forbindelserne har i tusinder af år været brugt til dybblå pigmenter. Kobolt er også kernen i vitamin B12 og i katoderne i mange genopladelige batterier.",
    usesEn: [
      "Cathodes in lithium-ion batteries",
      "Superalloys for jet engine turbines and gas turbines",
      "Cobalt blue pigment in glass, ceramics and paint",
      "Cobalt-60 for radiotherapy and sterilising medical equipment",
    ],
    usesDa: [
      "Katoder i lithium-ion-batterier",
      "Superlegeringer til turbiner i jetmotorer og gasturbiner",
      "Koboltblåt pigment i glas, keramik og maling",
      "Kobolt-60 til strålebehandling og sterilisering af medicinsk udstyr",
    ],
    deeperEn:
      "Georg Brandt isolated cobalt in about 1735, which makes it the first metal to be discovered since antiquity with a known discoverer. The name comes from the German Kobold, a goblin, because miners blamed the troublesome ores, which gave off toxic arsenic fumes and yielded no copper, on mischievous spirits.\n\nMore than half of the world's cobalt is mined in the Democratic Republic of the Congo, often as a by-product of copper, and artisanal mining has raised serious concerns about child labour and safety. Battery makers are therefore reducing the cobalt in cathodes or switching to cobalt-free chemistries such as lithium iron phosphate. The vitamin B12 molecule contains one cobalt atom, so animals depend on traces of the element.",
    deeperDa:
      "Georg Brandt isolerede kobolt omkring 1735, hvilket gør det til det første metal siden oldtiden med en kendt opdager. Navnet kommer af tysk Kobold, en nisse, fordi minearbejdere skyldte på drilagtige væsener for de besværlige malme, der afgav giftige arsendampe og ikke gav kobber.\n\nMere end halvdelen af verdens kobolt udvindes i Den Demokratiske Republik Congo, ofte som biprodukt af kobber, og småskalaminedrift har givet alvorlig bekymring om børnearbejde og sikkerhed. Batteriproducenter reducerer derfor koboltindholdet i katoder eller skifter til koboltfri kemi som lithium-jernfosfat. Vitamin B12-molekylet indeholder ét koboltatom, så dyr er afhængige af spor af grundstoffet.",
  },
  {
    z: 28,
    symbol: "Ni",
    nameEn: "Nickel",
    nameDa: "Nikkel",
    weight: "58.693",
    group: 10,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d8 4s2",
    summaryEn:
      "Nickel is a hard, silvery-white, ferromagnetic transition metal that resists corrosion and oxidation. It is mostly used in alloys, especially stainless steel. Some people develop a contact allergy to nickel in jewellery, which is why its release is regulated in the EU.",
    summaryDa:
      "Nikkel er et hårdt, sølvhvidt og ferromagnetisk overgangsmetal, der modstår korrosion og oxidation. Det bruges mest i legeringer, især rustfrit stål. Nogle udvikler kontaktallergi over for nikkel i smykker, og derfor er afgivelsen reguleret i EU.",
    usesEn: [
      "Stainless steel, about two thirds of all nickel use",
      "Nickel-rich cathodes in lithium-ion batteries for electric cars",
      "Cupronickel and nickel-plated coins",
      "Nickel-metal hydride batteries and heat-resistant superalloys",
    ],
    usesDa: [
      "Rustfrit stål, der står for omkring to tredjedele af nikkelforbruget",
      "Nikkelrige katoder i lithium-ion-batterier til elbiler",
      "Mønter af kobbernikkel og nikkelbelagte mønter",
      "Nikkel-metalhydrid-batterier og varmebestandige superlegeringer",
    ],
    deeperEn:
      "Axel Fredrik Cronstedt isolated nickel in 1751 from a copper-coloured ore that German miners called Kupfernickel, meaning the devil's copper, because it looked like copper ore but yielded none. The name nickel is a short form of that word.\n\nNickel makes alloys tougher and more corrosion resistant, and it is the main partner of iron in useful materials such as Invar, an iron-nickel alloy that hardly expands when heated. Large deposits are found in Indonesia, the Philippines and Russia. Allergic contact dermatitis is common in Europe, so the EU Nickel Directive limits how much nickel can be released from items in prolonged skin contact, such as earrings and watch backs.",
    deeperDa:
      "Axel Fredrik Cronstedt isolerede nikkel i 1751 fra en kobberfarvet malm, som tyske minearbejdere kaldte Kupfernickel, djævelens kobber, fordi den lignede kobbermalm, men ikke gav kobber. Navnet nikkel er en kortform af det ord.\n\nNikkel gør legeringer sejere og mere korrosionsbestandige og er jerns vigtigste partner i nyttige materialer som Invar, en jern-nikkel-legering, der næsten ikke udvider sig ved opvarmning. Store forekomster findes i Indonesien, Filippinerne og Rusland. Allergisk kontakteksem er udbredt i Europa, så EU's nikkeldirektiv begrænser, hvor meget nikkel der må afgives fra genstande i længerevarende hudkontakt, som ørestikker og urbagsider.",
  },
  {
    z: 29,
    symbol: "Cu",
    nameEn: "Copper",
    nameDa: "Kobber",
    weight: "63.546",
    group: 11,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d10 4s1",
    summaryEn:
      "Copper is a soft, reddish-orange transition metal with excellent electrical and thermal conductivity. It has been used by humans for more than 10,000 years. Over time it develops a green patina of copper carbonates and sulphates.",
    summaryDa:
      "Kobber er et blødt, rødorange overgangsmetal med fremragende elektrisk og termisk ledningsevne. Mennesker har brugt det i mere end 10.000 år. Med tiden danner det en grøn patina af kobbercarbonater og kobbersulfater.",
    usesEn: [
      "Electrical wiring, motors and transformers",
      "Water pipes and heat exchangers",
      "Alloys: bronze with tin and brass with zinc",
      "Roofing and church spires with a green patina",
      "Antimicrobial surfaces and algae-resistant treatments",
    ],
    usesDa: [
      "Elledninger, motorer og transformere",
      "Vandrør og varmevekslere",
      "Legeringer: bronze med tin og messing med zink",
      "Tagdækning og kirketårne med grøn patina",
      "Antimikrobielle overflader og behandling mod alger",
    ],
    deeperEn:
      "Copper is one of the few metals found in nature in metallic form, and early peoples hammered it into tools. Smelting followed around 5000 BCE, and mixing it with tin about 3300 BCE started the Bronze Age. The symbol Cu comes from the Latin cuprum, derived from Cyprus, a major ancient source.\n\nThe oxidation of copper is a slow, self-limiting process that creates the protective green patina, as seen on many copper roofs and Danish church spires. A modern society uses large amounts of copper in electrification, from wind turbines to electric cars, and recycled copper keeps almost all its quality. Copper is also an essential trace element in enzymes, though high concentrations are toxic to many microbes and algae.",
    deeperDa:
      "Kobber er et af få metaller, der findes metallisk i naturen, og tidlige folk hamrede det til redskaber. Udsmeltning fulgte omkring 5000 f.Kr., og blanding med tin omkring 3300 f.Kr. indledte bronzealderen. Symbolet Cu kommer af latin cuprum, afledt af Cypern, en vigtig kilde i oldtiden.\n\nKobbers oxidation er en langsom og selvbegrænsende proces, der skaber den beskyttende grønne patina, som ses på blandt andet kobbertage og mange danske kirketårne. Et moderne samfund bruger store mængder kobber i elektrificering, fra vindmøller til elbiler, og genbrugskobber bevarer næsten hele sin kvalitet. Kobber er også et nødvendigt sporstof i enzymer, men høje koncentrationer er giftige for mange mikrober og alger.",
  },
  {
    z: 30,
    symbol: "Zn",
    nameEn: "Zinc",
    nameDa: "Zink",
    weight: "65.38",
    group: 12,
    period: 4,
    category: "transition",
    phase: "solid",
    electronConfig: "[Ar] 3d10 4s2",
    summaryEn:
      "Zinc is a bluish-silver metal that is brittle at room temperature but becomes workable when warmed. It protects iron from rusting by corroding in its place. Zinc is an essential trace element for the immune system and for hundreds of enzymes.",
    summaryDa:
      "Zink er et blåligt sølvfarvet metal, der er sprødt ved stuetemperatur, men bliver formbart, når det opvarmes. Det beskytter jern mod rust ved at korrodere i jernets sted. Zink er et nødvendigt sporstof for immunforsvaret og for hundredvis af enzymer.",
    usesEn: [
      "Galvanising steel to protect it from rust",
      "Brass, an alloy of copper and zinc",
      "Zinc-carbon and alkaline batteries",
      "Zinc oxide in sunscreen, ointments and rubber",
      "Dietary supplements and animal feed",
    ],
    usesDa: [
      "Varmgalvanisering af stål for at beskytte mod rust",
      "Messing, en legering af kobber og zink",
      "Zink-kul-batterier og alkaliske batterier",
      "Zinkoxid i solcreme, salver og gummi",
      "Kosttilskud og dyrefoder",
    ],
    deeperEn:
      "Brass was made in ancient times by heating copper with zinc ores, long before zinc was recognised as a separate metal. India produced metallic zinc by distillation from the 12th century, and in 1746 Andreas Sigismund Marggraf isolated it in Europe. The name probably comes from the German Zinke, meaning prong, referring to the sharp crystals formed on furnace walls.\n\nIn the body zinc is part of about 300 enzymes and helps with wound healing, taste and the immune response, and deficiency is a global health problem in children. As a sacrificial anode, zinc corrodes first, protecting steel hulls and pipelines. Zinc always has the oxidation state +2 in compounds, and its full 3d shell is the reason it is often classed with the transition metals only by convention.",
    deeperDa:
      "Messing blev fremstillet i oldtiden ved at opvarme kobber med zinkmalm, længe før zink blev anerkendt som et selvstændigt metal. Indien fremstillede metallisk zink ved destillation fra 1100-tallet, og i 1746 isolerede Andreas Sigismund Marggraf det i Europa. Navnet kommer sandsynligvis af tysk Zinke, der betyder spids, og refererer til de skarpe krystaller på ovnvæggene.\n\nI kroppen indgår zink i omkring 300 enzymer og bidrager til sårheling, smagssans og immunforsvar, og mangel er et globalt sundhedsproblem hos børn. Som offeranode korroderer zink først og beskytter dermed skibsskrog og rørledninger af stål. Zink har altid oxidationstrin +2 i forbindelser, og den fyldte 3d-skal er grunden til, at det kun efter konvention regnes med blandt overgangsmetallerne.",
  },
  {
    z: 31,
    symbol: "Ga",
    nameEn: "Gallium",
    nameDa: "Gallium",
    weight: "69.723",
    group: 13,
    period: 4,
    category: "post-transition",
    phase: "solid",
    electronConfig: "[Ar] 3d10 4s2 4p1",
    summaryEn:
      "Gallium is a soft, silvery metal with a melting point of only 29.8 degrees Celsius, so it melts in your hand. It expands when it freezes, like water. It is a key material in modern electronics and LEDs.",
    summaryDa:
      "Gallium er et blødt, sølvskinnende metal med et smeltepunkt på kun 29,8 grader Celsius, så det smelter i hånden. Det udvider sig, når det fryser, ligesom vand. Det er et nøglemateriale i moderne elektronik og lysdioder.",
    usesEn: [
      "Gallium arsenide and gallium nitride semiconductors for LEDs, lasers and fast chips",
      "Blue and white LEDs, which earned the 2014 Nobel Prize in Physics",
      "Gallium-based thermometers and alloys as non-toxic substitutes for mercury",
      "Gallium-68 and gallium-67 in medical imaging",
    ],
    usesDa: [
      "Galliumarsenid og galliumnitrid i halvledere til lysdioder, lasere og hurtige chips",
      "Blå og hvide lysdioder, som gav Nobelprisen i fysik i 2014",
      "Galliumbaserede termometre og legeringer som ugiftig erstatning for kviksølv",
      "Gallium-68 og gallium-67 i medicinsk billeddannelse",
    ],
    deeperEn:
      "Paul-Émile Lecoq de Boisbaudran discovered gallium in 1875 using spectroscopy, and its properties matched the element eka-aluminium that Mendeleev had predicted in 1871. The name honours France, Gallia in Latin, though a popular story claims the discoverer also punned on his own name, Lecoq, the rooster.\n\nGallium is found as a trace in bauxite and zinc ores and is not mined by itself. It stays liquid over a temperature span of about 2,200 degrees Celsius, which makes it useful in high-temperature thermometers, and it wets and weakens aluminium by penetrating its grain boundaries. Gallium nitride transistors handle higher voltages and switch faster than silicon, which makes compact fast chargers and power electronics possible.",
    deeperDa:
      "Paul-Émile Lecoq de Boisbaudran opdagede gallium i 1875 ved hjælp af spektroskopi, og egenskaberne svarede til eka-aluminium, som Mendeleev havde forudsagt i 1871. Navnet hylder Frankrig, Gallia på latin, selvom en udbredt historie hævder, at opdageren også legede med sit eget navn, Lecoq, der betyder hane.\n\nGallium findes som spor i bauxit og zinkmalm og udvindes ikke for sig selv. Det forbliver flydende over et temperaturinterval på omkring 2.200 grader Celsius, hvilket gør det brugbart i højtemperaturtermometre, og det gør aluminium skørt ved at trænge ind i kornenes grænseflader. Galliumnitrid-transistorer klarer højere spændinger og skifter hurtigere end silicium, hvilket gør kompakte hurtigladere og effektelektronik mulig.",
  },
  {
    z: 32,
    symbol: "Ge",
    nameEn: "Germanium",
    nameDa: "Germanium",
    weight: "72.630",
    group: 14,
    period: 4,
    category: "metalloid",
    phase: "solid",
    electronConfig: "[Ar] 3d10 4s2 4p2",
    summaryEn:
      "Germanium is a shiny, hard, greyish-white metalloid with a crystal structure like silicon and diamond. It is a semiconductor and transparent to infrared light. It was used in the first transistors.",
    summaryDa:
      "Germanium er et skinnende, hårdt og gråhvidt halvmetal med en krystalstruktur som silicium og diamant. Det er en halvleder og gennemsigtigt for infrarødt lys. Det blev brugt i de første transistorer.",
    usesEn: [
      "Infrared lenses and windows in thermal cameras and night vision",
      "Optical fibres, where germanium dioxide raises the refractive index of the core",
      "Silicon-germanium chips and solar cells for satellites",
      "Polymerisation catalyst for PET plastic bottles",
    ],
    usesDa: [
      "Infrarøde linser og vinduer i varmekameraer og mørkesyn",
      "Optiske fibre, hvor germaniumdioxid øger kernens brydningsindeks",
      "Silicium-germanium-chips og solceller til satellitter",
      "Katalysator ved fremstilling af PET-plastflasker",
    ],
    deeperEn:
      "Clemens Winkler discovered germanium in 1886 in the mineral argyrodite from a mine near Freiberg in Saxony, and named it after his homeland Germany. The element matched the eka-silicon that Mendeleev predicted in 1871 almost exactly in atomic weight, density and oxide formula, which helped establish the periodic law.\n\nThe first point-contact transistor in 1947 was made from germanium, but silicon later took over because it handles higher temperatures and forms a stable oxide. Germanium has seen renewed interest in fast, low-power transistors and in infrared optics. It is recovered as a by-product of zinc smelting and from fly ash, and it is classed as a critical raw material in the EU.",
    deeperDa:
      "Clemens Winkler opdagede germanium i 1886 i mineralet argyrodit fra en mine nær Freiberg i Sachsen og opkaldte det efter sit hjemland Tyskland. Grundstoffet svarede næsten præcist til det eka-silicium, som Mendeleev forudsagde i 1871, i atomvægt, massefylde og oxidens formel, hvilket var med til at fastslå den periodiske lov.\n\nDen første punktkontakt-transistor i 1947 var lavet af germanium, men silicium overtog senere, fordi det tåler højere temperatur og danner et stabilt oxid. Germanium har fået fornyet interesse til hurtige transistorer med lavt strømforbrug og i infrarød optik. Det udvindes som biprodukt fra zinkværker og fra flyveaske, og EU klassificerer det som en kritisk råvare.",
  },
  {
    z: 33,
    symbol: "As",
    nameEn: "Arsenic",
    nameDa: "Arsen",
    weight: "74.922",
    group: 15,
    period: 4,
    category: "metalloid",
    phase: "solid",
    electronConfig: "[Ar] 3d10 4s2 4p3",
    summaryEn:
      "Arsenic is a brittle, steel-grey metalloid that is best known as a poison. In its metallic form it sublimes when heated, and the vapour smells of garlic. Despite its toxicity it is an important semiconductor ingredient.",
    summaryDa:
      "Arsen er et sprødt, stålgråt halvmetal, der er mest kendt som gift. I metallisk form sublimerer det ved opvarmning, og dampen lugter af hvidløg. På trods af giftigheden er det en vigtig ingrediens i halvledere.",
    usesEn: [
      "Gallium arsenide semiconductors for LEDs, lasers and solar cells",
      "Wood preservatives, now largely banned or restricted",
      "Lead alloys for batteries and bullets",
      "Arsenic trioxide in the treatment of acute promyelocytic leukaemia",
    ],
    usesDa: [
      "Galliumarsenid-halvledere til lysdioder, lasere og solceller",
      "Træbeskyttelse, i dag stort set forbudt eller begrænset",
      "Blylegeringer til batterier og projektiler",
      "Arsentrioxid til behandling af akut promyelocytær leukæmi",
    ],
    deeperEn:
      "Arsenic compounds have been known since antiquity, and arsenic trioxide was so widely used as a poison in the Renaissance and Victorian era that it was nicknamed inheritance powder. Albertus Magnus is often credited with isolating the element around 1250. The symbol As and the name come from the Greek arsenikon, meaning yellow orpiment.\n\nThe James Marsh test of 1836 was among the first reliable forensic chemistry tests for the poison. Today the main arsenic problem is natural contamination of groundwater in parts of Bangladesh, India and Argentina, where millions of people are exposed through drinking water. Arsenic interferes with enzymes that use sulphur and phosphate, which explains both its toxicity and its use in carefully controlled medicine.",
    deeperDa:
      "Arsenforbindelser har været kendt siden oldtiden, og arsentrioxid blev så udbredt som gift i renæssancen og victoriatiden, at det fik tilnavnet arvepulver. Albertus Magnus krediteres ofte for at have isoleret grundstoffet omkring 1250. Symbolet As og navnet kommer af græsk arsenikon, der betyder gult operment.\n\nMarsh-testen fra 1836 var blandt de første pålidelige retskemiske test for giften. I dag er det største arsenproblem naturlig forurening af grundvand i dele af Bangladesh, Indien og Argentina, hvor millioner af mennesker udsættes gennem drikkevand. Arsen forstyrrer enzymer, der bruger svovl og fosfat, hvilket forklarer både giftigheden og brugen i omhyggeligt kontrolleret medicin.",
  },
  {
    z: 34,
    symbol: "Se",
    nameEn: "Selenium",
    nameDa: "Selen",
    weight: "78.971",
    group: 16,
    period: 4,
    category: "nonmetal",
    phase: "solid",
    electronConfig: "[Ar] 3d10 4s2 4p4",
    summaryEn:
      "Selenium is a nonmetal that exists in several forms, including a grey, metallic-looking one that conducts electricity better in light. It is an essential trace element in small amounts but toxic in larger doses. The gap between enough and too much is narrow.",
    summaryDa:
      "Selen er et ikke-metal, der findes i flere former, blandt andet en grå, metallignende form, der leder strøm bedre i lys. Det er et nødvendigt sporstof i små mængder, men giftigt i større doser. Der er kun lidt forskel på nok og for meget.",
    usesEn: [
      "Decolouring and colouring glass, for example ruby red glass",
      "Photocopier drums and early photovoltaic cells",
      "Thin-film CIGS solar cells with copper, indium, gallium and selenium",
      "Dietary supplements and animal feed in selenium-poor regions",
    ],
    usesDa: [
      "Affarvning og farvning af glas, for eksempel rubinrødt glas",
      "Tromler i kopimaskiner og tidlige solceller",
      "Tyndfilms-CIGS-solceller med kobber, indium, gallium og selen",
      "Kosttilskud og dyrefoder i områder med lavt selenindhold",
    ],
    deeperEn:
      "Jöns Jacob Berzelius discovered selenium in 1817 in residues from sulphuric acid production, first suspecting it was tellurium. He named it after the Greek selene, the Moon, because tellurium had been named for the Earth.\n\nSelenium is built into about 25 human proteins as the amino acid selenocysteine, including enzymes that protect cells from oxidative damage and regulate thyroid hormones. Soils in parts of Denmark and Finland are low in selenium, and some countries add it to fertiliser. The element is also a classic example of photoconductivity, as its electrical resistance falls under light, which was used in light meters and early imaging devices.",
    deeperDa:
      "Jöns Jacob Berzelius opdagede selen i 1817 i restprodukter fra svovlsyreproduktion og mistænkte først, at det var tellur. Han opkaldte det efter græsk selene, Månen, fordi tellur var opkaldt efter Jorden.\n\nSelen indgår i omkring 25 proteiner i mennesker som aminosyren selenocystein, blandt andet enzymer, der beskytter celler mod oxidativ skade og regulerer skjoldbruskkirtelhormoner. Jorden i dele af Danmark og Finland er fattig på selen, og nogle lande tilsætter det til gødning. Grundstoffet er også et klassisk eksempel på fotoledning, da den elektriske modstand falder i lys, hvilket blev brugt i lysmålere og tidlige billedenheder.",
  },
  {
    z: 35,
    symbol: "Br",
    nameEn: "Bromine",
    nameDa: "Brom",
    weight: "79.904",
    group: 17,
    period: 4,
    category: "halogen",
    phase: "liquid",
    electronConfig: "[Ar] 3d10 4s2 4p5",
    summaryEn:
      "Bromine is a dense, fuming, red-brown liquid at room temperature with a sharp, irritating smell. It is one of only two elements that are liquid at room temperature and normal pressure. It is toxic and corrosive.",
    summaryDa:
      "Brom er en tæt, rygende og rødbrun væske ved stuetemperatur med en skarp, irriterende lugt. Det er et af kun to grundstoffer, der er flydende ved stuetemperatur og normalt tryk. Det er giftigt og ætsende.",
    usesEn: [
      "Flame retardants in plastics and electronics, though many are now restricted",
      "Drilling fluids in oil and gas wells",
      "Water treatment and disinfection of pools and cooling towers",
      "Intermediate in producing pharmaceuticals and dyes",
    ],
    usesDa: [
      "Brandhæmmende midler i plast og elektronik, selvom mange nu er begrænset",
      "Borevæsker i olie- og gasbrønde",
      "Vandbehandling og desinfektion af bassiner og køletårne",
      "Mellemprodukt ved fremstilling af lægemidler og farvestoffer",
    ],
    deeperEn:
      "Antoine Jérôme Balard discovered bromine in 1826 in the salt-marsh residues of Montpellier, and Carl Löwig independently isolated it in Germany a year earlier. The name comes from the Greek bromos, meaning stench. Ancient Tyrian purple dye contained brominated compounds extracted from sea snails.\n\nMost bromine is extracted from brine in Israel, Jordan and China, where the Dead Sea has an unusually high bromide content. Bromine sits between chlorine and iodine in reactivity, and bromine water is a classic test for double bonds in organic chemistry because it loses its orange colour when it adds across them. Ozone-depleting methyl bromide, once used as a soil fumigant, has been phased out under the Montreal Protocol.",
    deeperDa:
      "Antoine Jérôme Balard opdagede brom i 1826 i restprodukter fra saltmarker ved Montpellier, og Carl Löwig isolerede det uafhængigt i Tyskland et år tidligere. Navnet kommer af græsk bromos, der betyder stank. Det gamle tyriske purpurfarvestof indeholdt bromerede stoffer udvundet af havsnegle.\n\nDet meste brom udvindes af saltlage i Israel, Jordan og Kina, hvor Dødehavet har et usædvanligt højt bromidindhold. Brom ligger mellem klor og iod i reaktivitet, og bromvand er en klassisk prøve for dobbeltbindinger i organisk kemi, fordi det mister sin orange farve, når det adderes over dem. Ozonnedbrydende methylbromid, der før blev brugt til jordfumigering, er udfaset under Montreal-protokollen.",
  },
  {
    z: 36,
    symbol: "Kr",
    nameEn: "Krypton",
    nameDa: "Krypton",
    weight: "83.798",
    group: 18,
    period: 4,
    category: "noble-gas",
    phase: "gas",
    electronConfig: "[Ar] 3d10 4s2 4p6",
    summaryEn:
      "Krypton is a colourless, odourless noble gas that is present in the atmosphere at about one part per million. It is largely unreactive, but it can form a few compounds with fluorine. It is separated from liquid air.",
    summaryDa:
      "Krypton er en farveløs og lugtfri ædelgas, der findes i atmosfæren med omkring én del pr. million. Den er stort set uden reaktivitet, men kan danne enkelte forbindelser med fluor. Den udskilles fra flydende luft.",
    usesEn: [
      "Fill gas in energy-saving incandescent and halogen lamps",
      "Insulating gas between panes in high-performance windows",
      "Excimer lasers for eye surgery and semiconductor lithography, using krypton fluoride",
      "Flash lamps for photography and airport runway lighting",
    ],
    usesDa: [
      "Fyldgas i energibesparende glødelamper og halogenlamper",
      "Isolerende gas mellem ruderne i højisolerende vinduer",
      "Excimerlasere til øjenkirurgi og halvlederlitografi med krypton-fluorid",
      "Blitzlamper til fotografering og lysanlæg på landingsbaner",
    ],
    deeperEn:
      "William Ramsay and Morris Travers discovered krypton in 1898 in the residue left after liquid air had boiled away. The name comes from the Greek kryptos, meaning hidden. From 1960 to 1983 the metre was defined as a fixed number of wavelengths of orange-red light from krypton-86, a standard that was replaced by the speed of light.\n\nKrypton difluoride, made in 1963, was among the first noble gas compounds, which showed that the noble gases are not completely inert. Radioactive krypton-85 is released from nuclear fuel reprocessing and is used as a tracer to monitor such activity.",
    deeperDa:
      "William Ramsay og Morris Travers opdagede krypton i 1898 i resten, der var tilbage, efter flydende luft var kogt væk. Navnet kommer af græsk kryptos, der betyder skjult. Fra 1960 til 1983 var meteren defineret som et bestemt antal bølgelængder af orangerødt lys fra krypton-86, en standard der blev erstattet af lysets hastighed.\n\nKryptondifluorid, fremstillet i 1963, var blandt de første ædelgasforbindelser og viste, at ædelgasserne ikke er helt inerte. Radioaktivt krypton-85 frigives ved oparbejdning af brugt atombrændsel og bruges som sporstof til at overvåge den aktivitet.",
  },
  {
    z: 37,
    symbol: "Rb",
    nameEn: "Rubidium",
    nameDa: "Rubidium",
    weight: "85.468",
    group: 1,
    period: 5,
    category: "alkali",
    phase: "solid",
    electronConfig: "[Kr] 5s1",
    summaryEn:
      "Rubidium is a soft, silvery-white alkali metal that ignites spontaneously in air and reacts violently with water. It melts at about 39 degrees Celsius. It has few commercial uses but is important in precision timekeeping and physics research.",
    summaryDa:
      "Rubidium er et blødt, sølvhvidt alkalimetal, der selvantænder i luft og reagerer voldsomt med vand. Det smelter ved omkring 39 grader Celsius. Det har få kommercielle anvendelser, men er vigtigt i præcis tidsmåling og fysisk forskning.",
    usesEn: [
      "Rubidium atomic clocks in telecommunications and satellite navigation",
      "Laser cooling and Bose-Einstein condensate experiments",
      "Special glass and ceramics",
      "Biological research as a potassium tracer",
    ],
    usesDa: [
      "Rubidium-atomure i telekommunikation og satellitnavigation",
      "Laserkøling og eksperimenter med Bose-Einstein-kondensater",
      "Specialglas og keramik",
      "Biologisk forskning som sporstof for kalium",
    ],
    deeperEn:
      "Robert Bunsen and Gustav Kirchhoff discovered rubidium in 1861 using their new spectroscope, which revealed two deep red lines in a sample of the mineral lepidolite. The name comes from the Latin rubidus, meaning deep red. It was one of the first elements found by spectroscopy.\n\nRubidium behaves much like potassium, and cells can take it up in place of potassium. Natural rubidium contains radioactive rubidium-87, with a half-life of about 49 billion years, which is used to date very old rocks by comparing it with its decay product strontium-87. In 1995 laser-cooled rubidium atoms were used to create the first Bose-Einstein condensate in a dilute gas.",
    deeperDa:
      "Robert Bunsen og Gustav Kirchhoff opdagede rubidium i 1861 med deres nye spektroskop, der viste to dybrøde linjer i en prøve af mineralet lepidolit. Navnet kommer af latin rubidus, der betyder dybrød. Det var et af de første grundstoffer, der blev fundet ved spektroskopi.\n\nRubidium opfører sig meget som kalium, og celler kan optage det i stedet for kalium. Naturligt rubidium indeholder radioaktivt rubidium-87 med en halveringstid på omkring 49 milliarder år, hvilket bruges til at datere meget gamle bjergarter ved at sammenligne med henfaldsproduktet strontium-87. I 1995 blev laserkølede rubidiumatomer brugt til at skabe det første Bose-Einstein-kondensat i en fortyndet gas.",
  },
  {
    z: 38,
    symbol: "Sr",
    nameEn: "Strontium",
    nameDa: "Strontium",
    weight: "87.62",
    group: 2,
    period: 5,
    category: "alkaline-earth",
    phase: "solid",
    electronConfig: "[Kr] 5s2",
    summaryEn:
      "Strontium is a soft, silvery-yellow alkaline earth metal that oxidises quickly in air. Its salts burn with a vivid crimson flame. Radioactive strontium-90 is a hazardous product of nuclear fission.",
    summaryDa:
      "Strontium er et blødt, sølvgult jordalkalimetal, der hurtigt oxiderer i luft. Dets salte brænder med en kraftig karmoisinrød flamme. Radioaktivt strontium-90 er et farligt produkt fra kernespaltning.",
    usesEn: [
      "Red colour in fireworks and emergency flares",
      "Glass for older colour television tubes",
      "Strontium aluminate in glow-in-the-dark materials",
      "Strontium-89 for treating bone pain from cancer",
      "Strontium ranelate in some osteoporosis medicines",
    ],
    usesDa: [
      "Rød farve i fyrværkeri og nødblus",
      "Glas til ældre farve-tv-rør",
      "Strontiumaluminat i selvlysende materialer",
      "Strontium-89 til behandling af knoglesmerter ved kræft",
      "Strontiumranelat i nogle medicinske præparater mod knogleskørhed",
    ],
    deeperEn:
      "In 1790 Adair Crawford recognised that a mineral from the lead mine at Strontian in Scotland contained a new substance, and Humphry Davy isolated the metal in 1808. The element is named after the village.\n\nChemically strontium is very similar to calcium and barium, and the body treats it a bit like calcium, depositing it in bones. This is why strontium-90, released by nuclear weapons testing and the Chernobyl accident, is dangerous: with a half-life of about 29 years it can lodge in bone and irradiate the marrow. Stable strontium has little toxicity, and the red flame test of strontium salts is a standard school experiment.",
    deeperDa:
      "I 1790 erkendte Adair Crawford, at et mineral fra blyminen ved Strontian i Skotland indeholdt et nyt stof, og Humphry Davy isolerede metallet i 1808. Grundstoffet er opkaldt efter landsbyen.\n\nKemisk ligner strontium calcium og barium meget, og kroppen behandler det lidt som calcium og aflejrer det i knoglerne. Derfor er strontium-90, der blev frigivet ved atomvåbenprøvesprængninger og Tjernobyl-ulykken, farligt: Med en halveringstid på omkring 29 år kan det sætte sig i knogler og bestråle knoglemarven. Stabilt strontium er kun lidt giftigt, og den røde flammefarve fra strontiumsalte er et standardforsøg i skolen.",
  },
  {
    z: 39,
    symbol: "Y",
    nameEn: "Yttrium",
    nameDa: "Yttrium",
    weight: "88.906",
    group: 3,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d1 5s2",
    summaryEn:
      "Yttrium is a silvery metal that is chemically very close to the lanthanides and is usually counted among the rare earth elements. It is stable in air thanks to an oxide layer. Its compounds give many lasers and phosphors their special properties.",
    summaryDa:
      "Yttrium er et sølvfarvet metal, der kemisk ligger meget tæt på lanthaniderne og normalt regnes med blandt de sjældne jordarter. Det er stabilt i luft takket være et oxidlag. Forbindelserne giver mange lasere og fosforstoffer deres særlige egenskaber.",
    usesEn: [
      "Yttrium aluminium garnet, YAG, crystals in lasers for industry and surgery",
      "Red phosphors in older televisions and in LED lighting",
      "Yttria-stabilised zirconia in ceramics, thermal barrier coatings and oxygen sensors",
      "YBCO high-temperature superconductors",
    ],
    usesDa: [
      "Yttrium-aluminium-granat, YAG, i lasere til industri og kirurgi",
      "Røde fosforstoffer i ældre fjernsyn og i LED-belysning",
      "Yttriumstabiliseret zirkoniumoxid i keramik, varmebarrierer og iltsensorer",
      "YBCO-superledere ved høj temperatur",
    ],
    deeperEn:
      "In 1787 Carl Axel Arrhenius found an unusual black rock in a quarry at Ytterby, near Stockholm. Johan Gadolin analysed it in 1794 and found a new earth, yttria. The village of Ytterby gave names to four elements: yttrium, ytterbium, terbium and erbium.\n\nYttrium is not a lanthanide, but its ion has a similar size and charge to the heavy lanthanides, so it is found together with them in minerals and is hard to separate. Its compounds make many materials work better at high temperatures, and the superconductor YBa2Cu3O7 was the first to work above the boiling point of liquid nitrogen in 1987. Radioactive yttrium-90 is used in radioembolisation to treat liver tumours.",
    deeperDa:
      "I 1787 fandt Carl Axel Arrhenius en usædvanlig sort sten i et stenbrud ved Ytterby nær Stockholm. Johan Gadolin analyserede den i 1794 og fandt en ny jordart, yttria. Landsbyen Ytterby har givet navn til fire grundstoffer: yttrium, ytterbium, terbium og erbium.\n\nYttrium er ikke et lanthanid, men dets ion har en størrelse og ladning, der ligner de tunge lanthanider, så det findes sammen med dem i mineraler og er svært at skille fra dem. Forbindelserne får mange materialer til at fungere bedre ved høj temperatur, og superlederen YBa2Cu3O7 var i 1987 den første, der virkede over kogepunktet for flydende kvælstof. Radioaktivt yttrium-90 bruges i radioembolisering til behandling af levertumorer.",
  },
  {
    z: 40,
    symbol: "Zr",
    nameEn: "Zirconium",
    nameDa: "Zirconium",
    weight: "91.224",
    group: 4,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d2 5s2",
    summaryEn:
      "Zirconium is a strong, lustrous, grey-white transition metal with excellent corrosion resistance. It absorbs very few neutrons, which makes it ideal for nuclear reactors. Its oxide is a very hard ceramic.",
    summaryDa:
      "Zirconium er et stærkt, blankt og gråhvidt overgangsmetal med fremragende korrosionsbestandighed. Det optager meget få neutroner, hvilket gør det ideelt til atomreaktorer. Oxidet er en meget hård keramik.",
    usesEn: [
      "Fuel rod cladding in nuclear power plants",
      "Zirconia ceramics for dental crowns and hip joint heads",
      "Cubic zirconia as an inexpensive diamond simulant",
      "Corrosion-resistant equipment in the chemical industry",
    ],
    usesDa: [
      "Beklædning af brændselsstave i atomkraftværker",
      "Zirkoniumoxid-keramik til tandkroner og hofteledskugler",
      "Kubisk zirkonia som billig diamantimitation",
      "Korrosionsbestandigt udstyr i kemisk industri",
    ],
    deeperEn:
      "Martin Heinrich Klaproth identified zirconium in the gemstone zircon in 1789, and Jöns Jacob Berzelius isolated impure metal in 1824. The name comes from the Persian zargun, meaning gold-coloured. Zircon crystals are the oldest known Earth materials, with grains from Western Australia dated to about 4.4 billion years.\n\nZirconium always occurs together with hafnium, which has almost identical chemistry but absorbs neutrons strongly. For reactor use the two must be separated, which is a demanding process. Zirconium alloys, known as Zircaloy, hold up well in hot water. The very high melting point of zirconium oxide, above 2,700 degrees Celsius, makes it valuable in refractory materials and as a tough ceramic.",
    deeperDa:
      "Martin Heinrich Klaproth identificerede zirconium i ædelstenen zirkon i 1789, og Jöns Jacob Berzelius isolerede urent metal i 1824. Navnet kommer af persisk zargun, der betyder guldfarvet. Zirkonkrystaller er de ældste kendte materialer fra Jorden, med korn fra Vestaustralien dateret til omkring 4,4 milliarder år.\n\nZirconium forekommer altid sammen med hafnium, som har næsten samme kemi, men optager neutroner kraftigt. Til reaktorbrug skal de to skilles, hvilket er en krævende proces. Zirconiumlegeringer, kendt som Zircaloy, holder godt i varmt vand. Zirconiumoxids meget høje smeltepunkt, over 2.700 grader Celsius, gør det værdifuldt i ildfaste materialer og som sej keramik.",
  },
  {
    z: 41,
    symbol: "Nb",
    nameEn: "Niobium",
    nameDa: "Niob",
    weight: "92.906",
    group: 5,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d4 5s1",
    summaryEn:
      "Niobium is a soft, ductile, grey transition metal that resists corrosion. It becomes superconducting at low temperatures. About 90 percent of the world's supply comes from a single region in Brazil.",
    summaryDa:
      "Niob er et blødt, formbart og gråt overgangsmetal, der modstår korrosion. Det bliver superledende ved lave temperaturer. Omkring 90 procent af verdens forsyning kommer fra ét område i Brasilien.",
    usesEn: [
      "High-strength low-alloy steel for pipelines, bridges and car bodies",
      "Superconducting magnets in MRI scanners and particle accelerators",
      "Superalloys in jet engines and rockets",
      "Niobium coatings and jewellery with interference colours",
    ],
    usesDa: [
      "Højstyrkestål til rørledninger, broer og karosserier",
      "Superledende magneter i MR-scannere og partikelacceleratorer",
      "Superlegeringer i jetmotorer og raketter",
      "Niobbelægninger og smykker med interferensfarver",
    ],
    deeperEn:
      "Charles Hatchett discovered a new element in a mineral from Connecticut in 1801 and called it columbium. Heinrich Rose later found what he thought was a different element in the same type of ore, and named it niobium after Niobe, the daughter of Tantalus, because of its chemical similarity to tantalum. The two were shown to be the same, and in 1950 IUPAC settled on niobium.\n\nAdding a few hundredths of a percent of niobium to steel makes it markedly stronger without losing weldability. Niobium-titanium alloy wires carry current without resistance when cooled by liquid helium, which is how the Large Hadron Collider produces its strong magnetic fields. Niobium commonly occurs with tantalum in the mineral columbite-tantalite.",
    deeperDa:
      "Charles Hatchett opdagede et nyt grundstof i et mineral fra Connecticut i 1801 og kaldte det columbium. Heinrich Rose fandt senere det, han troede var et andet grundstof, i samme type malm og opkaldte det niob efter Niobe, Tantalus' datter, på grund af den kemiske lighed med tantal. De to blev vist at være det samme, og i 1950 fastsatte IUPAC navnet niob.\n\nEn tilsætning af få hundrededele af en procent niob til stål gør det markant stærkere uden at miste svejsbarhed. Ledninger af niob-titan-legering fører strøm uden modstand, når de afkøles med flydende helium, og sådan frembringer Large Hadron Collider sine stærke magnetfelter. Niob forekommer ofte sammen med tantal i mineralet columbit-tantalit.",
  },
  {
    z: 42,
    symbol: "Mo",
    nameEn: "Molybdenum",
    nameDa: "Molybdæn",
    weight: "95.95",
    group: 6,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d5 5s1",
    summaryEn:
      "Molybdenum is a hard, silvery-white transition metal with one of the highest melting points of the elements, about 2,623 degrees Celsius. It strengthens steel at high temperatures. It is also an essential trace element for plants and animals.",
    summaryDa:
      "Molybdæn er et hårdt, sølvhvidt overgangsmetal med et af de højeste smeltepunkter blandt grundstofferne, omkring 2.623 grader Celsius. Det styrker stål ved høje temperaturer. Det er også et nødvendigt sporstof for planter og dyr.",
    usesEn: [
      "Alloy steels for engines, pipelines and tools",
      "Molybdenum disulphide as a dry lubricant",
      "Catalysts that remove sulphur from petroleum",
      "Heating elements and components in high-temperature furnaces",
    ],
    usesDa: [
      "Legeret stål til motorer, rørledninger og værktøj",
      "Molybdændisulfid som tørsmøremiddel",
      "Katalysatorer, der fjerner svovl fra olie",
      "Varmelegemer og komponenter i højtemperaturovne",
    ],
    deeperEn:
      "Molybdenum minerals were long confused with graphite and lead ore, and the name comes from the Greek molybdos, meaning lead. Carl Wilhelm Scheele showed in 1778 that the mineral molybdenite contained a different element, and Peter Jacob Hjelm isolated the metal in 1781.\n\nIn living organisms molybdenum sits in the active centre of enzymes, including nitrogenase, the enzyme in soil bacteria that converts atmospheric nitrogen into ammonia. Without traces of molybdenum, plants such as legumes cannot use nitrogen efficiently. The metal is mainly obtained as a by-product of copper mining. Its steel alloys played a part in the development of armour plate and jet engines.",
    deeperDa:
      "Molybdænmineraler blev længe forvekslet med grafit og blymalm, og navnet kommer af græsk molybdos, der betyder bly. Carl Wilhelm Scheele viste i 1778, at mineralet molybdænglans indeholdt et andet grundstof, og Peter Jacob Hjelm isolerede metallet i 1781.\n\nI levende organismer sidder molybdæn i det aktive center af enzymer, blandt andet nitrogenase, enzymet i jordbakterier, der omdanner luftens kvælstof til ammoniak. Uden spor af molybdæn kan planter som bælgplanter ikke udnytte kvælstof effektivt. Metallet udvindes mest som biprodukt fra kobberminedrift. Dets stållegeringer spillede en rolle i udviklingen af panserplader og jetmotorer.",
  },
  {
    z: 43,
    symbol: "Tc",
    nameEn: "Technetium",
    nameDa: "Technetium",
    weight: "[98]",
    group: 7,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d5 5s2",
    summaryEn:
      "Technetium is a silvery-grey, radioactive transition metal and the lightest element with no stable isotopes. It is produced in nuclear reactors and does not occur in meaningful amounts in nature. Its isotope technetium-99m is the most widely used radioactive tracer in medicine.",
    summaryDa:
      "Technetium er et sølvgråt, radioaktivt overgangsmetal og det letteste grundstof uden stabile isotoper. Det fremstilles i atomreaktorer og findes ikke i nævneværdige mængder i naturen. Isotopen technetium-99m er det mest brugte radioaktive sporstof i medicin.",
    usesEn: [
      "Technetium-99m in diagnostic scans of the heart, bones, lungs and thyroid",
      "Tracer for locating leaks and for industrial flow studies",
      "Corrosion inhibitor in closed laboratory systems",
      "Research on nuclear waste behaviour, since technetium-99 is a long-lived fission product",
    ],
    usesDa: [
      "Technetium-99m i diagnostiske skanninger af hjerte, knogler, lunger og skjoldbruskkirtel",
      "Sporstof til at finde lækager og til industrielle strømningsstudier",
      "Korrosionshæmmer i lukkede laboratoriesystemer",
      "Forskning i atomaffalds opførsel, da technetium-99 er et langlivet fissionsprodukt",
    ],
    deeperEn:
      "Technetium was the first element to be produced artificially. Carlo Perrier and Emilio Segrè identified it in 1937 in a molybdenum foil that had been bombarded with deuterons in a cyclotron at Berkeley. The name comes from the Greek technetos, meaning artificial. Its absence from nature had been predicted from the periodic table, which left an empty slot below manganese.\n\nThe longest-lived isotopes, technetium-97 and technetium-98, have half-lives of a few million years, far too short for any primordial technetium to remain on Earth. Technetium was detected in the spectra of red giant stars in 1952, which proved that stars create heavy elements. Technetium-99m has a six-hour half-life and emits gamma rays, so hospitals produce it on site from molybdenum-99 generators.",
    deeperDa:
      "Technetium var det første grundstof, der blev fremstillet kunstigt. Carlo Perrier og Emilio Segrè identificerede det i 1937 i en molybdænfolie, der var blevet bombarderet med deuteroner i et cyklotron i Berkeley. Navnet kommer af græsk technetos, der betyder kunstig. At det manglede i naturen, var blevet forudsagt ud fra det periodiske system, hvor der var en tom plads under mangan.\n\nDe længstlevende isotoper, technetium-97 og technetium-98, har halveringstider på nogle få millioner år, langt for kort til, at oprindeligt technetium kunne være tilbage på Jorden. Technetium blev i 1952 fundet i spektrene fra røde kæmpestjerner, hvilket viste, at stjerner danner tunge grundstoffer. Technetium-99m har en halveringstid på seks timer og udsender gammastråler, så hospitaler fremstiller det på stedet fra molybdæn-99-generatorer.",
  },
  {
    z: 44,
    symbol: "Ru",
    nameEn: "Ruthenium",
    nameDa: "Ruthenium",
    weight: "101.07",
    group: 8,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d7 5s1",
    summaryEn:
      "Ruthenium is a hard, silvery-white platinum group metal that resists corrosion and wear. It is rare in the crust. It is used in electronics, in chemical catalysts and as a hardener for platinum and palladium.",
    summaryDa:
      "Ruthenium er et hårdt, sølvhvidt platingruppemetal, der modstår korrosion og slid. Det er sjældent i skorpen. Det bruges i elektronik, i kemiske katalysatorer og som hærder i platin og palladium.",
    usesEn: [
      "Hard, wear-resistant electrical contacts",
      "Thick-film resistors and hard disk coatings",
      "Grubbs-type catalysts for organic synthesis",
      "Dye-sensitised solar cells and research into cancer drugs",
    ],
    usesDa: [
      "Hårde, slidstærke elektriske kontakter",
      "Tyndfilmsmodstande og belægninger på harddiske",
      "Grubbs-katalysatorer til organisk syntese",
      "Farvestofsensibiliserede solceller og forskning i kræftmedicin",
    ],
    deeperEn:
      "Karl Ernst Claus isolated ruthenium in 1844 from residues of platinum ore from the Ural Mountains, building on earlier work by Gottfried Osann, and named it after Ruthenia, the Latin name for Russia. It was the last of the platinum group metals to be discovered.\n\nThe 2005 Nobel Prize in Chemistry honoured olefin metathesis, a reaction that rearranges carbon-carbon double bonds, and ruthenium catalysts by Robert Grubbs are among the most important for it. Ruthenium has an unusually wide range of oxidation states, from -2 to +8, and the toxic, volatile tetroxide RuO4 is a very strong oxidiser. It is produced as a by-product of platinum and nickel refining, in quantities of only a few tonnes per year.",
    deeperDa:
      "Karl Ernst Claus isolerede ruthenium i 1844 fra rester af platinmalm fra Uralbjergene, bygget på tidligere arbejde af Gottfried Osann, og opkaldte det efter Ruthenia, det latinske navn for Rusland. Det var det sidste af platingruppemetallerne, der blev opdaget.\n\nNobelprisen i kemi 2005 hædrede olefinmetatese, en reaktion der omlejrer kulstof-kulstof-dobbeltbindinger, og rutheniumkatalysatorer af Robert Grubbs er blandt de vigtigste til den. Ruthenium har et usædvanligt bredt udvalg af oxidationstrin, fra -2 til +8, og det giftige, flygtige tetroxid RuO4 er et meget stærkt oxidationsmiddel. Det fremstilles som biprodukt ved raffinering af platin og nikkel, i kun få tons om året.",
  },
  {
    z: 45,
    symbol: "Rh",
    nameEn: "Rhodium",
    nameDa: "Rhodium",
    weight: "102.91",
    group: 9,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d8 5s1",
    summaryEn:
      "Rhodium is a hard, silvery-white platinum group metal that is highly reflective and very resistant to corrosion. It is one of the rarest and most expensive precious metals. Most of it goes into catalytic converters for cars.",
    summaryDa:
      "Rhodium er et hårdt, sølvhvidt platingruppemetal, der er stærkt reflekterende og meget korrosionsbestandigt. Det er et af de sjældneste og dyreste ædelmetaller. Det meste bruges i katalysatorer til biler.",
    usesEn: [
      "Three-way catalytic converters that reduce nitrogen oxides in exhaust",
      "Rhodium plating on white gold and silver jewellery for brightness and tarnish resistance",
      "Catalyst in producing acetic acid and in the hydroformylation of alkenes",
      "Reflective coatings on mirrors and searchlights",
    ],
    usesDa: [
      "Trevejskatalysatorer, der reducerer kvælstofilter i udstødning",
      "Rhodinering af hvidguld og sølvsmykker for glans og modstand mod anløbning",
      "Katalysator ved fremstilling af eddikesyre og ved hydroformylering af alkener",
      "Reflekterende belægninger på spejle og projektører",
    ],
    deeperEn:
      "William Hyde Wollaston discovered rhodium in 1804 in a sample of crude platinum ore from South America, shortly after he had found palladium. He named it from the Greek rhodon, meaning rose, because of the rose-red colour of its dissolved salts.\n\nRhodium is the most effective metal for converting nitrogen oxides to nitrogen in car exhaust, and tightening emissions rules have driven its price to many times the price of gold at times. It is produced in only a few tonnes a year as a by-product of platinum mining, mainly in South Africa. The Wilkinson catalyst, a rhodium complex, made possible selective hydrogenation of organic compounds under mild conditions.",
    deeperDa:
      "William Hyde Wollaston opdagede rhodium i 1804 i en prøve af rå platinmalm fra Sydamerika, kort efter han havde fundet palladium. Han navngav det efter græsk rhodon, der betyder rose, på grund af den rosenrøde farve i dets opløste salte.\n\nRhodium er det mest effektive metal til at omdanne kvælstofilter til kvælstof i bilers udstødning, og skærpede emissionsregler har til tider drevet prisen til mange gange guldprisen. Det udvindes kun i nogle få tons om året som biprodukt fra platinminer, hovedsageligt i Sydafrika. Wilkinson-katalysatoren, et rhodiumkompleks, gjorde selektiv hydrogenering af organiske stoffer mulig under milde forhold.",
  },
  {
    z: 46,
    symbol: "Pd",
    nameEn: "Palladium",
    nameDa: "Palladium",
    weight: "106.42",
    group: 10,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d10",
    summaryEn:
      "Palladium is a soft, silvery-white platinum group metal that can absorb up to 900 times its own volume of hydrogen. It is a valuable catalyst. Its electron configuration has a full 4d shell and no 5s electrons, which is unique among the elements.",
    summaryDa:
      "Palladium er et blødt, sølvhvidt platingruppemetal, der kan optage op til 900 gange sit eget volumen brint. Det er en værdifuld katalysator. Dets elektronkonfiguration har en fyldt 4d-skal og ingen 5s-elektroner, hvilket er enestående blandt grundstofferne.",
    usesEn: [
      "Catalytic converters in petrol cars",
      "Palladium-catalysed coupling reactions used to make drugs and plastics",
      "Electrical contacts and multilayer ceramic capacitors in electronics",
      "Dental alloys, jewellery and white gold",
    ],
    usesDa: [
      "Katalysatorer i benzinbiler",
      "Palladiumkatalyserede koblingsreaktioner til fremstilling af medicin og plast",
      "Elektriske kontakter og keramiske kondensatorer i elektronik",
      "Tandlegeringer, smykker og hvidguld",
    ],
    deeperEn:
      "William Hyde Wollaston discovered palladium in 1802 and named it after the asteroid Pallas, which had been found the same year. He first sold it anonymously as a new noble metal called palladium, which led to a public dispute about whether it was a real element.\n\nPalladium-catalysed cross-coupling reactions, such as the Suzuki and Heck reactions, form carbon-carbon bonds and were recognised by the 2010 Nobel Prize in Chemistry. Palladium's ability to absorb hydrogen led to the cold fusion claims of 1989, which could not be reproduced. Most of the metal is mined in Russia and South Africa, and its price rose steeply as car makers replaced platinum with palladium in petrol catalysts.",
    deeperDa:
      "William Hyde Wollaston opdagede palladium i 1802 og opkaldte det efter asteroiden Pallas, der var fundet samme år. Han solgte det først anonymt som et nyt ædelt metal kaldet palladium, hvilket udløste en offentlig strid om, hvorvidt det var et rigtigt grundstof.\n\nPalladiumkatalyserede krydskoblingsreaktioner, som Suzuki- og Heck-reaktionerne, danner kulstof-kulstof-bindinger og blev hædret med Nobelprisen i kemi 2010. Palladiums evne til at optage brint førte til påstandene om kold fusion i 1989, som ikke kunne gentages. Det meste metal udvindes i Rusland og Sydafrika, og prisen steg kraftigt, da bilproducenter erstattede platin med palladium i katalysatorer til benzinbiler.",
  },
  {
    z: 47,
    symbol: "Ag",
    nameEn: "Silver",
    nameDa: "Sølv",
    weight: "107.87",
    group: 11,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d10 5s1",
    summaryEn:
      "Silver is a soft, bright, white metal with the highest electrical and thermal conductivity and reflectivity of all metals. It tarnishes slowly in air containing sulphur compounds. It has been used for coins, jewellery and tableware for thousands of years.",
    summaryDa:
      "Sølv er et blødt, blankt og hvidt metal med den højeste elektriske og termiske ledningsevne og refleksion af alle metaller. Det anløber langsomt i luft med svovlforbindelser. Det har i tusinder af år været brugt til mønter, smykker og bestik.",
    usesEn: [
      "Electrical contacts, conductive pastes and solar cell electrodes",
      "Jewellery, cutlery and sterling silver, which is 92.5 percent silver",
      "Silver halides in traditional photographic film",
      "Antibacterial dressings and coatings",
      "Mirrors and coins",
    ],
    usesDa: [
      "Elektriske kontakter, ledende pastaer og elektroder i solceller",
      "Smykker, bestik og sterlingsølv, der er 92,5 procent sølv",
      "Sølvhalogenider i traditionel fotografisk film",
      "Antibakterielle bandager og belægninger",
      "Spejle og mønter",
    ],
    deeperEn:
      "Silver has been mined since at least 3000 BCE, and its symbol Ag comes from the Latin argentum. The metal has been used as money across many cultures, and the mines at Laurion in Greece financed Athens in the fifth century BCE. Silver from the Americas reshaped the world economy after the 16th century.\n\nSilver tarnishes because it reacts with hydrogen sulphide in air to form black silver sulphide, which can be cleaned off without wearing away the metal. Silver ions kill bacteria by disrupting their enzymes and membranes, but overuse in consumer products can harm aquatic life. Photography depended for 150 years on the light sensitivity of silver bromide, and solar panels are now the fastest growing industrial use.",
    deeperDa:
      "Sølv har været udvundet siden mindst 3000 f.Kr., og symbolet Ag kommer af latin argentum. Metallet har været brugt som penge i mange kulturer, og minerne ved Laurion i Grækenland finansierede Athen i 400-tallet f.Kr. Sølv fra Amerika ændrede verdensøkonomien efter 1500-tallet.\n\nSølv anløber, fordi det reagerer med svovlbrinte i luften og danner sort sølvsulfid, som kan pudses af uden at slide metallet. Sølvioner dræber bakterier ved at forstyrre deres enzymer og membraner, men overforbrug i forbrugerprodukter kan skade livet i vand. Fotografi byggede i 150 år på sølvbromids lysfølsomhed, og solpaneler er nu den hurtigst voksende industrielle anvendelse.",
  },
  {
    z: 48,
    symbol: "Cd",
    nameEn: "Cadmium",
    nameDa: "Cadmium",
    weight: "112.41",
    group: 12,
    period: 5,
    category: "transition",
    phase: "solid",
    electronConfig: "[Kr] 4d10 5s2",
    summaryEn:
      "Cadmium is a soft, bluish-white metal that is chemically similar to zinc. It is toxic and accumulates in the kidneys and bones, so its uses have been reduced. It is mostly recovered as a by-product of zinc production.",
    summaryDa:
      "Cadmium er et blødt, blåhvidt metal, der kemisk ligner zink. Det er giftigt og ophobes i nyrer og knogler, så anvendelserne er blevet mindsket. Det udvindes mest som biprodukt fra zinkproduktion.",
    usesEn: [
      "Nickel-cadmium rechargeable batteries",
      "Cadmium telluride thin-film solar panels",
      "Pigments such as cadmium yellow and cadmium red in artists' paint",
      "Control rods in some nuclear reactors, since cadmium absorbs neutrons",
    ],
    usesDa: [
      "Genopladelige nikkel-cadmium-batterier",
      "Tyndfilmssolpaneler af cadmiumtellurid",
      "Pigmenter som cadmiumgul og cadmiumrød i kunstnermaling",
      "Kontrolstave i nogle atomreaktorer, fordi cadmium optager neutroner",
    ],
    deeperEn:
      "Friedrich Stromeyer discovered cadmium in 1817 as an impurity in zinc carbonate that turned yellow when heated. The name comes from cadmia, the ancient name for zinc ore. Cadmium yellow became a favourite pigment of Claude Monet and Vincent van Gogh.\n\nCadmium is toxic because it replaces zinc in the body and binds strongly to proteins. Itai-itai disease in Japan in the 20th century was caused by cadmium-polluted rice and water. The European Union restricts cadmium in electronics and most consumer products, and phosphate fertilisers made from rock that contains cadmium are monitored. Used nickel-cadmium batteries must be collected for recycling.",
    deeperDa:
      "Friedrich Stromeyer opdagede cadmium i 1817 som en urenhed i zinkcarbonat, der blev gul ved opvarmning. Navnet kommer af cadmia, det gamle navn for zinkmalm. Cadmiumgul blev et yndlingspigment hos Claude Monet og Vincent van Gogh.\n\nCadmium er giftigt, fordi det erstatter zink i kroppen og binder sig stærkt til proteiner. Itai-itai-sygdommen i Japan i 1900-tallet skyldtes cadmiumforurenet ris og vand. EU begrænser cadmium i elektronik og de fleste forbrugerprodukter, og fosfatgødning fra sten med cadmium overvåges. Brugte nikkel-cadmium-batterier skal afleveres til genanvendelse.",
  },
  {
    z: 49,
    symbol: "In",
    nameEn: "Indium",
    nameDa: "Indium",
    weight: "114.82",
    group: 13,
    period: 5,
    category: "post-transition",
    phase: "solid",
    electronConfig: "[Kr] 4d10 5s2 5p1",
    summaryEn:
      "Indium is a very soft, silvery-white metal that can be cut with a fingernail. It makes a high-pitched cry when bent, similar to tin. It is rare and is recovered mainly from zinc ore processing.",
    summaryDa:
      "Indium er et meget blødt, sølvhvidt metal, som kan skæres med en negl. Det udsender en høj knirkelyd, når det bøjes, ligesom tin. Det er sjældent og udvindes mest ved behandling af zinkmalm.",
    usesEn: [
      "Indium tin oxide, a transparent conductor in touchscreens, flat displays and solar cells",
      "Low-melting solders and thermal interface materials",
      "Indium phosphide semiconductors for fibre-optic communication",
      "Indium-111 in medical imaging",
    ],
    usesDa: [
      "Indium-tin-oxid, en gennemsigtig leder i berøringsskærme, flade skærme og solceller",
      "Lavtsmeltende loddemetaller og termiske kontaktmaterialer",
      "Indiumphosphid-halvledere til fiberoptisk kommunikation",
      "Indium-111 i medicinsk billeddannelse",
    ],
    deeperEn:
      "Ferdinand Reich and Hieronymus Theodor Richter discovered indium in 1863 while searching for thallium in zinc ore from Freiberg, Germany. They saw a bright indigo-blue line in the spectrum and named the element after the colour indigo. Richter went on to isolate the metal.\n\nIndium is about as rare in Earth's crust as silver, and it is never mined on its own. The rapid growth of flat-screen displays after 2000 made indium tin oxide the main use, and supply concerns have encouraged recycling from old screens. Indium wets glass and metals at low temperature, and solid indium is used to make a vacuum-tight seal in cryogenic equipment.",
    deeperDa:
      "Ferdinand Reich og Hieronymus Theodor Richter opdagede indium i 1863, mens de ledte efter thallium i zinkmalm fra Freiberg i Tyskland. De så en kraftig indigoblå linje i spektret og opkaldte grundstoffet efter farven indigo. Richter isolerede senere metallet.\n\nIndium er omtrent lige så sjældent i Jordens skorpe som sølv og udvindes aldrig alene. Den hurtige vækst i flade skærme efter 2000 gjorde indium-tin-oxid til den største anvendelse, og bekymring for forsyningen har fremmet genbrug fra gamle skærme. Indium væder glas og metaller ved lav temperatur, og fast indium bruges til at lave vakuumtætte samlinger i kryogent udstyr.",
  },
  {
    z: 50,
    symbol: "Sn",
    nameEn: "Tin",
    nameDa: "Tin",
    weight: "118.71",
    group: 14,
    period: 5,
    category: "post-transition",
    phase: "solid",
    electronConfig: "[Kr] 4d10 5s2 5p2",
    summaryEn:
      "Tin is a soft, silvery, malleable metal that resists corrosion. It has two main forms: the metallic white form at room temperature and a brittle grey powder form below about 13 degrees Celsius. It is a key ingredient of bronze and solder.",
    summaryDa:
      "Tin er et blødt, sølvfarvet og formbart metal, der modstår korrosion. Det har to hovedformer: den metalliske hvide form ved stuetemperatur og en sprød grå pulverform under omkring 13 grader Celsius. Det er en vigtig bestanddel af bronze og loddemetal.",
    usesEn: [
      "Solder for electronics and plumbing",
      "Tin plating on steel cans for food, known as tinplate",
      "Bronze with copper, and pewter with antimony and copper",
      "Float glass production, where molten glass floats on a bath of tin",
    ],
    usesDa: [
      "Loddemetal til elektronik og vvs",
      "Fortinning af stålplader til konservesdåser, kaldet blik",
      "Bronze med kobber og tinlegering med antimon og kobber",
      "Produktion af floatglas, hvor smeltet glas flyder på et bad af tin",
    ],
    deeperEn:
      "Tin was alloyed with copper to make bronze from about 3300 BCE, and since tin ore is rare, the trade in tin connected ancient civilisations from Cornwall to the Mediterranean. The symbol Sn comes from the Latin stannum.\n\nBelow about 13 degrees Celsius white tin slowly turns into grey tin, a brittle powder, in a process called tin pest. This was blamed for damage to organ pipes and military buttons in cold buildings. Tin has ten stable isotopes, more than any other element, which comes from its magic number of 50 protons. Organotin compounds were used in ship paint, but they harmed marine life and are now banned in that use.",
    deeperDa:
      "Tin blev legeret med kobber til bronze fra omkring 3300 f.Kr., og da tinmalm er sjælden, forbandt handlen med tin oldtidens kulturer fra Cornwall til Middelhavet. Symbolet Sn kommer af latin stannum.\n\nUnder omkring 13 grader Celsius omdannes hvidt tin langsomt til gråt tin, et sprødt pulver, i en proces kaldet tinpest. Det blev givet skylden for skader på orgelpiber og militærknapper i kolde bygninger. Tin har ti stabile isotoper, flere end noget andet grundstof, hvilket skyldes det magiske tal 50 for protoner. Organiske tinforbindelser blev brugt i skibsmaling, men skadede havlivet og er nu forbudt til det formål.",
  },
  {
    z: 51,
    symbol: "Sb",
    nameEn: "Antimony",
    nameDa: "Antimon",
    weight: "121.76",
    group: 15,
    period: 5,
    category: "metalloid",
    phase: "solid",
    electronConfig: "[Kr] 4d10 5s2 5p3",
    summaryEn:
      "Antimony is a brittle, silvery-white metalloid with a flaky crystal structure. It conducts heat and electricity poorly. It is toxic, and exposure is similar to that of arsenic, though its effects are generally less severe.",
    summaryDa:
      "Antimon er et sprødt, sølvhvidt halvmetal med en bladet krystalstruktur. Det leder varme og elektricitet dårligt. Det er giftigt, og påvirkningen minder om arsens, selvom virkningerne generelt er mindre alvorlige.",
    usesEn: [
      "Flame retardants, usually as antimony trioxide in plastics and textiles",
      "Hardening lead in lead-acid batteries",
      "Semiconductors such as indium antimonide for infrared detectors",
      "Catalyst in PET plastic production",
    ],
    usesDa: [
      "Brandhæmmende midler, oftest som antimontrioxid i plast og tekstiler",
      "Hærdning af bly i blybatterier",
      "Halvledere som indiumantimonid i infrarøde detektorer",
      "Katalysator ved fremstilling af PET-plast",
    ],
    deeperEn:
      "Antimony sulphide, stibnite, was used in ancient Egypt as the black cosmetic kohl for the eyes. The symbol Sb comes from the Latin stibium. The origin of the name antimony is uncertain, but it is often explained as anti-monos in Greek, meaning not alone, because it is rarely found as a pure metal.\n\nType metal for early printing presses was an alloy of lead, tin and antimony, because antimony causes the alloy to expand slightly as it solidifies and so gives sharp letters. Today most antimony is mined in China, Russia and Tajikistan, and the EU considers it a critical raw material. Medieval alchemists used antimony compounds in medicines, some of which were poisonous.",
    deeperDa:
      "Antimonsulfid, stibnit, blev brugt i det gamle Egypten som den sorte øjenmakeup kohl. Symbolet Sb kommer af latin stibium. Navnet antimons oprindelse er usikker, men forklares ofte som græsk anti-monos, der betyder ikke alene, fordi det sjældent findes som rent metal.\n\nTypemetal til tidlige bogtrykspresser var en legering af bly, tin og antimon, fordi antimon får legeringen til at udvide sig en smule ved størkning og dermed giver skarpe bogstaver. I dag udvindes det meste antimon i Kina, Rusland og Tadsjikistan, og EU regner det for en kritisk råvare. Middelalderens alkymister brugte antimonforbindelser i medicin, hvoraf nogle var giftige.",
  },
  {
    z: 52,
    symbol: "Te",
    nameEn: "Tellurium",
    nameDa: "Tellur",
    weight: "127.60",
    group: 16,
    period: 5,
    category: "metalloid",
    phase: "solid",
    electronConfig: "[Kr] 4d10 5s2 5p4",
    summaryEn:
      "Tellurium is a brittle, silvery-white metalloid that is rarer in Earth's crust than platinum. People who absorb even small amounts can develop garlic-smelling breath. It is mostly obtained as a by-product of copper refining.",
    summaryDa:
      "Tellur er et sprødt, sølvhvidt halvmetal, der er sjældnere i Jordens skorpe end platin. Selv små mængder, der optages i kroppen, kan give hvidløgslugt i åndedrættet. Det udvindes mest som biprodukt ved raffinering af kobber.",
    usesEn: [
      "Cadmium telluride thin-film solar panels",
      "Bismuth telluride in thermoelectric coolers and generators",
      "Alloys that make steel and copper easier to machine",
      "Phase-change materials in rewritable discs and memory",
    ],
    usesDa: [
      "Tyndfilmssolpaneler af cadmiumtellurid",
      "Bismuttellurid i termoelektriske kølere og generatorer",
      "Legeringer, der gør stål og kobber lettere at bearbejde",
      "Faseskiftematerialer i genskrivbare diske og hukommelse",
    ],
    deeperEn:
      "Franz-Joseph Müller von Reichenstein found tellurium in 1782 in gold ores from Transylvania, and Martin Heinrich Klaproth confirmed and named it in 1798 after the Latin tellus, meaning Earth. Several tellurides, including the gold-bearing mineral calaverite, are important ores.\n\nTellurium sits in the same group as oxygen and sulphur, but it is more metallic. Tiny amounts in the body are metabolised to dimethyl telluride, a volatile compound with a garlic smell that can persist for weeks. The solar industry has made tellurium more strategically important, as cadmium telluride modules are among the cheapest to produce, but the supply of the element is limited by how much copper is refined.",
    deeperDa:
      "Franz-Joseph Müller von Reichenstein fandt tellur i 1782 i guldmalm fra Transsylvanien, og Martin Heinrich Klaproth bekræftede og navngav det i 1798 efter latin tellus, der betyder Jorden. Flere tellurider, blandt andet det guldholdige mineral calaverit, er vigtige malme.\n\nTellur står i samme gruppe som ilt og svovl, men er mere metallisk. Små mængder i kroppen omdannes til dimethyltellurid, en flygtig forbindelse med hvidløgslugt, der kan blive i ugevis. Solindustrien har gjort tellur strategisk vigtigere, da cadmiumtellurid-moduler er blandt de billigste at fremstille, men udbuddet begrænses af, hvor meget kobber der raffineres.",
  },
  {
    z: 53,
    symbol: "I",
    nameEn: "Iodine",
    nameDa: "Jod",
    akaDa: "iod",
    weight: "126.90",
    group: 17,
    period: 5,
    category: "halogen",
    phase: "solid",
    electronConfig: "[Kr] 4d10 5s2 5p5",
    summaryEn:
      "Iodine is a lustrous, blue-black solid that sublimes into a violet vapour when warmed. It is the heaviest stable halogen. The body needs it to make thyroid hormones.",
    summaryDa:
      "Jod er et blankt, blåsort fast stof, der sublimerer til en violet damp, når det opvarmes. Det er det tungeste stabile halogen. Kroppen har brug for det til at danne skjoldbruskkirtelhormoner.",
    usesEn: [
      "Iodised table salt to prevent goitre and developmental problems",
      "Antiseptics such as povidone-iodine for wounds and surgery",
      "X-ray contrast media in medical imaging",
      "Radioactive iodine-131 for treating thyroid cancer and overactive thyroid",
    ],
    usesDa: [
      "Joderet bordsalt, der forebygger struma og udviklingsforstyrrelser",
      "Antiseptika som povidon-jod til sår og operationer",
      "Røntgenkontraststoffer i medicinsk billeddannelse",
      "Radioaktivt jod-131 til behandling af skjoldbruskkirtelkræft og overaktiv skjoldbruskkirtel",
    ],
    deeperEn:
      "Bernard Courtois discovered iodine in 1811 when he added too much sulphuric acid to seaweed ash while making saltpetre, and a violet vapour rose from the mixture. The name comes from the Greek iodes, meaning violet-coloured.\n\nIodine deficiency has been a major public health problem in inland and mountainous regions. Denmark introduced voluntary iodine fortification of salt in the 1990s and mandatory fortification of bread salt in 2001. Iodine-131 is released in nuclear accidents and accumulates in the thyroid, so potassium iodide tablets are issued to protect the thyroid by saturating it with harmless iodine. Brown algae concentrate iodine from seawater, which was once the main source.",
    deeperDa:
      "Bernard Courtois opdagede jod i 1811, da han tilsatte for meget svovlsyre til tangaske under fremstilling af salpeter, og en violet damp steg op fra blandingen. Navnet kommer af græsk iodes, der betyder violetfarvet.\n\nJodmangel har været et stort folkesundhedsproblem i indlandsområder og bjergegne. Danmark indførte frivillig jodberigelse af salt i 1990'erne og obligatorisk jodberigelse af brødsalt i 2001. Jod-131 frigives ved atomulykker og ophobes i skjoldbruskkirtlen, så der udleveres kaliumjodidtabletter for at beskytte kirtlen ved at mætte den med harmløst jod. Brune alger koncentrerer jod fra havvand, hvilket tidligere var den vigtigste kilde.",
  },
  {
    z: 54,
    symbol: "Xe",
    nameEn: "Xenon",
    nameDa: "Xenon",
    weight: "131.29",
    group: 18,
    period: 5,
    category: "noble-gas",
    phase: "gas",
    electronConfig: "[Kr] 4d10 5s2 5p6",
    summaryEn:
      "Xenon is a colourless, odourless, heavy noble gas that is very rare in the atmosphere, at about 0.09 parts per million. It is the most reactive of the stable noble gases and forms compounds with fluorine and oxygen. It glows blue in an electric discharge.",
    summaryDa:
      "Xenon er en farveløs, lugtfri og tung ædelgas, der er meget sjælden i atmosfæren, omkring 0,09 dele pr. million. Det er den mest reaktive af de stabile ædelgasser og danner forbindelser med fluor og ilt. Det lyser blåt i en elektrisk udladning.",
    usesEn: [
      "High-intensity xenon arc lamps in cinema projectors and car headlights",
      "Ion thrusters that propel spacecraft",
      "General anaesthetic and a contrast agent for lung imaging",
      "Camera flashes and flash lamps for lasers",
    ],
    usesDa: [
      "Xenonbuelamper i biografprojektorer og bilers forlygter",
      "Ionmotorer, der driver rumfartøjer frem",
      "Bedøvelsesmiddel og kontraststof til lungebilleder",
      "Kameraflash og blitzlamper til lasere",
    ],
    deeperEn:
      "William Ramsay and Morris Travers discovered xenon in 1898, a few weeks after neon, by studying the residue of evaporated liquid air. The name comes from the Greek xenos, meaning stranger or foreigner. Neil Bartlett's synthesis of xenon hexafluoroplatinate in 1962 overturned the belief that noble gases form no compounds and started noble gas chemistry.\n\nXenon is used as the propellant in spacecraft ion engines because its atoms are heavy and easy to ionise. Because of its high atomic mass, it is also used in dark matter detectors, where large tanks of liquid xenon are placed deep underground to catch rare particle interactions. It is produced as a by-product of air separation, about ten times rarer than krypton.",
    deeperDa:
      "William Ramsay og Morris Travers opdagede xenon i 1898, få uger efter neon, ved at undersøge resten af fordampet flydende luft. Navnet kommer af græsk xenos, der betyder fremmed. Neil Bartletts syntese af xenonhexafluoroplatinat i 1962 væltede forestillingen om, at ædelgasser ikke danner forbindelser, og startede ædelgaskemien.\n\nXenon bruges som drivmiddel i rumfartøjers ionmotorer, fordi atomerne er tunge og lette at ionisere. På grund af den høje atommasse bruges det også i detektorer til mørkt stof, hvor store tanke med flydende xenon placeres dybt under jorden for at fange sjældne partikelvekselvirkninger. Det fremstilles som biprodukt ved luftseparation, og er omkring ti gange sjældnere end krypton.",
  },
  {
    z: 55,
    symbol: "Cs",
    nameEn: "Caesium",
    nameDa: "Cæsium",
    weight: "132.91",
    group: 1,
    period: 6,
    category: "alkali",
    phase: "solid",
    electronConfig: "[Xe] 6s1",
    summaryEn:
      "Caesium is a soft, golden-silvery alkali metal that melts at about 28.5 degrees Celsius, so it can be liquid on a warm day. It is the most reactive stable metal and reacts explosively with cold water. It is the basis of the definition of the second.",
    summaryDa:
      "Cæsium er et blødt, gyldent sølvfarvet alkalimetal, der smelter ved omkring 28,5 grader Celsius og derfor kan være flydende på en varm dag. Det er det mest reaktive stabile metal og reagerer eksplosivt med koldt vand. Det er grundlaget for definitionen af sekundet.",
    usesEn: [
      "Caesium atomic clocks, which define the second",
      "Caesium formate drilling fluids for deep oil and gas wells",
      "Photoelectric cells and night-vision equipment",
      "Caesium-137 in cancer radiotherapy and industrial gauges",
    ],
    usesDa: [
      "Cæsium-atomure, der definerer sekundet",
      "Cæsiumformiat-borevæsker til dybe olie- og gasbrønde",
      "Fotoceller og mørkesynsudstyr",
      "Cæsium-137 i strålebehandling mod kræft og industrielle måleinstrumenter",
    ],
    deeperEn:
      "Robert Bunsen and Gustav Kirchhoff discovered caesium in 1860 in mineral water from Bad Dürkheim, from two bright blue lines in its spectrum. The name comes from the Latin caesius, meaning sky blue. It was the first element to be found by spectroscopy.\n\nSince 1967 the second has been defined as 9,192,631,770 oscillations of a specific microwave transition in caesium-133 atoms, which makes caesium clocks accurate to about one second in many millions of years. The fission product caesium-137, with a half-life of about 30 years, is a major contaminant after accidents such as Chernobyl and Fukushima, because it behaves like potassium and enters food chains.",
    deeperDa:
      "Robert Bunsen og Gustav Kirchhoff opdagede cæsium i 1860 i mineralvand fra Bad Dürkheim ud fra to kraftige blå linjer i spektret. Navnet kommer af latin caesius, der betyder himmelblå. Det var det første grundstof, der blev fundet ved spektroskopi.\n\nSiden 1967 har sekundet været defineret som 9.192.631.770 svingninger i en bestemt mikrobølgeovergang i cæsium-133-atomer, hvilket gør cæsiumure nøjagtige til omkring ét sekund på mange millioner år. Fissionsproduktet cæsium-137, med en halveringstid på omkring 30 år, er en vigtig forurening efter ulykker som Tjernobyl og Fukushima, fordi det opfører sig som kalium og kommer ind i fødekæderne.",
  },
  {
    z: 56,
    symbol: "Ba",
    nameEn: "Barium",
    nameDa: "Barium",
    weight: "137.33",
    group: 2,
    period: 6,
    category: "alkaline-earth",
    phase: "solid",
    electronConfig: "[Xe] 6s2",
    summaryEn:
      "Barium is a soft, silvery-white alkaline earth metal that oxidises quickly in air and reacts with water. Most of its soluble compounds are poisonous. Its insoluble sulphate is safe and very dense, and it is used in medical imaging.",
    summaryDa:
      "Barium er et blødt, sølvhvidt jordalkalimetal, der hurtigt oxiderer i luft og reagerer med vand. De fleste opløselige forbindelser er giftige. Det uopløselige sulfat er ufarligt og meget tæt, og det bruges i medicinsk billeddannelse.",
    usesEn: [
      "Barium sulphate as a contrast medium for X-ray imaging of the digestive tract",
      "Heavy drilling mud for oil and gas wells",
      "Green colour in fireworks",
      "Glass, ceramics and ferrite magnets",
    ],
    usesDa: [
      "Bariumsulfat som kontraststof ved røntgenundersøgelse af mave-tarm-kanalen",
      "Tung borevæske til olie- og gasbrønde",
      "Grøn farve i fyrværkeri",
      "Glas, keramik og ferritmagneter",
    ],
    deeperEn:
      "Carl Wilhelm Scheele recognised a new earth in the mineral baryte in 1774, and Humphry Davy isolated the metal in 1808 by electrolysis. The name comes from the Greek barys, meaning heavy, because baryte is unusually dense.\n\nSoluble barium salts such as the chloride and carbonate are toxic because barium ions block potassium channels in cells, whereas barium sulphate is so insoluble that patients can safely drink it as a barium meal before an X-ray. Baryte from the Bologna region was known as the Bologna stone in the 17th century because it glowed after being heated with charcoal, which attracted early interest in phosphorescence.",
    deeperDa:
      "Carl Wilhelm Scheele erkendte en ny jordart i mineralet baryt i 1774, og Humphry Davy isolerede metallet i 1808 ved elektrolyse. Navnet kommer af græsk barys, der betyder tung, fordi baryt er usædvanligt tæt.\n\nOpløselige bariumsalte som chlorid og carbonat er giftige, fordi bariumioner blokerer kaliumkanaler i celler, mens bariumsulfat er så uopløseligt, at patienter sikkert kan drikke det som bariumgrød før en røntgenundersøgelse. Baryt fra egnen ved Bologna blev i 1600-tallet kaldt Bolognasten, fordi den lyste efter opvarmning med trækul, hvilket vakte tidlig interesse for fosforescens.",
  },
  {
    z: 57,
    symbol: "La",
    nameEn: "Lanthanum",
    nameDa: "Lanthan",
    weight: "138.91",
    group: 3,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 5d1 6s2",
    summaryEn:
      "Lanthanum is a soft, silvery-white rare earth metal that tarnishes quickly in air. It gives its name to the lanthanide series. It is used in optical glass, catalysts and rechargeable batteries.",
    summaryDa:
      "Lanthan er et blødt, sølvhvidt sjældent jordmetal, der hurtigt anløber i luft. Det har givet navn til lanthanid-rækken. Det bruges i optisk glas, katalysatorer og genopladelige batterier.",
    usesEn: [
      "Camera and telescope lenses with a high refractive index",
      "Fluid catalytic cracking catalysts in oil refineries",
      "Nickel-metal hydride batteries, such as those in hybrid cars",
      "Carbon arc lights for studio lighting and cinema projection",
    ],
    usesDa: [
      "Kamera- og teleskoplinser med højt brydningsindeks",
      "Katalysatorer til katalytisk krakning på olieraffinaderier",
      "Nikkel-metalhydrid-batterier, for eksempel i hybridbiler",
      "Kulbuelamper til studiebelysning og biografprojektion",
    ],
    deeperEn:
      "Carl Gustaf Mosander discovered lanthanum in 1839 as an impurity in cerium nitrate. He named it from the Greek lanthanein, meaning to lie hidden, because it had remained concealed in cerium minerals. He later found didymium in the same sample, which was split into praseodymium and neodymium in 1885.\n\nLanthanum is not rare in absolute terms. It is more abundant in the crust than lead. However, the lanthanides occur mixed together in minerals such as monazite and bastnasite, and separating them took more than a century of work. Lanthanum has the f-shell empty in its ground state, so the series that is named after it is defined by filling of the 4f shell in the following elements.",
    deeperDa:
      "Carl Gustaf Mosander opdagede lanthan i 1839 som en urenhed i cerium-nitrat. Han navngav det efter græsk lanthanein, der betyder at ligge skjult, fordi det havde holdt sig skjult i ceriummineraler. Han fandt senere didym i den samme prøve, som i 1885 blev delt i praseodym og neodym.\n\nLanthan er ikke sjældent i absolut forstand. Det er mere almindeligt i skorpen end bly. Men lanthaniderne optræder blandet i mineraler som monazit og bastnäsit, og det tog mere end et århundrede at skille dem ad. Lanthan har tom f-skal i grundtilstand, så rækken, der er opkaldt efter det, defineres af opfyldningen af 4f-skallen i de følgende grundstoffer.",
  },
  {
    z: 58,
    symbol: "Ce",
    nameEn: "Cerium",
    nameDa: "Cerium",
    weight: "140.12",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f1 5d1 6s2",
    summaryEn:
      "Cerium is a soft, silvery-white metal and the most abundant of the rare earth elements. It ignites easily when scratched or filed. It is unusual among the lanthanides for having a stable +4 oxidation state.",
    summaryDa:
      "Cerium er et blødt, sølvhvidt metal og det mest almindelige af de sjældne jordarter. Det antændes let, når det ridses eller files. Det er usædvanligt blandt lanthaniderne ved at have et stabilt +4-oxidationstrin.",
    usesEn: [
      "Ferrocerium flints in lighters and fire starters",
      "Cerium oxide for polishing glass, lenses and silicon wafers",
      "Catalytic converters, where cerium oxide stores and releases oxygen",
      "Self-cleaning oven walls and UV-absorbing glass",
    ],
    usesDa: [
      "Fire-flint af ferrocerium i lightere og optændingsværktøj",
      "Ceriumoxid til polering af glas, linser og siliciumwafere",
      "Katalysatorer, hvor ceriumoxid lagrer og frigiver ilt",
      "Selvrensende ovnvægge og UV-absorberende glas",
    ],
    deeperEn:
      "Jöns Jacob Berzelius and Wilhelm Hisinger in Sweden, and independently Martin Heinrich Klaproth in Germany, discovered cerium in 1803. It is named after the dwarf planet Ceres, discovered two years earlier. It is about as common in the crust as copper.\n\nCerium is the lanthanide most readily used in the +4 oxidation state, and this makes it useful as a strong oxidising agent in analysis, where cerium(IV) solutions are used for titrations. In car catalysts the cerium ion switches between +3 and +4 to buffer the oxygen level in the exhaust. Ferrocerium, an alloy of cerium, iron and other metals, throws hot sparks when struck and was patented by Carl Auer von Welsbach in 1903.",
    deeperDa:
      "Jöns Jacob Berzelius og Wilhelm Hisinger i Sverige og uafhængigt Martin Heinrich Klaproth i Tyskland opdagede cerium i 1803. Det er opkaldt efter dværgplaneten Ceres, der var opdaget to år tidligere. Det er omtrent lige så almindeligt i skorpen som kobber.\n\nCerium er det lanthanid, der mest praktisk bruges i +4-oxidationstilstand, og det gør det brugbart som stærkt oxidationsmiddel i analyse, hvor cerium(IV)-opløsninger bruges til titreringer. I bilkatalysatorer skifter ceriumionen mellem +3 og +4 for at udjævne iltniveauet i udstødningen. Ferrocerium, en legering af cerium, jern og andre metaller, kaster varme gnister, når det slås, og blev patenteret af Carl Auer von Welsbach i 1903.",
  },
  {
    z: 59,
    symbol: "Pr",
    nameEn: "Praseodymium",
    nameDa: "Praseodym",
    weight: "140.91",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f3 6s2",
    summaryEn:
      "Praseodymium is a soft, silvery-yellow rare earth metal that develops a green oxide layer in air. Its salts are green. It is used in strong magnets, in aircraft alloys and in glass that filters yellow light.",
    summaryDa:
      "Praseodym er et blødt, sølvgult sjældent jordmetal, der danner et grønt oxidlag i luft. Saltene er grønne. Det bruges i stærke magneter, i flylegeringer og i glas, der filtrerer gult lys.",
    usesEn: [
      "Neodymium-praseodymium magnets in wind turbines and electric motors",
      "Magnesium alloys for aircraft engines",
      "Didymium glass in welders' and glassblowers' goggles",
      "Yellow and green colours in ceramics and glass",
    ],
    usesDa: [
      "Neodym-praseodym-magneter i vindmøller og elmotorer",
      "Magnesiumlegeringer til flymotorer",
      "Didymglas i svejseres og glaspusteres beskyttelsesbriller",
      "Gule og grønne farver i keramik og glas",
    ],
    deeperEn:
      "Carl Auer von Welsbach separated praseodymium from the mixture called didymium in 1885, along with neodymium. Mosander had named didymium, meaning twin, as a supposed element in 1841. The name praseodymium comes from the Greek prasios, meaning leek-green, and didymos, meaning twin, because of the green salts.\n\nPraseodymium is usually extracted together with neodymium and used as a blended oxide, since the two have very similar chemistry. Magnets made from neodymium, iron and boron often contain some praseodymium in place of part of the neodymium, which improves the performance at high temperature. The demand for permanent magnets in electric vehicles and offshore wind turbines has made this one of the economically most important rare earth elements.",
    deeperDa:
      "Carl Auer von Welsbach skilte praseodym fra blandingen didym i 1885 sammen med neodym. Mosander havde i 1841 givet navnet didym, der betyder tvilling, til et formodet grundstof. Navnet praseodym kommer af græsk prasios, der betyder porrergrøn, og didymos, der betyder tvilling, på grund af de grønne salte.\n\nPraseodym udvindes normalt sammen med neodym og bruges som en blandet oxid, da de to har meget ensartet kemi. Magneter af neodym, jern og bor indeholder ofte noget praseodym i stedet for en del af neodymet, hvilket forbedrer ydelsen ved høj temperatur. Efterspørgslen på permanente magneter i elbiler og havvindmøller har gjort det til et af de økonomisk vigtigste sjældne jordmetaller.",
  },
  {
    z: 60,
    symbol: "Nd",
    nameEn: "Neodymium",
    nameDa: "Neodym",
    weight: "144.24",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f4 6s2",
    summaryEn:
      "Neodymium is a soft, silvery rare earth metal that tarnishes quickly in air. It is the key ingredient of the strongest commercial permanent magnets. Its compounds are pink to purple and give some glass and lasers their colour.",
    summaryDa:
      "Neodym er et blødt, sølvfarvet sjældent jordmetal, der hurtigt anløber i luft. Det er hovedbestanddelen i de stærkeste kommercielle permanente magneter. Forbindelserne er lyserøde til violette og giver noget glas og nogle lasere deres farve.",
    usesEn: [
      "NdFeB magnets in wind turbine generators, electric car motors and hard drives",
      "Headphones, loudspeakers and microphones",
      "Nd:YAG lasers for cutting, engraving and medical procedures",
      "Purple colour in glass and ceramics",
    ],
    usesDa: [
      "NdFeB-magneter i vindmøllegeneratorer, elbilsmotorer og harddiske",
      "Hovedtelefoner, højttalere og mikrofoner",
      "Nd:YAG-lasere til skæring, gravering og medicinske indgreb",
      "Violet farve i glas og keramik",
    ],
    deeperEn:
      "Carl Auer von Welsbach separated neodymium from didymium in 1885 and named it from the Greek neos, meaning new, and didymos, meaning twin. It remained a laboratory curiosity until the 1980s, when Sumitomo and General Motors developed the neodymium-iron-boron magnet independently.\n\nThese magnets are many times stronger than ferrite magnets of the same size, which makes electric motors and generators smaller and lighter. A direct-drive wind turbine can contain hundreds of kilograms of neodymium magnets. Mining and refining rare earths produces radioactive waste, because the ores contain thorium, and about 60 percent of mining and most of the refining takes place in China, which makes recycling and new supply chains a priority.",
    deeperDa:
      "Carl Auer von Welsbach skilte neodym fra didym i 1885 og navngav det efter græsk neos, der betyder ny, og didymos, der betyder tvilling. Det forblev en laboratoriekuriositet indtil 1980'erne, da Sumitomo og General Motors uafhængigt udviklede neodym-jern-bor-magneten.\n\nDisse magneter er mange gange stærkere end ferritmagneter af samme størrelse, hvilket gør elmotorer og generatorer mindre og lettere. En direkte drevet vindmølle kan indeholde hundredvis af kilo neodymmagneter. Udvinding og raffinering af sjældne jordarter giver radioaktivt affald, fordi malmen indeholder thorium, og omkring 60 procent af minedriften og det meste af raffineringen foregår i Kina, hvilket gør genbrug og nye forsyningskæder til en prioritet.",
  },
  {
    z: 61,
    symbol: "Pm",
    nameEn: "Promethium",
    nameDa: "Promethium",
    weight: "[145]",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f5 6s2",
    summaryEn:
      "Promethium is a radioactive lanthanide with no stable isotopes. Only trace amounts exist in nature, and it is produced as a fission product in nuclear reactors. Its salts glow pale blue or green in the dark from their own radiation.",
    summaryDa:
      "Promethium er et radioaktivt lanthanid uden stabile isotoper. Der findes kun spor i naturen, og det fremstilles som fissionsprodukt i atomreaktorer. Saltene lyser svagt blåt eller grønt i mørke af deres egen stråling.",
    usesEn: [
      "Luminous paint in dials and watches, replaced mainly by tritium",
      "Betavoltaic nuclear batteries for spacecraft and remote devices",
      "Thickness gauges that use its beta radiation",
      "Research on heavy rare earth chemistry",
    ],
    usesDa: [
      "Selvlysende maling i skiver og ure, hovedsageligt afløst af tritium",
      "Betavoltaiske atombatterier til rumfartøjer og fjerntliggende udstyr",
      "Tykkelsesmålere, der bruger dets betastråling",
      "Forskning i kemien hos tunge sjældne jordarter",
    ],
    deeperEn:
      "Promethium was identified in 1945 by Jacob Marinsky, Lawrence Glendenin and Charles Coryell at Oak Ridge National Laboratory from fission products of uranium. They named it after Prometheus, the Titan who stole fire from the gods, as a symbol of the dangers and promise of harnessing nuclear energy. Its absence in nature had puzzled chemists for decades.\n\nThe longest-lived isotope, promethium-145, has a half-life of 17.7 years. Because it is so short compared with the age of the Earth, almost none remains from the formation of the planet. It is estimated that the whole crust holds only about 500 to 600 grams at any time, formed by spontaneous fission of uranium and by the decay of europium-151. Handling requires radiation shielding.",
    deeperDa:
      "Promethium blev identificeret i 1945 af Jacob Marinsky, Lawrence Glendenin og Charles Coryell på Oak Ridge National Laboratory ud fra fissionsprodukter fra uran. De opkaldte det efter Prometheus, titanen der stjal ilden fra guderne, som symbol på farerne og mulighederne ved at udnytte atomenergi. Dets fravær i naturen havde forundret kemikere i årtier.\n\nDen længstlevende isotop, promethium-145, har en halveringstid på 17,7 år. Fordi den er så kort sammenlignet med Jordens alder, er der næsten intet tilbage fra planetens dannelse. Det anslås, at hele skorpen kun rummer omkring 500 til 600 gram ad gangen, dannet ved spontan fission af uran og ved henfald af europium-151. Håndtering kræver strålingsafskærmning.",
  },
  {
    z: 62,
    symbol: "Sm",
    nameEn: "Samarium",
    nameDa: "Samarium",
    weight: "150.36",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f6 6s2",
    summaryEn:
      "Samarium is a moderately hard, silvery rare earth metal that slowly oxidises in air and ignites at around 150 degrees Celsius. It makes very strong magnets with cobalt. Natural samarium is weakly radioactive, but its radiation is of little concern.",
    summaryDa:
      "Samarium er et middelhårdt, sølvfarvet sjældent jordmetal, der langsomt oxiderer i luft og antændes ved omkring 150 grader Celsius. Det danner meget stærke magneter med kobolt. Naturligt samarium er svagt radioaktivt, men strålingen har kun ringe betydning.",
    usesEn: [
      "Samarium-cobalt magnets that keep working at high temperatures in aerospace and military systems",
      "Samarium-153 lexidronam for relieving pain from cancer that has spread to bone",
      "Neutron-absorbing control rods and shielding",
      "Cinema carbon arc lamps and infrared-absorbing glass",
    ],
    usesDa: [
      "Samarium-kobolt-magneter, der virker ved høj temperatur i luftfart og militære systemer",
      "Samarium-153 lexidronam til lindring af smerter ved kræft, der har spredt sig til knogler",
      "Neutronabsorberende kontrolstave og afskærmning",
      "Kulbuelamper til biografer og infrarød-absorberende glas",
    ],
    deeperEn:
      "Paul-Émile Lecoq de Boisbaudran discovered samarium in 1879 by spectroscopy in the mineral samarskite. It was one of the earliest elements whose name ultimately honours a specific person, because samarskite had been named after Vasili Samarsky-Bykhovets, a Russian mining official.\n\nSamarium-cobalt magnets, developed in the 1960s, were the first rare earth magnets and still outperform neodymium magnets in heat and corrosion resistance. Samarium-149 absorbs neutrons strongly and builds up in nuclear reactors as a poison, which operators must account for. Samarium-147 decays slowly to neodymium-143 with a half-life of about 106 billion years, a system used to date meteorites and ancient rocks.",
    deeperDa:
      "Paul-Émile Lecoq de Boisbaudran opdagede samarium i 1879 ved spektroskopi i mineralet samarskit. Navnet kom på en omvej af en person, for samarskit var opkaldt efter Vasilij Samarskij-Bychovets, en russisk bjergværksembedsmand, så samarium er et af de tidlige grundstoffer, hvis navn ultimativt knytter sig til en bestemt person.\n\nSamarium-kobolt-magneter, udviklet i 1960'erne, var de første magneter af sjældne jordarter og overgår stadig neodymmagneter i varme- og korrosionsbestandighed. Samarium-149 optager neutroner kraftigt og ophobes i atomreaktorer som gift, hvilket operatørerne skal tage højde for. Samarium-147 henfalder langsomt til neodym-143 med en halveringstid på omkring 106 milliarder år, et system der bruges til at datere meteoritter og gamle bjergarter.",
  },
  {
    z: 63,
    symbol: "Eu",
    nameEn: "Europium",
    nameDa: "Europium",
    weight: "151.96",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f7 6s2",
    summaryEn:
      "Europium is a soft, silvery rare earth metal and the most reactive of the lanthanides. It oxidises rapidly in air. Its compounds are valued for bright red and blue phosphors.",
    summaryDa:
      "Europium er et blødt, sølvfarvet sjældent jordmetal og det mest reaktive af lanthaniderne. Det oxiderer hurtigt i luft. Forbindelserne værdsættes for kraftige røde og blå fosforstoffer.",
    usesEn: [
      "Red phosphors in colour television tubes and fluorescent lamps",
      "Blue phosphors in LEDs and energy-saving lamps",
      "Anti-counterfeiting markers in euro banknotes that glow under UV light",
      "Neutron absorbers in some nuclear control rods",
    ],
    usesDa: [
      "Røde fosforstoffer i farve-tv-rør og lysstofrør",
      "Blå fosforstoffer i lysdioder og sparepærer",
      "Mærker mod forfalskning i eurosedler, der lyser under UV-lys",
      "Neutronabsorbere i nogle kontrolstave i atomreaktorer",
    ],
    deeperEn:
      "Eugène-Anatole Demarçay is credited with discovering europium in 1901 after isolating it from samarium, based on spectral lines he had seen earlier. It is named after the continent of Europe.\n\nEuropium is one of the few lanthanides commonly found in the +2 state in minerals, because the divalent ion has the stable half-filled 4f7 configuration. The red phosphor europium-doped yttrium oxide made colour television bright and practical in the 1960s. Europium is relatively rare, and the sets of lines in its emission spectrum are so sharp that it is also used to detect biological molecules through long-lasting fluorescence labels.",
    deeperDa:
      "Eugène-Anatole Demarçay krediteres for opdagelsen af europium i 1901 efter at have isoleret det fra samarium ud fra spektrallinjer, han havde set tidligere. Det er opkaldt efter kontinentet Europa.\n\nEuropium er et af de få lanthanider, der almindeligvis findes i +2-tilstand i mineraler, fordi den toværdige ion har den stabile halvfyldte 4f7-konfiguration. Den røde fosfor europiumdopet yttriumoxid gjorde farve-tv lyst og praktisk i 1960'erne. Europium er relativt sjældent, og linjerne i dets emissionsspektrum er så skarpe, at det også bruges til at påvise biologiske molekyler med langtidsholdbare fluorescensmærker.",
  },
  {
    z: 64,
    symbol: "Gd",
    nameEn: "Gadolinium",
    nameDa: "Gadolinium",
    weight: "157.25",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f7 5d1 6s2",
    summaryEn:
      "Gadolinium is a silvery-white, malleable rare earth metal that is ferromagnetic below about 20 degrees Celsius. It has the highest neutron absorption of any stable element. Its ions are strongly paramagnetic, which is useful in medical imaging.",
    summaryDa:
      "Gadolinium er et sølvhvidt, formbart sjældent jordmetal, der er ferromagnetisk under omkring 20 grader Celsius. Det har den højeste neutronoptagelse af alle stabile grundstoffer. Ionerne er stærkt paramagnetiske, hvilket er nyttigt i medicinsk billeddannelse.",
    usesEn: [
      "Gadolinium-based contrast agents for MRI scans",
      "Neutron-absorbing shielding and control materials in reactors",
      "Green phosphors in X-ray screens and scintillators",
      "Magnetic refrigeration research, because of its strong magnetocaloric effect",
    ],
    usesDa: [
      "Gadoliniumbaserede kontraststoffer til MR-skanninger",
      "Neutronabsorberende afskærmning og kontrolmaterialer i reaktorer",
      "Grønne fosforstoffer i røntgenskærme og scintillatorer",
      "Forskning i magnetisk køling på grund af den stærke magnetokaloriske effekt",
    ],
    deeperEn:
      "Jean Charles de Marignac discovered the oxide of gadolinium in 1880, and Paul-Émile Lecoq de Boisbaudran isolated it in 1886. It is named after the mineral gadolinite, which honours the Finnish chemist Johan Gadolin, who first analysed the Ytterby mineral that held several rare earths.\n\nIn MRI, a gadolinium ion bound to a large organic chelate shortens the relaxation time of nearby water protons, which makes tissues with the agent appear brighter. Free gadolinium ions are toxic, so the chelate must be stable, and in rare cases of kidney failure the agent has been linked to a serious skin and organ condition. Gadolinium-157 captures neutrons so strongly that it is a candidate material for neutron capture therapy and shielding.",
    deeperDa:
      "Jean Charles de Marignac opdagede gadoliniums oxid i 1880, og Paul-Émile Lecoq de Boisbaudran isolerede det i 1886. Det er opkaldt efter mineralet gadolinit, som hædrer den finske kemiker Johan Gadolin, der først analyserede Ytterby-mineralet med flere sjældne jordarter.\n\nVed MR forkorter en gadoliniumion bundet til en stor organisk chelat relaksationstiden for nærliggende vandprotoner, hvilket får væv med kontraststoffet til at fremstå lysere. Frie gadoliniumioner er giftige, så chelaten skal være stabil, og i sjældne tilfælde af nyresvigt er kontraststoffet blevet knyttet til en alvorlig hud- og organlidelse. Gadolinium-157 indfanger neutroner så kraftigt, at det er et kandidatmateriale til neutronindfangningsterapi og afskærmning.",
  },
  {
    z: 65,
    symbol: "Tb",
    nameEn: "Terbium",
    nameDa: "Terbium",
    weight: "158.93",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f9 6s2",
    summaryEn:
      "Terbium is a soft, silvery-white rare earth metal that is stable in air at room temperature. Its main use is as the source of green light in phosphors. It is also an additive in strong magnets and in magnetostrictive alloys.",
    summaryDa:
      "Terbium er et blødt, sølvhvidt sjældent jordmetal, der er stabilt i luft ved stuetemperatur. Dets vigtigste anvendelse er som kilde til grønt lys i fosforstoffer. Det er også en tilsætning i stærke magneter og i magnetostriktive legeringer.",
    usesEn: [
      "Green phosphors in fluorescent lamps, LED lighting and displays",
      "Terfenol-D alloy in sonar and precision actuators",
      "Additive in neodymium magnets for high-temperature performance",
      "Stabiliser in solid oxide fuel cells",
    ],
    usesDa: [
      "Grønne fosforstoffer i lysstofrør, LED-belysning og skærme",
      "Terfenol-D-legering i sonar og præcisionsaktuatorer",
      "Tilsætning i neodymmagneter for ydelse ved høj temperatur",
      "Stabilisator i faststofbrændselsceller",
    ],
    deeperEn:
      "Carl Gustaf Mosander discovered terbium in 1843 as a minor component of yttria from Ytterby, and named it after the village. The separation of the rare earths from yttria was a long process, and the final pure terbium metal was not obtained until the 20th century.\n\nTerbium is one of the heavy rare earths and is much scarcer than neodymium. It is included in neodymium magnets because it raises their resistance to demagnetisation at high temperature, which matters for electric vehicle motors. Terfenol-D, an alloy of terbium, dysprosium and iron, changes its length in a magnetic field by a relatively large amount, and this magnetostriction is used in sound transducers and precision positioning.",
    deeperDa:
      "Carl Gustaf Mosander opdagede terbium i 1843 som en mindre bestanddel af yttria fra Ytterby og opkaldte det efter landsbyen. Adskillelsen af de sjældne jordarter fra yttria var en lang proces, og rent terbiummetal blev først opnået i 1900-tallet.\n\nTerbium er en af de tunge sjældne jordarter og langt knappere end neodym. Det indgår i neodymmagneter, fordi det øger modstanden mod afmagnetisering ved høj temperatur, hvilket er vigtigt for motorer i elbiler. Terfenol-D, en legering af terbium, dysprosium og jern, ændrer længde i et magnetfelt med et forholdsvis stort udslag, og denne magnetostriktion bruges i lydtransducere og præcisionspositionering.",
  },
  {
    z: 66,
    symbol: "Dy",
    nameEn: "Dysprosium",
    nameDa: "Dysprosium",
    weight: "162.50",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f10 6s2",
    summaryEn:
      "Dysprosium is a soft, silvery rare earth metal that is relatively stable in air. It has one of the highest magnetic strengths of any element at low temperature. It is added to neodymium magnets so they keep their strength when hot.",
    summaryDa:
      "Dysprosium er et blødt, sølvfarvet sjældent jordmetal, der er forholdsvis stabilt i luft. Det har en af de højeste magnetiske styrker af alle grundstoffer ved lav temperatur. Det tilsættes neodymmagneter, så de bevarer styrken, når de er varme.",
    usesEn: [
      "Neodymium magnets for electric vehicle motors and wind turbine generators",
      "Control rods in nuclear reactors, since it absorbs neutrons well",
      "Dosimeters that measure ionising radiation",
      "Data storage materials and lasers",
    ],
    usesDa: [
      "Neodymmagneter til motorer i elbiler og generatorer i vindmøller",
      "Kontrolstave i atomreaktorer, da det optager neutroner godt",
      "Dosimetre, der måler ioniserende stråling",
      "Datalagringsmaterialer og lasere",
    ],
    deeperEn:
      "Paul-Émile Lecoq de Boisbaudran isolated dysprosium in 1886 from holmium oxide, after more than 30 attempts to separate it. The name comes from the Greek dysprositos, meaning hard to get. Pure metal was only made in the 1950s when ion-exchange chromatography was developed at Iowa State University.\n\nAdding a few percent of dysprosium to neodymium magnets raises their coercivity, which is the resistance to losing their magnetism, so they can work in hot motors. Dysprosium is one of the elements most at risk of supply shortages, as production is concentrated in a few countries and demand is growing with the shift to electric transport and wind power. Research to reduce dysprosium in magnets by changing their microstructure is ongoing.",
    deeperDa:
      "Paul-Émile Lecoq de Boisbaudran isolerede dysprosium i 1886 fra holmiumoxid efter mere end 30 forsøg på at skille det fra. Navnet kommer af græsk dysprositos, der betyder svær at få fat i. Rent metal blev først fremstillet i 1950'erne, da ionbytterkromatografi blev udviklet på Iowa State University.\n\nEn tilsætning af nogle få procent dysprosium til neodymmagneter øger koercitiviteten, altså modstanden mod at miste magnetismen, så de kan virke i varme motorer. Dysprosium er et af de grundstoffer, der er mest udsat for forsyningsmangel, da produktionen er koncentreret i få lande, og efterspørgslen vokser med skiftet til elektrisk transport og vindkraft. Der forskes i at reducere dysprosium i magneter ved at ændre deres mikrostruktur.",
  },
  {
    z: 67,
    symbol: "Ho",
    nameEn: "Holmium",
    nameDa: "Holmium",
    weight: "164.93",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f11 6s2",
    summaryEn:
      "Holmium is a relatively soft, silvery-white rare earth metal that is stable in dry air. It has the highest magnetic moment of any naturally occurring element. Its main uses are in lasers and in strong magnetic equipment.",
    summaryDa:
      "Holmium er et forholdsvis blødt, sølvhvidt sjældent jordmetal, der er stabilt i tør luft. Det har det højeste magnetiske moment af alle naturligt forekommende grundstoffer. Det bruges især i lasere og i udstyr med stærke magnetfelter.",
    usesEn: [
      "Holmium YAG lasers for kidney stone treatment and prostate surgery",
      "Pole pieces that concentrate magnetic fields in the strongest laboratory magnets",
      "Calibration glass filters for spectrophotometers",
      "Yellow and red colours in glass and cubic zirconia",
    ],
    usesDa: [
      "Holmium-YAG-lasere til behandling af nyresten og kirurgi på prostata",
      "Polstykker, der koncentrerer magnetfelter i de stærkeste laboratoriemagneter",
      "Glasfiltre til kalibrering af spektrofotometre",
      "Gule og røde farver i glas og kubisk zirkonia",
    ],
    deeperEn:
      "Marc Delafontaine and Jacques-Louis Soret in Geneva identified holmium spectroscopically in 1878, and Per Teodor Cleve in Sweden separated its oxide in 1879. Cleve named it after Holmia, the Latin name for his home city, Stockholm.\n\nHolmium lasers operate at a wavelength of about 2.1 micrometres, which water absorbs strongly, so the energy is deposited in a very thin layer of tissue. This allows urologists to break kidney stones into small fragments and to cut tissue with little spread of heat. Holmium has no known biological role. Holmium oxide solutions have sharp absorption peaks, which is why holmium glass is used as a wavelength standard to check the accuracy of spectrometers.",
    deeperDa:
      "Marc Delafontaine og Jacques-Louis Soret i Genève identificerede holmium spektroskopisk i 1878, og Per Teodor Cleve i Sverige udskilte dets oxid i 1879. Cleve opkaldte det efter Holmia, det latinske navn for hans hjemby Stockholm.\n\nHolmiumlasere arbejder ved en bølgelængde på omkring 2,1 mikrometer, som vand optager kraftigt, så energien afsættes i et meget tyndt lag væv. Det gør det muligt for urologer at knuse nyresten til små stykker og skære i væv med lidt varmespredning. Holmium har ingen kendt biologisk rolle. Holmiumoxidopløsninger har skarpe absorptionstoppe, og derfor bruges holmiumglas som bølgelængdestandard til at kontrollere spektrometres nøjagtighed.",
  },
  {
    z: 68,
    symbol: "Er",
    nameEn: "Erbium",
    nameDa: "Erbium",
    weight: "167.26",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f12 6s2",
    summaryEn:
      "Erbium is a soft, silvery rare earth metal that is fairly stable in air. Its ions give glass and porcelain a pink colour. Erbium-doped optical fibres amplify the light signals that carry the internet across oceans.",
    summaryDa:
      "Erbium er et blødt, sølvfarvet sjældent jordmetal, der er forholdsvis stabilt i luft. Dets ioner giver glas og porcelæn en lyserød farve. Erbiumdopede optiske fibre forstærker de lyssignaler, der fører internettet på tværs af oceaner.",
    usesEn: [
      "Erbium-doped fibre amplifiers in long-distance fibre-optic cables",
      "Erbium YAG lasers for dentistry and skin resurfacing",
      "Pink glass, glazes and sunglasses",
      "Neutron absorber in some nuclear applications",
    ],
    usesDa: [
      "Erbiumdopede fiberforstærkere i fiberkabler over lange afstande",
      "Erbium-YAG-lasere til tandbehandling og hudfornyelse",
      "Lyserødt glas, glasurer og solbriller",
      "Neutronabsorber i visse nukleare anvendelser",
    ],
    deeperEn:
      "Carl Gustaf Mosander separated erbium from yttria in 1843, and the element is named after Ytterby in Sweden, like yttrium, terbium and ytterbium. Mosander's names were at first confused, because terbium and erbium were later swapped in the literature.\n\nErbium ions emit light at a wavelength of 1.55 micrometres, which matches the lowest-loss window of silica optical fibre. In an erbium-doped fibre amplifier, a laser pumps the erbium atoms, and they then boost the passing signal without converting it to electricity. This invention in the late 1980s made transoceanic fibre cables practical, and so it is one of the quiet foundations of the modern internet.",
    deeperDa:
      "Carl Gustaf Mosander udskilte erbium fra yttria i 1843, og grundstoffet er opkaldt efter Ytterby i Sverige, ligesom yttrium, terbium og ytterbium. Mosanders navne blev først forvekslet, fordi terbium og erbium senere byttede plads i litteraturen.\n\nErbiumioner udsender lys ved en bølgelængde på 1,55 mikrometer, hvilket svarer til det vindue med lavest tab i optiske silicafibre. I en erbiumdopet fiberforstærker pumper en laser erbiumatomerne, og de forstærker derefter det forbipasserende signal uden at omdanne det til elektricitet. Opfindelsen i slutningen af 1980'erne gjorde fiberkabler over oceanerne praktiske og er derfor et af det moderne internets stille fundamenter.",
  },
  {
    z: 69,
    symbol: "Tm",
    nameEn: "Thulium",
    nameDa: "Thulium",
    weight: "168.93",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f13 6s2",
    summaryEn:
      "Thulium is a soft, silvery-grey rare earth metal and the least abundant of the stable lanthanides. It is rare and costly, so its applications are small and specialised. It is used in lasers and in portable X-ray sources.",
    summaryDa:
      "Thulium er et blødt, sølvgråt sjældent jordmetal og det mindst almindelige af de stabile lanthanider. Det er sjældent og dyrt, så anvendelserne er små og specialiserede. Det bruges i lasere og i bærbare røntgenkilder.",
    usesEn: [
      "Thulium fibre lasers for soft tissue surgery and kidney stones",
      "Portable X-ray sources, from irradiated thulium-170",
      "Doping material in some lasers and optical amplifiers",
      "Blue phosphors for euro banknote security",
    ],
    usesDa: [
      "Thulium-fiberlasere til blødvævskirurgi og nyresten",
      "Bærbare røntgenkilder fra bestrålet thulium-170",
      "Dopingmateriale i nogle lasere og optiske forstærkere",
      "Blå fosforstoffer til sikkerhed i eurosedler",
    ],
    deeperEn:
      "Per Teodor Cleve discovered thulium in 1879 while separating erbia, which he found to contain two further earths, holmia and thulia. The name comes from Thule, an ancient name for the far north and Scandinavia. Pure thulium was not made until 1911, after thousands of fractional crystallisations by Charles James.\n\nThulium is only about 0.5 parts per million in the crust, but that is still more common than gold or platinum. It is produced in small quantities from ion-exchange extraction of heavy rare earths. Thulium lasers operate near 2 micrometres, a wavelength strongly absorbed by water, so they cut tissue precisely with little heat damage. The rarity of thulium is mainly an economic matter of low demand and difficult separation.",
    deeperDa:
      "Per Teodor Cleve opdagede thulium i 1879, mens han adskilte erbia, som han fandt indeholdt yderligere to jordarter, holmia og thulia. Navnet kommer af Thule, et gammelt navn for det yderste nord og Skandinavien. Rent thulium blev først fremstillet i 1911 efter tusindvis af fraktionerede krystallisationer af Charles James.\n\nThulium udgør kun omkring 0,5 dele pr. million af skorpen, men det er stadig mere almindeligt end guld eller platin. Det fremstilles i små mængder ved ionbytterudvinding af tunge sjældne jordarter. Thuliumlasere arbejder nær 2 mikrometer, en bølgelængde som vand optager kraftigt, så de skærer præcist i væv med lidt varmeskade. Thuliums sjældenhed er hovedsageligt et økonomisk spørgsmål om lav efterspørgsel og vanskelig adskillelse.",
  },
  {
    z: 70,
    symbol: "Yb",
    nameEn: "Ytterbium",
    nameDa: "Ytterbium",
    weight: "173.05",
    group: null,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f14 6s2",
    summaryEn:
      "Ytterbium is a soft, silvery rare earth metal with a full 4f shell. It is one of the more reactive lanthanides, and it is used in the most precise clocks in the world. It is named after the Swedish village of Ytterby.",
    summaryDa:
      "Ytterbium er et blødt, sølvfarvet sjældent jordmetal med en fyldt 4f-skal. Det er et af de mere reaktive lanthanider og bruges i nogle af verdens mest præcise ure. Det er opkaldt efter den svenske landsby Ytterby.",
    usesEn: [
      "Optical lattice atomic clocks with extreme precision",
      "Ytterbium-doped fibre lasers for industrial cutting and welding",
      "Stress gauges for measuring the effect of explosions and earthquakes",
      "Portable X-ray sources and dopants in stainless steel",
    ],
    usesDa: [
      "Atomure med optisk gitter og ekstrem præcision",
      "Ytterbiumdopede fiberlasere til industriel skæring og svejsning",
      "Spændingsmålere til at måle virkningen af sprængninger og jordskælv",
      "Bærbare røntgenkilder og dopingstof i rustfrit stål",
    ],
    deeperEn:
      "Jean Charles de Marignac discovered ytterbium in 1878 as a component of the earth then known as erbia from Ytterby, and in 1907 Georges Urbain showed that what remained after ytterbium's removal contained one more element, lutetium. Ytterby is the village that gave names to four elements, the most of any place.\n\nBecause ytterbium has a closed 4f14 shell, it is more volatile than neighbouring lanthanides and easily takes the +2 state. In optical lattice clocks, thousands of ytterbium atoms are trapped by laser light and probed by another laser, and they are stable enough to lose less than a second over the age of the universe. Such clocks may eventually redefine the second and can detect tiny differences in gravity.",
    deeperDa:
      "Jean Charles de Marignac opdagede ytterbium i 1878 som en bestanddel af den jordart, der dengang hed erbia, fra Ytterby, og i 1907 viste Georges Urbain, at det, der var tilbage efter fjernelse af ytterbium, indeholdt endnu et grundstof, lutetium. Ytterby er den landsby, der har givet navn til fire grundstoffer, flest af noget sted.\n\nFordi ytterbium har en lukket 4f14-skal, er det mere flygtigt end nabolanthaniderne og indtager let +2-tilstanden. I optiske gitterure fanges tusindvis af ytterbiumatomer af laserlys og aflæses af en anden laser, og de er stabile nok til at miste mindre end et sekund over universets alder. Sådanne ure kan på sigt give en ny definition af sekundet og kan registrere små forskelle i tyngdekraften.",
  },
  {
    z: 71,
    symbol: "Lu",
    nameEn: "Lutetium",
    nameDa: "Lutetium",
    weight: "174.97",
    group: 3,
    period: 6,
    category: "lanthanide",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d1 6s2",
    summaryEn:
      "Lutetium is a hard, dense, silvery-white rare earth metal and the last of the lanthanides. It is the hardest and densest of the lanthanides and has the highest melting point among them. It is rare and costly, with highly specialised uses.",
    summaryDa:
      "Lutetium er et hårdt, tæt og sølvhvidt sjældent jordmetal og det sidste af lanthaniderne. Det er det hårdeste og tætteste af lanthaniderne og har det højeste smeltepunkt blandt dem. Det er sjældent og dyrt med meget specialiserede anvendelser.",
    usesEn: [
      "Lutetium-177 radiopharmaceuticals for neuroendocrine tumours and prostate cancer",
      "Lutetium oxyorthosilicate crystals in PET scanner detectors",
      "Catalysts in petroleum cracking",
      "Age dating of meteorites by the lutetium-hafnium method",
    ],
    usesDa: [
      "Lutetium-177-radiofarmaka til neuroendokrine tumorer og prostatakræft",
      "Lutetiumoxyorthosilikat-krystaller i detektorer i PET-skannere",
      "Katalysatorer ved krakning af olie",
      "Aldersbestemmelse af meteoritter med lutetium-hafnium-metoden",
    ],
    deeperEn:
      "Georges Urbain in France, Carl Auer von Welsbach in Austria and Charles James in the United States separated lutetium independently in 1907 from ytterbia. The name comes from Lutetia, the Latin name for Paris. The question of who should be credited was disputed for decades, and Urbain's name for it prevailed.\n\nLutetium is placed in group 3 by IUPAC's current recommendation, which puts lutetium and lawrencium below scandium and yttrium. Lutetium-177 emits beta particles with a short range in tissue, so when it is attached to a molecule that seeks tumour cells, it irradiates the tumour while sparing most healthy tissue. These targeted radioligand treatments are a fast-growing area of nuclear medicine.",
    deeperDa:
      "Georges Urbain i Frankrig, Carl Auer von Welsbach i Østrig og Charles James i USA udskilte uafhængigt lutetium i 1907 fra ytterbia. Navnet kommer af Lutetia, det latinske navn for Paris. Spørgsmålet om, hvem der skulle krediteres, var omstridt i årtier, og Urbains navn sejrede.\n\nLutetium placeres i gruppe 3 efter IUPAC's nuværende anbefaling, der sætter lutetium og lawrencium under scandium og yttrium. Lutetium-177 udsender betapartikler med kort rækkevidde i væv, så når det bindes til et molekyle, der søger tumorceller, bestråler det tumoren og skåner det meste raske væv. Disse målrettede radioligandbehandlinger er et hurtigt voksende område i nuklearmedicin.",
  },
  {
    z: 72,
    symbol: "Hf",
    nameEn: "Hafnium",
    nameDa: "Hafnium",
    weight: "178.49",
    group: 4,
    period: 6,
    category: "transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d2 6s2",
    summaryEn:
      "Hafnium is a lustrous, silvery-grey transition metal that resists corrosion almost as well as zirconium. It is chemically very similar to zirconium and is difficult to separate from it. It is used mainly where neutrons must be absorbed or where materials must stay stable at extreme heat.",
    summaryDa:
      "Hafnium er et blankt, sølvgråt overgangsmetal, der næsten modstår korrosion lige så godt som zirkonium. Det ligner kemisk zirkonium meget og er svært at skille fra det. Det bruges især, hvor neutroner skal absorberes, eller hvor materialer skal holde ved ekstrem varme.",
    usesEn: [
      "Control rods and neutron absorbers in nuclear reactors",
      "High-temperature alloys and plasma torch nozzles",
      "Gate insulators with a high dielectric constant in advanced microchips",
      "Getter material in vacuum tubes and bulbs",
    ],
    usesDa: [
      "Kontrolstave og neutronabsorbere i atomreaktorer",
      "Højtemperaturlegeringer og mundstykker til plasmabrændere",
      "Gateisolatorer med høj dielektrisk konstant i avancerede mikrochips",
      "Gettermateriale i vakuumrør og pærer",
    ],
    deeperEn:
      "Dirk Coster and Georg von Hevesy identified hafnium in 1923 in Copenhagen by its X-ray spectrum in Norwegian zircon, and named it after Hafnia, the Latin name for Copenhagen. Mendeleev had predicted an element below zirconium, and hafnium was the last stable element to be discovered.\n\nHafnium absorbs thermal neutrons even better than many other metals, which makes it essential in reactor control rods. In electronics, a thin hafnium oxide layer allows smaller, faster transistors on silicon chips. Because it occurs only with zirconium, almost all commercial hafnium is a by-product of nuclear-grade zirconium production.",
    deeperDa:
      "Dirk Coster og Georg von Hevesy identificerede hafnium i 1923 i København via dets røntgenspektrum i norsk zirkon og opkaldte det efter Hafnia, det latinske navn for København. Mendeleev havde forudsagt et grundstof under zirkonium, og hafnium var det sidste stabile grundstof, der blev opdaget.\n\nHafnium optager termiske neutroner endnu bedre end mange andre metaller, hvilket gør det nødvendigt i reaktorkontrolstave. I elektronik gør et tyndt lag hafniumoxid mindre og hurtigere transistorer på siliciumchips mulige. Fordi det kun forekommer sammen med zirkonium, er næsten alt kommercielt hafnium et biprodukt fra produktion af zirkonium til kernekraft.",
  },
  {
    z: 73,
    symbol: "Ta",
    nameEn: "Tantalum",
    nameDa: "Tantal",
    weight: "180.95",
    group: 5,
    period: 6,
    category: "transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d3 6s2",
    summaryEn:
      "Tantalum is a hard, blue-grey transition metal with outstanding resistance to corrosion, even by acids. It forms a stable oxide film that makes it biocompatible. Capacitors and surgical implants are its main modern uses.",
    summaryDa:
      "Tantal er et hårdt, blågråt overgangsmetal med fremragende modstand mod korrosion, også af syrer. Det danner en stabil oxidfilm, der gør det biokompatibelt. Kondensatorer og kirurgiske implantater er dets vigtigste moderne anvendelser.",
    usesEn: [
      "Miniature tantalum capacitors in phones, laptops and medical devices",
      "Surgical plates, screws and mesh for bone repair",
      "Chemical plant linings and heat exchangers",
      "Superalloys in jet engine parts",
    ],
    usesDa: [
      "Miniature tantal-kondensatorer i telefoner, computere og medicinsk udstyr",
      "Kirurgiske plader, skruer og net til knoglelæring",
      "Foringer i kemiske anlæg og varmevekslere",
      "Superlegeringer i jetmotordeler",
    ],
    deeperEn:
      "Anders Gustaf Ekeberg discovered tantalum in 1802 in Swedish minerals and named it after Tantalus from Greek mythology. William Hyde Wollaston later showed that what had been called tantalum and niobium were mixed, and Heinrich Rose separated them clearly in the 1840s.\n\nTantalum capacitors store a lot of charge in a tiny volume, which is why they appear in almost every compact electronic device. The metal is also dense enough to stop X-rays and is used in shields and markers in radiography. Most tantalum is mined in Rwanda and other central African countries, and conflict-free sourcing is an important concern for the electronics industry.",
    deeperDa:
      "Anders Gustaf Ekeberg opdagede tantal i 1802 i svenske mineraler og opkaldte det efter Tantalos fra græsk mytologi. William Hyde Wollaston viste senere, at det, der blev kaldt tantal og niob, var blandet, og Heinrich Rose adskilte dem tydeligt i 1840'erne.\n\nTantal-kondensatorer lagrer meget ladning på lille plads, og derfor findes de i næsten alle kompakte elektroniske enheder. Metallet er også tæt nok til at stoppe røntgenstråler og bruges som afskærmning og markører i radiografi. Det meste tantal udvindes i Rwanda og andre centralafrikanske lande, og konfliktfri indkøb er et vigtigt hensyn for elektronikindustrien.",
  },
  {
    z: 74,
    symbol: "W",
    nameEn: "Tungsten",
    nameDa: "Wolfram",
    weight: "183.84",
    group: 6,
    period: 6,
    category: "transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d5 6s1",
    summaryEn:
      "Tungsten is an exceptionally hard, dense transition metal with the highest melting point of any element, about 3422 °C. It is brittle at room temperature but strong at high temperature. Its name in Swedish and German traditions is wolfram.",
    summaryDa:
      "Wolfram er et usædvanligt hårdt og tæt overgangsmetal med det højeste smeltepunkt af alle grundstoffer, omkring 3422 °C. Det er sprødt ved stuetemperatur, men stærkt ved høj temperatur. I svensk og tysk tradition kaldes det wolfram.",
    usesEn: [
      "Filaments in incandescent and halogen lamps",
      "Cemented carbide cutting tools and drill bits",
      "Counterweights and armour-piercing ammunition",
      "Alloys and contacts in high-temperature electrical equipment",
    ],
    usesDa: [
      "Glødetråde i glødepærer og halogenlamper",
      "Hærdede karbidskærede værktøj og borekrone",
      "Modvægte og pansergennemtrængende ammunition",
      "Legeringer og kontakter i elektrisk udstyr ved høj temperatur",
    ],
    deeperEn:
      "Carl Wilhelm Scheele and the Elhuyar brothers isolated tungsten in the 1780s. The name tungsten comes from Swedish tung sten, heavy stone. The symbol W and the name wolfram come from the mineral wolframite.\n\nOne outer s electron moves to the d band, like chromium, giving the configuration 5d5 6s1 instead of the textbook 5d4 6s2. Tungsten carbide is almost as hard as diamond and transforms metalworking. In powder form tungsten is non-toxic, but very fine dust and some compounds warrant careful handling. Recycling of tungsten scrap is common in industry.",
    deeperDa:
      "Carl Wilhelm Scheele og Elhuyar-brødrene isolerede wolfram i 1780'erne. Navnet tungsten kommer af svensk tung sten. Symbolet W og navnet wolfram kommer af mineralet wolframit.\n\nÉn ydre s-elektron flytter til d-båndet, ligesom hos krom, hvilket giver konfigurationen 5d5 6s1 i stedet for lærebogens 5d4 6s2. Wolframtungstencarbid er næsten lige så hårdt som diamant og har ændret metalforarbejdning. Som pulver er wolfram ikke særligt giftigt, men meget fint støv og nogle forbindelser kræver forsigtig håndtering. Genbrug af wolframskrot er almindeligt i industrien.",
  },
{
    z: 75,
    symbol: "Re",
    nameEn: "Rhenium",
    nameDa: "Rhenium",
    weight: "186.21",
    group: 7,
    period: 6,
    category: "transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d5 6s2",
    summaryEn:
      "Rhenium is a dense, silvery-white transition metal with one of the highest melting points after tungsten and carbon. It is extremely rare in the Earth's crust. Most of it is used in superalloys for jet engines and in petroleum catalysts.",
    summaryDa:
      "Rhenium er et tæt, sølvhvidt overgangsmetal med et af de højeste smeltepunkter efter wolfram og kulstof. Det er ekstremt sjældent i Jordens skorpe. Det meste bruges i superlegeringer til jetmotorer og i katalysatorer til olie.",
    usesEn: [
      "Nickel-rhenium superalloys in turbine blades and jet engines",
      "Platinum-rhenium catalysts for high-octane gasoline",
      "Filaments, thermocouples and electrical contacts at high temperature",
      "Research targets and trace analysis standards",
    ],
    usesDa: [
      "Nikkel-rhenium-superlegeringer i turbineskovle og jetmotorer",
      "Platin-rhenium-katalysatorer til højoktanbenzin",
      "Glødetråde, termoelementer og elektriske kontakter ved høj temperatur",
      "Forskningsmål og standarder til sporstofanalyse",
    ],
    deeperEn:
      "Walter Noddack, Ida Tacke and Otto Berg announced rhenium in 1925 after searching for the missing element below manganese, and named it after the Rhine. They claimed masurium at the same time; only rhenium was confirmed.\n\nRhenium strengthens nickel superalloys so turbine blades can run hotter and more efficiently. It is recovered chiefly as a by-product of molybdenum refining, and world production is only a few tens of tonnes per year, which keeps the price high.",
    deeperDa:
      "Walter Noddack, Ida Tacke og Otto Berg annoncerede rhenium i 1925 efter at have ledt efter det manglende grundstof under mangan og opkaldte det efter Rhinen. De påstod samtidig masurium; kun rhenium blev bekræftet.\n\nRhenium forstærker nikkel-superlegeringer, så turbineskovle kan køre varmere og mere effektivt. Det udvindes hovedsageligt som biprodukt fra molybdænraffinering, og verdensproduktionen er kun nogle få titusinde kilo om året, hvilket holder prisen høj.",
  },
  {
    z: 76,
    symbol: "Os",
    nameEn: "Osmium",
    nameDa: "Osmium",
    weight: "190.23",
    group: 8,
    period: 6,
    category: "transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d6 6s2",
    summaryEn:
      "Osmium is a bluish-white transition metal and the densest naturally occurring element. It is hard and brittle. Its oxide, osmium tetroxide, is highly toxic and has a sharp smell.",
    summaryDa:
      "Osmium er et blåhvidt overgangsmetal og det tungeste naturligt forekommende grundstof. Det er hårdt og sprødt. Dets oxid, osmiumtetroxid, er meget giftigt og har en skarp lugt.",
    usesEn: [
      "Tips of fountain pen nibs and high-wear instrument pivots",
      "Osmium-ruthenium alloys in electrical contacts",
      "Staining in electron microscopy",
      "Reference material for extreme density",
    ],
    usesDa: [
      "Spidser på fyldepenne og slidstærke aksler i instrumenter",
      "Osmium-ruthenium-legeringer i elektriske kontakter",
      "Farvning i elektronmikroskopi",
      "Referencemateriale for ekstrem massefylde",
    ],
    deeperEn:
      "Smithson Tennant discovered osmium and iridium in 1803 in the insoluble residue left when aqua regia dissolves native platinum. The name comes from Greek osme, smell, because osmium tetroxide vapour is pungent.\n\nBecause osmium is the densest common metal, tiny amounts stabilise platinum jewellery without adding much volume. Osmium tetroxide fixes biological samples for microscopy but must be handled in a fume hood. Osmium-187 decays to rhenium-187 and is used to date old meteorites.",
    deeperDa:
      "Smithson Tennant opdagede osmium og iridium i 1803 i det uopløselige reststof, når kongevand opløser naturligt platin. Navnet kommer af græsk osme, lugt, fordi osmiumtetroxid-damp er stikkende.\n\nFordi osmium er det tungeste almindelige metal, stabiliserer små mængder platin-smykker uden stor volumen. Osmiumtetroxid fixerer biologiske præparater til mikroskopi, men skal håndteres under udsugning. Osmium-187 henfalder til rhenium-187 og bruges til at datere gamle meteoritter.",
  },
  {
    z: 77,
    symbol: "Ir",
    nameEn: "Iridium",
    nameDa: "Iridium",
    weight: "192.22",
    group: 9,
    period: 6,
    category: "transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d7 6s2",
    summaryEn:
      "Iridium is a hard, corrosion-resistant transition metal in the platinum family. It is one of the rarest stable elements in the crust. A worldwide iridium-rich clay layer marks the asteroid impact linked to the end of the dinosaurs.",
    summaryDa:
      "Iridium er et hårdt og korrosionsbestandigt overgangsmetal i platinfamilien. Det er et af de sjældneste stabile grundstoffer i skorpen. Et iridiumrigt lerlag over hele verden markerer det asteroide nedslag, der knyttes til dinosaurernes uddøen.",
    usesEn: [
      "Spark plugs with iridium tips for long life",
      "Crucibles and equipment for growing single crystals",
      "Historical mass standards linked to the kilogram prototype",
      "Electrodes in PEM water electrolysis and medical devices",
    ],
    usesDa: [
      "Tændrør med iridiumspidser for lang levetid",
      "Digler og udstyr til fremstilling af enkeltkrystaller",
      "Historiske massestandarder knyttet til kilogramprototypen",
      "Elektroder i PEM-vandelektrolyse og medicinsk udstyr",
    ],
    deeperEn:
      "Tennant found iridium with osmium in 1803. The name comes from Iris, the Greek rainbow goddess, because its salts are strongly coloured.\n\nThe iridium anomaly at the Cretaceous-Paleogene boundary in 1980 helped Luis Alvarez and colleagues argue that a large impact ended the Mesozoic era. Industrially, iridium-hardened platinum tools withstand molten glass and corrosive melts. Most iridium is mined in South Africa and Russia as a by-product of platinum.",
    deeperDa:
      "Tennant fandt iridium sammen med osmium i 1803. Navnet kommer af Iris, den græske regnbuegudinde, fordi dens salte er stærkt farvede.\n\nIridiumanomalien ved grænsen mellem kridt og paleogen i 1980 hjalp Luis Alvarez og kolleger med at argumentere for, at et stort nedslag afsluttede mesozoikum. Industrielt tåler iridiumhærdet platinudstyr smeltet glas og ætsende smelter. Det meste iridium udvindes i Sydafrika og Rusland som biprodukt af platin.",
  },
  {
    z: 78,
    symbol: "Pt",
    nameEn: "Platinum",
    nameDa: "Platin",
    weight: "195.08",
    group: 10,
    period: 6,
    category: "transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d9 6s1",
    summaryEn:
      "Platinum is a dense, malleable, silvery-white precious metal that resists tarnish and many chemicals. It is central to catalytic converters and to industrial catalysts. Jewellery and investment bullion are also major uses.",
    summaryDa:
      "Platin er et tæt, formbart og sølvhvidt ædelmetal, der modstår plet og mange kemikalier. Det er centralt i katalysatorer i biler og i industriel katalyse. Smykker og investeringsbarren er også vigtige anvendelser.",
    usesEn: [
      "Catalytic converters that cut exhaust pollutants",
      "Petrochemical catalysts and fuel-cell electrodes",
      "Jewellery, laboratory ware and dental crowns",
      "Chemotherapy drug cisplatin and other platinum medicines",
    ],
    usesDa: [
      "Katalysatorer i udstødning, der mindsker forurenende gas",
      "Petrokimiske katalysatorer og brændselscelleelektroder",
      "Smykker, laboratorieglas og tandkroner",
      "Kemoterapien cisplatin og andre platinlægemidler",
    ],
    deeperEn:
      "Pre-Columbian peoples in Ecuador worked platinum grains, but Europeans learned to melt it only in the 18th century. Antonio de Ulloa described it from South America around 1748.\n\nThe ground-state configuration is 5d9 6s1 rather than 5d8 6s2, like copper and gold. Platinum speeds oxidation of carbon monoxide on car exhaust catalysts. Cisplatin, discovered in the 1960s, remains important in cancer treatment though it causes serious side effects.",
    deeperDa:
      "Præ-columbianske folk i Ecuador bearbejdede platinkorn, men europæere lærte først at smelte det i 1700-tallet. Antonio de Ulloa beskrev det fra Sydamerika omkring 1748.\n\nGrundtilstandskonfigurationen er 5d9 6s1 i stedet for 5d8 6s2, ligesom hos kobber og guld. Platin fremskynder oxidation af kulilte på bilkatalysatorer. Cisplatin, opdaget i 1960'erne, er stadig vigtigt i kræftbehandling, selv om det giver alvorlige bivirkninger.",
  },
  {
    z: 79,
    symbol: "Au",
    nameEn: "Gold",
    nameDa: "Guld",
    weight: "196.97",
    group: 11,
    period: 6,
    category: "transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d10 6s1",
    summaryEn:
      "Gold is a soft, bright yellow precious metal that does not tarnish in air. It has been prized for ornament and as money for thousands of years. It conducts electricity well and resists corrosion.",
    summaryDa:
      "Guld er et blødt, klart gult ædelmetal, der ikke anløber i luft. Det har været værdsat til pynt og som penge i tusinder af år. Det leder elektricitet godt og modstår korrosion.",
    usesEn: [
      "Jewellery and cultural regalia",
      "Electrical contacts in electronics and space hardware",
      "Bullion reserves and financial hedging",
      "Glass colouring and radiation shielding",
    ],
    usesDa: [
      "Smykker og kulturhistoriske udsmykninger",
      "Elektriske kontakter i elektronik og rumudstyr",
      "Guldreserver og finansiel sikring",
      "Glasfarvning og strålingsafskærmning",
    ],
    deeperEn:
      "Gold occurs as native metal and was worked by humans before written history. The Latin aurum gives the symbol Au. Relativistic effects help explain why gold is yellow while silver is white.\n\nMost gold is extracted from low-grade ore using cyanide leaching under strict environmental controls. Nanoscale gold particles show unusual catalysis and appear in rapid diagnostic tests. Central banks still hold large gold reserves as a store of value.",
    deeperDa:
      "Guld forekommer som frit metal og blev bearbejdet af mennesker før skriftlig historie. Latin aurum giver symbolet Au. Relativistiske effekter hjælper med at forklare, hvorfor guld er gult, mens sølv er hvidt.\n\nDet meste guld udvindes fra lavgradsmalm med cyanudlaugning under strenge miljøkrav. Guldpartikler i nanostørrelse viser usædvanlig katalyse og bruges i hurtige diagnostiske tests. Centralbanker holder stadig store guldreserver som værdilager.",
  },
  {
    z: 80,
    symbol: "Hg",
    nameEn: "Mercury",
    nameDa: "Kviksølv",
    weight: "200.59",
    group: 12,
    period: 6,
    category: "transition",
    phase: "liquid",
    electronConfig: "[Xe] 4f14 5d10 6s2",
    summaryEn:
      "Mercury is a heavy, silvery metal that is liquid at room temperature. Its vapour and many compounds are toxic, especially to the nervous system. Use in thermometers and many industrial applications has been sharply reduced.",
    summaryDa:
      "Kviksølv er et tungt, sølvskinnende metal, der er flydende ved stuetemperatur. Damp og mange forbindelser er giftige, især for nervesystemet. Brugen i termometre og mange industrianvendelser er kraftigt begrænset.",
    usesEn: [
      "Compact fluorescent lamps (being phased out)",
      "Dental amalgam fillings, now restricted in many countries",
      "Chlor-alkali cells, largely replaced by membrane technology",
      "Laboratory barometers and pressure standards",
    ],
    usesDa: [
      "Kompakte lysstofrør (under udfasning)",
      "Amalgamfyldninger i tænder, nu begrænset i mange lande",
      "Chlor-alkali-anlæg, stort set erstattet af membranteknik",
      "Laboratoriebarometre og trykstandarder",
    ],
    deeperEn:
      "Mercury has been known since antiquity in cinnabar ore. The name comes from the Roman god; the symbol Hg is from hydrargyrum, liquid silver.\n\nMethylmercury biomagnifies in fish, which is why pregnant people are advised to limit certain seafood. The Minamata disaster in Japan showed catastrophic mercury poisoning from industrial waste. The Minamata Convention now guides global phase-out of many mercury products.",
    deeperDa:
      "Kviksølv har været kendt siden oldtiden i malmen cinnober. Navnet kommer af den romerske gud; symbolet Hg kommer af hydrargyrum, flydende sølv.\n\nMethylkviksølv bioakkumuleres i fisk, og derfor anbefales gravide at begrænse visse fiskearter. Minamata-katastrofen i Japan viste katastrofal kviksølvforgiftning fra industrispildevand. Minamata-konventionen styrer nu global udfasning af mange kviksølvprodukter.",
  },
  {
    z: 81,
    symbol: "Tl",
    nameEn: "Thallium",
    nameDa: "Thallium",
    weight: "204.38",
    group: 13,
    period: 6,
    category: "post-transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d10 6s2 6p1",
    summaryEn:
      "Thallium is a soft, grey post-transition metal that is highly toxic. Its compounds were once used as rat poison. Today it appears mainly in specialist electronics and in medical imaging.",
    summaryDa:
      "Thallium er et blødt, gråt sværmetal, der er meget giftigt. Forbindelser blev engang brugt som rottegift. I dag findes det især i specialiseret elektronik og medicinsk billeddannelse.",
    usesEn: [
      "Thallium-201 in nuclear medicine stress tests for the heart",
      "Infrared optical materials and specialty glass",
      "Low-melting fusible alloys with lead and bismuth",
      "Semiconductor research and doping",
    ],
    usesDa: [
      "Thallium-201 i nuklearmedicinske belastningsundersøgelser af hjertet",
      "Infrarøde optiske materialer og specialglas",
      "Lavtsmeltende legeringer med bly og bismuth",
      "Halvlederforskning og doping",
    ],
    deeperEn:
      "William Crookes discovered thallium in 1861 from the green line in its flame spectrum. The name means green twig in Greek.\n\nThallium ions mimic potassium in the body and disrupt nerve signalling. Accidental poisonings were common when it was sold as vermin killer. Modern cardiac imaging uses short-lived thallium-201, which emits gamma rays that scintillation cameras detect.",
    deeperDa:
      "William Crookes opdagede thallium i 1861 ud fra den grønne linje i dets flammespektrum. Navnet betyder grøn kvist på græsk.\n\nThalliumioner efterligner kalium i kroppen og forstyrrer nervesignalering. Ulykker med forgiftning var almindelige, da det blev solgt som skadedyrsbekæmpelse. Moderne hjerte-billeddiagnostik bruger kortlivet thallium-201, der udsender gammastråler, som scintillationskameraer registrerer.",
  },
  {
    z: 82,
    symbol: "Pb",
    nameEn: "Lead",
    nameDa: "Bly",
    weight: "207.2",
    group: 14,
    period: 6,
    category: "post-transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d10 6s2 6p2",
    summaryEn:
      "Lead is a dense, soft, grey post-transition metal that has been used since antiquity. It is toxic when absorbed, especially to children. Many former uses in paint, pipes and petrol are banned or sharply limited.",
    summaryDa:
      "Bly er et tæt, blødt og gråt sværmetal, der har været brugt siden oldtiden. Det er giftigt ved optagelse, især for børn. Mange tidligere anvendelser i maling, rør og benzin er forbudt eller kraftigt begrænset.",
    usesEn: [
      "Lead-acid vehicle batteries, still widely recycled",
      "Radiation shielding in hospitals and nuclear work",
      "Solder alloys, now often lead-free by regulation",
      "Ammunition and ballast where density matters",
    ],
    usesDa: [
      "Blysyre-bilbatterier, som stadig genbruges i stor skala",
      "Strålingsafskærmning på hospitaler og i kerneenergi",
      "Loddelegeringer, nu ofte blyfri efter regler",
      "Ammunition og ballast, hvor massefylde er vigtig",
    ],
    deeperEn:
      "The Romans used lead for pipes and wine vessels, and its toxicity was noted even in antiquity. Tetraethyl lead boosted octane in petrol from the 1920s until it was phased out in most countries.\n\nLead accumulates in bone and competes with calcium, which harms developing brains. Blood lead limits in children drove removal of lead paint and water service lines. Recycling of car batteries closes a loop that keeps most lead in use rather than in the environment.",
    deeperDa:
      "Romerne brugte bly til rør og vinkar, og dets giftighed blev noteret allerede i oldtiden. Tetraethylbly øgede oktantal i benzin fra 1920'erne, indtil det blev udfaset i de fleste lande.\n\nBly akkumuleres i knogler og konkurrerer med calcium, hvilket skader udviklende hjerner. Grænser for bly i børns blod førte til fjernelse af blymaling og vandforsyningsledninger. Genbrug af bilbatterier lukker en kreds, så det meste bly forbliver i brug i stedet for i miljøet.",
  },
  {
    z: 83,
    symbol: "Bi",
    nameEn: "Bismuth",
    nameDa: "Bismuth",
    weight: "208.98",
    group: 15,
    period: 6,
    category: "post-transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d10 6s2 6p3",
    summaryEn:
      "Bismuth is a brittle, pink-tinted post-transition metal that expands when it freezes, like water. It is one of the least toxic heavy metals and is used in cosmetics and medicines. Its crystals show rainbow oxidation films.",
    summaryDa:
      "Bismuth er et sprødt sværmetal med lyserød tone, der udvider sig ved frysning, ligesom vand. Det er et af de mindst giftige tunge metaller og bruges i kosmetik og medicin. Dets krystaller får regnbuefarvede oxidfilm.",
    usesEn: [
      "Bismuth subsalicylate (Pepto-Bismol) for digestive upset",
      "Low-toxicity alloys for fishing weights and automatic fire sprinklers",
      "Cosmetic pigments in nail polish and eyeshadow",
      "Lead-free solder and fusible alloys",
    ],
    usesDa: [
      "Bismuthsubsalicylat mod fordøjelsesbesvær",
      "Lavgiftige legeringer til fiskelod og automatiske brandssprinklere",
      "Kosmetiske pigmenter i neglelak og øjenskygge",
      "Blyfri loddelegeringer og lavtsmeltende legeringer",
    ],
    deeperEn:
      "Claude François Geoffroy distinguished bismuth from lead and tin in 1753. For centuries it was confused with those metals.\n\nBismuth compounds soothe the stomach without the toxicity of older antimony or mercury drugs. Bismuth oxychloride gives a pearlescent sheen in makeup. When bismuth crystals grow slowly, step-like terraces form and interference colours appear on the oxide film.",
    deeperDa:
      "Claude François Geoffroy skilte bismuth fra bly og tin i 1753. I århundreder blev det forvekslet med disse metaller.\n\nBismuthforbindelser lindrer maven uden den giftighed, ældre antimon- eller kviksølvpræparater havde. Bismuthoxychlorid giver perlemorsglans i makeup. Når bismuthkrystaller vokser langsomt, dannes trinformede terrasser, og interferensfarver ses på oxidfilmen.",
  },
  {
    z: 84,
    symbol: "Po",
    nameEn: "Polonium",
    nameDa: "Polonium",
    weight: "[209]",
    group: 16,
    period: 6,
    category: "post-transition",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d10 6s2 6p4",
    summaryEn:
      "Polonium is a rare, fiercely radioactive metal discovered by Marie Curie. All isotopes are unstable. Even milligram amounts release dangerous alpha radiation and heat.",
    summaryDa:
      "Polonium er et sjældent og stærkt radioaktivt metal opdaget af Marie Curie. Alle isotoper er ustabile. Selv milligram frigiver farlig alfastråling og varme.",
    usesEn: [
      "Alpha sources that eliminate static electricity in industry",
      "Neutron initiators paired with beryllium in some nuclear devices",
      "Research into alpha emitters for targeted cancer therapy",
      "Heat sources for space probes when powered by polonium-210",
    ],
    usesDa: [
      "Alfakilder, der fjerner statisk elektricitet i industrien",
      "Neutroninitiatorer sammen med beryllium i visse kerneanordninger",
      "Forskning i alfaemittere til målrettet kræftbehandling",
      "Varmekilder i rumsonder med polonium-210",
    ],
    deeperEn:
      "Marie and Pierre Curie isolated polonium in 1898 from pitchblende and named it after Poland. It was the first element named to honour a political cause.\n\nPolonium-210 killed the former Russian agent Alexander Litvinenko in 2006, showing how alpha emitters inside the body are lethal. Because polonium is so rare, it is produced by neutron irradiation of bismuth in reactors. Its chemistry resembles tellurium and sulphur.",
    deeperDa:
      "Marie og Pierre Curie isolerede polonium i 1898 fra pechblende og opkaldte det efter Polen. Det var det første grundstof opkaldt af politiske grunde.\n\nPolonium-210 dræbte den tidligere russiske agent Alexander Litvinenko i 2006 og viste, hvor dødelige alfaemittere i kroppen kan være. Fordi polonium er så sjældent, fremstilles det ved neutronbestråling af bismuth i reaktorer. Dets kemi ligner tellur og svovl.",
  },
  {
    z: 85,
    symbol: "At",
    nameEn: "Astatine",
    nameDa: "Astat",
    weight: "[210]",
    group: 17,
    period: 6,
    category: "halogen",
    phase: "solid",
    electronConfig: "[Xe] 4f14 5d10 6s2 6p5",
    summaryEn:
      "Astatine is the rarest naturally occurring element on Earth, with only traces present at any moment. All isotopes are radioactive. It sits in group 17 as a halogen, though some of its properties also lean metallic.",
    summaryDa:
      "Astat er det sjældneste naturligt forekommende grundstof på Jorden, kun som spor på ethvert tidspunkt. Alle isotoper er radioaktive. Det står i gruppe 17 som halogen, selvom nogle egenskaber også hælder mod det metalliske.",
    usesEn: [
      "Experimental alpha-emitter therapy for certain cancers",
      "Nuclear physics research on superheavy decay chains",
      "Tracing halogen behaviour at the bottom of the periodic table",
      "Radiochemistry education on extremely scarce elements",
    ],
    usesDa: [
      "Eksperimentel alfaemitter-terapi mod visse kræftformer",
      "Kernfysikforskning i henfaldskæder hos supertunge grundstoffer",
      "Sporing af halogenadfærd nederst i det periodiske system",
      "Undervisning i radiokemi om ekstremt knappe grundstoffer",
    ],
    deeperEn:
      "Dale Corson, Kenneth MacKenzie and Emilio Segrè made astatine in 1940 by bombarding bismuth with alpha particles. The name means unstable in Greek.\n\nAt most a few grams of astatine exist globally at once, because it forms only briefly from uranium decay and is destroyed quickly. Its chemistry is hard to study, but astatine-211 shows promise for targeting tumours that take up halogens.",
    deeperDa:
      "Dale Corson, Kenneth MacKenzie og Emilio Segrè fremstillede astat i 1940 ved at bombardere bismuth med alfapartikler. Navnet betyder ustabil på græsk.\n\nHøjst få gram astat findes globalt på ét tidspunkt, fordi det kun dannes kortvarigt ved uranhenfald og hurtigt forsvinder igen. Dets kemi er svær at studere, men astat-211 viser lovende resultater mod tumorer, der optager halogener.",
  },
  {
    z: 86,
    symbol: "Rn",
    nameEn: "Radon",
    nameDa: "Radon",
    weight: "[222]",
    group: 18,
    period: 6,
    category: "noble-gas",
    phase: "gas",
    electronConfig: "[Xe] 4f14 5d10 6s2 6p6",
    summaryEn:
      "Radon is a colourless, radioactive noble gas produced by the decay of uranium and thorium in rock. It can accumulate indoors and is a leading cause of lung cancer among non-smokers.",
    summaryDa:
      "Radon er en farveløs, radioaktiv ædelgas, der dannes ved henfald af uran og thorium i bjerggrund. Den kan samle sig indendørs og er en væsentlig årsag til lungekræft hos ikke-rygere.",
    usesEn: [
      "Radon mitigation systems in basements and crawl spaces",
      "Hydrological tracing of groundwater movement",
      "Cancer risk models and indoor air quality regulation",
      "Historical cancer therapy with radon-rich spas",
    ],
    usesDa: [
      "Radonsanering i kældre og krybekældre",
      "Hydrologisk sporing af grundvandsbevægelser",
      "Kræftrisikomodeller og regler for indeklima",
      "Historisk kræftbehandling ved radonrige kurbade",
    ],
    deeperEn:
      "Friedrich Ernst Dorn discovered radon in 1900 as a decay product of radium. William Ramsay and Robert Gray isolated it and showed it was a noble gas in 1908.\n\nGranite and shale release radon into soil gas, which seeps through foundations. Denmark and other countries recommend measuring homes and ventilating where levels stay high. Radon daughters deposit in lungs and emit alpha particles that damage DNA.",
    deeperDa:
      "Friedrich Ernst Dorn opdagede radon i 1900 som henfaldsprodukt af radium. William Ramsay og Robert Gray isolerede det og viste, at det er en ædelgas, i 1908.\n\nGranit og skifer frigiver radon til jordgas, der siver gennem fundamenter. Danmark og andre lande anbefaler måling i boliger og ventilation, hvor niveauet er højt. Radondøtre aflejrer sig i lunger og udsender alfapartikler, der skader DNA.",
  },
  {
    z: 87,
    symbol: "Fr",
    nameEn: "Francium",
    nameDa: "Francium",
    weight: "[223]",
    group: 1,
    period: 7,
    category: "alkali",
    phase: "solid",
    electronConfig: "[Rn] 7s1",
    summaryEn:
      "Francium is an extremely radioactive alkali metal with no stable isotope. It is among the rarest elements on Earth at any given time. Its chemistry is expected to resemble caesium but is barely studied.",
    summaryDa:
      "Francium er et ekstremt radioaktivt alkalimetal uden stabil isotop. Det er blandt de sjældneste grundstoffer på Jorden på ethvert tidspunkt. Dets kemi forventes at ligne caesium, men er næsten uudforsket.",
    usesEn: [
      "Fundamental atomic physics experiments",
      "Studying heavy alkali spectra and ionisation",
      "Tracing alkali behaviour at the limit of the periodic table",
      "Education on radioactivity and scarcity",
    ],
    usesDa: [
      "Grundlæggende atomfysikeksperimenter",
      "Studier af tunge alkalimetallers spektra og ionisering",
      "Sporing af alkalimetallers adfærd ved periodiske systems grænse",
      "Undervisning i radioaktivitet og knaphed",
    ],
    deeperEn:
      "Marguerite Perey discovered francium in 1939 at the Curie Institute in Paris as a decay product of actinium. She named it after France.\n\nThe longest-lived isotope francium-223 has a half-life of about 22 minutes, so a visible sample cannot be stockpiled. At any moment there are only about 20 grams of francium in the entire crust. Relativistic effects may make its chemistry slightly different from caesium predictions.",
    deeperDa:
      "Marguerite Perey opdagede francium i 1939 på Curie-instituttet i Paris som henfaldsprodukt af actinium. Hun opkaldte det efter Frankrig.\n\nDen længstlevende isotop francium-223 har en halveringstid på omkring 22 minutter, så en synlig prøve kan ikke opbevares. På ethvert tidspunkt findes kun omkring 20 gram francium i hele skorpen. Relativistiske effekter kan gøre dets kemi lidt anderledes end forventet fra caesium.",
  },
  {
    z: 88,
    symbol: "Ra",
    nameEn: "Radium",
    nameDa: "Radium",
    weight: "[226]",
    group: 2,
    period: 7,
    category: "alkaline-earth",
    phase: "solid",
    electronConfig: "[Rn] 7s2",
    summaryEn:
      "Radium is a silvery alkaline-earth metal that glows faintly because of intense radioactivity. Marie and Pierre Curie isolated it from pitchblende. Once used in luminous paint, it is now tightly controlled.",
    summaryDa:
      "Radium er et sølvskinnende jordalkalimetal, der svagt lyser på grund af stærk radioaktivitet. Marie og Pierre Curie isolerede det fra pechblende. Det blev engang brugt i selvlysende maling og er nu strengt kontrolleret.",
    usesEn: [
      "Historical cancer therapy with radium needles",
      "Neutron sources when mixed with beryllium",
      "Calibration sources in radiological laboratories",
      "Museums and waste management of legacy luminisered devices",
    ],
    usesDa: [
      "Historisk kræftbehandling med radiumnåle",
      "Neutronkilder blandet med beryllium",
      "Kalibreringskilder i radiologiske laboratorier",
      "Museer og håndtering af gammel luminiseret udstyr",
    ],
    deeperEn:
      "The Curies separated radium in 1902 after processing tonnes of ore. Its fame came from self-luminescence, which inspired glow-in-the-dark watch dials. Many dial painters ingested radium and suffered bone disease.\n\nRadium decays to radon gas, so old sources pose both alpha and inhalation hazards. Modern medicine uses safer isotopes, but radium-223 remains a bone-targeting treatment for prostate cancer metastases.",
    deeperDa:
      "Curies udskilte radium i 1902 efter at have behandlet tonvis malm. Det blev berømt for selvlyset, som inspirerede selvlysende urskiver. Mange urmalere indtog radium og fik knoglesygdom.\n\nRadium henfalder til radongas, så gamle kilder giver både alfa- og indåndingsfare. Moderne medicin bruger sikrere isotoper, men radium-223 er stadig en knoglemålrettet behandling ved prostatakræftmetastaser.",
  },
  {
    z: 89,
    symbol: "Ac",
    nameEn: "Actinium",
    nameDa: "Actinium",
    weight: "[227]",
    group: 3,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 6d1 7s2",
    summaryEn:
      "Actinium is a silvery radioactive actinide that glows blue in the dark from its own radiation. It heads the actinide series in the periodic table. Isotopes are rare and produced from nuclear fuels.",
    summaryDa:
      "Actinium er et sølvskinnende radioaktivt actinid, der lyser svagt blåt i mørke af egen stråling. Det står først i actinidserien i det periodiske system. Isotoper er sjældne og fremstilles fra kernebrændsel.",
    usesEn: [
      "Actinium-225 labelled antibodies in targeted alpha therapy",
      "Neutron sources with beryllium",
      "Research on actinide chemistry",
      "Production chain for other medical isotopes",
    ],
    usesDa: [
      "Actinium-225-markerede antistoffer i målrettet alfaterapi",
      "Neutronkilder med beryllium",
      "Forskning i actinidkemi",
      "Produktionskæde til andre medicinske isotoper",
    ],
    deeperEn:
      "André-Louis Debierne discovered actinium in 1899, and Friedrich Otto Giesel found it independently. The name means ray in Greek.\n\nActinium-225 delivers powerful alpha particles over a short range, which is attractive for killing scattered cancer cells when attached to antibodies. Most actinium today comes from thorium or uranium decay chains or reactor processing.",
    deeperDa:
      "André-Louis Debierne opdagede actinium i 1899, og Friedrich Otto Giesel fandt det uafhængigt. Navnet betyder stråle på græsk.\n\nActinium-225 giver kraftige alfapartikler over kort afstand, hvilket er attraktivt til at dræbe spredte kræftceller, når det bindes til antistoffer. Det meste actinium kommer i dag fra thorium- eller uranhenfald eller reaktorbehandling.",
  },
  {
    z: 90,
    symbol: "Th",
    nameEn: "Thorium",
    nameDa: "Thorium",
    weight: "232.04",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 6d2 7s2",
    summaryEn:
      "Thorium is a silvery, weakly radioactive actinide that is more abundant than uranium in the crust. It could fuel alternative reactor designs. Thorium dioxide was once used in gas lamp mantles.",
    summaryDa:
      "Thorium er et sølvskinnende, svagt radioaktivt actinid, der er mere almindeligt end uran i skorpen. Det kunne brænde i alternative reaktordesigns. Thoriumdioxid blev engang brugt i gaslygtemantler.",
    usesEn: [
      "Thoriated tungsten welding electrodes",
      "High-refractive-index glass and camera lenses",
      "Potential thorium fuel in molten-salt reactors",
      "Magnesium-thorium alloys in aerospace (declining)",
    ],
    usesDa: [
      "Torcerede wolfram-svejselektroder",
      "Glas og kameraobjektiver med højt brydningsindeks",
      "Potentielt thoriumbrændsel i smeltsalt-reaktorer",
      "Magnesium-thorium-legeringer i luftfart (aftagende)",
    ],
    deeperEn:
      "Jöns Jacob Berzelius discovered thorium in 1828 and named it after Thor, the Norse god of thunder.\n\nThorium-232 is fertile: it absorbs neutrons and becomes uranium-233 fuel. India and China research thorium cycles because India has large thorium sands. Mantles containing thorium were a major radiation exposure in households before safer materials replaced them.",
    deeperDa:
      "Jöns Jacob Berzelius opdagede thorium i 1828 og opkaldte det efter Tor, den nordiske tordengud.\n\nThorium-232 er fertilt: det optager neutroner og bliver til uran-233-brændsel. Indien og Kina forsker i thoriumkredsløb, fordi Indien har store thorium-sandaflejringer. Gaslygtemantler med thorium var en væsentlig strålingskilde i hjem, før sikrere materialer erstattede dem.",
  },
  {
    z: 91,
    symbol: "Pa",
    nameEn: "Protactinium",
    nameDa: "Protactinium",
    weight: "231.04",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f2 6d1 7s2",
    summaryEn:
      "Protactinium is a dense, toxic actinide found only in minute traces in uranium ores. Its name means parent of actinium, because it decays to actinium. It has almost no commercial use.",
    summaryDa:
      "Protactinium er et tæt og giftigt actinid, der kun findes i minimale spor i uranmalme. Navnet betyder forælder til actinium, fordi det henfalder til actinium. Det har næsten ingen kommerciel anvendelse.",
    usesEn: [
      "Scientific studies of the actinium decay chain",
      "Radiochemistry education",
      "Nuclear data for reactor physics",
      "Tracing actinide behaviour in ore processing",
    ],
    usesDa: [
      "Videnskabelige studier af actinium-henfaldskæden",
      "Undervisning i radiokemi",
      "Kerndata til reaktorfysik",
      "Sporing af actiniders adfærd ved malmbehandling",
    ],
    deeperEn:
      "Kasimir Fajans and Oswald Helmuth Göhring identified protactinium-231 in 1913, and Lise Meitner and Otto Hahn isolated the longer-lived Pa-231 in 1918.\n\nBecause protactinium is scarce and radioactive, chemistry experiments use only tiny quantities. It sits between thorium and uranium and helps chemists understand the filling of the 5f electron shell.",
    deeperDa:
      "Kasimir Fajans og Oswald Helmuth Göhring identificerede protactinium-231 i 1913, og Lise Meitner og Otto Hahn isolerede det længerelevende Pa-231 i 1918.\n\nFordi protactinium er knap og radioaktivt, bruges der kun minimale mængder i kemiske forsøg. Det ligger mellem thorium og uran og hjælper kemikere med at forstå udfyldningen af 5f-elektronskallen.",
  },
  {
    z: 92,
    symbol: "U",
    nameEn: "Uranium",
    nameDa: "Uran",
    weight: "238.03",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f3 6d1 7s2",
    summaryEn:
      "Uranium is a dense, silvery actinide whose fissile isotope powers nuclear reactors and, in weapons, releases enormous energy. It is also used in dense alloys and yellow glass colour.",
    summaryDa:
      "Uran er et tæt, sølvskinnende actinid, hvis fissionerbare isotop driver atomreaktorer og i våben frigiver enorm energi. Det bruges også i tunge legeringer og til gul glasfarve.",
    usesEn: [
      "Nuclear fuel in power reactors after enrichment of uranium-235",
      "Depleted uranium in armour-piercing penetrators",
      "Yellow and green colours in glass and ceramics",
      "Ballast in yachts and aircraft where density helps",
    ],
    usesDa: [
      "Kernbrændsel i kraftværksreaktorer efter berigelse af uran-235",
      "Udarmet uran i pansergennemtrængende projektiler",
      "Gule og grønne farver i glas og keramik",
      "Ballast i yachts og fly, hvor massefylde hjælper",
    ],
    deeperEn:
      "Martin Heinrich Klaproth identified uranium in pitchblende in 1789 and named it after the planet Uranus. Marie Curie later showed how radioactive it is.\n\nUranium-235 sustains chain reactions with slow neutrons. Most mined uranium is enriched for fuel or stored as depleted uranium, which is much less radioactive but chemically toxic as a metal dust. Safeguards and non-proliferation treaties monitor uranium worldwide.",
    deeperDa:
      "Martin Heinrich Klaproth identificerede uran i pechblende i 1789 og opkaldte det efter planeten Uranus. Marie Curie viste senere, hvor radioaktivt det er.\n\nUran-235 opretholder kædereaktioner med langsomme neutroner. Det meste udvundne uran beriges til brændsel eller lagres som udarmet uran, som er langt mindre radioaktivt, men kemisk giftigt som metalstøv. Sikkerhedsordninger og ikke-spredningstraktater overvåger uran globalt.",
  },
  {
    z: 93,
    symbol: "Np",
    nameEn: "Neptunium",
    nameDa: "Neptunium",
    weight: "[237]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f4 6d1 7s2",
    summaryEn:
      "Neptunium is the first transuranium actinide, made in 1940 by neutron irradiation of uranium. It is produced in reactors and stored in nuclear waste. It has niche uses in neutron detection.",
    summaryDa:
      "Neptunium er det første transuraniske actinid, fremstillet i 1940 ved neutronbestråling af uran. Det dannes i reaktorer og findes i kerneaffald. Det har smalle anvendelser i neutrondetektion.",
    usesEn: [
      "Neptunium-237 in high-energy neutron detection equipment",
      "Research on actinide disposal and separations",
      "Plutonium production pathways in reactors",
      "Material aging studies in radiation environments",
    ],
    usesDa: [
      "Neptunium-237 i udstyr til detektion af højenergineutroner",
      "Forskning i actinid-deponering og adskillelse",
      "Produktionsveje til plutonium i reaktorer",
      "Undersøgelser af materialealdring i strålingsmiljøer",
    ],
    deeperEn:
      "Edwin McMillan and Philip Abelson synthesized neptunium in 1940 at Berkeley. It is named after Neptune, the next planet beyond Uranus in the old planetary naming pattern.\n\nNeptunium-237 has a long half-life and is a major long-lived component of spent fuel. Its chemistry resembles uranium and plutonium, which complicates deep geological disposal planning.",
    deeperDa:
      "Edwin McMillan og Philip Abelson syntetiserede neptunium i 1940 i Berkeley. Det er opkaldt efter Neptun, den næste planet efter Uranus i det gamle planetnavnemønster.\n\nNeptunium-237 har lang halveringstid og er en væsentlig langtidkomponent i brugt brændsel. Dets kemi ligner uran og plutonium, hvilket komplicerer planer for dybe geologiske depoter.",
  },
  {
    z: 94,
    symbol: "Pu",
    nameEn: "Plutonium",
    nameDa: "Plutonium",
    weight: "[244]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f6 7s2",
    summaryEn:
      "Plutonium is a silvery actinide whose isotope plutonium-239 sustains nuclear chain reactions. It was first made in 1940 and used in the Nagasaki bomb and many reactors. It is hazardous by radiation and toxicity.",
    summaryDa:
      "Plutonium er et sølvskinnende actinid, hvis isotop plutonium-239 kan drive kernekædereaktioner. Det blev først fremstillet i 1940 og brugt i Nagasaki-bomben og mange reaktorer. Det er farligt ved stråling og giftighed.",
    usesEn: [
      "Mixed oxide fuel in some nuclear power plants",
      "Radioisotope thermoelectric generators for deep-space probes",
      "Research on nuclear weapons dismantlement and safeguards",
      "Heart-powered pacemakers historically used plutonium-238",
    ],
    usesDa: [
      "MOX-brændsel i nogle atomkraftværker",
      "Termoelektriske generatorer til dybrumsforskning",
      "Forskning i nedrustning og kontrol af kernevåben",
      "Hjertepacere drevet historisk af plutonium-238",
    ],
    deeperEn:
      "Glenn Seaborg, Edwin McMillan and colleagues made plutonium in 1940. The element is named after Pluto.\n\nPlutonium has several oxidation states and allotropes, and it is pyrophoric when finely divided. MOX fuel recycles weapons plutonium into power reactors under verification. Plutonium-238 gives steady heat for decades without maintenance, which suits missions far from the Sun.",
    deeperDa:
      "Glenn Seaborg, Edwin McMillan og kolleger fremstillede plutonium i 1940. Grundstoffet er opkaldt efter Pluto.\n\nPlutonium har flere oxidationstrin og allotroper og er pyroforisk i fin fordeling. MOX-brændsel genbruger våbenplutonium i kraftreaktorer under kontrol. Plutonium-238 afgiver jævn varme i årtier uden vedligehold, hvilket passer til missioner langt fra Solen.",
  },
  {
    z: 95,
    symbol: "Am",
    nameEn: "Americium",
    nameDa: "Americium",
    weight: "[243]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f7 7s2",
    summaryEn:
      "Americium is a synthetic actinide best known in household ionisation smoke detectors. Americium-241 emits alpha particles that ionise air in the detector.",
    summaryDa:
      "Americium er et syntetisk actinid, bedst kendt fra ionisationsrøgalarmer i hjem. Americium-241 udsender alfapartikler, der ioniserer luft i detektoren.",
    usesEn: [
      "Ionisation smoke detectors in homes and hotels",
      "Industrial gauging of thickness and density",
      "Neutron sources when combined with beryllium",
      "Space batteries using americium-241 (research)",
    ],
    usesDa: [
      "Ionisationsrøgalarmer i boliger og hoteller",
      "Industrielt måling af tykkelse og massefylde",
      "Neutronkilder sammen med beryllium",
      "Rumbatterier med americium-241 (forskning)",
    ],
    deeperEn:
      "Seaborg and colleagues created americium in 1944 during the Manhattan Project and named it after America.\n\nAlpha radiation from americium-241 cannot penetrate the detector's metal foil, so the source is safe when sealed. Disposal of millions of detectors is a recycling challenge because americium is long-lived.",
    deeperDa:
      "Seaborg og kolleger skabte americium i 1944 under Manhattan-projektet og opkaldte det efter Amerika.\n\nAlfastråling fra americium-241 kan ikke trænge gennem detektorens metalfolie, så kilden er sikker, når den er forseglet. Bortskaffelse af millioner af detektorer er en genudvindingsudfordring, fordi americium er langlevet.",
  },
  {
    z: 96,
    symbol: "Cm",
    nameEn: "Curium",
    nameDa: "Curium",
    weight: "[247]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f7 6d1 7s2",
    summaryEn:
      "Curium is a hard, radioactive actinide named for Marie and Pierre Curie. It was first made in 1944. Curium isotopes power some space generators and appear in research on heavy actinides.",
    summaryDa:
      "Curium er et hårdt, radioaktivt actinid opkaldt efter Marie og Pierre Curie. Det blev først fremstillet i 1944. Curium-isotoper driver nogle rumgeneratorer og bruges i forskning i tunge actinider.",
    usesEn: [
      "Curium-244 as an alpha source for X-ray spectrometers on Mars rovers",
      "Californium production via neutron bombardment of curium",
      "Research on actinide magnetism and alloys",
      "Spectroscopy standards in radiochemistry",
    ],
    usesDa: [
      "Curium-244 som alfakilde til røntgenspektrometre på Mars-rovere",
      "Produktion af californium via neutronbombardement af curium",
      "Forskning i actinidmagnetisme og legeringer",
      "Spektroskopistandarder i radiokemi",
    ],
    deeperEn:
      "Seaborg, James and Ghiorso synthesized curium in 1944. Samples glow purple because curium(III) fluoresces under its own radiation.\n\nCurium-244 has been used to power analytical instruments on spacecraft because it provides a steady alpha flux. Working with curium requires hot cells and heavy shielding.",
    deeperDa:
      "Seaborg, James og Ghiorso syntetiserede curium i 1944. Prøver lyser svagt lilla, fordi curium(III) fluorescerer under egen stråling.\n\nCurium-244 har drevet analyseinstrumenter på rumfartøjer, fordi det giver en jævn alfaflux. Arbejde med curium kræver varmeceller og kraftig afskærmning.",
  },
  {
    z: 97,
    symbol: "Bk",
    nameEn: "Berkelium",
    nameDa: "Berkelium",
    weight: "[247]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f9 7s2",
    summaryEn:
      "Berkelium is a synthetic actinide first made at Berkeley in 1949. It is produced in small amounts in reactors. It is used chiefly to synthesize heavier elements such as tennessine.",
    summaryDa:
      "Berkelium er et syntetisk actinid, først fremstillet i Berkeley i 1949. Det produceres i små mængder i reaktorer. Det bruges især til at syntetisere tungere grundstoffer som tennessin.",
    usesEn: [
      "Target material to make californium and heavier elements",
      "Fundamental actinide chemistry research",
      "Nuclear forensics markers",
      "Isotope production in high-flux reactors",
    ],
    usesDa: [
      "Målmateriale til californium og tungere grundstoffer",
      "Grundlæggende forskning i actinidkemi",
      "Markører i nukleær kriminalteknisk analyse",
      "Isotopproduktion i reaktorer med høj neutronflux",
    ],
    deeperEn:
      "Thompson, Ghiorso and Seaborg made berkelium by bombarding americium with alpha particles. It sits among the elements named after research laboratories.\n\nOnly milligrams are available worldwide each year, which limits experiments. Berkelium-249 is a critical precursor for making element 117.",
    deeperDa:
      "Thompson, Ghiorso og Seaborg fremstillede berkelium ved at bombardere americium med alfapartikler. Det hører til grundstofferne opkaldt efter forskningslaboratorier.\n\nKun milligram er tilgængelige globalt om året, hvilket begrænser forsøg. Berkelium-249 er et vigtigt udgangsmateriale til grundstof 117.",
  },
  {
    z: 98,
    symbol: "Cf",
    nameEn: "Californium",
    nameDa: "Californium",
    weight: "[251]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f10 7s2",
    summaryEn:
      "Californium is a synthetic actinide that is a powerful neutron source. Californium-252 is used in industry and medicine to start fission reactions and to treat some cancers.",
    summaryDa:
      "Californium er et syntetisk actinid, der er en kraftig neutronkilde. Californium-252 bruges i industri og medicin til at starte fission og behandle visse kræftformer.",
    usesEn: [
      "Neutron radiography of aircraft and fuel assemblies",
      "Activation analysis to detect explosives and precious metals",
      "Brachytherapy neutron sources for cervical cancer",
      "Reactor startup neutron initiators",
    ],
    usesDa: [
      "Neutronradiografi af fly og brændselskomponenter",
      "Aktiveringsanalyse til sprængstoffer og ædelmetaller",
      "Neutronbrakyterapi mod livmoderhalskræft",
      "Neutroninitiatorer ved reaktoropstart",
    ],
    deeperEn:
      "Ghiorso and colleagues made californium in 1950 at Berkeley. A microgram of californium-252 emits millions of neutrons per second.\n\nThe isotope is so valuable that most users lease it rather than own it. Production requires high-flux reactors and careful handling in hot cells.",
    deeperDa:
      "Ghiorso og kolleger fremstillede californium i 1950 i Berkeley. Et mikrogram californium-252 udsender millioner af neutroner per sekund.\n\nIsotopen er så værdifuld, at de fleste brugere leaser den frem for at eje den. Produktion kræver reaktorer med høj flux og forsigtig håndtering i varmeceller.",
  },
  {
    z: 99,
    symbol: "Es",
    nameEn: "Einsteinium",
    nameDa: "Einsteinium",
    weight: "[252]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "solid",
    electronConfig: "[Rn] 5f11 7s2",
    summaryEn:
      "Einsteinium is a synthetic actinide discovered in fallout from the first hydrogen bomb test in 1952. It is named for Albert Einstein. Only tiny amounts exist for research.",
    summaryDa:
      "Einsteinium er et syntetisk actinid opdaget i efterfald fra det første brintbombeeksplosionstest i 1952. Det er opkaldt efter Albert Einstein. Kun minimale mængder findes til forskning.",
    usesEn: [
      "Studies of heavy actinide chemistry",
      "Synthesis of mendelevium and other elements",
      "Nuclear structure research",
      "Benchmarking radiation detection methods",
    ],
    usesDa: [
      "Studier af tung actinidkemi",
      "Syntese af mendelevium og andre grundstoffer",
      "Forskning i kernehyldning",
      "Kalibrering af strålingsdetektionsmetoder",
    ],
    deeperEn:
      "Albert Ghiorso and colleagues found einsteinium-253 among debris from the Ivy Mike test. The chemistry is dominated by the +3 state like other actinides.\n\nEinsteinium-254 glows visibly in the dark because of self-irradiation, and its intense radioactivity makes chemical studies difficult.",
    deeperDa:
      "Albert Ghiorso og kolleger fandt einsteinium-253 i efterladenskaber fra Ivy Mike-testen. Kemien domineres af +3-tilstanden som hos andre actinider.\n\nEinsteinium-254 lyser synligt i mørke på grund af selvbestråling, og den intense radioaktivitet gør kemiske studier vanskelige.",
  },
  {
    z: 100,
    symbol: "Fm",
    nameEn: "Fermium",
    nameDa: "Fermium",
    weight: "[257]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "unknown",
    electronConfig: "[Rn] 5f12 7s2",
    summaryEn:
      "Fermium is a synthetic actinide named for Enrico Fermi. It was found in the same thermonuclear test debris as einsteinium. No weighable sample has ever been prepared.",
    summaryDa:
      "Fermium er et syntetisk actinid opkaldt efter Enrico Fermi. Det blev fundet i samme termonukleare testrester som einsteinium. Ingen vejbar prøve er nogensinde blevet fremstillet.",
    usesEn: [
      "Nuclear physics research",
      "Decay chain studies",
      "Heavy-element synthesis pathways",
      "Education on transuranium elements",
    ],
    usesDa: [
      "Kernfysikforskning",
      "Studier af henfaldskæder",
      "Synteseveje til supertrængener",
      "Undervisning i transuraniske grundstoffer",
    ],
    deeperEn:
      "Ghiorso and collaborators discovered fermium in 1952. Fermium-257 is the isotope usually cited in data tables.\n\nAt higher atomic numbers, neutron capture competes with spontaneous fission, which limits how much fermium can be accumulated.",
    deeperDa:
      "Ghiorso og samarbejdspartnere opdagede fermium i 1952. Fermium-257 er den isotop, der oftest angives i tabeller.\n\nVed højere atomnumre konkurrerer neutronindfangning med spontan fission, hvilket begrænser, hvor meget fermium der kan akkumuleres.",
  },
  {
    z: 101,
    symbol: "Md",
    nameEn: "Mendelevium",
    nameDa: "Mendelevium",
    weight: "[258]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "unknown",
    electronConfig: "[Rn] 5f13 7s2",
    summaryEn:
      "Mendelevium honours Dmitri Mendeleev, who built the periodic table. It was first made in 1955 by bombarding einsteinium with alpha particles.",
    summaryDa:
      "Mendelevium er opkaldt efter Dmitri Mendeleev, der skabte det periodiske system. Det blev først fremstillet i 1955 ved at bombardere einsteinium med alfapartikler.",
    usesEn: [
      "Actinide chemistry at the edge of the table",
      "Isotope production research",
      "Nuclear shell model studies",
      "Historical chemistry demonstrations",
    ],
    usesDa: [
      "Actinidkemi ved bordets kant",
      "Forskning i isotopproduktion",
      "Studier af kerneskalsmodellen",
      "Historiske kemifremstillinger",
    ],
    deeperEn:
      "Ghiorso and co-workers used the 60-inch cyclotron at Berkeley to make mendelevium. Only atoms at a time were detected.\n\nMendelevium was an early landmark in making and detecting elements one atom at a time, establishing techniques still used for superheavy elements.",
    deeperDa:
      "Ghiorso og medarbejdere brugte den 60 tommer store cyklotron i Berkeley til at fremstille mendelevium. Kun enkeltatomer blev detekteret.\n\nMendelevium var et tidligt milepælseksempel på grundstoffer, der blev fremstillet og detekteret ét atom ad gangen, hvilket lagde teknikker, der stadig bruges til supertunge grundstoffer.",
  },
  {
    z: 102,
    symbol: "No",
    nameEn: "Nobelium",
    nameDa: "Nobelium",
    weight: "[259]",
    group: null,
    period: 7,
    category: "actinide",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 7s2",
    summaryEn:
      "Nobelium is a synthetic actinide named for Alfred Nobel. It was first reported in 1958 from a cyclotron bombardment. Its chemistry shows a stable +2 state uncommon among actinides.",
    summaryDa:
      "Nobelium er et syntetisk actinid opkaldt efter Alfred Nobel. Det blev først rapporteret i 1958 fra cyklotronbombardement. Dets kemi viser en stabil +2-tilstand, som er ualmindelig blandt actinider.",
    usesEn: [
      "Research on +2 actinide chemistry",
      "Decay spectroscopy",
      "Heavy-element synthesis",
      "Nuclear data evaluation",
    ],
    usesDa: [
      "Forskning i +2-actinidkemi",
      "Henfaldsspektroskopi",
      "Syntese af supertunge grundstoffer",
      "Evaluering af kerndata",
    ],
    deeperEn:
      "Teams in Dubna and Berkeley disputed priority for nobelium's discovery through the 1960s. IUPAC eventually credited Dubna with the discovery of element 102.\n\nIn solution nobelium often behaves as No2+, more like alkaline earth ions than like other actinides.",
    deeperDa:
      "Hold i Dubna og Berkeley bestridte prioritet for nobeliums opdagelse gennem 1960'erne. IUPAC krediterede til sidst Dubna for opdagelsen af grundstof 102.\n\nI opløsning opfører nobelium sig ofte som No2+, mere som jordalkaliioner end som andre actinider.",
  },
  {
    z: 103,
    symbol: "Lr",
    nameEn: "Lawrencium",
    nameDa: "Lawrencium",
    weight: "[266]",
    group: 3,
    period: 7,
    category: "actinide",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 7s2 7p1",
    summaryEn:
      "Lawrencium is the last actinide and is named for Ernest Lawrence, inventor of the cyclotron. It was made in 1961 at Berkeley. IUPAC places it in group 3 below lutetium.",
    summaryDa:
      "Lawrencium er det sidste actinid og opkaldt efter Ernest Lawrence, opfinderen af cyklotronen. Det blev fremstillet i 1961 i Berkeley. IUPAC placerer det i gruppe 3 under lutetium.",
    usesEn: [
      "Tests of group 3 placement in the periodic table",
      "Heavy-element production techniques",
      "Nuclear chemistry education",
      "Decay studies at the end of the actinide row",
    ],
    usesDa: [
      "Test af placering i gruppe 3 i det periodiske system",
      "Teknikker til produktion af supertunge grundstoffer",
      "Undervisning i kernemkemi",
      "Henfaldsstudier ved actinidrækkens ende",
    ],
    deeperEn:
      "Ghiorso and colleagues produced lawrencium by bombarding californium. The valence electron is thought to occupy a 7p orbital rather than 6d, which supports group-3 placement with scandium, yttrium and lutetium.\n\nLawrencium ends the actinide series; element 104 starts the transactinide transition metals.",
    deeperDa:
      "Ghiorso og kolleger producerede lawrencium ved at bombardere californium. Den yderste elektronses antages at ligge i en 7p-orbital frem for 6d, hvilket støtter placering i gruppe 3 sammen med scandium, yttrium og lutetium.\n\nLawrencium afslutter actinidserien; grundstof 104 starter de transactinide overgangsmetaller.",
  },
  {
    z: 104,
    symbol: "Rf",
    nameEn: "Rutherfordium",
    nameDa: "Rutherfordium",
    weight: "[267]",
    group: 4,
    period: 7,
    category: "transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d2 7s2",
    summaryEn:
      "Rutherfordium is a synthetic transition metal named for Ernest Rutherford. It is made one atom at a time and is predicted to behave like hafnium.",
    summaryDa:
      "Rutherfordium er et syntetisk overgangsmetal opkaldt efter Ernest Rutherford. Det fremstilles et atom ad gangen og forventes at opføre sig som hafnium.",
    usesEn: [
      "Heavy-element nuclear research",
      "Tests of relativistic chemistry",
      "Detector development for fusion-evaporation reactions",
      "International collaboration on element discovery",
    ],
    usesDa: [
      "Kerneforskning i supertunge grundstoffer",
      "Test af relativistisk kemi",
      "Udvikling af detektorer til fusion-fordamningsreaktioner",
      "Internationalt samarbejde om opdagelse af grundstoffer",
    ],
    deeperEn:
      "Joint work at Dubna and Berkeley produced rutherfordium in the late 1960s. Its most stable known isotopes live only hours or minutes.\n\nAtoms must be trapped quickly and studied before they decay. Chemistry experiments suggest behaviour similar to hafnium, as the periodic law predicts.",
    deeperDa:
      "Fælles arbejde i Dubna og Berkeley producerede rutherfordium i slutningen af 1960'erne. Dets mest stabile kendte isotoper lever kun timer eller minutter.\n\nAtomer skal fanget og studeres hurtigt, før de henfalder. Kemiske forsøg tyder på adfærd lig hafnium, som det periodiske system forudsiger.",
  },
  {
    z: 105,
    symbol: "Db",
    nameEn: "Dubnium",
    nameDa: "Dubnium",
    weight: "[268]",
    group: 5,
    period: 7,
    category: "transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d3 7s2",
    summaryEn:
      "Dubnium is a synthetic transition element named for the Russian town of Dubna, home of a major nuclear institute. It is extremely radioactive and short-lived.",
    summaryDa:
      "Dubnium er et syntetisk overgangsgrundstof opkaldt efter den russiske by Dubna, hvor et stort kernefysikinstitut ligger. Det er ekstremt radioaktivt og kortlivet.",
    usesEn: [
      "Nuclear reaction mechanism studies",
      "Superheavy element search campaigns",
      "Chemistry in aqueous microquantities",
      "Benchmarking theoretical predictions",
    ],
    usesDa: [
      "Studier af kernereaktionsmekanismer",
      "Søgninger efter supertunge grundstoffer",
      "Kemi i mikromængder i vandig opløsning",
      "Afprøvning af teoretiske forudsigelser",
    ],
    deeperEn:
      "Dubna and Berkeley teams reported dubnium in 1968-1970. A single detected atom may be the only evidence of an experiment.\n\nDubnium chemistry is expected to resemble tantalum, though relativistic effects may shift bond lengths slightly.",
    deeperDa:
      "Hold i Dubna og Berkeley rapporterede dubnium i 1968-1970. Ét detekteret atom kan være det eneste bevis fra et forsøg.\n\nDubnium-kemi forventes at ligne tantal, selv om relativistiske effekter kan ændre bindningslængder en smule.",
  },
  {
    z: 106,
    symbol: "Sg",
    nameEn: "Seaborgium",
    nameDa: "Seaborgium",
    weight: "[269]",
    group: 6,
    period: 7,
    category: "transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d4 7s2",
    summaryEn:
      "Seaborgium honours Glenn T. Seaborg, who shared in the discovery of ten transuranium elements. It was first made in 1974.",
    summaryDa:
      "Seaborgium er opkaldt efter Glenn T. Seaborg, der deltog i opdagelsen af ti transuraniske grundstoffer. Det blev først fremstillet i 1974.",
    usesEn: [
      "Nuclear physics at the superheavy frontier",
      "Automated fast chemistry on single atoms",
      "International naming disputes resolved by IUPAC",
      "Training of radiochemists",
    ],
    usesDa: [
      "Kernfysik ved grænsen for supertunge grundstoffer",
      "Automatiseret hurtigkemi på enkeltatomer",
      "Internationale navnestridigheder afgjort af IUPAC",
      "Uddannelse af radiokemikere",
    ],
    deeperEn:
      "Glenn T. Seaborg is the only person to have an element named in his honour while he was still alive. IUPAC confirmed the name seaborgium in 1997, two years before his death, as an exception to the usual rule against naming elements after living scientists.\n\nGas-phase studies suggest hexacarbonyl-like volatility similar to tungsten hexacarbonyl chemistry.",
    deeperDa:
      "Glenn T. Seaborg er den eneste person, der har fået et grundstof opkaldt efter sig, mens han levede. IUPAC bekræftede navnet seaborgium i 1997, to år før hans død, som en undtagelse fra den sædvanlige regel mod at opkalde grundstoffer efter levende forskere.\n\nGasfaseundersøgelser tyder på flygtighed lig hexacarbonyl-kemi hos wolfram.",
  },
  {
    z: 107,
    symbol: "Bh",
    nameEn: "Bohrium",
    nameDa: "Bohrium",
    weight: "[270]",
    group: 7,
    period: 7,
    category: "transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d5 7s2",
    summaryEn:
      "Bohrium is a synthetic transition element named for Niels Bohr. It is made by cold heavy-ion fusion reactions at low excitation energy and decays within seconds or minutes.",
    summaryDa:
      "Bohrium er et syntetisk overgangsgrundstof opkaldt efter Niels Bohr. Det fremstilles ved kolde tunge-ion-fusionreaktioner med lav excitationsenergi og henfalder på sekunder eller minutter.",
    usesEn: [
      "Nuclear identification by alpha-decay chains",
      "Relativistic density functional theory tests",
      "Heavy-ion accelerator operations",
      "Element naming after Danish physicists",
    ],
    usesDa: [
      "Kerneidentifikation via alfa-henfaldskæder",
      "Test af relativistisk tæthedsfunktionalteori",
      "Drift af tung-ion-acceleratorer",
      "Grundstofnavne efter danske fysikere",
    ],
    deeperEn:
      "Peter Armbruster and Gottfried Münzenberg at Darmstadt produced bohrium in 1981. Chemistry experiments are scarce because of short half-lives.\n\nBohrium is predicted to be a homologue of rhenium and technetium in group 7.",
    deeperDa:
      "Peter Armbruster og Gottfried Münzenberg i Darmstadt fremstillede bohrium i 1981. Kemiske eksperimenter er få på grund af korte halveringstider.\n\nBohrium forventes at være homolog med rhenium og technetium i gruppe 7.",
  },
  {
    z: 108,
    symbol: "Hs",
    nameEn: "Hassium",
    nameDa: "Hassium",
    weight: "[269]",
    group: 8,
    period: 7,
    category: "transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d6 7s2",
    summaryEn:
      "Hassium is named after the German state of Hesse, where the GSI laboratory is located. It is among the heaviest elements with measured decay properties.",
    summaryDa:
      "Hassium er opkaldt efter den tyske delstat Hessen, hvor laboratoriet GSI ligger. Det er blandt de tungeste grundstoffer med målte henfaldsegenskaber.",
    usesEn: [
      "Confirmation of superheavy stability islands",
      "Alpha spectroscopy chains",
      "Cross-section measurements for nuclear models",
      "Worldwide accelerator scheduling",
    ],
    usesDa: [
      "Bekræftelse af stabilitetsøer hos supertunge grundstoffer",
      "Alfaspektroskopiske kæder",
      "Tverrsnitsmålinger til kernemodeller",
      "Planlægning af acceleratortid verden over",
    ],
    deeperEn:
      "GSI reported hassium in 1984. Isotope hassium-270 is relatively more stable, supporting the idea that certain neutron numbers extend half-lives.\n\nHassium should behave like osmium chemically if enough atoms could be gathered.",
    deeperDa:
      "GSI rapporterede hassium i 1984. Isotopen hassium-270 er relativt mere stabil, hvilket støtter, at visse neutrontal forlænger halveringstider.\n\nHassium skulle opføre sig kemisk som osmium, hvis nok atomer kunne samles.",
  },
  {
    z: 109,
    symbol: "Mt",
    nameEn: "Meitnerium",
    nameDa: "Meitnerium",
    weight: "[278]",
    group: 9,
    period: 7,
    category: "unknown",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d7 7s2",
    summaryEn:
      "Meitnerium honours Lise Meitner, who explained nuclear fission with Otto Frisch. It exists only as fleeting synthetic atoms.",
    summaryDa:
      "Meitnerium er opkaldt efter Lise Meitner, der forklarede kernespaltning sammen med Otto Frisch. Det findes kun som flygtige syntetiske atomer.",
    usesEn: [
      "Recognition of Lise Meitner's scientific legacy",
      "Decay-chain confirmation experiments",
      "No practical applications at present",
      "Nuclear physics databases",
    ],
    usesDa: [
      "Anerkendelse af Lise Meitners videnskabelige arv",
      "Eksperimenter der bekræfter henfaldskæder",
      "Ingen praktiske anvendelser på nuværende tidspunkt",
      "Kerne-fysikdatabaser",
    ],
    deeperEn:
      "GSI synthesized meitnerium in 1982. Its chemical properties are essentially unknown because half-lives are seconds or less.\n\nClassification as unknown reflects that group 9 homologue behaviour toward cobalt, rhodium and iridium has not been measured.",
    deeperDa:
      "GSI syntetiserede meitnerium i 1982. Dets kemiske egenskaber er stort set ukendte, fordi halveringstiderne er sekunder eller mindre.\n\nKlassificeringen som ukendt afspejler, at gruppe 9-homologi til cobalt, rhodium og iridium ikke er målt.",
  },
  {
    z: 110,
    symbol: "Ds",
    nameEn: "Darmstadtium",
    nameDa: "Darmstadtium",
    weight: "[281]",
    group: 10,
    period: 7,
    category: "unknown",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d8 7s2",
    summaryEn:
      "Darmstadtium is named for Darmstadt, Germany, site of GSI. It is a superheavy synthetic element with no known macroscopic properties.",
    summaryDa:
      "Darmstadtium er opkaldt efter Darmstadt i Tyskland, hvor GSI ligger. Det er et syntetisk supertungt grundstof uden kendte makroskopiske egenskaber.",
    usesEn: [
      "Frontier nuclear synthesis",
      "Detector array testing",
      "No commercial applications",
      "Element discovery priority reviews",
    ],
    usesDa: [
      "Kernesyntese ved forskergrænsen",
      "Test af detektorarrays",
      "Ingen kommercielle anvendelser",
      "IUPAC-gennemgange af opdagelsesprioritet",
    ],
    deeperEn:
      "First reported in 1994 by GSI. Atoms are identified by correlated decays of daughter nuclei.\n\nPredicted chemistry as a platinum-group homologue remains unverified experimentally.",
    deeperDa:
      "Først rapporteret i 1994 af GSI. Atomer identificeres ved korrelerede henfald af datternukleer.\n\nForudsagt kemi som homolog til platinmetaller er ikke bekræftet eksperimentelt.",
  },
  {
    z: 111,
    symbol: "Rg",
    nameEn: "Roentgenium",
    nameDa: "Roentgenium",
    weight: "[282]",
    group: 11,
    period: 7,
    category: "unknown",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d9 7s2",
    summaryEn:
      "Roentgenium is named for Wilhelm Röntgen, discoverer of X-rays. It is a synthetic group-11 element with a half-life of seconds at most.",
    summaryDa:
      "Roentgenium er opkaldt efter Wilhelm Röntgen, opdageren af røntgenstråler. Det er et syntetisk gruppe-11-grundstof med højst sekunders halveringstid.",
    usesEn: [
      "Fundamental science only",
      "X-ray science historical commemoration",
      "Alpha-decay spectroscopy",
      "No everyday uses",
    ],
    usesDa: [
      "Kun grundvidenskab",
      "Historisk hyldest til røntgenforskning",
      "Alfa-henfaldsspektroskopi",
      "Ingen hverdagsanvendelser",
    ],
    deeperEn:
      "GSI created roentgenium in 1994. Relativity may make its chemistry less like gold than simple periodic trends suggest.\n\nOnly a handful of atoms have ever been assigned to roentgenium isotopes.",
    deeperDa:
      "GSI skabte roentgenium i 1994. Relativitet kan gøre dets kemi mindre guldlignende, end simple periodiske tendenser antyder.\n\nKun en håndfuld atomer er nogensinde tilskrevet roentgenium-isotoper.",
  },
  {
    z: 112,
    symbol: "Cn",
    nameEn: "Copernicium",
    nameDa: "Copernicium",
    weight: "[285]",
    group: 12,
    period: 7,
    category: "transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d10 7s2",
    summaryEn:
      "Copernicium honours Nicolaus Copernicus. It may be volatile and even gaseous at room temperature, unlike mercury, though only a few atoms have been studied.",
    summaryDa:
      "Copernicium er opkaldt efter Nicolaus Copernicus. Det kan være flygtigt og endda gassende ved stuetemperatur, i modsætning til kviksølv, selv om kun få atomer er studeret.",
    usesEn: [
      "Tests of volatility in superheavy metals",
      "Homologue comparisons with mercury and cadmium",
      "Nuclear shell effects research",
      "No applied technology yet",
    ],
    usesDa: [
      "Test af flygtighed hos supertunge metaller",
      "Sammenligning med kviksølv og cadmium",
      "Forskning i kerne-skal-effekter",
      "Ingen anvendt teknologi endnu",
    ],
    deeperEn:
      "GSI reported element 112 in 1996. Gas-phase adsorption experiments suggest high volatility, perhaps due to relativistic closing of the 6d shell.\n\nIf confirmed bulk behaviour would differ sharply from mercury in group 12.",
    deeperDa:
      "GSI rapporterede grundstof 112 i 1996. Gasfaseadsorption tyder på høj flygtighed, måske på grund af relativistisk lukning af 6d-skalen.\n\nHvis makroskopisk adfærd bekræftes, vil den skille sig markant fra kviksølv i gruppe 12.",
  },
  {
    z: 113,
    symbol: "Nh",
    nameEn: "Nihonium",
    nameDa: "Nihonium",
    weight: "[286]",
    group: 13,
    period: 7,
    category: "post-transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d10 7s2 7p1",
    summaryEn:
      "Nihonium is named for Japan (Nihon). It was discovered jointly by RIKEN in Japan and Dubna. Chemistry may resemble thallium but is barely explored.",
    summaryDa:
      "Nihonium er opkaldt efter Japan (Nihon). Det blev opdaget i fællesskab af RIKEN og Dubna. Kemien kan ligne thallium, men er knapt udforsket.",
    usesEn: [
      "National scientific prestige projects",
      "Superheavy decay chain verification",
      "Theoretical chemistry benchmarks",
      "No industrial role",
    ],
    usesDa: [
      "Nationale prestigeprojekter i grundvidenskab",
      "Bekræftelse af henfaldskæder hos supertunge grundstoffer",
      "Teoretiske kemi-benchmarks",
      "Ingen industriel rolle",
    ],
    deeperEn:
      "RIKEN reported nihonium in 2004 after years of bombardment. The 7p electron may show increased inert-pair character from relativistic effects.\n\nAtoms survive milliseconds to seconds, enough for some gas-phase chemistry traps.",
    deeperDa:
      "RIKEN rapporterede nihonium i 2004 efter års bombardement. 7p-elektronen kan vise øget inert-par-karakter fra relativistiske effekter.\n\nAtomer overlever millisekunder til sekunder, nok til nogle gasfasekemiske fælder.",
  },
  {
    z: 114,
    symbol: "Fl",
    nameEn: "Flerovium",
    nameDa: "Flerovium",
    weight: "[289]",
    group: 14,
    period: 7,
    category: "post-transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d10 7s2 7p2",
    summaryEn:
      "Flerovium honours the Flerov Laboratory at Dubna. It may behave more like a noble gas than like lead because of relativistic effects on the 7p shell.",
    summaryDa:
      "Flerovium er opkaldt efter Flerov-laboratoriet i Dubna. Det kan opføre sig mere som en ædelgas end som bly på grund af relativistiske effekter på 7p-skalen.",
    usesEn: [
      "Superheavy chemistry in vacuum chambers",
      "Island-of-stability research",
      "Homologue comparisons with lead and tin",
      "Fundamental physics only",
    ],
    usesDa: [
      "Super-tung kemi i vakuumkamre",
      "Forskning i stabilitetsøer",
      "Sammenligning med bly og tin",
      "Kun grundfysik",
    ],
    deeperEn:
      "Dubna and Livermore collaborations synthesized flerovium in the early 2000s. Some experiments suggest weak interaction with gold surfaces, hinting at volatility.\n\nIf confirmed, flerovium would illustrate how relativity reshapes the periodic table at the bottom.",
    deeperDa:
      "Samarbejder mellem Dubna og Livermore syntetiserede flerovium i starten af 2000'erne. Nogle forsøg tyder på svag interaktion med guldoverflader, hvilket antyder flygtighed.\n\nHvis det bekræftes, viser flerovium, hvordan relativitet omformer det periodiske system nederst.",
  },
  {
    z: 115,
    symbol: "Mc",
    nameEn: "Moscovium",
    nameDa: "Moscovium",
    weight: "[290]",
    group: 15,
    period: 7,
    category: "post-transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d10 7s2 7p3",
    summaryEn:
      "Moscovium is named for Moscow Oblast and was discovered at Dubna. It is a synthetic element with relatively long half-lives compared with lighter superheavy isotopes in the same region of the chart.",
    summaryDa:
      "Moscovium er opkaldt efter Moskva-regionen og blev opdaget i Dubna. Det er syntetisk med relativt længere halveringstider i sin stabilitetsø.",
    usesEn: [
      "Nuclear synthesis campaigns",
      "Alpha-decay chain mapping",
      "Theoretical predictions about group 15 chemistry",
      "No practical uses",
    ],
    usesDa: [
      "Kampagner for kerne-syntese",
      "Kortlægning af alfa-henfaldskæder",
      "Teoretiske forudsigelser om gruppe 15-kemi",
      "Ingen praktiske anvendelser",
    ],
    deeperEn:
      "First seen in 2003, moscovium-290 and neighbours are more long-lived than lighter superheavies. Chemistry experiments are still at the planning stage.\n\nIt is expected to be a homologue of bismuth with possible inert-pair effects.",
    deeperDa:
      "Først set i 2003, er moscovium-290 og naboer mere langtidsholdende end lettere supertunge grundstoffer. Kemiske eksperimenter er stadig på planlægningsstadiet.\n\nDet forventes at være homolog med bismuth med mulige inert-par-effekter.",
  },
  {
    z: 116,
    symbol: "Lv",
    nameEn: "Livermorium",
    nameDa: "Livermorium",
    weight: "[293]",
    group: 16,
    period: 7,
    category: "post-transition",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d10 7s2 7p4",
    summaryEn:
      "Livermorium honours Lawrence Livermore National Laboratory. It is made by fusing curium and calcium isotopes and decays within milliseconds to seconds.",
    summaryDa:
      "Livermorium er opkaldt efter Lawrence Livermore National Laboratory. Det fremstilles ved fusion af curium- og calcium-isotoper og henfalder på millisekunder til sekunder.",
    usesEn: [
      "Collaborative US-Russian element discovery",
      "Superheavy spectroscopy",
      "Educational outreach on the periodic table limit",
      "No technology applications",
    ],
    usesDa: [
      "Amerikansk-russisk samarbejde om opdagelser",
      "Spektroskopi af supertunge grundstoffer",
      "Formidling om periodiske systemets grænse",
      "Ingen teknologiske anvendelser",
    ],
    deeperEn:
      "Synthesized in 2000 at Dubna with Livermore detectors. Homology to polonium is predicted but not firmly established.\n\nEach atom is tracked individually through a chain of alpha decays.",
    deeperDa:
      "Syntetiseret i 2000 i Dubna med Livermore-detektorer. Homologi til polonium er forudsagt, men ikke fastslået.\n\nHvert atom følges individuelt gennem en kæde af alfa-henfald.",
  },
  {
    z: 117,
    symbol: "Ts",
    nameEn: "Tennessine",
    nameDa: "Tennessin",
    weight: "[294]",
    group: 17,
    period: 7,
    category: "halogen",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d10 7s2 7p5",
    summaryEn:
      "Tennessine is named for Tennessee, home of Oak Ridge and Vanderbilt contributors. It may behave as a halogen, though relativistic effects could make it less reactive than astatine.",
    summaryDa:
      "Tennessin er opkaldt efter Tennessee, hjemsted for bidragydere fra Oak Ridge og Vanderbilt. Det kan opføre sig som et halogen, selv om relativistiske effekter kan gøre det mindre reaktivt end astat.",
    usesEn: [
      "Oak Ridge isotope production infrastructure",
      "Validation of periodic law at high Z",
      "Halogen chemistry predictions",
      "Public science communication on new elements",
    ],
    usesDa: [
      "Oak Ridges isotopproduktion",
      "Bekræftelse af det periodiske systems love ved højt Z",
      "Forudsigelser om halogenkemi i gruppe 17",
      "Formidling af nye grundstoffer",
    ],
    deeperEn:
      "Made in 2010 by bombarding berkelium with calcium at Dubna. It fills the last missing slot in period 7 before oganesson.\n\nChemistry may be more metallic than lighter halogens because the 7p orbital is stabilized.",
    deeperDa:
      "Fremstillet i 2010 ved bombardering af berkelium med calcium i Dubna. Det udfylder det sidste manglende felt i periode 7 før oganesson.\n\nKemien kan være mere metallisk end hos lettere halogener, fordi 7p-orbitalen stabiliseres.",
  },
  {
    z: 118,
    symbol: "Og",
    nameEn: "Oganesson",
    nameDa: "Oganesson",
    weight: "[294]",
    group: 18,
    period: 7,
    category: "noble-gas",
    phase: "unknown",
    electronConfig: "[Rn] 5f14 6d10 7s2 7p6",
    summaryEn:
      "Oganesson is the heaviest known element and, after seaborgium, another element named for a scientist who was still living when the name was adopted (Yuri Oganessian). Only a few atoms have been made. It may not behave like a classical noble gas.",
    summaryDa:
      "Oganesson er det tungeste kendte grundstof og, efter seaborgium, endnu et grundstof opkaldt efter en forsker, der stadig levede, da navnet blev vedtaget (Yuri Oganessian). Kun få atomer er fremstillet. Det opfører sig måske ikke som en klassisk ædelgas.",
    usesEn: [
      "Completing period 7 of the periodic table",
      "Tests of noble-gas character under extreme relativity",
      "Nuclear model refinement",
      "Inspiration for chemistry and physics education",
    ],
    usesDa: [
      "Færdiggørelse af periode 7 i det periodiske system",
      "Test af ædelgaskarakter under ekstrem relativitet",
      "Finpudsning af kernemodeller",
      "Inspiration til undervisning i kemi og fysik",
    ],
    deeperEn:
      "First synthesized in 2002 at Dubna. Oganesson closes the seventh row at element 118, the current practical limit of the table.\n\nCalculations suggest electron shells smear and chemistry may be partly metallic or reactive, unlike helium or neon. Each new atom is a landmark experiment requiring months of accelerator time.",
    deeperDa:
      "Først syntetiseret i 2002 i Dubna. Oganesson afslutter syvende række ved grundstof 118, den nuværende praktiske grænse for tabellen.\n\nBeregninger tyder på, at elektronskaller sløres, og kemi kan være delvist metallisk eller reaktiv, i modsætning til helium eller neon. Hvert nyt atom er et milepælseksperiment, der kræver måneders acceleratortid.",
  }
];

export const ELEMENTS_BY_Z: Record<number, PeriodicElement> = Object.fromEntries(
  ELEMENTS.map((el) => [el.z, el]),
);

export function findElement(query: string): PeriodicElement | undefined {
  const q = query.trim();
  if (!q) return undefined;
  const asNum = Number(q);
  if (Number.isInteger(asNum) && asNum >= 1 && asNum <= 118) {
    return ELEMENTS_BY_Z[asNum];
  }
  const lower = q.toLowerCase();
  return ELEMENTS.find(
    (el) =>
      el.symbol.toLowerCase() === lower ||
      el.nameEn.toLowerCase() === lower ||
      el.nameDa.toLowerCase() === lower ||
      el.akaDa?.toLowerCase() === lower,
  );
}

