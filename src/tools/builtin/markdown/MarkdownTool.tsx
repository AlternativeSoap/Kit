"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { useDictionary } from "@/i18n/LanguageProvider";
import type { ToolPrefill } from "@/tools/prefill";
import { nodesToSafeHtml, parseMarkdown } from "./calc";

const SAMPLE = `# Heading

Write **bold**, *italic*, and \`code\`.

- List item one
- List item two

1. Ordered
2. Items

[Link](https://example.com)

\`\`\`
const hello = "world";
\`\`\`
`;

export function MarkdownTool({ prefill }: { prefill?: ToolPrefill }) {
  const dictionary = useDictionary();
  const t = dictionary.markdownTool;
  const [input, setInput] = useState(() => prefill?.value ?? SAMPLE);

  const html = useMemo(() => nodesToSafeHtml(parseMarkdown(input)), [input]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 flex items-center justify-between text-sm font-medium">
          <span>{t.input}</span>
          <CopyButton value={input} label={t.copy} copiedLabel={t.copied} />
        </span>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 font-mono text-base outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] sm:text-[14px]"
        />
      </label>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-sm font-medium">
          <span>{t.preview}</span>
          <CopyButton value={html} label={t.copyHtml} copiedLabel={t.copied} />
        </div>
        <div
          className="prose-kit min-h-[20rem] rounded-[10px] border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-foreground [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-4 [&_hr]:border-border [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:my-3 [&_pre]:overflow-auto [&_pre]:rounded-[8px] [&_pre]:bg-black/5 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px] [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: html || `<p class="text-muted">${t.empty}</p>` }}
        />
        <p className="mt-2 text-xs text-muted">{t.note}</p>
      </div>
    </div>
  );
}
