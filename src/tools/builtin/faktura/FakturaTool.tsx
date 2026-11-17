"use client";

import { useMemo, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  Field,
  KitInput,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { toWinAnsiSafe } from "../doctopdf/winansi";
import { downloadBlob } from "../media/canvas";

type Line = { id: string; desc: string; qty: string; price: string };

function money(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function FakturaTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const [seller, setSeller] = useState(da ? "Dit firma ApS" : "Your company Ltd");
  const [buyer, setBuyer] = useState(da ? "Kunde A/S" : "Customer Inc");
  const [invoiceNo, setInvoiceNo] = useState("1");
  const [vatPct, setVatPct] = useState("25");
  const [lines, setLines] = useState<Line[]>([
    { id: "1", desc: da ? "Ydelse" : "Service", qty: "1", price: "1000" },
  ]);
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    const vat = Number(vatPct.replace(",", ".")) || 0;
    let net = 0;
    for (const line of lines) {
      const qty = Number(line.qty.replace(",", ".")) || 0;
      const price = Number(line.price.replace(",", ".")) || 0;
      net += qty * price;
    }
    const vatAmount = net * (vat / 100);
    return { net, vatAmount, gross: net + vatAmount, vat };
  }, [lines, vatPct]);

  async function exportPdf() {
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      const page = doc.addPage([595.28, 841.89]);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const bold = await doc.embedFont(StandardFonts.HelveticaBold);
      const safe = (s: string) => toWinAnsiSafe(s).text;
      let y = 800;
      const left = 48;
      page.drawText(safe(da ? "Faktura" : "Invoice"), {
        x: left,
        y,
        size: 22,
        font: bold,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 28;
      page.drawText(safe(`${da ? "Nr." : "No."} ${invoiceNo}`), {
        x: left,
        y,
        size: 11,
        font,
      });
      y -= 28;
      page.drawText(safe(`${da ? "Fra" : "From"}: ${seller}`), {
        x: left,
        y,
        size: 11,
        font,
      });
      y -= 16;
      page.drawText(safe(`${da ? "Til" : "To"}: ${buyer}`), {
        x: left,
        y,
        size: 11,
        font,
      });
      y -= 36;
      page.drawText(safe(da ? "Beskrivelse" : "Description"), {
        x: left,
        y,
        size: 10,
        font: bold,
      });
      page.drawText(safe(da ? "Antal" : "Qty"), {
        x: 360,
        y,
        size: 10,
        font: bold,
      });
      page.drawText(safe(da ? "Pris" : "Price"), {
        x: 420,
        y,
        size: 10,
        font: bold,
      });
      page.drawText(safe(da ? "Sum" : "Sum"), {
        x: 500,
        y,
        size: 10,
        font: bold,
      });
      y -= 16;
      for (const line of lines) {
        const qty = Number(line.qty.replace(",", ".")) || 0;
        const price = Number(line.price.replace(",", ".")) || 0;
        const sum = qty * price;
        page.drawText(safe(line.desc.slice(0, 40)), { x: left, y, size: 10, font });
        page.drawText(safe(String(qty)), { x: 360, y, size: 10, font });
        page.drawText(safe(money(price, locale)), { x: 420, y, size: 10, font });
        page.drawText(safe(money(sum, locale)), { x: 490, y, size: 10, font });
        y -= 16;
        if (y < 120) break;
      }
      y -= 20;
      page.drawText(safe(`${da ? "Netto" : "Net"}: ${money(totals.net, locale)}`), {
        x: left,
        y,
        size: 11,
        font,
      });
      y -= 16;
      page.drawText(
        safe(
          `${da ? "Moms" : "VAT"} (${totals.vat}%): ${money(totals.vatAmount, locale)}`,
        ),
        { x: left, y, size: 11, font },
      );
      y -= 18;
      page.drawText(
        safe(`${da ? "Total" : "Total"}: ${money(totals.gross, locale)}`),
        { x: left, y, size: 13, font: bold },
      );

      const bytes = await doc.save();
      downloadBlob(
        new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
          type: "application/pdf",
        }),
        `invoice-${invoiceNo || "1"}.pdf`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={da ? "Fra (sælger)" : "From (seller)"}>
          <textarea
            rows={2}
            className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
          />
        </Field>
        <Field label={da ? "Til (kunde)" : "To (buyer)"}>
          <textarea
            rows={2}
            className="kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={da ? "Fakturanr." : "Invoice no."}>
          <KitInput value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        </Field>
        <Field label={da ? "Moms %" : "VAT %"}>
          <KitInput value={vatPct} onChange={(e) => setVatPct(e.target.value)} />
        </Field>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">{da ? "Linjer" : "Line items"}</p>
        {lines.map((line, index) => (
          <div key={line.id} className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem_auto]">
            <KitInput
              value={line.desc}
              onChange={(e) =>
                setLines((prev) =>
                  prev.map((l, i) =>
                    i === index ? { ...l, desc: e.target.value } : l,
                  ),
                )
              }
              placeholder={da ? "Beskrivelse" : "Description"}
            />
            <KitInput
              value={line.qty}
              onChange={(e) =>
                setLines((prev) =>
                  prev.map((l, i) =>
                    i === index ? { ...l, qty: e.target.value } : l,
                  ),
                )
              }
              placeholder={da ? "Antal" : "Qty"}
            />
            <KitInput
              value={line.price}
              onChange={(e) =>
                setLines((prev) =>
                  prev.map((l, i) =>
                    i === index ? { ...l, price: e.target.value } : l,
                  ),
                )
              }
              placeholder={da ? "Pris" : "Price"}
            />
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
        ))}
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
                price: "0",
              },
            ])
          }
        >
          {da ? "Tilføj linje" : "Add line"}
        </button>
      </div>

      <div className="rounded-[12px] border border-border bg-surface px-4 py-3 text-sm">
        <p>
          {da ? "Netto" : "Net"}: {money(totals.net, locale)}
        </p>
        <p>
          {da ? "Moms" : "VAT"}: {money(totals.vatAmount, locale)}
        </p>
        <p className="font-medium">
          {da ? "Total" : "Total"}: {money(totals.gross, locale)}
        </p>
      </div>

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
          ? "Simpel faktura til egen brug. Ikke en bogføringsløsning."
          : "A simple invoice for your own use. Not accounting software."}
      </p>
    </div>
  );
}
