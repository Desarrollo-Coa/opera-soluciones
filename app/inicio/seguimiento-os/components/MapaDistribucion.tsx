'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoContains, geoCentroid } from 'd3-geo';
import * as topojson from 'topojson-client';
import { EmpleadoAutorreporte } from '@/types/autorreporte';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const GEO_URL = 'https://code.highcharts.com/mapdata/countries/co/co-all.topo.json';

interface MapaDistribucionProps {
    empleados: EmpleadoAutorreporte[];
}

export default function MapaDistribucion({ empleados }: MapaDistribucionProps) {
    const [geographies, setGeographies] = useState<any[]>([]);
    const [tooltipData, setTooltipData] = useState<{ text: string, x: number, y: number } | null>(null);

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

    // Calcular el conteo de empleados por departamento
    const counts = useMemo(() => {
        const result: Record<string, number> = {};
        
        // Inicializar en 0
        geographies.forEach(geo => {
            const depto = geo.properties.name || geo.properties['hc-key'];
            result[depto] = 0;
        });

        // Contabilizar cada empleado
        empleados.forEach(emp => {
            // Buscamos la lat/lng de alguno de sus reportes
            const lat = emp.reportes.inicio?.lat || emp.reportes.fin?.lat || emp.reportes.descanso?.lat;
            const lng = emp.reportes.inicio?.lng || emp.reportes.fin?.lng || emp.reportes.descanso?.lng;

            if (lat && lng) {
                // Verificar en qué departamento cae esta coordenada
                const pt: [number, number] = [lng, lat]; // d3-geo usa [lon, lat]
                for (const geo of geographies) {
                    if (geoContains(geo, pt)) {
                        const depto = geo.properties.name || geo.properties['hc-key'];
                        result[depto] = (result[depto] || 0) + 1;
                        break;
                    }
                }
            }
        });

        return result;
    }, [empleados, geographies]);

    // Crear la escala de colores dinámicamente según el conteo máximo
    const maxValue = Math.max(...Object.values(counts), 1);
    
    const colorScale = scaleLinear<string>()
        .domain([0, maxValue])
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
                                            const count = counts[deptoName] || 0;
                                            
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
                                    const count = counts[deptoName] || 0;
                                    
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
        </Card>
    );
}
