"use client";

import { useMemo, useRef, useState } from "react";
import { Segmented, fieldClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  IPA_SYMBOLS,
  rowLabel,
  speakIpa,
  type IpaSymbol,
} from "./ipa";
import {
  LANGUAGE_TREE,
  findNode,
  flattenTree,
  formatSpeakers,
  type LangNode,
} from "./languages";

type Mode = "tree" | "ipa";

function TreeNode({
  node,
  depth,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  da,
  query,
}: {
  node: LangNode;
  depth: number;
  selectedId: string | null;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  da: boolean;
  query: string;
}) {
  const hasKids = Boolean(node.children?.length);
  const open = expanded.has(node.id);
  const active = selectedId === node.id;
  const name = da ? node.nameDa : node.nameEn;
  const q = query.trim().toLowerCase();
  const selfMatch =
    !q ||
    name.toLowerCase().includes(q) ||
    (da ? node.notesDa : node.notesEn).toLowerCase().includes(q) ||
    (da ? node.regionDa : node.regionEn).toLowerCase().includes(q);

  let childHits = true;
  if (q && node.children) {
    const all = flattenTree(node.children);
    childHits = all.some((n) => {
      const nName = (da ? n.nameDa : n.nameEn).toLowerCase();
      return (
        nName.includes(q) ||
        (da ? n.notesDa : n.notesEn).toLowerCase().includes(q)
      );
    });
  }

  if (!selfMatch && !childHits) return null;

  return (
    <li>
      <div
        className={`flex items-stretch gap-1 rounded-[8px] ${
          active ? "bg-accent-soft" : ""
        }`}
        style={{ paddingLeft: depth * 12 }}
      >
        {hasKids ? (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => onToggle(node.id)}
            className="kit-touch-target shrink-0 rounded-[6px] px-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0"
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="inline-block w-7 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          aria-pressed={active}
          className="kit-touch-target min-w-0 flex-1 rounded-[8px] px-2 py-1.5 text-left text-sm sm:min-h-0"
        >
          <span className="font-medium text-foreground">{name}</span>
          {node.speakersM != null ? (
            <span className="ml-2 text-xs text-muted">
              {formatSpeakers(node.speakersM, da)}
            </span>
          ) : null}
        </button>
      </div>
      {hasKids && open ? (
        <ul className="mt-0.5 space-y-0.5">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              da={da}
              query={query}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function LangDetail({ node, da }: { node: LangNode; da: boolean }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {node.children?.length
            ? da
              ? "Sprogfamilie / gren"
              : "Language family / branch"
            : da
              ? "Sprog"
              : "Language"}
        </p>
        <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
          {da ? node.nameDa : node.nameEn}
        </h2>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-muted">
            {da ? "Talere (ca.)" : "Speakers (approx.)"}
          </dt>
          <dd className="text-sm text-foreground">
            {formatSpeakers(node.speakersM, da)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">
            {da ? "Område" : "Region"}
          </dt>
          <dd className="text-sm text-foreground">
            {da ? node.regionDa : node.regionEn}
          </dd>
        </div>
      </dl>
      <p className="text-sm leading-relaxed text-foreground">
        {da ? node.notesDa : node.notesEn}
      </p>
      {node.children?.length ? (
        <p className="text-xs text-muted">
          {da
            ? `${node.children.length} direkte undergrene i dette træ.`
            : `${node.children.length} direct child branches in this tree.`}
        </p>
      ) : null}
    </div>
  );
}

function IpaDetail({
  sym,
  da,
  speechOk,
  onSpeak,
}: {
  sym: IpaSymbol;
  da: boolean;
  speechOk: boolean | null;
  onSpeak: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          IPA · {rowLabel(sym.row, da)} ·{" "}
          {sym.kind === "vowel"
            ? da
              ? "Vokal"
              : "Vowel"
            : da
              ? "Konsonant"
              : "Consonant"}
        </p>
        <h2 className="font-serif text-4xl tracking-tight text-foreground">
          /{sym.ipa}/
        </h2>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase text-muted">
            {da ? "Dansk eksempel" : "Danish example"}
          </dt>
          <dd className="text-sm text-foreground">{sym.exampleDa}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-muted">
            {da ? "Engelsk eksempel" : "English example"}
          </dt>
          <dd className="text-sm text-foreground">{sym.exampleEn}</dd>
        </div>
      </dl>
      {(da ? sym.glossDa : sym.glossEn) ? (
        <p className="text-sm text-muted">
          {da ? sym.glossDa : sym.glossEn}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onSpeak}
        className="kit-touch-target rounded-[10px] bg-accent px-3.5 py-2.5 text-sm font-medium text-on-accent sm:min-h-0"
      >
        {da ? "Afspil eksempel" : "Play example"}
      </button>
      {speechOk === false ? (
        <p className="text-xs text-muted">
          {da
            ? "Tale-API er ikke tilgængelig i denne browser. Læs eksemplet højt selv."
            : "Speech synthesis is not available in this browser. Read the example aloud yourself."}
        </p>
      ) : null}
    </div>
  );
}

export function SprogtraeTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const detailRef = useRef<HTMLElement>(null);

  const [mode, setMode] = useState<Mode>("tree");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>("ie");
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["ie", "germanic", "sino-tibetan", "afro-asiatic", "uralic"]),
  );
  const [ipaId, setIpaId] = useState<string | null>("i");
  const [ipaKind, setIpaKind] = useState<"all" | "consonant" | "vowel">("all");
  const [speechOk, setSpeechOk] = useState<boolean | null>(null);

  const selected = selectedId ? findNode(LANGUAGE_TREE, selectedId) : null;
  const selectedIpa =
    IPA_SYMBOLS.find((s) => s.ipa === ipaId) ?? IPA_SYMBOLS[0] ?? null;

  const ipaFiltered = useMemo(() => {
    return IPA_SYMBOLS.filter((s) => {
      if (ipaKind !== "all" && s.kind !== ipaKind) return false;
      return true;
    });
  }, [ipaKind]);

  const ipaRows = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, IpaSymbol[]>();
    for (const s of ipaFiltered) {
      if (!map.has(s.row)) {
        map.set(s.row, []);
        order.push(s.row);
      }
      map.get(s.row)!.push(s);
    }
    return order.map((row) => ({ row, symbols: map.get(row)! }));
  }, [ipaFiltered]);

  const selectLang = (id: string) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const selectIpa = (ipa: string) => {
    setIpaId(ipa);
    window.requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = flattenTree(LANGUAGE_TREE)
      .filter((n) => n.children?.length)
      .map((n) => n.id);
    setExpanded(new Set(all));
  };

  const collapseAll = () => setExpanded(new Set());

  return (
    <div className="kit-tool mx-auto w-full max-w-5xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Naviger et forenklet sprogtræ, eller øv IPA-tegn med danske og engelske eksempler."
          : "Browse a simplified language tree, or practice IPA symbols with Danish and English examples."}
      </p>

      <Segmented
        value={mode}
        onChange={setMode}
        ariaLabel={da ? "Tilstand" : "Mode"}
        options={[
          { id: "tree", label: da ? "Sprogtræ" : "Language tree" },
          { id: "ipa", label: da ? "IPA-lab" : "IPA lab" },
        ]}
      />

      {mode === "tree" ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1">
              <span className="mb-1.5 block text-sm font-medium">
                {da ? "Søg" : "Search"}
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  da ? "Sprog eller familie…" : "Language or family…"
                }
                className={fieldClass}
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="kit-touch-target rounded-[8px] border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0"
              >
                {da ? "Fold ud" : "Expand all"}
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="kit-touch-target rounded-[8px] border border-border px-2.5 py-1.5 text-sm text-muted hover:bg-overlay hover:text-foreground sm:min-h-0"
              >
                {da ? "Fold sammen" : "Collapse"}
              </button>
            </div>
          </div>

          <div className="kit-scrollbar max-h-[26rem] overflow-y-auto rounded-[12px] border border-border bg-surface p-3 sm:p-4">
            <ul className="space-y-0.5">
              {LANGUAGE_TREE.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedId={selectedId}
                  expanded={expanded}
                  onToggle={toggle}
                  onSelect={selectLang}
                  da={da}
                  query={query}
                />
              ))}
            </ul>
          </div>

          <section
            ref={detailRef}
            className="rounded-[14px] border border-border bg-surface p-4 sm:p-5"
            aria-live="polite"
          >
            {selected ? (
              <LangDetail node={selected} da={da} />
            ) : (
              <p className="text-sm text-muted">
                {da
                  ? "Vælg et sprog eller en familie i træet."
                  : "Select a language or family in the tree."}
              </p>
            )}
          </section>
        </>
      ) : (
        <>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              {da ? "Vis" : "Show"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["all", da ? "Alle" : "All"],
                  ["consonant", da ? "Konsonanter" : "Consonants"],
                  ["vowel", da ? "Vokaler" : "Vowels"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIpaKind(id)}
                  className={`kit-touch-target rounded-[8px] border px-2.5 py-1.5 text-xs ${
                    ipaKind === id
                      ? "border-accent bg-accent text-on-accent"
                      : "border-border bg-surface text-foreground hover:bg-overlay"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[12px] border border-border bg-surface p-3 sm:p-4">
            {ipaRows.map(({ row, symbols }) => (
              <div key={row}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  {rowLabel(row, da)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {symbols.map((s) => {
                    const active = ipaId === s.ipa;
                    return (
                      <button
                        key={s.ipa}
                        type="button"
                        onClick={() => selectIpa(s.ipa)}
                        aria-pressed={active}
                        className={`kit-touch-target min-w-[2.75rem] rounded-[8px] border px-2.5 py-2 font-mono text-base sm:min-h-0 ${
                          active
                            ? "border-accent bg-accent text-on-accent"
                            : "border-border bg-background text-foreground hover:bg-overlay"
                        }`}
                        title={da ? s.exampleDa : s.exampleEn}
                      >
                        {s.ipa}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <section
            ref={detailRef}
            className="rounded-[14px] border border-border bg-surface p-4 sm:p-5"
            aria-live="polite"
          >
            {selectedIpa ? (
              <IpaDetail
                sym={selectedIpa}
                da={da}
                speechOk={speechOk}
                onSpeak={() => {
                  const ok = speakIpa(selectedIpa, da);
                  setSpeechOk(ok);
                }}
              />
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
