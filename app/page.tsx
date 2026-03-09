"use client"

import { Header } from "@/components/layout/header"
import { Hero } from "@/components/sections/hero"
import { About } from "@/components/sections/about"
import { MissionVision } from "@/components/sections/mission-vision"
import { Footer } from "@/components/layout/footer"

/**
 * HomePage - Rediseño Premium 2026
 * Se han optimizado las secciones con Framer Motion interno
 * para una mejor orquestación y efectos visuales modernos.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <About />
      <MissionVision />
      <Footer />
    </main>
  )
}

