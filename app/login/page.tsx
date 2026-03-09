"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        await fetch('/api/init-admin', { method: 'POST' })
      } catch (error) {
        console.error('Error initializing admin:', error)
      }
    }
    initializeAdmin()
  }, [])

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden relative">
      {/* Background Mesh Gradient with Light Blue/Cyan */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-400/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 blur-[130px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      {/* Back to Home Button */}
      <Link href="/" className="absolute top-8 left-8 z-20 flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors group font-medium">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Volver al inicio</span>
      </Link>

      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[50%] relative flex-col justify-center items-center px-12 z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 text-center"
        >
          <Image
            src="/recursos/logopera.png"
            alt="Opera Soluciones"
            width={350}
            height={140}
            className="h-auto mx-auto"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-slate-900 leading-tight">
            Bienvenido a <span className="text-sky-600">SGI Opera Soluciones</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
            Sistema de Gestión Integral Opera Soluciones
          </p>
        </motion.div>
      </motion.div>

      {/* Right Panel - Login Card (White and Square) */}
      <div className="flex-1 flex items-center justify-center p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile View Header */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Opera<span className="text-sky-600">Soluciones</span>
            </h1>
            <p className="text-slate-500">Acceso al Sistema SGI</p>
          </div>

          <Card className="bg-white border-slate-200 shadow-2xl rounded-sm overflow-hidden p-2">
            <div className="bg-sky-600 h-1.5 w-full mb-6" />
            <CardHeader className="text-center pt-4 pb-4">
              <CardTitle className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Iniciar Sesión</CardTitle>
              <CardDescription className="text-slate-500 font-medium pt-2">
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              <LoginForm />
            </CardContent>
          </Card>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-sm text-slate-500 mt-8 font-medium"
          >
            ¿Problemas para acceder?{" "}
            <a href="#" className="text-sky-600 hover:text-sky-700 font-bold transition-colors">
              Solicita ayuda al administrador
            </a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
