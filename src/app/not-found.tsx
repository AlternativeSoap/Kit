"use client";

import Link from "next/link";
import { useDictionary } from "@/i18n/LanguageProvider";

export default function NotFound() {
  const dictionary = useDictionary();

  return (
    <main className="flex min-h-full min-h-dvh flex-1 flex-col items-center justify-center px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <p className="text-sm font-medium text-foreground">{dictionary.brand}</p>
      <h1 className="mt-4 font-serif text-3xl tracking-tight">
        {dictionary.notFound.title}
      </h1>
      <p className="mt-2 text-center text-sm text-muted">{dictionary.notFound.body}</p>
      <Link
        href="/"
        className="kit-touch-target mt-6 inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white"
      >
        {dictionary.notFound.back}
      </Link>
    </main>
  );
}
