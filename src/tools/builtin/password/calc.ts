const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?";

/** Lengths the password tool offers on its slider. */
export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MAX_LENGTH = 64;
export const PASSWORD_DEFAULT_LENGTH = 16;

export type PasswordOptions = {
  length: number;
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
};

export function buildCharset(options: PasswordOptions): string {
  let set = "";
  if (options.lower) set += LOWER;
  if (options.upper) set += UPPER;
  if (options.numbers) set += NUMBERS;
  if (options.symbols) set += SYMBOLS;
  return set;
}

export function generatePassword(options: PasswordOptions): string | null {
  const length = Math.min(128, Math.max(4, Math.floor(options.length)));
  const charset = buildCharset(options);
  if (!charset) return null;

  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += charset[values[i]! % charset.length]!;
  }

  // Guarantee at least one of each selected class when length allows.
  const required: string[] = [];
  if (options.lower) required.push(LOWER[values[0]! % LOWER.length]!);
  if (options.upper) required.push(UPPER[values[1]! % UPPER.length]!);
  if (options.numbers) required.push(NUMBERS[values[2]! % NUMBERS.length]!);
  if (options.symbols) required.push(SYMBOLS[values[3]! % SYMBOLS.length]!);

  if (required.length > 0 && required.length <= length) {
    const chars = result.split("");
    for (let i = 0; i < required.length; i += 1) {
      chars[i] = required[i]!;
    }
    // Shuffle
    for (let i = chars.length - 1; i > 0; i -= 1) {
      const j = values[i]! % (i + 1);
      const tmp = chars[i]!;
      chars[i] = chars[j]!;
      chars[j] = tmp;
    }
    result = chars.join("");
  }

  return result;
}
