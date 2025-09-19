// Tipos para el sistema de archivos
// File system types

export interface FileFolder {
  id: number;
  name: string;
  parent_id: number | null;
  path: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  // Campos calculados
  children?: FileFolder[];
  files?: FileSystemFile[];
  parent?: FileFolder;
}

export interface FileSystemFile {
  id: number;
  name: string;
  original_name: string;
  folder_id: number | null;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_extension?: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  // Campos calculados
  folder?: FileFolder;
  size_formatted?: string;
}

export interface CreateFolderData {
  name: string;
  parent_id?: number | null;
  description?: string;
}

export interface UploadFileData {
  file: File;
  folder_id?: number | null;
  description?: string;
}

export interface FileSystemItem {
  type: 'folder' | 'file';
  id: number;
  name: string;
  original_name?: string; // Para archivos, el nombre original
  created_at: string;
  size?: number;
  size_formatted?: string;
  mime_type?: string;
  file_extension?: string;
  description?: string;
  created_by: number;
  is_active: boolean;
}

export interface BreadcrumbItem {
  id: number;
  name: string;
  path: string;
}

export interface FileSystemStats {
  total_folders: number;
  total_files: number;
  total_size: number;
  total_size_formatted: string;
  recent_files: FileSystemFile[];
}
