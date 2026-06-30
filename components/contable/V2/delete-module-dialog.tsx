'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteFinModuleAction } from '@/actions/fin-modules';
import { toast } from 'sonner';

interface Props {
    moduleId: number;
    moduleName: string;
}

export function DeleteModuleDialog({ moduleId, moduleName }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            toast.error("Debes ingresar tu contraseña");
            return;
        }

        setLoading(true);
        // NOTA: En un sistema real extraemos el userId de la sesión (cookie/contexto).
        // Por ahora usamos id 1 como fallback si no hay sesión inyectada.
        const res = await deleteFinModuleAction(moduleId, password, 1);
        setLoading(false);

        if (res.success) {
            toast.success(res.message || "Módulo eliminado permanentemente");
            setOpen(false);
            router.refresh();
        } else {
            toast.error(res.message || "Error al eliminar");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <DialogTitle>¿Eliminar Módulo?</DialogTitle>
                    </div>
                    <DialogDescription>
                        Esta acción eliminará el libro <strong>{moduleName}</strong> con todas sus hojas y datos permanentemente.
                        <br /><br />
                        Para confirmar, ingresa tu contraseña de usuario.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleDelete}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Contraseña de Confirmación</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoFocus
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="destructive" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Eliminar Módulo
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
