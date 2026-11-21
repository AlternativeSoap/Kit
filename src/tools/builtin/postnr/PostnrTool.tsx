"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Field,
  KitInput,
  KitSelect,
  Segmented,
  pickerRowActiveClass,
  pickerRowClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { prefillChoice, type ToolPrefill } from "@/tools/prefill";
import { looksLikePostcode, lookupPostcode } from "./api";
import {
  COUNTRIES,
  countryById,
  type CountryId,
} from "./countries";
import {
  catalogCount,
  catalogFor,
  formatPop,
  nearbyPostnr,
  searchPostnr,
  type PostnrRow,
} from "./data";

const COUNTRY_IDS = COUNTRIES.map((c) => c.id) as CountryId[];

function seedFromPrefill(prefill?: ToolPrefill): {
  countryId: CountryId;
  query: string;
  selected: PostnrRow | null;
} {
  const countryId =
    prefillChoice(prefill, "country", COUNTRY_IDS) ?? "DK";
  const raw = (prefill?.nr ?? prefill?.q ?? "").trim();
  if (!raw) return { countryId, query: "", selected: null };
  const rows = searchPostnr(countryId, raw, 5);
  const exact =
    rows.find(
      (r) => r.nr.replace(/\s+/g, "") === raw.replace(/\s+/g, ""),
    ) ?? rows[0] ?? null;
  return {
    countryId,
    query: exact?.nr ?? raw,
    selected: exact,
  };
}

const PostnrMap = dynamic(
  () => import("./PostnrMap").then((m) => ({ default: m.PostnrMap })),
  {
    ssr: false,
    loading: () => (
      <div className="kit-map-frame flex items-center justify-center rounded-[12px] border border-border text-sm text-muted">
        OpenStreetMap…
      </div>
    ),
  },
);

