"use client";

import { useEffect } from "react";
import { pushRecentSlug } from "@/lib/recent";

export function ToolRecent({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecentSlug(slug);
  }, [slug]);

  return null;
}
