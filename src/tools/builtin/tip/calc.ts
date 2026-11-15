export type TipResult = {
  tip: number;
  total: number;
  perPerson: number;
  tipPerPerson: number;
};

export function calculateTip(args: {
  bill: number;
  tipPercent: number;
  people: number;
}): TipResult | null {
  const { bill, tipPercent, people } = args;
  if (!(bill >= 0) || !(tipPercent >= 0) || !(people >= 1)) return null;
  const tip = bill * (tipPercent / 100);
  const total = bill + tip;
  return {
    tip,
    total,
    perPerson: total / people,
    tipPerPerson: tip / people,
  };
}
