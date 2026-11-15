"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/i18n/LanguageProvider";
import { getToolCopy } from "@/i18n/tools";

type ToolHeadingProps = {
  toolId: string;
  /** Exact SSR strings so hydration always matches the server HTML. */
  name: string;
  description: string;
};

export function ToolHeading({ toolId, name, description }: ToolHeadingProps) {
  const pathname = usePathname();
  const dictionary = useDictionary();
  const live = getToolCopy(dictionary, toolId);

  // Track the route we last hydrated against. When the path (or SSR copy)
  // changes, show server props until after mount so soft navigation / Activity
  // cannot paint a restored client locale into fresh English (or Danish) HTML.
  const [gate, setGate] = useState({ pathname, name, live: false });
  if (gate.pathname !== pathname || gate.name !== name) {
    setGate({ pathname, name, live: false });
  }

  useEffect(() => {
    setGate({ pathname, name, live: true });
  }, [pathname, name]);

  useEffect(() => {
    const title = gate.live ? live.name : name;
    document.title = `${title} · ${dictionary.brand}`;
  }, [dictionary.brand, gate.live, live.name, name]);

  const title = gate.live ? live.name : name;
  const body = gate.live ? live.description : description;

  return (
    <div className="mb-8">
      <h1 className="font-serif text-[1.75rem] leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{body}</p>
    </div>
  );
}
