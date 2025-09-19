export interface Ausencia {
  id_ausencia: number;
  id_colaborador: number;
  id_tipo_ausencia: number;
  fecha_inicio: string;
  fecha_fin: string;
  dias_ausencia: number;
  descripcion: string;
  soporte_url?: string;
  id_usuario_registro: number;
  fecha_registro: string;
  activo: boolean;
  nombre_colaborador?: string;
  apellido_colaborador?: string;
  nombre_puesto?: string;
  nombre_departamento?: string;
  nombre_tipo_ausencia?: string;
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

export interface TipoAusencia {
  id: number;
  nombre: string;
  descripcion?: string;
  es_remunerada: boolean;
  is_active: boolean;
  created_at: string;
  created_by: number;
  updated_at?: string;
  updated_by?: number;
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
