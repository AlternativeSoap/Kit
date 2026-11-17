"use client";

import { useState } from "react";
import { Segmented } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { ArbejdstidTool } from "./arbejdstid/ArbejdstidTool";
import { CountdownTool } from "./countdown/CountdownTool";
import { SimpleTool } from "./simple/SimpleTool";
import { StopurTool } from "./stopur/StopurTool";
import { TimeseddelTool } from "./timeseddel/TimeseddelTool";

type TimeTab =
  | "countdown"
  | "stopur"
  | "pomodoro"
  | "arbejdstid"
  | "hoursminutes"
  | "timeseddel";

const TABS: TimeTab[] = [
  "countdown",
  "stopur",
  "pomodoro",
  "arbejdstid",
  "hoursminutes",
  "timeseddel",
];

export function TimeSuiteTool({
  prefill,
  initial = "countdown",
}: {
  prefill?: ToolPrefill;
  initial?: string;
}) {
  const { locale } = useLanguage();
  const da = locale === "da";
  const start = (TABS as string[]).includes(initial)
    ? (initial as TimeTab)
    : "countdown";
  const [tab, setTab] = useState<TimeTab>(start);

  const labels: Record<TimeTab, string> = {
    countdown: da ? "Nedtælling" : "Countdown",
    stopur: da ? "Stopur" : "Stopwatch",
    pomodoro: "Pomodoro",
    arbejdstid: da ? "Arbejdstid" : "Work time",
    hoursminutes: da ? "Timer/min" : "H/M/S",
    timeseddel: da ? "Timeseddel" : "Timesheet",
  };

  return (
    <div className="space-y-6">
      <Segmented
        value={tab}
        onChange={setTab}
        ariaLabel={da ? "Tidsværktøj" : "Time tool"}
        options={TABS.map((id) => ({ id, label: labels[id] }))}
      />
      {tab === "countdown" ? <CountdownTool prefill={prefill} /> : null}
      {tab === "stopur" ? <StopurTool /> : null}
      {tab === "pomodoro" ? <SimpleTool id="pomodoro" prefill={prefill} /> : null}
      {tab === "arbejdstid" ? <ArbejdstidTool prefill={prefill} /> : null}
      {tab === "hoursminutes" ? (
        <SimpleTool id="hoursminutes" prefill={prefill} />
      ) : null}
      {tab === "timeseddel" ? <TimeseddelTool /> : null}
    </div>
  );
}
