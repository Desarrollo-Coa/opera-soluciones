"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Edit, Trash2, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
    getTodasLasPreguntasAction,
    crearPreguntaAction,
    actualizarPreguntaAction,
    togglePreguntaAction,
    actualizarOrdenPreguntasAction,
    eliminarPreguntaAction
} from "@/actions/preguntas-actions";

export function PreguntasModal() {
    const [open, setOpen] = useState(false);
    const [preguntas, setPreguntas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state
    const [texto, setTexto] = useState("");
    const [tipo, setTipo] = useState("CHECKBOX");
    const [obligatoria, setObligatoria] = useState(true);
    const [activo, setActivo] = useState(true);
    const [opciones, setOpciones] = useState<{ id?: number, texto: string, valor: string }[]>([]);

    useEffect(() => {
        if (open) {
            cargarPreguntas();
            resetForm();
        }
    }, [open]);

    const cargarPreguntas = async () => {
        setLoading(true);
        const res = await getTodasLasPreguntasAction();
        if (res.success && res.data) {
            setPreguntas(res.data);
        } else {
            toast.error("Error al cargar preguntas");
        }
        setLoading(false);
    };

    const resetForm = () => {
        setEditingId(null);
        setTexto("");
        setTipo("CHECKBOX");
        setObligatoria(true);
        setActivo(true);
        setOpciones([]);
    };

    const handleEdit = (p: any) => {
        setEditingId(p.id);
        setTexto(p.texto);
        setTipo(p.tipo);
        setObligatoria(p.obligatoria);
        setActivo(p.activo);
        setOpciones(p.opciones || []);
    };

    const handleGuardar = async () => {
        if (!texto.trim()) {
            toast.error("El texto de la pregunta es obligatorio");
            return;
        }

        if (tipo === "RADIO" && opciones.length < 2) {
            toast.error("Debes agregar al menos 2 opciones para preguntas de selección única");
            return;
        }

        const data = { texto, tipo, obligatoria, activo, opciones: tipo === "RADIO" ? opciones : [] };
        
        let res;
        if (editingId) {
            res = await actualizarPreguntaAction(editingId, data);
        } else {
            res = await crearPreguntaAction(data);
        }

        if (res.success) {
            toast.success(res.message);
            resetForm();
            cargarPreguntas();
        } else {
            toast.error(res.message);
        }
    };

    const handleToggleActivo = async (id: number, currentEstado: boolean) => {
        const res = await togglePreguntaAction(id, !currentEstado);
        if (res.success) {
            toast.success(res.message);
            cargarPreguntas();
        } else {
            toast.error(res.message);
        }
    };

    const moverOrden = async (index: number, direccion: 'UP' | 'DOWN') => {
        if (direccion === 'UP' && index === 0) return;
        if (direccion === 'DOWN' && index === preguntas.length - 1) return;

        const nuevasPreguntas = [...preguntas];
        const swapIndex = direccion === 'UP' ? index - 1 : index + 1;
        
        const temp = nuevasPreguntas[index];
        nuevasPreguntas[index] = nuevasPreguntas[swapIndex];
        nuevasPreguntas[swapIndex] = temp;

        setPreguntas(nuevasPreguntas);

        const idsOrdenados = nuevasPreguntas.map(p => p.id);
        await actualizarOrdenPreguntasAction(idsOrdenados);
    };

    const agregarOpcion = () => {
        setOpciones([...opciones, { texto: "", valor: "" }]);
    };

    const actualizarOpcion = (index: number, field: 'texto' | 'valor', val: string) => {
        const nuevasOpciones = [...opciones];
        nuevasOpciones[index][field] = val;
        // Auto-fill valor if it's empty when typing texto
        if (field === 'texto' && nuevasOpciones[index].valor === '') {
             nuevasOpciones[index].valor = val.toUpperCase().replace(/\s+/g, '_');
        }
        setOpciones(nuevasOpciones);
    };

    const eliminarOpcion = (index: number) => {
        const nuevasOpciones = opciones.filter((_, i) => i !== index);
        setOpciones(nuevasOpciones);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 border-slate-200">
                    <Settings className="w-4 h-4 mr-2 text-slate-500" />
                    Preguntas
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-slate-50">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        Configurar Preguntas de Autorreporte
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lista de Preguntas */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-700">Preguntas Actuales</h3>
                        {loading ? (
                            <div className="text-sm text-slate-500 text-center py-8">Cargando...</div>
                        ) : preguntas.length === 0 ? (
                            <div className="text-sm text-slate-500 text-center py-8">No hay preguntas configuradas</div>
                        ) : (
                            <div className="space-y-3">
                                {preguntas.map((p, index) => (
                                    <Card key={p.id} className={`border ${p.activo ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-100'} ${editingId === p.id ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}>
                                        <CardContent className="p-3">
                                            <div className="flex gap-2">
                                                <div className="flex flex-col gap-1 items-center justify-center text-slate-400">
                                                    <button onClick={() => moverOrden(index, 'UP')} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                                                    <span className="text-xs font-bold">{index + 1}</span>
                                                    <button onClick={() => moverOrden(index, 'DOWN')} disabled={index === preguntas.length - 1} className="hover:text-indigo-600 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                                                </div>
                                                <div className="flex-1 ml-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className={`font-medium text-sm ${!p.activo && 'line-through text-slate-500'}`}>
                                                                {p.texto} {p.obligatoria && <span className="text-red-500">*</span>}
                                                            </p>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                                                    {p.tipo === 'RADIO' ? 'Selección Única' : 'Casilla (Sí/No)'}
                                                                </span>
                                                                {!p.activo && (
                                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Inactiva</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-2">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600 hover:bg-indigo-50" onClick={() => handleEdit(p)}>
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Button>
                                                            {!p.has_respuestas && (
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-50" onClick={async () => {
                                                                    if (confirm('¿Eliminar esta pregunta permanentemente?')) {
                                                                        const res = await eliminarPreguntaAction(p.id);
                                                                        if (res.success) { toast.success(res.message); cargarPreguntas(); } else toast.error(res.message);
                                                                    }
                                                                }}>
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {p.tipo === 'RADIO' && p.opciones && (
                                                        <div className="mt-2 text-xs text-slate-500 pl-2 border-l-2 border-slate-200">
                                                            Opciones: {p.opciones.map((o:any) => o.texto).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Formulario */}
                    <div className="bg-white p-5 rounded-lg border shadow-sm h-fit sticky top-0">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-semibold text-slate-800">
                                {editingId ? "Editar Pregunta" : "Nueva Pregunta"}
                            </h3>
                            {editingId && (
                                <Button variant="ghost" size="sm" onClick={resetForm} className="h-8 text-slate-500">
                                    Cancelar Edición
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Texto de la Pregunta</Label>
                                <Input 
                                    value={texto} 
                                    onChange={(e) => setTexto(e.target.value)} 
                                    placeholder="Ej. ¿Portas tu carnet?"
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <Label>Tipo de Respuesta</Label>
                                    <Select value={tipo} onValueChange={setTipo}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CHECKBOX">Casilla (Confirmación)</SelectItem>
                                            <SelectItem value="RADIO">Selección Única (Opciones)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-6 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Switch 
                                            checked={obligatoria} 
                                            onCheckedChange={setObligatoria} 
                                            id="obligatoria-switch"
                                        />
                                        <Label htmlFor="obligatoria-switch" className="cursor-pointer">¿Obligatoria?</Label>
                                    </div>
                                    {editingId && (
                                        <div className="flex items-center gap-2 border-l pl-6 border-slate-200">
                                            <Switch 
                                                checked={activo} 
                                                onCheckedChange={setActivo} 
                                                id="activo-switch"
                                            />
                                            <Label htmlFor="activo-switch" className="cursor-pointer">Activa (Visible)</Label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {tipo === 'RADIO' && (
                                <div className="space-y-3 pt-2 border-t">
                                    <div className="flex justify-between items-center">
                                        <Label>Opciones de Respuesta</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={agregarOpcion} className="h-7 text-xs">
                                            <Plus className="w-3 h-3 mr-1" /> Añadir
                                        </Button>
                                    </div>
                                    
                                    {opciones.length === 0 && (
                                        <p className="text-xs text-slate-500 italic">No has agregado opciones. Añade al menos 2.</p>
                                    )}

                                    <div className="space-y-2">
                                        {opciones.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2 items-start">
                                                <div className="flex-1 space-y-1">
                                                    <Input 
                                                        value={opt.texto} 
                                                        onChange={(e) => actualizarOpcion(idx, 'texto', e.target.value)}
                                                        placeholder="Texto a mostrar (ej. Sí)"
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <Input 
                                                        value={opt.valor} 
                                                        onChange={(e) => actualizarOpcion(idx, 'valor', e.target.value)}
                                                        placeholder="Valor interno (ej. SI)"
                                                        className="h-8 text-sm uppercase"
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => eliminarOpcion(idx)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleGuardar} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                    {editingId ? "Guardar Cambios" : "Crear Pregunta"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
