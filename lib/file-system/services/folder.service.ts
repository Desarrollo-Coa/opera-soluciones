import { executeQuery } from '@/lib/database';
import { FileFolder, CreateFolderData } from '../types';

export class FolderService {
  /**
   * Obtener todas las carpetas
   */
  async obtenerTodas(): Promise<FileFolder[]> {
    const folders = await executeQuery(
      `SELECT f.*, u.first_name, u.last_name
       FROM file_folders f
       JOIN users u ON f.created_by = u.id
       WHERE f.is_active = TRUE
       ORDER BY f.path, f.name`
    ) as FileFolder[];

    return this.buildFolderTree(folders);
  }

  /**
   * Obtener carpetas por padre
   */
  async obtenerPorPadre(parentId: number | null): Promise<FileFolder[]> {
    const folders = await executeQuery(
      `SELECT f.*, u.first_name, u.last_name
       FROM file_folders f
       JOIN users u ON f.created_by = u.id
       WHERE f.parent_id ${parentId ? '= ?' : 'IS NULL'} 
       AND f.is_active = TRUE
       ORDER BY f.name`,
      parentId ? [parentId] : []
    ) as FileFolder[];

    return folders;
  }

  /**
   * Obtener carpeta por ID
   */
  async obtenerPorId(id: number): Promise<FileFolder | null> {
    const folders = await executeQuery(
      `SELECT f.*, u.first_name, u.last_name
       FROM file_folders f
       JOIN users u ON f.created_by = u.id
       WHERE f.id = ? AND f.is_active = TRUE`,
      [id]
    ) as FileFolder[];

    return folders.length > 0 ? folders[0] : null;
  }

  /**
   * Crear nueva carpeta
   */
  async crear(data: CreateFolderData, userId: number): Promise<number> {
    const parentPath = data.parent_id 
      ? await this.obtenerRutaPadre(data.parent_id)
      : '/';
    
    const newPath = `${parentPath}${data.name}/`;
    
    const result = await executeQuery(
      `INSERT INTO file_folders (name, parent_id, path, description, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.parent_id, newPath, data.description || '', userId]
    ) as any;

    return result.insertId;
  }

  /**
   * Actualizar carpeta
   */
  async actualizar(id: number, data: Partial<CreateFolderData>): Promise<void> {
    const updates = [];
    const values = [];

    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeQuery(
        `UPDATE file_folders SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );
    }
  }

  /**
   * Eliminar carpeta (soft delete)
   */
  async eliminar(id: number): Promise<void> {
    await executeQuery(
      'UPDATE file_folders SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  /**
   * Obtener ruta de carpeta padre
   */
  private async obtenerRutaPadre(parentId: number): Promise<string> {
    const folders = await executeQuery(
      'SELECT path FROM file_folders WHERE id = ? AND is_active = TRUE',
      [parentId]
    ) as FileFolder[];

    return folders.length > 0 ? folders[0].path : '/';
  }

  /**
   * Construir árbol de carpetas
   */
  private buildFolderTree(folders: FileFolder[]): FileFolder[] {
    const folderMap = new Map<number, FileFolder>();
    const rootFolders: FileFolder[] = [];

    // Crear mapa de carpetas
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [], files: [] });
    });

    // Construir jerarquía
    folders.forEach(folder => {
      const folderNode = folderMap.get(folder.id)!;
      
      if (folder.parent_id === null) {
        rootFolders.push(folderNode);
      } else {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children!.push(folderNode);
        }
      }
    });

    return rootFolders;
  }

  /**
   * Obtener breadcrumbs para una carpeta
   */
  async obtenerBreadcrumbs(folderId: number): Promise<Array<{ id: number; name: string; path: string }>> {
    const breadcrumbs = [];
    let currentId = folderId;

    while (currentId) {
      const folder = await this.obtenerPorId(currentId);
      if (!folder) break;

      breadcrumbs.unshift({
        id: folder.id,
        name: folder.name,
        path: folder.path
      });

      currentId = folder.parent_id || 0;
    }

    return breadcrumbs;
  }
}
