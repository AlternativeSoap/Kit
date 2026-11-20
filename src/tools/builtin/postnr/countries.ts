export type CountryId =
  | "DK"
  | "NO"
  | "SE"
  | "FI"
  | "IS"
  | "DE"
  | "FO"
  | "GL";

export type CountryDef = {
  id: CountryId;
  /** Zippopotam.us / ISO country code */
  iso: string;
  nameDa: string;
  nameEn: string;
  /** Default map view */
  center: [number, number];
  zoom: number;
  /** Hint for the search field */
  placeholderDa: string;
  placeholderEn: string;
  /** How region/admin is labeled */
  regionLabelDa: string;
  regionLabelEn: string;
};

export const COUNTRIES: CountryDef[] = [
  {
    id: "DK",
    iso: "DK",
    nameDa: "Danmark",
    nameEn: "Denmark",
    center: [56.1, 10.4],
    zoom: 7,
    placeholderDa: "fx 8000, Aarhus, Ribe…",
    placeholderEn: "e.g. 8000, Aarhus, Ribe…",
    regionLabelDa: "Kommune",
    regionLabelEn: "Municipality",
  },
  {
    id: "NO",
    iso: "NO",
    nameDa: "Norge",
    nameEn: "Norway",
    center: [64.5, 11],
    zoom: 5,
    placeholderDa: "fx 0150, Oslo, Bergen…",
    placeholderEn: "e.g. 0150, Oslo, Bergen…",
    regionLabelDa: "Fylke / sted",
    regionLabelEn: "County / place",
  },
  {
    id: "SE",
    iso: "SE",
    nameDa: "Sverige",
    nameEn: "Sweden",
    center: [62.5, 16],
    zoom: 5,
    placeholderDa: "fx 111 22, Stockholm…",
    placeholderEn: "e.g. 111 22, Stockholm…",
    regionLabelDa: "Län / sted",
    regionLabelEn: "County / place",
  },
  {
    id: "FI",
    iso: "FI",
    nameDa: "Finland",
    nameEn: "Finland",
    center: [64.5, 26],
    zoom: 5,
    placeholderDa: "fx 00100, Helsinki…",
    placeholderEn: "e.g. 00100, Helsinki…",
    regionLabelDa: "Område",
    regionLabelEn: "Region",
  },
  {
    id: "IS",
    iso: "IS",
    nameDa: "Island",
    nameEn: "Iceland",
    center: [64.9, -19],
    zoom: 6,
    placeholderDa: "fx 101, Reykjavík…",
    placeholderEn: "e.g. 101, Reykjavík…",
    regionLabelDa: "Område",
    regionLabelEn: "Region",
  },
  {
    id: "DE",
    iso: "DE",
    nameDa: "Tyskland",
    nameEn: "Germany",
    center: [51.2, 10.4],
    zoom: 6,
    placeholderDa: "fx 10115, Berlin…",
    placeholderEn: "e.g. 10115, Berlin…",
    regionLabelDa: "Delstat / sted",
    regionLabelEn: "State / place",
  },
  {
    id: "FO",
    iso: "FO",
    nameDa: "Færøerne",
    nameEn: "Faroe Islands",
    center: [62.0, -6.9],
    zoom: 8,
    placeholderDa: "fx 100, Tórshavn…",
    placeholderEn: "e.g. 100, Tórshavn…",
    regionLabelDa: "Ø / sted",
    regionLabelEn: "Island / place",
  },
  {
    id: "GL",
    iso: "GL",
    nameDa: "Grønland",
    nameEn: "Greenland",
    center: [64.2, -51.7],
    zoom: 4,
    placeholderDa: "fx 3900, Nuuk…",
    placeholderEn: "e.g. 3900, Nuuk…",
    regionLabelDa: "By / sted",
    regionLabelEn: "Town / place",
  },
];

export function countryById(id: CountryId): CountryDef {
  return COUNTRIES.find((c) => c.id === id) ?? COUNTRIES[0]!;
}
