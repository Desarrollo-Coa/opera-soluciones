import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileExplorer } from "@/components/file-system/file-explorer";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Página del Sistema de Gestión Integrado (SGI) - Sistema de Archivos
 */
export default async function SGIPage() {
  // Obtener token de autenticación de las cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  // Redirigir al login si no se encuentra token
  if (!token) {
    redirect("/login");
  }

  // Obtener rol de usuario del token
  let userRole: string;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userRole = payload.role ?? "default";
  } catch (error) {
    console.error("Error decoding token:", error);
    redirect("/login");
  }


  return (
    <DashboardLayout userRole={userRole}>
      <div className="h-full">
        {/* Explorador de archivos */}
        <Card className="h-full">
          <CardContent className="p-6 h-full">
            <FileExplorer />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
