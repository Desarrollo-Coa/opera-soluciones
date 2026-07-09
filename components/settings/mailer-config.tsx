'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Mail, Clock, Plus, Trash2, Send } from 'lucide-react';
import { getMailerConfigAction, saveMailerConfigAction } from '@/actions/mailer-config-actions';

export function MailerConfig() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [activo, setActivo] = useState(false);
    const [horaEnvio, setHoraEnvio] = useState('10:00');
    const [horaEnvioSalida, setHoraEnvioSalida] = useState('18:00');
    const [emails, setEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');

    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('465');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');
    const [smtpFrom, setSmtpFrom] = useState('');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setIsLoading(true);
        const res = await getMailerConfigAction();
        if (res.success && res.data) {
            setActivo(res.data.activo);
            setHoraEnvio(res.data.hora_envio);
            setHoraEnvioSalida(res.data.hora_envio_salida);
            setEmails(res.data.emails || []);
            setSmtpHost(res.data.smtp_host || '');
            setSmtpPort(String(res.data.smtp_port || 465));
            setSmtpUser(res.data.smtp_user || '');
            setSmtpPass(res.data.smtp_pass || '');
            setSmtpFrom(res.data.smtp_from || '');
        } else if (!res.success) {
            toast.error(res.message || 'Error al cargar configuración');
        }
        setIsLoading(false);
    };

    const handleAddEmail = () => {
        if (!newEmail) return;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast.error("Formato de correo inválido");
            return;
        }

        if (emails.includes(newEmail)) {
            toast.error("El correo ya está en la lista");
            return;
        }

        setEmails([...emails, newEmail]);
        setNewEmail('');
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmails(emails.filter(e => e !== emailToRemove));
    };

    const handleSave = async () => {
        if (emails.length === 0 && activo) {
            toast.error("Debe agregar al menos un correo para activar el envío");
            return;
        }

        if (!horaEnvio || !horaEnvioSalida) {
            toast.error("Debe especificar las horas de envío de entrada y salida");
            return;
        }

        setIsSaving(true);
        const res = await saveMailerConfigAction({ 
            hora_envio: horaEnvio, 
            hora_envio_salida: horaEnvioSalida,
            emails, 
            activo,
            smtp_host: smtpHost,
            smtp_port: parseInt(smtpPort) || 465,
            smtp_user: smtpUser,
            smtp_pass: smtpPass,
            smtp_from: smtpFrom
        });
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Cargando configuración...</div>;
    }

    return (
        <Card className="w-full max-w-5xl shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                            <Mail className="w-5 h-5 text-indigo-600" />
                            Reporte Automático por Correo
                        </CardTitle>
                        <CardDescription className="mt-1.5 text-slate-500">
                            Envía reportes diarios consolidados con los autorreportes pendientes de los trabajadores.
                        </CardDescription>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-white px-3 py-2 rounded-lg border shadow-sm">
                        <Switch 
                            checked={activo} 
                            onCheckedChange={setActivo}
                            id="mailer-activo"
                        />
                        <Label htmlFor="mailer-activo" className="text-xs font-semibold cursor-pointer">
                            {activo ? <span className="text-green-600">ACTIVADO</span> : <span className="text-slate-400">DESACTIVADO</span>}
                        </Label>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Columna 1: Reporte */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="flex items-center gap-2 text-slate-700 mb-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    Hora de Envío (Pendientes de Entrada)
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        type="time" 
                                        value={horaEnvio}
                                        onChange={(e) => setHoraEnvio(e.target.value)}
                                        className="w-32"
                                        disabled={!activo}
                                    />
                                    <span className="text-xs text-slate-500">
                                        Revisa quiénes no han marcado INICIO.
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="flex items-center gap-2 text-slate-700 mb-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    Hora de Envío (Pendientes de Salida)
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Input 
                                        type="time" 
                                        value={horaEnvioSalida}
                                        onChange={(e) => setHoraEnvioSalida(e.target.value)}
                                        className="w-32"
                                        disabled={!activo}
                                    />
                                    <span className="text-xs text-slate-500">
                                        Revisa quiénes marcaron INICIO pero olvidaron el FIN.
                                    </span>
                                </div>
                            </div>
                        </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <Label className="flex items-center gap-2 text-slate-700">
                        <Send className="w-4 h-4 text-slate-400" />
                        Correos Destinatarios
                    </Label>
                    <div className="flex gap-2">
                        <Input 
                            type="email" 
                            placeholder="ejemplo@empresa.com" 
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                            disabled={!activo}
                            className="max-w-sm"
                        />
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={handleAddEmail}
                            disabled={!activo || !newEmail}
                        >
                            <Plus className="w-4 h-4 mr-1" /> Agregar
                        </Button>
                    </div>

                    <div className="mt-4 border rounded-md min-h-[100px] bg-slate-50 p-2 flex flex-col gap-2">
                        {emails.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm text-slate-400 italic">
                                No hay correos configurados.
                            </div>
                        ) : (
                            emails.map((email) => (
                                <div key={email} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-md shadow-sm">
                                    <span className="text-sm text-slate-700">{email}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRemoveEmail(email)}
                                        disabled={!activo}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                        </div>
                    </div>

                    {/* Columna 2: Configuración SMTP */}
                    <div className="space-y-4 lg:border-l lg:border-slate-100 lg:pl-10">
                    <Label className="flex items-center gap-2 text-slate-700 text-base">
                        <Mail className="w-4 h-4 text-slate-400" />
                        Configuración de Correo (SMTP)
                    </Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Servidor SMTP (Host)</Label>
                            <Input 
                                placeholder="ej. smtp.gmail.com" 
                                value={smtpHost}
                                onChange={(e) => setSmtpHost(e.target.value)}
                                disabled={!activo}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Puerto SMTP</Label>
                            <Input 
                                type="number"
                                placeholder="ej. 465 o 587" 
                                value={smtpPort}
                                onChange={(e) => setSmtpPort(e.target.value)}
                                disabled={!activo}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Usuario / Correo Remitente</Label>
                            <Input 
                                type="email"
                                placeholder="ej. mi_correo@gmail.com" 
                                value={smtpUser}
                                onChange={(e) => setSmtpUser(e.target.value)}
                                disabled={!activo}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Contraseña (App Password)</Label>
                            <Input 
                                type="password"
                                placeholder="Contraseña de aplicación" 
                                value={smtpPass}
                                onChange={(e) => setSmtpPass(e.target.value)}
                                disabled={!activo}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Nombre del Remitente (Opcional)</Label>
                            <Input 
                                placeholder='ej. "SGI Opera Soluciones <mi_correo@gmail.com>"' 
                                value={smtpFrom}
                                onChange={(e) => setSmtpFrom(e.target.value)}
                                disabled={!activo}
                            />
                        </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 flex justify-end border-t border-slate-100">
                    <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                        {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
