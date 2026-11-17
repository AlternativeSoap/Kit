"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  PapersFormatBar,
  type PapersBlockStyle,
  type PapersFormatState,
} from "@/components/tools/PapersFormatBar";
import {
  SkrivSelectionBubble,
  type SelectionBubblePos,
} from "@/components/tools/SkrivSelectionBubble";
import {
  ErrorBanner,
  Field,
  FileInput,
  KitInput,
  KitSelect,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  downloadJsonFile,
  downloadTextFile,
  loadPapersDraft,
  newDraftId,
  readJsonFile,
  savePapersDraft,
} from "@/lib/papers/storage";
import { htmlToVisibleText } from "@/lib/papers/stats";
import {
  DICT_LANGS,
  addPersonalWord,
  browserLangTag,
  findUnknownWords,
  isDictLang,
  loadPersonalWords,
  type DictLang,
  type SpellIssue,
} from "@/lib/papers/spellcheck";
import { printHtmlDocument } from "@/lib/papers/print";
import {
  PAGE_SIZES,
  countWords,
  defaultTextBox,
  emptyDoc,
  htmlToPlainText,
  pageHeightMm,
  pageSizeLabel,
  pageWidthMm,
  type PageSize,
  type SkrivDoc,
  type SkrivTextBox,
} from "./doc";

function runCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function safeQueryState(command: string) {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

function blockStyleFromSelection(editor: HTMLElement | null): PapersBlockStyle {
  const sel = window.getSelection();
  let node: Node | null = sel?.anchorNode ?? null;
  while (node && node !== editor) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as HTMLElement).tagName.toLowerCase();
      if (tag === "h1") return "h1";
      if (tag === "h2" || tag === "h3") return "h2";
      if (tag === "p" || tag === "div" || tag === "li") return "p";
    }
    node = node.parentNode;
  }
  return "p";
}

