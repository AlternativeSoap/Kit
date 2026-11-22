export type IsbnKind = "isbn10" | "isbn13";

export type IsbnResult = {
  kind: IsbnKind;
  digits: string;
  checkDigit: string;
  hyphenated: string;
  valid: true;
  isbn10: string | null;
  isbn13: string | null;
  hyphenated10: string | null;
  hyphenated13: string | null;
};

export type IsbnError = {
  valid: false;
  reason: string;
  reasonDa: string;
};

function cleanIsbn(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

function isbn10CheckDigit(nine: string): string {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(nine[i]) * (10 - i);
  }
  const rem = (11 - (sum % 11)) % 11;
  return rem === 10 ? "X" : String(rem);
}

function isbn13CheckDigit(twelve: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = Number(twelve[i]);
    sum += i % 2 === 0 ? n : n * 3;
  }
  return String((10 - (sum % 10)) % 10);
}

/** Simple display hyphenation (not GS1 group-aware). */
export function hyphenateIsbn10(digits: string): string {
  if (digits.length !== 10) return digits;
  return `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`;
}

export function hyphenateIsbn13(digits: string): string {
  if (digits.length !== 13) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 12)}-${digits.slice(12)}`;
}

export function isbn10To13(isbn10: string): string | null {
  const clean = cleanIsbn(isbn10);
  if (!/^\d{9}[\dX]$/.test(clean)) return null;
  if (isbn10CheckDigit(clean.slice(0, 9)) !== clean[9]) return null;
  const twelve = `978${clean.slice(0, 9)}`;
  return twelve + isbn13CheckDigit(twelve);
}

export function isbn13To10(isbn13: string): string | null {
  const clean = cleanIsbn(isbn13);
  if (!/^\d{13}$/.test(clean)) return null;
  if (!clean.startsWith("978")) return null;
  if (isbn13CheckDigit(clean.slice(0, 12)) !== clean[12]) return null;
  const nine = clean.slice(3, 12);
  return nine + isbn10CheckDigit(nine);
}

export function analyzeIsbn(raw: string): IsbnResult | IsbnError {
  const cleaned = cleanIsbn(raw);
  if (!cleaned) {
    return {
      valid: false,
      reason: "Enter an ISBN-10 or ISBN-13.",
      reasonDa: "Indtast et ISBN-10 eller ISBN-13.",
    };
  }

  if (/^\d{9}[\dX]$/.test(cleaned)) {
    const expected = isbn10CheckDigit(cleaned.slice(0, 9));
    if (expected !== cleaned[9]) {
      return {
        valid: false,
        reason: `Invalid ISBN-10 check digit (expected ${expected}).`,
        reasonDa: `Ugyldigt ISBN-10-kontrolciffer (forventet ${expected}).`,
      };
    }
    const isbn13 = isbn10To13(cleaned)!;
    return {
      kind: "isbn10",
      digits: cleaned,
      checkDigit: cleaned[9]!,
      hyphenated: hyphenateIsbn10(cleaned),
      valid: true,
      isbn10: cleaned,
      isbn13,
      hyphenated10: hyphenateIsbn10(cleaned),
      hyphenated13: hyphenateIsbn13(isbn13),
    };
  }

  if (/^\d{13}$/.test(cleaned)) {
    if (!cleaned.startsWith("978") && !cleaned.startsWith("979")) {
      return {
        valid: false,
        reason: "ISBN-13 must start with 978 or 979.",
        reasonDa: "ISBN-13 skal starte med 978 eller 979.",
      };
    }
    const expected = isbn13CheckDigit(cleaned.slice(0, 12));
    if (expected !== cleaned[12]) {
      return {
        valid: false,
        reason: `Invalid ISBN-13 check digit (expected ${expected}).`,
        reasonDa: `Ugyldigt ISBN-13-kontrolciffer (forventet ${expected}).`,
      };
    }
    const isbn10 = cleaned.startsWith("978") ? isbn13To10(cleaned) : null;
    return {
      kind: "isbn13",
      digits: cleaned,
      checkDigit: cleaned[12]!,
      hyphenated: hyphenateIsbn13(cleaned),
      valid: true,
      isbn10,
      isbn13: cleaned,
      hyphenated10: isbn10 ? hyphenateIsbn10(isbn10) : null,
      hyphenated13: hyphenateIsbn13(cleaned),
    };
  }

  if (/^\d{9}$/.test(cleaned) || /^\d{12}$/.test(cleaned)) {
    return {
      valid: false,
      reason: "Incomplete ISBN. Add the check digit or remaining digits.",
      reasonDa: "Ufuldstændigt ISBN. Tilføj kontrolcifferet eller de manglende cifre.",
    };
  }

  if (/[^\dX]/.test(cleaned)) {
    return {
      valid: false,
      reason: "ISBN may only contain digits, spaces, hyphens, and X.",
      reasonDa: "ISBN må kun indeholde cifre, mellemrum, bindestreger og X.",
    };
  }

  return {
    valid: false,
    reason: "Length must be 10 (ISBN-10) or 13 (ISBN-13) digits.",
    reasonDa: "Længden skal være 10 (ISBN-10) eller 13 (ISBN-13) cifre.",
  };
}
