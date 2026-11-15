export type AspectResult = {
  ratio: string;
  width: number;
  height: number;
};

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function simplifyAspect(width: number, height: number): AspectResult | null {
  if (!(width > 0) || !(height > 0)) return null;
  const d = gcd(width, height);
  const w = Math.round(width) / d;
  const h = Math.round(height) / d;
  return { ratio: `${w}:${h}`, width: w, height: h };
}

export function scaleAspect(args: {
  width: number;
  height: number;
  targetWidth?: number;
  targetHeight?: number;
}): { width: number; height: number } | null {
  const { width, height, targetWidth, targetHeight } = args;
  if (!(width > 0) || !(height > 0)) return null;
  if (targetWidth !== undefined && targetWidth > 0) {
    return { width: targetWidth, height: (targetWidth * height) / width };
  }
  if (targetHeight !== undefined && targetHeight > 0) {
    return { width: (targetHeight * width) / height, height: targetHeight };
  }
  return null;
}
