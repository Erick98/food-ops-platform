"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { } from '@/components/ui/input';
import { Wallet, Lock, Unlock, CreditCard, Banknote, History, Receipt } from 'lucide-react';

export default function CashRegisterClient({ shift, cutoff }: { shift: Record<string, unknown>, cutoff: Record<string, unknown> }) {
  const [isOpen, ] = useState(!!shift);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F8FAFC] dark:bg-background h-full">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isOpen ? 'bg-green-100' : 'bg-slate-100'}`}>
              <Wallet className={`w-8 h-8 ${isOpen ? 'text-green-600' : 'text-slate-500'}`} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Arqueo de Caja</h1>
              <p className="text-slate-500 font-medium mt-1">
                Estado actual: <strong className={isOpen ? 'text-green-600' : 'text-slate-500'}>{isOpen ? 'CAJA ABIERTA' : 'CAJA CERRADA'}</strong>
              </p>
            </div>
          </div>
          <Button 
            className={`h-12 px-6 rounded-xl font-bold shadow-lg ${isOpen ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-primary shadow-primary/20'}`}
          >
            {isOpen ? <><Lock className="w-5 h-5 mr-2" /> Cerrar Turno</> : <><Unlock className="w-5 h-5 mr-2" /> Abrir Turno</>}
          </Button>
        </div>

        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Receipt className="w-5 h-5 text-primary" /> Resumen del Turno
                </CardTitle>
                <CardDescription>Corte de caja estimado al momento</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm"><Banknote className="w-5 h-5 text-green-600"/></div>
                      <span className="font-bold text-slate-700">Fondo Inicial</span>
                    </div>
                    <span className="font-mono text-xl font-bold">${shift?.starting_cash || 500}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm"><Banknote className="w-5 h-5 text-emerald-600"/></div>
                      <span className="font-bold text-slate-700">Ventas Efectivo</span>
                    </div>
                    <span className="font-mono text-xl font-bold">${cutoff?.totalEfectivo || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm"><CreditCard className="w-5 h-5 text-blue-600"/></div>
                      <span className="font-bold text-slate-700">Ventas Tarjeta</span>
                    </div>
                    <span className="font-mono text-xl font-bold">${cutoff?.totalTarjeta || 0}</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-slate-800">Efectivo Esperado en Caja</span>
                    <span className="text-3xl font-black text-primary font-mono">
                      ${(shift?.starting_cash || 500) + (cutoff?.totalEfectivo || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl bg-white">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 rounded-t-3xl">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <History className="w-5 h-5 text-primary" /> Entradas y Salidas
                </CardTitle>
                <CardDescription>Retiros de efectivo o pagos a proveedores</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-4">
                  <History className="w-12 h-12 opacity-20" />
                  <p className="font-medium">No hay movimientos registrados hoy</p>
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold mt-4 bg-slate-50 hover:bg-slate-100">
                  Registrar Movimiento
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
