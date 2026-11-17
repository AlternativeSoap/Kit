import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExternalToolConfirm } from "@/components/tools/ExternalToolConfirm";
import { RelatedTools } from "@/components/tools/RelatedTools";
import { ToolChrome } from "@/components/tools/ToolChrome";
import { ToolContentFallback } from "@/components/tools/ToolContentFallback";
import { ToolHeading } from "@/components/tools/ToolHeading";
import { ToolRecent } from "@/components/tools/ToolRecent";
import { getDictionary } from "@/i18n/dictionaries";
import { LocaleGate } from "@/i18n/LanguageProvider";
import { getRequestLocale } from "@/i18n/serverLocale";
import { getToolCopy } from "@/i18n/tools";
import { BuiltinToolView } from "@/tools/builtin";
import { PrefilledToolView } from "@/tools/builtin/PrefilledToolView";
import { getToolBySlug, tools } from "@/tools/registry";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return { title: "Not found" };
  }
  return {
    title: tool.name,
    description: tool.description,
  };
}

export default function ToolPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full min-h-dvh flex-1 flex-col overflow-x-clip">
          <div className="sticky top-0 z-40 h-[53px] border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] sm:h-[57px]" />
          <ToolContentFallback />
        </div>
      }
    >
      <ToolPageBody params={params} />
    </Suspense>
  );
}

async function ToolPageBody({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const serverLocale = await getRequestLocale();

  return (
    <LocaleGate serverLocale={serverLocale}>
      <div className="flex min-h-full min-h-dvh flex-1 flex-col overflow-x-clip">
        <ToolChrome />
        <Suspense fallback={<ToolContentFallback />}>
          <ToolContent params={params} serverLocale={serverLocale} />
        </Suspense>
      </div>
    </LocaleGate>
  );
}

async function ToolContent({
  params,
  serverLocale,
}: {
  params: Promise<{ slug: string }>;
  serverLocale: Awaited<ReturnType<typeof getRequestLocale>>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const copy = getToolCopy(getDictionary(serverLocale), tool.id);

  return (
    <main className="kit-tool-enter mx-auto w-full max-w-5xl flex-1 px-3 py-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10 sm:pb-10">
      <ToolRecent slug={tool.slug} />
      <ToolHeading
        toolId={tool.id}
        name={copy.name}
        description={copy.description}
      />
      {tool.kind === "builtin" && tool.builtinId ? (
        // The query string is only known in the browser. The prerendered
        // page shows the tool with its defaults until the values arrive.
        <Suspense fallback={<BuiltinToolView id={tool.builtinId} />}>
          <PrefilledToolView id={tool.builtinId} />
        </Suspense>
      ) : tool.kind === "external" && tool.href ? (
        <ExternalToolConfirm toolId={tool.id} href={tool.href} />
      ) : null}
      {tool.kind === "builtin" ? <RelatedTools toolId={tool.id} /> : null}
    </main>
  );
}
