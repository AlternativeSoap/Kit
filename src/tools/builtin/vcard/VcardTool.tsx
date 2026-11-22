"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/CopyButton";
import { Field, fieldClass, primaryBtnClass } from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { type ToolPrefill } from "@/tools/prefill";
import { downloadTextFile } from "../media/canvas";
import { buildVcard, vcardFilename } from "./calc";

export function VcardTool({ prefill }: { prefill?: ToolPrefill }) {
  const { locale } = useLanguage();
  const da = locale === "da";

  const [name, setName] = useState(prefill?.name ?? "");
  const [org, setOrg] = useState(prefill?.org ?? "");
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [phones, setPhones] = useState(prefill?.phones ?? prefill?.phone ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [url, setUrl] = useState(prefill?.url ?? "");
  const [address, setAddress] = useState(prefill?.address ?? "");
  const [note, setNote] = useState(prefill?.note ?? "");

  const vcf = useMemo(
    () =>
      buildVcard({
        name,
        org,
        title,
        phones,
        email,
        url,
        address,
        note,
      }),
    [name, org, title, phones, email, url, address, note],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Field label={da ? "Navn" : "Name"} hint={da ? "Påkrævet" : "Required"}>
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={da ? "Organisation" : "Organization"}>
            <input
              className={fieldClass}
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              autoComplete="organization"
            />
          </Field>
          <Field label={da ? "Titel" : "Title"}>
            <input
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoComplete="organization-title"
            />
          </Field>
        </div>
        <Field
          label={da ? "Telefon" : "Phone"}
          hint={da ? "Flere numre adskilt med komma" : "Separate numbers with commas"}
        >
          <input
            className={fieldClass}
            value={phones}
            onChange={(e) => setPhones(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
        <Field label={da ? "E-mail" : "Email"}>
          <input
            type="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="URL">
          <input
            type="url"
            className={fieldClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            autoComplete="url"
          />
        </Field>
        <Field label={da ? "Adresse" : "Address"}>
          <input
            className={fieldClass}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="street-address"
          />
        </Field>
        <Field label={da ? "Note" : "Note"}>
          <textarea
            rows={2}
            className={fieldClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>

      <div className="space-y-4">
        <div className="rounded-[12px] border border-border bg-surface px-5 py-4">
          {vcf ? (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted">
                  {da ? "Forhåndsvisning (.vcf)" : "Preview (.vcf)"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <CopyButton
                    value={vcf}
                    label={da ? "Kopiér" : "Copy"}
                    copiedLabel={da ? "Kopieret" : "Copied"}
                  />
                  <button
                    type="button"
                    className={primaryBtnClass}
                    onClick={() =>
                      downloadTextFile(
                        vcf,
                        vcardFilename(name),
                        "text/vcard;charset=utf-8",
                      )
                    }
                  >
                    {da ? "Download .vcf" : "Download .vcf"}
                  </button>
                </div>
              </div>
              <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-all rounded-[10px] bg-background px-3 py-3 font-mono text-xs leading-relaxed text-foreground">
                {vcf}
              </pre>
            </>
          ) : (
            <p className="py-8 text-sm text-muted">
              {da
                ? "Skriv et navn for at se vCard-filen."
                : "Enter a name to preview the vCard."}
            </p>
          )}
        </div>
        <p className="text-xs text-muted">
          {da
            ? "vCard 3.0. Åbn filen i kontakter på telefon eller computer. Intet uploades."
            : "vCard 3.0. Open the file in Contacts on your phone or computer. Nothing is uploaded."}
        </p>
      </div>
    </div>
  );
}
