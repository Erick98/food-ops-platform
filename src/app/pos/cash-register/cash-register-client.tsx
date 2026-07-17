'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { openShift, closeShift } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CashRegisterClient({ initialShift, salesToday }: { initialShift: any, salesToday: any }) {
  const router = useRouter()
  const [isOpening, setIsOpening] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  
  const [startingCash, setStartingCash] = useState<string>('0')
  const [actualCash, setActualCash] = useState<string>('0')
  const [notes, setNotes] = useState<string>('')

  const activeShift = initialShift

  // Calculation for closing
  // Expected cash = Starting cash + Today's cash sales
  const cashSalesToday = salesToday?.totalEfectivo || 0
  const expectedCashInDrawer = activeShift ? Number(activeShift.starting_cash) + cashSalesToday : 0
  const difference = Number(actualCash) - expectedCashInDrawer

  async function handleOpenShift() {
    setIsOpening(true)
    const res = await openShift(Number(startingCash))
    setIsOpening(false)
    if (res?.success) {
      router.refresh()
    } else {
      alert(res?.error || 'Error al abrir turno')
    }
  }

  async function handleCloseShift() {
    if (!activeShift) return
    setIsClosing(true)
    const res = await closeShift(activeShift.id, Number(actualCash), expectedCashInDrawer, notes)
    setIsClosing(false)
    if (res?.success) {
      router.refresh()
    } else {
      alert(res?.error || 'Error al cerrar turno')
    }
  }

  if (!activeShift) {
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Abrir Turno</CardTitle>
          <CardDescription>No hay un turno de caja activo. Ingresa el fondo fijo para comenzar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startingCash">Fondo Fijo (Efectivo inicial)</Label>
              <Input
                id="startingCash"
                type="number"
                min="0"
                step="0.01"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleOpenShift} disabled={isOpening} className="w-full">
            {isOpening ? 'Abriendo...' : 'Abrir Turno'}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle>Turno Activo</CardTitle>
        <CardDescription>
          Abierto a las {new Date(activeShift.opened_at).toLocaleTimeString()} 
          {activeShift.opened_by?.full_name ? ` por ${activeShift.opened_by.full_name}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-md">
            <div>
              <p className="text-sm text-muted-foreground">Fondo Fijo</p>
              <p className="text-lg font-bold">${Number(activeShift.starting_cash).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ventas en Efectivo</p>
              <p className="text-lg font-bold">${cashSalesToday.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-primary/10 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Total Esperado en Caja</p>
            <p className="text-2xl font-bold text-primary">${expectedCashInDrawer.toFixed(2)}</p>
          </div>

          <div className="grid gap-2 mt-4">
            <Label htmlFor="actualCash">Efectivo Real Contado (Arqueo)</Label>
            <Input
              id="actualCash"
              type="number"
              min="0"
              step="0.01"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className={`p-4 rounded-md ${difference === 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : difference > 0 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
            <p className="text-sm font-semibold">
              Diferencia: ${difference.toFixed(2)} 
              {difference === 0 ? ' (Cuadrada)' : difference > 0 ? ' (Sobrante)' : ' (Faltante)'}
            </p>
          </div>

          <div className="grid gap-2 mt-2">
            <Label htmlFor="notes">Notas del Cierre</Label>
            <Textarea
              id="notes"
              placeholder="Explica cualquier faltante o sobrante, gastos pagados de la caja, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant={difference < 0 ? 'destructive' : 'default'} 
          onClick={handleCloseShift} 
          disabled={isClosing} 
          className="w-full"
        >
          {isClosing ? 'Cerrando...' : 'Cerrar Turno'}
        </Button>
      </CardFooter>
    </Card>
  )
}
