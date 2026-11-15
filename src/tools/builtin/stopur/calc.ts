export type StopurSplit = {
  index: number;
  /** Elapsed since previous split or start. */
  deltaMs: number;
  /** Elapsed since start. */
  absoluteMs: number;
};

export function formatStopurMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const centis = Math.floor((ms % 1000) / 10);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const pad3 = (n: number) => String(n).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad2(minutes)}:${pad2(seconds)}.${pad3(centis)}`;
  }
  return `${pad2(minutes)}:${pad2(seconds)}.${pad3(centis)}`;
}

export function formatSplitsCopy(splits: readonly StopurSplit[]): string {
  return splits
    .map(
      (split) =>
        `${split.index}\t+${formatStopurMs(split.deltaMs)}\t${formatStopurMs(split.absoluteMs)}`,
    )
    .join("\n");
}