"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { NAVIGATION_LINKS } from "@/lib/constants"
import { useScroll } from "@/hooks/use-scroll"

export function Header() {
  const isScrolled = useScroll()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Use navigation links from constants
  const navLinks = NAVIGATION_LINKS

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100"
          : "bg-white/90 backdrop-blur-md"
      }`}
    >
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image 
              src="/recursos/icon.png" 
              alt="Opera Soluciones" 
              width={32} 
              height={32} 
              className="h-8 w-8 object-contain"
              priority
            />
            <Link href="#" className="text-2xl font-extrabold tracking-tight text-blue-700 drop-shadow-sm">
              Opera Soluciones
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-blue-700 hover:text-blue-500 font-medium transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md px-5 py-2 rounded-lg transition-all"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-blue-700 bg-blue-50 p-2 rounded-full shadow hover:bg-blue-100 transition-all" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 rounded-xl bg-white/95 shadow-lg border border-blue-100">
            <div className="flex flex-col space-y-4 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-blue-700 hover:text-blue-500 font-medium transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md px-5 py-2 rounded-lg transition-all"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
