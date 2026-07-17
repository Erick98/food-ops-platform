/* eslint-disable @typescript-eslint/no-explicit-any */
import { History } from "lucide-react";
import { getChecklists, getChecklistLogs } from "../actions";
import { ChecklistsClient } from "./checklists-client";

export const metadata = {
  title: "Checklists & Auditorías | Food-Ops",
};

export default async function ChecklistsPage() {
  const checklists = await getChecklists();
  const logs = await getChecklistLogs();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checklists Operativos</h1>
          <p className="text-muted-foreground mt-1">
            Auditorías de apertura, cierre, higiene y estándares de calidad.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ChecklistsClient checklists={checklists} />
        </div>
        <div className="space-y-6">
          {/* Logs Card */}
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Últimos Registros</h2>
            </div>
            <div className="space-y-4">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay registros recientes.</p>
              ) : (
                logs.map((log: any) => (
                  <div key={log.id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium">{log.checklist?.title}</p>
                      <p className="text-xs text-muted-foreground">Por: {log.profile?.full_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {log.status === 'completed' ? 'Completado' : 'Incompleto'}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
