/**
 * Copies text and reports whether it worked. Falls back to the older
 * selection-based copy when the Clipboard API is missing, which happens on
 * pages served over plain HTTP.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or no user activation. Try the fallback below.
  }

  const active = document.activeElement as HTMLElement | null;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  try {
    field.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
    // Selecting the hidden field moved focus; hand it back to the search box.
    active?.focus();
  }
}

const MAX_PASTE_LENGTH = 4000;

/**
 * Reads clipboard text after an explicit user gesture. Never called on load.
 * Returns null when permission is denied or the API is unavailable.
 */
export async function readText(): Promise<string | null> {
  try {
    if (!navigator.clipboard?.readText) return null;
    const text = await navigator.clipboard.readText();
    if (!text) return "";
    return text.length > MAX_PASTE_LENGTH
      ? text.slice(0, MAX_PASTE_LENGTH)
      : text;
  } catch {
    return null;
  }
}

export { MAX_PASTE_LENGTH };
