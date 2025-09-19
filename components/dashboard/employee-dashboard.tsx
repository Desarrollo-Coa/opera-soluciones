import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calculator, Shield, Settings } from "lucide-react"

export function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hola mundo - Empleado</h1>
        <p className="text-gray-600 mt-2">Panel de empleado con acceso a módulos principales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Empleados
            </CardTitle>
            <CardDescription>
              Gestión de personal y recursos humanos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en desarrollo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calculator className="h-5 w-5 mr-2 text-green-600" />
              Contable
            </CardTitle>
            <CardDescription>
              Gestión contable y financiera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en desarrollo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="h-5 w-5 mr-2 text-orange-600" />
              SST
            </CardTitle>
            <CardDescription>
              Seguridad y salud en el trabajo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en desarrollo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              SGI
            </CardTitle>
            <CardDescription>
              Sistema de gestión integral
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Módulo en desarrollo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
