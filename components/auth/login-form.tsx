"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const credentials = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Bienvenido, ${data.user.nombres}`)
        router.push("/inicio")
      } else {
        toast.error(data.error || ERROR_MESSAGES.INVALID_CREDENTIALS)
      }
    } catch (error) {
      toast.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="nombre@ejemplo.com"
          disabled={isLoading}
          autoComplete="username"
          className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20 h-12 rounded-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Contraseña</Label>
        <div className="relative group">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            disabled={isLoading}
            autoComplete="current-password"
            className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500/20 h-12 rounded-none transition-all"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors p-1"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-black h-12 rounded-none shadow-md transition-all active:scale-[0.98] uppercase tracking-widest"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Entrando...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>
    </form>
  )
}
