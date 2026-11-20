"use client";

import { useEffect, useRef } from "react";
import {
  BOUNDARY_FILL,
  BOUNDARY_SOFT,
  PLATES,
  boundaryLabel,
  type TectonicPlate,
} from "./earth";
import { mapXYToLatLng, parsePlatePath } from "./worldMap";

type Props = {
  plates: TectonicPlate[];
  selectedId: string;
  onSelect: (id: string) => void;
  da: boolean;
};

export function PlateWorldMap({ plates, selectedId, onSelect, da }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    map: import("leaflet").Map;
    layer: import("leaflet").LayerGroup;
    L: typeof import("leaflet");
  } | null>(null);
  const propsRef = useRef({ plates, selectedId, onSelect, da });
  propsRef.current = { plates, selectedId, onSelect, da };

  function paint() {
    const ctx = mapRef.current;
    if (!ctx) return;
    const { map, layer, L } = ctx;
    const { plates: filtered, selectedId: sel, onSelect: pick, da: isDa } =
      propsRef.current;
    layer.clearLayers();

    const filterIds = new Set(filtered.map((p) => p.id));

    for (const plate of PLATES) {
      const active = plate.id === sel;
      const inFilter = filterIds.size === 0 || filterIds.has(plate.id);
      const latlngs = parsePlatePath(plate.path);
      const poly = L.polygon(latlngs, {
        color: active ? "#fff8e7" : BOUNDARY_FILL[plate.boundary],
        weight: active ? 3 : 1.5,
        fillColor: BOUNDARY_FILL[plate.boundary],
        fillOpacity: !inFilter ? 0.06 : active ? 0.45 : 0.28,
        opacity: !inFilter ? 0.25 : 1,
        className: "tek-plate-poly",
      });
      poly.bindTooltip(isDa ? plate.nameDa : plate.nameEn, {
        sticky: true,
        direction: "top",
      });
      poly.on("click", () => pick(plate.id));
      poly.addTo(layer);

      const [lat, lon] = mapXYToLatLng(plate.mx, plate.my);
      L.circleMarker([lat, lon], {
        radius: active ? 7 : 5,
        color: active ? BOUNDARY_FILL[plate.boundary] : "rgba(0,0,0,0.35)",
        weight: 1.5,
        fillColor: active ? "#fff8e7" : BOUNDARY_FILL[plate.boundary],
        fillOpacity: inFilter ? 1 : 0.25,
        interactive: false,
      }).addTo(layer);
    }
  }

  function focusSelected() {
    const ctx = mapRef.current;
    if (!ctx) return;
    const plate = PLATES.find((p) => p.id === propsRef.current.selectedId);
    if (!plate) return;
    const bounds = ctx.L.latLngBounds(parsePlatePath(plate.path));
    ctx.map.flyToBounds(bounds.pad(0.35), { duration: 0.55, maxZoom: 4 });
  }

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: true,
        worldCopyJump: true,
        minZoom: 1,
        maxZoom: 8,
        attributionControl: true,
      }).setView([20, 10], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 8,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Keep wheel zoom on the map; do not let the page zoom/scroll.
      const container = map.getContainer();
      const blockPageZoom = (e: WheelEvent) => {
        e.preventDefault();
      };
      container.addEventListener("wheel", blockPageZoom, { passive: false });

      const layer = L.layerGroup().addTo(map);
      mapRef.current = { map, layer, L };

      requestAnimationFrame(() => {
        map.invalidateSize();
        paint();
      });

      const cleanupWheel = () =>
        container.removeEventListener("wheel", blockPageZoom);
      map.once("unload", cleanupWheel);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plates, selectedId, da]);

  useEffect(() => {
    focusSelected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selected = PLATES.find((p) => p.id === selectedId);
  const label = selected ? (da ? selected.nameDa : selected.nameEn) : "";

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-[14px] border border-border">
        <div
          ref={containerRef}
          className="h-[320px] w-full bg-[#0c314d] sm:h-[420px]"
          role="img"
          aria-label={
            da
              ? "Tektoniske plader på OpenStreetMap"
              : "Tectonic plates on OpenStreetMap"
          }
        />
        <p className="border-t border-border bg-surface px-3 py-1.5 text-[11px] text-muted">
          {da
            ? "Kort: OpenStreetMap. Farvede flader er skematiske plader (ikke præcise grænser). Scroll zoomer kortet, ikke siden."
            : "Map: OpenStreetMap. Colored areas are schematic plates (not precise boundaries). Scroll zooms the map, not the page."}
        </p>
      </div>

      {selected ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-border bg-background/70 px-3 py-2 text-sm">
          <p className="font-medium text-foreground">{label}</p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[3px]"
              style={{ background: BOUNDARY_FILL[selected.boundary] }}
              aria-hidden
            />
            {boundaryLabel(selected.boundary, da)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
