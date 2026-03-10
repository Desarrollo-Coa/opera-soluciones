import { executeQuery } from '@/lib/db';
import { uploadToSpaces, deleteFromSpaces, extractKeyFromUrl } from '@/lib/digitalocean-spaces';
import { generateSimpleFileName } from '@/lib/file-utils';
import { FileSystemFile, UploadFileData } from '../types';

export class FileService {
  /**
   * Obtener archivos por carpeta
   */
  async obtenerPorCarpeta(folderId: number | null): Promise<FileSystemFile[]> {
    const files = await executeQuery(
      `SELECT 
         f.AF_IDARCHIVO_PK as id,
         f.AF_NOMBRE as name,
         f.AF_NOMBRE_ORIGINAL as original_name,
         f.CF_IDCARPETA_FK as folder_id,
         f.AF_RUTA_ARCHIVO as file_path,
         f.AF_URL_ARCHIVO as file_url,
         f.AF_TAMANO as file_size,
         f.AF_TIPO_MIME as mime_type,
         f.AF_EXTENSION as file_extension,
         f.AF_DESCRIPCION as description,
         f.AF_CREADO_POR as created_by,
         f.AF_FECHA_CREACION as created_at,
         f.AF_FECHA_ACTUALIZACION as updated_at,
         f.AF_ACTIVO as is_active,
         u.US_NOMBRE as first_name, 
         u.US_APELLIDO as last_name
       FROM OS_ARCHIVOS f
       JOIN OS_USUARIOS u ON f.AF_CREADO_POR = u.US_IDUSUARIO_PK
       WHERE f.CF_IDCARPETA_FK ${folderId ? '= ?' : 'IS NULL'} 
       AND f.AF_ACTIVO = TRUE
       ORDER BY f.AF_NOMBRE`,
      folderId ? [folderId] : []
    ) as FileSystemFile[];

    return files.map(file => ({
      ...file,
      size_formatted: this.formatFileSize(file.file_size)
    }));
  }

  /**
   * Obtener archivo por ID
   */
  async obtenerPorId(id: number): Promise<FileSystemFile | null> {
    const files = await executeQuery(
      `SELECT 
         f.AF_IDARCHIVO_PK as id,
         f.AF_NOMBRE as name,
         f.AF_NOMBRE_ORIGINAL as original_name,
         f.CF_IDCARPETA_FK as folder_id,
         f.AF_RUTA_ARCHIVO as file_path,
         f.AF_URL_ARCHIVO as file_url,
         f.AF_TAMANO as file_size,
         f.AF_TIPO_MIME as mime_type,
         f.AF_EXTENSION as file_extension,
         f.AF_DESCRIPCION as description,
         f.AF_CREADO_POR as created_by,
         f.AF_FECHA_CREACION as created_at,
         f.AF_FECHA_ACTUALIZACION as updated_at,
         f.AF_ACTIVO as is_active,
         u.US_NOMBRE as first_name, 
         u.US_APELLIDO as last_name
       FROM OS_ARCHIVOS f
       JOIN OS_USUARIOS u ON f.AF_CREADO_POR = u.US_IDUSUARIO_PK
       WHERE f.AF_IDARCHIVO_PK = ? AND f.AF_ACTIVO = TRUE`,
      [id]
    ) as FileSystemFile[];

    if (files.length === 0) return null;

    const file = files[0];
    return {
      ...file,
      size_formatted: this.formatFileSize(file.file_size)
    };
  }

