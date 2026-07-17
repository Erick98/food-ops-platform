"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
    .order("expense_date", { ascending: false });

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
    .select("amount, expense_date")
    .eq("tenant_id", profile.tenant_id);

  if (error) return { total: 0, thisMonth: 0, error: error.message };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let total = 0;
  let thisMonth = 0;

  data?.forEach(exp => {
    const d = new Date(exp.expense_date);
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
  const category = formData.get("category") as string;
  const status = formData.get("status") as string;

  const { error } = await supabase.from("expenses").insert({
    tenant_id: profile.tenant_id,
    description,
    amount,
    category,
    status,
    created_by: user.id
  });

  if (error) {
    console.error("Error creating expense:", error);
    return { error: error.message };
  }

  revalidatePath("/pos/expenses");
  return { success: true };
}
