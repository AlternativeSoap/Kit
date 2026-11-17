"use client";

import Link from "next/link";
import { useDictionary } from "@/i18n/LanguageProvider";
import { getToolCopy } from "@/i18n/tools";
import {
  relatedSiteHost,
  resolveRelatedForTool,
} from "@/lib/tools/related";
import type { ToolDefinition } from "@/tools/types";

type RelatedToolsProps = {
  toolId: string;
};

function RelatedList({
  items,
  showHost,
}: {
  items: ToolDefinition[];
  showHost: boolean;
}) {
  const dictionary = useDictionary();

  return (
    <ul className="mt-3 space-y-3">
      {items.map((item) => {
        const copy = getToolCopy(dictionary, item.id);
        const host = showHost ? relatedSiteHost(item) : null;
        return (
          <li key={item.id}>
            <Link
              href={`/t/${item.slug}`}
              className="inline-flex min-h-11 items-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:min-h-0"
            >
              {copy.name}
              {host ? (
                <span className="ml-2 text-xs font-normal text-muted">
                  {host}
                </span>
              ) : null}
            </Link>
            <p className="text-xs text-muted">{copy.description}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** Related Kit tools and external sites under a builtin tool page. */
export function RelatedTools({ toolId }: RelatedToolsProps) {
  const dictionary = useDictionary();
  const { kit, sites } = resolveRelatedForTool(toolId);

  if (kit.length === 0 && sites.length === 0) return null;

  return (
    <div className="mt-10 space-y-8 border-t border-border pt-6">
      {sites.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-foreground">
            {dictionary.relatedSection.sitesHeading}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {dictionary.relatedSection.sitesLead}
          </p>
          <RelatedList items={sites} showHost />
        </section>
      ) : null}

      {kit.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-foreground">
            {dictionary.relatedSection.kitHeading}
          </h2>
          <RelatedList items={kit} showHost={false} />
        </section>
      ) : null}
    </div>
  );
}
