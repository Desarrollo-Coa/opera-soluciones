import { executeQuery } from '@/lib/db';
import { TipoAusencia } from '../types';

/**
 * TipoAusenciaService
 * Migración 007: tabla OS_TIPOS_AUSENCIA con columnas TA_
 */
export class TipoAusenciaService {
  async obtenerTodos(): Promise<TipoAusencia[]> {
    const rows = await executeQuery(
      'SELECT *, TA_IDTIPO_AUSENCIA_PK as id, TA_NOMBRE as nombre, TA_PORCENTAJE_PAGO as porcentaje_pago, TA_AFECTA_AUXILIO as afecta_auxilio, TA_ACTIVO as is_active FROM OS_TIPOS_AUSENCIA WHERE TA_ACTIVO = TRUE ORDER BY TA_NOMBRE'
    ) as TipoAusencia[];

    return rows;
  }

  async obtenerActivos(): Promise<Array<{ id: number; nombre: string; porcentaje_pago: number; afecta_auxilio: boolean }>> {
    try {
      console.log("Ejecutando consulta para obtener tipos de ausencia activos...");
      // Migración 007: OS_TIPOS_AUSENCIA → TA_IDTIPO_AUSENCIA_PK as id, TA_NOMBRE as nombre, TA_ACTIVO
      const rows = await executeQuery(
        'SELECT TA_IDTIPO_AUSENCIA_PK as id, TA_NOMBRE as nombre, TA_PORCENTAJE_PAGO as porcentaje_pago, TA_AFECTA_AUXILIO as afecta_auxilio FROM OS_TIPOS_AUSENCIA WHERE TA_ACTIVO = TRUE ORDER BY TA_NOMBRE'
      ) as Array<{ id: number; nombre: string; porcentaje_pago: number; afecta_auxilio: boolean }>;

      console.log("Tipos de ausencia obtenidos de BD:", rows);
      return rows;
    } catch (error) {
      console.error("Error al obtener tipos de ausencia activos:", error);
      throw error;
    }
  }

  async obtenerPorId(id: number): Promise<TipoAusencia | null> {
    // Migración 007: OS_TIPOS_AUSENCIA → TA_IDTIPO_AUSENCIA_PK, TA_ACTIVO
    const rows = await executeQuery(
      'SELECT *, TA_IDTIPO_AUSENCIA_PK as id, TA_NOMBRE as nombre, TA_PORCENTAJE_PAGO as porcentaje_pago, TA_AFECTA_AUXILIO as afecta_auxilio, TA_ACTIVO as is_active FROM OS_TIPOS_AUSENCIA WHERE TA_IDTIPO_AUSENCIA_PK = ? AND TA_ACTIVO = TRUE',
      [id]
    ) as TipoAusencia[];

    return rows.length > 0 ? rows[0] : null;
  }

  async crear(data: Omit<TipoAusencia, 'id' | 'created_at' | 'updated_at' | 'TA_IDTIPO_AUSENCIA_PK'>): Promise<number> {
    // Migración 007: INSERT en OS_TIPOS_AUSENCIA con columnas TA_
    const result: any = await executeQuery(
      'INSERT INTO OS_TIPOS_AUSENCIA (TA_NOMBRE, TA_DESCRIPCION, TA_PORCENTAJE_PAGO, TA_AFECTA_AUXILIO, TA_ACTIVO, TA_CREADO_POR) VALUES (?, ?, ?, ?, ?, ?)',
      [data.nombre || data.TA_NOMBRE, data.descripcion || data.TA_DESCRIPCION, data.porcentaje_pago ?? data.TA_PORCENTAJE_PAGO ?? 0, data.afecta_auxilio ?? data.TA_AFECTA_AUXILIO ?? true, data.is_active ?? data.TA_ACTIVO ?? true, data.created_by || data.TA_CREADO_POR]
    );

    return result.insertId;
  }

  async actualizar(id: number, data: Partial<Omit<TipoAusencia, 'id' | 'created_at' | 'created_by' | 'TA_IDTIPO_AUSENCIA_PK'>>): Promise<void> {
    const campos = [];
    const valores = [];

    // Migración 007: columnas TA_ en OS_TIPOS_AUSENCIA
    if (data.nombre !== undefined || data.TA_NOMBRE !== undefined) {
      campos.push('TA_NOMBRE = ?');
      valores.push(data.nombre ?? data.TA_NOMBRE);
    }
    if (data.descripcion !== undefined || data.TA_DESCRIPCION !== undefined) {
      campos.push('TA_DESCRIPCION = ?');
      valores.push(data.descripcion ?? data.TA_DESCRIPCION);
    }
    if (data.porcentaje_pago !== undefined || data.TA_PORCENTAJE_PAGO !== undefined) {
      campos.push('TA_PORCENTAJE_PAGO = ?');
      valores.push(data.porcentaje_pago ?? data.TA_PORCENTAJE_PAGO);
    }
    if (data.afecta_auxilio !== undefined || data.TA_AFECTA_AUXILIO !== undefined) {
      campos.push('TA_AFECTA_AUXILIO = ?');
      valores.push(data.afecta_auxilio ?? data.TA_AFECTA_AUXILIO);
    }
    if (data.is_active !== undefined || data.TA_ACTIVO !== undefined) {
      campos.push('TA_ACTIVO = ?');
      valores.push(data.is_active ?? data.TA_ACTIVO);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    await executeQuery(
      `UPDATE OS_TIPOS_AUSENCIA SET ${campos.join(', ')}, TA_FECHA_ACTUALIZACION = CURRENT_TIMESTAMP WHERE TA_IDTIPO_AUSENCIA_PK = ?`,
      valores
    );
  }

  async eliminar(id: number): Promise<void> {
    // Migración 007: OS_TIPOS_AUSENCIA → TA_ACTIVO, TA_IDTIPO_AUSENCIA_PK
    await executeQuery('UPDATE OS_TIPOS_AUSENCIA SET TA_ACTIVO = FALSE WHERE TA_IDTIPO_AUSENCIA_PK = ?', [id]);
  }
}
