'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Loader2, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { addColumnToModuleAction } from "@/actions/fin-modules";
import { toast } from "sonner";

const formSchema = z.object({
    header_name: z.string().min(2, "Debe tener al menos 2 caracteres"),
    field_key: z.string().regex(/^[a-z0-9_]*$/, "Solo minúsculas y guiones bajos (ej: total_bruto)"),
    field_type: z.enum(['text', 'number', 'date', 'select', 'currency', 'boolean']),
    is_required: z.boolean(),
    options: z.array(z.string()).optional(),
    width: z.number(),
});

export function AddColumnDialog({ moduleId, sheetId }: { moduleId: number, sheetId: number }) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            header_name: "",
            field_key: "",
            field_type: "text",
            is_required: false,
            options: [],
            width: 150,
        },
    });

    const watchType = form.watch("field_type");
    const currentOptions = form.watch("options") || [];
    const [newOption, setNewOption] = useState("");

    const addOption = () => {
        if (!newOption.trim()) return;
        const opt = newOption.trim();
        if (!currentOptions.includes(opt)) {
            form.setValue("options", [...currentOptions, opt], { shouldDirty: true });
        }
        setNewOption("");
    };

    const removeOption = (optToRemove: string) => {
        form.setValue("options", currentOptions.filter(o => o !== optToRemove), { shouldDirty: true });
    };

    // Auto-generar field_key basado en el nombre
    const handleHeaderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setValue('header_name', value);

        // Convertir "Mi Columna" a "mi_columna" y setearlo si el usuario no ha escrito nada manual
        if (!form.formState.dirtyFields.field_key) {
            const key = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            form.setValue('field_key', key);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        let parsedOptions = null;
        if (values.field_type === 'select' && values.options && values.options.length > 0) {
            parsedOptions = values.options;
        }

        const input = {
            module_id: moduleId,
            sheet_id: sheetId,
            header_name: values.header_name,
            field_key: values.field_key,
            field_type: values.field_type,
            is_required: values.is_required,
            options: parsedOptions,
            width: Number(values.width) || 150,
            column_order: 0, // Se puede mejorar después
        };

        const result = await addColumnToModuleAction(input);

        if (result.success) {
            toast.success("Columna agregada correctamente");
            setOpen(false);
            form.reset();
        } else {
            toast.error(result.message || "Error al agregar la columna");
        }
    };

    if (!mounted) {
        return (
            <Button size="sm" variant="outline" className="h-8">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Columna
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Columna
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Agregar Columna</DialogTitle>
                    <DialogDescription>
                        Añade un nuevo campo a este módulo. Definirá el tipo de dato y cómo se visualizará.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="header_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Columna</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="ej: Centro de Costo"
                                            {...field}
                                            onChange={handleHeaderNameChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="field_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Dato</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="text">Texto</SelectItem>
                                            <SelectItem value="number">Número</SelectItem>
                                            <SelectItem value="currency">Moneda ($)</SelectItem>
                                            <SelectItem value="date">Fecha</SelectItem>
                                            <SelectItem value="select">Lista (Desplegable)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchType === 'select' && (
                            <div className="space-y-3">
                                <FormLabel>Opciones de Selección</FormLabel>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ej: Aprobado"
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addOption();
                                            }
                                        }}
                                    />
                                    <Button type="button" variant="secondary" onClick={addOption}>
                                        <Plus className="h-4 w-4 mr-1" /> Agregar
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {currentOptions.length === 0 ? (
                                        <span className="text-xs text-muted-foreground">No hay opciones agregadas</span>
                                    ) : (
                                        currentOptions.map((opt, idx) => (
                                            <Badge key={idx} variant="secondary" className="pl-3 pr-1 py-1">
                                                {opt}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-4 w-4 ml-1 hover:bg-transparent text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeOption(opt)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="is_required"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Requerido</FormLabel>
                                        <FormDescription>
                                            El usuario deberá llenar este campo siempre.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Columna
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
