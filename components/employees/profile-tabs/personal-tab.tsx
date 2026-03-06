"use client"

import { Employee } from "@/types/employee"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formatDateForInput = (date: any) => {
    if (!date) return "";
    if (typeof date === "string") return date.split("T")[0];
    try {
        const d = new Date(date);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
    } catch (e) {
        return "";
    }
};

export function PersonalTab({ employee, editMode }: { employee: Employee, editMode: boolean }) {
    const getDocumentTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'CC': 'Cédula de Ciudadanía',
            'CE': 'Cédula de Extranjería',
            'TI': 'Tarjeta de Identidad',
            'RC': 'Registro Civil',
            'PA': 'Pasaporte'
        }
        return types[type] || type
    }

    const getGenderLabel = (gender: string) => {
        const genders: Record<string, string> = {
            'M': 'Masculino',
            'F': 'Femenino',
            'O': 'Otro'
        }
        return genders[gender] || gender
    }

    if (!editMode) {
        return (
            <Card className="border-none shadow-none">
                <CardHeader className="px-0">
                    <CardTitle className="text-xl font-bold text-gray-800">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Tipo de Documento</p>
                            <p className="text-gray-900">{getDocumentTypeLabel(employee.document_type || 'CC')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Número de Identificación</p>
                            <p className="text-gray-900">{employee.document_number || 'No registrado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Género</p>
                            <p className="text-gray-900">{employee.gender ? getGenderLabel(employee.gender) : 'No especificado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                            <p className="text-gray-900">{employee.birth_date ? new Date(employee.birth_date).toLocaleDateString() : 'No registrada'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Estado Civil</p>
                            <p className="text-gray-900">{employee.marital_status || 'No registrado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Departamento</p>
                            <p className="text-gray-900">{employee.department || 'No registrado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Municipio</p>
                            <p className="text-gray-900">{employee.municipio_id || 'No registrado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Dirección</p>
                            <p className="text-gray-900">{employee.address || 'No registrada'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Teléfono</p>
                            <p className="text-gray-900">{employee.phone || 'No registrado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                            <p className="text-gray-900">{employee.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Contacto de Emergencia</p>
                            <p className="text-gray-900">{employee.emergency_contact_name || 'No registrado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Teléfono de Emergencia</p>
                            <p className="text-gray-900">{employee.emergency_contact_phone || 'No registrado'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="text-xl font-bold text-gray-800">Editar Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">Nombres</Label>
                        <Input id="first_name" name="first_name" defaultValue={employee.first_name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Apellidos</Label>
                        <Input id="last_name" name="last_name" defaultValue={employee.last_name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="document_type">Tipo de Documento</Label>
                        <Select name="document_type" defaultValue={employee.document_type || 'CC'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                <SelectItem value="RC">Registro Civil</SelectItem>
                                <SelectItem value="PA">Pasaporte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="document_number">Número de Identificación</Label>
                        <Input id="document_number" name="document_number" defaultValue={employee.document_number || ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                        <Select name="gender" defaultValue={employee.gender || 'M'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un género" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="M">Masculino</SelectItem>
                                <SelectItem value="F">Femenino</SelectItem>
                                <SelectItem value="O">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                        <Input id="birth_date" name="birth_date" type="date" defaultValue={formatDateForInput(employee.birth_date)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="marital_status">Estado Civil</Label>
                        <Select name="marital_status" defaultValue={employee.marital_status || 'Soltero/a'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Estado Civil" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                                <SelectItem value="Casado/a">Casado/a</SelectItem>
                                <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                                <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                                <SelectItem value="Unión Libre">Unión Libre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono de Contacto</Label>
                        <Input id="phone" name="phone" defaultValue={employee.phone || ''} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Dirección de Residencia</Label>
                    <Input id="address" name="address" defaultValue={employee.address || ''} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico (Principal)</Label>
                    <Input id="email" name="email" type="email" defaultValue={employee.email} required />
                </div>
            </CardContent>
        </Card>
    )
}
