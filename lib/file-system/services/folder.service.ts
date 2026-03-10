import { executeQuery } from '@/lib/db';
import { FileFolder, CreateFolderData } from '../types';
import { FileService } from './file.service';

export class FolderService {
  /**
   * Obtener todas las carpetas
   */
  async obtenerTodas(): Promise<FileFolder[]> {
    const folders = await executeQuery(
      `SELECT 
         f.CF_IDCARPETA_PK as id, 
         f.CF_NOMBRE as name, 
         f.CF_IDCARPETA_PADRE_FK as parent_id, 
         f.CF_RUTA as path, 
         f.CF_DESCRIPCION as description, 
         f.CF_CREADO_POR as created_by, 
         f.CF_FECHA_CREACION as created_at, 
         f.CF_FECHA_ACTUALIZACION as updated_at, 
         f.CF_ACTIVO as is_active,
         u.US_NOMBRE as first_name, 
         u.US_APELLIDO as last_name
       FROM OS_CARPETAS f
       JOIN OS_USUARIOS u ON f.CF_CREADO_POR = u.US_IDUSUARIO_PK
       WHERE f.CF_ACTIVO = TRUE
       ORDER BY f.CF_RUTA, f.CF_NOMBRE`
    ) as FileFolder[];

    return this.buildFolderTree(folders);
  }

  /**
   * Obtener carpetas por padre
   */
  async obtenerPorPadre(parentId: number | null): Promise<FileFolder[]> {
    const folders = await executeQuery(
      `SELECT 
         f.CF_IDCARPETA_PK as id, 
         f.CF_NOMBRE as name, 
         f.CF_IDCARPETA_PADRE_FK as parent_id, 
         f.CF_RUTA as path, 
         f.CF_DESCRIPCION as description, 
         f.CF_CREADO_POR as created_by, 
         f.CF_FECHA_CREACION as created_at, 
         f.CF_FECHA_ACTUALIZACION as updated_at, 
         f.CF_ACTIVO as is_active,
         u.US_NOMBRE as first_name, 
         u.US_APELLIDO as last_name
       FROM OS_CARPETAS f
       JOIN OS_USUARIOS u ON f.CF_CREADO_POR = u.US_IDUSUARIO_PK
       WHERE f.CF_IDCARPETA_PADRE_FK ${parentId ? '= ?' : 'IS NULL'} 
       AND f.CF_ACTIVO = TRUE
       ORDER BY f.CF_NOMBRE`,
      parentId ? [parentId] : []
    ) as FileFolder[];

    return folders;
  }

  /**
   * Obtener carpeta por ID
   */
  async obtenerPorId(id: number): Promise<FileFolder | null> {
    const folders = await executeQuery(
      `SELECT 
         f.CF_IDCARPETA_PK as id, 
         f.CF_NOMBRE as name, 
         f.CF_IDCARPETA_PADRE_FK as parent_id, 
         f.CF_RUTA as path, 
         f.CF_DESCRIPCION as description, 
         f.CF_CREADO_POR as created_by, 
         f.CF_FECHA_CREACION as created_at, 
         f.CF_FECHA_ACTUALIZACION as updated_at, 
         f.CF_ACTIVO as is_active,
         u.US_NOMBRE as first_name, 
         u.US_APELLIDO as last_name
       FROM OS_CARPETAS f
       JOIN OS_USUARIOS u ON f.CF_CREADO_POR = u.US_IDUSUARIO_PK
       WHERE f.CF_IDCARPETA_PK = ? AND f.CF_ACTIVO = TRUE`,
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
      `INSERT INTO OS_CARPETAS (CF_NOMBRE, CF_IDCARPETA_PADRE_FK, CF_RUTA, CF_DESCRIPCION, CF_CREADO_POR)
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
      updates.push('CF_NOMBRE = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('CF_DESCRIPCION = ?');
      values.push(data.description);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeQuery(
        `UPDATE OS_CARPETAS SET ${updates.join(', ')}, CF_FECHA_ACTUALIZACION = CURRENT_TIMESTAMP WHERE CF_IDCARPETA_PK = ?`,
        values
      );
    }
  }

  /**
   * Eliminar carpeta (soft delete + eliminación recursiva de archivos y subcarpetas)
   */
  async eliminar(id: number): Promise<void> {
    const fileService = new FileService();

    // 1. Obtener y eliminar todos los archivos hijos para que se borren físicamente de DigitalOcean
    const files = await executeQuery(
      'SELECT AF_IDARCHIVO_PK as id FROM OS_ARCHIVOS WHERE CF_IDCARPETA_FK = ? AND AF_ACTIVO = TRUE',
      [id]
    ) as { id: number }[];

    for (const f of files) {
      await fileService.eliminar(f.id);
    }

    // 2. Obtener y eliminar recursivamente todas las subcarpetas
    const subfolders = await executeQuery(
      'SELECT CF_IDCARPETA_PK as id FROM OS_CARPETAS WHERE CF_IDCARPETA_PADRE_FK = ? AND CF_ACTIVO = TRUE',
      [id]
    ) as { id: number }[];

    for (const sf of subfolders) {
      await this.eliminar(sf.id);
    }

    // 3. Finalmente, eliminar definitivamente esta carpeta
    await executeQuery(
      'DELETE FROM OS_CARPETAS WHERE CF_IDCARPETA_PK = ?',
      [id]
    );
  }

  /**
   * Obtener ruta de carpeta padre
   */
  private async obtenerRutaPadre(parentId: number): Promise<string> {
    const folders = await executeQuery(
      'SELECT CF_RUTA as path FROM OS_CARPETAS WHERE CF_IDCARPETA_PK = ? AND CF_ACTIVO = TRUE',
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
