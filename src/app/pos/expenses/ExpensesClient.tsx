"use client";

import { useState } from "react";
import { Plus, ReceiptText, Calendar, DollarSign, Wallet } from "lucide-react";
import { createExpense } from "./actions";

type ExpenseType = {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  status: string;
};

type SummaryType = {
  total: number;
  thisMonth: number;
};

export default function ExpensesClient({ initialExpenses, summary }: { initialExpenses: ExpenseType[], summary: SummaryType }) {
  const [expenses] = useState<ExpenseType[]>(initialExpenses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createExpense(formData);
    if (res.error) {
      alert("Error: " + res.error);
    } else {
      setIsModalOpen(false);
      window.location.reload();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 overflow-y-auto p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gastos Operativos (OPEX)</h1>
          <p className="text-gray-500 mt-1">Registra y controla los gastos de la sucursal.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Nuevo Gasto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 flex items-center">
          <div className="p-3 rounded-full bg-red-100 mr-4">
            <DollarSign className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <dt className="truncate text-sm font-medium text-gray-500">Gastos Acumulados</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              ${summary.total?.toFixed(2)}
            </dd>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 flex items-center">
          <div className="p-3 rounded-full bg-orange-100 mr-4">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <dt className="truncate text-sm font-medium text-gray-500">Gastos de este Mes</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
              ${summary.thisMonth?.toFixed(2)}
            </dd>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Fecha</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Concepto</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Categoría</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                  <ReceiptText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  No hay gastos registrados.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                    {new Date(exp.expense_date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {exp.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {exp.category === 'maintenance' ? 'Mantenimiento' :
                     exp.category === 'services' ? 'Servicios' :
                     exp.category === 'supplies' ? 'Insumos / Papelería' :
                     exp.category === 'petty_cash' ? 'Caja Chica' : 'Otro'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {exp.status === 'paid' ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Pagado</span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pendiente</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    ${Number(exp.amount).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Wallet className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Registrar Gasto</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Ingresa los detalles del gasto operativo para descontarlo de la utilidad o de caja chica.
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 text-left">Concepto / Descripción</label>
                    <div className="mt-2">
                      <input type="text" name="description" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3" placeholder="Ej. Pago de Internet Telmex" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 text-left">Monto ($)</label>
                    <div className="mt-2">
                      <input type="number" step="0.01" min="0" name="amount" required className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3" placeholder="500.00" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 text-left">Categoría</label>
                    <div className="mt-2">
                      <select name="category" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3">
                        <option value="maintenance">Mantenimiento</option>
                        <option value="services">Servicios (Luz, Agua, Internet)</option>
                        <option value="supplies">Insumos (No menú) / Papelería</option>
                        <option value="petty_cash">Caja Chica</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium leading-6 text-gray-900 text-left">Estado del Pago</label>
                    <div className="mt-2">
                      <select name="status" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3">
                        <option value="paid">Pagado</option>
                        <option value="pending">Pendiente de Pago</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button type="submit" disabled={isSubmitting} className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2">
                      {isSubmitting ? "Guardando..." : "Guardar Gasto"}
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
