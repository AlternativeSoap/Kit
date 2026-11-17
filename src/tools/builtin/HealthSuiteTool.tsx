"use client";

import { useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { BmiTool } from "./bmi/BmiTool";
import { SimpleTool } from "./simple/SimpleTool";

type HealthTab = "bmi" | "bodyfat" | "calorie" | "water" | "pace";

const TABS: HealthTab[] = ["bmi", "bodyfat", "calorie", "water", "pace"];

export function HealthSuiteTool({
  prefill,
  initial = "bmi",
}: {
  prefill?: ToolPrefill;
  initial?: string;
}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const start = (TABS as string[]).includes(initial)
    ? (initial as HealthTab)
    : "bmi";
  const [tab, setTab] = useState<HealthTab>(start);

  const labels: Record<HealthTab, string> = {
    bmi: "BMI",
    bodyfat: da ? "Fedtprocent" : "Body fat",
    calorie: da ? "Kalorier" : "Calories",
    water: da ? "Vand" : "Water",
    pace: da ? "Tempo" : "Pace",
  };

  return (
    <div className="space-y-6">
      <Segmented
        value={tab}
        onChange={setTab}
        ariaLabel={da ? "Sundhedsværktøj" : "Health tool"}
        options={TABS.map((id) => ({ id, label: labels[id] }))}
      />
      {tab === "bmi" ? (
        <BmiTool prefill={prefill} />
      ) : (
        <SimpleTool id={tab} prefill={prefill} />
      )}
    </div>
  );
}
