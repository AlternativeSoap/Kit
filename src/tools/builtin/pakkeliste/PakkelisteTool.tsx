"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  Field,
  KitInput,
  KitSelect,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";

type Item = { id: string; text: string; done: boolean };
type TemplateId = "travel" | "move" | "festival" | "blank";

const STORAGE_KEY = "kit-pakkeliste-v1";

const TEMPLATES: Record<
  Exclude<TemplateId, "blank">,
  { da: string[]; en: string[] }
> = {
  travel: {
    da: [
      "Pas / ID",
      "Billetter",
      "Oplader",
      "Tøj",
      "Toiletartikler",
      "Medicinsk",
      "Adapter",
    ],
    en: [
      "Passport / ID",
      "Tickets",
      "Charger",
      "Clothes",
      "Toiletries",
      "Medicine",
      "Adapter",
    ],
  },
  move: {
    da: [
      "Kasser",
      "Tape",
      "Markører",
      "Rengøring",
      "Værktøj",
      "Nøgler",
      "Adresseændring",
    ],
    en: [
      "Boxes",
      "Tape",
      "Markers",
      "Cleaning",
      "Tools",
      "Keys",
      "Address change",
    ],
  },
  festival: {
    da: [
      "Telt",
      "Sovepose",
      "Regntøj",
      "Powerbank",
      "Solcreme",
      "Kontanter",
      "Ørepropper",
    ],
    en: [
      "Tent",
      "Sleeping bag",
      "Rain gear",
      "Power bank",
      "Sunscreen",
      "Cash",
      "Earplugs",
    ],
  },
};

function makeItems(texts: string[]): Item[] {
  return texts.map((text, i) => ({
    id: `${Date.now()}-${i}`,
    text,
    done: false,
  }));
}

export function PakkelisteTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [template, setTemplate] = useState<TemplateId>("travel");
  const [items, setItems] = useState<Item[]>(() =>
    makeItems(TEMPLATES.travel[da ? "da" : "en"]),
  );
  const [draft, setDraft] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: Item[] };
      if (Array.isArray(parsed.items) && parsed.items.length) {
        setItems(parsed.items);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    } catch {
      /* ignore */
    }
  }, [items]);

  const textExport = useMemo(
    () =>
      items
        .map((item) => `${item.done ? "[x]" : "[ ]"} ${item.text}`)
        .join("\n"),
    [items],
  );

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Field label={da ? "Skabelon" : "Template"}>
        <KitSelect
          value={template}
          onChange={(e) => {
            const id = e.target.value as TemplateId;
            setTemplate(id);
            if (id === "blank") {
              setItems([]);
              return;
            }
            setItems(makeItems(TEMPLATES[id][da ? "da" : "en"]));
          }}
        >
          <option value="travel">{da ? "Rejse" : "Travel"}</option>
          <option value="move">{da ? "Flytning" : "Moving"}</option>
          <option value="festival">{da ? "Festival" : "Festival"}</option>
          <option value="blank">{da ? "Tom liste" : "Blank list"}</option>
        </KitSelect>
      </Field>

      <p className="text-xs text-muted">
        {doneCount}/{items.length} {da ? "færdige" : "done"}.{" "}
        {da ? "Gemmes lokalt i browseren." : "Saved locally in your browser."}
      </p>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-2"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((it) =>
                    it.id === item.id ? { ...it, done: e.target.checked } : it,
                  ),
                )
              }
            />
            <span
              className={`min-w-0 flex-1 text-sm ${item.done ? "text-muted line-through" : ""}`}
            >
              {item.text}
            </span>
            <button
              type="button"
              className="text-xs text-muted hover:text-foreground"
              onClick={() =>
                setItems((prev) => prev.filter((it) => it.id !== item.id))
              }
            >
              {da ? "Fjern" : "Remove"}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <KitInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={da ? "Nyt punkt" : "New item"}
          className="min-w-[12rem] flex-1"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            const text = draft.trim();
            if (!text) return;
            setItems((prev) => [
              ...prev,
              { id: String(Date.now()), text, done: false },
            ]);
            setDraft("");
          }}
        />
        <button
          type="button"
          className={secondaryBtnClass}
          onClick={() => {
            const text = draft.trim();
            if (!text) return;
            setItems((prev) => [
              ...prev,
              { id: String(Date.now()), text, done: false },
            ]);
            setDraft("");
          }}
        >
          {da ? "Tilføj" : "Add"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton
          value={textExport}
          label={da ? "Kopiér liste" : "Copy list"}
          copiedLabel={da ? "Kopieret" : "Copied"}
        />
        <button
          type="button"
          className={primaryBtnClass}
          onClick={() =>
            setItems((prev) => prev.map((it) => ({ ...it, done: false })))
          }
        >
          {da ? "Nulstil flueben" : "Clear checks"}
        </button>
      </div>
    </div>
  );
}
