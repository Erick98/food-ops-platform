"use client";

import { useState, useEffect } from 'react';
import { updateOrderStatus } from '../actions';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, ChefHat, Play, Flame, Snowflake, Coffee } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

export default function KDSClient({ orders = [] }: { orders?: Record<string, unknown>[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState(orders);
  const [activeTab, setActiveTab] = useState('Todas');

  useEffect(() => {
    setActiveOrders(orders);
    const interval = setInterval(() => { router.refresh(); }, 10000);
    return () => clearInterval(interval);
  }, [orders, router]);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'preparing' : 'completed';
    setActiveOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o).filter(o => o.status !== 'completed'));
    const { success, error } = await updateOrderStatus(id, nextStatus);
    
    if (success && nextStatus === 'completed') {
      toast({ title: "Orden Terminada", description: "Enviada a mostrador para entrega", className: "bg-green-600 text-white" });
    } else if (!success) {
      toast({ title: "Error", description: error, variant: "destructive" });
      router.refresh(); 
    }
  }

  const getTimeElapsed = (dateString: string) => Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000);

  // Filter items logic inside orders based on Tab
  const filterOrderByZone = (order: Record<string, unknown>, zone: string) => {
    if (zone === 'Todas') return true;
    const hasItemsInZone = (order.order_items as Record<string, unknown>[])?.some((item: Record<string, unknown>) => {
      const cat = Array.isArray(item.products) ? item.products[0]?.category : item.products?.category;
      if (zone === 'Barra (Bebidas)' && String(cat).includes('Bebida')) return true;
      if (zone === 'Cocina Caliente' && String(cat).includes('Alimento')) return true;
      if (zone === 'Repostería' && String(cat).includes('Postre')) return true;
      return false;
    });
    return hasItemsInZone;
  };

  const getFilteredItems = (order: Record<string, unknown>, zone: string) => {
    if (zone === 'Todas') return (order.order_items as Record<string, unknown>[]) || [];
    return ((order.order_items as Record<string, unknown>[]) || []).filter((item: Record<string, unknown>) => {
      const cat = Array.isArray(item.products) ? item.products[0]?.category : item.products?.category;
      if (zone === 'Barra (Bebidas)' && String(cat).includes('Bebida')) return true;
      if (zone === 'Cocina Caliente' && String(cat).includes('Alimento')) return true;
      if (zone === 'Repostería' && String(cat).includes('Postre')) return true;
      return false;
    });
  };

  const zones = [
    { id: 'Todas', label: 'Todas las Zonas', icon: <ChefHat className="w-4 h-4 mr-2"/> },
    { id: 'Barra (Bebidas)', label: 'Barra (Bebidas)', icon: <Coffee className="w-4 h-4 mr-2"/> },
    { id: 'Cocina Caliente', label: 'Cocina Caliente', icon: <Flame className="w-4 h-4 mr-2"/> },
    { id: 'Repostería', label: 'Repostería / Frío', icon: <Snowflake className="w-4 h-4 mr-2"/> }
  ];

  return (
    <div className="flex flex-col h-full bg-[#111827] text-white overflow-hidden">
      <div className="p-6 pb-0 flex flex-col gap-6">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-2xl">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">KDS Multi-Zona</h1>
              <p className="text-slate-400 font-medium">Gestión de comandas por estación de producción</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300 text-lg py-1 px-4">
              Pendientes: {activeOrders.filter(o => o.status === 'pending').length}
            </Badge>
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-lg py-1 px-4">
              En Preparación: {activeOrders.filter(o => o.status === 'preparing').length}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="Todas" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
            {zones.map(z => (
              <TabsTrigger key={z.id} value={z.id} className="data-[state=active]:bg-primary data-[state=active]:text-white px-6 py-2.5 rounded-lg font-bold">
                {z.icon} {z.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="flex gap-6 h-full items-stretch">
          {activeOrders.filter(o => filterOrderByZone(o, activeTab)).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
              <ChefHat className="w-24 h-24 mb-4 opacity-20" />
              <p className="text-2xl font-bold tracking-widest uppercase">Mesa Limpia en {activeTab}</p>
            </div>
          ) : (
            activeOrders.filter(o => filterOrderByZone(o, activeTab)).map((order) => {
              const minutes = getTimeElapsed(order.created_at);
              const isWarning = minutes >= 10;
              const isUrgent = minutes >= 15;
              const isPreparing = order.status === 'preparing';
              const itemsToShow = getFilteredItems(order, activeTab);

              return (
                <Card 
                  key={order.id} 
                  className={`w-[350px] shrink-0 flex flex-col border-none shadow-2xl transition-all ${
                    isUrgent ? 'bg-red-950/40 ring-2 ring-red-500' :
                    isWarning ? 'bg-amber-950/30 ring-2 ring-amber-500/50' : 
                    isPreparing ? 'bg-slate-800/80 ring-1 ring-primary/50' : 'bg-slate-800'
                  }`}
                >
                  <CardHeader className={`pb-3 border-b ${isUrgent ? 'border-red-900/50' : isWarning ? 'border-amber-900/50' : 'border-slate-700'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                          #{String(order.id).split('-')[0].toUpperCase()}
                        </CardTitle>
                        <p className="text-sm font-medium mt-1 text-slate-400">
                          {isPreparing ? 'En preparación' : 'Nueva Orden'}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-lg px-3 py-1 border-none font-mono font-bold ${
                        isUrgent ? 'bg-red-500 text-white animate-pulse' :
                        isWarning ? 'bg-amber-500 text-white' : 
                        'bg-slate-700 text-slate-300'
                      }`}>
                        <Clock className="w-4 h-4 mr-2 inline" />
                        {minutes} min
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                    <ul className="divide-y divide-slate-700/50">
                      {itemsToShow.map((item: Record<string, unknown>, i: number) => {
                        const productName = Array.isArray(item.products) ? item.products[0]?.name : item.products?.name;
                        return (
                          <li key={i} className="p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex gap-4 items-start">
                              <span className="font-black text-2xl text-primary mt-[-2px]">{item.quantity}</span>
                              <div className="flex-1">
                                <span className="font-bold text-lg text-slate-200 leading-tight block">{productName}</span>
                                {item.notes && (
                                  <span className="text-sm text-amber-400 mt-1 block font-medium">** {item.notes}</span>
                                )}
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4 pb-4 px-4 border-t border-slate-700 shrink-0">
                    <Button 
                      className={`w-full h-16 text-xl font-bold tracking-wide rounded-xl shadow-lg transition-transform active:scale-95 ${
                        isPreparing 
                          ? 'bg-green-600 hover:bg-green-500 text-white' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                      onClick={() => handleUpdateStatus(order.id, order.status)}
                    >
                      {isPreparing ? (
                        <><CheckCircle2 className="w-6 h-6 mr-3" /> Listo en {activeTab}</>
                      ) : (
                        <><Play className="w-6 h-6 mr-3" /> Iniciar {activeTab}</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}
