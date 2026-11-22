export type BudgetIncome = {
  salary: number;
  other: number;
};

export type BudgetExpense = {
  id: string;
  name: string;
  amount: number;
};

export type BudgetResult = {
  incomeTotal: number;
  expenseTotal: number;
  remaining: number;
  percentUsed: number;
  breakdown: Array<{
    id: string;
    name: string;
    amount: number;
    percentOfIncome: number;
    percentOfExpenses: number;
  }>;
};

export function calculateBudget(
  income: BudgetIncome,
  expenses: readonly BudgetExpense[],
): BudgetResult | null {
  const { salary, other } = income;
  if (![salary, other].every(Number.isFinite)) return null;
  if (salary < 0 || other < 0) return null;

  const incomeTotal = salary + other;
  const valid = expenses.filter(
    (e) => Number.isFinite(e.amount) && e.amount >= 0,
  );
  const expenseTotal = valid.reduce((sum, e) => sum + e.amount, 0);
  const remaining = incomeTotal - expenseTotal;
  const percentUsed =
    incomeTotal > 0 ? (expenseTotal / incomeTotal) * 100 : expenseTotal > 0 ? 100 : 0;

  const breakdown = valid.map((e) => ({
    id: e.id,
    name: e.name,
    amount: e.amount,
    percentOfIncome: incomeTotal > 0 ? (e.amount / incomeTotal) * 100 : 0,
    percentOfExpenses:
      expenseTotal > 0 ? (e.amount / expenseTotal) * 100 : 0,
  }));

  return {
    incomeTotal,
    expenseTotal,
    remaining,
    percentUsed,
    breakdown,
  };
}

export function defaultCategories(da: boolean): Array<{ name: string; amount: string }> {
  if (da) {
    return [
      { name: "Husleje", amount: "8000" },
      { name: "Mad", amount: "3500" },
      { name: "Transport", amount: "1200" },
      { name: "Forsikringer", amount: "800" },
      { name: "Fritid", amount: "1000" },
      { name: "Andet", amount: "500" },
    ];
  }
  return [
    { name: "Housing", amount: "8000" },
    { name: "Food", amount: "3500" },
    { name: "Transport", amount: "1200" },
    { name: "Insurance", amount: "800" },
    { name: "Leisure", amount: "1000" },
    { name: "Other", amount: "500" },
  ];
}
