"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { fieldClass, fileInputClass } from "@/components/tools/ui";
import { useDictionary } from "@/i18n/LanguageProvider";

type Mode = "toBase64" | "fromBase64";

export function ImgBase64Tool() {
  const dictionary = useDictionary();
  const t = dictionary.imgbase64Tool;
  const [mode, setMode] = useState<Mode>("toBase64");
  const [dataUrl, setDataUrl] = useState("");
  const [fileName, setFileName] = useState("image");
  const [error, setError] = useState<string | null>(null);

  const previewOk = useMemo(() => {
    if (!dataUrl.startsWith("data:image/")) return false;
    return dataUrl.includes(";base64,");
  }, [dataUrl]);

  async function onPick(file: File | null) {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t.invalidImage);
      return;
    }
    setFileName(file.name.replace(/\.[^.]+$/, "") || "image");
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setDataUrl(result);
    };
    reader.onerror = () => setError(t.processError);
    reader.readAsDataURL(file);
  }

  function downloadFromDataUrl() {
    if (!previewOk) {
      setError(t.invalidDataUrl);
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    const mime = /^data:(image\/[a-z0-9.+-]+);/i.exec(dataUrl)?.[1] ?? "image/png";
    const ext = mime.includes("jpeg") || mime.includes("jpg")
      ? "jpg"
      : mime.includes("webp")
        ? "webp"
        : mime.includes("gif")
          ? "gif"
          : mime.includes("bmp")
            ? "bmp"
            : mime.includes("avif")
              ? "avif"
              : mime.includes("svg")
                ? "svg"
                : mime.includes("icon") || mime.includes("x-icon")
                  ? "ico"
                  : "png";
    a.download = `${fileName || "image"}.${ext}`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="text-sm text-muted">{t.privacy}</p>

      <div className="flex flex-wrap gap-2">
        {(["toBase64", "fromBase64"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setError(null);
            }}
            className={`kit-touch-target rounded-[10px] border px-3 py-2 text-sm sm:min-h-0 ${
              mode === item
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {item === "toBase64" ? t.toBase64 : t.fromBase64}
          </button>
        ))}
      </div>

      {mode === "toBase64" ? (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.pickImage}</span>
          <input
            type="file"
            accept="image/*,.heic,.heif,.avif,.bmp,.gif,.svg,.ico,.webp,.jpg,.jpeg,.png"
            onChange={(event) => void onPick(event.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
        </label>
      ) : (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t.pasteDataUrl}</span>
          <textarea
            value={dataUrl}
            onChange={(event) => {
              const raw = event.target.value.trim().replace(/\s+/g, "");
              if (raw.startsWith("data:image/")) {
                setDataUrl(raw);
              } else if (raw.length > 0) {
                // Accept raw base64 paste and wrap as a PNG data URL.
                setDataUrl(`data:image/png;base64,${raw}`);
              } else {
                setDataUrl("");
              }
              setError(null);
            }}
            rows={6}
            spellCheck={false}
            placeholder="data:image/png;base64,... or raw base64"
            className={`${fieldClass} font-mono`}
          />
        </label>
      )}

      {error ? (
        <p className="rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-foreground">
          {error}
        </p>
      ) : null}

      {dataUrl ? (
        <>
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
              <span>{t.dataUrl}</span>
              <CopyButton value={dataUrl} label={t.copy} copiedLabel={t.copied} />
            </span>
            <textarea
              readOnly={mode === "toBase64"}
              value={dataUrl}
              onChange={(event) => setDataUrl(event.target.value)}
              rows={5}
              spellCheck={false}
              className={`${fieldClass} bg-background font-mono`}
            />
          </label>

          {previewOk ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">{t.preview}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt=""
                className="max-h-64 max-w-full rounded-[10px] border border-border bg-[linear-gradient(45deg,#eee_25%,transparent_25%,transparent_75%,#eee_75%),linear-gradient(45deg,#eee_25%,transparent_25%,transparent_75%,#eee_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]"
              />
              {mode === "fromBase64" ? (
                <button
                  type="button"
                  onClick={downloadFromDataUrl}
                  className="kit-touch-target rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-on-accent sm:min-h-0"
                >
                  {t.download}
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
