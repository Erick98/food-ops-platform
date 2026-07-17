import { getTables, createTable, updateTableStatus } from './actions'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Coffee, AlertCircle, CheckCircle } from 'lucide-react'

export default async function TablesPage() {
  const tables = await getTables()
  
  // Group by zone
  const zones = Array.from(new Set(tables.map(t => t.zone)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mesas y Zonas</h2>
          <p className="text-muted-foreground">
            Gestión del plano del restaurante y estado de las mesas.
          </p>
        </div>
        
        {/* Simple Add Table Form */}
        <form action={async (formData) => {
          'use server';
          await createTable(formData);
        }} className="flex gap-2 items-center">
          <input 
            type="text" 
            name="name" 
            placeholder="Nombre (ej. Mesa 5)" 
            className="border p-2 rounded text-sm w-32"
            required 
          />
          <input 
            type="text" 
            name="zone" 
            placeholder="Zona" 
            className="border p-2 rounded text-sm w-32"
            required 
          />
          <input 
            type="number" 
            name="capacity" 
            placeholder="Pax" 
            className="border p-2 rounded text-sm w-20"
            defaultValue={2}
            required 
          />
          <Button type="submit" size="sm">
            <Plus className="w-4 h-4 mr-2" /> Agregar Mesa
          </Button>
        </form>
      </div>

      {zones.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No hay mesas configuradas. Agrega tu primera mesa arriba.
          </CardContent>
        </Card>
      )}

      {zones.map(zone => (
        <div key={zone} className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">{zone}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.filter(t => t.zone === zone).map(table => (
              <Card key={table.id} className={`
                relative overflow-hidden transition-all
                ${table.status === 'free' ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : ''}
                ${table.status === 'occupied' ? 'border-orange-200 bg-orange-50/50 dark:bg-orange-900/10' : ''}
                ${table.status === 'dirty' ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10' : ''}
              `}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{table.name}</CardTitle>
                    <Badge variant={
                      table.status === 'free' ? 'default' : 
                      table.status === 'occupied' ? 'destructive' : 'secondary'
                    }>
                      {table.status === 'free' && 'Libre'}
                      {table.status === 'occupied' && 'Ocupada'}
                      {table.status === 'dirty' && 'Sucia'}
                    </Badge>
                  </div>
                  <CardDescription>Pax: {table.capacity}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="mt-4 flex flex-col gap-2">
                    {table.status === 'free' && (
                      <form action={async () => {
                        'use server';
                        await updateTableStatus(table.id, 'occupied', 'mock-order-new')
                      }}>
                        <Button variant="outline" size="sm" className="w-full text-orange-600">
                          <Coffee className="w-4 h-4 mr-2" /> Ocupar
                        </Button>
                      </form>
                    )}
                    
                    {table.status === 'occupied' && (
                      <form action={async () => {
                        'use server';
                        await updateTableStatus(table.id, 'dirty')
                      }}>
                        <Button variant="outline" size="sm" className="w-full text-red-600">
                          <AlertCircle className="w-4 h-4 mr-2" /> Liberar (Sucia)
                        </Button>
                      </form>
                    )}

                    {table.status === 'dirty' && (
                      <form action={async () => {
                        'use server';
                        await updateTableStatus(table.id, 'free')
                      }}>
                        <Button variant="outline" size="sm" className="w-full text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" /> Limpia
                        </Button>
                      </form>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
