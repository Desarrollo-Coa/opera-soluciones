"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, Zap, BarChart3 } from "lucide-react"

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-32 md:pt-40 pb-20">
      {/* Mesh Gradient Background with Light Blue/Cyan */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-sky-500/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      {/* Content */}
      <div className="container relative z-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8 mt-4 md:mt-0 text-sm font-medium backdrop-blur-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Gestión Estratégica Operativa</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight text-white"
          >
            Bienvenido a <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 animate-gradient-x">
              Opera Soluciones
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 justify-center"
          >
            <Link href="/login">
              <Button
                size="lg"
                className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white border-none shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all rounded-full"
              >
                Acceso al Sistema
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#quienes-somos">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-lg border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800 backdrop-blur-sm rounded-full"
              >
                Conocer Más
              </Button>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