export function PostnrTool({ prefill }: { prefill?: ToolPrefill } = {}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const seeded = useMemo(() => seedFromPrefill(prefill), [prefill]);
  const [countryId, setCountryId] = useState<CountryId>(seeded.countryId);
  const [query, setQuery] = useState(seeded.query);
  const [selected, setSelected] = useState<PostnrRow | null>(seeded.selected);
  const [showNearby, setShowNearby] = useState(true);
  const [apiHits, setApiHits] = useState<PostnrRow[]>([]);
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "error" | "done">(
    "idle",
  );
  const skipCountryClear = useRef(true);

  const country = countryById(countryId);
  const localCount = catalogCount(countryId);

  const localResults = useMemo(
    () => searchPostnr(countryId, query, 30),
    [countryId, query],
  );

  const results = useMemo(() => {
    const seen = new Set(localResults.map((r) => r.nr.toLowerCase()));
    const extras = apiHits.filter((r) => !seen.has(r.nr.toLowerCase()));
    return [...localResults, ...extras];
  }, [localResults, apiHits]);

  const nearby = useMemo(() => {
    if (!selected || !showNearby) return [];
    return nearbyPostnr(countryId, selected, 40, 12);
  }, [selected, showNearby, countryId]);

  useEffect(() => {
    const next = seedFromPrefill(prefill);
    skipCountryClear.current = true;
    setCountryId(next.countryId);
    setQuery(next.query);
    setSelected(next.selected);
  }, [prefill]);

  useEffect(() => {
    if (skipCountryClear.current) {
      skipCountryClear.current = false;
      return;
    }
    setSelected(null);
    setQuery("");
    setApiHits([]);
    setApiStatus("idle");
  }, [countryId]);

  useEffect(() => {
    if (!looksLikePostcode(countryId, query)) {
      setApiHits([]);
      setApiStatus("idle");
      return;
    }
    // Skip API if local already has an exact match
    const qNorm = query.trim().toLowerCase().replace(/\s+/g, "");
    const exactLocal = localResults.some(
      (r) => r.nr.toLowerCase().replace(/\s+/g, "") === qNorm,
    );
    if (exactLocal && localResults.length > 0) {
      setApiHits([]);
      setApiStatus("idle");
      return;
    }

    const ctrl = new AbortController();
    setApiStatus("loading");
    const t = window.setTimeout(() => {
      lookupPostcode(countryId, query, ctrl.signal)
        .then((rows) => {
          setApiHits(rows);
          setApiStatus("done");
          if (rows[0]) {
            setSelected((prev) => prev ?? rows[0]!);
          }
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setApiHits([]);
          setApiStatus("error");
        });
    }, 280);

    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
    // intentionally omit selected to avoid re-fetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId, query, localResults]);

  function selectRow(row: PostnrRow) {
    setSelected(row);
    if (!query.trim()) setQuery(row.nr);
  }

  const listRows = query.trim()
    ? results
    : catalogFor(countryId).slice(0, 12);

  return (
    <div className="kit-tool mx-auto max-w-5xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Slå postnumre op i Norden og nabolande på et rigtigt OpenStreetMap-kort. Hvert land har et lokalt udsnit til browsing; ukendte koder hentes live fra Zippopotam.us (GeoNames)."
          : "Look up postcodes in the Nordics and nearby countries on a real OpenStreetMap. Each country has a local sample for browsing; unknown codes are fetched live from Zippopotam.us (GeoNames)."}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Field label={da ? "Land" : "Country"}>
          <KitSelect
            value={countryId}
            onChange={(e) => setCountryId(e.target.value as CountryId)}
            aria-label={da ? "Land" : "Country"}
          >
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {da ? c.nameDa : c.nameEn}
              </option>
            ))}
          </KitSelect>
        </Field>
        <Segmented
          ariaLabel={da ? "Hurtig landvalg" : "Quick country pick"}
          value={countryId}
          onChange={setCountryId}
          options={COUNTRIES.slice(0, 5).map((c) => ({
            id: c.id,
            label: c.id,
          }))}
        />
      </div>

      <Field label={da ? "Postnummer eller by" : "Postcode or city"}>
        <KitInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={da ? country.placeholderDa : country.placeholderEn}
          autoComplete="off"
        />
      </Field>

      <p className="text-xs text-muted">
        {da
          ? `${localCount} lokale poster for ${country.nameDa}. Skriv et fuldt postnummer for live-opslag i hele landet.`
          : `${localCount} local entries for ${country.nameEn}. Type a full postcode for a live nationwide lookup.`}
        {apiStatus === "loading"
          ? da
            ? " Søger online…"
            : " Searching online…"
          : null}
        {apiStatus === "error"
          ? da
            ? " Online-opslag fejlede (prøv igen)."
            : " Online lookup failed (try again)."
          : null}
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="space-y-3">
          <ul className="max-h-96 divide-y divide-border overflow-auto rounded-[12px] border border-border bg-surface">
            {listRows.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={`${
                    selected?.id === r.id ? pickerRowActiveClass : pickerRowClass
                  } items-start justify-between`}
                  onClick={() => selectRow(r)}
                >
                  <span>
                    <span className="font-medium tabular-nums">{r.nr}</span>{" "}
                    <span>{r.name}</span>
                    {r.source === "api" ? (
                      <span className="ml-1 text-[10px] uppercase tracking-wide text-muted">
                        live
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted">
                    {r.region}
                    {r.pop != null ? (
                      <>
                        <br />
                        ~{formatPop(r.pop, da ? "da" : "en")}
                      </>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
            {query.trim() && listRows.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted">
                {apiStatus === "loading"
                  ? da
                    ? "Søger…"
                    : "Searching…"
                  : da
                    ? "Ingen træffere i udsnit eller live-opslag."
                    : "No matches in the sample or live lookup."}
              </li>
            ) : null}
          </ul>
          {!query.trim() ? (
            <p className="text-xs text-muted">
              {da
                ? "Viser et udsnit indtil du søger. Skriv postnummer eller bynavn."
                : "Showing a sample until you search. Type a postcode or city name."}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <PostnrMap
            country={country}
            selected={selected}
            nearby={nearby}
            da={da}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showNearby}
              onChange={(e) => setShowNearby(e.target.checked)}
              className="rounded border-border"
            />
            {da
              ? "Vis nærliggende fra udsnit (ca. 40 km)"
              : "Show nearby from sample (about 40 km)"}
          </label>

          {selected ? (
            <div className="rounded-[12px] border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                {da ? "Detalje" : "Detail"}
              </p>
              <p className="mt-1 text-lg font-semibold">
                {selected.nr} {selected.name}
              </p>
              <dl className="mt-2 grid gap-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{da ? "Land" : "Country"}</dt>
                  <dd>{da ? country.nameDa : country.nameEn}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">
                    {da ? country.regionLabelDa : country.regionLabelEn}
                  </dt>
                  <dd>{selected.region}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">
                    {da ? "Indbyggere (ca.)" : "Population (approx.)"}
                  </dt>
                  <dd>
                    {selected.pop != null
                      ? formatPop(selected.pop, da ? "da" : "en")
                      : da
                        ? "Ikke i udsnit"
                        : "Not in sample"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{da ? "Bredde" : "Latitude"}</dt>
                  <dd className="tabular-nums">{selected.lat.toFixed(3)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{da ? "Længde" : "Longitude"}</dt>
                  <dd className="tabular-nums">{selected.lon.toFixed(3)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{da ? "Kilde" : "Source"}</dt>
                  <dd>
                    {selected.source === "api"
                      ? "Zippopotam.us / GeoNames"
                      : da
                        ? "Lokalt udsnit"
                        : "Local sample"}
                  </dd>
                </div>
              </dl>
              {nearby.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
                    {da ? "I nærheden" : "Nearby"}
                  </p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {nearby.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className="text-left hover:underline"
                          onClick={() => {
                            setSelected(n);
                            setQuery(n.nr);
                          }}
                        >
                          {n.nr} {n.name}
                          <span className="text-muted"> · {n.region}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              {da
                ? "Vælg et postnummer for kort og detaljer."
                : "Select a postcode for the map and details."}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        {da
          ? "Indbyggertal er omtrentlige by-/områdeestimater, ikke officielle postnummerstatistikker. Live-opslag dækker hele landet via GeoNames. Fulde nationale registre er for store til at ligge i appen."
          : "Population figures are approximate city/area estimates, not official postcode statistics. Live lookup covers the whole country via GeoNames. Full national registers are too large to ship in the app."}
      </p>
    </div>
  );
}
