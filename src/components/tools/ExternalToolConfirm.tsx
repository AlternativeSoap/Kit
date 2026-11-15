"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDictionary } from "@/i18n/LanguageProvider";
import { getToolCopy } from "@/i18n/tools";
import {
  clearLastSearchMatch,
  getLastSearchMatch,
  type LastSearchMatch,
} from "@/lib/personal";
import { getToolById } from "@/tools/registry";

type ExternalToolConfirmProps = {
  toolId: string;
  href: string;
};

export function ExternalToolConfirm({ toolId, href }: ExternalToolConfirmProps) {
  const dictionary = useDictionary();
  const copy = getToolCopy(dictionary, toolId);
  const tool = getToolById(toolId);
  const [match, setMatch] = useState<LastSearchMatch | null>(null);

  useEffect(() => {
    const stored = getLastSearchMatch();
    if (stored && stored.toolId === toolId) {
      setMatch(stored);
      clearLastSearchMatch();
    }
  }, [toolId]);

  let host = href;
  try {
    host = new URL(href).host;
  } catch {
    // keep raw href
  }

  const alternativeIds = [
    ...(tool?.alternatives ?? []),
    ...(tool?.relatedIds ?? []),
  ].filter((id, index, all) => id !== toolId && all.indexOf(id) === index);

  const alternatives = alternativeIds
    .map((id) => getToolById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-sm text-muted">{copy.description}</p>
      {match ? (
        <p className="mt-3 text-sm text-foreground">
          {dictionary.external.matchedBecause
            .replace("{query}", match.query)
            .replace("{matched}", match.matchedOn)}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-foreground">
        {dictionary.external.opensElsewhere.replace("{host}", host)}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="kit-touch-target mt-6 inline-flex w-full items-center justify-center rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto sm:min-h-0"
      >
        {dictionary.external.open.replace("{name}", copy.name)}
      </a>

      {alternatives.length > 0 ? (
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted">
            {dictionary.external.alternatives}
          </p>
          <ul className="mt-3 space-y-2">
            {alternatives.map((item) => {
              const altCopy = getToolCopy(dictionary, item.id);
              return (
                <li key={item.id}>
                  <Link
                    href={`/t/${item.slug}`}
                    className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {altCopy.name}
                  </Link>
                  <p className="text-xs text-muted">{altCopy.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
