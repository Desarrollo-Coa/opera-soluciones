'use client';

import { useState, useMemo } from "react";
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
import {
    Settings2, Trash2, Pencil, Check, X, Loader2, Plus, Search,
    Type, Hash, DollarSign, Calendar, List, CheckSquare, Info
} from "lucide-react";
import { FinModuleColumn, FinFieldType } from "@/types/fin-modules";
import { updateFinColumnAction, deleteFinColumnAction } from "@/actions/fin-modules";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
    columns: FinModuleColumn[];
    moduleId: number;
    sheetId: number;
}

const TYPE_ICONS: Record<FinFieldType, any> = {
    text: Type,
    number: Hash,
    currency: DollarSign,
    date: Calendar,
    select: List,
    boolean: CheckSquare
};

const TYPE_LABELS: Record<FinFieldType, string> = {
    text: "Texto",
    number: "Número",
    currency: "Moneda",
    date: "Fecha",
    select: "Lista Desplegable",
    boolean: "Check (Booleano)"
};

export function ManageColumnsDialog({ columns, moduleId, sheetId }: Props) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editType, setEditType] = useState<FinFieldType>("text");
    const [editOptions, setEditOptions] = useState<string[]>([]);
    const [newOption, setNewOption] = useState("");
    const [loading, setLoading] = useState<number | null>(null);

    const filteredColumns = useMemo(() => {
        return columns.filter(c =>
            c.header_name.toLowerCase().includes(search.toLowerCase()) ||
            c.field_key.toLowerCase().includes(search.toLowerCase())
        );
    }, [columns, search]);

    const handleStartEdit = (col: FinModuleColumn) => {
        setEditingId(col.id);
        setEditName(col.header_name);
        setEditType(col.field_type);
        setEditOptions(col.options || []);
    };

    const handleSaveEdit = async (id: number) => {
        if (!editName.trim()) return;
        setLoading(id);

        const res = await updateFinColumnAction(id, {
            header_name: editName,
            field_type: editType,
            options: editType === 'select' ? editOptions : null
        });

        setLoading(null);

        if (res.success) {
            toast.success("Estructura actualizada");
            setEditingId(null);
        } else {
            toast.error(res.message || "Error al actualizar");
        }
    };

    const addOption = () => {
        if (!newOption.trim()) return;
        if (!editOptions.includes(newOption.trim())) {
            setEditOptions([...editOptions, newOption.trim()]);
        }
        setNewOption("");
    };

    const removeOption = (opt: string) => {
        setEditOptions(editOptions.filter(o => o !== opt));
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta columna? Los datos ya guardados no se borrarán de la base de datos, pero la columna dejará de ser visible en el Excel.")) return;

        setLoading(id);
        const res = await deleteFinColumnAction(id);
        setLoading(null);

        if (res.success) {
            toast.success("Columna removida con éxito");
        } else {
            toast.error(res.message || "No se pudo eliminar la columna");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/20 hover:border-primary/50 transition-colors">
                    <Settings2 className="h-3.5 w-3.5" />
                    <span className="text-xs">Configurar Columnas</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl border-none shadow-2xl">
                <div className="bg-primary/5 p-6 border-b border-primary/10 shrink-0">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-md">
                                <Settings2 className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">Arquitectura de Datos</DialogTitle>
                                <DialogDescription className="text-muted-foreground mt-0.5">
                                    Define y organiza las dimensiones de información de esta hoja.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-6 flex items-center gap-3 bg-background/50 border border-primary/10 rounded-full px-4 py-1.5 shadow-inner focus-within:border-primary/30 transition-all">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder="Buscar columnas por nombre o sistema..."
                            className="bg-transparent border-none outline-none text-sm w-full py-1 text-foreground placeholder:text-muted-foreground/60"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-2 bg-muted/5 min-h-[400px]">
                    <div className="grid grid-cols-1 gap-2 p-2 pt-4">
                        <AnimatePresence mode="popLayout">
                            {filteredColumns.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="col-span-1 flex flex-col items-center justify-center py-20 text-center"
                                >
                                    <div className="p-4 bg-muted/40 rounded-full mb-4">
                                        <Info className="h-8 w-8 text-muted-foreground/40" />
                                    </div>
                                    <h3 className="font-medium text-muted-foreground">No se encontraron columnas</h3>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Intenta con otros términos o agrega una nueva desde el módulo.</p>
                                </motion.div>
                            ) : (
                                filteredColumns.map((col) => {
                                    const Icon = TYPE_ICONS[col.field_type] || Type;
                                    const isEditing = editingId === col.id;

                                    return (
                                        <motion.div
                                            key={col.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className={cn(
                                                "group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300",
                                                isEditing
                                                    ? "border-primary bg-background shadow-lg ring-1 ring-primary/20 z-10"
                                                    : "border-border/60 bg-white hover:border-primary/30 hover:shadow-md"
                                            )}
                                        >
                                            <div className="flex items-center justify-between p-4 px-5">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={cn(
                                                        "p-2.5 rounded-xl transition-colors shrink-0 shadow-sm",
                                                        isEditing ? "bg-primary text-primary-foreground" : "bg-muted/50 text-primary group-hover:bg-primary/10"
                                                    )}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>

                                                    <div className="flex-1 space-y-1">
                                                        {isEditing ? (
                                                            <div className="space-y-3 pr-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 ml-1">Cabecera Visual</p>
                                                                    <Input
                                                                        value={editName}
                                                                        onChange={(e) => setEditName(e.target.value)}
                                                                        className="h-9 font-medium shadow-none focus-visible:ring-offset-1 focus-visible:ring-1"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 ml-1">Tipo de Dato</p>
                                                                    <Select value={editType} onValueChange={(v: any) => setEditType(v)}>
                                                                        <SelectTrigger className="h-9 shadow-none">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {Object.entries(TYPE_LABELS).map(([val, label]) => (
                                                                                <SelectItem key={val} value={val}>{label}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                {editType === 'select' && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        className="pt-2 pb-1"
                                                                    >
                                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70 ml-1 mb-2">Editor de Opciones</p>
                                                                        <div className="flex gap-2 mb-3">
                                                                            <Input
                                                                                value={newOption}
                                                                                onChange={(e) => setNewOption(e.target.value)}
                                                                                placeholder="Escribe opción..."
                                                                                className="h-8 text-xs shadow-none"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        e.preventDefault();
                                                                                        addOption();
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Button size="icon" variant="secondary" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all" onClick={addOption}>
                                                                                <Plus className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-1.5 max-w-full">
                                                                            <AnimatePresence>
                                                                                {editOptions.map((opt, i) => (
                                                                                    <motion.div
                                                                                        key={opt}
                                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                                                    >
                                                                                        <Badge variant="secondary" className="text-[11px] py-1 px-2.5 bg-muted group/opt hover:bg-muted/80 transition-all flex items-center gap-1.5 border border-transparent hover:border-border">
                                                                                            {opt}
                                                                                            <button className="text-muted-foreground/60 hover:text-destructive p-0" onClick={() => removeOption(opt)}>
                                                                                                <X className="h-2.5 w-2.5" />
                                                                                            </button>
                                                                                        </Badge>
                                                                                    </motion.div>
                                                                                ))}
                                                                            </AnimatePresence>
                                                                            {editOptions.length === 0 && (
                                                                                <p className="text-[11px] italic text-muted-foreground ml-1">Agrega al menos una opción...</p>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <h4 className="font-semibold text-sm tracking-tight text-foreground truncate max-w-[300px] group-hover:text-primary transition-colors">
                                                                    {col.header_name}
                                                                </h4>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-mono text-muted-foreground/70 uppercase">sys: {col.field_key}</span>
                                                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                                    <span className="text-[10px] font-medium text-primary/80 uppercase tracking-tighter">{TYPE_LABELS[col.field_type]}</span>
                                                                </div>

                                                                {!isEditing && col.field_type === 'select' && col.options && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {col.options.slice(0, 5).map((o, i) => (
                                                                            <span key={i} className="text-[9px] font-bold bg-muted/60 text-muted-foreground/80 px-1.5 py-0.5 rounded border border-border/20">{o}</span>
                                                                        ))}
                                                                        {col.options.length > 5 && <span className="text-[9px] font-bold text-primary/60 self-center">+{col.options.length - 5} más</span>}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 pl-4">
                                                    {isEditing ? (
                                                        <div className="flex flex-col gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="h-8 gap-1 shadow-sm px-3"
                                                                onClick={() => handleSaveEdit(col.id)}
                                                                disabled={loading === col.id}
                                                            >
                                                                {loading === col.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                                                <span className="text-xs">Aplicar</span>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 text-muted-foreground hover:bg-muted/50"
                                                                onClick={() => setEditingId(null)}
                                                            >
                                                                <span className="text-xs">Cancelar</span>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                                                                onClick={() => handleStartEdit(col)}
                                                                disabled={loading !== null}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <div className="w-[1px] h-6 bg-border/40 mx-1" />
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-9 w-9 p-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                                                                onClick={() => handleDelete(col.id)}
                                                                disabled={loading !== null}
                                                            >
                                                                {loading === col.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="p-4 bg-muted/20 border-t border-border flex justify-between items-center px-6 shrink-0">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        Total: {columns.length} dimensiones activas
                    </p>
                    <Button variant="default" className="shadow-lg rounded-full px-6" onClick={() => setOpen(false)}>
                        Listo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
