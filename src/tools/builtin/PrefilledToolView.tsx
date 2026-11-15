"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { BuiltinToolId } from "@/tools/types";
import { BuiltinToolView } from "./index";

/**
 * Opens a tool with the values from the URL query string. The query string
 * is only known in the browser, so the page renders this inside Suspense
 * with the default tool as the fallback.
 */
export function PrefilledToolView({ id }: { id: BuiltinToolId }) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const prefill = useMemo(
    () => Object.fromEntries(new URLSearchParams(query)),
    [query],
  );

  // Keyed by the query so a new answer for the same tool starts it fresh.
  return <BuiltinToolView key={query} id={id} prefill={prefill} />;
}
