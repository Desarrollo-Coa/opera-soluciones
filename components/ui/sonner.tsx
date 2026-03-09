"use client"

import { useTheme } from "next-themes"
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-slate-400" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-l-[6px] group-[.toaster]:rounded-none group-[.toaster]:shadow-2xl border-slate-100 p-4 h-auto min-h-[70px] flex items-center mb-2 gap-3 overflow-hidden",
          success: "!group-[.toast]:border-l-green-600",
          error: "!group-[.toast]:border-l-red-600",
          info: "!group-[.toast]:border-l-slate-400",
          warning: "!group-[.toast]:border-l-amber-500",
          title: "group-[.toast]:text-slate-900 group-[.toast]:font-bold text-[15px] mb-1",
          description: "group-[.toast]:text-slate-500 group-[.toast]:font-medium text-[13px]",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-white group-[.toast]:rounded-none",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 group-[.toast]:rounded-none",
          closeButton:
            "group-[.toast]:bg-white group-[.toast]:border-slate-200 group-[.toast]:text-slate-400 hover:group-[.toast]:text-slate-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
