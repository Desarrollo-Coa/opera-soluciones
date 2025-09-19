import { executeQuery } from '@/lib/database';
import { uploadToSpaces } from '@/lib/digitalocean-spaces';
import { generateSimpleFileName } from '@/lib/file-utils';
import { Ausencia, CrearAusenciaData } from '../types';

export class AusenciaService {
  async obtenerTodas(): Promise<Ausencia[]> {
    const ausencias = await executeQuery(
      `SELECT a.*, 
              u.first_name AS nombre_colaborador, 
              u.last_name AS apellido_colaborador,
              u.position AS nombre_puesto,
              u.department AS nombre_departamento,
              ta.nombre AS nombre_tipo_ausencia
       FROM ausencias a
       JOIN users u ON a.id_colaborador = u.id
       JOIN tipos_ausencia ta ON a.id_tipo_ausencia = ta.id
       WHERE a.activo = 1
       ORDER BY a.fecha_registro DESC`
    ) as Ausencia[];

    // Obtener archivos para cada ausencia
    const ausenciasConArchivos = await Promise.all(
      ausencias.map(async (ausencia) => {
        const archivos = await executeQuery(
          'SELECT id_archivo, url_archivo, nombre_archivo FROM archivos_ausencias WHERE id_ausencia = ? AND is_active = 1',
          [ausencia.id_ausencia]
        );
        return { ...ausencia, archivos };
      })
    );

    return ausenciasConArchivos;
  }

  async obtenerPorId(id: number): Promise<Ausencia | null> {
    const ausencias = await executeQuery(
      `SELECT a.*, 
              u.first_name AS nombre_colaborador, 
              u.last_name AS apellido_colaborador,
              u.position AS nombre_puesto,
              u.department AS nombre_departamento,
              ta.nombre AS nombre_tipo_ausencia
       FROM ausencias a
       JOIN users u ON a.id_colaborador = u.id
       JOIN tipos_ausencia ta ON a.id_tipo_ausencia = ta.id
       WHERE a.id_ausencia = ?`,
      [id]
    ) as Ausencia[];

    if (!ausencias || ausencias.length === 0) {
      return null;
    }

    const archivos = await executeQuery(
      'SELECT id_archivo, url_archivo, nombre_archivo FROM archivos_ausencias WHERE id_ausencia = ? AND is_active = 1',
      [id]
    );

    return { ...ausencias[0], archivos };
  }

  async crear(data: CrearAusenciaData): Promise<number> {
    // Validar fechas
    if (new Date(data.fecha_inicio) > new Date(data.fecha_fin)) {
      throw new Error('La fecha de inicio debe ser menor o igual a la fecha final');
    }

    // Insertar ausencia
    const result: any = await executeQuery(
      'INSERT INTO ausencias (id_colaborador, id_tipo_ausencia, fecha_inicio, fecha_fin, descripcion, id_usuario_registro, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [data.id_colaborador, data.id_tipo_ausencia, data.fecha_inicio, data.fecha_fin, data.descripcion, data.id_usuario_registro, data.id_usuario_registro]
    );

    const id_ausencia = result.insertId;

    // Subir archivos si existen
    if (data.archivos && data.archivos.length > 0) {
      await this.subirArchivos(id_ausencia, data.archivos);
    }

    return id_ausencia;
  }

  async actualizar(id: number, data: Partial<CrearAusenciaData>): Promise<void> {
    const campos = [];
    const valores = [];

    if (data.id_tipo_ausencia !== undefined) {
      campos.push('id_tipo_ausencia = ?');
      valores.push(data.id_tipo_ausencia);
    }
    if (data.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(data.descripcion);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    await executeQuery(
      `UPDATE ausencias SET ${campos.join(', ')} WHERE id_ausencia = ?`,
      valores
    );
  }

  async eliminar(id: number): Promise<void> {
    await executeQuery('UPDATE ausencias SET activo = 0 WHERE id_ausencia = ?', [id]);
  }

  private async subirArchivos(id_ausencia: number, archivos: File[]): Promise<void> {
    for (const archivo of archivos) {
      // Validar tipo y tamaño
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(archivo.type)) {
        continue;
      }
      if (archivo.size > 10 * 1024 * 1024) {
        continue;
      }

      const arrayBuffer = await archivo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generar nombre único simple con UUID
      const uniqueFileName = generateSimpleFileName(archivo.name);
      
      const result = await uploadToSpaces(
        buffer,
        uniqueFileName,
        archivo.type,
        `ausencias/${id_ausencia}`
      );

      await executeQuery(
        'INSERT INTO archivos_ausencias (id_ausencia, url_archivo, nombre_archivo, uploaded_by) VALUES (?, ?, ?, ?)',
        [id_ausencia, result.url, uniqueFileName, 1] // TODO: Obtener ID del usuario autenticado
      );
    }
  }
}
