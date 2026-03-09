"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { motion } from "framer-motion"
import { CheckCircle2, Users, Target, Rocket } from "lucide-react"

const features = [
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Equipo Experto",
    description: "Profesionales multidisciplinarios con amplia formación y experiencia."
  },
  {
    icon: <Target className="w-6 h-6 text-red-600" />,
    title: "Enfoque Preciso",
    description: "Abordamos cada desafío con rigor, transparencia y creatividad."
  },
  {
    icon: <Rocket className="w-6 h-6 text-yellow-500" />,
    title: "Innovación",
    description: "Transformamos proyectos mediante tecnología y procesos optimizados."
  }
]

export function About() {
  return (
    <section id="quienes-somos" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-red-50/30 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Quiénes Somos
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: 80 }}
            viewport={{ once: true }}
            className="h-1.5 bg-blue-600 mx-auto rounded-full mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            Opera Soluciones es una empresa líder en mantenimiento, logística y construcción,
            comprometida con la excelencia y la profesionalidad. Impulsamos el crecimiento
            de nuestros clientes mediante soluciones integrales y servicios de alta calidad.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                Valoramos la confianza y la colaboración como pilares fundamentales. Trabajamos constantemente para transformar cada proyecto en una oportunidad de mejora y desarrollo, adaptándonos a las necesidades específicas de cada industria.
              </p>
            </div>

            <div className="grid gap-6">
              {features.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors hover:bg-white hover:shadow-md group">
                  <div className="shrink-0 p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-red-600 rounded-3xl blur-2xl opacity-10 animate-pulse" />
            <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-slate-100">
              <Image
                src="/recursos/banner.jpg" // Usando el banner existente como imagen de equipo
                alt="Excelencia en Opera Soluciones"
                width={600}
                height={500}
                className="rounded-2xl object-cover w-full h-[450px]"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block max-w-[200px]">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-slate-900">Certificados</span>
                </div>
                <p className="text-xs text-slate-500">Cumplimos con los más altos estándares de calidad internacional.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

