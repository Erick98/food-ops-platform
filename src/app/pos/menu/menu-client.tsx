"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Coffee, Pizza, CakeSlice, Edit2, Trash2 } from 'lucide-react';

export default function MenuClient({ products = [] }: { products?: Record<string, unknown>[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(item => {
    const matchCat = filter === 'Todos' || item.category === filter;
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#F8FAFC] dark:bg-background h-full">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Pizza className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Menú y Precios</h1>
              <p className="text-slate-500 font-medium mt-1">Gestión del catálogo de platillos y bebidas.</p>
            </div>
          </div>
          <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" /> Nuevo Producto
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-hide">
            {categories.map(cat => (
              <Button 
                key={String(cat)} 
                variant={filter === cat ? "default" : "outline"}
                className={`rounded-full px-6 transition-all shadow-sm ${filter === cat ? 'shadow-primary/25' : 'bg-white hover:bg-slate-50'}`}
                onClick={() => setFilter(String(cat))}
              >
                {String(cat)}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Buscar producto..." 
              className="pl-11 h-12 rounded-2xl bg-white shadow-sm border-slate-200 focus-visible:ring-primary text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item, idx) => (
             <Card key={item.id} className="border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white group hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: `${idx * 50}ms`, animation: 'fadeIn 0.5s ease-out forwards' }}>
                <div className="h-32 bg-slate-50 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                  {String(item.category).includes('Bebida') ? <Coffee className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors" /> :
                   String(item.category).includes('Postre') ? <CakeSlice className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors" /> :
                   <Pizza className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors" />}
                   
                   <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white text-slate-700 hover:text-primary shadow-sm"><Edit2 className="w-4 h-4"/></Button>
                     <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white text-slate-700 hover:text-destructive shadow-sm"><Trash2 className="w-4 h-4"/></Button>
                   </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{item.name}</h3>
                    <Badge variant="default" className="font-mono bg-primary text-primary-foreground font-bold shrink-0 shadow-sm">${item.price}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-4">{item.category}</p>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <Badge variant={item.is_active ? 'secondary' : 'outline'} className={item.is_active ? 'bg-green-100 text-green-700' : 'text-slate-400'}>
                      {item.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardContent>
             </Card>
          ))}
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
