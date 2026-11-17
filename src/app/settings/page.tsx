import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { ToolChrome } from "@/components/tools/ToolChrome";
import { LocaleGate } from "@/i18n/LanguageProvider";
import { getRequestLocale } from "@/i18n/serverLocale";

export const metadata: Metadata = {
  title: "Settings",
  description: "Pins, hidden tools, shortcuts, and local Kit data on this device.",
};

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full min-h-dvh flex-1 flex-col overflow-x-clip">
          <div className="sticky top-0 z-40 h-[53px] border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] sm:h-[57px]" />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10" />
        </div>
      }
    >
      <SettingsPageBody />
    </Suspense>
  );
}

async function SettingsPageBody() {
  const serverLocale = await getRequestLocale();

  return (
    <LocaleGate serverLocale={serverLocale}>
      <div className="flex min-h-full min-h-dvh flex-1 flex-col overflow-x-clip">
        <ToolChrome />
        <main className="kit-tool-enter mx-auto w-full max-w-5xl flex-1 px-3 py-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10 sm:pb-10">
          <SettingsForm />
        </main>
      </div>
    </LocaleGate>
  );
}
