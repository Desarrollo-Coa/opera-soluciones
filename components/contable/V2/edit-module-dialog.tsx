'use client';

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Loader2 } from "lucide-react";
import { updateFinModuleAction } from "@/actions/fin-modules";
import { toast } from "sonner";

interface Props {
    module: { id: number; name: string; description: string | null };
}

export function EditModuleDialog({ module }: Props) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(module.name);
    const [description, setDescription] = useState(module.description || "");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        const res = await updateFinModuleAction(module.id, { name, description });
        setLoading(false);

        if (res.success) {
            toast.success("Módulo actualizado");
            setOpen(false);
        } else {
            toast.error(res.message || "Error al actualizar");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Módulo</DialogTitle>
                    <DialogDescription>
                        Actualiza el nombre y descripción del libro de trabajo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre del Módulo</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Gastos Operativos"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción (Opcional)</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descripción del contenido"
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
