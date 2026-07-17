"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Trash2, Search, Coffee, Pizza, CakeSlice, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data fallback if DB fails
const MOCK_CATEGORIES = ['Todos', 'Bebidas', 'Alimentos', 'Postres', 'Extras'];
const MOCK_PRODUCTS = [
  { id: '1', name: 'Latte Vainilla', price: 65, category: 'Bebidas', icon: <Coffee className="w-8 h-8 mb-2" /> },
  { id: '2', name: 'Americano', price: 45, category: 'Bebidas', icon: <Coffee className="w-8 h-8 mb-2" /> },
  { id: '3', name: 'Matcha Frío', price: 75, category: 'Bebidas', icon: <Coffee className="w-8 h-8 mb-2" /> },
  { id: '4', name: 'Sandwich Pavo', price: 95, category: 'Alimentos', icon: <Pizza className="w-8 h-8 mb-2" /> },
  { id: '5', name: 'Croissant', price: 55, category: 'Alimentos', icon: <Pizza className="w-8 h-8 mb-2" /> },
  { id: '6', name: 'Cheesecake', price: 85, category: 'Postres', icon: <CakeSlice className="w-8 h-8 mb-2" /> },
];

export default function POSClient({ products = [] }: { products?: any[] }) {
  const displayProducts = products.length > 0 ? products : MOCK_PRODUCTS;
  
  const [cart, setCart] = useState<any[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredProducts = displayProducts.filter(p => {
    const matchCat = filter === 'Todos' || p.category === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-hide">
            {MOCK_CATEGORIES.map(cat => (
              <Button 
                key={cat} 
                variant={filter === cat ? "default" : "outline"}
                className="rounded-full px-6"
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar producto..." 
              className="pl-9 rounded-full bg-muted/50 border-none focus-visible:ring-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group overflow-hidden"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center text-center aspect-square">
                  {product.icon || <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3"><ShoppingCart className="w-6 h-6"/></div>}
                  <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{product.name}</h3>
                  <Badge variant="secondary" className="mt-2 font-mono">${product.price}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-card border-l flex flex-col h-full shrink-0 shadow-xl z-20">
        <div className="p-6 border-b shrink-0 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-md text-primary-foreground">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Orden Actual</h2>
              <p className="text-xs text-muted-foreground">Mesa 4 • Para llevar</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCart([])} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p className="text-sm font-medium">La orden está vacía</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-background border rounded-xl shadow-sm">
                <div className="flex justify-between font-medium">
                  <span className="line-clamp-1 pr-2">{item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">${item.price} c/u</span>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.id, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t bg-muted/20 shrink-0 space-y-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${(total * 0.84).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>IVA (16%)</span>
              <span>${(total * 0.16).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
          <Button 
            className="w-full h-14 text-lg font-bold shadow-lg" 
            size="lg"
            disabled={cart.length === 0}
          >
            <CheckCircle2 className="w-6 h-6 mr-2" />
            Cobrar Orden
          </Button>
        </div>
      </div>
    </div>
  );
}
