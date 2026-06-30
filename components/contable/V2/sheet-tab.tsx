'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { updateFinSheetAction, deleteFinSheetAction } from '@/actions/fin-modules';
import { toast } from 'sonner';

interface Props {
    sheet: { id: number; name: string };
    moduleId: number;
    isActive: boolean;
}

export function SheetTab({ sheet, moduleId, isActive }: Props) {
    const router = useRouter();
    const [isRenaming, setIsRenaming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [newName, setNewName] = useState(sheet.name);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || newName === sheet.name) {
            setIsRenaming(false);
            return;
        }

        setLoading(true);
        const res = await updateFinSheetAction(sheet.id, { name: newName });
        setLoading(false);

        if (res.success) {
            toast.success("Hoja renombrada");
            setIsRenaming(false);
            router.refresh();
        } else {
            toast.error(res.message || "Error al renombrar");
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        const res = await deleteFinSheetAction(sheet.id);
        setLoading(false);

        if (res.success) {
            toast.success("Hoja eliminada");
            setIsDeleting(false);
            // Si la hoja eliminada era la activa, o incluso si no, forzamos redirección al índice del módulo (que cargará la primera hoja disponible)
            router.push(`/inicio/contable-v2/${moduleId}`);
            router.refresh();
        } else {
            toast.error(res.message || "Error al eliminar");
        }
    };

    if (!mounted) {
        return (
            <Link
                href={`/inicio/contable-v2/${moduleId}?sheet=${sheet.id}`}
                className={`flex items-center px-4 h-8 text-sm font-medium rounded-t-sm transition-all decoration-transparent select-none whitespace-nowrap ${isActive
                    ? 'bg-background border-t-2 border-primary border-x border-x-border text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-t-2 border-transparent'
                    }`}
            >
                {sheet.name}
            </Link>
        );
    }

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <Link
                        href={`/inicio/contable-v2/${moduleId}?sheet=${sheet.id}`}
                        className={`flex items-center px-4 h-8 text-sm font-medium rounded-t-sm transition-all decoration-transparent select-none whitespace-nowrap ${isActive
                            ? 'bg-background border-t-2 border-primary border-x border-x-border text-primary shadow-sm'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-t-2 border-transparent'
                            }`}
                    >
                        {sheet.name}
                    </Link>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => setIsRenaming(true)} className="gap-2">
                        <Pencil className="w-4 h-4" /> Renombrar
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setIsDeleting(true)} className="gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4" /> Eliminar
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Dialog de Renombrar */}
            <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Renombrar Hoja</DialogTitle>
                        <DialogDescription>
                            Ingresa el nuevo nombre para la pestaña.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRename}>
                        <div className="py-4">
                            <Label htmlFor="newName">Nuevo Nombre</Label>
                            <Input
                                id="newName"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                                disabled={loading}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsRenaming(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog de Eliminar */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">¿Eliminar Hoja?</DialogTitle>
                        <DialogDescription>
                            Esta acción es permanente. Se eliminarán todas las columnas y filas de datos dentro de <b>{sheet.name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDeleting(false)}>Cancelar</Button>
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Eliminar Permanentemente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
