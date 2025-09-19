"use client"
import { Header } from "@/components/layout/header"
import { Hero } from "@/components/sections/hero"
import { About } from "@/components/sections/about"
import { MissionVision } from "@/components/sections/mission-vision"
import { Footer } from "@/components/layout/footer"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
        <Hero />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}>
        <About />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}>
        <MissionVision />
      </motion.div>
      <Footer />
    </main>
  )
}
