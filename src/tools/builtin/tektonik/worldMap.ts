/**
 * Simplified equirectangular land outlines in viewBox 0 0 1000 500.
 * Schematic geography for orientation, not a survey map.
 */
export const WORLD_LAND: { id: string; d: string }[] = [
  {
    id: "namerica",
    d: "M140,70 L210,55 L250,70 L280,95 L270,140 L250,165 L220,175 L200,200 L185,195 L170,160 L145,145 L120,110 L115,85 Z M200,175 L230,200 L245,235 L235,250 L210,240 L195,210 Z",
  },
  {
    id: "samerica",
    d: "M245,255 L275,250 L290,280 L285,330 L270,380 L255,400 L245,385 L240,340 L235,295 Z",
  },
  {
    id: "greenland",
    d: "M320,45 L360,40 L375,70 L355,95 L325,90 L310,65 Z",
  },
  {
    id: "europe",
    d: "M470,95 L505,85 L530,95 L545,120 L535,145 L510,150 L490,140 L475,120 Z M455,110 L470,105 L475,125 L460,130 Z",
  },
  {
    id: "africa",
    d: "M480,165 L530,155 L555,180 L560,230 L545,290 L520,320 L495,310 L480,260 L475,200 Z",
  },
  {
    id: "arabia",
    d: "M555,175 L585,170 L595,200 L580,220 L555,205 Z",
  },
  {
    id: "asia",
    d: "M545,70 L620,55 L700,60 L760,80 L790,110 L780,150 L740,170 L690,175 L640,165 L600,150 L570,130 L550,100 Z M700,175 L760,170 L790,200 L770,230 L720,235 L690,210 Z",
  },
  {
    id: "india",
    d: "M640,195 L670,190 L680,230 L660,255 L640,235 Z",
  },
  {
    id: "seasia",
    d: "M720,230 L760,225 L780,250 L755,265 L725,255 Z M790,255 L830,250 L845,270 L820,285 L795,275 Z",
  },
  {
    id: "australia",
    d: "M800,310 L870,300 L900,330 L885,365 L830,370 L800,345 Z",
  },
  {
    id: "nz",
    d: "M905,360 L920,355 L925,380 L910,385 Z",
  },
  {
    id: "antarctica",
    d: "M180,455 L400,440 L620,440 L820,455 L780,485 L500,495 L220,485 Z",
  },
  {
    id: "japan",
    d: "M830,145 L850,140 L855,165 L840,175 L825,160 Z",
  },
  {
    id: "uk",
    d: "M455,100 L468,95 L470,115 L458,118 Z",
  },
  {
    id: "madagascar",
    d: "M565,300 L580,295 L582,325 L568,330 Z",
  },
];

/** Lon/lat approx → 1000×500 map (lon -180..180, lat 90..-90). */
export function projectLonLat(lon: number, lat: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 500,
  };
}

/** 1000×500 map → [lat, lon] for Leaflet. */
export function mapXYToLatLng(x: number, y: number): [number, number] {
  const lon = (x / 1000) * 360 - 180;
  const lat = 90 - (y / 500) * 180;
  return [lat, lon];
}

/** Space-separated "x,y" pairs in map space → Leaflet latlng ring. */
export function parsePlatePath(path: string): [number, number][] {
  return path
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [xs, ys] = pair.split(",");
      return mapXYToLatLng(Number(xs), Number(ys));
    });
}