  /**
   * Subir archivo
   */
  async subir(data: UploadFileData, userId: number): Promise<number> {
    const { file, folder_id, description } = data;

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFileName = generateSimpleFileName(file.name);
    const fileName = `${uniqueFileName}.${fileExtension}`;

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir archivo a DigitalOcean Spaces
    const uploadResult = await uploadToSpaces(buffer, fileName, file.type, 'file-system');
    const fileUrl = uploadResult.url;

    // Obtener ruta de la carpeta
    const folderPath = folder_id
      ? await this.obtenerRutaCarpeta(folder_id)
      : '/';

    const filePath = `${folderPath}${fileName}`;

    // Guardar en base de datos
    const result = await executeQuery(
      `INSERT INTO OS_ARCHIVOS 
       (AF_NOMBRE, AF_NOMBRE_ORIGINAL, CF_IDCARPETA_FK, AF_RUTA_ARCHIVO, AF_URL_ARCHIVO, AF_TAMANO, AF_TIPO_MIME, AF_EXTENSION, AF_DESCRIPCION, AF_CREADO_POR)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileName,
        file.name,
        folder_id,
        filePath,
        fileUrl,
        file.size,
        file.type,
        fileExtension,
        description || '',
        userId
      ]
    ) as any;

    return result.insertId;
  }

  /**
   * Actualizar archivo
   */
  async actualizar(id: number, data: { name?: string; description?: string }): Promise<void> {
    const updates = [];
    const values = [];

    if (data.name) {
      updates.push('AF_NOMBRE = ?');
      updates.push('AF_NOMBRE_ORIGINAL = ?');
      values.push(data.name);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('AF_DESCRIPCION = ?');
      values.push(data.description);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeQuery(
        `UPDATE OS_ARCHIVOS SET ${updates.join(', ')}, AF_FECHA_ACTUALIZACION = CURRENT_TIMESTAMP WHERE AF_IDARCHIVO_PK = ?`,
        values
      );
    }
  }

  /**
   * Eliminar archivo (soft delete + eliminación física)
   */
  async eliminar(id: number): Promise<void> {
    // Primero obtener la información del archivo para eliminar de DigitalOcean
    const files = await executeQuery(
      'SELECT AF_URL_ARCHIVO as file_url FROM OS_ARCHIVOS WHERE AF_IDARCHIVO_PK = ? AND AF_ACTIVO = TRUE',
      [id]
    ) as any[];

    if (files.length > 0) {
      const fileUrl = files[0].file_url;

      // Extraer la clave del archivo de la URL
      const key = extractKeyFromUrl(fileUrl);

      if (key) {
        try {
          // Eliminar archivo de DigitalOcean Spaces
          await deleteFromSpaces(key);
          console.log(`Archivo eliminado de DigitalOcean Spaces: ${key}`);
        } catch (error) {
          console.error('Error al eliminar archivo de DigitalOcean Spaces:', error);
          // Continuar con la eliminación lógica aunque falle la eliminación física
        }
      }
    }

    // Eliminar archivo de la base de datos definitivamente (hard delete)
    await executeQuery(
      'DELETE FROM OS_ARCHIVOS WHERE AF_IDARCHIVO_PK = ?',
      [id]
    );
  }

  /**
   * Buscar archivos
   */
  async buscar(term: string, folderId?: number | null): Promise<FileSystemFile[]> {
    const files = await executeQuery(
      `SELECT 
         f.AF_IDARCHIVO_PK as id,
         f.AF_NOMBRE as name,
         f.AF_NOMBRE_ORIGINAL as original_name,
         f.CF_IDCARPETA_FK as folder_id,
         f.AF_RUTA_ARCHIVO as file_path,
         f.AF_URL_ARCHIVO as file_url,
         f.AF_TAMANO as file_size,
         f.AF_TIPO_MIME as mime_type,
         f.AF_EXTENSION as file_extension,
         f.AF_DESCRIPCION as description,
         f.AF_CREADO_POR as created_by,
         f.AF_FECHA_CREACION as created_at,
         f.AF_FECHA_ACTUALIZACION as updated_at,
         f.AF_ACTIVO as is_active,
         u.US_NOMBRE as first_name, 
         u.US_APELLIDO as last_name
       FROM OS_ARCHIVOS f
       JOIN OS_USUARIOS u ON f.AF_CREADO_POR = u.US_IDUSUARIO_PK
       WHERE f.AF_ACTIVO = TRUE
       AND (f.AF_NOMBRE LIKE ? OR f.AF_NOMBRE_ORIGINAL LIKE ? OR f.AF_DESCRIPCION LIKE ?)
       ${folderId !== undefined ? 'AND f.CF_IDCARPETA_FK ' + (folderId ? '= ?' : 'IS NULL') : ''}
       ORDER BY f.AF_NOMBRE`,
      folderId !== undefined && folderId ?
        [`%${term}%`, `%${term}%`, `%${term}%`, folderId] :
        [`%${term}%`, `%${term}%`, `%${term}%`]
    ) as FileSystemFile[];

    return files.map(file => ({
      ...file,
      size_formatted: this.formatFileSize(file.file_size)
    }));
  }

  /**
   * Obtener archivos recientes
   */
  async obtenerRecientes(limit: number = 10): Promise<FileSystemFile[]> {
    const files = await executeQuery(
      `SELECT 
         f.AF_IDARCHIVO_PK as id,
         f.AF_NOMBRE as name,
         f.AF_NOMBRE_ORIGINAL as original_name,
         f.CF_IDCARPETA_FK as folder_id,
         f.AF_RUTA_ARCHIVO as file_path,
         f.AF_URL_ARCHIVO as file_url,
         f.AF_TAMANO as file_size,
         f.AF_TIPO_MIME as mime_type,
         f.AF_EXTENSION as file_extension,
         f.AF_DESCRIPCION as description,
         f.AF_CREADO_POR as created_by,
         f.AF_FECHA_CREACION as created_at,
         f.AF_FECHA_ACTUALIZACION as updated_at,
         f.AF_ACTIVO as is_active,
         u.US_NOMBRE as first_name, 
         u.US_APELLIDO as last_name
       FROM OS_ARCHIVOS f
       JOIN OS_USUARIOS u ON f.AF_CREADO_POR = u.US_IDUSUARIO_PK
       WHERE f.AF_ACTIVO = TRUE
       ORDER BY f.AF_FECHA_CREACION DESC
       LIMIT ?`,
      [limit]
    ) as FileSystemFile[];

    return files.map(file => ({
      ...file,
      size_formatted: this.formatFileSize(file.file_size)
    }));
  }

  /**
   * Obtener estadísticas del sistema de archivos
   */
  async obtenerEstadisticas(): Promise<{
    total_folders: number;
    total_files: number;
    total_size: number;
    total_size_formatted: string;
  }> {
    const [foldersResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM OS_CARPETAS WHERE CF_ACTIVO = TRUE'
    ) as any[];

    const [filesResult] = await executeQuery(
      'SELECT COUNT(*) as total, COALESCE(SUM(AF_TAMANO), 0) as total_size FROM OS_ARCHIVOS WHERE AF_ACTIVO = TRUE'
    ) as any[];

    return {
      total_folders: foldersResult.total,
      total_files: filesResult.total,
      total_size: filesResult.total_size,
      total_size_formatted: this.formatFileSize(filesResult.total_size)
    };
  }

  /**
   * Obtener ruta de carpeta
   */
  private async obtenerRutaCarpeta(folderId: number): Promise<string> {
    const folders = await executeQuery(
      'SELECT CF_RUTA as path FROM OS_CARPETAS WHERE CF_IDCARPETA_PK = ? AND CF_ACTIVO = TRUE',
      [folderId]
    ) as any[];

    return folders.length > 0 ? folders[0].path : '/';
  }

  /**
   * Formatear tamaño de archivo
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
