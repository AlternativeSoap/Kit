import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { toWinAnsiSafe } from "../doctopdf/winansi";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const ACCENT = rgb(0.247, 0.365, 0.271);
const INK = rgb(0.12, 0.14, 0.13);
const MUTED = rgb(0.42, 0.45, 0.43);
const RULE = rgb(0.86, 0.88, 0.86);
const HEADER_BG = rgb(0.91, 0.94, 0.91);
const TOTAL_BG = rgb(0.95, 0.97, 0.95);

export type InvoiceLine = {
  desc: string;
  qty: number;
  unit: string;
  price: number;
};

export type InvoicePdfInput = {
  da: boolean;
  locale: string;
  sellerName: string;
  sellerAddress: string;
  sellerCvr: string;
  sellerEmail: string;
  sellerPhone: string;
  buyerName: string;
  buyerAddress: string;
  buyerCvr: string;
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  deliveryDate: string;
  currency: string;
  vatPct: number;
  discountPct: number;
  reverseCharge: boolean;
  poReference: string;
  bankName: string;
  bankAccount: string;
  paymentReference: string;
  paymentTerms: string;
  notes: string;
  lines: InvoiceLine[];
};

function safe(text: string) {
  return toWinAnsiSafe(text).text;
}

function money(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string, locale: string) {
  if (!iso.trim()) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "da" ? "da-DK" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const cleaned = safe(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const paragraphs = cleaned.split("\n");
  const out: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      out.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        if (current) out.push(current);
        if (font.widthOfTextAtSize(word, size) <= maxWidth) {
          current = word;
        } else {
          let chunk = "";
          for (const ch of word) {
            const tryChunk = chunk + ch;
            if (font.widthOfTextAtSize(tryChunk, size) <= maxWidth) {
              chunk = tryChunk;
            } else {
              if (chunk) out.push(chunk);
              chunk = ch;
            }
          }
          current = chunk;
        }
      }
    }
    if (current) out.push(current);
  }
  return out.length ? out : [""];
}

function drawRight(
  page: PDFPage,
  text: string,
  xRight: number,
  y: number,
  size: number,
  font: PDFFont,
  color = INK,
) {
  const t = safe(text);
  const w = font.widthOfTextAtSize(t, size);
  page.drawText(t, { x: xRight - w, y, size, font, color });
}

function drawLines(
  page: PDFPage,
  lines: string[],
  x: number,
  yStart: number,
  size: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>,
  lineHeight: number,
) {
  let y = yStart;
  for (const line of lines) {
    if (line) {
      page.drawText(line, { x, y, size, font, color });
    }
    y -= lineHeight;
  }
  return y;
}

function partyBlock(
  da: boolean,
  name: string,
  address: string,
  cvr: string,
  email: string,
  phone: string,
): string {
  const rows = [name.trim()];
  if (address.trim()) rows.push(address.trim());
  if (cvr.trim()) {
    rows.push(da ? `CVR ${cvr.trim()}` : `VAT ${cvr.trim()}`);
  }
  if (email.trim()) rows.push(email.trim());
  if (phone.trim()) rows.push(phone.trim());
  return rows.filter(Boolean).join("\n");
}

export function computeInvoiceTotals(input: {
  lines: InvoiceLine[];
  discountPct: number;
  vatPct: number;
  reverseCharge: boolean;
}) {
  const subtotal = input.lines.reduce(
    (sum, line) => sum + line.qty * line.price,
    0,
  );
  const discount = Math.max(0, subtotal * (input.discountPct / 100));
  const net = Math.max(0, subtotal - discount);
  const vatPct = input.reverseCharge ? 0 : input.vatPct;
  const vatAmount = net * (vatPct / 100);
  return { subtotal, discount, net, vatPct, vatAmount, gross: net + vatAmount };
}

