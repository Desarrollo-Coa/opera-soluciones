"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Eye, Shield, Award } from "lucide-react"

export function MissionVision() {
  return (
    <section id="mision-vision" className="relative py-24 bg-slate-950 text-white overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-red-500 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight"
        >
          Misión y Visión
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full bg-slate-900/40 backdrop-blur-xl border-slate-800 hover:border-blue-500/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8" />
                </div>
                <CardTitle className="text-3xl font-bold text-white">Misión</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-400 text-lg leading-relaxed">
                  Consolidamos la operación de mantenimiento, logística y construcción con
                  procesos definidos y eficientes. Aseguramos la correcta ejecución de cada
                  proyecto mediante el uso de herramientas tecnológicas y personal calificado.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full bg-slate-900/40 backdrop-blur-xl border-slate-800 hover:border-red-500/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-1 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 group-hover:scale-110 transition-transform">
                  <Eye className="w-8 h-8" />
                </div>
                <CardTitle className="text-3xl font-bold text-white">Visión</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-400 text-lg leading-relaxed">
                  Liderar la eficiencia operativa en nuestros sectores de influencia, integrando
                  la innovación y la sostenibilidad como bases fundamentales para el desarrollo
                  continuo de nuestra infraestructura comercial y operativa.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Core values row */}
        <div className="mt-20 flex flex-wrap justify-center gap-12 border-t border-slate-800/50 pt-12">
          {["Excelencia", "Compromiso", "Innovación", "Sostenibilidad"].map((value, i) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-2"
            >
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-slate-500 font-medium uppercase tracking-widest text-xs">{value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

