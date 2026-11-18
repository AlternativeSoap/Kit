"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Field,
  KitInput,
  primaryBtnClass,
  secondaryBtnClass,
} from "@/components/tools/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import { downloadBlob } from "../media/canvas";
import { buildInvoicePdf, computeInvoiceTotals } from "./pdf";

type Line = {
  id: string;
  desc: string;
  qty: string;
  unit: string;
  price: string;
};

type DueTerm = "8" | "14" | "30" | "custom";

const SELLER_STORAGE_KEY = "kit-faktura-seller-v1";

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

const fieldClass =
  "kit-field w-full rounded-[10px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)]";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`kit-touch-target rounded-[8px] border px-2.5 py-1.5 text-xs sm:min-h-0 ${
        active
          ? "border-accent bg-accent text-on-accent"
          : "border-border bg-surface text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function FakturaTool() {
  const { locale } = useLanguage();
  const da = locale === "da";
  const issueDefault = today();

  const [sellerName, setSellerName] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [sellerCvr, setSellerCvr] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");

  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerCvr, setBuyerCvr] = useState("");

  const [invoiceNo, setInvoiceNo] = useState(
    `${new Date().getFullYear()}-001`,
  );
  const [issueDate, setIssueDate] = useState(issueDefault);
  const [dueTerm, setDueTerm] = useState<DueTerm>("14");
  const [dueDate, setDueDate] = useState(plusDays(issueDefault, 14));
  const [deliveryDate, setDeliveryDate] = useState("");
  const [vatPct, setVatPct] = useState("25");
  const [discountPct, setDiscountPct] = useState("");
  const [currency, setCurrency] = useState(da ? "DKK" : "EUR");
  const [reverseCharge, setReverseCharge] = useState(false);
  const [poReference, setPoReference] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    da ? "Netto 14 dage" : "Net 14 days",
  );
  const [notes, setNotes] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sellerReady, setSellerReady] = useState(false);

  const [lines, setLines] = useState<Line[]>([
    {
      id: "1",
      desc: "",
      qty: "1",
      unit: da ? "stk" : "pcs",
      price: "",
    },
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SELLER_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Record<string, string>;
        if (data.name) setSellerName(data.name);
        if (data.address) setSellerAddress(data.address);
        if (data.cvr) setSellerCvr(data.cvr);
        if (data.email) setSellerEmail(data.email);
        if (data.phone) setSellerPhone(data.phone);
        if (data.bankName) setBankName(data.bankName);
        if (data.bankAccount) setBankAccount(data.bankAccount);
      }
    } catch {
      // Ignore bad local storage.
    }
    setSellerReady(true);
  }, []);

  useEffect(() => {
    if (!sellerReady) return;
    try {
      localStorage.setItem(
        SELLER_STORAGE_KEY,
        JSON.stringify({
          name: sellerName,
          address: sellerAddress,
          cvr: sellerCvr,
          email: sellerEmail,
          phone: sellerPhone,
          bankName,
          bankAccount,
        }),
      );
    } catch {
      // Ignore quota errors.
    }
  }, [
    sellerReady,
    sellerName,
    sellerAddress,
    sellerCvr,
    sellerEmail,
    sellerPhone,
    bankName,
    bankAccount,
  ]);

  function applyDueTerm(term: DueTerm, fromDate = issueDate) {
    setDueTerm(term);
    if (term === "custom") return;
    const days = Number(term);
    setDueDate(plusDays(fromDate, days));
    setPaymentTerms(
      da ? `Netto ${days} dage` : `Net ${days} days`,
    );
  }

  function onIssueDateChange(value: string) {
    setIssueDate(value);
    if (dueTerm !== "custom") {
      applyDueTerm(dueTerm, value);
    }
  }

  const totals = useMemo(() => {
    const parsed = lines.map((line) => {
      const qty = parseNum(line.qty);
      const price = parseNum(line.price);
      return { ...line, qty, price, sum: qty * price };
    });
    const base = computeInvoiceTotals({
      lines: parsed.map((line) => ({
        desc: line.desc,
        qty: line.qty,
        unit: line.unit,
        price: line.price,
      })),
      discountPct: parseNum(discountPct),
      vatPct: parseNum(vatPct),
      reverseCharge,
    });
    return {
      ...base,
      lines: parsed,
      currency: currency.trim() || (da ? "DKK" : "EUR"),
    };
  }, [lines, discountPct, vatPct, reverseCharge, currency, da]);

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
        sellerAddress,
        sellerCvr,
        sellerEmail,
        sellerPhone,
        buyerName,
        buyerAddress,
        buyerCvr,
        invoiceNo,
        issueDate,
        dueDate,
        deliveryDate,
        currency: totals.currency,
        vatPct: parseNum(vatPct),
        discountPct: parseNum(discountPct),
        reverseCharge,
        poReference,
        bankName,
        bankAccount,
        paymentReference: paymentReference.trim() || invoiceNo,
        paymentTerms,
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

  const missingCore =
    !sellerName.trim() ||
    !sellerAddress.trim() ||
    !sellerCvr.trim() ||
    !buyerName.trim() ||
    !buyerAddress.trim() ||
    !invoiceNo.trim() ||
    !issueDate ||
    totals.lines.every((line) => !line.desc.trim() && line.price === 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,22rem)] xl:items-start xl:gap-12">
      <div className="space-y-10">
        <section className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4 rounded-[14px] border border-border bg-surface/60 p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Fra (dig)" : "From (you)"}
            </p>
            <Field label={da ? "Firmanavn" : "Company name"}>
              <KitInput
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder={da ? "Dit firma ApS" : "Your company Ltd"}
              />
            </Field>
            <Field label={da ? "Adresse" : "Address"}>
              <textarea
                rows={3}
                className={fieldClass}
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder={
                  da
                    ? "Vej 1\n2100 København Ø"
                    : "1 Example Street\nCity 1000"
                }
              />
            </Field>
            <Field label={da ? "CVR-nr." : "VAT / company ID"}>
              <KitInput
                value={sellerCvr}
                onChange={(e) => setSellerCvr(e.target.value)}
                placeholder={da ? "12345678" : "GB123456789"}
              />
            </Field>
            <p className="text-xs text-muted">
              {da
                ? "Dit firma gemmes på denne enhed."
                : "Your company details are saved on this device."}
            </p>
          </div>

          <div className="space-y-4 rounded-[14px] border border-border bg-surface/60 p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {da ? "Til (kunde)" : "Bill to"}
            </p>
            <Field label={da ? "Kundenavn" : "Customer name"}>
              <KitInput
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder={da ? "Kunde A/S" : "Customer Inc"}
              />
            </Field>
            <Field label={da ? "Adresse" : "Address"}>
              <textarea
                rows={3}
                className={fieldClass}
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder={
                  da ? "Kundegade 12\n8000 Aarhus C" : "12 Client Ave\nTown 2000"
                }
              />
            </Field>
            <Field
              label={da ? "Kundens CVR (valgfrit)" : "Buyer VAT ID (optional)"}
            >
              <KitInput
                value={buyerCvr}
                onChange={(e) => setBuyerCvr(e.target.value)}
                placeholder={da ? "87654321" : "EU987654321"}
              />
            </Field>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          <Field label={da ? "Fakturanr." : "Invoice no."}>
            <KitInput
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </Field>
          <Field label={da ? "Fakturadato" : "Invoice date"}>
            <KitInput
              type="date"
              value={issueDate}
              onChange={(e) => onIssueDateChange(e.target.value)}
            />
          </Field>
          <Field label={da ? "Moms %" : "VAT %"}>
            <KitInput
              value={vatPct}
              onChange={(e) => setVatPct(e.target.value)}
              disabled={reverseCharge}
            />
          </Field>
          <Field label={da ? "Valuta" : "Currency"}>
            <KitInput
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder={da ? "DKK" : "EUR"}
            />
          </Field>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {da ? "Linjer" : "Line items"}
              </p>
              <p className="text-sm text-muted">
                {da
                  ? "Priser er ekskl. moms."
                  : "Prices are excl. VAT."}
              </p>
            </div>
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
                    price: "",
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
              className="space-y-4 rounded-[14px] border border-border bg-surface p-4 sm:p-5"
            >
              <Field label={da ? "Beskrivelse" : "Description"}>
                <KitInput
                  value={line.desc}
                  onChange={(e) => updateLine(index, { desc: e.target.value })}
                  placeholder={da ? "Ydelse eller vare" : "Service or item"}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label={da ? "Antal" : "Qty"}>
                  <KitInput
                    value={line.qty}
                    onChange={(e) => updateLine(index, { qty: e.target.value })}
                  />
                </Field>
                <Field label={da ? "Enhed" : "Unit"}>
                  <KitInput
                    value={line.unit}
                    onChange={(e) =>
                      updateLine(index, { unit: e.target.value })
                    }
                  />
                </Field>
                <Field label={da ? "Pris ekskl. moms" : "Price excl. VAT"}>
                  <KitInput
                    value={line.price}
                    onChange={(e) =>
                      updateLine(index, { price: e.target.value })
                    }
                  />
                </Field>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                <p className="text-sm text-muted">
                  {da ? "Linjebeløb" : "Line total"}{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {money(parseNum(line.qty) * parseNum(line.price), locale)}{" "}
                    {totals.currency}
                  </span>
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
        </section>

        <div className="rounded-[14px] border border-border bg-surface px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 text-sm">
              <p className="text-muted">
                {da ? "Subtotal" : "Subtotal"}:{" "}
                <span className="tabular-nums text-foreground">
                  {money(totals.subtotal, locale)} {totals.currency}
                </span>
              </p>
              {totals.discount > 0.005 ? (
                <p className="text-muted">
                  {da ? "Rabat" : "Discount"}:{" "}
                  <span className="tabular-nums text-foreground">
                    −{money(totals.discount, locale)} {totals.currency}
                  </span>
                </p>
              ) : null}
              <p className="text-muted">
                {da ? "Moms" : "VAT"}:{" "}
                <span className="tabular-nums text-foreground">
                  {money(totals.vatAmount, locale)} {totals.currency}
                </span>
              </p>
              <p className="text-base font-medium">
                {da ? "Total" : "Total"}:{" "}
                <span className="tabular-nums text-accent">
                  {money(totals.gross, locale)} {totals.currency}
                </span>
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
          </div>
          {missingCore ? (
            <p className="mt-4 text-sm text-muted">
              {da
                ? "Tilføj firmanavn, adresse, CVR, kunde, fakturanr., dato og mindst én linje."
                : "Add company name, address, VAT ID, customer, invoice number, date, and at least one line."}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              {da
                ? "Alt kører i browseren. Intet sendes til en server."
                : "Everything runs in your browser. Nothing is uploaded."}
            </p>
          )}
        </div>

        <details
          className="rounded-[14px] border border-border bg-surface/40 open:bg-surface/70"
          open={moreOpen}
          onToggle={(e) => setMoreOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span>{da ? "Flere indstillinger" : "More settings"}</span>
              <span className="text-sm font-normal text-muted">
                {da
                  ? "Levering, forfald, bank, rabat"
                  : "Delivery, due date, bank, discount"}
              </span>
            </span>
          </summary>

          <div className="space-y-6 border-t border-border px-5 py-5 sm:px-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">
                {da ? "Forfald" : "Due date"}
              </p>
              <div className="flex flex-wrap gap-2">
                {(["8", "14", "30"] as const).map((term) => (
                  <Chip
                    key={term}
                    active={dueTerm === term}
                    onClick={() => applyDueTerm(term)}
                  >
                    {da ? `Netto ${term}` : `Net ${term}`}
                  </Chip>
                ))}
                <Chip
                  active={dueTerm === "custom"}
                  onClick={() => applyDueTerm("custom")}
                >
                  {da ? "Vælg dato" : "Pick date"}
                </Chip>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={da ? "Forfaldsdato" : "Due date"}>
                  <KitInput
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueTerm("custom");
                      setDueDate(e.target.value);
                    }}
                  />
                </Field>
                <Field label={da ? "Betalingsbetingelser" : "Payment terms"}>
                  <KitInput
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder={da ? "Netto 14 dage" : "Net 14 days"}
                  />
                </Field>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={da ? "Leveringsdato" : "Delivery date"}
                hint={
                  da
                    ? "Kun hvis levering er en anden dag end fakturadatoen."
                    : "Only if delivery differs from the invoice date."
                }
              >
                <KitInput
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </Field>
              <Field
                label={da ? "Ordre- / PO-reference" : "Order / PO reference"}
              >
                <KitInput
                  value={poReference}
                  onChange={(e) => setPoReference(e.target.value)}
                  placeholder={da ? "PO-123" : "PO-123"}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={da ? "Rabat %" : "Discount %"}>
                <KitInput
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  placeholder="0"
                />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border accent-[var(--accent)]"
                  checked={reverseCharge}
                  onChange={(e) => setReverseCharge(e.target.checked)}
                />
                <span>
                  {da
                    ? "Omvendt betalingspligt (0% moms)"
                    : "Reverse charge (0% VAT)"}
                </span>
              </label>
            </div>

            <div className="space-y-4 rounded-[12px] border border-border/80 bg-background/50 p-4 sm:p-5">
              <p className="text-sm font-medium">
                {da ? "Betaling" : "Payment"}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={da ? "Bank" : "Bank"}>
                  <KitInput
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder={da ? "Banknavn" : "Bank name"}
                  />
                </Field>
                <Field label={da ? "Konto / IBAN" : "Account / IBAN"}>
                  <KitInput
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder={da ? "1234-5678901234" : "IBAN"}
                  />
                </Field>
              </div>
              <Field
                label={da ? "Betalingsreference" : "Payment reference"}
                hint={
                  da
                    ? "Tom = brug fakturanummeret."
                    : "Leave empty to use the invoice number."
                }
              >
                <KitInput
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={invoiceNo}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={da ? "Din e-mail" : "Your email"}>
                <KitInput
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  placeholder="faktura@firma.dk"
                />
              </Field>
              <Field label={da ? "Dit telefonnr." : "Your phone"}>
                <KitInput
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  placeholder="+45 12 34 56 78"
                />
              </Field>
            </div>

            <Field
              label={da ? "Ekstra bemærkning" : "Extra notes"}
              hint={
                da
                  ? "Valgfri tekst under betalingsafsnittet."
                  : "Optional text under the payment section."
              }
            >
              <textarea
                rows={3}
                className={fieldClass}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </div>
        </details>
      </div>

      <aside className="xl:sticky xl:top-20">
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted">
          {da ? "Forhåndsvisning" : "Preview"}
        </p>
        <div className="overflow-hidden rounded-[14px] border border-border bg-paper text-paper-ink shadow-[0_18px_50px_rgba(20,30,24,0.08)]">
          <div className="h-1.5 bg-accent" />
          <div className="space-y-7 p-6 sm:p-8">
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
                {deliveryDate ? (
                  <div className="flex justify-end gap-3">
                    <dt className="text-muted">{da ? "Levering" : "Delivery"}</dt>
                    <dd className="font-medium">
                      {formatDateLabel(deliveryDate, locale)}
                    </dd>
                  </div>
                ) : null}
                {dueDate ? (
                  <div className="flex justify-end gap-3">
                    <dt className="text-muted">{da ? "Forfald" : "Due"}</dt>
                    <dd className="font-medium">
                      {formatDateLabel(dueDate, locale)}
                    </dd>
                  </div>
                ) : null}
                {poReference.trim() ? (
                  <div className="flex justify-end gap-3">
                    <dt className="text-muted">{da ? "Ref." : "Ref."}</dt>
                    <dd className="font-medium">{poReference}</dd>
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
                  {[
                    sellerAddress,
                    sellerCvr
                      ? da
                        ? `CVR ${sellerCvr}`
                        : `VAT ${sellerCvr}`
                      : "",
                    sellerEmail,
                    sellerPhone,
                  ]
                    .filter(Boolean)
                    .join("\n")}
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
                  {[
                    buyerAddress,
                    buyerCvr
                      ? da
                        ? `CVR ${buyerCvr}`
                        : `VAT ${buyerCvr}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join("\n")}
                </p>
              </div>
            </div>

            {reverseCharge ? (
              <p className="text-xs font-medium text-accent">
                {da
                  ? "Moms: omvendt betalingspligt (reverse charge)."
                  : "VAT: reverse charge."}
              </p>
            ) : null}

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
                      {da ? "Pris ekskl." : "Price excl."}
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
                  <span>{da ? "Subtotal" : "Subtotal"}</span>
                  <span className="tabular-nums text-foreground">
                    {money(totals.subtotal, locale)} {totals.currency}
                  </span>
                </div>
                {totals.discount > 0.005 ? (
                  <div className="mt-1.5 flex justify-between gap-4 text-muted">
                    <span>{da ? "Rabat" : "Discount"}</span>
                    <span className="tabular-nums text-foreground">
                      −{money(totals.discount, locale)} {totals.currency}
                    </span>
                  </div>
                ) : null}
                <div className="mt-1.5 flex justify-between gap-4 text-muted">
                  <span>
                    {reverseCharge
                      ? da
                        ? "Moms (0%)"
                        : "VAT (0%)"
                      : `${da ? "Moms" : "VAT"} (${money(totals.vatPct, locale)}%)`}
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

            {paymentTerms || bankName || bankAccount || paymentReference || notes ? (
              <div className="space-y-3 border-t border-border/70 pt-4 text-[13px]">
                {paymentTerms || bankName || bankAccount || paymentReference ? (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      {da ? "Betaling" : "Payment"}
                    </p>
                    <div className="mt-1 space-y-0.5 leading-relaxed text-foreground">
                      {paymentTerms ? <p>{paymentTerms}</p> : null}
                      {bankName || bankAccount ? (
                        <p>
                          {[bankName, bankAccount].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      <p>
                        {da ? "Reference" : "Reference"}:{" "}
                        {paymentReference.trim() || invoiceNo || "—"}
                      </p>
                    </div>
                  </div>
                ) : null}
                {notes.trim() ? (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                      {da ? "Bemærkning" : "Notes"}
                    </p>
                    <p className="mt-1 whitespace-pre-line leading-relaxed text-foreground">
                      {notes}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {da
            ? "Layoutet følger typiske danske fakturakrav. Ikke en bogføringsløsning."
            : "The layout follows common VAT invoice requirements. Not accounting software."}
        </p>
      </aside>
    </div>
  );
}
