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
  IconCols,
  IconCopy,
  IconRedo,
  IconRows,
  IconSortAsc,
  IconSortDesc,
  IconTrash,
  IconUndo,
  PapersDocBar,
  PapersIconBtn,
  PapersMenu,
  papersCompactBtnClass,
} from "@/components/tools/PapersChrome";
import {
  PapersFormatBar,
  type PapersFormatState,
} from "@/components/tools/PapersFormatBar";
import {
  ErrorBanner,
  KitInput,
  KitSelect,
  fieldClass,
} from "@/components/tools/ui";
import { useHistory } from "@/hooks/useHistory";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  downloadJsonFile,
  downloadTextFile,
  loadPapersDraft,
  newDraftId,
  readJsonFile,
  savePapersDraft,
} from "@/lib/papers/storage";
import { downloadBlob } from "../media/canvas";
import {
  cellKey,
  colLabel,
  csvToSheet,
  displayValue,
  emptySheet,
  findMergeAt,
  formatDisplayValue,
  getRaw,
  getStyle,
  isMergeAnchor,
  mergeCells,
  normalizeMerge,
  selectionNumbers,
  setRaw,
  setStyle,
  sheetToCsv,
  sheetToExcelXml,
  styleToCss,
  unmergeAt,
  type CellAlign,
  type CellStyle,
  type NumberFormat,
  type SheetDoc,
} from "./sheet";

type ClipCell = { value: string; style: CellStyle };

type Sel = { row: number; col: number };

function inRange(r: number, c: number, a: Sel, b: Sel) {
  const r0 = Math.min(a.row, b.row);
  const r1 = Math.max(a.row, b.row);
  const c0 = Math.min(a.col, b.col);
  const c1 = Math.max(a.col, b.col);
  return r >= r0 && r <= r1 && c >= c0 && c <= c1;
}

