import { RowDataPacket } from 'mysql2';

// =====================================================
// Tipos de DB - Migración 007: columnas renombradas al estándar OS_
// =====================================================

export interface ParametroNominaRow extends RowDataPacket {
    ano_vigencia: number;
    smmlv: number;                  // alias de PN_SMMLV
    auxilio_transporte: number;     // alias de PN_AUXILIO_TRANSPORTE
    horas_semanales_maximas: number; // alias de PN_HORAS_SEMANALES_MAX
    horas_mensuales_promedio: number; // alias de PN_HORAS_MENSUALES_PROM
}

export interface EmpleadoLiquidacionRow extends RowDataPacket {
    id: number;            // alias de US_IDUSUARIO_PK
    first_name: string;   // alias de US_NOMBRE
    last_name: string;    // alias de US_APELLIDO
    cargo_id: number;     // alias de CA_IDCARGO_PK
    sueldo_base: number;  // alias de CA_SUELDO_BASE
    aplica_auxilio_transporte: number; // alias de CA_APLICA_AUXILIO
    porcentaje_riesgo_arl: number;     // alias de CA_PORCENTAJE_RIESGO_ARL
}

export interface ClausulaRow extends RowDataPacket {
    id: number;
    nombre: string;
    descripcion: string;
    concepto_id: string;
    activo: number;
}

export interface UsuarioClausulaRow extends RowDataPacket {
    id: number;
    usuario_id: number;
    clausula_id: number;
    monto_mensual: number;
    fecha_inicio: string;
    fecha_fin: string | null;
    activo: number;
    notas_auditoria: string;
    nombre_clausula?: string; // Para joins
}
