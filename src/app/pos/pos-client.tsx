'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, ShoppingCart, Trash2, Plus, Minus, Printer } from 'lucide-react'
import { createOrder } from './actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
}

type CartItem = Product & {
  quantity: number;
}

type OrderReceipt = {
  id: string;
  items: CartItem[];
  subtotal: number;
  iva: number;
  total: number;
}

export type Table = {
  id: string;
  name: string;
  zone: string;
  status: string;
}

export function POSClient({ products, tables }: { products: Product[], tables: Table[] }) {
  // Extract unique categories from products, adding "Todos" at the beginning
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))]

  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastOrder, setLastOrder] = useState<OrderReceipt | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string>('')

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta
        return newQ > 0 ? { ...item, quantity: newQ } : item
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const handleCheckout = async () => {
    setIsProcessing(true)
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const iva = subtotal * 0.16
    const total = subtotal + iva
    
    const res = await createOrder(cart, total, 'cash', selectedTable || undefined)
    
    setLastOrder({
      id: res.orderId,
      items: cart,
      subtotal,
      iva,
      total
    })
    setIsReceiptOpen(true)
    
    setCart([])
    setSelectedTable('')
    setIsProcessing(false)
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const iva = subtotal * 0.16
  const total = subtotal + iva

  return (
    <div className="flex h-full">
      {/* Products Catalog */}
      <div className="flex-1 flex flex-col h-full bg-slate-50">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Nueva Orden</h1>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </header>

        {/* Categories */}
        <div className="p-4 overflow-x-auto border-b bg-white flex gap-2">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="cursor-pointer hover:border-slate-400 transition-colors"
              >
                <CardContent className="p-4 flex flex-col h-32 justify-between">
                  <div className="font-medium text-slate-800">{product.name}</div>
                  <div className="text-slate-500 text-sm">{product.category}</div>
                  <div className="font-bold text-lg mt-auto">${Number(product.price).toFixed(2)}</div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-10">
                No se encontraron productos.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Ticket */}
      <div className="w-80 lg:w-96 bg-white border-l flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Orden Actual</h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                Vaciar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Mesa:</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="flex-1 border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">🛵 Para llevar</option>
              {tables.filter(t => t.status === 'free' || t.id === selectedTable).map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.zone}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <ShoppingCart className="w-12 h-12" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-slate-500 text-sm">${Number(item.price).toFixed(2)} x {item.quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded bg-white border hover:bg-slate-100 text-slate-600">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded bg-white border hover:bg-slate-100 text-slate-600">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 ml-2 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-slate-50">
          <div className="flex justify-between mb-2 text-slate-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 text-slate-600">
            <span>IVA (16%)</span>
            <span>${iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-6 font-bold text-xl">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <Button 
            className="w-full h-12 text-lg font-medium" 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
          >
            {isProcessing ? 'Cobrando...' : `Cobrar Orden (${total.toFixed(2)})`}
          </Button>
        </div>
      </div>

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm font-mono text-sm">
          <DialogHeader className="border-b pb-4 mb-4 text-center">
            <DialogTitle className="text-xl font-bold uppercase tracking-widest text-center">BERNAV FOODS</DialogTitle>
            <p className="text-xs text-slate-500 mt-1">Ticket de Venta</p>
            <p className="text-xs text-slate-500">Orden: {lastOrder?.id}</p>
          </DialogHeader>
          
          <div className="space-y-2 mb-6">
            {lastOrder?.items.map((item: CartItem) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${lastOrder?.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>IVA (16%)</span>
              <span>${lastOrder?.iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
              <span>TOTAL</span>
              <span>${lastOrder?.total.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter className="mt-8 flex flex-col sm:flex-col gap-2">
            <Button className="w-full" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> Imprimir Ticket
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsReceiptOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
