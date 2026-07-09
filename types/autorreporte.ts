import { RowDataPacket } from 'mysql2/promise';

// =====================================================
// SGI Opera Soluciones - Tipos para Autorreportes
// =====================================================

export type TipoAutorreporte = 'INICIO' | 'FIN' | 'DESCANSO';

export interface AutorreporteRow extends RowDataPacket {
    AR_IDAUTORREPORTE_PK: number;
    US_IDUSUARIO_FK: number;
    AR_TIPO: TipoAutorreporte;
    AR_FECHA_HORA: Date | string;
    AR_FECHA_REGISTRO: Date | string;
    AR_URL_FOTO: string | null;
    AR_ACTIVO: number;
    CREATED_AT: Date | string;
    UPDATED_AT: Date | string;
}

export interface EmpleadoAutorreporte {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
    document_type?: string;
    is_active: boolean;
    puesto_name?: string;
    estado_reporte: 'PENDIENTE' | 'AUSENCIA' | 'REPORTADO';
    reportes: {
        inicio: { id: number; hora: string; foto: string | null; respuestas?: Record<string, string>; lat?: number; lng?: number } | null;
        descanso: { id: number; hora: string; lat?: number; lng?: number } | null;
        fin: { id: number; hora: string; foto: string | null; respuestas?: Record<string, string>; lat?: number; lng?: number } | null;
    };
    ausencia?: {
        tipo: string;
        nombre: string;
    } | null;
}

export interface AutorreporteDashboardData {
    pendientes: EmpleadoAutorreporte[];
    reportados: EmpleadoAutorreporte[];
    ausencias: EmpleadoAutorreporte[];
    estadisticas: {
        totalPendientes: number;
        totalReportados: number;
        totalAusencias: number;
    };
}

export interface SeguimientoMensualDia {
    estado: 'COMPLETO' | 'INICIO_SOLO' | 'DESCANSO' | 'AUSENCIA' | 'VACIO';
    fecha: string;
    ausenciaInfo?: string;
}

export interface EmpleadoSeguimientoMensual {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
    dias: Record<number, SeguimientoMensualDia>;
}