export async function buildInvoicePdf(
  input: InvoicePdfInput,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const da = input.da;
  const currency = input.currency.trim() || (da ? "DKK" : "EUR");
  const totals = computeInvoiceTotals(input);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed >= 56) return;
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
    page.drawRectangle({
      x: 0,
      y: PAGE_H - 6,
      width: PAGE_W,
      height: 6,
      color: ACCENT,
    });
  };

  page.drawRectangle({
    x: 0,
    y: PAGE_H - 6,
    width: PAGE_W,
    height: 6,
    color: ACCENT,
  });

  page.drawText(safe(da ? "Faktura" : "Invoice"), {
    x: MARGIN,
    y: y - 8,
    size: 28,
    font: bold,
    color: ACCENT,
  });

  const metaX = PAGE_W - MARGIN;
  const metaRows: Array<[string, string]> = [
    [da ? "Nr." : "No.", input.invoiceNo || "—"],
    [da ? "Dato" : "Date", formatDate(input.issueDate, input.locale) || "—"],
  ];
  if (input.deliveryDate.trim()) {
    metaRows.push([
      da ? "Levering" : "Delivery",
      formatDate(input.deliveryDate, input.locale),
    ]);
  }
  if (input.dueDate.trim()) {
    metaRows.push([
      da ? "Forfald" : "Due",
      formatDate(input.dueDate, input.locale),
    ]);
  }
  if (input.poReference.trim()) {
    metaRows.push([da ? "Ref." : "Ref.", input.poReference.trim()]);
  }

  let metaY = y - 4;
  for (const [label, value] of metaRows) {
    page.drawText(safe(label), {
      x: metaX - 160,
      y: metaY,
      size: 9,
      font,
      color: MUTED,
    });
    drawRight(page, value, metaX, metaY, 10, bold);
    metaY -= 14;
  }

  y = Math.min(y - 44, metaY - 12);

  const colW = (PAGE_W - MARGIN * 2 - 24) / 2;
  const leftX = MARGIN;
  const rightX = MARGIN + colW + 24;

  page.drawText(safe(da ? "Fra" : "From"), {
    x: leftX,
    y,
    size: 9,
    font: bold,
    color: MUTED,
  });
  page.drawText(safe(da ? "Til" : "Bill to"), {
    x: rightX,
    y,
    size: 9,
    font: bold,
    color: MUTED,
  });
  y -= 16;

  const sellerText = partyBlock(
    da,
    input.sellerName,
    input.sellerAddress,
    input.sellerCvr,
    input.sellerEmail,
    input.sellerPhone,
  );
  const buyerText = partyBlock(
    da,
    input.buyerName,
    input.buyerAddress,
    input.buyerCvr,
    "",
    "",
  );

  const sellerParts = sellerText.split("\n");
  const buyerParts = buyerText.split("\n");
  const sellerNameLines = wrapText(sellerParts[0] || "—", bold, 11, colW);
  const buyerNameLines = wrapText(buyerParts[0] || "—", bold, 11, colW);
  const sellerDetailLines = wrapText(
    sellerParts.slice(1).join("\n"),
    font,
    9.5,
    colW,
  );
  const buyerDetailLines = wrapText(
    buyerParts.slice(1).join("\n"),
    font,
    9.5,
    colW,
  );

  const nameStart = y;
  const sellerY = drawLines(
    page,
    sellerNameLines,
    leftX,
    nameStart,
    11,
    bold,
    INK,
    14,
  );
  const buyerY = drawLines(
    page,
    buyerNameLines,
    rightX,
    nameStart,
    11,
    bold,
    INK,
    14,
  );
  y = Math.min(sellerY, buyerY) - 2;

  const detailStart = y;
  const sellerDetailY = drawLines(
    page,
    sellerDetailLines,
    leftX,
    detailStart,
    9.5,
    font,
    MUTED,
    12,
  );
  const buyerDetailY = drawLines(
    page,
    buyerDetailLines,
    rightX,
    detailStart,
    9.5,
    font,
    MUTED,
    12,
  );
  y = Math.min(sellerDetailY, buyerDetailY) - 22;

  if (input.reverseCharge) {
    ensureSpace(20);
    page.drawText(
      safe(
        da
          ? "Moms: omvendt betalingspligt (reverse charge)."
          : "VAT: reverse charge.",
      ),
      { x: MARGIN, y, size: 9, font: bold, color: ACCENT },
    );
    y -= 18;
  }

  const tableLeft = MARGIN;
  const tableRight = PAGE_W - MARGIN;
  const colDesc = tableLeft + 8;
  const colQty = 340;
  const colUnit = 390;
  const colPrice = 455;
  const colSum = tableRight - 8;
  const descMax = colQty - colDesc - 12;

  const drawTableHeader = () => {
    page.drawRectangle({
      x: tableLeft,
      y: y - 6,
      width: tableRight - tableLeft,
      height: 22,
      color: HEADER_BG,
    });
    const hy = y;
    page.drawText(safe(da ? "Beskrivelse" : "Description"), {
      x: colDesc,
      y: hy,
      size: 9,
      font: bold,
      color: MUTED,
    });
    drawRight(page, da ? "Antal" : "Qty", colQty + 28, hy, 9, bold, MUTED);
    page.drawText(safe(da ? "Enh." : "Unit"), {
      x: colUnit,
      y: hy,
      size: 9,
      font: bold,
      color: MUTED,
    });
    drawRight(
      page,
      da ? "Pris ekskl." : "Price excl.",
      colPrice + 28,
      hy,
      9,
      bold,
      MUTED,
    );
    drawRight(page, da ? "Beløb" : "Amount", colSum, hy, 9, bold, MUTED);
    y -= 28;
  };

  ensureSpace(28);
  drawTableHeader();

  for (const line of input.lines) {
    const sum = line.qty * line.price;
    const descLines = wrapText(line.desc || "—", font, 10, descMax);
    const rowH = Math.max(18, descLines.length * 12 + 6);
    if (y - rowH < 72) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      page.drawRectangle({
        x: 0,
        y: PAGE_H - 6,
        width: PAGE_W,
        height: 6,
        color: ACCENT,
      });
      drawTableHeader();
    }

    let textY = y;
    for (const dl of descLines) {
      page.drawText(dl, { x: colDesc, y: textY, size: 10, font, color: INK });
      textY -= 12;
    }
    const valueY = y;
    drawRight(
      page,
      money(line.qty, input.locale),
      colQty + 28,
      valueY,
      10,
      font,
    );
    page.drawText(safe(line.unit || ""), {
      x: colUnit,
      y: valueY,
      size: 10,
      font,
      color: MUTED,
    });
    drawRight(
      page,
      money(line.price, input.locale),
      colPrice + 28,
      valueY,
      10,
      font,
    );
    drawRight(page, money(sum, input.locale), colSum, valueY, 10, bold);
    y -= rowH;
    page.drawLine({
      start: { x: tableLeft, y: y + 4 },
      end: { x: tableRight, y: y + 4 },
      thickness: 0.5,
      color: RULE,
    });
  }

  const showDiscount = totals.discount > 0.005;
  const totalRows = 2 + (showDiscount ? 1 : 0) + 1;
  const boxH = 18 + totalRows * 16;
  ensureSpace(boxH + 30);
  y -= 10;
  const boxW = 220;
  const boxX = tableRight - boxW;
  page.drawRectangle({
    x: boxX,
    y: y - boxH + 14,
    width: boxW,
    height: boxH,
    color: TOTAL_BG,
  });
  page.drawRectangle({
    x: boxX,
    y: y - boxH + 14,
    width: 3,
    height: boxH,
    color: ACCENT,
  });

  let ty = y;
  page.drawText(safe(da ? "Subtotal" : "Subtotal"), {
    x: boxX + 14,
    y: ty,
    size: 10,
    font,
    color: MUTED,
  });
  drawRight(
    page,
    `${money(totals.subtotal, input.locale)} ${currency}`,
    tableRight - 12,
    ty,
    10,
    font,
  );
  ty -= 16;

  if (showDiscount) {
    page.drawText(
      safe(
        `${da ? "Rabat" : "Discount"} (${money(input.discountPct, input.locale)}%)`,
      ),
      { x: boxX + 14, y: ty, size: 10, font, color: MUTED },
    );
    drawRight(
      page,
      `−${money(totals.discount, input.locale)} ${currency}`,
      tableRight - 12,
      ty,
      10,
      font,
    );
    ty -= 16;
  }

  page.drawText(
    safe(
      input.reverseCharge
        ? da
          ? "Moms (0%, omvendt)"
          : "VAT (0%, reverse)"
        : `${da ? "Moms" : "VAT"} (${money(totals.vatPct, input.locale)}%)`,
    ),
    { x: boxX + 14, y: ty, size: 10, font, color: MUTED },
  );
  drawRight(
    page,
    `${money(totals.vatAmount, input.locale)} ${currency}`,
    tableRight - 12,
    ty,
    10,
    font,
  );
  ty -= 18;

  page.drawText(safe(da ? "Total" : "Total"), {
    x: boxX + 14,
    y: ty,
    size: 12,
    font: bold,
    color: INK,
  });
  drawRight(
    page,
    `${money(totals.gross, input.locale)} ${currency}`,
    tableRight - 12,
    ty,
    12,
    bold,
    ACCENT,
  );

  y = y - boxH - 12;

  const paymentBits: string[] = [];
  if (input.paymentTerms.trim()) {
    paymentBits.push(
      `${da ? "Betalingsbetingelser" : "Payment terms"}: ${input.paymentTerms.trim()}`,
    );
  }
  if (input.bankName.trim() || input.bankAccount.trim()) {
    const bank = [input.bankName.trim(), input.bankAccount.trim()]
      .filter(Boolean)
      .join(" · ");
    paymentBits.push(`${da ? "Betaling til" : "Pay to"}: ${bank}`);
  }
  if (input.paymentReference.trim()) {
    paymentBits.push(
      `${da ? "Angiv reference" : "Payment reference"}: ${input.paymentReference.trim()}`,
    );
  }

  if (paymentBits.length || input.notes.trim()) {
    ensureSpace(90);
    if (paymentBits.length) {
      page.drawText(safe(da ? "Betaling" : "Payment"), {
        x: MARGIN,
        y,
        size: 9,
        font: bold,
        color: MUTED,
      });
      y -= 14;
      y = drawLines(
        page,
        wrapText(paymentBits.join("\n"), font, 9.5, PAGE_W - MARGIN * 2),
        MARGIN,
        y,
        9.5,
        font,
        INK,
        12,
      );
      y -= 8;
    }
    if (input.notes.trim()) {
      page.drawText(safe(da ? "Bemærkning" : "Notes"), {
        x: MARGIN,
        y,
        size: 9,
        font: bold,
        color: MUTED,
      });
      y -= 14;
      y = drawLines(
        page,
        wrapText(input.notes, font, 9.5, PAGE_W - MARGIN * 2),
        MARGIN,
        y,
        9.5,
        font,
        INK,
        12,
      );
    }
  }

  page.drawLine({
    start: { x: MARGIN, y: 40 },
    end: { x: PAGE_W - MARGIN, y: 40 },
    thickness: 0.6,
    color: RULE,
  });
  page.drawText(
    safe(
      da
        ? "Oprettet lokalt i Kit. Ikke en bogføringsløsning."
        : "Created locally in Kit. Not accounting software.",
    ),
    { x: MARGIN, y: 26, size: 8, font, color: MUTED },
  );

  return doc.save();
}
