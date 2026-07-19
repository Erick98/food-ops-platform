import { ReactNode, Suspense } from 'react'
import Sidebar from './Sidebar'

export default function POSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Suspense fallback={<div className="w-20 lg:w-64 bg-card border-r h-full animate-pulse"></div>}>
        <Sidebar />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/20">
        {children}
      </main>
    </div>
  )
}
