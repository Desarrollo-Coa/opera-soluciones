"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import { isValidFileType, isValidFileSize, getHumanReadableFileSize } from "@/lib/file-utils"

interface ProfilePictureUploadProps {
  value?: string
  onChange: (file: File | null, previewUrl: string | null) => void
  disabled?: boolean
  className?: string
}

export function ProfilePictureUpload({ 
  value, 
  onChange, 
  disabled = false, 
  className 
}: ProfilePictureUploadProps) {
  const { toast } = useToast()
  const [preview, setPreview] = useState<string | null>(value || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update preview when value prop changes
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["jpeg", "jpg", "png", "webp"]
    if (!isValidFileType(file.name, allowedTypes)) {
      toast({ title: "Archivo no válido", description: "Solo JPG, PNG y WebP", variant: "destructive" })
      return
    }

    // Validate file size (max 5MB)
    if (!isValidFileSize(file.size, 5)) {
      const fileSize = getHumanReadableFileSize(file.size)
      toast({ title: "Archivo demasiado grande", description: `Tamaño: ${fileSize}. Máximo 5MB`, variant: "destructive" })
      return
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setSelectedFile(file)
    
    // Notify parent component
    onChange(file, previewUrl)
  }

  const handleRemove = () => {
    setPreview(null)
    setSelectedFile(null)
    onChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative">
        <Avatar className="h-24 w-24 cursor-pointer" onClick={handleClick}>
          <AvatarImage src={preview || ""} alt="Foto de perfil" />
          <AvatarFallback className="text-lg">
            <Camera className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        {preview && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {preview ? "Cambiar foto" : "Seleccionar foto"}
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          JPG, PNG o WebP. Máximo 5MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}
