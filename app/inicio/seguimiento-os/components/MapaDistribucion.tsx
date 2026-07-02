'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoContains, geoCentroid } from 'd3-geo';
import * as topojson from 'topojson-client';
import { EmpleadoAutorreporte } from '@/types/autorreporte';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Users } from 'lucide-react';

function UbicacionCelda({ lat, lng }: { lat?: number, lng?: number }) {
    const [ubicacion, setUbicacion] = useState<string>('Buscando...');

    useEffect(() => {
        if (!lat || !lng) {
            setUbicacion('Sin coordenadas');
            return;
        }
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`)
            .then(r => r.json())
            .then(d => {
                setUbicacion(d.city || d.locality || d.principalSubdivision || 'Desconocida');
            })
            .catch(() => setUbicacion('Error al cargar'));
    }, [lat, lng]);

    return <span className="text-sm font-medium text-gray-700">{ubicacion}</span>;
}

const GEO_URL = 'https://code.highcharts.com/mapdata/countries/co/co-all.topo.json';

interface MapaDistribucionProps {
    empleados: EmpleadoAutorreporte[];
}

export default function MapaDistribucion({ empleados }: MapaDistribucionProps) {
    const [geographies, setGeographies] = useState<any[]>([]);
    const [tooltipData, setTooltipData] = useState<{ text: string, x: number, y: number } | null>(null);
    const [selectedDepto, setSelectedDepto] = useState<{ nombre: string; empleados: EmpleadoAutorreporte[] } | null>(null);

    // Cargar y parsear el TopoJSON una sola vez
    useEffect(() => {
        fetch(GEO_URL)
            .then(res => res.json())
            .then(data => {
                // @ts-ignore - topojson typings are tricky
                const parsed = topojson.feature(data, data.objects.default).features;
                setGeographies(parsed);
            })
            .catch(err => console.error("Error cargando mapa:", err));
    }, []);

    // Agrupar empleados por departamento
    const groupedEmployees = useMemo(() => {
        const result: Record<string, EmpleadoAutorreporte[]> = {};
        
        // Inicializar
        geographies.forEach(geo => {
            const depto = geo.properties.name || geo.properties['hc-key'];
            result[depto] = [];
        });

        // Agrupar cada empleado
        empleados.forEach(emp => {
            const lat = emp.reportes.inicio?.lat || emp.reportes.fin?.lat || emp.reportes.descanso?.lat;
            const lng = emp.reportes.inicio?.lng || emp.reportes.fin?.lng || emp.reportes.descanso?.lng;

            if (lat && lng) {
                const pt: [number, number] = [lng, lat];
                for (const geo of geographies) {
                    if (geoContains(geo, pt)) {
                        const depto = geo.properties.name || geo.properties['hc-key'];
                        if (!result[depto]) result[depto] = [];
                        result[depto].push(emp);
                        break;
                    }
                }
            }
        });

        return result;
    }, [empleados, geographies]);

    // Obtener los conteos máximos para la escala de colores
    const maxCount = Math.max(...Object.values(groupedEmployees).map(arr => arr.length), 1);
    
    const colorScale = scaleLinear<string>()
        .domain([0, maxCount])
        .range(["#f8fafc", "#1e3a8a"]); // De gris muy claro a azul muy oscuro (Navy)

    if (geographies.length === 0) {
        return (
            <Card className="w-full h-[600px] flex items-center justify-center border-none shadow-sm mt-8">
                <div className="flex flex-col items-center text-muted-foreground animate-pulse">
                    <MapPin className="w-8 h-8 mb-2 opacity-50" />
                    <p>Cargando cartografía satelital...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-4">
                <CardTitle className="text-base font-bold flex items-center text-slate-800">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    Distribución de Personal a Nivel Nacional
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="w-full h-[600px] bg-[#f8fafc] relative">
                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{
                                scale: 2800, // Escala aumentada para ocupar bien el contenedor
                                center: [-74, 4.5] // Centro aproximado de Colombia
                            }}
                            className="w-full h-full"
                        >
                            <ZoomableGroup zoom={1} minZoom={1} maxZoom={8} center={[-74, 4.5]}>
                                <Geographies geography={geographies}>
                                    {({ geographies }) =>
                                        geographies.map(geo => {
                                            const deptoName = geo.properties.name || "Desconocido";
                                            const deptoEmpleados = groupedEmployees[deptoName] || [];
                                            const count = deptoEmpleados.length;
                                            
                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={count > 0 ? colorScale(count) : "#e2e8f0"}
                                                    stroke="#334155" // Bordes oscuros para que se noten bien
                                                    strokeWidth={0.5}
                                                    onMouseEnter={(e) => {
                                                        setTooltipData({ text: deptoName, x: e.clientX, y: e.clientY });
                                                    }}
                                                    onMouseMove={(e) => {
                                                        setTooltipData({ text: deptoName, x: e.clientX, y: e.clientY });
                                                    }}
                                                    onClick={() => {
                                                        if (count > 0) {
                                                            setSelectedDepto({ nombre: deptoName, empleados: deptoEmpleados });
                                                        }
                                                    }}
                                                    onMouseLeave={() => {
                                                        setTooltipData(null);
                                                    }}
                                                    style={{
                                                        default: { outline: "none" },
                                                        hover: { 
                                                            fill: "#f59e0b", // Color ámbar al pasar el mouse
                                                            outline: "none",
                                                            cursor: "pointer",
                                                            transition: "all 0.2s ease"
                                                        },
                                                        pressed: { outline: "none" }
                                                    }}
                                                />
                                            );
                                        })
                                    }
                                </Geographies>
                                
                                {/* Renderizar los números sobre los departamentos que tengan personas */}
                                {geographies.map(geo => {
                                    const deptoName = geo.properties.name || "Desconocido";
                                    const count = groupedEmployees[deptoName]?.length || 0;
                                    
                                    // Solo mostrar el número si hay trabajadores
                                    if (count === 0) return null;
                                    
                                    // Highcharts provee un centroide ideal para el texto
                                    const lon = geo.properties['hc-middle-lon'] || geoCentroid(geo)[0];
                                    const lat = geo.properties['hc-middle-lat'] || geoCentroid(geo)[1];

                                    return (
                                        <Marker key={`marker-${geo.rsmKey}`} coordinates={[lon, lat]} className="pointer-events-none">
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                style={{
                                                    fontFamily: "system-ui",
                                                    fill: "#ffffff",
                                                    fontSize: "14px",
                                                    fontWeight: "bold",
                                                    textShadow: "0px 0px 4px rgba(0,0,0,0.9)" 
                                                }}
                                            >
                                                {count}
                                            </text>
                                        </Marker>
                                    );
                                })}
                            </ZoomableGroup>
                        </ComposableMap>

                    {/* Tooltip personalizado que sigue al mouse */}
                    {tooltipData && (
                        <div 
                            className="fixed bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-lg shadow-xl pointer-events-none z-[100] transition-opacity duration-150"
                            style={{ 
                                top: tooltipData.y - 45, 
                                left: tooltipData.x,
                                transform: 'translateX(-50%)' // Centrar el tooltip respecto al puntero
                            }}
                        >
                            <span className="font-semibold text-sm">{tooltipData.text}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Modal de Detalle por Departamento */}
            <Dialog open={!!selectedDepto} onOpenChange={(open) => !open && setSelectedDepto(null)}>
                <DialogContent className="sm:max-w-[700px] bg-white max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl rounded-2xl">
                    <DialogHeader className="p-6 pb-4 border-b border-gray-100 bg-gray-50/50">
                        <DialogTitle className="flex items-center text-xl text-gray-900">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            Personal en {selectedDepto?.nombre}
                            <span className="ml-auto bg-blue-100 text-blue-700 text-xs py-1 px-3 rounded-full font-bold">
                                {selectedDepto?.empleados.length} Registros
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-auto p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0 border-b border-gray-100 shadow-sm z-10">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nombre del Trabajador</th>
                                    <th className="px-6 py-4 font-semibold">Cédula</th>
                                    <th className="px-6 py-4 font-semibold">Ciudad/Región</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {selectedDepto?.empleados.map((emp) => {
                                    const lat = emp.reportes.inicio?.lat || emp.reportes.fin?.lat || emp.reportes.descanso?.lat;
                                    const lng = emp.reportes.inicio?.lng || emp.reportes.fin?.lng || emp.reportes.descanso?.lng;
                                    return (
                                        <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-xs text-gray-400 capitalize">{emp.estado_reporte.toLowerCase()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                {emp.document_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <UbicacionCelda lat={lat} lng={lng} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
