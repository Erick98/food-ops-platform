"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { recordLedgerEntry, getAccountByName } from "@/lib/ledger";

export async function getExpenses() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: [], error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) {
    return { data: [], error: "Tenant not found" };
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function getExpenseSummary() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { total: 0, thisMonth: 0, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) return { total: 0, thisMonth: 0, error: "No tenant" };

  const { data, error } = await supabase
    .from("expenses")
    .select("amount, created_at")
    .eq("tenant_id", profile.tenant_id);

  if (error) return { total: 0, thisMonth: 0, error: error.message };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let total = 0;
  let thisMonth = 0;

  data?.forEach(exp => {
    const d = new Date(exp.created_at);
    total += Number(exp.amount);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      thisMonth += Number(exp.amount);
    }
  });

  return { total, thisMonth, error: null };
}

export async function createExpense(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) return { error: "No tenant" };

  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const categoryStr = formData.get("category") as string;
  const idempotencyKey = uuidv4();

  // 1. Resolve Category ID (assuming it exists, or create if needed)
  let categoryId = null;
  const { data: catData } = await supabase
    .from("expense_categories")
    .select("id")
    .eq("tenant_id", profile.tenant_id)
    .eq("name", categoryStr)
    .single();
  
  if (catData) {
    categoryId = catData.id;
  } else {
    // fallback creation
    const { data: newCat } = await supabase
      .from("expense_categories")
      .insert({ tenant_id: profile.tenant_id, name: categoryStr })
      .select("id")
      .single();
    if (newCat) categoryId = newCat.id;
  }

  // 2. Insert Expense
  const { data: newExpense, error } = await supabase.from("expenses").insert({
    tenant_id: profile.tenant_id,
    description,
    amount,
    category_id: categoryId,
    created_by: user.id,
    idempotency_key: idempotencyKey
  }).select("id").single();

  if (error) {
    console.error("Error creating expense:", error);
    return { error: error.message };
  }

  // 3. ARKAX Ledger Integration (Doble Partida)
  const cashAccount = await getAccountByName(profile.tenant_id, 'Caja Fija');
  const expenseAccount = await getAccountByName(profile.tenant_id, 'Gasto Operativo');

  if (cashAccount && expenseAccount && newExpense) {
    await recordLedgerEntry({
      tenantId: profile.tenant_id,
      transactionRef: newExpense.id,
      transactionType: "expense",
      idempotencyKey: `ledger_exp_${idempotencyKey}`,
      description: `Gasto: ${description}`,
      lines: [
        { accountId: expenseAccount, debit: amount, credit: 0 }, // Gasto sube por el debe
        { accountId: cashAccount, debit: 0, credit: amount }     // Caja baja por el haber
      ]
    });
  }

  revalidatePath("/pos/expenses");
  return { success: true };
}
