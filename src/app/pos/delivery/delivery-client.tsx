"use client"

import { useState } from "react"
import { Plus, Bike, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createDeliveryPlatform, togglePlatformStatus } from "@/lib/actions/delivery"

interface DeliveryPlatform {
  id: string
  name: string
  commission_rate: number
  is_active: boolean
  api_key?: string | null
}

interface DeliveryOrder {
  id: string
  total_amount: number
  status: string
  external_order_id?: string | null
  delivery_platform?: { name: string } | null
}

export function DeliveryClient({
  initialPlatforms,
  initialOrders,
}: {
  initialPlatforms: DeliveryPlatform[]
  initialOrders: DeliveryOrder[]
}) {
  const [platforms, setPlatforms] = useState<DeliveryPlatform[]>(initialPlatforms)
  const [orders] = useState<DeliveryOrder[]>(initialOrders)
  const [isAdding, setIsAdding] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleAddPlatform = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAdding(true)
    setFormError(null)
    try {
      const formData = new FormData(e.currentTarget)
      await createDeliveryPlatform(formData)
      setIsDialogOpen(false)
      window.location.reload()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al añadir plataforma"
      setFormError(msg)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await togglePlatformStatus(id, currentStatus)
      setPlatforms(platforms.map(p => (p.id === id ? { ...p, is_active: !currentStatus } : p)))
    } catch {
      console.error("Error al actualizar estado de plataforma")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plataformas Activas</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platforms.filter(p => p.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Delivery (Histórico)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* PLATAFORMAS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Plataformas</CardTitle>
              <CardDescription>UberEats, Rappi, DiDi Food, etc.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Nueva
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Plataforma</DialogTitle>
                  <DialogDescription>
                    Registra una plataforma de delivery para rastrear sus comisiones y pedidos.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddPlatform} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre (ej. UberEats)</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission_rate">Comisión (%)</Label>
                    <Input id="commission_rate" name="commission_rate" type="number" step="0.01" min="0" required defaultValue="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api_key">API Key / Token (Opcional)</Label>
                    <Input id="api_key" name="api_key" type="password" />
                  </div>
                  {formError && <p className="text-sm text-red-600">{formError}</p>}
                  <Button type="submit" className="w-full" disabled={isAdding}>
                    {isAdding ? "Guardando..." : "Guardar Plataforma"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platforms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay plataformas configuradas.
                    </TableCell>
                  </TableRow>
                )}
                {platforms.map(platform => (
                  <TableRow key={platform.id}>
                    <TableCell className="font-medium">{platform.name}</TableCell>
                    <TableCell>{platform.commission_rate}%</TableCell>
                    <TableCell>
                      <Badge variant={platform.is_active ? "default" : "secondary"}>
                        {platform.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(platform.id, platform.is_active)}
                      >
                        {platform.is_active ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ÓRDENES RECIENTES DE DELIVERY */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pedidos Externos</CardTitle>
            <CardDescription>Órdenes provenientes de plataformas de delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>ID Externo</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay pedidos de delivery registrados.
                    </TableCell>
                  </TableRow>
                )}
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.delivery_platform?.name ?? "Desconocida"}
                    </TableCell>
                    <TableCell>{order.external_order_id ?? "-"}</TableCell>
                    <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "closed" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
