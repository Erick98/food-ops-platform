import { redirect } from 'next/navigation'

export default function Home() {
  // Redirigir a la vista de Holding (Corporativo) por defecto en lugar de /pos
  redirect('/holding')
}
