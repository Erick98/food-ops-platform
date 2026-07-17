import ExpensesClient from "./ExpensesClient";
import { getExpenses, getExpenseSummary } from "./actions";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const { data: initialExpenses } = await getExpenses();
  const summary = await getExpenseSummary();

  return <ExpensesClient initialExpenses={initialExpenses || []} summary={summary} />;
}
