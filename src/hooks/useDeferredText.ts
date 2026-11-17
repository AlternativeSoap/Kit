"use client";

import { useDeferredValue, useState } from "react";

/** Controlled text state with a deferred mirror for heavy derived work. */
export function useDeferredText(initial = "") {
  const [text, setText] = useState(initial);
  const deferred = useDeferredValue(text);
  return { text, setText, deferred } as const;
}
