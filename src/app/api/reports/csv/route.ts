/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// GET /api/reports/csv?type=sales|inventory|mermas|expenses&from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const type = searchParams.get("type") ?? "sales"
  const from = searchParams.get("from") ?? new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]
  const to   = searchParams.get("to")   ?? new Date().toISOString().split("T")[0]
  const filename = `reporte_${type}_${from}_${to}.csv`

  let csvContent = ""

  if (type === "sales") {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id,created_at,total_amount,tax_amount,payment_method,status,table_number,profiles(full_name)")
      .gte("created_at", `${from}T00:00:00Z`)
      .lte("created_at", `${to}T23:59:59Z`)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const rows = (orders ?? []) as any[]

    csvContent = [
      "ID,Fecha,Total,IVA,Metodo_Pago,Estado,Mesa,Cajero",
      ...rows.map((o: any) => {
        const cashier = Array.isArray(o.profiles) ? (o.profiles[0]?.full_name ?? "") : (o.profiles?.full_name ?? "")
        return [o.id, o.created_at, o.total_amount, o.tax_amount, o.payment_method, o.status, o.table_number ?? "", cashier].join(",")
      }),
    ].join("\n")

  } else if (type === "inventory") {
    const { data: items, error } = await supabase
      .from("inventory_items")
      .select("id,name,unit,quantity,min_quantity,cost_per_unit,supplier,updated_at")
      .order("name")

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    csvContent = [
      "ID,Nombre,Unidad,Stock_Actual,Stock_Minimo,Costo_Unitario,Proveedor,Ultima_Actualizacion",
      ...((items ?? []) as any[]).map((i: any) =>
        [i.id, `"${i.name}"`, i.unit, i.quantity, i.min_quantity, i.cost_per_unit, i.supplier ?? "", i.updated_at].join(",")
      ),
    ].join("\n")

  } else if (type === "mermas") {
    const { data: mermas, error } = await supabase
      .from("mermas")
      .select("id,created_at,quantity_lost,cost_value,reason,inventory_items(name,unit),profiles(full_name)")
      .gte("created_at", `${from}T00:00:00Z`)
      .lte("created_at", `${to}T23:59:59Z`)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    csvContent = [
      "ID,Fecha,Insumo,Unidad,Cantidad_Perdida,Costo_MXN,Motivo,Reportado_Por",
      ...((mermas ?? []) as any[]).map((m: any) => {
        const inv = Array.isArray(m.inventory_items) ? m.inventory_items[0] : m.inventory_items
        const rep = Array.isArray(m.profiles) ? (m.profiles[0]?.full_name ?? "") : (m.profiles?.full_name ?? "")
        return [m.id, m.created_at, `"${inv?.name ?? ""}"`, inv?.unit ?? "", m.quantity_lost, m.cost_value, `"${m.reason ?? ""}"`, rep].join(",")
      }),
    ].join("\n")

  } else if (type === "expenses") {
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("id,description,amount,category,expense_date,status")
      .gte("expense_date", `${from}T00:00:00Z`)
      .lte("expense_date", `${to}T23:59:59Z`)
      .order("expense_date", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    csvContent = [
      "ID,Descripcion,Monto,Categoria,Fecha,Estado",
      ...((expenses ?? []) as any[]).map((e: any) =>
        [e.id, `"${e.description}"`, e.amount, e.category, e.expense_date, e.status].join(",")
      ),
    ].join("\n")

  } else {
    return NextResponse.json({ error: "Tipo de reporte no soportado" }, { status: 400 })
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
