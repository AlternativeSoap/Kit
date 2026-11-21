"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FontFamilyInput } from "@/components/tools/FontFamilyInput";
import {
  IconBringForward,
  IconCopy,
  IconPlus,
  IconRedo,
  IconSendBackward,
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
  Field,
  KitInput,
  KitSelect,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useHistory } from "@/hooks/useHistory";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  downloadJsonFile,
  loadPapersDraft,
  newDraftId,
  readJsonFile,
  savePapersDraft,
} from "@/lib/papers/storage";
import { downloadBlob } from "../media/canvas";
import { deckToPdfBytes, slideToPngBlob } from "./exportSlide";
import {
  SLIDE_W,
  THEMES,
  applyTheme,
  emptyDeck,
  emptySlide,
  fitImageToSlide,
  nextBlockId,
  placeImageInBlock,
  type BlockEntrance,
  type ImageFit,
  type SlideBlock,
  type SlideTransition,
  type SlidesDoc,
} from "./slides";
import {
  BLOCK_ENTRANCES,
  SLIDE_TRANSITIONS,
  blockEntranceClass,
  imageFitClass,
  slideTransitionClass,
} from "./transitions";
import {
  SLIDE_LAYOUTS,
  STARTER_DECKS,
  buildLayoutSlide,
  buildStarterDeck,
  type SlideLayoutId,
  type StarterDeckId,
} from "./templates";

type DragState = {
  blockId: string;
  mode: "move" | "resize";
  startX: number;
  startY: number;
  orig: SlideBlock;
  moved: boolean;
};

