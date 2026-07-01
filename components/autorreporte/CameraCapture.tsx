'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CameraCaptureProps {
    onCapture: (base64Image: string) => void;
    onCancel: () => void;
    title?: string;
}

export function CameraCapture({ onCapture, onCancel, title = "Tomar Fotografía" }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user',
                    aspectRatio: { ideal: 0.5625 } // 9:16 (vertical)
                }, 
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err: any) {
            console.error("Error accessing camera:", err);
            setError("No se pudo acceder a la cámara. Verifica los permisos de tu navegador.");
        }
    }, []);

    const stopCamera = useCallback(() => {
        setStream(currentStream => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
            return null;
        });
    }, []);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Definir relación de aspecto vertical para celulares (ej. 3:4 o 9:16)
        const targetAspectRatio = 3 / 4; 
        
        let cropX = 0;
        let cropY = 0;
        let cropWidth = video.videoWidth;
        let cropHeight = video.videoHeight;

        const videoAspectRatio = video.videoWidth / video.videoHeight;

        if (videoAspectRatio > targetAspectRatio) {
            cropWidth = video.videoHeight * targetAspectRatio;
            cropX = (video.videoWidth - cropWidth) / 2;
        } else {
            cropHeight = video.videoWidth / targetAspectRatio;
            cropY = (video.videoHeight - cropHeight) / 2;
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Dibujar el frame recortado
        // Invertir el contexto horizontalmente para que la FOTO también quede como espejo si el usuario lo desea.
        // Pero para el autorreporte es mejor que el texto sea legible, así que no invertiremos el canvas, 
        // solo recortaremos para que sea vertical.
        context.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

        // Añadir marca de agua
        const textDate = format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: es });
        
        // Estilos para marca de agua
        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.fillRect(0, canvas.height - 40, canvas.width, 40);

        context.font = "bold 18px Arial";
        context.fillStyle = "white";
        context.textAlign = "left";
        context.fillText(textDate, 20, canvas.height - 15);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };

    const confirmPhoto = () => {
        if (capturedImage) {
            onCapture(capturedImage);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col h-full bg-black">
            <div className="flex-1 space-y-0 flex flex-col">
                {error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
                        {error}
                        <Button 
                            variant="outline" 
                            className="mt-2 w-full"
                            onClick={startCamera}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                        </Button>
                    </div>
                ) : (
                    <div className="relative w-full h-full flex-1 flex items-center justify-center bg-black overflow-hidden">
                        {capturedImage ? (
                            <img src={capturedImage} alt="Captura" className="w-full h-full object-cover" />
                        ) : (
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                        )}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}

                <div className="flex gap-2 p-4 bg-black/90 pb-8">
                    {!capturedImage ? (
                        <>
                            <Button variant="outline" className="flex-1" onClick={() => {
                                stopCamera();
                                onCancel();
                            }}>
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                            </Button>
                            <Button className="flex-1" onClick={capturePhoto} disabled={!stream}>
                                <Camera className="w-4 h-4 mr-2" />
                                Capturar
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" className="flex-1" onClick={retakePhoto}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retomar
                            </Button>
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={confirmPhoto}>
                                <Check className="w-4 h-4 mr-2" />
                                Usar Foto
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
