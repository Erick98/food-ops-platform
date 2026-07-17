import { getAttendanceLogs, getPayrollSettlements, getStaff } from "../actions"
import { PayrollClient } from "./payroll-client"

export const dynamic = "force-dynamic"

export default async function PayrollPage() {
  const attendanceLogs = await getAttendanceLogs()
  const payrollSettlements = await getPayrollSettlements()
  const { data: staff } = await getStaff()

  return (
    <PayrollClient 
      attendanceLogs={attendanceLogs} 
      payrollSettlements={payrollSettlements}
      staff={staff || []}
    />
  )
}