export function DiasTool() {
  const { dictionary, locale } = useLanguage();
  const t = dictionary.diasTool;
  const {
    present: doc,
    setPresent: setDoc,
    mutate,
    markGestureStart,
    markGestureEnd,
    replace: replaceDoc,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<SlidesDoc>(emptyDeck(t.untitled, locale));
  const [draftId, setDraftId] = useState(() => newDraftId("dias"));
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [presentTick, setPresentTick] = useState(0);
  const [exporting, setExporting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const presentRootRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);
  const metaRef = useRef({
    slideIndex,
    selectedId,
    presenting,
    doc,
  });
  metaRef.current = { slideIndex, selectedId, presenting, doc };

  const slide = doc.slides[slideIndex] ?? doc.slides[0]!;
  const selected = slide.blocks.find((b) => b.id === selectedId) ?? null;

  function isTextBlock(block: SlideBlock) {
    return block.kind === "title" || block.kind === "body";
  }

  function selectBlock(id: string, startEdit = false) {
    setSelectedId(id);
    const block = metaRef.current.doc.slides[metaRef.current.slideIndex]?.blocks.find(
      (b) => b.id === id,
    );
    if (startEdit && block && isTextBlock(block)) {
      setEditingId(id);
    } else {
      setEditingId(null);
    }
  }

  useEffect(() => {
    if (!editingId) return;
    const node = editRef.current;
    if (!node) return;
    node.focus();
    const len = node.value.length;
    node.setSelectionRange(len, len);
  }, [editingId]);

  useEffect(() => {
    void (async () => {
      const existing = await loadPapersDraft<SlidesDoc>(draftId);
      if (existing?.payload?.kind === "dias") {
        replaceDoc(existing.payload);
        setSavedAt(existing.meta.updatedAt);
        setSelectedId(existing.payload.slides[0]?.blocks[0]?.id ?? null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    async (next: SlidesDoc, id = draftId) => {
      try {
        await savePapersDraft("dias", id, next.title || t.untitled, next);
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

  function updateSlide(
    mutator: (s: (typeof doc.slides)[number]) => (typeof doc.slides)[number],
    live = false,
  ) {
    const apply = live ? mutate : setDoc;
    apply((prev) => {
      const idx = metaRef.current.slideIndex;
      const slides = prev.slides.map((s, i) => (i === idx ? mutator(s) : s));
      return { ...prev, slides };
    });
  }

  function updateBlock(
    id: string,
    patch: Partial<SlideBlock>,
    live = false,
  ) {
    updateSlide(
      (s) => ({
        ...s,
        blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }),
      live,
    );
  }

  function addSlide() {
    setDoc((prev) => {
      const slides = [...prev.slides];
      slides.splice(slideIndex + 1, 0, emptySlide(slide.background, locale));
      return { ...prev, slides };
    });
    setSlideIndex((i) => i + 1);
  }

  function insertLayout(layoutId: SlideLayoutId) {
    const built = buildLayoutSlide(layoutId, locale, slide.background);
    setDoc((prev) => {
      const slides = [...prev.slides];
      slides.splice(metaRef.current.slideIndex + 1, 0, built);
      return { ...prev, slides };
    });
    setSlideIndex((i) => i + 1);
    setSelectedId(built.blocks.find((b) => b.kind === "title")?.id ?? built.blocks[0]?.id ?? null);
  }

  function openStarter(deckId: StarterDeckId) {
    const id = newDraftId("dias");
    const next = buildStarterDeck(deckId, locale);
    setDraftId(id);
    replaceDoc(next);
    setSlideIndex(0);
    setSelectedId(next.slides[0]?.blocks[0]?.id ?? null);
    void persist(next, id);
  }

  function duplicateSlide() {
    setDoc((prev) => {
      const copy = structuredClone(prev.slides[slideIndex]!);
      copy.id = `s-${Date.now().toString(36)}`;
      copy.blocks = copy.blocks.map((b) => ({ ...b, id: nextBlockId() }));
      const slides = [...prev.slides];
      slides.splice(slideIndex + 1, 0, copy);
      return { ...prev, slides };
    });
    setSlideIndex((i) => i + 1);
  }

  function deleteSlide() {
    if (doc.slides.length <= 1) return;
    setDoc((prev) => {
      const slides = prev.slides.filter((_, i) => i !== slideIndex);
      return { ...prev, slides };
    });
    setSlideIndex((i) => Math.max(0, Math.min(i, doc.slides.length - 2)));
    setSelectedId(null);
    setEditingId(null);
  }

  function addTextBlock(kind: "title" | "body") {
    const block: SlideBlock = {
      id: nextBlockId(),
      kind,
      x: 10,
      y: kind === "title" ? 20 : 45,
      w: 80,
      h: kind === "title" ? 16 : 30,
      text: kind === "title" ? t.defaultTitle : t.defaultBody,
      fontFamily: kind === "title" ? "Georgia, serif" : "system-ui, sans-serif",
      fontSize: kind === "title" ? 40 : 22,
      color: "#111111",
      align: "left",
      entrance: kind === "title" ? "slideUp" : "fade",
      z: slide.blocks.length + 1,
    };
    updateSlide((s) => ({ ...s, blocks: [...s.blocks, block] }));
    selectBlock(block.id, true);
  }

  function addShape() {
    const block: SlideBlock = {
      id: nextBlockId(),
      kind: "shape",
      x: 20,
      y: 25,
      w: 30,
      h: 30,
      fill: "#94a3b8",
      fontFamily: "system-ui, sans-serif",
      fontSize: 16,
      color: "#111111",
      align: "center",
      z: slide.blocks.length + 1,
    };
    updateSlide((s) => ({ ...s, blocks: [...s.blocks, block] }));
    selectBlock(block.id, false);
  }

  function readImageFile(file: File | null): Promise<string | null> {
    if (!file) return Promise.resolve(null);
    if (!file.type.startsWith("image/")) {
      setError(t.invalidImage);
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => {
        setError(t.invalidImage);
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }

  /** Insert into the selected box when possible; otherwise add a new image block. */
  async function addImage(file: File | null, forceNew = false) {
    const dataUrl = await readImageFile(file);
    if (!dataUrl) return;
    const targetId = forceNew ? null : metaRef.current.selectedId;
    const current = metaRef.current.doc.slides[metaRef.current.slideIndex];
    const target = targetId
      ? current?.blocks.find((b) => b.id === targetId)
      : undefined;

    if (target && target.kind !== "image") {
      updateBlock(
        target.id,
        placeImageInBlock(target, dataUrl, "cover"),
      );
      selectBlock(target.id, false);
      return;
    }
    if (target?.kind === "image") {
      updateBlock(target.id, {
        imageDataUrl: dataUrl,
        imageFit: target.imageFit ?? "cover",
      });
      return;
    }

    const block: SlideBlock = {
      id: nextBlockId(),
      kind: "image",
      x: 15,
      y: 20,
      w: 40,
      h: 45,
      imageDataUrl: dataUrl,
      imageFit: "contain",
      entrance: "fade",
      fontFamily: "system-ui, sans-serif",
      fontSize: 16,
      color: "#111111",
      align: "center",
      z: (current?.blocks.length ?? 0) + 1,
    };
    updateSlide((s) => ({ ...s, blocks: [...s.blocks, block] }));
    selectBlock(block.id, false);
  }

  async function insertImageInSelectedBox(file: File | null) {
    const id = metaRef.current.selectedId;
    if (!id) return;
    const dataUrl = await readImageFile(file);
    if (!dataUrl) return;
    const current = metaRef.current.doc.slides[metaRef.current.slideIndex];
    const target = current?.blocks.find((b) => b.id === id);
    if (!target) return;
    if (target.kind === "image") {
      updateBlock(id, {
        imageDataUrl: dataUrl,
        imageFit: target.imageFit ?? "cover",
      });
      return;
    }
    updateBlock(id, placeImageInBlock(target, dataUrl, "cover"));
    selectBlock(id, false);
  }

  function deleteBlock() {
    const id = metaRef.current.selectedId;
    if (!id) return;
    updateSlide((s) => ({
      ...s,
      blocks: s.blocks.filter((b) => b.id !== id),
    }));
    setSelectedId(null);
    setEditingId(null);
  }

  function duplicateBlock() {
    const id = metaRef.current.selectedId;
    if (!id) return;
    const current = metaRef.current.doc.slides[metaRef.current.slideIndex];
    const block = current?.blocks.find((b) => b.id === id);
    if (!block) return;
    const copy: SlideBlock = {
      ...structuredClone(block),
      id: nextBlockId(),
      x: Math.min(90, block.x + 3),
      y: Math.min(90, block.y + 3),
      z: (current?.blocks.length ?? 0) + 1,
    };
    updateSlide((s) => ({ ...s, blocks: [...s.blocks, copy] }));
    selectBlock(copy.id, isTextBlock(copy));
  }

  function nudgeBlock(dx: number, dy: number) {
    const id = metaRef.current.selectedId;
    if (!id) return;
    updateSlide((s) => ({
      ...s,
      blocks: s.blocks.map((b) =>
        b.id === id
          ? {
              ...b,
              x: Math.min(95, Math.max(0, b.x + dx)),
              y: Math.min(95, Math.max(0, b.y + dy)),
            }
          : b,
      ),
    }));
  }

  function shiftZ(delta: number) {
    const id = metaRef.current.selectedId;
    if (!id) return;
    updateSlide((s) => {
      const blocks = [...s.blocks].sort((a, b) => a.z - b.z);
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx < 0) return s;
      const swapWith = idx + delta;
      if (swapWith < 0 || swapWith >= blocks.length) return s;
      const a = blocks[idx]!;
      const b = blocks[swapWith]!;
      const az = a.z;
      blocks[idx] = { ...a, z: b.z };
      blocks[swapWith] = { ...b, z: az };
      return { ...s, blocks };
    });
  }

  async function exportPng() {
    const current = metaRef.current.doc.slides[metaRef.current.slideIndex];
    if (!current) return;
    setExporting(true);
    try {
      const blob = await slideToPngBlob(current);
      downloadBlob(
        blob,
        `${(doc.title || "slide").replace(/[^\w\-]+/g, "_")}-${metaRef.current.slideIndex + 1}.png`,
      );
    } catch {
      setError(t.saveError);
    } finally {
      setExporting(false);
    }
  }

  async function exportPdf() {
    setExporting(true);
    try {
      const bytes = await deckToPdfBytes(metaRef.current.doc);
      downloadBlob(
        new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
          type: "application/pdf",
        }),
        `${(doc.title || "slides").replace(/[^\w\-]+/g, "_")}.pdf`,
      );
    } catch {
      setError(t.saveError);
    } finally {
      setExporting(false);
    }
  }

  function onPointerDown(
    e: ReactPointerEvent,
    block: SlideBlock,
    mode: "move" | "resize",
  ) {
    e.stopPropagation();
    setSelectedId(block.id);
    if (mode === "move" && isTextBlock(block) && editingId === block.id) {
      /* Keep typing; move via the drag grip instead. */
      return;
    }
    setEditingId(null);
    markGestureStart();
    dragRef.current = {
      blockId: block.id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      orig: { ...block },
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent) {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || !stage) return;
    const rect = stage.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.startY) / rect.height) * 100;
    if (Math.abs(dx) + Math.abs(dy) > 0.35) {
      drag.moved = true;
    }
    if (drag.mode === "move") {
      updateBlock(
        drag.blockId,
        {
          x: Math.min(95, Math.max(0, drag.orig.x + dx)),
          y: Math.min(95, Math.max(0, drag.orig.y + dy)),
        },
        true,
      );
    } else {
      updateBlock(
        drag.blockId,
        {
          w: Math.min(100 - drag.orig.x, Math.max(8, drag.orig.w + dx)),
          h: Math.min(100 - drag.orig.y, Math.max(6, drag.orig.h + dy)),
        },
        true,
      );
    }
  }

  function onPointerUp() {
    const drag = dragRef.current;
    if (drag) {
      if (drag.moved) suppressClickRef.current = true;
      markGestureEnd();
    }
    dragRef.current = null;
  }

  async function onOpenFile(file: File | null) {
    if (!file) return;
    try {
      const parsed = await readJsonFile<SlidesDoc>(file);
      if (parsed?.kind !== "dias" || !Array.isArray(parsed.slides)) {
        setError(t.invalidFile);
        return;
      }
      const id = newDraftId("dias");
      const next = {
        ...emptyDeck(t.untitled, locale),
        ...parsed,
        kind: "dias" as const,
      };
      setDraftId(id);
      replaceDoc(next);
      setSlideIndex(0);
      setSelectedId(parsed.slides[0]?.blocks[0]?.id ?? null);
      await persist(next, id);
    } catch {
      setError(t.invalidFile);
    }
  }

  function newDeck() {
    const id = newDraftId("dias");
    const next = emptyDeck(t.untitled, locale);
    setDraftId(id);
    replaceDoc(next);
    setSlideIndex(0);
    setSelectedId(next.slides[0]?.blocks[0]?.id ?? null);
    void persist(next, id);
  }

  function goPresentSlide(nextIndex: number) {
    setSlideIndex(nextIndex);
    setPresentTick((n) => n + 1);
  }

  async function startPresent() {
    setPresenting(true);
    setPresentTick((n) => n + 1);
    window.setTimeout(() => {
      void presentRootRef.current?.requestFullscreen?.().catch(() => {
        /* fullscreen may be blocked; overlay still works */
      });
    }, 30);
  }

  async function exitPresent() {
    setPresenting(false);
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
  }

  const sortedBlocks = useMemo(
    () => [...slide.blocks].sort((a, b) => a.z - b.z),
    [slide.blocks],
  );

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && metaRef.current.presenting) {
        setPresenting(false);
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const inField =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const { presenting: isPresenting, selectedId: sid } = metaRef.current;
      const mod = e.ctrlKey || e.metaKey;

      if (isPresenting) {
        if (e.key === "Escape") {
          e.preventDefault();
          void exitPresent();
        }
        if (e.key === "ArrowRight" || e.key === " ") {
          e.preventDefault();
          goPresentSlide(
            Math.min(metaRef.current.doc.slides.length - 1, metaRef.current.slideIndex + 1),
          );
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goPresentSlide(Math.max(0, metaRef.current.slideIndex - 1));
        }
        return;
      }

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey && !inField) {
        e.preventDefault();
        undo();
        return;
      }
      if (
        mod &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey)) &&
        !inField
      ) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "d" && !inField) {
        e.preventDefault();
        duplicateBlock();
        return;
      }
      if (inField) return;
      if ((e.key === "Delete" || e.key === "Backspace") && sid) {
        e.preventDefault();
        deleteBlock();
        return;
      }
      if (sid && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        if (e.key === "ArrowLeft") nudgeBlock(-step, 0);
        if (e.key === "ArrowRight") nudgeBlock(step, 0);
        if (e.key === "ArrowUp") nudgeBlock(0, -step);
        if (e.key === "ArrowDown") nudgeBlock(0, step);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo]);

  return (
    <div className="papers-surface mx-auto w-full max-w-[min(100%,92rem)] space-y-3 sm:space-y-4">
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
              accept: ".kitslides,.json",
              onFile: (f) => void onOpenFile(f),
            },
            {
              type: "action",
              id: "new",
              label: t.newDeck,
              onSelect: newDeck,
            },
            {
              type: "action",
              id: "save",
              label: t.saveFile,
              onSelect: () =>
                downloadJsonFile(
                  `${(doc.title || "slides").replace(/[^\w\-]+/g, "_")}.kitslides`,
                  doc,
                ),
            },
            { type: "sep", id: "sep-export" },
            {
              type: "action",
              id: "png",
              label: t.exportPng,
              onSelect: () => void exportPng(),
              disabled: exporting,
            },
            {
              type: "action",
              id: "pdf",
              label: t.exportPdf,
              onSelect: () => void exportPdf(),
              disabled: exporting,
            },
            { type: "sep", id: "sep-ideas" },
            ...STARTER_DECKS.map((id) => ({
              type: "action" as const,
              id: `starter-${id}`,
              label: String(t[`starter_${id}` as keyof typeof t] ?? id),
              onSelect: () => openStarter(id),
            })),
          ]}
        />
        <PapersIconBtn label={t.undo} onClick={undo} disabled={!canUndo}>
          <IconUndo />
        </PapersIconBtn>
        <PapersIconBtn label={t.redo} onClick={redo} disabled={!canRedo}>
          <IconRedo />
        </PapersIconBtn>
        <button
          type="button"
          className={primaryBtnClass}
          onClick={() => void startPresent()}
        >
          {t.play}
        </button>
      </PapersDocBar>

      <ErrorBanner>{error}</ErrorBanner>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[6.5rem_minmax(0,1fr)_15rem] lg:items-stretch">
        <div className="order-2 flex flex-col gap-2 lg:order-1 lg:max-h-[min(70dvh,42rem)]">
          <div className="flex items-center gap-1 lg:flex-col lg:items-stretch">
            <PapersIconBtn label={t.addSlide} onClick={addSlide}>
              <IconPlus />
            </PapersIconBtn>
            <PapersIconBtn label={t.duplicateSlide} onClick={duplicateSlide}>
              <IconCopy />
            </PapersIconBtn>
            <PapersIconBtn
              label={t.deleteSlide}
              onClick={deleteSlide}
              disabled={doc.slides.length <= 1}
            >
              <IconTrash />
            </PapersIconBtn>
          </div>
          <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0 lg:[scrollbar-width:thin]">
            {doc.slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSlideIndex(i);
                  setSelectedId(s.blocks[0]?.id ?? null);
                  setEditingId(null);
                }}
                className={`w-[5.25rem] shrink-0 rounded-[8px] border p-1 text-left lg:w-full ${
                  i === slideIndex ? "border-accent" : "border-border"
                }`}
              >
                <div
                  className="aspect-video w-full rounded-[4px] border border-border"
                  style={{ background: s.background }}
                />
                <span className="mt-1 block text-[11px] text-muted">{i + 1}</span>
              </button>
            ))}
          </div>
          <PapersMenu
            label={t.layoutPick.replace("…", "").replace("...", "")}
            variant="compact"
            items={SLIDE_LAYOUTS.map((layout) => ({
              type: "action" as const,
              id: layout.id,
              label: String(t[`layout_${layout.id}` as keyof typeof t] ?? layout.id),
              onSelect: () => insertLayout(layout.id),
            }))}
          />
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-2 lg:order-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <PapersMenu
              label={t.insertMenu}
              variant="compact"
              items={[
                {
                  type: "action",
                  id: "title",
                  label: t.addTitle,
                  onSelect: () => addTextBlock("title"),
                },
                {
                  type: "action",
                  id: "body",
                  label: t.addBody,
                  onSelect: () => addTextBlock("body"),
                },
                {
                  type: "action",
                  id: "shape",
                  label: t.addShape,
                  onSelect: addShape,
                },
                {
                  type: "file",
                  id: "image",
                  label: t.addImage,
                  accept: "image/*",
                  onFile: (f) => void addImage(f, true),
                },
                ...(selected && selected.kind !== "image"
                  ? [
                      {
                        type: "file" as const,
                        id: "image-in-box",
                        label: t.insertImageInBox,
                        accept: "image/*",
                        onFile: (f: File | null) =>
                          void insertImageInSelectedBox(f),
                      },
                    ]
                  : []),
                ...(selected?.kind === "image"
                  ? [
                      {
                        type: "file" as const,
                        id: "replace-image",
                        label: t.replaceImage,
                        accept: "image/*",
                        onFile: (f: File | null) =>
                          void insertImageInSelectedBox(f),
                      },
                    ]
                  : []),
              ]}
            />
            <PapersIconBtn
              label={t.duplicateBlock}
              onClick={duplicateBlock}
              disabled={!selectedId}
            >
              <IconCopy />
            </PapersIconBtn>
            <PapersIconBtn
              label={t.bringForward}
              onClick={() => shiftZ(1)}
              disabled={!selectedId}
            >
              <IconBringForward />
            </PapersIconBtn>
            <PapersIconBtn
              label={t.sendBackward}
              onClick={() => shiftZ(-1)}
              disabled={!selectedId}
            >
              <IconSendBackward />
            </PapersIconBtn>
            <PapersIconBtn
              label={t.deleteBlock}
              onClick={deleteBlock}
              disabled={!selectedId}
            >
              <IconTrash />
            </PapersIconBtn>
            <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" aria-hidden />
            <KitSelect
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                updateSlide((s) => applyTheme(s, id));
                e.target.value = "";
              }}
              className={`${papersCompactBtnClass} min-w-[7rem]`}
            >
              <option value="">{t.themePick}</option>
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {t[`theme_${theme.id}` as keyof typeof t] ?? theme.id}
                </option>
              ))}
            </KitSelect>
            <KitSelect
              value={slide.transition ?? "fade"}
              onChange={(e) =>
                updateSlide((s) => ({
                  ...s,
                  transition: e.target.value as SlideTransition,
                }))
              }
              className={`${papersCompactBtnClass} min-w-[7.5rem]`}
              title={t.slideTransition}
            >
              {SLIDE_TRANSITIONS.map((tr) => (
                <option key={tr} value={tr}>
                  {t[`transition_${tr}` as keyof typeof t] ?? tr}
                </option>
              ))}
            </KitSelect>
            <span className="text-xs text-muted">
              {t.slideOf
                .replace("{current}", String(slideIndex + 1))
                .replace("{total}", String(doc.slides.length))}
              {savedAt
                ? ` · ${t.savedAt.replace("{time}", new Date(savedAt).toLocaleTimeString())}`
                : ""}
            </span>
          </div>

          <PapersFormatBar
            variant="ribbon"
            value={
              {
                bold: !!selected?.bold,
                italic: !!selected?.italic,
                underline: !!selected?.underline,
                align: selected?.align ?? "left",
                color: selected?.color ?? "#111111",
                background: selected?.fill ?? "#ffffff",
                fontFamily:
                  selected?.fontFamily ??
                  "Calibri, 'Segoe UI', system-ui, sans-serif",
                fontSize: selected?.fontSize ?? 22,
              } satisfies PapersFormatState
            }
            onChange={(patch) => {
              if (!selected) return;
              updateBlock(selected.id, {
                bold: patch.bold ?? selected.bold,
                italic: patch.italic ?? selected.italic,
                underline: patch.underline ?? selected.underline,
                align: patch.align ?? selected.align,
                color: patch.color ?? selected.color,
                fontFamily: patch.fontFamily ?? selected.fontFamily,
                fontSize: patch.fontSize ?? selected.fontSize,
                fill:
                  selected.kind === "shape"
                    ? patch.background ?? selected.fill
                    : selected.fill,
              });
            }}
            labels={{
              bold: t.bold,
              italic: t.italic,
              underline: t.underline,
              alignLeft: t.alignLeft,
              alignCenter: t.alignCenter,
              alignRight: t.alignRight,
              textColor: t.color,
              fillColor: t.fill,
              fontFamily: t.fontFamily,
              fontSearch: t.fontSearch,
              fontSize: t.fontSize,
            }}
          />

          <div
            ref={stageRef}
            className="dias-stage relative aspect-video w-full min-h-[min(40vh,18rem)] overflow-hidden rounded-[12px] border border-border shadow-sm sm:min-h-[min(52vh,28rem)] lg:min-h-[min(68vh,36rem)]"
            style={{ background: slide.background }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onClick={() => {
              setSelectedId(null);
              setEditingId(null);
            }}
          >
          {sortedBlocks.map((block) => {
            const textBlock = isTextBlock(block);
            const editing = editingId === block.id && textBlock;
            return (
            <div
              key={block.id}
              className={`absolute overflow-hidden ${
                selectedId === block.id ? "papers-block-selected" : ""
              }`}
              style={{
                left: `${block.x}%`,
                top: `${block.y}%`,
                width: `${block.w}%`,
                height: `${block.h}%`,
                zIndex: block.z,
                background:
                  block.kind === "shape" ? block.fill ?? "#94a3b8" : "transparent",
                color: block.color,
                fontFamily: block.fontFamily,
                fontSize: `${(block.fontSize / SLIDE_W) * 100}cqw`,
                fontWeight: block.bold ? 700 : 400,
                fontStyle: block.italic ? "italic" : "normal",
                textDecoration: block.underline ? "underline" : "none",
                textAlign: block.align,
                cursor: editing ? "text" : "move",
              }}
              onPointerDown={(e) => {
                if (textBlock && editing) {
                  e.stopPropagation();
                  return;
                }
                onPointerDown(e, block, "move");
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (suppressClickRef.current) {
                  suppressClickRef.current = false;
                }
                selectBlock(block.id, false);
              }}
              onDoubleClick={(e) => {
                if (!textBlock) return;
                e.stopPropagation();
                suppressClickRef.current = false;
                selectBlock(block.id, true);
              }}
            >
              {block.kind === "image" && block.imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={block.imageDataUrl}
                  alt=""
                  className={`pointer-events-none h-full w-full object-center ${imageFitClass(block.imageFit)}`}
                  draggable={false}
                />
              ) : textBlock ? (
                editing ? (
                  <textarea
                    ref={editRef}
                    value={block.text ?? ""}
                    rows={3}
                    className="dias-inline-edit h-full w-full resize-none border-0 bg-transparent p-[4%] leading-snug outline-none"
                    style={{
                      color: block.color,
                      fontFamily: block.fontFamily,
                      fontWeight: block.bold ? 700 : 400,
                      fontStyle: block.italic ? "italic" : "normal",
                      textDecoration: block.underline ? "underline" : "none",
                      textAlign: block.align,
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      updateBlock(block.id, { text: e.target.value }, true);
                    }}
                    onFocus={() => markGestureStart()}
                    onBlur={() => {
                      markGestureEnd();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        setEditingId(null);
                        (e.target as HTMLTextAreaElement).blur();
                      }
                      e.stopPropagation();
                    }}
                  />
                ) : (
                  <div className="h-full w-full whitespace-pre-wrap p-[4%] leading-snug">
                    {block.text}
                  </div>
                )
              ) : null}
              {selectedId === block.id ? (
                <>
                  {textBlock ? (
                    <span
                      className="absolute left-1/2 top-0 z-10 h-4 w-11 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full bg-accent sm:h-2.5 sm:w-8"
                      title={t.moveHint}
                      onPointerDown={(e) => {
                        setEditingId(null);
                        onPointerDown(e, block, "move");
                      }}
                    />
                  ) : null}
                  <span
                    className="absolute bottom-0 right-0 z-10 h-5 w-5 cursor-se-resize bg-accent sm:h-3 sm:w-3"
                    onPointerDown={(e) => onPointerDown(e, block, "resize")}
                  />
                </>
              ) : null}
            </div>
            );
          })}
          </div>
        </div>

        <div className="order-3 space-y-3 rounded-[12px] border border-border bg-surface p-3 lg:max-h-[min(70dvh,42rem)] lg:overflow-y-auto">
          <h2 className="text-sm font-medium">{t.inspector}</h2>
          {!selected ? (
            <p className="text-xs text-muted">{t.noSelection}</p>
          ) : (
            <>
              <Field label={t.blockEntrance}>
                <KitSelect
                  value={selected.entrance ?? "none"}
                  onChange={(e) =>
                    updateBlock(selected.id, {
                      entrance: e.target.value as BlockEntrance,
                    })
                  }
                >
                  {BLOCK_ENTRANCES.map((en) => (
                    <option key={en} value={en}>
                      {t[`entrance_${en}` as keyof typeof t] ?? en}
                    </option>
                  ))}
                </KitSelect>
              </Field>
              {selected.kind === "image" ? (
                <>
                  <p className="text-xs text-muted">{t.imageInBoxHint}</p>
                  <Field label={t.imageFit}>
                    <KitSelect
                      value={selected.imageFit ?? "cover"}
                      onChange={(e) =>
                        updateBlock(selected.id, {
                          imageFit: e.target.value as ImageFit,
                        })
                      }
                    >
                      <option value="contain">{t.imageFitContain}</option>
                      <option value="cover">{t.imageFitCover}</option>
                      <option value="fill">{t.imageFitFill}</option>
                    </KitSelect>
                  </Field>
                  <label className={`${secondaryBtnClass} w-full cursor-pointer text-center`}>
                    {t.replaceImage}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        void insertImageInSelectedBox(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className={`${secondaryBtnClass} w-full`}
                    onClick={() =>
                      updateBlock(selected.id, fitImageToSlide(selected))
                    }
                  >
                    {t.fitImage}
                  </button>
                </>
              ) : null}
              {(selected.kind === "title" ||
                selected.kind === "body" ||
                selected.kind === "shape") && (
                <>
                  <p className="text-xs text-muted">{t.imageInBoxHint}</p>
                  <label className={`${secondaryBtnClass} w-full cursor-pointer text-center`}>
                    {t.insertImageInBox}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        void insertImageInSelectedBox(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </>
              )}
              {(selected.kind === "title" || selected.kind === "body") && (
                <>
                  <Field label={t.fontFamily}>
                    <FontFamilyInput
                      value={selected.fontFamily}
                      onChange={(fontFamily) =>
                        updateBlock(selected.id, { fontFamily })
                      }
                      title={t.fontFamily}
                      placeholder={t.fontSearch}
                    />
                  </Field>
                  <Field label={t.fontSize}>
                    <KitInput
                      type="number"
                      min={10}
                      max={96}
                      value={selected.fontSize}
                      onChange={(e) =>
                        updateBlock(selected.id, {
                          fontSize: Number(e.target.value) || 16,
                        })
                      }
                    />
                  </Field>
                  <Field label={t.color}>
                    <input
                      type="color"
                      value={selected.color}
                      onChange={(e) =>
                        updateBlock(selected.id, { color: e.target.value })
                      }
                      className="h-10 w-full cursor-pointer rounded-[8px] border border-border"
                    />
                  </Field>
                  <Field label={t.align}>
                    <KitSelect
                      value={selected.align}
                      onChange={(e) =>
                        updateBlock(selected.id, {
                          align: e.target.value as SlideBlock["align"],
                        })
                      }
                    >
                      <option value="left">{t.alignLeft}</option>
                      <option value="center">{t.alignCenter}</option>
                      <option value="right">{t.alignRight}</option>
                    </KitSelect>
                  </Field>
                </>
              )}
              {selected.kind === "shape" ? (
                <Field label={t.fill}>
                  <input
                    type="color"
                    value={selected.fill ?? "#94a3b8"}
                    onChange={(e) =>
                      updateBlock(selected.id, { fill: e.target.value })
                    }
                    className="h-10 w-full cursor-pointer rounded-[8px] border border-border"
                  />
                </Field>
              ) : null}
            </>
          )}
        </div>
      </div>

      {presenting ? (
        <div
          ref={presentRootRef}
          className="dias-present-root fixed inset-0 z-50 flex flex-col bg-black pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-on-accent">
            <span>
              {t.slideOf
                .replace("{current}", String(slideIndex + 1))
                .replace("{total}", String(doc.slides.length))}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="kit-touch-target rounded-[8px] border border-white/30 px-3 py-1.5 disabled:opacity-40"
                disabled={slideIndex <= 0}
                onClick={() => goPresentSlide(Math.max(0, slideIndex - 1))}
              >
                ←
              </button>
              <button
                type="button"
                className="kit-touch-target rounded-[8px] border border-white/30 px-3 py-1.5 disabled:opacity-40"
                disabled={slideIndex >= doc.slides.length - 1}
                onClick={() =>
                  goPresentSlide(
                    Math.min(doc.slides.length - 1, slideIndex + 1),
                  )
                }
              >
                →
              </button>
              <button
                type="button"
                className="kit-touch-target rounded-[8px] border border-white/30 px-3 py-1.5"
                onClick={() => void exitPresent()}
              >
                {t.exitPresent}
              </button>
            </div>
          </div>
          <div className="relative mx-auto flex w-full flex-1 items-center justify-center px-2 pb-2">
            <div
              key={`${slide.id}-${presentTick}`}
              className={`dias-present-slide relative aspect-video h-auto max-h-full w-full max-w-[min(100%,calc((100dvh-5.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))*16/9))] overflow-hidden ${slideTransitionClass(slide.transition)}`}
              style={{ background: slide.background }}
            >
              {sortedBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`absolute overflow-hidden ${blockEntranceClass(block.entrance)}`}
                  style={{
                    left: `${block.x}%`,
                    top: `${block.y}%`,
                    width: `${block.w}%`,
                    height: `${block.h}%`,
                    zIndex: block.z,
                    background:
                      block.kind === "shape"
                        ? block.fill ?? "#94a3b8"
                        : "transparent",
                    color: block.color,
                    fontFamily: block.fontFamily,
                    fontSize: `${(block.fontSize / SLIDE_W) * 100}cqw`,
                    fontWeight: block.bold ? 700 : 400,
                    fontStyle: block.italic ? "italic" : "normal",
                    textDecoration: block.underline ? "underline" : "none",
                    textAlign: block.align,
                    animationDelay:
                      block.entrance && block.entrance !== "none"
                        ? `${index * 90}ms`
                        : undefined,
                  }}
                >
                  {block.kind === "image" && block.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={block.imageDataUrl}
                      alt=""
                      className={`h-full w-full object-center ${imageFitClass(block.imageFit)}`}
                    />
                  ) : block.kind !== "shape" ? (
                    <div className="h-full w-full whitespace-pre-wrap p-[4%] leading-snug">
                      {block.text}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <p className="pb-3 text-center text-xs text-on-accent/70">{t.presentHint}</p>
        </div>
      ) : null}
    </div>
  );
}