export function SkrivTool() {
  const { dictionary, locale } = useLanguage();
  const t = dictionary.skrivTool;
  const [doc, setDoc] = useState<SkrivDoc>(() => emptyDoc(t.untitled, locale));
  const [draftId, setDraftId] = useState(() => newDraftId("skriv"));
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [find, setFind] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [dictLang, setDictLang] = useState<DictLang>(() =>
    isDictLang(locale) ? locale : "en",
  );
  const [spellOn, setSpellOn] = useState(true);
  const [issues, setIssues] = useState<SpellIssue[]>([]);
  const [personalCount, setPersonalCount] = useState(0);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [panel, setPanel] = useState<"none" | "page" | "find" | "insert">(
    "none",
  );
  const [bubblePos, setBubblePos] = useState<SelectionBubblePos | null>(null);
  const [liveFormat, setLiveFormat] = useState<PapersFormatState | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const applyingRef = useRef(false);
  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    orig: SkrivTextBox;
  } | null>(null);

  const boxes = doc.boxes ?? [];
  const selectedBox = boxes.find((b) => b.id === selectedBoxId) ?? null;

  useEffect(() => {
    void (async () => {
      const existing = await loadPapersDraft<SkrivDoc>(draftId);
      if (existing?.payload?.kind === "skriv") {
        const payload = existing.payload;
        setDoc({ ...emptyDoc(t.untitled, locale), ...payload, boxes: payload.boxes ?? [] });
        if (payload.dictLang && isDictLang(payload.dictLang)) {
          setDictLang(payload.dictLang);
        }
        setSavedAt(existing.meta.updatedAt);
        if (editorRef.current) {
          applyingRef.current = true;
          editorRef.current.innerHTML = payload.html || "<p></p>";
          applyingRef.current = false;
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    applyingRef.current = true;
    editorRef.current.innerHTML = doc.html || "<p></p>";
    applyingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId]);

  const persist = useCallback(
    async (next: SkrivDoc, id = draftId) => {
      try {
        await savePapersDraft("skriv", id, next.title || t.untitled, next);
        setSavedAt(Date.now());
        setError(null);
      } catch {
        setError(t.saveError);
      }
    },
    [draftId, t.saveError, t.untitled],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => void persist(doc), 700);
    return () => window.clearTimeout(handle);
  }, [doc, persist]);

  const stats = useMemo(() => countWords(doc.html), [doc.html]);

  useEffect(() => {
    if (!spellOn) {
      setIssues([]);
      return;
    }
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        const text = htmlToVisibleText(doc.html);
        const found = await findUnknownWords(text, dictLang, { limit: 30 });
        if (!cancelled) setIssues(found);
        setPersonalCount(loadPersonalWords(dictLang).size);
      })();
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [doc.html, dictLang, spellOn]);

  function syncFromEditor() {
    if (applyingRef.current || !editorRef.current) return;
    setDoc((prev) => ({ ...prev, html: editorRef.current!.innerHTML }));
  }

  function format(command: string, value?: string) {
    editorRef.current?.focus();
    runCommand(command, value);
    syncFromEditor();
    refreshSelectionUi();
  }

  function readLiveFormat(): PapersFormatState {
    let align: PapersFormatState["align"] = "left";
    try {
      if (document.queryCommandState("justifyCenter")) align = "center";
      else if (document.queryCommandState("justifyRight")) align = "right";
    } catch {
      /* ignore */
    }
    let fontSize = doc.fontSizePx;
    const sel = window.getSelection();
    const node = sel?.anchorNode;
    const el =
      node && node.nodeType === Node.TEXT_NODE
        ? node.parentElement
        : (node as HTMLElement | null);
    if (el && editorRef.current?.contains(el)) {
      const px = Number.parseFloat(window.getComputedStyle(el).fontSize);
      if (Number.isFinite(px) && px > 0) {
        fontSize = Math.round(px * 0.75);
      }
    }
    return {
      bold: safeQueryState("bold"),
      italic: safeQueryState("italic"),
      underline: safeQueryState("underline"),
      align,
      color: "#111111",
      background: "#ffffff",
      fontFamily: doc.fontFamily,
      fontSize: Math.min(200, Math.max(6, fontSize)),
      block: blockStyleFromSelection(editorRef.current),
    };
  }

  function refreshSelectionUi() {
    const sel = window.getSelection();
    const editor = editorRef.current;
    if (
      !sel ||
      sel.rangeCount === 0 ||
      sel.isCollapsed ||
      !editor ||
      !sel.anchorNode ||
      !editor.contains(sel.anchorNode)
    ) {
      setBubblePos(null);
      setLiveFormat(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width < 1 && rect.height < 1) {
      setBubblePos(null);
      setLiveFormat(null);
      return;
    }
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, 24),
      window.innerWidth - 24,
    );
    const top = Math.max(rect.top - 12, 56);
    setBubblePos({ top, left });
    setLiveFormat(readLiveFormat());
  }

  useEffect(() => {
    const onSel = () => refreshSelectionUi();
    document.addEventListener("selectionchange", onSel);
    window.addEventListener("scroll", onSel, true);
    window.addEventListener("resize", onSel);
    return () => {
      document.removeEventListener("selectionchange", onSel);
      window.removeEventListener("scroll", onSel, true);
      window.removeEventListener("resize", onSel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.fontFamily, doc.fontSizePx]);

  const formatState: PapersFormatState = selectedBox
    ? {
        bold: !!selectedBox.bold,
        italic: !!selectedBox.italic,
        underline: !!selectedBox.underline,
        align: selectedBox.align,
        color: selectedBox.color,
        background: selectedBox.background,
        fontFamily: selectedBox.fontFamily,
        fontSize: selectedBox.fontSizePx,
        block: "p",
      }
    : liveFormat ?? {
        bold: false,
        italic: false,
        underline: false,
        align: "left",
        color: "#111111",
        background: "#ffffff",
        fontFamily: doc.fontFamily,
        fontSize: doc.fontSizePx,
        block: "p",
      };

  function onFormatChange(patch: Partial<PapersFormatState>) {
    if (selectedBox) {
      setDoc((prev) => ({
        ...prev,
        boxes: (prev.boxes ?? []).map((b) =>
          b.id === selectedBox.id
            ? {
                ...b,
                bold: patch.bold ?? b.bold,
                italic: patch.italic ?? b.italic,
                underline: patch.underline ?? b.underline,
                align: patch.align ?? b.align,
                color: patch.color ?? b.color,
                background: patch.background ?? b.background,
                fontFamily: patch.fontFamily ?? b.fontFamily,
                fontSizePx: patch.fontSize ?? b.fontSizePx,
              }
            : b,
        ),
      }));
      return;
    }
    if (patch.block) {
      // Some engines want a tag name, others want <tag>.
      const tag = patch.block;
      editorRef.current?.focus();
      const ok = document.execCommand("formatBlock", false, tag);
      if (!ok) document.execCommand("formatBlock", false, `<${tag}>`);
      syncFromEditor();
      refreshSelectionUi();
      return;
    }
    if (patch.bold !== undefined) format("bold");
    if (patch.italic !== undefined) format("italic");
    if (patch.underline !== undefined) format("underline");
    if (patch.align === "left") format("justifyLeft");
    if (patch.align === "center") format("justifyCenter");
    if (patch.align === "right") format("justifyRight");
    if (patch.color) format("foreColor", patch.color);
    if (patch.background) format("hiliteColor", patch.background);
    if (patch.fontFamily) {
      const face = patch.fontFamily.split(",")[0]?.replace(/['"]/g, "").trim();
      if (face) format("fontName", face);
      setDoc((prev) => ({ ...prev, fontFamily: patch.fontFamily! }));
    }
    if (patch.fontSize) {
      // execCommand fontSize only accepts 1–7; wrap selection with a span instead.
      const size = patch.fontSize;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const span = document.createElement("span");
        span.style.fontSize = `${size}pt`;
        try {
          range.surroundContents(span);
        } catch {
          format("fontSize", "3");
        }
        syncFromEditor();
      }
      setDoc((prev) => ({ ...prev, fontSizePx: size }));
      refreshSelectionUi();
    }
  }

  function addTextBox() {
    const box = defaultTextBox(locale, doc.fontFamily);
    setDoc((prev) => ({
      ...prev,
      version: 2,
      boxes: [...(prev.boxes ?? []), box],
    }));
    setSelectedBoxId(box.id);
  }

  function deleteSelectedBox() {
    if (!selectedBoxId) return;
    setDoc((prev) => ({
      ...prev,
      boxes: (prev.boxes ?? []).filter((b) => b.id !== selectedBoxId),
    }));
    setSelectedBoxId(null);
  }

  function onBoxPointerDown(
    e: ReactPointerEvent,
    box: SkrivTextBox,
    mode: "move" | "resize",
  ) {
    e.stopPropagation();
    setSelectedBoxId(box.id);
    dragRef.current = {
      id: box.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      orig: { ...box },
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPagePointerMove(e: ReactPointerEvent) {
    const drag = dragRef.current;
    const page = pageRef.current;
    if (!drag || !page) return;
    const rect = page.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.startY) / rect.height) * 100;
    setDoc((prev) => ({
      ...prev,
      boxes: (prev.boxes ?? []).map((b) => {
        if (b.id !== drag.id) return b;
        if (drag.mode === "move") {
          return {
            ...b,
            x: Math.min(92, Math.max(0, drag.orig.x + dx)),
            y: Math.min(92, Math.max(0, drag.orig.y + dy)),
          };
        }
        return {
          ...b,
          w: Math.min(100 - drag.orig.x, Math.max(10, drag.orig.w + dx)),
          h: Math.min(100 - drag.orig.y, Math.max(8, drag.orig.h + dy)),
        };
      }),
    }));
  }

  function onPagePointerUp() {
    dragRef.current = null;
  }

  function insertImage(file: File | null) {
    if (!file || !file.type.startsWith("image/")) {
      setError(t.invalidImage);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      editorRef.current?.focus();
      runCommand(
        "insertHTML",
        `<img src="${String(reader.result)}" alt="" style="max-width:100%;height:auto" />`,
      );
      syncFromEditor();
    };
    reader.readAsDataURL(file);
  }

  function insertTable() {
    editorRef.current?.focus();
    runCommand(
      "insertHTML",
      `<table style="width:100%;border-collapse:collapse;margin:0.75em 0">
        <tr><td style="border:1px solid #ccc;padding:6px">&nbsp;</td><td style="border:1px solid #ccc;padding:6px">&nbsp;</td><td style="border:1px solid #ccc;padding:6px">&nbsp;</td></tr>
        <tr><td style="border:1px solid #ccc;padding:6px">&nbsp;</td><td style="border:1px solid #ccc;padding:6px">&nbsp;</td><td style="border:1px solid #ccc;padding:6px">&nbsp;</td></tr>
      </table><p></p>`,
    );
    syncFromEditor();
  }

  function doFindReplace(all: boolean) {
    if (!find) return;
    const html = doc.html;
    if (all) {
      const next = html.split(find).join(replaceWith);
      setDoc((prev) => ({ ...prev, html: next }));
      if (editorRef.current) {
        applyingRef.current = true;
        editorRef.current.innerHTML = next;
        applyingRef.current = false;
      }
      return;
    }
    const idx = html.indexOf(find);
    if (idx < 0) {
      setError(t.findNone);
      return;
    }
    const next =
      html.slice(0, idx) + replaceWith + html.slice(idx + find.length);
    setDoc((prev) => ({ ...prev, html: next }));
    if (editorRef.current) {
      applyingRef.current = true;
      editorRef.current.innerHTML = next;
      applyingRef.current = false;
    }
  }

  function changeDictLang(next: DictLang) {
    setDictLang(next);
    setDoc((prev) => ({ ...prev, dictLang: next }));
  }

  function learnWord(word: string) {
    addPersonalWord(dictLang, word);
    setPersonalCount(loadPersonalWords(dictLang).size);
    setIssues((prev) => prev.filter((i) => i.word !== word));
  }

  async function onOpenFile(file: File | null) {
    if (!file) return;
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".kitdoc") || name.endsWith(".json")) {
        const parsed = await readJsonFile<SkrivDoc>(file);
        if (parsed?.kind !== "skriv") {
          setError(t.invalidFile);
          return;
        }
        const id = newDraftId("skriv");
        const next = {
          ...emptyDoc(t.untitled, locale),
          ...parsed,
          kind: "skriv" as const,
          boxes: parsed.boxes ?? [],
        };
        setDraftId(id);
        setDoc(next);
        if (next.dictLang && isDictLang(next.dictLang)) setDictLang(next.dictLang);
        if (editorRef.current) {
          applyingRef.current = true;
          editorRef.current.innerHTML = next.html || "<p></p>";
          applyingRef.current = false;
        }
        await persist(next, id);
        return;
      }
      const text = await file.text();
      const id = newDraftId("skriv");
      const next = emptyDoc(
        file.name.replace(/\.[^.]+$/, "") || t.untitled,
        locale,
      );
      next.html = `<p>${text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "</p><p>")}</p>`;
      setDraftId(id);
      setDoc(next);
      if (editorRef.current) {
        applyingRef.current = true;
        editorRef.current.innerHTML = next.html;
        applyingRef.current = false;
      }
      await persist(next, id);
    } catch {
      setError(t.invalidFile);
    }
  }

  function newDoc() {
    const id = newDraftId("skriv");
    const next = emptyDoc(t.untitled, locale);
    setDraftId(id);
    setDoc(next);
    setSelectedBoxId(null);
    setDictLang(isDictLang(locale) ? locale : "en");
    if (editorRef.current) {
      applyingRef.current = true;
      editorRef.current.innerHTML = next.html;
      applyingRef.current = false;
    }
    void persist(next, id);
  }

  function printDoc() {
    const boxesHtml = (doc.boxes ?? [])
      .map(
        (b) =>
          `<div style="position:relative;margin:0.5em 0;padding:0.4em;border:1px dashed #bbb;font-family:${b.fontFamily};font-size:${b.fontSizePx}px;color:${b.color};background:${b.background};text-align:${b.align}">${(b.text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</div>`,
      )
      .join("");
    printHtmlDocument({
      title: doc.title || t.untitled,
      pageSize: doc.pageSize === "letter" ? "letter" : "A4",
      bodyHtml: `<h1>${(doc.title || t.untitled).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</h1>${doc.html || ""}${boxesHtml}`,
    });
  }

  const pageW = pageWidthMm(doc.pageSize);
  const pageH = pageHeightMm(doc.pageSize);
  const marginPct = (doc.marginMm / pageW) * 100;
  const zoomScale = zoom / 100;
  const compactBtn = `${secondaryBtnClass} !h-10 !min-h-10 !px-3 !py-2 text-sm sm:!h-9 sm:!min-h-0 sm:!px-2.5 sm:!py-1.5 sm:text-xs`;

  const formatLabels = {
    bold: t.bold,
    italic: t.italic,
    underline: t.underline,
    alignLeft: t.alignLeft,
    alignCenter: t.alignCenter,
    alignRight: t.alignRight,
    textColor: t.textColor,
    fillColor: t.highlight,
    fontFamily: t.fontFamily,
    fontSize: t.fontSize,
    textStyle: t.textStyle,
    styleTitle: t.styleTitle,
    styleHeading: t.styleHeading,
    paragraph: t.paragraph,
  };

  return (
    <div className="papers-surface mx-auto max-w-5xl space-y-3">
      <p className="hidden text-sm text-muted sm:block">{t.intro}</p>

      <div className="space-y-2">
        <Field label={t.title}>
          <KitInput
            value={doc.title}
            onChange={(e) =>
              setDoc((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </Field>
        <div className="kit-h-scroll sm:flex-wrap">
          <FileInput
            inline
            label={t.openFile}
            accept=".kitdoc,.json,.txt"
            onFile={(f) => void onOpenFile(f)}
          />
          <button type="button" className={secondaryBtnClass} onClick={newDoc}>
            {t.newDoc}
          </button>
          <button
            type="button"
            className={secondaryBtnClass}
            onClick={() =>
              downloadJsonFile(
                `${(doc.title || "document").replace(/[^\w\-]+/g, "_")}.kitdoc`,
                doc,
              )
            }
          >
            {t.saveKitdoc}
          </button>
          <button
            type="button"
            className={primaryBtnClass}
            onClick={() =>
              downloadTextFile(
                `${(doc.title || "document").replace(/[^\w\-]+/g, "_")}.txt`,
                htmlToPlainText(doc.html),
              )
            }
          >
            {t.exportTxt}
          </button>
          <button type="button" className={secondaryBtnClass} onClick={printDoc}>
            {t.print}
          </button>
        </div>
      </div>

      <ErrorBanner>{error}</ErrorBanner>

      <div className="papers-desk overflow-x-clip overflow-y-visible rounded-[14px] border border-border">
        <div className="papers-ribbon w-full px-2 py-2">
          <PapersFormatBar
            variant="ribbon"
            value={formatState}
            onChange={onFormatChange}
            labels={formatLabels}
            extras={
              <>
                <button
                  type="button"
                  className={compactBtn}
                  onClick={() => format("undo")}
                >
                  {t.undo}
                </button>
                <button
                  type="button"
                  className={compactBtn}
                  onClick={() => format("redo")}
                >
                  {t.redo}
                </button>
                <button
                  type="button"
                  className={compactBtn}
                  onClick={() => format("insertUnorderedList")}
                >
                  {t.bulletList}
                </button>
                <button
                  type="button"
                  className={compactBtn}
                  onClick={() => format("insertOrderedList")}
                >
                  {t.numberedList}
                </button>
                <button
                  type="button"
                  className={`${compactBtn} ${panel === "insert" ? "!bg-accent !text-white" : ""}`}
                  onClick={() =>
                    setPanel((p) => (p === "insert" ? "none" : "insert"))
                  }
                >
                  {t.insertTools}
                </button>
                <button
                  type="button"
                  className={`${compactBtn} ${panel === "page" ? "!bg-accent !text-white" : ""}`}
                  onClick={() =>
                    setPanel((p) => (p === "page" ? "none" : "page"))
                  }
                >
                  {t.pageTools}
                </button>
                <button
                  type="button"
                  className={`${compactBtn} ${panel === "find" ? "!bg-accent !text-white" : ""}`}
                  onClick={() =>
                    setPanel((p) => (p === "find" ? "none" : "find"))
                  }
                >
                  {t.findReplaceToggle}
                </button>
              </>
            }
          />

          {panel === "insert" ? (
            <div className="mt-2 flex flex-wrap gap-1.5 rounded-[10px] border border-border/80 bg-background/70 p-2">
              <button
                type="button"
                className={compactBtn}
                onClick={insertTable}
              >
                {t.insertTable}
              </button>
              <label className={`${compactBtn} cursor-pointer`}>
                {t.insertImage}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    e.target.value = "";
                    insertImage(f);
                  }}
                />
              </label>
              <button
                type="button"
                className={compactBtn}
                onClick={addTextBox}
              >
                {t.addTextBox}
              </button>
              <button
                type="button"
                className={compactBtn}
                onClick={deleteSelectedBox}
                disabled={!selectedBoxId}
              >
                {t.deleteTextBox}
              </button>
            </div>
          ) : null}

          {panel === "page" ? (
            <div className="mt-2 grid gap-2 rounded-[10px] border border-border/80 bg-background/70 p-2 sm:grid-cols-2 lg:grid-cols-5">
              <Field label={t.pageSize}>
                <KitSelect
                  value={doc.pageSize}
                  onChange={(e) =>
                    setDoc((prev) => ({
                      ...prev,
                      pageSize: e.target.value as PageSize,
                    }))
                  }
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {pageSizeLabel(size)}
                    </option>
                  ))}
                </KitSelect>
              </Field>
              <Field label={t.marginMm}>
                <KitInput
                  type="number"
                  min={10}
                  max={40}
                  value={doc.marginMm}
                  onChange={(e) =>
                    setDoc((prev) => ({
                      ...prev,
                      marginMm: Number(e.target.value) || 20,
                    }))
                  }
                />
              </Field>
              <Field label={t.lineHeight}>
                <KitInput
                  type="number"
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={doc.lineHeight}
                  onChange={(e) =>
                    setDoc((prev) => ({
                      ...prev,
                      lineHeight: Number(e.target.value) || 1.15,
                    }))
                  }
                />
              </Field>
              <Field label={t.dictionary}>
                <KitSelect
                  value={dictLang}
                  onChange={(e) =>
                    changeDictLang(e.target.value as DictLang)
                  }
                >
                  {DICT_LANGS.map((lang) => (
                    <option key={lang} value={lang}>
                      {(t[`dict_${lang}` as keyof typeof t] as string) ??
                        lang}
                    </option>
                  ))}
                </KitSelect>
              </Field>
              <Field label={t.zoom}>
                <KitSelect
                  value={String(zoom)}
                  onChange={(e) => setZoom(Number(e.target.value) || 100)}
                >
                  {[75, 90, 100, 110, 125, 150].map((z) => (
                    <option key={z} value={z}>
                      {z}%
                    </option>
                  ))}
                </KitSelect>
              </Field>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={spellOn}
                  onChange={(e) => setSpellOn(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                {t.spellcheck}
                <span className="text-xs text-muted">
                  {t.personalWords.replace("{count}", String(personalCount))}
                </span>
              </label>
            </div>
          ) : null}

          {panel === "find" ? (
            <div className="mt-2 grid gap-2 rounded-[10px] border border-border/80 bg-background/70 p-2 sm:grid-cols-[1fr_1fr_auto_auto]">
              <Field label={t.find}>
                <KitInput
                  value={find}
                  onChange={(e) => setFind(e.target.value)}
                />
              </Field>
              <Field label={t.replace}>
                <KitInput
                  value={replaceWith}
                  onChange={(e) => setReplaceWith(e.target.value)}
                />
              </Field>
              <button
                type="button"
                className={`${compactBtn} self-end`}
                onClick={() => doFindReplace(false)}
              >
                {t.replaceOne}
              </button>
              <button
                type="button"
                className={`${compactBtn} self-end`}
                onClick={() => doFindReplace(true)}
              >
                {t.replaceAll}
              </button>
            </div>
          ) : null}

          {spellOn &&
          (dictLang === "da" || dictLang === "en") &&
          issues.length > 0 ? (
            <div className="mt-2 rounded-[10px] border border-border/80 bg-background/70 px-2.5 py-2">
              <p className="mb-1.5 text-xs font-medium text-muted">
                {t.unknownWords}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {issues.map((issue) => (
                  <li key={issue.word}>
                    <button
                      type="button"
                      className="rounded-[7px] border border-border px-2 py-0.5 text-xs"
                      onClick={() => learnWord(issue.word)}
                      title={t.addToDictionary}
                    >
                      {issue.word}
                      {issue.count > 1 ? ` ×${issue.count}` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="papers-paper-stack w-full">
          <div
            ref={pageRef}
            className="papers-sheet relative w-full"
            style={{
              aspectRatio: `${pageW} / ${pageH}`,
              minHeight: "22rem",
            }}
            onPointerMove={onPagePointerMove}
            onPointerUp={onPagePointerUp}
            onClick={() => setSelectedBoxId(null)}
          >
            <div
              className="papers-margin-guide"
              style={{
                top: `${marginPct}%`,
                right: `${marginPct}%`,
                bottom: `${marginPct}%`,
                left: `${marginPct}%`,
              }}
              aria-hidden
            />
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={spellOn}
              lang={browserLangTag(dictLang)}
              role="textbox"
              aria-label={t.editorLabel}
              className="absolute inset-0 overflow-auto text-black outline-none [&_h1]:mb-3 [&_h1]:text-[1.7em] [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-[1.35em] [&_h2]:font-bold [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6"
              style={{
                padding: `${marginPct}%`,
                fontFamily: doc.fontFamily,
                fontSize: `${doc.fontSizePx * zoomScale}pt`,
                lineHeight: String(doc.lineHeight),
              }}
              onInput={syncFromEditor}
              onBlur={syncFromEditor}
              onClick={(e) => e.stopPropagation()}
              onMouseUp={refreshSelectionUi}
              onKeyUp={refreshSelectionUi}
              onFocus={() => setSelectedBoxId(null)}
            />

            {boxes.map((box) => (
              <div
                key={box.id}
                data-selected={selectedBoxId === box.id}
                className="papers-textbox absolute cursor-move overflow-hidden rounded-[4px]"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.w}%`,
                  height: `${box.h}%`,
                  zIndex: 10 + box.z,
                  color: box.color,
                  background: box.background,
                  fontFamily: box.fontFamily,
                  fontSize: `${box.fontSizePx}px`,
                  fontWeight: box.bold ? 700 : 400,
                  fontStyle: box.italic ? "italic" : "normal",
                  textDecoration: box.underline ? "underline" : "none",
                  textAlign: box.align,
                }}
                onPointerDown={(e) => onBoxPointerDown(e, box, "move")}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBoxId(box.id);
                  setBubblePos(null);
                }}
              >
                <textarea
                  value={box.text}
                  onChange={(e) =>
                    setDoc((prev) => ({
                      ...prev,
                      boxes: (prev.boxes ?? []).map((b) =>
                        b.id === box.id ? { ...b, text: e.target.value } : b,
                      ),
                    }))
                  }
                  className="h-full w-full resize-none border-0 bg-transparent p-2 text-inherit outline-none"
                  onPointerDown={(e) => e.stopPropagation()}
                />
                {selectedBoxId === box.id ? (
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize bg-accent"
                    onPointerDown={(e) => onBoxPointerDown(e, box, "resize")}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="papers-sheet-footer flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-[11px] text-muted">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span>
                {pageSizeLabel(doc.pageSize)} · {zoom}%
              </span>
              <span>{t.statWords.replace("{n}", String(stats.words))}</span>
              <span>{t.statChars.replace("{n}", String(stats.chars))}</span>
            </div>
            <span>
              {savedAt
                ? t.savedAt.replace(
                    "{time}",
                    new Date(savedAt).toLocaleTimeString(),
                  )
                : t.unsaved}
            </span>
          </div>
        </div>
      </div>

      {bubblePos && !selectedBoxId ? (
        <SkrivSelectionBubble
          pos={bubblePos}
          value={formatState}
          onChange={onFormatChange}
          labels={formatLabels}
        />
      ) : null}
    </div>
  );
}
