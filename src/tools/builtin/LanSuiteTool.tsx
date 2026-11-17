"use client";

import { useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { LanTool } from "./lan/LanTool";
import { SimpleTool } from "./simple/SimpleTool";

type LanTab = "payment" | "loanextra";

const TABS: LanTab[] = ["payment", "loanextra"];

export function LanSuiteTool({
  prefill,
  initial = "payment",
}: {
  prefill?: ToolPrefill;
  initial?: string;
}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const start = (TABS as string[]).includes(initial)
    ? (initial as LanTab)
    : "payment";
  const [tab, setTab] = useState<LanTab>(start);

  return (
    <div className="space-y-6">
      <Segmented
        value={tab}
        onChange={setTab}
        ariaLabel={da ? "Låneværktøj" : "Loan tool"}
        options={[
          { id: "payment", label: da ? "Ydelse" : "Payment" },
          { id: "loanextra", label: da ? "Ekstra afdrag" : "Extra payment" },
        ]}
      />
      {tab === "payment" ? <LanTool prefill={prefill} /> : null}
      {tab === "loanextra" ? (
        <SimpleTool id="loanextra" prefill={prefill} />
      ) : null}
    </div>
  );
}
