import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PuestosClient } from "./puestos-client"
import { getPuestosAction } from "@/actions/puestos-actions"
import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PuestosPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  if (!token) redirect("/login")

  const user = await verifyToken(token)
  
  if (user.role !== "ADMIN" && user.role !== "HR") {
    redirect("/inicio")
  }

  const res = await getPuestosAction()
  const puestos = res.success && Array.isArray(res.data) ? res.data : []

  return (
    <DashboardLayout userRole={user.role}>
      <PuestosClient initialPuestos={puestos} />
    </DashboardLayout>
  )
}
