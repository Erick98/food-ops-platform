/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Trash2, Search, Coffee, CakeSlice, CreditCard, Banknote, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { createOrder } from './actions';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const MOCK_CATEGORIES = ['Todos', 'Bebidas Calientes', 'Bebidas Frías', 'Alimentos', 'Postres', 'Extras'];

export default function POSClient({ products = [] }: { products?: Record<string, unknown>[], tables?: unknown[] }) {
  const { toast } = useToast();
  const displayProducts = products.length > 0 ? products : [];
  
  const [cart, setCart] = useState<Record<string, unknown>[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [isCharging, setIsCharging] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash'|'card'|'transfer'>('card');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const addToCart = (product: Record<string, unknown>) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: Number(item.quantity) + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = Number(item.quantity) + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const handleCheckout = async () => {
    setIsCharging(true);
    try {
      const formattedCart = cart.map(item => ({
        id: String(item.id),
        name: String(item.name),
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));
      
      const response = await createOrder(formattedCart, total, paymentMethod);
      if (response.success) {
        toast({
          title: "¡Cobro Exitoso!",
          description: `La orden ha sido procesada y enviada a cocina. ID: ${response.orderId}`,
          variant: "default",
          className: "bg-green-600 text-white border-none",
        });
        setCart([]);
        setShowCheckoutModal(false);
      } else {
        toast({
          title: "Error al cobrar",
          description: response.error,
          variant: "destructive",
        });
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
    setIsCharging(false);
  }

  const total = cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);

  const filteredProducts = displayProducts.filter(p => {
    const matchCat = filter === 'Todos' || p.category === filter;
    const matchSearch = String(p.name).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#F8FAFC] dark:bg-background">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 lg:p-6 gap-6 relative">
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0 relative z-10">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-hide">
            {MOCK_CATEGORIES.map(cat => (
              <Button 
                key={cat} 
                variant={filter === cat ? "default" : "outline"}
                className={`rounded-full px-6 transition-all shadow-sm ${filter === cat ? 'shadow-primary/25' : 'bg-white hover:bg-muted'}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar platillo o bebida..." 
              className="pl-9 rounded-full bg-white shadow-sm border-muted-foreground/20 focus-visible:ring-primary h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product, idx) => (
              <Card 
                key={String(product.id)} 
                className="cursor-pointer group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                onClick={() => addToCart(product)}
                style={{ animationDelay: `${idx * 50}ms`, animation: 'fadeIn 0.5s ease-out forwards' }}
              >
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex items-center justify-center relative">
                    <div className="absolute top-2 right-2">
                       <Badge variant="secondary" className="font-mono bg-white/80 backdrop-blur-sm border-none text-primary font-bold shadow-sm">
                         ${Number(product.price)}
                       </Badge>
                    </div>
                    {product.category?.toString().includes('Bebida') ? <Coffee className="w-12 h-12 text-primary/80 group-hover:scale-110 transition-transform" /> :
                     product.category?.toString().includes('Postre') ? <CakeSlice className="w-12 h-12 text-primary/80 group-hover:scale-110 transition-transform" /> :
                     <Utensils className="w-12 h-12 text-primary/80 group-hover:scale-110 transition-transform" />}
                  </div>
                  <div className="p-4 flex flex-col justify-center text-center flex-1">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-slate-800">{String(product.name)}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{String(product.category)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-[400px] bg-white border-l flex flex-col h-full shrink-0 shadow-2xl z-20">
        <div className="p-6 border-b shrink-0 flex items-center justify-between bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl tracking-tight">Orden Nueva</h2>
              <p className="text-sm text-primary-foreground/80 font-medium">Mesa libre • Para llevar</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCart([])} className="text-primary-foreground/70 hover:text-white hover:bg-white/20 rounded-full transition-colors">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-4">
              <ShoppingCart className="w-20 h-20 opacity-50" />
              <p className="text-sm font-medium tracking-wide uppercase">La orden está vacía</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={String(item.id)} className="flex gap-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm items-center transition-all hover:border-primary/20 hover:shadow-md animate-in slide-in-from-right-4">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="font-bold text-slate-800 line-clamp-1 leading-none">{String(item.name)}</div>
                  <div className="text-sm text-primary font-medium">${Number(item.price)} c/u</div>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => updateQuantity(String(item.id), -1)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-6 text-center font-bold text-slate-800">{String(item.quantity)}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => updateQuantity(String(item.id), 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="font-bold text-lg text-slate-900 w-16 text-right">
                  ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-white shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-3xl border-t border-slate-100">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>${(total * 0.84).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>IVA (16%)</span>
              <span>${(total * 0.16).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-3xl font-black pt-4 border-t border-slate-100 text-slate-900">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
            <DialogTrigger asChild>
              <Button 
                className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0"
                disabled={cart.length === 0}
              >
                Cobrar <span className="ml-2 font-mono bg-white/20 px-3 py-1 rounded-lg">${total.toFixed(2)}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-center">Detalle de Cobro</DialogTitle>
                <DialogDescription className="text-center text-lg">
                  Total a cobrar: <strong className="text-primary">${total.toFixed(2)}</strong>
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-3 gap-3 my-6">
                <Button 
                  variant={paymentMethod === 'card' ? 'default' : 'outline'} 
                  className={`h-24 flex flex-col gap-2 rounded-2xl ${paymentMethod === 'card' ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="w-8 h-8" />
                  <span>Tarjeta</span>
                </Button>
                <Button 
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'} 
                  className={`h-24 flex flex-col gap-2 rounded-2xl ${paymentMethod === 'cash' ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Banknote className="w-8 h-8" />
                  <span>Efectivo</span>
                </Button>
                <Button 
                  variant={paymentMethod === 'transfer' ? 'default' : 'outline'} 
                  className={`h-24 flex flex-col gap-2 rounded-2xl ${paymentMethod === 'transfer' ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <Utensils className="w-8 h-8" />
                  <span>APP / QR</span>
                </Button>
              </div>

              <DialogFooter className="flex-col gap-2 sm:justify-center w-full">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold rounded-xl"
                  onClick={handleCheckout}
                  disabled={isCharging}
                >
                  {isCharging ? 'Procesando...' : 'Confirmar Pago'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
