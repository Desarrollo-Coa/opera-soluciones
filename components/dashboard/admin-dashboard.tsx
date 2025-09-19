import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Shield, TrendingUp, History } from "lucide-react"
import Link from "next/link"

export function AdminDashboard() {
  const stats = [
    {
      title: "Total Usuarios",
      value: "24",
      description: "Usuarios activos en el sistema",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Documentos",
      value: "156",
      description: "Documentos gestionados",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Reportes SST",
      value: "8",
      description: "Reportes pendientes",
      icon: Shield,
      color: "text-orange-600",
    },
    {
      title: "Actividad",
      value: "92%",
      description: "Nivel de actividad del sistema",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administrador</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Gestiona el sistema de manera eficiente</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/inicio/reports"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FileText className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium">Ver Reportes</span>
              </Link>
              <Link
                href="/inicio/settings"
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Shield className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium">Configuración</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nuevo usuario registrado</p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Documento subido</p>
                  <p className="text-xs text-gray-500">Hace 4 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reporte SST generado</p>
                  <p className="text-xs text-gray-500">Hace 1 día</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
