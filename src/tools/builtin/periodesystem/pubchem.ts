export type PubChemCompound = {
  cid: number;
  title: string;
  formula: string;
  weight: string;
  iupacName: string;
  url: string;
};

type PubChemProperty = {
  CID?: number;
  Title?: string;
  MolecularFormula?: string;
  MolecularWeight?: string | number;
  IUPACName?: string;
};

function isUsefulHit(hit: PubChemCompound, symbols: string[]): boolean {
  // Prefer non-isotope / non-labelled titles for learning.
  const t = `${hit.title} ${hit.iupacName}`.toLowerCase();
  if (/\b(isotope|labelled|labeled|chloride-\d|sodium-\d|~\d~)\b/.test(t)) {
    return false;
  }
  // Skip charged fragments and clusters for classroom use.
  if (/[+\-]/.test(hit.formula) || /\b(ion|cation|anion)\b/.test(t)) {
    return false;
  }
  if (symbols.length === 0) return true;
  // Formula should contain each selected element symbol as a token.
  const formula = hit.formula;
  return symbols.every((sym) => {
    const re = new RegExp(`(?:^|[^a-zA-Z])${sym}(?:\\d|[^a-z]|$)`);
    return re.test(formula);
  });
}

export async function lookupFormula(
  formula: string,
  symbols: string[],
  signal?: AbortSignal,
): Promise<PubChemCompound[]> {
  const encoded = encodeURIComponent(formula);
  const url =
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/${encoded}` +
    `/property/Title,MolecularFormula,MolecularWeight,IUPACName/JSON?MaxRecords=8`;

  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) return [];
  if (!response.ok) {
    throw new Error(`PubChem ${response.status}`);
  }

  const data = (await response.json()) as {
    PropertyTable?: { Properties?: PubChemProperty[] };
  };
  const rows = data.PropertyTable?.Properties ?? [];
  const mapped: PubChemCompound[] = rows
    .filter((row) => typeof row.CID === "number")
    .map((row) => ({
      cid: row.CID as number,
      title: row.Title?.trim() || row.IUPACName?.trim() || formula,
      formula: row.MolecularFormula?.trim() || formula,
      weight: String(row.MolecularWeight ?? ""),
      iupacName: row.IUPACName?.trim() || "",
      url: `https://pubchem.ncbi.nlm.nih.gov/compound/${row.CID}`,
    }));

  const filtered = mapped.filter((hit) => isUsefulHit(hit, symbols));
  return (filtered.length > 0 ? filtered : mapped).slice(0, 5);
}

export async function lookupFormulas(
  formulas: string[],
  symbols: string[],
  signal?: AbortSignal,
): Promise<PubChemCompound[]> {
  const seen = new Set<number>();
  const out: PubChemCompound[] = [];

  for (const formula of formulas) {
    if (signal?.aborted) break;
    try {
      const hits = await lookupFormula(formula, symbols, signal);
      for (const hit of hits) {
        if (seen.has(hit.cid)) continue;
        seen.add(hit.cid);
        out.push(hit);
        if (out.length >= 10) return out;
      }
    } catch {
      // Keep going with remaining formulas.
    }
    // Soft rate limit for PubChem (~5 req/s shared).
    await new Promise((r) => setTimeout(r, 220));
  }

  return out;
}
