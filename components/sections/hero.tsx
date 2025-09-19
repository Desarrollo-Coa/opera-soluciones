import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 animated-bg" />
      <div
        className="absolute inset-0 opacity-60 blur-sm"
        style={{
          backgroundImage: "url(/img/BANNER.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="mx-auto mb-6 flex items-center justify-center">
            <Image 
              src="/img/ICON.PNG" 
              alt="Opera Soluciones" 
              width={96} 
              height={96} 
              className="h-24 w-auto object-contain" 
            />
          </div>
        </div>

        <h1 className="hero-title-animated text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Bienvenido a{" "}
          <span className="relative">
            <span className="text-yellow-500 font-extrabold">
              Opera
            </span>
          </span>{" "}
          <span className="relative">
            <span className="text-red-500 font-extrabold">
              Soluciones
            </span>
          </span>
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-gray-300">Innovación y excelencia en cada proyecto</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-slate-900 text-lg px-8 py-3 bg-transparent"
            >
              Acceso al Sistema
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
