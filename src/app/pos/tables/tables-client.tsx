/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { Card, } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Users, CheckCircle2, Clock, Ban } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function TablesClient({ initialTables = [] }: { initialTables: any[] }) {
  const [tables, ] = useState(initialTables);
  
  const { toast } = useToast();

  const zones = Array.from(new Set(tables.map(t => t.zone)));

  const handleTableClick = (table: any) => {
    toast({
      title: `${table.name}`,
      description: `Capacidad: ${table.capacity} pax | Estado: ${table.status}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'free': return 'bg-white border-green-500 text-green-700 shadow-green-500/20';
      case 'occupied': return 'bg-primary border-primary text-white shadow-primary/40';
      case 'dirty': return 'bg-amber-100 border-amber-500 text-amber-800 shadow-amber-500/20';
      default: return 'bg-slate-100 border-slate-300 text-slate-500';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F8FAFC] dark:bg-background h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <LayoutGrid className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Mapa de Mesas</h1>
              <p className="text-slate-500 font-medium mt-1">Asignación y estado en tiempo real (Visual Editor)</p>
            </div>
          </div>
          <div className="flex gap-2 text-sm font-medium">
            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 px-3 py-1"><CheckCircle2 className="w-4 h-4 mr-1"/> Libre</Badge>
            <Badge variant="default" className="bg-primary text-primary-foreground px-3 py-1"><Users className="w-4 h-4 mr-1"/> Ocupada</Badge>
            <Badge variant="outline" className="border-amber-500 text-amber-800 bg-amber-50 px-3 py-1"><Ban className="w-4 h-4 mr-1"/> Sucia</Badge>
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl bg-white overflow-hidden">
          <Tabs defaultValue={zones[0] || 'Salón Principal'} className="w-full" >
            <div className="border-b border-slate-100 p-4 bg-slate-50">
              <TabsList className="bg-white/50 border border-slate-200">
                {zones.map(zone => (
                  <TabsTrigger key={String(zone)} value={String(zone)} className="px-6 py-2 rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                    {String(zone)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {zones.map(zone => (
              <TabsContent key={String(zone)} value={String(zone)} className="p-0 m-0">
                {/* Visual Floor Plan Background */}
                <div className="relative w-full h-[600px] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] bg-slate-50 p-8 flex flex-wrap gap-8 content-start">
                  
                  {tables.filter(t => t.zone === zone).map((table, i) => (
                    <div 
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      className={`relative flex flex-col items-center justify-center w-32 h-32 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${getStatusColor(table.status)}`}
                      style={{ animationDelay: `${i * 100}ms`, animation: 'fadeIn 0.5s ease-out forwards' }}
                    >
                      <span className="text-xl font-black">{table.name}</span>
                      <span className="text-sm font-medium flex items-center mt-1 opacity-80">
                        <Users className="w-4 h-4 mr-1"/> {table.capacity} pax
                      </span>
                      {table.status === 'occupied' && (
                        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center">
                          <Clock className="w-3 h-3 mr-1" /> 45m
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="absolute bottom-8 right-8">
                    <Button variant="default" className="shadow-lg h-12 rounded-xl font-bold">
                      Editar Plano (Drag & Drop)
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}
