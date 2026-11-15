export type SlugStyle = "kebab" | "snake" | "camel" | "pascal";

export function slugify(input: string, style: SlugStyle = "kebab"): string {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/gi, "ae")
    .replace(/ø/gi, "oe")
    .replace(/å/gi, "aa")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, "-");

  if (!base) return "";

  switch (style) {
    case "kebab":
      return base;
    case "snake":
      return base.replace(/-/g, "_");
    case "camel": {
      return base
        .split("-")
        .map((part, index) =>
          index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1),
        )
        .join("");
    }
    case "pascal": {
      return base
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    }
    default:
      return base;
  }
}
