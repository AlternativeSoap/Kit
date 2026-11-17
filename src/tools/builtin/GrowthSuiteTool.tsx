"use client";

import { useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { CagrTool } from "./cagr/CagrTool";
import { OpsparingTool } from "./opsparing/OpsparingTool";
import { SimpleTool } from "./simple/SimpleTool";

type GrowthTab = "opsparing" | "compound" | "ruleof72" | "cagr";

const TABS: GrowthTab[] = ["opsparing", "compound", "ruleof72", "cagr"];

export function GrowthSuiteTool({
  prefill,
  initial = "opsparing",
}: {
  prefill?: ToolPrefill;
  initial?: string;
}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const start = (TABS as string[]).includes(initial)
    ? (initial as GrowthTab)
    : "opsparing";
  const [tab, setTab] = useState<GrowthTab>(start);

  const labels: Record<GrowthTab, string> = {
    opsparing: da ? "Opsparing" : "Savings",
    compound: da ? "Rentes rente" : "Compound",
    ruleof72: da ? "72-reglen" : "Rule of 72",
    cagr: "CAGR",
  };

  return (
    <div className="space-y-6">
      <Segmented
        value={tab}
        onChange={setTab}
        ariaLabel={da ? "Vækstværktøj" : "Growth tool"}
        options={TABS.map((id) => ({ id, label: labels[id] }))}
      />
      {tab === "opsparing" ? <OpsparingTool prefill={prefill} /> : null}
      {tab === "compound" ? <SimpleTool id="compound" prefill={prefill} /> : null}
      {tab === "ruleof72" ? <SimpleTool id="ruleof72" prefill={prefill} /> : null}
      {tab === "cagr" ? <CagrTool prefill={prefill} /> : null}
    </div>
  );
}
