/**
 * Tipos de ausencias — Migración 007
 * Las propiedades de Ausencia y TipoAusencia se alinean con las
 * nuevas columnas OS_ devueltas directamente por las queries SQL.
 * Los alias en los SELECT (.service.ts) producen estos nombres.
 */

// Propiedades que vienen directamente de OS_AUSENCIAS con columnas AU_
export interface Ausencia {
  AU_IDAUSENCIA_PK: number;
  US_IDUSUARIO_FK: number;
  TA_IDTIPO_AUSENCIA_FK: number;
  AU_FECHA_INICIO: string;
  AU_FECHA_FIN: string;
  AU_DIAS_AUSENCIA: number;
  AU_DESCRIPCION: string;
  AU_SOPORTE_URL?: string;
  AU_USUARIO_REGISTRO_FK: number;
  AU_FECHA_REGISTRO: string;
  AU_ACTIVO: boolean;

  // Campos alias de JOIN con OS_USUARIOS
  nombre_colaborador?: string;
  apellido_colaborador?: string;
  nombre_departamento?: string;

  // Campo alias de JOIN con OS_TIPOS_AUSENCIA
  nombre_tipo_ausencia?: string;

  // Archivos adjuntos (alias del SELECT en OS_ARCHIVOS_AUSENCIAS)
  archivos?: Array<{
    id_archivo: number;
    url_archivo: string;
    nombre_archivo: string;
  }>;
}

export interface CrearAusenciaData {
  id_colaborador: number;
  id_tipo_ausencia: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  id_usuario_registro: number;
  archivos?: File[];
}

// Propiedades de OS_TIPOS_AUSENCIA con columnas TA_
export interface TipoAusencia {
  TA_IDTIPO_AUSENCIA_PK: number;
  TA_NOMBRE: string;
  TA_DESCRIPCION?: string;
  TA_PORCENTAJE_PAGO?: number;
  TA_ACTIVO: boolean;
  TA_FECHA_CREACION?: string;
  TA_CREADO_POR?: number;
  TA_FECHA_ACTUALIZACION?: string;
  TA_ACTUALIZADO_POR?: number;

  // Aliases opcionales para compatibilidad con componentes legacy
  id?: number;
  nombre?: string;
  descripcion?: string;
  is_active?: boolean;
  porcentaje_pago?: number;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
}

export interface DashboardStats {
  totalAusencias: number;
  ausenciasEsteMes: number;
  colaboradoresAfectados: number;
  tiposAusencia: Array<{
    nombre: string;
    cantidad: number;
    porcentaje: number;
  }>;
  ausenciasPorDepartamento: Array<{
    departamento: string;
    cantidad: number;
  }>;
  colaboradoresConMasAusencias: Array<{
    nombre: string;
    apellido: string;
    departamento: string;
    enfermedad: number;
    incumplimiento: number;
    accidente: number;
    total: number;
  }>;
  tendenciaMensual: Array<{
    mes: string;
    cantidad: number;
  }>;
  tendenciaDiaria: Array<{
    dia: string;
    cantidad: number;
  }>;
}
