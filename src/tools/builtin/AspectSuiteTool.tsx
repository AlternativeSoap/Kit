"use client";

import { useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { AspectTool } from "./aspect/AspectTool";
import { SimpleTool } from "./simple/SimpleTool";

type AspectTab = "aspect" | "aspectfit";

const TABS: AspectTab[] = ["aspect", "aspectfit"];

export function AspectSuiteTool({
  prefill,
  initial = "aspect",
}: {
  prefill?: ToolPrefill;
  initial?: string;
}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const start = (TABS as string[]).includes(initial)
    ? (initial as AspectTab)
    : "aspect";
  const [tab, setTab] = useState<AspectTab>(start);

  return (
    <div className="space-y-6">
      <Segmented
        value={tab}
        onChange={setTab}
        ariaLabel={da ? "Billedformat" : "Aspect ratio"}
        options={[
          { id: "aspect", label: da ? "Format" : "Ratio" },
          { id: "aspectfit", label: da ? "Tilpas boks" : "Fit box" },
        ]}
      />
      {tab === "aspect" ? <AspectTool prefill={prefill} /> : null}
      {tab === "aspectfit" ? (
        <SimpleTool id="aspectfit" prefill={prefill} />
      ) : null}
    </div>
  );
}
