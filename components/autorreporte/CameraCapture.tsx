'use client';

import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CameraCaptureProps {
    onCapture: (base64Image: string) => void;
    onCancel: () => void;
    title?: string;
}

export function CameraCapture({ onCapture, onCancel, title = "Tomar Fotografía" }: CameraCaptureProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (!canvasRef.current) return;
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (!context) return;

                // Mantener las dimensiones originales de la foto
                canvas.width = img.width;
                canvas.height = img.height;

                // Dibujar la foto
                context.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Añadir marca de agua con tamaño proporcional a la foto (para que se lea bien en alta resolución)
                const textDate = format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: es });
                
                const bannerHeight = Math.max(40, canvas.height * 0.08); // 8% del alto de la imagen
                const fontSize = Math.max(18, canvas.height * 0.04); // 4% del alto

                context.fillStyle = "rgba(0, 0, 0, 0.5)";
                context.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

                context.font = `bold ${fontSize}px Arial`;
                context.fillStyle = "white";
                context.textAlign = "left";
                context.textBaseline = "middle";
                context.fillText(textDate, 20, canvas.height - (bannerHeight / 2));

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setCapturedImage(dataUrl);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const triggerNativeCamera = () => {
        fileInputRef.current?.click();
    };

    const confirmPhoto = () => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        triggerNativeCamera();
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col h-full bg-black">
            <div className="flex-1 space-y-0 flex flex-col">
                <div className="relative w-full h-full flex-1 flex items-center justify-center bg-black overflow-hidden">
                    {capturedImage ? (
                        <img src={capturedImage} alt="Captura" className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-white/50 p-6 text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                                <Camera className="w-10 h-10" />
                            </div>
                            <p className="text-lg">Presiona tomar foto para continuar</p>
                        </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Input invisible que abre la cámara nativa */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="user" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange} 
                    />
                </div>

                <div className="flex gap-2 p-4 bg-black/90 pb-8">
                    {!capturedImage ? (
                        <>
                            <Button variant="outline" className="flex-1 bg-transparent text-white border-white/20 hover:bg-white/10" onClick={onCancel}>
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={triggerNativeCamera}>
                                <Camera className="w-4 h-4 mr-2" />
                                Tomar Foto
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" className="flex-1 bg-transparent text-white border-white/20 hover:bg-white/10" onClick={retakePhoto}>
                                Volver a tomar
                            </Button>
                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={confirmPhoto}>
                                Confirmar Foto
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
