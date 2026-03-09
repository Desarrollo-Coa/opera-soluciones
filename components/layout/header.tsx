"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn } from "lucide-react"
import { NAVIGATION_LINKS } from "@/lib/constants"
import { useScroll } from "@/hooks/use-scroll"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const isScrolled = useScroll()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = NAVIGATION_LINKS

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-7xl rounded-2xl border ${isScrolled
        ? "bg-slate-900/80 backdrop-blur-xl shadow-2xl border-slate-700/50 py-2"
        : "bg-white/5 backdrop-blur-md border-white/10 py-4"
        }`}
    >
      <nav className="px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-red-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <Image
                src="/recursos/icon.png"
                alt="Opera Soluciones"
                width={36}
                height={36}
                className="relative h-9 w-9 object-contain"
                priority
              />
            </div>
            <Link
              href="/"
              className={`text-xl font-bold tracking-tight transition-colors ${isScrolled ? "text-white" : "text-white"
                }`}
            >
              Opera<span className="text-blue-500">Soluciones</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-white font-medium transition-all px-4 py-2 rounded-xl hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-6 w-[1px] bg-slate-700 mx-4" />
            <Link href="/login">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-900/20 px-6 rounded-xl transition-all h-10 group"
              >
                <LogIn className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Acceso
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 rounded-xl hover:bg-white/10 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="md:hidden mt-4 pb-4 overflow-hidden"
            >
              <div className="flex flex-col space-y-2 p-2 bg-slate-900/90 rounded-xl border border-slate-700/50">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-300 hover:text-white font-medium transition-colors px-4 py-3 rounded-lg hover:bg-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="default"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-lg transition-all"
                  >
                    Acceso al Sistema
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

