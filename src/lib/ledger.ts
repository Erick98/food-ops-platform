import { createClient } from "@/utils/supabase/server";

export async function recordLedgerEntry(params: {
  tenantId: string;
  transactionRef: string;
  transactionType: "expense" | "sale" | "cash_deposit" | "shift_open" | "shift_close";
  idempotencyKey: string;
  description: string;
  lines: {
    accountId: string;
    debit: number;
    credit: number;
  }[];
}) {
  const supabase = createClient();
  
  // 1. Crear el Entry
  const { data: entry, error: entryError } = await supabase
    .from("ledger_entries")
    .insert({
      tenant_id: params.tenantId,
      transaction_ref: params.transactionRef,
      transaction_type: params.transactionType,
      idempotency_key: params.idempotencyKey,
      description: params.description,
    })
    .select("id")
    .single();

  if (entryError) {
    console.error("Error creating ledger entry:", entryError);
    return { error: entryError.message };
  }

  // 2. Crear las Lines
  const linesToInsert = params.lines.map(line => ({
    entry_id: entry.id,
    account_id: line.accountId,
    debit: line.debit,
    credit: line.credit
  }));

  const { error: linesError } = await supabase
    .from("ledger_lines")
    .insert(linesToInsert);

  if (linesError) {
    console.error("Error creating ledger lines:", linesError);
    // Idealmente esto sería una transacción RPC en Postgres para asegurar integridad.
    return { error: linesError.message };
  }

  return { success: true, entryId: entry.id };
}

export async function getAccountByName(tenantId: string, name: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ledger_accounts")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("name", name)
    .single();
    
  if (error) return null;
  return data.id;
}
