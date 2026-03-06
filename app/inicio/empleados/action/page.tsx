"use client"

import { useEffect, useState, Suspense, useActionState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  Banknote,
  ShieldCheck,
  MapPin,
  Info,
  Loader2,
  FileText,
  Files
} from "lucide-react"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { UniversalSelect } from "@/components/ui/universal-select"
import { DocumentList } from "@/components/employees/document-list"
import { DocumentUpload } from "@/components/employees/document-upload"
import {
  getEpsAction,
  getArlAction,
  getPensionFundsAction,
  getCompensationFundsAction,
  getWorkModalitiesAction,
  getBanksAction,
  getDepartmentsAction,
  getMunicipalitiesAction,
  ReferenceItem
} from "@/actions/reference-actions"
import { getCargosAction } from "@/actions/nomina/cargos-actions"
import { updateEmployeeProfileAction, createEmployeeAction } from "@/actions/employees-actions"
import { toast } from "sonner"

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

function EmployeeActionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const employeeId = searchParams.get('id')
  const isEdit = !!employeeId

  const [activeTab, setActiveTab] = useState("personal")
  const [loading, setLoading] = useState(true)

  // Reference Data States
  const [contractStatuses, setContractStatuses] = useState<any[]>([])
  const [userRoles, setUserRoles] = useState<any[]>([])
  const [cargos, setCargos] = useState<any[]>([])
  const [epsList, setEpsList] = useState<ReferenceItem[]>([])
  const [arlList, setArlList] = useState<ReferenceItem[]>([])
  const [pensionFunds, setPensionFunds] = useState<ReferenceItem[]>([])
  const [compensationFunds, setCompensationFunds] = useState<ReferenceItem[]>([])
  const [workModalities, setWorkModalities] = useState<ReferenceItem[]>([])
  const [banks, setBanks] = useState<ReferenceItem[]>([])
  const [departments, setDepartments] = useState<ReferenceItem[]>([])
  const [municipalities, setMunicipalities] = useState<ReferenceItem[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [docsLoading, setDocsLoading] = useState(false)

  // Local Form State (for controlled inputs and picture preview)
  const [initialData, setInitialData] = useState<any>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [selectedDepto, setSelectedDepto] = useState<string>("")
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("")
  const [selectedCargo, setSelectedCargo] = useState<string>("")
  const [selectedWorkModality, setSelectedWorkModality] = useState<string>("")
  const [selectedBank, setSelectedBank] = useState<string>("")
  const [selectedEPS, setSelectedEPS] = useState<string>("")
  const [selectedARL, setSelectedARL] = useState<string>("")
  const [selectedPension, setSelectedPension] = useState<string>("")
  const [selectedCompensation, setSelectedCompensation] = useState<string>("")

  // Server Action Hook
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      console.log("--- FRONTEND: SENDING DATA ---");
      const data: any = {};
      formData.forEach((value, key) => { data[key] = value; });
      console.log("FormData Payload:", data);

      const result = isEdit
        ? await updateEmployeeProfileAction(prevState, formData)
        : await createEmployeeAction(prevState, formData);

      console.log("--- FRONTEND: RECEIVED RESPONSE ---");
      console.log("Result:", result);
      return result;
    },
    null
  )

  // Log state changes for debugging
  useEffect(() => {
    if (state) {
      console.log("Current Form State:", state);
    }
  }, [state])

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true)
        // Load References
        const [
          contractRes, rolesRes, epsRes, arlRes,
          pensionRes, compensationRes, modalitiesRes,
          cargosRes, banksRes, deptosRes
        ] = await Promise.all([
          fetch('/api/reference/contract-statuses').then(r => r.json()),
          fetch('/api/reference/roles').then(r => r.json()),
          getEpsAction(),
          getArlAction(),
          getPensionFundsAction(),
          getCompensationFundsAction(),
          getWorkModalitiesAction(),
          getCargosAction(),
          getBanksAction(),
          getDepartmentsAction()
        ])

        setContractStatuses(contractRes.contract_statuses || [])
        setUserRoles(rolesRes.roles || [])
        if (epsRes.success) setEpsList(epsRes.data || [])
        if (arlRes.success) setArlList(arlRes.data || [])
        if (pensionRes.success) setPensionFunds(pensionRes.data || [])
        if (compensationRes.success) setCompensationFunds(compensationRes.data || [])
        if (modalitiesRes.success) setWorkModalities(modalitiesRes.data || [])
        if (cargosRes.success) setCargos(cargosRes.data || [])
        if (banksRes.success) setBanks(banksRes.data || [])
        if (deptosRes.success) setDepartments(deptosRes.data || [])

        // Load Employee Data if editing
        if (isEdit && employeeId) {
          const empRes = await fetch(`/api/employees/${employeeId}`, { cache: 'no-store' }).then(r => r.json())
          if (empRes.employee) {
            const e = empRes.employee
            console.log("--- FRONTEND: LOADED INITIAL DATA ---", e);
            setInitialData(e)
            setProfilePicturePreview(e.profile_picture)
            setSelectedDepto(e.departamento_id?.toString() || "")
            setSelectedMunicipio(e.municipio_id?.toString() || "")
            setSelectedCargo(e.cargo_id?.toString() || "")
            setSelectedWorkModality(e.employment_type || "")
            setSelectedBank(e.bank_name || "")
            setSelectedEPS(e.eps_id?.toString() || "")
            setSelectedARL(e.arl_id?.toString() || "")
            setSelectedPension(e.pension_fund_id?.toString() || "")
            setSelectedCompensation(e.compensation_fund_id?.toString() || "")
            if (e.departamento_id) {
              const munRes = await getMunicipalitiesAction(e.departamento_id)
              if (munRes.success) setMunicipalities(munRes.data || [])
            }

            // Load documents
            setDocsLoading(true)
            const docRes = await fetch(`/api/documents?employeeId=${employeeId}`, { cache: 'no-store' }).then(r => r.json())
            setDocuments(docRes.documents || [])
            setDocsLoading(false)
          }
        }
      } catch (err) {
        console.error("Error loading data:", err)
        toast.error("Error al cargar la información del formulario")
      } finally {
        setLoading(false)
      }
    }
    loadAllData()
  }, [isEdit, employeeId])

  // Handle City filtering when Department changes
  useEffect(() => {
    if (selectedDepto) {
      getMunicipalitiesAction(parseInt(selectedDepto)).then(res => {
        if (res.success) setMunicipalities(res.data || [])
      })
    } else {
      setMunicipalities([])
      setSelectedMunicipio("")
    }
  }, [selectedDepto])

  // Handle Action Completion
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Operación exitosa")
      router.push('/inicio/empleados')
    } else if (state?.success === false) {
      toast.error(state.message || "Error al procesar la solicitud")
    }
  }, [state, router])


  if (loading) return <EmployeeActionSkeleton />

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/inicio/empleados')} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {isEdit ? `${initialData?.first_name} ${initialData?.last_name}` : 'Registrar Nuevo Colaborador'}
              </h1>
              <p className="text-slate-500 text-sm">
                {isEdit ? 'Actualiza la información laboral y de nómina' : 'Ingresa los datos para dar de alta en el sistema'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/inicio/empleados')}>Cancelar</Button>
            <Button type="submit" form="employee-form" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isEdit ? 'Guardar Cambios' : 'Crear Colaborador'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full bg-slate-100/50 p-1 rounded-xl">
            <TabsTrigger value="personal" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4 mr-2 hidden md:inline" /> Personal
            </TabsTrigger>
            <TabsTrigger value="laboral" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Briefcase className="h-4 w-4 mr-2 hidden md:inline" /> Laboral
            </TabsTrigger>
            <TabsTrigger value="nomina" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Banknote className="h-4 w-4 mr-2 hidden md:inline" /> Nómina & Banco
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ShieldCheck className="h-4 w-4 mr-2 hidden md:inline" /> Seguridad Social
            </TabsTrigger>
            {isEdit && (
              <TabsTrigger value="documentos" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4 mr-2 hidden md:inline" /> Documentos
              </TabsTrigger>
            )}
          </TabsList>

          <form id="employee-form" action={formAction}>
            <input type="hidden" name="id" value={employeeId || ""} />

            {/* Tab: Personal */}
            <TabsContent value="personal" forceMount className="mt-6 space-y-6 data-[state=inactive]:hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-none shadow-sm bg-slate-50/50">
                  <CardContent className="pt-6 flex flex-col items-center">
                    <Label className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Fotografía de Perfil</Label>
                    <ProfilePictureUpload
                      value={profilePicturePreview || undefined}
                      onChange={(_, url) => setProfilePicturePreview(url)}
                      disabled={isPending}
                    />
                    <input type="hidden" name="profile_picture" value={profilePicturePreview || ""} />
                    <div className="mt-6 w-full space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                        <Label htmlFor="is_active" className="text-sm font-medium">Estado Activo</Label>
                        <Switch id="is_active" name="is_active" defaultChecked={initialData?.is_active ?? true} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2 border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 mt-[-10px]"><User className="h-5 w-5 text-indigo-500" /> Datos Básicos</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Nombres *</Label>
                      <Input id="first_name" name="first_name" defaultValue={initialData?.first_name} required />
                      {state?.errors?.first_name && <p className="text-xs text-red-500">{state.errors.first_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Apellidos *</Label>
                      <Input id="last_name" name="last_name" defaultValue={initialData?.last_name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico *</Label>
                      <Input id="email" name="email" type="email" defaultValue={initialData?.email} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono de Contacto</Label>
                      <Input id="phone" name="phone" defaultValue={initialData?.phone} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document_type">Tipo de Documento</Label>
                      <Select name="document_type" defaultValue={initialData?.document_type || "CC"}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                          <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                          <SelectItem value="PA">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document_number">Número de Documento</Label>
                      <Input id="document_number" name="document_number" defaultValue={initialData?.document_number} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-3 border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 mt-[-10px]"><MapPin className="h-5 w-5 text-indigo-500" /> Ubicación y Datos Personales</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Departamento</Label>
                      <UniversalSelect
                        value={selectedDepto}
                        onValueChange={(val) => {
                          setSelectedDepto(val)
                          setSelectedMunicipio("")
                        }}
                        options={departments.map(d => ({ name: d.nombre, code: d.nombre, id: d.id }))}
                        placeholder="Buscar depto..."
                      />
                      <input type="hidden" name="departamento_id" value={selectedDepto} />
                    </div>
                    <div className="space-y-2">
                      <Label>Ciudad / Municipio</Label>
                      <UniversalSelect
                        value={selectedMunicipio}
                        onValueChange={setSelectedMunicipio}
                        options={municipalities.map(m => ({ name: m.nombre, code: m.nombre, id: m.id }))}
                        disabled={!selectedDepto}
                        placeholder="Buscar ciudad..."
                      />
                      <input type="hidden" name="municipio_id" value={selectedMunicipio} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Dirección de Residencia</Label>
                      <Input id="address" name="address" defaultValue={initialData?.address} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                      <Input id="birth_date" name="birth_date" type="date" defaultValue={formatDateForInput(initialData?.birth_date)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Género</Label>
                      <Select name="gender" defaultValue={initialData?.gender || ""}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                          <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marital_status">Estado Civil</Label>
                      <Select name="marital_status" defaultValue={initialData?.marital_status || ""}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                          <SelectItem value="Casado/a">Casado/a</SelectItem>
                          <SelectItem value="Unión Libre">Unión Libre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Contacto Emergencia</Label>
                      <Input id="emergency_contact_name" name="emergency_contact_name" defaultValue={initialData?.emergency_contact_name} placeholder="Nombre completo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Tel. Emergencia</Label>
                      <Input id="emergency_contact_phone" name="emergency_contact_phone" defaultValue={initialData?.emergency_contact_phone} placeholder="Número de contacto" />
                    </div>
                    {!isEdit && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Contraseña Sistema *</Label>
                        <Input id="password" name="password" type="password" required />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Laboral */}
            <TabsContent value="laboral" forceMount className="mt-6 space-y-6 data-[state=inactive]:hidden">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5 text-indigo-500" /> Información Contractual</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Cargo / Título</Label>
                    <UniversalSelect
                      value={selectedCargo}
                      onValueChange={setSelectedCargo}
                      options={cargos.map(c => ({ name: c.nombre, code: c.id.toString(), id: c.id }))}
                      placeholder="Seleccionar cargo..."
                    />
                    <input type="hidden" name="cargo_id" value={selectedCargo} />
                  </div>
                  <div className="space-y-2">
                    <Label>Modalidad de Trabajo</Label>
                    <UniversalSelect
                      value={selectedWorkModality}
                      onValueChange={setSelectedWorkModality}
                      options={workModalities.map(m => ({ name: m.nombre, code: m.nombre }))}
                    />
                    <input type="hidden" name="employment_type" value={selectedWorkModality} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento (Área)</Label>
                    <Input id="department" name="department" defaultValue={initialData?.department} placeholder="Ej: Operaciones, IT, RRHH" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Fecha Ingreso</Label>
                    <Input id="hire_date" name="hire_date" type="date" defaultValue={formatDateForInput(initialData?.hire_date)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termination_date">Fecha Retiro (Opcional)</Label>
                    <Input id="termination_date" name="termination_date" type="date" defaultValue={formatDateForInput(initialData?.termination_date)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="work_schedule">Horario de Trabajo</Label>
                    <Input id="work_schedule" name="work_schedule" defaultValue={initialData?.work_schedule} placeholder="Ej: Lunes a Viernes 8am-5pm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract_status_id">Estado del Contrato</Label>
                    <Select name="contract_status_id" defaultValue={initialData?.contract_status_id?.toString() || (contractStatuses[0]?.id.toString())}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {contractStatuses.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role_id">Rol en SGI</Label>
                    <Select name="role_id" defaultValue={initialData?.role_id?.toString() || "2"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {userRoles.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Nomina */}
            <TabsContent value="nomina" forceMount className="mt-6 space-y-6 data-[state=inactive]:hidden">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Banknote className="h-5 w-5 text-indigo-500" /> Dispersión de Fondos</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Entidad Bancaria</Label>
                    <UniversalSelect
                      value={selectedBank}
                      onValueChange={setSelectedBank}
                      options={banks.map(b => ({ name: b.nombre, code: b.nombre, id: b.id }))}
                      placeholder="Seleccionar banco..."
                    />
                    <input type="hidden" name="bank_name" value={selectedBank} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Tipo de Cuenta</Label>
                    <Select name="account_type" defaultValue={initialData?.account_type || "Ahorros"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ahorros">Ahorros</SelectItem>
                        <SelectItem value="Corriente">Corriente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Número de Cuenta</Label>
                    <Input id="account_number" name="account_number" defaultValue={initialData?.account_number} placeholder="Ej: 123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Notas de Pago <Info className="h-3 w-3 text-slate-400" /></Label>
                    <Textarea name="notes" placeholder="Observaciones adicionales para el área de tesorería..." defaultValue={initialData?.notes} rows={3} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Seguridad Social */}
            <TabsContent value="seguridad" forceMount className="mt-6 space-y-6 data-[state=inactive]:hidden">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-500" /> Afiliaciones y Cobertura</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>EPS (Salud)</Label>
                    <UniversalSelect
                      value={selectedEPS}
                      onValueChange={setSelectedEPS}
                      options={epsList.map(e => ({ name: e.nombre, code: e.nombre, id: e.id }))}
                    />
                    <input type="hidden" name="eps_id" value={selectedEPS} />
                  </div>
                  <div className="space-y-2">
                    <Label>ARL (Riesgos)</Label>
                    <UniversalSelect
                      value={selectedARL}
                      onValueChange={setSelectedARL}
                      options={arlList.map(a => ({ name: a.nombre, code: a.nombre, id: a.id }))}
                    />
                    <input type="hidden" name="arl_id" value={selectedARL} />
                  </div>
                  <div className="space-y-2">
                    <Label>Porvenir / Fondo Pensión</Label>
                    <UniversalSelect
                      value={selectedPension}
                      onValueChange={setSelectedPension}
                      options={pensionFunds.map(p => ({ name: p.nombre, code: p.nombre, id: p.id }))}
                    />
                    <input type="hidden" name="pension_fund_id" value={selectedPension} />
                  </div>
                  <div className="space-y-2">
                    <Label>Caja de Compensación</Label>
                    <UniversalSelect
                      value={selectedCompensation}
                      onValueChange={setSelectedCompensation}
                      options={compensationFunds.map(c => ({ name: c.nombre, code: c.nombre, id: c.id }))}
                    />
                    <input type="hidden" name="compensation_fund_id" value={selectedCompensation} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Tab: Documentos */}
            {isEdit && (
              <TabsContent value="documentos" forceMount className="mt-6 space-y-6 data-[state=inactive]:hidden">
                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg flex items-center gap-2"><Files className="h-5 w-5 text-indigo-500" /> Repositorio de Documentos</CardTitle>
                    <DocumentUpload
                      employeeId={parseInt(employeeId!)}
                      onUploadSuccess={async () => {
                        const res = await fetch(`/api/documents?employeeId=${employeeId}`).then(r => r.json())
                        setDocuments(res.documents || [])
                      }}
                      allowedTypeNames={["Contrato", "Cédula", "Hoja de Vida", "Certificación"]}
                    />
                  </CardHeader>
                  <CardContent>
                    <DocumentList
                      documents={documents}
                      loading={docsLoading}
                      onDelete={async () => {
                        const res = await fetch(`/api/documents?employeeId=${employeeId}`).then(r => r.json())
                        setDocuments(res.documents || [])
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </form>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function EmployeeActionSkeleton() {
  return (
    <DashboardLayout userRole="ADMIN">
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded" />
        <div className="h-12 w-full bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 rounded-xl" />
          <div className="col-span-2 h-64 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function EmployeeActionPage() {
  return (
    <Suspense fallback={<EmployeeActionSkeleton />}>
      <EmployeeActionContent />
    </Suspense>
  )
}
