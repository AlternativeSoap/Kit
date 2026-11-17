"use client";

import { useMemo, useState } from "react";
import {
  Field,
  KitInput,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { downloadBlob } from "../media/canvas";
import { buildInvoicePdf } from "./pdf";

type Line = {
  id: string;
  desc: string;
  qty: string;
  unit: string;
  price: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function money(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function parseNum(raw: string) {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatDateLabel(iso: string, locale: string) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function FakturaTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const issueDefault = today();

  const [sellerName, setSellerName] = useState(
    da ? "Dit firma ApS" : "Your company Ltd",
  );
  const [sellerDetails, setSellerDetails] = useState(
    da
      ? "Eksempelvej 1\n2100 København Ø\nCVR 12345678"
      : "1 Example Street\nCity 1000\nVAT GB123456789",
  );
  const [buyerName, setBuyerName] = useState(da ? "Kunde A/S" : "Customer Inc");
  const [buyerDetails, setBuyerDetails] = useState(
    da
      ? "Kundegade 12\n8000 Aarhus C\nCVR 87654321"
      : "12 Client Avenue\nTown 2000\nVAT EU987654321",
  );
  const [invoiceNo, setInvoiceNo] = useState(
    `${new Date().getFullYear()}-001`,
  );
  const [issueDate, setIssueDate] = useState(issueDefault);
  const [dueDate, setDueDate] = useState(plusDays(issueDefault, 14));
  const [vatPct, setVatPct] = useState("25");
  const [currency, setCurrency] = useState(da ? "DKK" : "EUR");
  const [notes, setNotes] = useState(
    da
      ? "Betaling til konto 1234-5678901234. Mærk betalingen med fakturanummeret."
      : "Pay to account IBAN XX00 0000 0000 0000. Reference the invoice number.",
  );
  const [lines, setLines] = useState<Line[]>([
    {
      id: "1",
      desc: da ? "Konsulentydelse" : "Consulting",
      qty: "8",
      unit: da ? "timer" : "hrs",
      price: "750",
    },
    {
      id: "2",
      desc: da ? "Materialer" : "Materials",
      qty: "1",
      unit: da ? "stk" : "pcs",
      price: "450",
    },
  ]);
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    const vat = parseNum(vatPct);
    let net = 0;
    const parsed = lines.map((line) => {
      const qty = parseNum(line.qty);
      const price = parseNum(line.price);
      const sum = qty * price;
      net += sum;
      return { ...line, qty, price, sum };
    });
    const vatAmount = net * (vat / 100);
    return {
      net,
      vatAmount,
      gross: net + vatAmount,
      vat,
      lines: parsed,
      currency: currency.trim() || (da ? "DKK" : "EUR"),
    };
  }, [lines, vatPct, currency, da]);

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  async function exportPdf() {
    setBusy(true);
    try {
      const bytes = await buildInvoicePdf({
        da,
        locale,
        sellerName,
        sellerDetails,
        buyerName,
        buyerDetails,
        invoiceNo,
        issueDate,
        dueDate,
        currency: totals.currency,
        vatPct: totals.vat,
        notes,
        lines: totals.lines.map((line) => ({
          desc: line.desc,
          qty: line.qty,
          unit: line.unit,
          price: line.price,
        })),
      });
      downloadBlob(
        new Blob(
          [
            bytes.buffer.slice(
              bytes.byteOffset,
              bytes.byteOffset + bytes.byteLength,
            ) as ArrayBuffer,
          ],
          { type: "application/pdf" },
        ),
        `faktura-${invoiceNo.replace(/[^\w.-]+/g, "_") || "1"}.pdf`,
      );
    } finally {
      setBusy(false);
    }
  }

  const fieldClass =
    "kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-[12px] border border-border bg-surface/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Fra" : "From"}
            </p>
            <Field label={da ? "Firmanavn" : "Company name"}>
              <KitInput
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
              />
            </Field>
            <Field
              label={da ? "Adresse og CVR" : "Address and VAT ID"}
              hint={da ? "Én oplysning pr. linje." : "One detail per line."}
            >
              <textarea
                rows={4}
                className={fieldClass}
                value={sellerDetails}
                onChange={(e) => setSellerDetails(e.target.value)}
              />
            </Field>
          </div>
          <div className="space-y-3 rounded-[12px] border border-border bg-surface/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Til" : "Bill to"}
            </p>
            <Field label={da ? "Kundenavn" : "Customer name"}>
              <KitInput
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </Field>
            <Field label={da ? "Adresse og CVR" : "Address and VAT ID"}>
              <textarea
                rows={4}
                className={fieldClass}
                value={buyerDetails}
                onChange={(e) => setBuyerDetails(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={da ? "Fakturanr." : "Invoice no."}>
            <KitInput
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </Field>
          <Field label={da ? "Dato" : "Issue date"}>
            <KitInput
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </Field>
          <Field label={da ? "Forfaldsdato" : "Due date"}>
            <KitInput
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
          <Field label={da ? "Valuta" : "Currency"}>
            <KitInput
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder={da ? "DKK" : "EUR"}
            />
          </Field>
        </div>

        <Field label={da ? "Moms %" : "VAT %"}>
          <div className="max-w-[8rem]">
            <KitInput
              value={vatPct}
              onChange={(e) => setVatPct(e.target.value)}
            />
          </div>
        </Field>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {da ? "Linjer" : "Line items"}
            </p>
            <button
              type="button"
              className={secondaryBtnClass}
              onClick={() =>
                setLines((prev) => [
                  ...prev,
                  {
                    id: String(Date.now()),
                    desc: "",
                    qty: "1",
                    unit: da ? "stk" : "pcs",
                    price: "0",
                  },
                ])
              }
            >
              {da ? "Tilføj linje" : "Add line"}
            </button>
          </div>

          {lines.map((line, index) => (
            <div
              key={line.id}
              className="grid gap-2 rounded-[12px] border border-border bg-surface p-3 sm:grid-cols-[1fr_4.5rem_4.5rem_6.5rem_auto]"
            >
              <Field label={da ? "Beskrivelse" : "Description"}>
                <KitInput
                  value={line.desc}
                  onChange={(e) => updateLine(index, { desc: e.target.value })}
                />
              </Field>
              <Field label={da ? "Antal" : "Qty"}>
                <KitInput
                  value={line.qty}
                  onChange={(e) => updateLine(index, { qty: e.target.value })}
                />
              </Field>
              <Field label={da ? "Enh." : "Unit"}>
                <KitInput
                  value={line.unit}
                  onChange={(e) => updateLine(index, { unit: e.target.value })}
                />
              </Field>
              <Field label={da ? "Pris" : "Price"}>
                <KitInput
                  value={line.price}
                  onChange={(e) => updateLine(index, { price: e.target.value })}
                />
              </Field>
              <div className="flex items-end justify-between gap-2 sm:flex-col sm:items-stretch">
                <p className="text-sm font-medium tabular-nums text-foreground">
                  {money(parseNum(line.qty) * parseNum(line.price), locale)}
                </p>
                <button
                  type="button"
                  className={secondaryBtnClass}
                  onClick={() =>
                    setLines((prev) => prev.filter((_, i) => i !== index))
                  }
                  disabled={lines.length <= 1}
                >
                  {da ? "Fjern" : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <Field
          label={da ? "Bemærkning / betaling" : "Notes / payment"}
          hint={
            da
              ? "Viser under totalen på fakturaen."
              : "Shown under the totals on the invoice."
          }
        >
          <textarea
            rows={3}
            className={fieldClass}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={primaryBtnClass}
            disabled={busy}
            onClick={() => void exportPdf()}
          >
            {busy
              ? da
                ? "Laver PDF…"
                : "Making PDF…"
              : da
                ? "Download PDF"
                : "Download PDF"}
          </button>
          <p className="text-xs text-muted">
            {da
              ? "Alt kører i browseren. Intet sendes til en server."
              : "Everything runs in your browser. Nothing is uploaded."}
          </p>
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
          {da ? "Forhåndsvisning" : "Preview"}
        </p>
        <div className="overflow-hidden rounded-[14px] border border-border bg-white shadow-[0_18px_50px_rgba(20,30,24,0.08)]">
          <div className="h-1.5 bg-accent" />
          <div className="space-y-6 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h2 className="font-serif text-3xl tracking-tight text-accent">
                {da ? "Faktura" : "Invoice"}
              </h2>
              <dl className="space-y-1 text-right text-sm">
                <div className="flex justify-end gap-3">
                  <dt className="text-muted">{da ? "Nr." : "No."}</dt>
                  <dd className="font-medium">{invoiceNo || "—"}</dd>
                </div>
                <div className="flex justify-end gap-3">
                  <dt className="text-muted">{da ? "Dato" : "Date"}</dt>
                  <dd className="font-medium">
                    {formatDateLabel(issueDate, locale)}
                  </dd>
                </div>
                {dueDate ? (
                  <div className="flex justify-end gap-3">
                    <dt className="text-muted">{da ? "Forfald" : "Due"}</dt>
                    <dd className="font-medium">
                      {formatDateLabel(dueDate, locale)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {da ? "Fra" : "From"}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {sellerName || "—"}
                </p>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-muted">
                  {sellerDetails}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {da ? "Til" : "Bill to"}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {buyerName || "—"}
                </p>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-muted">
                  {buyerDetails}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] border-collapse text-sm">
                <thead>
                  <tr className="bg-accent-soft/70 text-left text-[11px] uppercase tracking-wide text-muted">
                    <th className="rounded-l-[8px] px-3 py-2 font-medium">
                      {da ? "Beskrivelse" : "Description"}
                    </th>
                    <th className="px-2 py-2 text-right font-medium">
                      {da ? "Antal" : "Qty"}
                    </th>
                    <th className="px-2 py-2 font-medium">
                      {da ? "Enh." : "Unit"}
                    </th>
                    <th className="px-2 py-2 text-right font-medium">
                      {da ? "Pris" : "Price"}
                    </th>
                    <th className="rounded-r-[8px] px-3 py-2 text-right font-medium">
                      {da ? "Beløb" : "Amount"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {totals.lines.map((line) => (
                    <tr
                      key={line.id}
                      className="border-b border-border/70 align-top"
                    >
                      <td className="px-3 py-2.5 text-foreground">
                        {line.desc || "—"}
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums">
                        {money(line.qty, locale)}
                      </td>
                      <td className="px-2 py-2.5 text-muted">{line.unit}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">
                        {money(line.price, locale)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                        {money(line.sum, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-[16rem] rounded-[10px] border-l-[3px] border-accent bg-accent-soft/50 px-4 py-3 text-sm">
                <div className="flex justify-between gap-4 text-muted">
                  <span>{da ? "Netto" : "Net"}</span>
                  <span className="tabular-nums text-foreground">
                    {money(totals.net, locale)} {totals.currency}
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between gap-4 text-muted">
                  <span>
                    {da ? "Moms" : "VAT"} ({money(totals.vat, locale)}%)
                  </span>
                  <span className="tabular-nums text-foreground">
                    {money(totals.vatAmount, locale)} {totals.currency}
                  </span>
                </div>
                <div className="mt-3 flex justify-between gap-4 border-t border-border/70 pt-2 font-medium">
                  <span>{da ? "Total" : "Total"}</span>
                  <span className="tabular-nums text-accent">
                    {money(totals.gross, locale)} {totals.currency}
                  </span>
                </div>
              </div>
            </div>

            {notes.trim() ? (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {da ? "Bemærkning" : "Notes"}
                </p>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-foreground">
                  {notes}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          {da
            ? "Forhåndsvisningen følger PDF-layoutet. Simpel faktura til egen brug, ikke en bogføringsløsning."
            : "The preview follows the PDF layout. A simple invoice for your own use, not accounting software."}
        </p>
      </aside>
    </div>
  );
}
