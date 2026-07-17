import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Plus, Award } from "lucide-react"

async function getCustomers() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return []

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching customers:", error)
    return []
  }
  return data
}

async function addCustomer(formData: FormData) {
  "use server"
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) redirect("/login")

  const tenant_id = userData.user.user_metadata?.tenant_id
  if (!tenant_id) return

  const first_name = formData.get("first_name")?.toString()
  const last_name = formData.get("last_name")?.toString() || ""
  const email = formData.get("email")?.toString() || ""
  const phone = formData.get("phone")?.toString() || ""

  if (!first_name) return

  const { error } = await supabase.from("customers").insert({
    tenant_id,
    first_name,
    last_name,
    email,
    phone,
    loyalty_points: 0
  })

  if (error) {
    console.error("Error creating customer:", error)
  }

  revalidatePath("/pos/customers")
}

export default async function CustomersPage() {
  const customers = await getCustomers()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Directorio de Clientes</h1>
          <p className="text-muted-foreground">Gestiona la base de clientes y su lealtad.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Cliente</CardTitle>
              <CardDescription>Añade un cliente a la base de datos.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={addCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="w-full border rounded p-2"
                    placeholder="Ej. Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido (opcional)</label>
                  <input
                    type="text"
                    name="last_name"
                    className="w-full border rounded p-2"
                    placeholder="Ej. Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono (opcional)</label>
                  <input
                    type="text"
                    name="phone"
                    className="w-full border rounded p-2"
                    placeholder="Ej. 55 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email (opcional)</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full border rounded p-2"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground rounded p-2 font-medium hover:bg-primary/90 flex justify-center items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Guardar Cliente
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Listado</CardTitle>
              <CardDescription>Todos tus clientes registrados.</CardDescription>
            </CardHeader>
            <CardContent>
              {customers && customers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 font-medium">Nombre</th>
                        <th className="pb-2 font-medium">Contacto</th>
                        <th className="pb-2 font-medium">Puntos Lealtad</th>
                        <th className="pb-2 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/50">
                          <td className="py-3 font-medium">
                            {c.first_name} {c.last_name}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            <div>{c.phone || "Sin teléfono"}</div>
                            <div className="text-xs">{c.email}</div>
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                              <Award className="w-3 h-3" />
                              {c.loyalty_points}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button className="text-blue-500 hover:underline text-xs">
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Aún no tienes clientes registrados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
