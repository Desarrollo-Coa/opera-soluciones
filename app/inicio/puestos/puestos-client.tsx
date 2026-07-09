"use client"

import { useState, useActionState } from "react"
import { Puesto } from "@/types/puestos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Plus, Edit2, Search } from "lucide-react"
import { toast } from "sonner"
import { createPuestoAction, updatePuestoAction } from "@/actions/puestos-actions"

interface PuestosClientProps {
  initialPuestos: Puesto[]
}

export function PuestosClient({ initialPuestos }: PuestosClientProps) {
  const [puestos] = useState<Puesto[]>(initialPuestos)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPuesto, setEditingPuesto] = useState<Puesto | null>(null)

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = editingPuesto 
        ? await updatePuestoAction(prevState, formData)
        : await createPuestoAction(prevState, formData)
      
      if (result.success) {
        toast.success(result.message)
        setIsModalOpen(false)
      } else {
        toast.error(result.message || "Error al procesar la solicitud")
      }
      return result
    },
    null
  )

  const filteredPuestos = puestos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.ciudad && p.ciudad.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const openNewModal = () => {
    setEditingPuesto(null)
    setIsModalOpen(true)
  }

  const openEditModal = (puesto: Puesto) => {
    setEditingPuesto(puesto)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-indigo-600" />
            Puestos de Trabajo
          </h2>
          <p className="text-sm text-gray-500">Administra los lugares físicos de trabajo para los empleados.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar puesto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={openNewModal} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" /> Nuevo
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPuestos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No se encontraron puestos de trabajo.
                </TableCell>
              </TableRow>
            ) : (
              filteredPuestos.map((puesto) => (
                <TableRow key={puesto.id}>
                  <TableCell className="font-medium text-gray-900">{puesto.nombre}</TableCell>
                  <TableCell>{puesto.ciudad || '-'}</TableCell>
                  <TableCell>{puesto.direccion || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${puesto.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {puesto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(puesto)} className="text-indigo-600 hover:text-indigo-900">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPuesto ? 'Editar Puesto' : 'Nuevo Puesto'}</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            {editingPuesto && <input type="hidden" name="id" value={editingPuesto.id} />}
            
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Puesto *</Label>
              <Input id="nombre" name="nombre" defaultValue={editingPuesto?.nombre} required />
              {state?.errors?.nombre && <p className="text-sm text-red-500">{state.errors.nombre[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input id="ciudad" name="ciudad" defaultValue={editingPuesto?.ciudad || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" name="direccion" defaultValue={editingPuesto?.direccion || ''} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Input id="notas" name="notas" defaultValue={editingPuesto?.notas || ''} />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" id="activo" name="activo" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" defaultChecked={editingPuesto ? editingPuesto.activo : true} />
              <Label htmlFor="activo" className="font-normal">Puesto Activo</Label>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
                {isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
