import { Heart } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold text-xl mb-1">
              Opera<span className="text-blue-500">Soluciones</span>
            </h3>
            <p className="text-sm">Innovación y excelencia en cada proyecto.</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 text-sm">
            <p>&copy; {currentYear} Opera Soluciones. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

