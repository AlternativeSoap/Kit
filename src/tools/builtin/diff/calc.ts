export type DiffLineKind = "same" | "add" | "remove";

export type DiffLine = {
  kind: DiffLineKind;
  text: string;
};

function lcsTable(a: string[], b: string[]): number[][] {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0),
  );

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        table[i]![j] = table[i - 1]![j - 1]! + 1;
      } else {
        table[i]![j] = Math.max(table[i - 1]![j]!, table[i]![j - 1]!);
      }
    }
  }

  return table;
}

/** Line-level diff using longest common subsequence. */
export function diffLines(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split("\n");
  const linesB = textB.split("\n");
  const table = lcsTable(linesA, linesB);

  const out: DiffLine[] = [];
  let i = linesA.length;
  let j = linesB.length;

  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      stack.push({ kind: "same", text: linesA[i - 1]! });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || table[i]![j - 1]! >= table[i - 1]![j]!)) {
      stack.push({ kind: "add", text: linesB[j - 1]! });
      j -= 1;
    } else if (i > 0) {
      stack.push({ kind: "remove", text: linesA[i - 1]! });
      i -= 1;
    }
  }

  while (stack.length > 0) {
    out.push(stack.pop()!);
  }

  return out;
}

export function diffSummary(lines: DiffLine[]): {
  added: number;
  removed: number;
  unchanged: number;
} {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const line of lines) {
    if (line.kind === "add") added += 1;
    else if (line.kind === "remove") removed += 1;
    else unchanged += 1;
  }
  return { added, removed, unchanged };
}