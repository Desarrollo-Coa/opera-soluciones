'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X, FileText, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import ColaboradorSelector from '@/components/ausencias/ColaboradorSelector';

// Define interfaces to match SelectCascada expectations
interface Option {
  value: string | number;
  label: string;
}

interface Colaborador {
  id: number;
  first_name: string;
  last_name: string;
  position?: string;
  department?: string;
}

export default function RegistroAusenciaPage() {
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [tiposAusencia, setTiposAusencia] = useState<Array<{ id: number; nombre: string }>>([]);

  const [formData, setFormData] = useState({
    tipoAusencia: '',
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    archivos: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Cargar tipos de ausencia al montar el componente
  useEffect(() => {
    const cargarTiposAusencia = async () => {
      try {
        const res = await fetch('/api/ausencias/tipos');
        const data = await res.json();
        setTiposAusencia(data);
      } catch (error) {
        console.error('Error cargando tipos de ausencia:', error);
      }
    };
    
    cargarTiposAusencia();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        archivos: [...prev.archivos, ...newFiles],
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFormData((prev) => ({
        ...prev,
        archivos: [...prev.archivos, ...newFiles],
      }));
    }
  };

  const handleFileInputClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!colaborador) {
      toast.error('Debe seleccionar un colaborador');
      return;
    }

    if (!formData.tipoAusencia || !formData.fechaInicio || !formData.fechaFin) {
      toast.error('Todos los campos obligatorios deben ser completados');
      return;
    }

    if (new Date(formData.fechaInicio) > new Date(formData.fechaFin)) {
      toast.error('La fecha de inicio debe ser menor o igual a la fecha final');
      return;
    }

    setLoading(true);

    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (!userRes.ok || !userData?.id) {
        throw new Error('No se pudo obtener el usuario autenticado');
      }

      const submitData = new FormData();
      submitData.append('id_colaborador', colaborador.id.toString());
      submitData.append('id_tipo_ausencia', formData.tipoAusencia);
      submitData.append('fecha_inicio', formData.fechaInicio);
      submitData.append('fecha_fin', formData.fechaFin);
      submitData.append('descripcion', formData.descripcion);
      submitData.append('id_usuario_registro', userData.id.toString());

      formData.archivos.forEach((archivo) => {
        submitData.append('archivos', archivo);
      });

      const res = await fetch('/api/ausencias', {
        method: 'POST',
        body: submitData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al registrar la ausencia');
      }

      toast.success('Ausencia registrada correctamente');

      // Reset form
      setFormData({
        tipoAusencia: '',
        fechaInicio: '',
        fechaFin: '',
        descripcion: '',
        archivos: [],
      });
      setColaborador(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar la ausencia');
    } finally {
      setLoading(false);
    }
  };

  const calcularDias = () => {
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/ausencias">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registrar Ausencia</h1>
            <p className="text-slate-600">Complete el formulario para registrar una nueva ausencia</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Selección de Colaborador
                </CardTitle>
                <CardDescription>Seleccione el colaborador y su puesto de trabajo</CardDescription>
              </CardHeader>
              <CardContent>
                <ColaboradorSelector value={colaborador} onChange={setColaborador} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Detalles de la Ausencia
                </CardTitle>
                <CardDescription>Especifique el tipo, fechas y description de la ausencia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Ausencia *</Label>
                    <Select
                      value={formData.tipoAusencia}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, tipoAusencia: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposAusencia?.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nombre}
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaFin">Fecha de Fin *</Label>
                    <Input
                      id="fechaFin"
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fechaFin: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {formData.fechaInicio && formData.fechaFin && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Duración:</strong> {calcularDias()} día(s)
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describa los detalles de la ausencia..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Archivos de Soporte
                </CardTitle>
                <CardDescription>Adjunte documentos que respalden la ausencia (opcional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleFileInputClick}
                  >
                    Seleccionar Archivos
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">PDF, JPG, PNG (máx. 10MB cada uno)</p>
                </div>

                {formData.archivos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Archivos seleccionados:</Label>
                    {formData.archivos.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link href="/ausencias">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || !colaborador}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Registrando...' : 'Registrar Ausencia'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}