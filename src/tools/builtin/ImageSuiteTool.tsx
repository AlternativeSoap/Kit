"use client";

import { useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AnnotateTool } from "./annotate/AnnotateTool";
import { ExifStripTool } from "./exifstrip/ExifStripTool";
import { ImageTool, type ImageToolMode } from "./media/ImageTool";

type ImageTab = ImageToolMode | "annotate" | "exifstrip";

export function ImageSuiteTool({
  initial = "compress",
}: {
  initial?: string;
}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const start = (
    [
      "crop",
      "resize",
      "compress",
      "convert",
      "rotate",
      "annotate",
      "exifstrip",
    ] as string[]
  ).includes(initial)
    ? (initial as ImageTab)
    : "compress";
  const [tab, setTab] = useState<ImageTab>(start);

  const options: { id: ImageTab; label: string }[] = [
    { id: "crop", label: da ? "Beskær" : "Crop" },
    { id: "resize", label: da ? "Størrelse" : "Resize" },
    { id: "compress", label: da ? "Komprimér" : "Compress" },
    { id: "convert", label: da ? "Konvertér" : "Convert" },
    { id: "rotate", label: da ? "Rotér" : "Rotate" },
    { id: "annotate", label: da ? "Annotér" : "Annotate" },
    { id: "exifstrip", label: da ? "Metadata" : "Metadata" },
  ];

  const imageMode =
    tab === "annotate" || tab === "exifstrip" ? null : (tab as ImageToolMode);

  return (
    <div className="space-y-6">
      <Segmented
        value={tab}
        onChange={setTab}
        ariaLabel={da ? "Billedværktøj" : "Image tool"}
        options={options}
      />
      {imageMode ? (
        <ImageTool mode={imageMode} allowModeSwitch={false} />
      ) : null}
      {tab === "annotate" ? <AnnotateTool /> : null}
      {tab === "exifstrip" ? <ExifStripTool /> : null}
    </div>
  );
}
