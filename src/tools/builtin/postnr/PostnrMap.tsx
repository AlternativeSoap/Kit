"use client";

import { useEffect, useRef } from "react";
import type { CountryDef } from "./countries";
import type { PostnrRow } from "./data";

type Props = {
  country: CountryDef;
  selected: PostnrRow | null;
  nearby: PostnrRow[];
  da: boolean;
};

export function PostnrMap({ country, selected, nearby, da }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    map: import("leaflet").Map;
    markers: import("leaflet").LayerGroup;
    L: typeof import("leaflet");
  } | null>(null);
  const propsRef = useRef({ country, selected, nearby });
  propsRef.current = { country, selected, nearby };

  function paint() {
    const ctx = mapRef.current;
    if (!ctx) return;
    const { map, markers, L } = ctx;
    const { country: c, selected: sel, nearby: near } = propsRef.current;
    markers.clearLayers();

    for (const row of near) {
      L.circleMarker([row.lat, row.lon], {
        radius: 5,
        color: "#5b8def",
        weight: 1,
        fillColor: "#5b8def",
        fillOpacity: 0.45,
      })
        .bindTooltip(`${row.nr} ${row.name}`, { direction: "top" })
        .addTo(markers);
    }

    if (sel) {
      const m = L.marker([sel.lat, sel.lon]).bindPopup(
        `<strong>${sel.nr} ${sel.name}</strong><br/>${sel.region}`,
      );
      m.addTo(markers);
      map.flyTo([sel.lat, sel.lon], Math.max(map.getZoom(), 10), {
        duration: 0.55,
      });
      m.openPopup();
    } else {
      map.setView(c.center, c.zoom);
    }
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
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView(country.center, country.zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const markers = L.layerGroup().addTo(map);
      mapRef.current = { map, markers, L };
      requestAnimationFrame(() => {
        map.invalidateSize();
        paint();
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.id]);

  useEffect(() => {
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, nearby, country.center, country.zoom]);

  return (
    <div className="overflow-hidden rounded-[12px] border border-border">
      <div
        ref={containerRef}
        className="h-[320px] w-full bg-muted/20 sm:h-[380px]"
        role="img"
        aria-label={
          da
            ? `OpenStreetMap for ${country.nameDa}`
            : `OpenStreetMap for ${country.nameEn}`
        }
      />
      <p className="border-t border-border bg-surface px-3 py-1.5 text-[11px] text-muted">
        {da
          ? "Kort: OpenStreetMap. Brug zoom-knapperne eller to fingre for at flytte."
          : "Map: OpenStreetMap. Use the zoom controls or two fingers to pan."}
      </p>
    </div>
  );
}
