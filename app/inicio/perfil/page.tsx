"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Calendar, Shield, Camera, Briefcase, Calculator, Activity, HeartPulse } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"

interface User {
  id: number
  role: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  position?: string
  salary?: number
  hire_date?: string
  document_type?: string
  document_number?: string
  birth_date?: string
  gender?: string
  marital_status?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  profile_picture?: string
  role_name: string
  contract_status_name: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const userData = await response.json()
        setUser({
          id: userData.id,
          role: userData.role,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          position: userData.position || '',
          salary: userData.salary || 0,
          hire_date: userData.hire_date || '',
          document_type: userData.document_type || 'CC',
          document_number: userData.document_number || '',
          birth_date: userData.birth_date || '',
          gender: userData.gender || '',
          marital_status: userData.marital_status || '',
          emergency_contact_name: userData.emergency_contact_name || '',
          emergency_contact_phone: userData.emergency_contact_phone || '',
          profile_picture: userData.profile_picture || '',
          role_name: userData.role_name || '',
          contract_status_name: userData.contract_status_name || '',
          created_at: userData.created_at || ''
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '-';
    try {
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return '-';
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) { age--; }
      return age;
    } catch (e) { return '-'; }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '') return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) { return '-'; }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="ADMIN">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#1A73E8] border-t-transparent"></div>
            <p className="text-[#5F6368] font-medium animate-pulse">Sincronizando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null;

  return (
    <DashboardLayout userRole={user.role}>
      <div className="max-w-4xl mx-auto pb-12 animate-in fade-in zoom-in-95 duration-500">

        {/* --- HEADER SECTION --- */}
        <div className="text-center space-y-3 mb-8 pt-4">
          <h1 className="text-3xl font-medium text-[#202124]">Información Personal</h1>
          <p className="text-[#5F6368] text-base max-w-lg mx-auto leading-relaxed">
            Información básica sobre tu perfil, como tu nombre y foto, que usas en los servicios de SGI.
          </p>
        </div>

        {/* --- IDENTITY CARD (Centered Primary Info) --- */}
        <section className="bg-white border border-[#DADCE0] rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md mb-6">
          <div className="h-32 bg-gradient-to-r from-[#E8F0FE] to-[#F1F3F4] relative">
            <div className="absolute -bottom-12 left-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                  <img
                    src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=1A73E8&color=fff&size=200`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-[#DADCE0] hover:bg-gray-50 transition-all scale-90">
                  <Camera className="w-4 h-4 text-[#1A73E8]" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-[#202124]">{user.first_name} {user.last_name}</h2>
                  <Badge variant="outline" className="rounded-full bg-[#E6F4EA] text-[#137333] border-none px-3 font-medium text-[10px] uppercase tracking-wider">
                    {user.contract_status_name}
                  </Badge>
                </div>
                <p className="text-[#1A73E8] font-medium mt-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {user.position || 'Colaborador'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[#5F6368] text-sm font-medium">
                <Shield className="w-4 h-4 text-emerald-500" strokeWidth={3} />
                ID: {user.document_number || user.id}
              </div>
            </div>
          </div>
        </section>

        {/* --- INFORMATION BLOCKS --- */}
        <div className="space-y-6">

          {/* Personal Data Block */}
          <SectionBlock title="Información de contacto" description="Tus datos de localización y comunicación empresarial.">
            <InfoRow icon={Mail} label="Correo Electrónico" value={user.email} />
            <InfoRow icon={Phone} label="Teléfono" value={user.phone || 'No registrado'} />
            <InfoRow icon={MapPin} label="Dirección" value={user.address || 'No registrada'} />
          </SectionBlock>

          {/* Identity & Legal Block */}
          <SectionBlock title="Acerca de ti" description="Información demográfica y de identificación legal.">
            <InfoRow icon={User} label="Nombre Completo" value={`${user.first_name} ${user.last_name}`} />
            <InfoRow icon={Calendar} label="Fecha de Nacimiento" value={`${formatDate(user.birth_date || '')} (${calculateAge(user.birth_date || '')} años)`} />
            <InfoRow icon={Shield} label="Documento" value={`${user.document_type} ${user.document_number}`} />
            <InfoRow icon={HeartPulse} label="Estado Civil" value={user.marital_status || 'Soltero/a'} />
          </SectionBlock>

          {/* Work & Laboral Block */}
          <SectionBlock title="Vida Laboral" description="Tu vinculación actual con el equipo de Opera Soluciones.">
            <InfoRow icon={Briefcase} label="Cargo Actual" value={user.position || '-'} />
            <InfoRow icon={Calendar} label="Fecha de Ingreso" value={formatDate(user.hire_date || '')} />
            <InfoRow icon={Calculator} label="Asignación Básica" value={user.salary ? formatCurrency(user.salary) : '---'} />
            <InfoRow icon={Activity} label="Rol del Sistema" value={user.role_name} />
          </SectionBlock>

          {/* Emergency SOS Block */}
          <SectionBlock title="Emergencia (SOS)" description="A quién contactar en casos fortuitos." highlight>
            <div className="flex items-center justify-between group cursor-pointer p-4 rounded-2xl transition-colors hover:bg-red-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{user.emergency_contact_name || 'Sin Asignar'}</h4>
                  <p className="text-xs text-gray-500">Contacto de Emergencia</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600 tracking-wider font-inter">{user.emergency_contact_phone || '---'}</p>
              </div>
            </div>
          </SectionBlock>

        </div>

        {/* --- FOOTER INFO --- */}
        <div className="mt-12 text-center text-[#70757A] text-[11px] font-medium uppercase tracking-[0.1em] opacity-60">
          SGI OPERA SOLUCIONES • v2.0 • 2026
        </div>

      </div>
    </DashboardLayout>
  )
}

/**
 * --- REUSABLE COMPONENTS (GOOGLE STYLE) ---
 */

function SectionBlock({ title, description, children, highlight = false }: any) {
  return (
    <Card className={`bg-white border border-[#DADCE0] rounded-3xl overflow-hidden shadow-none px-6 py-6 ${highlight ? 'border-red-100' : ''}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-[#202124]">{title}</h3>
        <p className="text-[#5F6368] text-sm mt-1">{description}</p>
      </div>
      <div className="divide-y divide-[#F1F3F4]">
        {children}
      </div>
    </Card>
  )
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer min-h-[64px] transition-colors hover:bg-gray-50 -mx-6 px-6">
      <div className="flex items-center gap-4 w-1/3">
        <Icon className="w-4 h-4 text-[#5F6368] group-hover:text-[#1A73E8] transition-colors" />
        <span className="text-[13px] font-medium text-[#5F6368] group-hover:text-[#1A73E8] transition-colors uppercase tracking-tight opacity-70">
          {label}
        </span>
      </div>
      <div className="flex-1 text-right">
        <span className="text-base text-[#202124] font-medium tracking-tight">
          {value || '---'}
        </span>
      </div>
    </div>
  )
}
