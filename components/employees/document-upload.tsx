"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2 } from "lucide-react"

interface DocumentUploadProps {
  employeeId: number
  onUploadSuccess: () => void
  // Nombres de tipos permitidos para filtrar el selector (ej. ["Contrato", "Volantes de pago"]) 
  allowedTypeNames?: string[]
  // Nombre de tipo por defecto a preseleccionar (si existe)
  defaultTypeName?: string
}

export function DocumentUpload({ employeeId, onUploadSuccess, allowedTypeNames, defaultTypeName }: DocumentUploadProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [documentTypes, setDocumentTypes] = useState<any[]>([])
  const [formData, setFormData] = useState({
    document_name: '',
    document_type_id: '',
    description: '',
    file: null as File | null
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        document_name: file.name
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('employee_id', employeeId.toString())
      formDataToSend.append('document_name', formData.document_name)
      formDataToSend.append('document_type_id', formData.document_type_id)
      formDataToSend.append('description', formData.description)
      if (formData.file) {
        formDataToSend.append('file', formData.file)
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Documento subido correctamente",
        })
        setOpen(false)
        setFormData({
          document_name: '',
          document_type_id: '',
          description: '',
          file: null
        })
        onUploadSuccess()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al subir el documento",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: "Error al subir el documento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentTypes = async () => {
    try {
      const response = await fetch('/api/reference/document-types')
      if (response.ok) {
        const data = await response.json()
        let types = data.document_types || []
        if (allowedTypeNames && allowedTypeNames.length > 0) {
          types = types.filter((t: any) => allowedTypeNames.includes(t.name))
        }
        setDocumentTypes(types)
        // Preseleccionar tipo por defecto si aplica
        if (defaultTypeName) {
          const def = types.find((t: any) => t.name === defaultTypeName)
          if (def) {
            setFormData(prev => ({ ...prev, document_type_id: def.id.toString() }))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching document types:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={fetchDocumentTypes}>
          <Upload className="mr-2 h-4 w-4" />
          Subir Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Documento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Archivo *</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              required
            />
          </div>

          <div>
            <Label htmlFor="document_name">Nombre del Documento *</Label>
            <Input
              id="document_name"
              value={formData.document_name}
              onChange={(e) => setFormData(prev => ({ ...prev, document_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="document_type_id">Tipo de Documento *</Label>
            <Select value={formData.document_type_id} onValueChange={(value) => setFormData(prev => ({ ...prev, document_type_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
