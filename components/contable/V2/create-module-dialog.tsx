'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createFinModuleAction } from '@/actions/fin-modules';
import { toast } from 'sonner';

export function CreateModuleDialog({ customTrigger }: { customTrigger?: boolean }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        setLoading(true);
        try {
            // TODO: Get actual user ID from your auth context/store.
            // For now we use 1 as placeholder per DB setup
            const res = await createFinModuleAction({ name, description }, 1);

            if (res.success && res.data) {
                toast.success('Módulo creado con éxito');
                setOpen(false);
                // Reset form
                setName('');
                setDescription('');
                router.refresh(); // Refresh page to see new module
            } else {
                toast.error(res.message || 'Error al crear módulo');
            }
        } catch (error) {
            toast.error('Error de servidor al crear módulo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {customTrigger ? (
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground w-max font-normal">
                        <Plus className="h-3.5 w-3.5" /> Nueva Hoja
                    </Button>
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Módulo Contable y Financiero
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Hoja Contable y Financiera</DialogTitle>
                    <DialogDescription>
                        Crea un nuevo módulo tipo Excel. Posteriormente podrás agregarle todas las columnas que necesites.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Módulo</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Reporte Facturas Q1 2026"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Gastos administrativos y operativos de la sucursal..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Módulo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
