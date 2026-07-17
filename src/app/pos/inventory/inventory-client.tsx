"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Plus, AlertTriangle, ArrowUpDown } from 'lucide-react';

export default function InventoryClient({ inventory = [] }: { inventory?: Record<string, unknown>[] }) {
  const [search, setSearch] = useState('');

  const filtered = inventory.filter(item => 
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F8FAFC] dark:bg-background h-full">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Inventario (Insumos)</h1>
              <p className="text-slate-500 font-medium mt-1">Gestión de materia prima, mermas y alertas de stock.</p>
            </div>
          </div>
          <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" /> Nuevo Insumo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Insumos</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-4xl font-black text-slate-900">{inventory.length}</div>
             </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Stock Bajo (Alertas)</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-4xl font-black text-amber-600">
                 {inventory.filter(i => i.quantity <= i.min_quantity).length}
               </div>
             </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Valor en Almacén</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-4xl font-black text-slate-900">
                 ${inventory.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit), 0).toLocaleString()}
               </div>
             </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Buscar insumo por nombre..." 
                className="pl-11 h-12 rounded-2xl bg-white border-slate-200 shadow-sm focus-visible:ring-primary text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="h-12 rounded-xl bg-white">Exportar CSV</Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider flex items-center cursor-pointer hover:text-slate-800">Insumo <ArrowUpDown className="w-3 h-3 ml-2"/></th>
                  <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Stock Actual</th>
                  <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Mínimo (Alerta)</th>
                  <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Costo Unitario</th>
                  <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Valor Total</th>
                  <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.min_quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className={`font-mono text-sm px-3 py-1 ${isLow ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-100 text-slate-700'}`}>
                          {item.quantity} {item.unit}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-500 font-medium">{item.min_quantity} {item.unit}</span>
                        {isLow && <AlertTriangle className="w-4 h-4 inline ml-2 text-amber-500" />}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        ${item.cost_per_unit}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ${(item.quantity * item.cost_per_unit).toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-primary hover:bg-primary/10 font-bold">
                          Ajustar
                        </Button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      No se encontraron insumos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
