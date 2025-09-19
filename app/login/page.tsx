"use client"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"
import { useEffect } from "react"

export default function LoginPage() {
  // Initialize admin user when login page loads
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const response = await fetch('/api/init-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Admin initialization:', data.message)
        }
      } catch (error) {
        console.error('Error initializing admin:', error)
      }
    }
    
    initializeAdmin()
  }, [])
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="mb-8"
          >
            <Image
              src="/img/logopera.png"
              alt="Opera Soluciones"
              width={300}
              height={120}
              className="h-auto"
              priority
            />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 text-center">Bienvenido a SGI Opera Soluciones</h1>
          <p className="text-xl text-center text-white/90 max-w-md">
            Sistema de Gestión Integral Opera Soluciones
          </p>

          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-8 bg-gray-50"
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="lg:hidden mb-8 text-center"
          >
            <Image
              src="/img/logopera.png"
              alt="Opera Soluciones"
              width={200}
              height={80}
              className="mx-auto h-auto"
              priority
            />
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
              <CardDescription className="text-gray-600">
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Problemas para acceder?{" "}
            <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
              Solicita ayuda al administrador
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
