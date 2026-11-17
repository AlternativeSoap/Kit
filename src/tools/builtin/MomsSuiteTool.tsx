"use client";

import { useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { MomsTool } from "./moms/MomsTool";
import { SimpleTool } from "./simple/SimpleTool";

type MomsTab = "moms" | "vatmargin";

const TABS: MomsTab[] = ["moms", "vatmargin"];

export function MomsSuiteTool({
  prefill,
  initial = "moms",
}: {
  prefill?: ToolPrefill;
  initial?: string;
}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const start = (TABS as string[]).includes(initial)
    ? (initial as MomsTab)
    : "moms";
  const [tab, setTab] = useState<MomsTab>(start);

  return (
    <div className="space-y-6">
      <Segmented
        value={tab}
        onChange={setTab}
        ariaLabel={da ? "Momsværktøj" : "VAT tool"}
        options={[
          { id: "moms", label: da ? "Moms" : "VAT" },
          {
            id: "vatmargin",
            label: da ? "Kost + avance" : "Cost + margin",
          },
        ]}
      />
      {tab === "moms" ? <MomsTool prefill={prefill} /> : null}
      {tab === "vatmargin" ? (
        <SimpleTool id="vatmargin" prefill={prefill} />
      ) : null}
    </div>
  );
}
