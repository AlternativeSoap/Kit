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
  sellerDetails: string;
  buyerName: string;
  buyerDetails: string;
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  vatPct: number;
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
          // Hard-split very long tokens.
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

export async function buildInvoicePdf(
  input: InvoicePdfInput,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const da = input.da;
  const currency = input.currency.trim() || (da ? "DKK" : "USD");

  const net = input.lines.reduce((sum, line) => sum + line.qty * line.price, 0);
  const vatAmount = net * (input.vatPct / 100);
  const gross = net + vatAmount;

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

  // Accent bar
  page.drawRectangle({
    x: 0,
    y: PAGE_H - 6,
    width: PAGE_W,
    height: 6,
    color: ACCENT,
  });

  // Title + meta
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
    [da ? "Dato" : "Date", input.issueDate || "—"],
  ];
  if (input.dueDate.trim()) {
    metaRows.push([da ? "Forfald" : "Due", input.dueDate]);
  }
  let metaY = y - 4;
  for (const [label, value] of metaRows) {
    page.drawText(safe(label), {
      x: metaX - 150,
      y: metaY,
      size: 9,
      font,
      color: MUTED,
    });
    drawRight(page, value, metaX, metaY, 10, bold);
    metaY -= 14;
  }

  y = Math.min(y - 44, metaY - 12);

  // Parties
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

  const sellerName = wrapText(input.sellerName || "—", bold, 11, colW);
  const buyerName = wrapText(input.buyerName || "—", bold, 11, colW);
  const sellerDetails = wrapText(input.sellerDetails, font, 9.5, colW);
  const buyerDetails = wrapText(input.buyerDetails, font, 9.5, colW);

  const nameStart = y;
  const sellerY = drawLines(
    page,
    sellerName,
    leftX,
    nameStart,
    11,
    bold,
    INK,
    14,
  );
  const buyerY = drawLines(
    page,
    buyerName,
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
    sellerDetails,
    leftX,
    detailStart,
    9.5,
    font,
    MUTED,
    12,
  );
  const buyerDetailY = drawLines(
    page,
    buyerDetails,
    rightX,
    detailStart,
    9.5,
    font,
    MUTED,
    12,
  );
  y = Math.min(sellerDetailY, buyerDetailY) - 22;

  // Table header
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
    drawRight(page, da ? "Pris" : "Price", colPrice + 28, hy, 9, bold, MUTED);
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

  // Totals
  ensureSpace(110);
  y -= 10;
  const boxW = 210;
  const boxX = tableRight - boxW;
  const boxH = 78;
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
  page.drawText(safe(da ? "Netto" : "Net"), {
    x: boxX + 14,
    y: ty,
    size: 10,
    font,
    color: MUTED,
  });
  drawRight(
    page,
    `${money(net, input.locale)} ${currency}`,
    tableRight - 12,
    ty,
    10,
    font,
  );
  ty -= 16;
  page.drawText(
    safe(`${da ? "Moms" : "VAT"} (${money(input.vatPct, input.locale)}%)`),
    {
      x: boxX + 14,
      y: ty,
      size: 10,
      font,
      color: MUTED,
    },
  );
  drawRight(
    page,
    `${money(vatAmount, input.locale)} ${currency}`,
    tableRight - 12,
    ty,
    10,
    font,
  );
  ty -= 20;
  page.drawText(safe(da ? "Total" : "Total"), {
    x: boxX + 14,
    y: ty,
    size: 12,
    font: bold,
    color: INK,
  });
  drawRight(
    page,
    `${money(gross, input.locale)} ${currency}`,
    tableRight - 12,
    ty,
    12,
    bold,
    ACCENT,
  );

  y = y - boxH - 8;

  if (input.notes.trim()) {
    ensureSpace(80);
    page.drawText(safe(da ? "Bemærkning" : "Notes"), {
      x: MARGIN,
      y,
      size: 9,
      font: bold,
      color: MUTED,
    });
    y -= 14;
    const noteLines = wrapText(input.notes, font, 9.5, PAGE_W - MARGIN * 2);
    y = drawLines(page, noteLines, MARGIN, y, 9.5, font, INK, 12);
  }

  // Footer on last page
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
    {
      x: MARGIN,
      y: 26,
      size: 8,
      font,
      color: MUTED,
    },
  );

  return doc.save();
}
