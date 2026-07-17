/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Plus, CheckCircle } from "lucide-react";
import { createChecklist } from "../actions";

export function ChecklistsClient({ checklists }: { checklists: {id: string, title: string, frequency: string, description?: string}[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<any | null>(null); // For filling a checklist

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createChecklist({ title, frequency, description });
      setIsModalOpen(false);
      setTitle("");
      setFrequency("daily");
      setDescription("");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error al crear checklist");
    } finally {
      setIsSubmitting(false);
    }
  };

  const freqLabels: Record<string, string> = {
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
    opening: "Apertura",
    closing: "Cierre",
    custom: "Personalizado"
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm">
      <div className="p-4 border-b flex justify-between items-center bg-muted/20">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Plantillas de Auditoría
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nuevo Checklist
        </button>
      </div>

      <div className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Frecuencia</th>
              <th className="px-4 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {checklists.map((chk) => (
              <tr key={chk.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{chk.title}</div>
                  {chk.description && <div className="text-xs text-muted-foreground">{chk.description}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {freqLabels[chk.frequency] || chk.frequency}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    className="text-primary hover:underline text-sm font-medium"
                    onClick={() => setActiveChecklist(chk)}
                  >
                    Llenar ahora
                  </button>
                </td>
              </tr>
            ))}
            {checklists.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No hay checklists configurados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear Checklist */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Nuevo Checklist</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título de la Plantilla</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-transparent"
                  placeholder="Ej. Limpieza de Barra"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Frecuencia / Momento</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-transparent"
                >
                  <option value="opening">Apertura (Mañana)</option>
                  <option value="closing">Cierre (Noche)</option>
                  <option value="daily">Diario (En Turno)</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción (Opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-transparent"
                  rows={2}
                  placeholder="Instrucciones breves..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Checklist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Llenar Checklist (Stub interactivo) */}
      {activeChecklist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-4 py-3 border-b flex justify-between items-center bg-primary text-primary-foreground">
              <h3 className="font-semibold text-lg">{activeChecklist.title}</h3>
              <button onClick={() => setActiveChecklist(null)} className="hover:opacity-80">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Por favor verifica cada uno de los puntos requeridos para {freqLabels[activeChecklist.frequency]?.toLowerCase() || "esta auditoría"}.
              </p>
              
              <div className="space-y-3">
                {/* Mock items */}
                {[
                  "Revisión de temperaturas (Refrigerador < 4°C)", 
                  "Limpieza profunda de estación de trabajo", 
                  "Cuadre de caja inicial",
                  "Encendido de máquinas y precalentamiento"
                ].map((item, i) => (
                  <label key={i} className="flex items-start gap-3 p-2 rounded-md border hover:bg-muted/20 cursor-pointer">
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">{item}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setActiveChecklist(null)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Registro guardado con éxito.");
                    setActiveChecklist(null);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                >
                  Completar Auditoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
