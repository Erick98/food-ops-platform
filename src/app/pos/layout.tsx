import { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function POSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/20">
        {children}
      </main>
    </div>
  )
}
