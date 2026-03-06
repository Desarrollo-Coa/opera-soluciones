"use client"

import { useState, useEffect, useActionState } from "react"
import { useRouter } from "next/navigation"
import { Employee } from "@/types/employee"
import { CargoRow } from "@/actions/nomina/cargos-actions"
import { updateEmployeeProfileAction } from "@/actions/employees-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    ArrowLeft, FileText, Briefcase, ShieldCheck,
    CreditCard, Edit2, X, Save, User as UserIcon,
    Receipt, PlusCircle, CheckCircle2
} from "lucide-react"

// Tabs Components
import { PersonalTab } from "./profile-tabs/personal-tab"
import { LaboralTab } from "./profile-tabs/laboral-tab"
import { SeguridadSocialTab } from "./profile-tabs/seguridad-social-tab"
import { BancariaTab } from "./profile-tabs/bancaria-tab"
import { DocumentList } from "./document-list"
import { DocumentUpload } from "./document-upload"

interface Props {
    initialEmployee: Employee;
    cargos: CargoRow[];
    userRole: string;
}

export function EmployeeProfileClient({ initialEmployee, cargos, userRole }: Props) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'personal' | 'laboral' | 'seguridad' | 'bancaria' | 'documentos' | 'volantes'>('personal')
    const [documents, setDocuments] = useState<any[]>([])
    const [docsLoading, setDocsLoading] = useState(true)



    // Cargar documentos del empleado
    const fetchDocuments = async () => {
        try {
            setDocsLoading(true)
            const res = await fetch(`/api/documents?employeeId=${initialEmployee.id}`)
            if (res.ok) {
                const data = await res.json()
                setDocuments(data.documents || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setDocsLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])



    const menuItems = [
        { id: 'personal', label: 'Datos Personales', icon: UserIcon, sub: 'Identidad y contacto' },
        { id: 'laboral', label: 'Información Laboral', icon: Briefcase, sub: 'Cargo y contratación' },
        { id: 'seguridad', label: 'Seguridad Social', icon: ShieldCheck, sub: 'EPS, ARL, Fondos' },
        { id: 'bancaria', label: 'Información de Pago', icon: CreditCard, sub: 'Cuentas y bancos' },
        { id: 'documentos', label: 'Documentación', icon: FileText, sub: 'Archivos y soportes' },
        { id: 'volantes', label: 'Historial de Nómina', icon: Receipt, sub: 'Volantes generados' },
    ]

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-screen bg-[#F8FAFC]">
            {/* Sidebar de Navegación (Google Style Sidebar) */}
            <div className="w-full lg:w-72 flex-shrink-0">
                <div className="sticky top-4 space-y-4">
                    <Button variant="ghost" onClick={() => router.push('/inicio/empleados')} className="mb-4 text-slate-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Listado
                    </Button>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-3 space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${activeTab === item.id ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
                                    <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}`} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-sm leading-tight">{item.label}</div>
                                    <div className={`text-[10px] ${activeTab === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>{item.sub}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <Card className="border-indigo-100 bg-indigo-50/30">
                        <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                            <div className="h-16 w-16 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                                <img src={initialEmployee.profile_picture || "/placeholder-user.jpg"} alt="avatar" className="h-full w-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 leading-tight">{initialEmployee.first_name} {initialEmployee.last_name}</h4>
                                <p className="text-xs text-indigo-600 font-medium mt-1">{initialEmployee.cargo_name || initialEmployee.position || "Cargo no asignado"}</p>
                            </div>
                            <Badge variant={initialEmployee.is_active ? "default" : "secondary"} className={initialEmployee.is_active ? "bg-green-500" : ""}>
                                {initialEmployee.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Área de Contenido Principal */}
            <div className="flex-1 space-y-6">
                <div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {menuItems.find(i => i.id === activeTab)?.label}
                            </h1>
                            <p className="text-slate-500 text-sm">Gestión integral del perfil del colaborador</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {activeTab !== 'documentos' && activeTab !== 'volantes' && (
                                <Button type="button" onClick={() => router.push(`/inicio/empleados/action?id=${initialEmployee.id}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6">
                                    <Edit2 className="h-4 w-4 mr-2" /> Editar Información
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[500px]">
                        {activeTab === 'personal' && <PersonalTab employee={initialEmployee} editMode={false} />}
                        {activeTab === 'laboral' && <LaboralTab employee={initialEmployee} editMode={false} cargos={cargos} />}
                        {activeTab === 'seguridad' && <SeguridadSocialTab employee={initialEmployee} editMode={false} />}
                        {activeTab === 'bancaria' && <BancariaTab employee={initialEmployee} editMode={false} />}

                        {activeTab === 'documentos' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
                                    <div>
                                        <h3 className="font-bold text-slate-800">Repositorio Documental</h3>
                                        <p className="text-xs text-slate-500 italic">Centralice contratos, hojas de vida y soportes legales</p>
                                    </div>
                                    <DocumentUpload
                                        employeeId={initialEmployee.id}
                                        onUploadSuccess={fetchDocuments}
                                        allowedTypeNames={["Contrato", "Hoja de vida", "Exámenes médicos", "Seguridad social"]}
                                    />
                                </div>
                                <DocumentList
                                    documents={documents.filter(d => d.document_type_name !== 'Volantes de pago')}
                                    loading={docsLoading}
                                    onDeleteSuccess={fetchDocuments}
                                />
                            </div>
                        )}

                        {activeTab === 'volantes' && (
                            <div className="space-y-6">
                                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-indigo-900">Validación de Nómina</h3>
                                        <p className="text-sm text-indigo-700/80">Aquí encontrará los volantes generados automáticamente por el sistema tras cada liquidación. No es posible cargar volantes manualmente para garantizar la integridad de los datos.</p>
                                    </div>
                                </div>

                                <DocumentList
                                    documents={documents.filter(d => d.document_type_name === 'Volantes de pago')}
                                    loading={docsLoading}
                                    onDeleteSuccess={fetchDocuments}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
