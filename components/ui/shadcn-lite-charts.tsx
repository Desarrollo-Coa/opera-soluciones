"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* === TIPOS CHART === */
interface ChartDataItem {
    label: string;
    value: number;
    color?: string;
    payload?: any;
}

interface CommonChartProps {
    data: ChartDataItem[];
    className?: string;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    showGrid?: boolean;
}

/* === LITE BAR CHART (SVG Puro + CSS) === */
export const ShadcnLiteBarChart = ({
    data,
    className,
    height = 300,
    margin = { top: 20, right: 20, bottom: 40, left: 40 },
    showGrid = true,
}: CommonChartProps) => {
    const maxValue = Math.max(...data.map(d => d.value), 100);
    const chartWidth = 1000; // Ancho relativo para el SVG
    const barWidth = (chartWidth - margin.left - margin.right) / data.length;

    return (
        <div className={cn("shadcn-lite-chart-container h-full w-full", className)}>
            <svg
                viewBox={`0 0 ${chartWidth} ${height}`}
                className="shadcn-lite-chart"
                preserveAspectRatio="none"
            >
                {/* Grid Lineas horizontales */}
                {showGrid && [0.25, 0.5, 0.75, 1].map((v, i) => (
                    <line
                        key={i}
                        x1={margin.left}
                        y1={height - margin.bottom - (height - margin.top - margin.bottom) * v}
                        x2={chartWidth - margin.right}
                        y2={height - margin.bottom - (height - margin.top - margin.bottom) * v}
                        className="grid-line"
                    />
                ))}

                {/* Ejes */}
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="axis-line" />
                <line x1={margin.left} y1={height - margin.bottom} x2={chartWidth - margin.right} y2={height - margin.bottom} className="axis-line" />

                {/* Barras */}
                {data.map((item, i) => {
                    const barHeight = ((height - margin.top - margin.bottom) * item.value) / maxValue;
                    const x = margin.left + i * barWidth + barWidth * 0.1;
                    const y = height - margin.bottom - barHeight;

                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth * 0.8}
                                height={barHeight}
                                className="bar"
                                style={{ fill: item.color || "var(--chart-primary)" }}
                            />
                            <text
                                x={x + barWidth * 0.4}
                                y={height - 10}
                                className="axis-label"
                                textAnchor="middle"
                            >
                                {item.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

/* === LITE DONUT CHART (SVG Puro) === */
export const ShadcnLiteDonutChart = ({
    data,
    className,
    size = 200,
    innerRadius = 60,
}: { data: ChartDataItem[]; className?: string; size?: number; innerRadius?: number }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativeValue = 0;

    return (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            <svg width={size} height={size} viewBox="0 0 100 100">
                {data.map((item, i) => {
                    const startAngle = (cumulativeValue / total) * 360;
                    const endAngle = ((cumulativeValue + item.value) / total) * 360;
                    cumulativeValue += item.value;

                    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                    const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                    return (
                        <path
                            key={i}
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                            style={{ fill: item.color || `hsl(var(--chart-${(i % 5) + 1}))` }}
                            className="donut-segment"
                        />
                    );
                })}
                <circle cx="50" cy="50" r={innerRadius * 0.5} fill="white" className="dark:fill-slate-900" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="donut-total-value text-xs font-bold">
                    {total}
                </text>
            </svg>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full" style={{ background: item.color || `hsl(var(--chart-${(i % 5) + 1}))` }} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
