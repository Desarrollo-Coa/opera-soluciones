import { executeQuery } from '@/lib/database';
import { TipoAusencia } from '../types';

export class TipoAusenciaService {
  async obtenerTodos(): Promise<TipoAusencia[]> {
    const rows = await executeQuery(
      'SELECT * FROM tipos_ausencia WHERE is_active = TRUE ORDER BY nombre'
    ) as TipoAusencia[];
    
    return rows;
  }

  async obtenerActivos(): Promise<Array<{ id: number; nombre: string }>> {
    try {
      console.log("Ejecutando consulta para obtener tipos de ausencia activos...");
      const rows = await executeQuery(
        'SELECT id, nombre FROM tipos_ausencia WHERE is_active = TRUE ORDER BY nombre'
      ) as Array<{ id: number; nombre: string }>;
      
      console.log("Tipos de ausencia obtenidos de BD:", rows);
      return rows;
    } catch (error) {
      console.error("Error al obtener tipos de ausencia activos:", error);
      throw error;
    }
  }

  async obtenerPorId(id: number): Promise<TipoAusencia | null> {
    const rows = await executeQuery(
      'SELECT * FROM tipos_ausencia WHERE id = ? AND is_active = TRUE',
      [id]
    ) as TipoAusencia[];
    
    return rows.length > 0 ? rows[0] : null;
  }

  async crear(data: Omit<TipoAusencia, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result: any = await executeQuery(
      'INSERT INTO tipos_ausencia (nombre, descripcion, es_remunerada, is_active, created_by) VALUES (?, ?, ?, ?, ?)',
      [data.nombre, data.descripcion, data.es_remunerada, data.is_active, data.created_by]
    );
    
    return result.insertId;
  }

  async actualizar(id: number, data: Partial<Omit<TipoAusencia, 'id' | 'created_at' | 'created_by'>>): Promise<void> {
    const campos = [];
    const valores = [];

    if (data.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(data.descripcion);
    }
    if (data.es_remunerada !== undefined) {
      campos.push('es_remunerada = ?');
      valores.push(data.es_remunerada);
    }
    if (data.is_active !== undefined) {
      campos.push('is_active = ?');
      valores.push(data.is_active);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    await executeQuery(
      `UPDATE tipos_ausencia SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      valores
    );
  }

  async eliminar(id: number): Promise<void> {
    await executeQuery('UPDATE tipos_ausencia SET is_active = FALSE WHERE id = ?', [id]);
  }
}
