import { RowDataPacket } from 'mysql2/promise';

export interface Puesto {
    id: number;
    nombre: string;
    direccion: string | null;
    ciudad: string | null;
    notas: string | null;
    activo: boolean;
    fecha_creacion: string;
    creado_por: number | null;
}

export interface PuestoRow extends RowDataPacket {
    PU_IDPUESTO_PK: number;
    PU_NOMBRE: string;
    PU_DIRECCION: string | null;
    PU_CIUDAD: string | null;
    PU_NOTAS: string | null;
    PU_ACTIVO: number;
    PU_FECHA_CREACION: string | Date;
    PU_CREADO_POR: number | null;
}

export interface HistorialPuestoRow extends RowDataPacket {
    HP_IDHISTORIAL_PK: number;
    US_IDUSUARIO_FK: number;
    PU_IDPUESTO_FK: number;
    HP_FECHA_ASIGNACION: string | Date;
    HP_FECHA_FIN?: string | Date | null;
    HP_FECHA_ACCION?: string | Date | null;
    HP_CREADO_POR: number;
    HP_NOTAS: string | null;
    // Datos joins
    PU_NOMBRE?: string;
    CREADOR_NOMBRE?: string;
    CREADOR_APELLIDO?: string;
}

export interface HistorialPuesto {
    id: number;
    usuario_id: number;
    puesto_id: number;
    puesto_nombre: string;
    fecha_asignacion: string;
    fecha_fin: string | null;
    fecha_accion?: string;
    creado_por: number;
    creado_por_nombre: string;
    notas: string | null;
}
