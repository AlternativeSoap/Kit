import { dictionaries } from "../src/i18n/dictionaries";
import { searchTools } from "../src/lib/search";

for (const q of ["image compress", "compress image", "regex", "moms", "facebook"]) {
  const hits = searchTools(q, dictionaries.en);
  console.log(
    q,
    hits
      .slice(0, 5)
      .map(
        (h) =>
          `${h.tool.id}:score=${h.score.toFixed(1)},cs=${h.constraintsSatisfied},pop=${h.tool.popularity}`,
      )
      .join(" | "),
  );
  const sorted = [...hits].sort((a, b) => b.score - a.score);
  console.log(
    "  by score only:",
    sorted
      .slice(0, 3)
      .map((h) => `${h.tool.id}=${h.score.toFixed(1)}`)
      .join(" | "),
  );
}
