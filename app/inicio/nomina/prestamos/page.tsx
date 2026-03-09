import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ROLE_CODES } from "@/lib/constants";
import { PrestamosClient } from "@/components/nomina/prestamos-client";
import { getPrestamosActivosAction } from "@/actions/nomina/prestamos-actions";
import { getEmployeesSimple } from "@/actions/employees-actions";

export default async function PrestamosPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        redirect("/login");
    }

    let userRole: string;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userRole = payload.role ?? "default";
    } catch (error) {
        redirect("/login");
    }

    if (userRole !== ROLE_CODES.ADMIN && userRole !== ROLE_CODES.HR) {
        redirect("/inicio");
    }

    // Fetch initial data
    const [resPrestamos, resEmployees] = await Promise.all([
        getPrestamosActivosAction(),
        getEmployeesSimple()
    ]);

    return (
        <DashboardLayout userRole={userRole}>
            <PrestamosClient
                initialPrestamos={resPrestamos.success ? resPrestamos.data || [] : []}
                employees={resEmployees.success ? resEmployees.data || [] : []}
            />
        </DashboardLayout>
    );
}
