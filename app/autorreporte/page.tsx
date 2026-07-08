'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CameraCapture } from '@/components/autorreporte/CameraCapture';
import { loginAutorreporte, registrarAutorreporteAction, getPreguntasAutorreporteAction, verificarDisponibilidadReporteAction, getDailyStatusAction } from '@/actions/autorreporte-actions';
import { TipoAutorreporte } from '@/types/autorreporte';
import { LogIn, LogOut, Coffee, Camera, RefreshCw, ChevronRight, ShieldCheck, UserCircle2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function AutorreportePage() {
    const [cedula, setCedula] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado de sesión
    const [user, setUser] = useState<{ id: number; first_name: string; last_name: string } | null>(null);
    const [dailyStatus, setDailyStatus] = useState<{ hasInicio: boolean; hasDescanso: boolean; hasFin: boolean } | null>(null);
    
    // Estado de flujo
    const [activeAction, setActiveAction] = useState<TipoAutorreporte | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [step, setStep] = useState<'ACTIONS' | 'FORM' | 'CAMERA' | 'LOCATION_DENIED'>('ACTIONS');
    const [pendingPhoto, setPendingPhoto] = useState<string | undefined>();
    const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
    
    // Estado de preguntas
    const [preguntas, setPreguntas] = useState<any[]>([]);
    const [respuestas, setRespuestas] = useState<Record<number, string>>({});

    // Cargar sesión persistente al montar
    useEffect(() => {
        const storedUser = localStorage.getItem('app_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // Si hay usuario guardado, cargar también sus preguntas de una vez
                getPreguntasAutorreporteAction().then(res => {
                    if (res.success && res.data) {
                        setPreguntas(res.data);
                    }
                });
                // Cargar también el estado del día
                getDailyStatusAction(parsedUser.id).then(res => {
                    if (res.success) setDailyStatus(res);
                });
            } catch (e) {
                localStorage.removeItem('app_user');
            }
        }
    }, []);

    // Solicitar permiso de ubicación preventivamente al cargar la página
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => { /* Permiso concedido o ya lo tenía */ },
                () => { /* Permiso denegado, lo manejaremos en el handleReport */ },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
            );
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await loginAutorreporte(cedula, password);
            if (result.success && result.user) {
                setUser(result.user);
                setSuccessMessage(null);
                
                // Guardar en local para evitar pérdida por recarga
                localStorage.setItem('app_user', JSON.stringify(result.user));

                const resPreguntas = await getPreguntasAutorreporteAction();
                if (resPreguntas.success && resPreguntas.data) {
                    setPreguntas(resPreguntas.data);
                }
                
                const statusRes = await getDailyStatusAction(result.user.id);
                if (statusRes.success) {
                    setDailyStatus(statusRes);
                }
            } else {
                toast.error("Acceso denegado", { description: result.message });
            }
        } catch (error) {
            toast.error("Error", { description: "Ocurrió un error inesperado. Intenta de nuevo." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReport = async (tipo: TipoAutorreporte, fotoBase64?: string) => {
        if (!user) return;
        setIsLoading(true);

        try {
            let lat = locationCoords?.lat || null;
            let lng = locationCoords?.lng || null;
            
            if (!lat || !lng) {
                if ('geolocation' in navigator) {
                    try {
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { 
                                enableHighAccuracy: true, 
                                timeout: 10000, 
                                maximumAge: 0 
                            });
                        });
                        lat = position.coords.latitude;
                        lng = position.coords.longitude;
                        setLocationCoords({ lat, lng });
                    } catch (geoError: any) {
                        setPendingPhoto(fotoBase64);
                        setStep('LOCATION_DENIED');
                        setIsLoading(false);
                        return;
                    }
                } else {
                    setPendingPhoto(fotoBase64);
                    setStep('LOCATION_DENIED');
                    setIsLoading(false);
                    return;
                }
            }

            const respuestasArray = Object.entries(respuestas).map(([preguntaId, valor]) => ({
                preguntaId: parseInt(preguntaId),
                valor
            }));

            const result = await registrarAutorreporteAction(user.id, tipo, fotoBase64, respuestasArray, lat, lng);
            if (result.success) {
                setSuccessMessage(`¡Registro de ${tipo.toLowerCase()} exitoso!`);
                setActiveAction(null);
                setPendingPhoto(undefined);
                setTimeout(() => handleLogout(), 4000);
            } else {
                toast.error("Error", { description: result.message });
            }
        } catch (error) {
            toast.error("Error", { description: "Hubo un problema de conexión al registrar." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setCedula('');
        setPassword('');
        setActiveAction(null);
        setSuccessMessage(null);
        setRespuestas({});
        setStep('ACTIONS');
        setPendingPhoto(undefined);
        setDailyStatus(null);
        localStorage.removeItem('app_user');
    };

    const iniciarAccion = async (tipo: TipoAutorreporte) => {
        if (!user) return;
        setIsLoading(true);
        setActiveAction(tipo);

        // Validar Permiso GPS ANTES de empezar el flujo (formularios/cámara)
        let lat: number | null = null;
        let lng: number | null = null;
        
        if ('geolocation' in navigator) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { 
                        enableHighAccuracy: true, 
                        timeout: 10000, 
                        maximumAge: 0 
                    });
                });
                lat = position.coords.latitude;
                lng = position.coords.longitude;
            } catch (geoError: any) {
                setStep('LOCATION_DENIED');
                setIsLoading(false);
                return;
            }
        } else {
            setStep('LOCATION_DENIED');
            setIsLoading(false);
            return;
        }

        setLocationCoords({ lat, lng });

        const check = await verificarDisponibilidadReporteAction(user.id, tipo);
        setIsLoading(false);
        
        if (!check.disponible) {
            toast.error("Validación", { description: check.message });
            setActiveAction(null);
            return;
        }

        if (tipo === 'INICIO') {
            setStep('FORM');
        } else if (tipo === 'FIN') {
            setStep('CAMERA');
        } else {
            handleReport(tipo);
        }
    };

    const isFormValid = () => {
        return preguntas.every(p => {
            if (!p.obligatoria) return true;
            if (p.tipo === 'CHECKBOX') return respuestas[p.id] === 'true';
            return !!respuestas[p.id];
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid()) {
            setStep('CAMERA');
        } else {
            toast.error("Completa todos los campos obligatorios para continuar.");
        }
    };

    if (activeAction && step === 'LOCATION_DENIED') {
        return (
            <div className="min-h-screen bg-[#f0f4f9] flex flex-col items-center p-4 sm:p-8 font-sans">
                <div className="w-full max-w-md bg-white rounded-[24px] shadow-sm border border-[#dadce0] p-8 text-center flex flex-col items-center mt-10">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <MapPin className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-normal text-[#202124] mb-3">Se requiere tu ubicación</h2>
                    <p className="text-[#5f6368] mb-6 text-sm leading-relaxed">
                        Para completar el autorreporte de <b>{activeAction.toLowerCase()}</b>, es necesario que nos compartas tu ubicación geográfica actual.
                        <br/><br/>
                        Si el navegador no te preguntó o bloqueaste el permiso por error, haz clic en el <b>ícono del candado (🔒)</b> o de información (ⓘ) en la barra de direcciones superior, selecciona <b>"Permitir"</b> en la opción de Ubicación y vuelve a intentarlo.
                    </p>
                    <div className="flex gap-3 w-full">
                        <Button variant="outline" className="flex-1 border-[#dadce0] text-[#5f6368] hover:bg-gray-50" onClick={() => {
                            setStep('ACTIONS');
                            setActiveAction(null);
                            setPendingPhoto(undefined);
                        }}>Cancelar</Button>
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => {
                            if (pendingPhoto) {
                                handleReport(activeAction, pendingPhoto);
                            } else {
                                iniciarAccion(activeAction);
                            }
                        }} disabled={isLoading}>
                            {isLoading ? "Verificando..." : "Intentar de nuevo"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // VISTA DE PREGUNTAS (ESTILO GOOGLE FORMS)
    if (activeAction === 'INICIO' && step === 'FORM') {
        return (
            <div className="min-h-screen bg-[#f0f4f9] flex flex-col items-center p-4 sm:p-8 font-sans">
                <div className="w-full max-w-2xl mb-6">
                    <div className="bg-white rounded-[24px] shadow-sm border border-[#dadce0] overflow-hidden">
                        <div className="h-3 bg-blue-600 w-full"></div>
                        <div className="p-8 pb-6">
                            <h1 className="text-3xl font-normal text-[#202124] mb-2 tracking-tight">Validación de {activeAction.toLowerCase()}</h1>
                            <p className="text-[#5f6368] text-sm">Responde estas preguntas de rutina para continuar con tu registro fotográfico.</p>
                            <div className="mt-4 pt-4 border-t border-[#dadce0] flex items-center gap-2 text-sm font-medium text-[#3c4043]">
                                <UserCircle2 className="w-5 h-5 text-gray-400" />
                                {user?.first_name} {user?.last_name}
                            </div>
                        </div>
                    </div>
                </div>

                <form id="preguntas-form" onSubmit={handleFormSubmit} className="w-full max-w-2xl space-y-4">
                    {preguntas.map(pregunta => (
                        <div key={pregunta.id} className="bg-white rounded-[16px] p-6 shadow-sm border border-[#dadce0] transition-shadow hover:shadow-md">
                            {pregunta.tipo === 'CHECKBOX' ? (
                                <div className="flex items-start gap-4">
                                    <Checkbox 
                                        id={`p-${pregunta.id}`}
                                        checked={respuestas[pregunta.id] === 'true'}
                                        onCheckedChange={(checked) => setRespuestas(prev => ({ ...prev, [pregunta.id]: checked ? 'true' : 'false' }))}
                                        className="mt-1 h-5 w-5 border-2 rounded text-blue-600 border-[#5f6368] data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                                    />
                                    <div className="grid gap-1">
                                        <label htmlFor={`p-${pregunta.id}`} className="text-base text-[#202124] cursor-pointer">
                                            {pregunta.texto} {pregunta.obligatoria && <span className="text-[#d93025] ml-1">*</span>}
                                        </label>
                                        <p className="text-sm text-[#5f6368]">Al marcar esta casilla aceptas las políticas de la empresa.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-base text-[#202124] mb-4">
                                        {pregunta.texto} {pregunta.obligatoria && <span className="text-[#d93025] ml-1">*</span>}
                                    </div>
                                    {pregunta.tipo === 'RADIO' && (
                                        <RadioGroup 
                                            className="flex flex-col space-y-3"
                                            value={respuestas[pregunta.id] || ''}
                                            onValueChange={(val) => setRespuestas(prev => ({ ...prev, [pregunta.id]: val }))}
                                        >
                                            {pregunta.opciones?.map((opcion: any) => (
                                                <div key={opcion.valor} className="flex items-center space-x-3 rounded-md">
                                                    <RadioGroupItem value={opcion.valor} id={`o-${pregunta.id}-${opcion.valor}`} className="h-5 w-5 border-[#5f6368] text-blue-600" />
                                                    <Label htmlFor={`o-${pregunta.id}-${opcion.valor}`} className="text-[#202124] cursor-pointer text-base font-normal">
                                                        {opcion.texto}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                    
                    <div className="flex justify-between items-center pt-4 pb-12">
                        <Button type="button" variant="ghost" onClick={() => { setActiveAction(null); setStep('ACTIONS'); }} className="text-[#1a73e8] hover:bg-blue-50 hover:text-blue-700 rounded-full px-6 h-10 font-medium">
                            Atrás
                        </Button>
                        <Button type="submit" disabled={!isFormValid()} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full px-8 h-10 font-medium shadow-none hover:shadow-md transition-all">
                            Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    // VISTA DE CÁMARA
    if ((activeAction === 'INICIO' || activeAction === 'FIN') && step === 'CAMERA') {
        return (
            <div className="min-h-[100dvh] bg-black flex flex-col font-sans">
                <div className="w-full h-full flex flex-col flex-grow relative">
                    <div className="absolute top-0 left-0 w-full p-4 z-10 bg-gradient-to-b from-black/80 to-transparent">
                        <p className="text-white/80 text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                    </div>
                    
                    <div className="flex-grow flex relative bg-black w-full h-full">
                        <div className="absolute inset-0">
                            <CameraCapture 
                                title=""
                                onCancel={() => setStep('FORM')}
                                onCapture={(base64) => handleReport(activeAction, base64)}
                            />
                        </div>
                    </div>
                    
                    {isLoading && (
                        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                            <p className="font-medium tracking-wide">Procesando reporte...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // VISTA PRINCIPAL (LOGIN O ACCIONES)
    return (
        <div className="min-h-[100dvh] bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
            <div className="w-full max-w-md mx-auto p-6 pt-12 flex flex-col flex-1 relative">
                
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100">
                        <ShieldCheck className="w-7 h-7 text-[#1a73e8]" />
                    </div>
                    <h1 className="text-2xl font-normal text-[#202124] tracking-tight mb-2">Seguimiento de Trabajadores OS</h1>
                    <p className="text-[#5f6368] text-[15px] font-normal px-4">
                        {!user ? "Ingresa tus datos para continuar" : "Selecciona la acción a registrar"}
                    </p>
                </div>
                
                {!user ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-5">
                            {/* Input Material Style - Simplificado */}
                            <div className="space-y-1.5">
                                <Label htmlFor="cedula" className="text-[#202124] text-[14px] font-medium ml-1">Cédula de ciudadanía</Label>
                                <Input 
                                    id="cedula" 
                                    type="text" 
                                    value={cedula}
                                    onChange={(e) => setCedula(e.target.value)}
                                    required
                                    className="block px-4 py-3 h-12 w-full text-base text-gray-900 bg-[#f8f9fa] rounded-xl border border-[#dadce0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-all"
                                    placeholder="Ej: 1020304050"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-[#202124] text-[14px] font-medium ml-1">Contraseña</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block px-4 py-3 h-12 w-full text-base text-gray-900 bg-[#f8f9fa] rounded-xl border border-[#dadce0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] transition-all"
                                    placeholder="Ingresa tu contraseña"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button type="submit" disabled={isLoading} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full px-8 h-12 font-medium text-[15px] shadow-none hover:shadow-md transition-all active:scale-[0.98]">
                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Siguiente"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-0 animate-in fade-in zoom-in-95 duration-300">
                        
                        <div className="flex items-center gap-3 p-4 bg-[#f8f9fa] rounded-2xl mb-8 border border-[#dadce0]/50">
                            <div className="w-10 h-10 rounded-full bg-white border border-[#dadce0] flex items-center justify-center">
                                <span className="text-[#1a73e8] font-bold text-lg">{user.first_name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm text-[#5f6368] font-medium leading-none mb-1">Sesión iniciada</p>
                                <p className="text-base text-[#202124] font-medium truncate">{user.first_name} {user.last_name}</p>
                            </div>
                            {!successMessage && (
                                <Button variant="ghost" onClick={handleLogout} className="text-[#d93025] hover:bg-[#fce8e6] hover:text-[#c5221f] rounded-full px-4 text-sm font-medium">
                                    Salir
                                </Button>
                            )}
                        </div>

                        {successMessage ? (
                            <div className="bg-[#e6f4ea] text-[#137333] p-8 rounded-3xl text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-[#ceead6] rounded-full flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-8 h-8 text-[#188038]" />
                                </div>
                                <h3 className="text-xl font-normal tracking-tight mb-2">{successMessage}</h3>
                                <p className="text-[#137333]/80 text-sm mb-6">Redirigiendo al inicio...</p>
                                <Button variant="outline" className="rounded-full border-[#188038]/30 text-[#137333] hover:bg-[#ceead6]" onClick={handleLogout}>
                                    Volver ahora
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {dailyStatus?.hasFin || dailyStatus?.hasDescanso ? (
                                    <div className="bg-[#f8f9fa] text-center p-6 rounded-2xl border border-[#dadce0]/50 text-[#5f6368]">
                                        <p className="font-medium text-lg text-[#202124]">
                                            {dailyStatus.hasDescanso ? "Día de Descanso" : "Jornada Finalizada"}
                                        </p>
                                        <p className="text-sm mt-1">Ya no tienes más acciones disponibles por hoy.</p>
                                    </div>
                                ) : (
                                    <>
                                        {!dailyStatus?.hasInicio && (
                                            <button 
                                                onClick={() => iniciarAccion('INICIO')}
                                                className="group flex items-center justify-between p-4 bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-2xl transition-all active:bg-gray-50 text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                                                        <Camera className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[#202124] font-medium text-[17px]">Inicio de Labores</h3>
                                                        <p className="text-[#5f6368] text-sm mt-0.5">Reportar entrada con foto</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-[#5f6368] group-hover:text-[#1a73e8]" />
                                            </button>
                                        )}
                                        
                                        {!dailyStatus?.hasInicio && (
                                            <button 
                                                onClick={() => iniciarAccion('DESCANSO')}
                                                disabled={isLoading}
                                                className="group flex items-center justify-between p-4 bg-white border border-[#dadce0] hover:border-[#f28b82] rounded-2xl transition-all active:bg-gray-50 text-left disabled:opacity-50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#fce8e6] text-[#d93025] flex items-center justify-center">
                                                        <Coffee className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[#202124] font-medium text-[17px]">Descanso</h3>
                                                        <p className="text-[#5f6368] text-sm mt-0.5">Día libre o en casa</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-[#5f6368] group-hover:text-[#d93025]" />
                                            </button>
                                        )}

                                        {dailyStatus?.hasInicio && !dailyStatus?.hasFin && (
                                            <button 
                                                onClick={() => iniciarAccion('FIN')}
                                                className="group flex items-center justify-between p-4 bg-white border border-[#dadce0] hover:border-[#5f6368] rounded-2xl transition-all active:bg-gray-50 text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#f1f3f4] text-[#5f6368] flex items-center justify-center">
                                                        <LogOut className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[#202124] font-medium text-[17px]">Fin de Labores</h3>
                                                        <p className="text-[#5f6368] text-sm mt-0.5">Reportar salida con foto</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-[#5f6368]" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
