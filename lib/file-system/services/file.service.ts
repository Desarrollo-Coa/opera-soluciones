import { executeQuery } from '@/lib/database';
import { uploadToSpaces } from '@/lib/digitalocean-spaces';
import { generateSimpleFileName } from '@/lib/file-utils';
import { FileSystemFile, UploadFileData } from '../types';

export class FileService {
  /**
   * Obtener archivos por carpeta
   */
  async obtenerPorCarpeta(folderId: number | null): Promise<FileSystemFile[]> {
    const files = await executeQuery(
      `SELECT f.*, u.first_name, u.last_name
       FROM file_system_files f
       JOIN users u ON f.created_by = u.id
       WHERE f.folder_id ${folderId ? '= ?' : 'IS NULL'} 
       AND f.is_active = TRUE
       ORDER BY f.name`,
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
      `SELECT f.*, u.first_name, u.last_name
       FROM file_system_files f
       JOIN users u ON f.created_by = u.id
       WHERE f.id = ? AND f.is_active = TRUE`,
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
      `INSERT INTO file_system_files 
       (name, original_name, folder_id, file_path, file_url, file_size, mime_type, file_extension, description, created_by)
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
      updates.push('name = ?');
      updates.push('original_name = ?');
      values.push(data.name);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeQuery(
        `UPDATE file_system_files SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
    }
  }

  /**
   * Eliminar archivo (soft delete)
   */
  async eliminar(id: number): Promise<void> {
    await executeQuery(
      'UPDATE file_system_files SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  /**
   * Buscar archivos
   */
  async buscar(term: string, folderId?: number | null): Promise<FileSystemFile[]> {
    const files = await executeQuery(
      `SELECT f.*, u.first_name, u.last_name
       FROM file_system_files f
       JOIN users u ON f.created_by = u.id
       WHERE f.is_active = TRUE
       AND (f.name LIKE ? OR f.original_name LIKE ? OR f.description LIKE ?)
       ${folderId !== undefined ? 'AND f.folder_id ' + (folderId ? '= ?' : 'IS NULL') : ''}
       ORDER BY f.name`,
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
      `SELECT f.*, u.first_name, u.last_name
       FROM file_system_files f
       JOIN users u ON f.created_by = u.id
       WHERE f.is_active = TRUE
       ORDER BY f.created_at DESC
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
      'SELECT COUNT(*) as total FROM file_folders WHERE is_active = TRUE'
    ) as any[];

    const [filesResult] = await executeQuery(
      'SELECT COUNT(*) as total, COALESCE(SUM(file_size), 0) as total_size FROM file_system_files WHERE is_active = TRUE'
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
      'SELECT path FROM file_folders WHERE id = ? AND is_active = TRUE',
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
