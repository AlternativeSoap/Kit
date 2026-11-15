import { dictionaries } from "../src/i18n/dictionaries";
import { searchTools } from "../src/lib/search";

const d = dictionaries.en;
for (const q of [
  "facebook",
  "instagram",
  "tiktok",
  "twitter",
  "image compress",
  "crop",
  "moms",
  "regex",
  "mortgage",
  "pdf",
]) {
  const hits = searchTools(q, d);
  console.log(
    q,
    "->",
    hits
      .slice(0, 5)
      .map((h) => `${h.tool.id}(${h.tool.surface})`)
      .join(", "),
  );
}
