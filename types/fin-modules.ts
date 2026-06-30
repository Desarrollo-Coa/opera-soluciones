import { RowDataPacket } from 'mysql2/promise';

// Tipos de columnas permitidas en nuestro "Excel" dinámico
export type FinFieldType = 'text' | 'number' | 'date' | 'select' | 'currency' | 'boolean';

// Representación de un Módulo (La hoja de cálculo principal)
export interface FinModule extends RowDataPacket {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    created_by: number;
    created_at: Date;
    updated_at: Date;
}

// Representación de una "Hoja" (Tab) dentro del Módulo
export interface FinSheet extends RowDataPacket {
    id: number;
    module_id: number;
    name: string;
    sheet_order: number;
    created_at: Date;
}

// Representación de la definición de una columna (Cabeceras)
export interface FinModuleColumn extends RowDataPacket {
    id: number;
    module_id: number;
    sheet_id: number;
    field_key: string;
    header_name: string;
    field_type: FinFieldType;
    options: string[] | null; // Guardado como JSON en MySQL, parseado a Array
    is_required: boolean;
    column_order: number;
    width: number;
    created_at: Date;
}

// Representación de una fila de datos (El contenido del Excel)
export interface FinModuleDataRow extends RowDataPacket {
    id: number;
    module_id: number;
    sheet_id: number;
    transaction_date: Date | null;
    row_data: Record<string, any>; // Guardado como JSON en MySQL, representa toda la fila
    created_by: number;
    created_at: Date;
    updated_by: number | null;
    updated_at: Date;
}

// Respuesta estándar de nuestros Server Actions
export interface ActionResponse<T = any> {
    success: boolean;
    data?: T;
    errors?: Record<string, string[] | undefined>;
    message?: string;
}