export function ArkTool() {
  const { dictionary, locale } = useLanguage();
  const t = dictionary.arkTool;
  const {
    present: doc,
    setPresent: setDoc,
    replace: replaceDoc,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<SheetDoc>(emptySheet(t.untitled, locale));
  const [draftId, setDraftId] = useState(() => newDraftId("ark"));
  const [sel, setSel] = useState<Sel>({ row: 0, col: 0 });
  const [selEnd, setSelEnd] = useState<Sel>({ row: 0, col: 0 });
  const [formula, setFormula] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [freezeHeader, setFreezeHeader] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [panMode, setPanMode] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const [editing, setEditing] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const selectingRef = useRef(false);
  const clipRef = useRef<ClipCell[][] | null>(null);
  const selRef = useRef({ sel, selEnd, editing, doc });
  selRef.current = { sel, selEnd, editing, doc };

  const panning = panMode || spaceDown;

  useEffect(() => {
    void (async () => {
      const existing = await loadPapersDraft<SheetDoc>(draftId);
      if (existing?.payload?.kind === "ark") {
        replaceDoc(existing.payload);
        setFormula(getRaw(existing.payload.cells, 0, 0));
        setSavedAt(existing.meta.updatedAt);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once
  }, []);

  useEffect(() => {
    setFormula(getRaw(doc.cells, sel.row, sel.col));
  }, [sel, doc.cells]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !editing && e.target === document.body) {
        e.preventDefault();
        setSpaceDown(true);
      }
      const tag = (e.target as HTMLElement)?.tagName;
      const inField =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.code === "Space" && !inField) {
        e.preventDefault();
        setSpaceDown(true);
      }

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (!inField || !editing) {
          e.preventDefault();
          undo();
        }
        return;
      }
      if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        if (!inField || !editing) {
          e.preventDefault();
          redo();
        }
        return;
      }
      if (mod && e.key.toLowerCase() === "c" && !inField) {
        e.preventDefault();
        copySelection();
        return;
      }
      if (mod && e.key.toLowerCase() === "v" && !inField) {
        e.preventDefault();
        pasteSelection();
        return;
      }
      if (mod && e.key.toLowerCase() === "x" && !inField) {
        e.preventDefault();
        copySelection();
        clearSelection();
        return;
      }

      if (inField || editing) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        clearSelection();
        return;
      }
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const { sel: s, selEnd: se } = selRef.current;
        const anchor = e.shiftKey ? se : s;
        let row = anchor.row;
        let col = anchor.col;
        if (e.key === "ArrowUp") row = Math.max(0, row - 1);
        if (e.key === "ArrowDown")
          row = Math.min(selRef.current.doc.rows - 1, row + 1);
        if (e.key === "ArrowLeft") col = Math.max(0, col - 1);
        if (e.key === "ArrowRight")
          col = Math.min(selRef.current.doc.cols - 1, col + 1);
        if (e.shiftKey) {
          setSelEnd({ row, col });
        } else {
          setSel({ row, col });
          setSelEnd({ row, col });
        }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        setEditing(true);
        return;
      }
      if (e.key.length === 1 && !mod) {
        setEditing(true);
        setFormula(e.key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers use refs
  }, [editing, undo, redo]);

  const persist = useCallback(
    async (next: SheetDoc, id = draftId) => {
      try {
        await savePapersDraft("ark", id, next.title || t.untitled, next);
        setSavedAt(Date.now());
        setError(null);
      } catch {
        setError(t.saveError);
      }
    },
    [draftId, t.saveError, t.untitled],
  );

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void persist(doc);
    }, 700);
    return () => window.clearTimeout(handle);
  }, [doc, persist]);

  function updateCell(row: number, col: number, value: string) {
    setDoc((prev) => ({
      ...prev,
      cells: setRaw(prev.cells, row, col, value),
    }));
  }

  function commitFormula() {
    updateCell(sel.row, sel.col, formula);
    setEditing(false);
  }

  function forEachSelected(fn: (row: number, col: number) => void) {
    const r0 = Math.min(sel.row, selEnd.row);
    const r1 = Math.max(sel.row, selEnd.row);
    const c0 = Math.min(sel.col, selEnd.col);
    const c1 = Math.max(sel.col, selEnd.col);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) fn(r, c);
    }
  }

  function copySelection() {
    const { sel: s, selEnd: se, doc: d } = selRef.current;
    const r0 = Math.min(s.row, se.row);
    const r1 = Math.max(s.row, se.row);
    const c0 = Math.min(s.col, se.col);
    const c1 = Math.max(s.col, se.col);
    const grid: ClipCell[][] = [];
    const lines: string[] = [];
    for (let r = r0; r <= r1; r++) {
      const row: ClipCell[] = [];
      const parts: string[] = [];
      for (let c = c0; c <= c1; c++) {
        const value = getRaw(d.cells, r, c);
        row.push({ value, style: getStyle(d.styles, r, c) });
        parts.push(value);
      }
      grid.push(row);
      lines.push(parts.join("\t"));
    }
    clipRef.current = grid;
    void navigator.clipboard?.writeText(lines.join("\n")).catch(() => undefined);
  }

  function pasteSelection() {
    const clip = clipRef.current;
    const { sel: s } = selRef.current;
    if (!clip?.length) {
      void navigator.clipboard?.readText().then((text) => {
        if (!text) return;
        const rows = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
        setDoc((prev) => {
          let cells = { ...prev.cells };
          rows.forEach((line, ri) => {
            line.split("\t").forEach((value, ci) => {
              const row = s.row + ri;
              const col = s.col + ci;
              if (row >= prev.rows || col >= prev.cols) return;
              cells = setRaw(cells, row, col, value);
            });
          });
          return { ...prev, cells };
        });
      });
      return;
    }
    setDoc((prev) => {
      let cells = { ...prev.cells };
      let styles = { ...(prev.styles ?? {}) };
      clip.forEach((row, ri) => {
        row.forEach((cell, ci) => {
          const row = s.row + ri;
          const col = s.col + ci;
          if (row >= prev.rows || col >= prev.cols) return;
          cells = setRaw(cells, row, col, cell.value);
          if (Object.keys(cell.style).length) {
            styles = setStyle(styles, row, col, cell.style);
          }
        });
      });
      return { ...prev, version: 2, cells, styles };
    });
  }

  function clearSelection() {
    const { sel: s, selEnd: se } = selRef.current;
    const r0 = Math.min(s.row, se.row);
    const r1 = Math.max(s.row, se.row);
    const c0 = Math.min(s.col, se.col);
    const c1 = Math.max(s.col, se.col);
    setDoc((prev) => {
      const cells = { ...prev.cells };
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          delete cells[cellKey(r, c)];
        }
      }
      return { ...prev, cells };
    });
    setFormula("");
    setEditing(false);
  }

  function applyNumberFormat(numberFormat: NumberFormat) {
    setDoc((prev) => {
      const { sel: s, selEnd: se } = selRef.current;
      const r0 = Math.min(s.row, se.row);
      const r1 = Math.max(s.row, se.row);
      const c0 = Math.min(s.col, se.col);
      const c1 = Math.max(s.col, se.col);
      let styles = { ...(prev.styles ?? {}) };
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          styles = setStyle(styles, r, c, { numberFormat });
        }
      }
      return { ...prev, version: 2, styles };
    });
  }

  function patchSelectedStyles(patch: Partial<CellStyle>) {
    setDoc((prev) => {
      let styles = { ...(prev.styles ?? {}) };
      forEachSelected((row, col) => {
        styles = setStyle(styles, row, col, patch);
      });
      return { ...prev, version: 2, styles };
    });
  }

  function toggleStyleFlag(key: "bold" | "italic" | "underline") {
    const current = getStyle(doc.styles, sel.row, sel.col);
    patchSelectedStyles({ [key]: !current[key] });
  }

  function applyAlign(align: CellAlign) {
    patchSelectedStyles({ align });
  }

  function doMerge() {
    const range = normalizeMerge({
      r0: sel.row,
      c0: sel.col,
      r1: selEnd.row,
      c1: selEnd.col,
    });
    if (range.r0 === range.r1 && range.c0 === range.c1) return;
    setDoc((prev) => {
      let cells = { ...prev.cells };
      // Keep top-left value; clear other cells in the merge.
      for (let r = range.r0; r <= range.r1; r++) {
        for (let c = range.c0; c <= range.c1; c++) {
          if (r === range.r0 && c === range.c0) continue;
          const key = cellKey(r, c);
          delete cells[key];
        }
      }
      return {
        ...prev,
        version: 2,
        cells,
        merges: mergeCells(prev.merges, range),
      };
    });
    setSel({ row: range.r0, col: range.c0 });
    setSelEnd({ row: range.r0, col: range.c0 });
  }

  function doUnmerge() {
    setDoc((prev) => ({
      ...prev,
      version: 2,
      merges: unmergeAt(prev.merges, sel.row, sel.col),
    }));
  }

  function clearFormats() {
    setDoc((prev) => {
      const styles = { ...(prev.styles ?? {}) };
      forEachSelected((row, col) => {
        delete styles[cellKey(row, col)];
      });
      return { ...prev, version: 2, styles };
    });
  }

  function moveSelectionTo(destRow: number, destCol: number) {
    const r0 = Math.min(sel.row, selEnd.row);
    const r1 = Math.max(sel.row, selEnd.row);
    const c0 = Math.min(sel.col, selEnd.col);
    const c1 = Math.max(sel.col, selEnd.col);
    if (destRow === r0 && destCol === c0) return;
    setDoc((prev) => {
      let cells = { ...prev.cells };
      let styles = { ...(prev.styles ?? {}) };
      const payload: Array<{
        dr: number;
        dc: number;
        value: string;
        style: CellStyle;
      }> = [];
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          payload.push({
            dr: r - r0,
            dc: c - c0,
            value: getRaw(cells, r, c),
            style: getStyle(styles, r, c),
          });
          delete cells[cellKey(r, c)];
          delete styles[cellKey(r, c)];
        }
      }
      for (const item of payload) {
        const nr = destRow + item.dr;
        const nc = destCol + item.dc;
        if (nr < 0 || nc < 0 || nr >= prev.rows || nc >= prev.cols) continue;
        if (item.value) cells[cellKey(nr, nc)] = item.value;
        if (Object.keys(item.style).length) {
          styles = setStyle(styles, nr, nc, item.style);
        }
      }
      return { ...prev, version: 2, cells, styles };
    });
    const height = Math.abs(selEnd.row - sel.row);
    const width = Math.abs(selEnd.col - sel.col);
    setSel({ row: destRow, col: destCol });
    setSelEnd({ row: destRow + height, col: destCol + width });
    setMoveMode(false);
  }

  function addRows(count = 5) {
    setDoc((prev) => ({ ...prev, rows: prev.rows + count }));
  }

  function addCols(count = 2) {
    setDoc((prev) => ({ ...prev, cols: prev.cols + count }));
  }

  function sortByColumn(col: number, asc: boolean) {
    setDoc((prev) => {
      const start = freezeHeader ? 1 : 0;
      const indices = Array.from(
        { length: prev.rows - start },
        (_, i) => i + start,
      );
      indices.sort((a, b) => {
        const av = displayValue(prev.cells, a, col);
        const bv = displayValue(prev.cells, b, col);
        const an = Number(av.replace(",", "."));
        const bn = Number(bv.replace(",", "."));
        if (Number.isFinite(an) && Number.isFinite(bn)) {
          return asc ? an - bn : bn - an;
        }
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
      const nextCells: Record<string, string> = {};
      const nextStyles: Record<string, CellStyle> = {};
      for (let c = 0; c < prev.cols; c++) {
        for (let r = 0; r < start; r++) {
          const raw = getRaw(prev.cells, r, c);
          if (raw) nextCells[cellKey(r, c)] = raw;
          const st = getStyle(prev.styles, r, c);
          if (Object.keys(st).length) nextStyles[cellKey(r, c)] = st;
        }
      }
      indices.forEach((srcRow, i) => {
        const dest = start + i;
        for (let c = 0; c < prev.cols; c++) {
          const raw = getRaw(prev.cells, srcRow, c);
          if (raw) nextCells[cellKey(dest, c)] = raw;
          const st = getStyle(prev.styles, srcRow, c);
          if (Object.keys(st).length) nextStyles[cellKey(dest, c)] = st;
        }
      });
      return { ...prev, cells: nextCells, styles: nextStyles };
    });
  }

  const visibleRows = useMemo(() => {
    const rows = Array.from({ length: doc.rows }, (_, r) => r);
    const q = filterText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      if (freezeHeader && r === 0) return true;
      for (let c = 0; c < doc.cols; c++) {
        if (displayValue(doc.cells, r, c).toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [doc, filterText, freezeHeader]);

  async function onOpenFile(file: File | null) {
    if (!file) return;
    setError(null);
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".kitsheet") || name.endsWith(".json")) {
        const parsed = await readJsonFile<SheetDoc>(file);
        if (parsed?.kind !== "ark" || !parsed.cells) {
          setError(t.invalidFile);
          return;
        }
        const id = newDraftId("ark");
        const next = {
          ...emptySheet(parsed.title || t.untitled, locale),
          ...parsed,
          kind: "ark" as const,
        };
        setDraftId(id);
        replaceDoc(next);
        setSel({ row: 0, col: 0 });
        setSelEnd({ row: 0, col: 0 });
        await persist(next, id);
        return;
      }
      const text = await file.text();
      const next = csvToSheet(
        text,
        file.name.replace(/\.[^.]+$/, "") || t.untitled,
      );
      const id = newDraftId("ark");
      setDraftId(id);
      replaceDoc(next);
      setSel({ row: 0, col: 0 });
      setSelEnd({ row: 0, col: 0 });
      await persist(next, id);
    } catch {
      setError(t.invalidFile);
    }
  }

  function newSheet() {
    const id = newDraftId("ark");
    const next = emptySheet(t.untitled, locale);
    setDraftId(id);
    replaceDoc(next);
    setSel({ row: 0, col: 0 });
    setSelEnd({ row: 0, col: 0 });
    setFormula("");
    void persist(next, id);
  }

  const filledCells = useMemo(
    () => Object.keys(doc.cells).length,
    [doc.cells],
  );

  const selStats = useMemo(() => {
    const nums = selectionNumbers(
      doc.cells,
      sel.row,
      sel.col,
      selEnd.row,
      selEnd.col,
    );
    if (!nums.length) return null;
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      sum,
      avg: sum / nums.length,
      count: nums.length,
    };
  }, [doc.cells, sel, selEnd]);

  const activeStyle = getStyle(doc.styles, sel.row, sel.col);
  const selectionLabel =
    sel.row === selEnd.row && sel.col === selEnd.col
      ? cellKey(sel.row, sel.col)
      : `${cellKey(Math.min(sel.row, selEnd.row), Math.min(sel.col, selEnd.col))}:${cellKey(Math.max(sel.row, selEnd.row), Math.max(sel.col, selEnd.col))}`;

  function onScrollPointerDown(e: ReactPointerEvent) {
    if (e.button === 1 || (e.button === 0 && panning)) {
      e.preventDefault();
      const el = scrollRef.current;
      if (!el) return;
      panRef.current = {
        x: e.clientX,
        y: e.clientY,
        left: el.scrollLeft,
        top: el.scrollTop,
      };
      el.setPointerCapture(e.pointerId);
    }
  }

  function onScrollPointerMove(e: ReactPointerEvent) {
    const pan = panRef.current;
    const el = scrollRef.current;
    if (!pan || !el) return;
    el.scrollLeft = pan.left - (e.clientX - pan.x);
    el.scrollTop = pan.top - (e.clientY - pan.y);
  }

  function onScrollPointerUp() {
    panRef.current = null;
    selectingRef.current = false;
  }

  function startSelect(row: number, col: number, extend: boolean) {
    if (panning) return;
    const merge = findMergeAt(doc.merges, row, col);
    const anchor = merge
      ? { row: normalizeMerge(merge).r0, col: normalizeMerge(merge).c0 }
      : { row, col };
    if (extend) {
      setSelEnd(anchor);
    } else {
      setSel(anchor);
      setSelEnd(anchor);
    }
    selectingRef.current = true;
  }

  const formatState: PapersFormatState = {
    bold: !!activeStyle.bold,
    italic: !!activeStyle.italic,
    underline: !!activeStyle.underline,
    align: activeStyle.align ?? "left",
    color: activeStyle.color ?? "#111111",
    background: activeStyle.background ?? "#ffffff",
    fontFamily:
      activeStyle.fontFamily ?? "Calibri, 'Segoe UI', system-ui, sans-serif",
    fontSize: activeStyle.fontSize ?? 14,
  };

  return (
    <div className="papers-surface mx-auto max-w-6xl space-y-3 sm:space-y-4">
      <p className="hidden text-sm text-muted sm:block">{t.intro}</p>

      <PapersDocBar
        titleLabel={t.title}
        title={doc.title}
        onTitleChange={(value) =>
          setDoc((prev) => ({ ...prev, title: value }))
        }
      >
        <PapersMenu
          label={t.fileMenu}
          items={[
            {
              type: "file",
              id: "open",
              label: t.openFile,
              accept: ".kitsheet,.json,.csv,.txt",
              onFile: (f) => void onOpenFile(f),
            },
            {
              type: "action",
              id: "new",
              label: t.newSheet,
              onSelect: newSheet,
            },
            {
              type: "action",
              id: "save",
              label: t.saveKitsheet,
              onSelect: () =>
                downloadJsonFile(
                  `${(doc.title || "sheet").replace(/[^\w\-]+/g, "_")}.kitsheet`,
                  doc,
                ),
            },
            { type: "sep", id: "sep-export" },
            {
              type: "action",
              id: "csv",
              label: t.exportCsv,
              onSelect: () =>
                downloadTextFile(
                  `${(doc.title || "sheet").replace(/[^\w\-]+/g, "_")}.csv`,
                  "\uFEFF" + sheetToCsv(doc, ";"),
                  "text/csv;charset=utf-8",
                ),
            },
            {
              type: "action",
              id: "xls",
              label: t.exportExcel,
              onSelect: () =>
                downloadBlob(
                  new Blob([sheetToExcelXml(doc)], {
                    type: "application/vnd.ms-excel",
                  }),
                  `${(doc.title || "sheet").replace(/[^\w\-]+/g, "_")}.xls`,
                ),
            },
          ]}
        />
        <PapersIconBtn label={t.undo} onClick={undo} disabled={!canUndo}>
          <IconUndo />
        </PapersIconBtn>
        <PapersIconBtn label={t.redo} onClick={redo} disabled={!canRedo}>
          <IconRedo />
        </PapersIconBtn>
      </PapersDocBar>

      <ErrorBanner>{error}</ErrorBanner>

      <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
        <div className="border-b border-border px-2 py-2">
          <PapersFormatBar
            variant="ribbon"
            value={formatState}
            onChange={(patch) => {
              if (patch.bold !== undefined) toggleStyleFlag("bold");
              else if (patch.italic !== undefined) toggleStyleFlag("italic");
              else if (patch.underline !== undefined)
                toggleStyleFlag("underline");
              else if (patch.align) applyAlign(patch.align);
              else if (patch.color) patchSelectedStyles({ color: patch.color });
              else if (patch.background)
                patchSelectedStyles({ background: patch.background });
              else if (patch.fontFamily)
                patchSelectedStyles({ fontFamily: patch.fontFamily });
              else if (patch.fontSize)
                patchSelectedStyles({ fontSize: patch.fontSize });
            }}
            labels={{
              bold: t.bold,
              italic: t.italic,
              underline: t.underline,
              alignLeft: t.alignLeft,
              alignCenter: t.alignCenter,
              alignRight: t.alignRight,
              textColor: t.textColor,
              fillColor: t.fillColor,
              fontFamily: t.fontFamily,
              fontSearch: t.fontSearch,
              fontSize: t.fontSize,
            }}
            extras={
              <>
                <PapersIconBtn label={t.addRows} onClick={() => addRows()}>
                  <IconRows />
                </PapersIconBtn>
                <PapersIconBtn label={t.addCols} onClick={() => addCols()}>
                  <IconCols />
                </PapersIconBtn>
                <PapersIconBtn
                  label={t.sortAsc}
                  onClick={() => sortByColumn(sel.col, true)}
                >
                  <IconSortAsc />
                </PapersIconBtn>
                <PapersIconBtn
                  label={t.sortDesc}
                  onClick={() => sortByColumn(sel.col, false)}
                >
                  <IconSortDesc />
                </PapersIconBtn>
                <PapersIconBtn label={t.copy} onClick={copySelection}>
                  <IconCopy />
                </PapersIconBtn>
                <PapersIconBtn label={t.clearCells} onClick={clearSelection}>
                  <IconTrash />
                </PapersIconBtn>
                <PapersMenu
                  label={t.sheetTools}
                  variant="compact"
                  items={[
                    {
                      type: "action",
                      id: "paste",
                      label: t.paste,
                      onSelect: pasteSelection,
                    },
                    {
                      type: "action",
                      id: "merge",
                      label: t.merge,
                      onSelect: doMerge,
                    },
                    {
                      type: "action",
                      id: "unmerge",
                      label: t.unmerge,
                      onSelect: doUnmerge,
                    },
                    {
                      type: "action",
                      id: "clear-format",
                      label: t.clearFormat,
                      onSelect: clearFormats,
                    },
                    { type: "sep", id: "sep-modes" },
                    {
                      type: "action",
                      id: "move",
                      label: moveMode ? `${t.moveCells} ✓` : t.moveCells,
                      onSelect: () => setMoveMode((v) => !v),
                    },
                    {
                      type: "action",
                      id: "pan",
                      label: panMode ? `${t.pan} ✓` : t.pan,
                      onSelect: () => {
                        setPanMode((v) => !v);
                        setMoveMode(false);
                      },
                    },
                  ]}
                />
                <KitSelect
                  value={activeStyle.numberFormat ?? "general"}
                  onChange={(e) =>
                    applyNumberFormat(e.target.value as NumberFormat)
                  }
                  className={`${papersCompactBtnClass} min-w-[7rem]`}
                  title={t.numberFormat}
                >
                  <option value="general">{t.formatGeneral}</option>
                  <option value="number">{t.formatNumber}</option>
                  <option value="currency">{t.formatCurrency}</option>
                  <option value="percent">{t.formatPercent}</option>
                </KitSelect>
              </>
            }
          />
        </div>

        <div className="space-y-2 border-b border-border px-2 py-2 sm:space-y-0">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="w-fit rounded-[8px] border border-border bg-background px-2 py-1.5 text-xs font-medium">
              {selectionLabel}
            </span>
            <KitInput
              value={formula}
              onChange={(e) => {
                setFormula(e.target.value);
                setEditing(true);
              }}
              onFocus={() => setEditing(true)}
              onBlur={commitFormula}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitFormula();
                }
              }}
              placeholder={t.formulaPlaceholder}
              className={`${fieldClass} min-w-0 w-full flex-1 sm:min-w-[12rem]`}
            />
          </div>
          <div className="kit-h-scroll w-full gap-2">
            <label className="kit-touch-target inline-flex items-center gap-2 text-sm sm:min-h-0">
              <input
                type="checkbox"
                checked={freezeHeader}
                onChange={(e) => setFreezeHeader(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {t.freezeHeader}
            </label>
            <div className="min-w-[10rem] flex-1">
              <KitInput
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={t.filterPlaceholder}
              />
            </div>
            <span className="shrink-0 text-xs text-muted">
              {savedAt
                ? t.savedAt.replace(
                    "{time}",
                    new Date(savedAt).toLocaleTimeString(),
                  )
                : t.unsaved}
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className={`max-h-[min(62dvh,40rem)] overflow-auto sm:max-h-[min(70dvh,40rem)] ${
            panning ? "cursor-grab active:cursor-grabbing select-none" : ""
          }`}
          onPointerDown={onScrollPointerDown}
          onPointerMove={onScrollPointerMove}
          onPointerUp={onScrollPointerUp}
          onPointerCancel={onScrollPointerUp}
          onAuxClick={(e) => {
            if (e.button === 1) e.preventDefault();
          }}
        >
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="sticky left-0 top-0 z-30 border-b border-r border-border bg-surface px-2 py-1 text-xs text-muted">
                #
              </th>
              {Array.from({ length: doc.cols }, (_, c) => (
                <th
                  key={c}
                  className="sticky top-0 z-20 min-w-[5.5rem] border-b border-r border-border bg-surface px-2 py-1 text-xs font-medium text-muted"
                >
                  {colLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => (
              <tr key={r}>
                <th
                  className={`sticky left-0 z-10 border-b border-r border-border px-2 py-1 text-xs text-muted ${
                    freezeHeader && r === 0 ? "bg-accent-soft" : "bg-surface"
                  }`}
                >
                  {r + 1}
                </th>
                {Array.from({ length: doc.cols }, (_, c) => {
                  const merge = findMergeAt(doc.merges, r, c);
                  if (merge && !isMergeAnchor(merge, r, c)) {
                    return null;
                  }
                  const norm = merge ? normalizeMerge(merge) : null;
                  const rowSpan = norm ? norm.r1 - norm.r0 + 1 : 1;
                  const colSpan = norm ? norm.c1 - norm.c0 + 1 : 1;
                  const active = inRange(r, c, sel, selEnd);
                  const raw = getRaw(doc.cells, r, c);
                  const style = getStyle(doc.styles, r, c);
                  const shown = formatDisplayValue(
                    displayValue(doc.cells, r, c),
                    style,
                    locale,
                  );
                  const isEdit =
                    !panning &&
                    !moveMode &&
                    editing &&
                    sel.row === r &&
                    sel.col === c &&
                    sel.row === selEnd.row &&
                    sel.col === selEnd.col;

                  return (
                    <td
                      key={c}
                      rowSpan={rowSpan > 1 ? rowSpan : undefined}
                      colSpan={colSpan > 1 ? colSpan : undefined}
                      className={`border-b border-r border-border p-0 ${
                        active ? "papers-cell-selected" : ""
                      } ${freezeHeader && r === 0 ? "bg-accent-soft/40" : ""} ${
                        moveMode ? "cursor-pointer" : ""
                      }`}
                      style={styleToCss(style)}
                      onPointerDown={(e) => {
                        if (panning || e.button === 1) return;
                        if (e.button !== 0) return;
                        if (moveMode) {
                          e.preventDefault();
                          moveSelectionTo(r, c);
                          return;
                        }
                        startSelect(r, c, e.shiftKey);
                      }}
                      onPointerEnter={() => {
                        if (!selectingRef.current || panning) return;
                        const m = findMergeAt(doc.merges, r, c);
                        const anchor = m
                          ? {
                              row: normalizeMerge(m).r0,
                              col: normalizeMerge(m).c0,
                            }
                          : { row: r, col: c };
                        setSelEnd(anchor);
                      }}
                      onDoubleClick={() => {
                        if (panning) return;
                        setSel({ row: r, col: c });
                        setSelEnd({ row: r, col: c });
                        setEditing(true);
                      }}
                      onClick={() => {
                        if (panning) return;
                        if (!editing) {
                          setSel((s) => s);
                        }
                      }}
                    >
                      {isEdit ? (
                        <input
                          value={formula}
                          onChange={(e) => setFormula(e.target.value)}
                          onBlur={commitFormula}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitFormula();
                              setSel({
                                row: Math.min(doc.rows - 1, r + 1),
                                col: c,
                              });
                              setSelEnd({
                                row: Math.min(doc.rows - 1, r + 1),
                                col: c,
                              });
                            } else if (e.key === "Escape") {
                              setFormula(getRaw(doc.cells, r, c));
                              setEditing(false);
                            } else if (e.key === "Tab") {
                              e.preventDefault();
                              commitFormula();
                              const nextCol = Math.min(
                                doc.cols - 1,
                                c + (e.shiftKey ? -1 : 1),
                              );
                              setSel({ row: r, col: nextCol });
                              setSelEnd({ row: r, col: nextCol });
                            }
                          }}
                          className="kit-field w-full border-0 bg-background px-2 py-1.5 text-sm outline-none"
                          style={styleToCss(style)}
                          autoFocus
                        />
                      ) : (
                        <div className="min-h-[2.1rem] truncate px-2 py-1.5">
                          {style.numberFormat && style.numberFormat !== "general"
                            ? shown
                            : raw.startsWith("=")
                              ? shown
                              : raw || shown}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          {t.statusBar
            .replace("{cell}", selectionLabel)
            .replace("{filled}", String(filledCells))
            .replace("{rows}", String(doc.rows))
            .replace("{cols}", String(doc.cols))}
          {selStats
            ? ` · ${t.selectionStats
                .replace("{sum}", String(Math.round(selStats.sum * 1000) / 1000))
                .replace("{avg}", String(Math.round(selStats.avg * 1000) / 1000))
                .replace("{count}", String(selStats.count))}`
            : ""}
        </span>
        <span>{t.formulaHelp}</span>
      </div>
    </div>
  );
}
