"use client";

import Link from "next/link";
import { useDictionary } from "@/i18n/LanguageProvider";
import { getToolCopy } from "@/i18n/tools";
import { getToolById } from "@/tools/registry";

type RelatedToolsProps = {
  toolId: string;
};

/** Compact related links under a tool. Only renders when metadata exists. */
export function RelatedTools({ toolId }: RelatedToolsProps) {
  const dictionary = useDictionary();
  const tool = getToolById(toolId);
  if (!tool) return null;

  const ids = [
    ...(tool.relatedIds ?? []),
    ...(tool.alternatives ?? []),
  ].filter((id, index, all) => id !== toolId && all.indexOf(id) === index);

  const related = ids
    .map((id) => getToolById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-10 border-t border-border pt-6">
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
        {dictionary.external.alternatives}
      </p>
      <ul className="mt-3 space-y-2">
        {related.map((item) => {
          const copy = getToolCopy(dictionary, item.id);
          return (
            <li key={item.id}>
              <Link
                href={`/t/${item.slug}`}
                className="inline-flex min-h-11 items-center text-sm font-medium text-foreground underline-offset-4 hover:underline sm:min-h-0"
              >
                {copy.name}
              </Link>
              <p className="text-xs text-muted">{copy.description}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
