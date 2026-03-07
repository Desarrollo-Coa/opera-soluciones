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
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return '-';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === '') return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return '-';
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="ADMIN">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#1A73E8] border-t-transparent"></div>
            <p className="text-[#5F6368] font-medium text-xs">Cargando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null;

  return (
    <DashboardLayout userRole={user.role}>
      <div className="max-w-[1300px] mx-auto h-[calc(100vh-80px)] flex flex-col items-stretch overflow-hidden px-2">

        <div className="flex-1 flex gap-3 min-h-0 py-2">
          {/* Left Sidebar - Identity (Refined & Smaller) */}
          <div className="w-64 flex-shrink-0 bg-white border border-[#DADCE0] rounded-2xl shadow-sm p-4 flex flex-col items-center animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full border-2 border-[#E8F0FE] p-0.5 overflow-hidden transition-transform duration-200 group-hover:scale-105">
                <img
                  src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=1A73E8&color=fff&size=160`}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                <Camera className="w-3 h-3 text-[#5F6368]" />
              </button>
            </div>

            <div className="mt-2 text-center space-y-0">
              <h1 className="text-sm font-medium text-[#202124] tracking-tight truncate w-full px-1">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-[#1A73E8] font-medium text-[9px] uppercase tracking-widest opacity-90">
                {user.position || 'Colaborador'}
              </p>
            </div>

            <div className="w-full mt-3 bg-[#F8F9FA] rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-medium text-[#5F6368] uppercase opacity-70">Edad</span>
                <span className="text-[11px] font-medium text-[#202124] tracking-tighter">{calculateAge(user.birth_date || '')} años</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-medium text-[#5F6368] uppercase opacity-70">Estado</span>
                <Badge variant="outline" className="rounded-full px-1.5 py-0 h-3.5 text-[7.5px] uppercase font-medium border-[#DADCE0] bg-white text-[#3C4043]">
                  {user.contract_status_name}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-medium text-[#5F6368] uppercase opacity-70">Sede</span>
                <span className="text-[11px] font-medium text-[#202124] tracking-tighter">Colombia</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-medium text-[#5F6368] uppercase opacity-70">Permisos</span>
                <span className="text-[11px] font-medium text-[#1A73E8] tracking-tighter uppercase">{user.role_name}</span>
              </div>
            </div>

            <div className="w-full mt-auto pt-3 border-t border-[#F1F3F4]">
              <p className="text-[8px] font-medium text-gray-400 uppercase tracking-widest text-center mb-1">ID Usuario</p>
              <p className="text-[10px] font-medium text-gray-500 text-center">#{user.id}</p>
            </div>
          </div>

          {/* Right Content - Ultra Compact Grid */}
          <div className="flex-1 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-2 duration-300">

            {/* Profesional Summary */}
            <BentoCard title="Laboral" icon={Briefcase}>
              <div className="space-y-2.5">
                <Highlight icon={Calendar} label="Vinculación" value={formatDate(user.hire_date || '')} />
                <Highlight icon={Calculator} label="Base" value={user.salary ? formatCurrency(user.salary) : '---'} />
                <Highlight icon={Briefcase} label="Cargo" value={user.position || '-'} />
                <Highlight icon={Activity} label="Alta" value={formatDate(user.created_at || '')} />
              </div>
            </BentoCard>

            {/* Identities Card */}
            <BentoCard title="Identidad" icon={Shield}>
              <div className="space-y-2">
                <CompactInfo label="Cédula / Documento" value={`${user.document_type} ${user.document_number}`} />
                <CompactInfo label="Género / Identidad" value={user.gender === 'M' ? 'Masculino' : user.gender === 'F' ? 'Femenino' : 'Otro'} />
                <CompactInfo label="Estado Civil" value={user.marital_status || 'Soltero/a'} />
                <CompactInfo label="Nacimiento" value={formatDate(user.birth_date || '')} />
              </div>
            </BentoCard>

            {/* Contact Information */}
            <BentoCard title="Contacto" icon={Phone}>
              <div className="space-y-2.5">
                <Highlight icon={Mail} label="E-mail" value={user.email} />
                <Highlight icon={Phone} label="Móvil" value={user.phone || 'No registrado'} />
                <Highlight icon={MapPin} label="Dirección" value={user.address || 'No registrada'} />
              </div>
            </BentoCard>

            {/* Emergency Info - Highlighted */}
            <BentoCard title="Emergencia" icon={HeartPulse} className="bg-[#FCE8E6]/20 border-[#FCE8E6]">
              <div className="flex flex-col h-full space-y-2">
                <p className="text-[9px] font-medium text-[#D93025] uppercase tracking-widest">Protocolo SOS</p>
                <div className="bg-white p-2.5 rounded-xl border border-[#FCE8E6] shadow-sm flex-1">
                  <p className="text-[11px] font-medium text-[#202124] mb-0.5">{user.emergency_contact_name || 'Sin asignar'}</p>
                  <p className="text-[#D93025] font-medium text-base">{user.emergency_contact_phone || '---'}</p>
                  <p className="text-[9px] text-[#5F6368] font-medium leading-tight uppercase opacity-60 mt-1">
                    Contacto preferente
                  </p>
                </div>
              </div>
            </BentoCard>

          </div>
        </div>
      </div>
    </DashboardLayout >
  )
}

/**
 * Refined Bento Components
 */
function BentoCard({ title, icon: Icon, children, className = "" }: any) {
  return (
    <Card className={`bg-white border border-[#DADCE0] rounded-2xl shadow-none p-3 lg:p-4 flex flex-col ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 bg-[#F8F9FA] rounded-lg">
          <Icon className="w-3.5 h-3.5 text-[#1A73E8]" strokeWidth={3} />
        </div>
        <h3 className="text-[11px] font-medium text-[#202124] tracking-tight uppercase opacity-80">{title}</h3>
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </Card>
  )
}

function Highlight({ icon: Icon, label, value }: any) {
  return (
    <div className="flex gap-2.5 items-center group">
      <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-[#5F6368] group-hover:text-[#1A73E8] group-hover:bg-[#E8F0FE] transition-colors flex-shrink-0">
        <Icon className="w-3 h-3" strokeWidth={3} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-medium text-[#5F6368] uppercase tracking-wider leading-none mb-0.5 opacity-70">{label}</p>
        <p className="text-[11px] font-medium text-[#202124] truncate tracking-tighter">{value}</p>
      </div>
    </div>
  )
}

function CompactInfo({ label, value }: any) {
  return (
    <div className="border-b border-[#F1F3F4] pb-1.5 last:border-none">
      <p className="text-[8px] font-medium text-[#5F6368] uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
      <p className="text-[11px] font-medium text-[#3C4043] tracking-tighter">{value}</p>
    </div>
  )
}
