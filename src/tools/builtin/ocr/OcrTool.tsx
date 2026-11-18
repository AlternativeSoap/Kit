"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
} from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import {
  ErrorBanner,
  Field,
  FileInput,
  KitSelect,
  Segmented,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { CdnLoadError, importFromUrl } from "@/lib/cdnImport";
import { cleanOcrText, prepareOcrImage } from "./preprocess";

type LangId = "dan+eng" | "eng" | "dan";
type LayoutId = "auto" | "block" | "sparse";

type TesseractWorker = {
  recognize: (
    image: Blob | File | string | HTMLCanvasElement,
  ) => Promise<{ data: { text: string; confidence?: number } }>;
  setParameters: (params: Record<string, string>) => Promise<void>;
  terminate: () => Promise<void>;
};

type TesseractMod = {
  createWorker: (
    langs?: string | string[],
    oem?: number,
    opts?: {
      logger?: (m: { progress?: number; status?: string }) => void;
    },
  ) => Promise<TesseractWorker>;
};

const TESSERACT_ESM =
  "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/+esm";

const PSM: Record<LayoutId, string> = {
  auto: "3",
  block: "6",
  sparse: "11",
};

let cachedMod: TesseractMod | null = null;
let cachedWorker: TesseractWorker | null = null;
let cachedLang: string | null = null;

async function getEngine(
  lang: string,
  onProgress: (pct: number, status: string) => void,
): Promise<TesseractWorker> {
  if (!cachedMod) {
    cachedMod = await importFromUrl<TesseractMod>(TESSERACT_ESM);
  }
  if (cachedWorker && cachedLang === lang) {
    return cachedWorker;
  }
  if (cachedWorker) {
    try {
      await cachedWorker.terminate();
    } catch {
      // ignore
    }
    cachedWorker = null;
    cachedLang = null;
  }
  cachedWorker = await cachedMod.createWorker(lang, 1, {
    logger: (m) => {
      if (typeof m.progress === "number") {
        onProgress(Math.round(m.progress * 100), m.status || "");
      }
    },
  });
  cachedLang = lang;
  return cachedWorker;
}

function pickImageFile(list: FileList | File[] | null | undefined): File | null {
  if (!list) return null;
  const files = Array.from(list);
  return files.find((f) => f.type.startsWith("image/")) ?? null;
}

export function OcrTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<LangId>(da ? "dan+eng" : "eng");
  const [layout, setLayout] = useState<LayoutId>("auto");
  const [dragOver, setDragOver] = useState(false);
  const runId = useRef(0);
  const workingRef = useRef(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const assignFile = useCallback((next: File | null) => {
    setFile(next);
    setText("");
    setConfidence(null);
    setError("");
    setProgress(0);
    setStatus("");
  }, []);

  const run = useCallback(async () => {
    if (!file || workingRef.current) return;
    const id = ++runId.current;
    workingRef.current = true;
    setWorking(true);
    setError("");
    setText("");
    setConfidence(null);
    setProgress(0);
    setStatus(da ? "Forbereder billede…" : "Preparing image…");

    try {
      const prepared = await prepareOcrImage(file);
      if (id !== runId.current) return;

      setStatus(da ? "Henter OCR-motor…" : "Loading OCR engine…");
      const worker = await getEngine(lang, (pct, st) => {
        if (id !== runId.current) return;
        setProgress(pct);
        if (st.includes("loading") || st.includes("loaded")) {
          setStatus(
            da ? `Henter sprog… ${pct}%` : `Loading language… ${pct}%`,
          );
        } else if (st.includes("recognizing")) {
          setStatus(da ? `Læser tekst… ${pct}%` : `Reading text… ${pct}%`);
        }
      });
      if (id !== runId.current) return;

      await worker.setParameters({
        tessedit_pageseg_mode: PSM[layout],
        preserve_interword_spaces: "1",
      });

      setStatus(da ? "Læser tekst…" : "Reading text…");
      const result = await worker.recognize(prepared);
      if (id !== runId.current) return;

      const cleaned = cleanOcrText(result.data.text || "");
      const conf =
        typeof result.data.confidence === "number"
          ? Math.round(result.data.confidence)
          : null;
      setText(cleaned);
      setConfidence(conf);
      setProgress(100);
      setStatus("");
      if (!cleaned) {
        setError(
          da
            ? "Ingen tekst fundet. Prøv et skarpere billede, en anden layout-tilstand eller et andet sprog."
            : "No text found. Try a sharper image, another layout mode, or a different language.",
        );
      }
    } catch (err) {
      if (id !== runId.current) return;
      setError(
        err instanceof CdnLoadError
          ? da
            ? "Kunne ikke hente OCR-motoren. Tjek netværket."
            : "Could not load the OCR engine. Check your network."
          : da
            ? "OCR mislykkedes. Prøv et andet billede eller et skarpere foto."
            : "OCR failed. Try a different image or a sharper photo.",
      );
    } finally {
      if (id === runId.current) {
        workingRef.current = false;
        setWorking(false);
      }
    }
  }, [da, file, lang, layout]);

  useEffect(() => {
    if (!file) return;
    void run();
  }, [file, lang, layout, run]);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((it) =>
        it.type.startsWith("image/"),
      );
      const blob = item?.getAsFile();
      if (!blob) return;
      e.preventDefault();
      assignFile(
        new File([blob], "paste.png", {
          type: blob.type || "image/png",
        }),
      );
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [assignFile]);

  function onDrop(e: ReactDragEvent) {
    e.preventDefault();
    setDragOver(false);
    const next = pickImageFile(e.dataTransfer.files);
    if (next) assignFile(next);
  }

  return (
    <div className="kit-tool mx-auto max-w-xl space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        {da
          ? "Læs tekst fra foto eller screenshot. Billedet forberedes lokalt. Slip, indsæt eller vælg et billede, så starter læsningen med det samme."
          : "Extract text from a photo or screenshot. The image is prepared locally. Drop, paste, or choose an image and reading starts right away."}
      </p>

      <div
        ref={dropRef}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!dropRef.current?.contains(e.relatedTarget as Node)) {
            setDragOver(false);
          }
        }}
        onDrop={onDrop}
        className={`kit-dropzone px-4 py-5 ${dragOver ? "is-active" : ""}`}
      >
        <FileInput
          label={da ? "Vælg billede" : "Choose image"}
          accept="image/*"
          onFile={assignFile}
        />
        <p className="mt-2 text-xs text-muted">
          {da
            ? "Træk et billede hertil, eller indsæt det (Ctrl+V / langt tryk)."
            : "Drop an image here, or paste it (Ctrl+V / long-press)."}
        </p>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={da ? "Valgt billede" : "Selected image"}
            className="kit-fade-in mt-4 max-h-52 w-full rounded-[12px] border border-border object-contain bg-overlay"
          />
        ) : null}
        {file ? (
          <p className="mt-2 truncate text-xs text-muted">{file.name}</p>
        ) : null}
      </div>

      <section className="kit-tool-panel space-y-5 p-4 sm:p-5">
        <Field
          label={da ? "Sprog" : "Language"}
          hint={
            da
              ? "Dansk + engelsk er langsommere første gang, men læser begge bedre."
              : "Danish + English is slower the first time, but reads both better."
          }
        >
          <KitSelect
            value={lang}
            onChange={(e) => setLang(e.target.value as LangId)}
            disabled={working}
          >
            <option value="dan+eng">
              {da ? "Dansk + engelsk" : "Danish + English"}
            </option>
            <option value="eng">{da ? "Kun engelsk" : "English only"}</option>
            <option value="dan">{da ? "Kun dansk" : "Danish only"}</option>
          </KitSelect>
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {da ? "Layout" : "Layout"}
          </p>
          <Segmented
            value={layout}
            onChange={setLayout}
            ariaLabel={da ? "OCR-layout" : "OCR layout"}
            options={[
              { id: "auto", label: da ? "Automatisk" : "Auto" },
              { id: "block", label: da ? "Tekstblok" : "Text block" },
              { id: "sparse", label: da ? "Spredt tekst" : "Sparse text" },
            ]}
          />
          <p className="text-xs text-muted">
            {da
              ? "Tekstblok passer til dokumenter og screenshots. Spredt tekst passer til skilte og labels."
              : "Text block suits documents and screenshots. Sparse text suits signs and labels."}
          </p>
        </div>

        <div className="kit-h-scroll">
          <button
            type="button"
            className={primaryBtnClass}
            disabled={!file || working}
            onClick={() => void run()}
          >
            {working
              ? status || (da ? "Læser…" : "Reading…")
              : da
                ? "Læs igen"
                : "Read again"}
          </button>
          <button
            type="button"
            className={secondaryBtnClass}
            disabled={working || (!text && !file && !error)}
            onClick={() => {
              runId.current += 1;
              workingRef.current = false;
              assignFile(null);
              setText("");
              setConfidence(null);
              setError("");
              setWorking(false);
            }}
          >
            {da ? "Ryd" : "Clear"}
          </button>
        </div>

        {working ? (
          <div className="kit-fade-in space-y-2" aria-live="polite">
            <div className="h-1.5 overflow-hidden rounded-full bg-overlay">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <p className="text-xs text-muted">{status}</p>
          </div>
        ) : null}

        <ErrorBanner>{error}</ErrorBanner>

        {text ? (
          <div className="kit-fade-in space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {da ? "Tekst" : "Text"}
              </p>
              {confidence != null ? (
                <p className="text-xs text-muted">
                  {da ? "Sikkerhed" : "Confidence"}: {confidence}%
                </p>
              ) : null}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              spellCheck
              className="kit-field w-full rounded-[12px] border border-border bg-background/70 px-3 py-2.5 text-base leading-relaxed text-foreground transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
            <CopyButton
              value={text}
              label={da ? "Kopiér tekst" : "Copy text"}
              copiedLabel={da ? "Kopieret" : "Copied"}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
