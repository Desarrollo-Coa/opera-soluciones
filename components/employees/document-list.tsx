"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Trash2, Eye, FileText } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface EmployeeDocument {
  id: number
  document_name: string
  file_url: string
  document_type_name: string
  uploaded_at: string
  description?: string
}

interface DocumentListProps {
  documents: EmployeeDocument[]
  loading: boolean
  onDeleteSuccess: () => void
}

export function DocumentList({ documents, loading, onDeleteSuccess }: DocumentListProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const handleDownload = (doc: EmployeeDocument) => {
    // Create a temporary link to download the file
    const link = window.document.createElement('a')
    link.href = doc.file_url
    link.download = doc.document_name
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const handleDelete = async (id: number) => {
    setIsDeleting(id)
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const res = await response.json() // Assuming API returns a JSON response with success/message
        if (res.success) {
          toast.success("Documento eliminado correctamente")
          onDeleteSuccess()
        } else {
          toast.error(res.message || "Error al eliminar el documento")
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }))
        toast.error(errorData.message || "Error al eliminar el documento")
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error("Error al procesar la eliminación")
    } finally {
      setIsDeleting(null)
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️'
      default:
        return '📎'
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'Contrato': return 'default'
      case 'Hoja de vida': return 'secondary'
      case 'Volantes de pago': return 'outline'
      case 'Exámenes médicos': return 'destructive'
      case 'Seguridad social': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando documentos...</div>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documentos</CardTitle>
          <CardDescription>
            No hay documentos subidos para este empleado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No se han subido documentos aún</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documentos ({documents.length})</CardTitle>
        <CardDescription>
          Documentos subidos para este empleado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha de Subida</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getFileIcon(document.document_name)}</span>
                      <span className="font-medium">{document.document_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(document.document_type_name)}>
                      {document.document_type_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(document.uploaded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {document.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(document)}
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(document.file_url, '_blank')}
                        title="Ver"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Eliminar"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este documento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará el archivo y no podrás recuperarlo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(document.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
