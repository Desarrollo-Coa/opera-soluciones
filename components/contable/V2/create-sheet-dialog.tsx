'use client';

import { useState, useEffect } from 'react';
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
import { Plus } from "lucide-react";
import { createFinSheetAction } from '@/actions/fin-modules';
import { toast } from 'sonner';

export function CreateSheetDialog({ moduleId }: { moduleId: number }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre de la hoja es requerido');
            return;
        }

        setLoading(true);
        try {
            const res = await createFinSheetAction({
                module_id: moduleId,
                name,
                sheet_order: 0
            });

            if (res.success && res.data) {
                toast.success('Hoja creada con éxito');
                setOpen(false);
                setName('');
                router.push(`/inicio/contable-v2/${moduleId}?sheet=${res.data.id}`);
                router.refresh();
            } else {
                toast.error(res.message || 'Error al crear la hoja');
            }
        } catch (error) {
            toast.error('Error de servidor al crear la hoja');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground w-max font-normal">
                <Plus className="h-3.5 w-3.5" /> Nueva Hoja
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground w-max font-normal">
                    <Plus className="h-3.5 w-3.5" /> Nueva Hoja
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nueva Hoja (Pestaña)</DialogTitle>
                    <DialogDescription>
                        Crea una nueva pestaña de datos dentro de este módulo. Cada hoja tiene sus propias columnas y filas.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sheetName">Nombre de la Hoja</Label>
                            <Input
                                id="sheetName"
                                placeholder="Ej: Febrero 2026, Consolidado..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Hoja'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
