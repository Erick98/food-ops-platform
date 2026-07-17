/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Clock, Plus, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { clockIn, clockOut, createSettlement, markSettlementPaid } from "../actions"

export function PayrollClient({ attendanceLogs, payrollSettlements, staff }: { attendanceLogs: any[], payrollSettlements: any[], staff: any[] }) {
  const [activeTab, setActiveTab] = useState<"attendance" | "settlements">("attendance")
  const [isClockModalOpen, setClockModalOpen] = useState(false)
  const [isSettlementModalOpen, setSettlementModalOpen] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState("")

  // Form states for settlement
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [totalHours, setTotalHours] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [bonuses, setBonuses] = useState("0")
  const [deductions, setDeductions] = useState("0")
  const [notes, setNotes] = useState("")

  const handleClockIn = async () => {
    if (!selectedProfileId) return
    try {
      await clockIn(selectedProfileId)
      setClockModalOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleClockOut = async (id: string) => {
    try {
      await clockOut(id)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateSettlement = async () => {
    if (!selectedProfileId || !periodStart || !periodEnd || !totalHours || !hourlyRate) return
    try {
      await createSettlement({
        profile_id: selectedProfileId,
        period_start: periodStart,
        period_end: periodEnd,
        total_hours: parseFloat(totalHours),
        hourly_rate: parseFloat(hourlyRate),
        bonuses: parseFloat(bonuses) || 0,
        deductions: parseFloat(deductions) || 0,
        notes
      })
      setSettlementModalOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      await markSettlementPaid(id)
    } catch(e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nómina y Asistencia</h1>
          <p className="text-slate-500">Gestión de turnos de personal y liquidaciones de pago</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "attendance" ? (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setClockModalOpen(true)}>
              <Clock className="w-4 h-4 mr-2" />
              Registrar Entrada
            </Button>
          ) : (
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setSettlementModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Liquidación
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`pb-2 px-1 text-sm font-medium ${
            activeTab === "attendance" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Control de Asistencia
        </button>
        <button
          onClick={() => setActiveTab("settlements")}
          className={`pb-2 px-1 text-sm font-medium ${
            activeTab === "settlements" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Liquidaciones
        </button>
      </div>

      {activeTab === "attendance" && (
        <div className="bg-white rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No hay registros de asistencia recientes.
                  </TableCell>
                </TableRow>
              ) : (
                attendanceLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.profiles?.full_name || 'Desconocido'}
                    </TableCell>
                    <TableCell>{new Date(log.clock_in).toLocaleString()}</TableCell>
                    <TableCell>{log.clock_out ? new Date(log.clock_out).toLocaleString() : '--'}</TableCell>
                    <TableCell>
                      {log.clock_out ? (
                        <Badge variant="secondary">Completado</Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800">En Turno</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!log.clock_out && (
                        <Button size="sm" variant="outline" onClick={() => handleClockOut(log.id)}>
                          Marcar Salida
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {activeTab === "settlements" && (
        <div className="bg-white rounded-xl border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Neto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollSettlements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No hay liquidaciones registradas.
                  </TableCell>
                </TableRow>
              ) : (
                payrollSettlements.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.profiles?.full_name || 'Desconocido'}
                    </TableCell>
                    <TableCell>{s.period_start} a {s.period_end}</TableCell>
                    <TableCell>{s.total_hours}h</TableCell>
                    <TableCell className="font-bold text-emerald-600">${Number(s.net_pay).toFixed(2)}</TableCell>
                    <TableCell>
                      {s.status === 'paid' ? (
                        <Badge className="bg-emerald-100 text-emerald-800">Pagado</Badge>
                      ) : (
                        <Badge variant="secondary">Borrador</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.status !== 'paid' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkPaid(s.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Marcar Pagado
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Clock In Modal */}
      <Dialog open={isClockModalOpen} onOpenChange={setClockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Entrada de Turno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Empleado</Label>
              <Select onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClockModalOpen(false)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleClockIn}>Iniciar Turno</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settlement Modal */}
      <Dialog open={isSettlementModalOpen} onOpenChange={setSettlementModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Liquidación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Empleado</Label>
              <Select onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inicio Periodo</Label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Fin Periodo</Label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horas Totales</Label>
                <Input type="number" step="0.5" value={totalHours} onChange={(e) => setTotalHours(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tarifa por Hora ($)</Label>
                <Input type="number" step="1" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bonos / Propinas ($)</Label>
                <Input type="number" step="1" value={bonuses} onChange={(e) => setBonuses(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Deducciones ($)</Label>
                <Input type="number" step="1" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input placeholder="Ej. Incluye bono de puntualidad" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettlementModalOpen(false)}>Cancelar</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateSettlement}>Generar Liquidación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
