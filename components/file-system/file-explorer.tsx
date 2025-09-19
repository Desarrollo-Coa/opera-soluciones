 "use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  File, 
  Upload, 
  Plus, 
  Search, 
  Home, 
  ChevronRight,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  X
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { FileSystemItem, FileFolder, FileSystemFile } from '@/lib/file-system/types';

interface FileExplorerProps {
  initialFolderId?: number | null;
}

export function FileExplorer({ initialFolderId = null }: FileExplorerProps) {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(initialFolderId);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [folders, setFolders] = useState<FileFolder[]>([]);
  const [files, setFiles] = useState<FileSystemFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: number; name: string; path: string }>>([]);
  
  // Estados para modales
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadFileOpen, setUploadFileOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  
  // Estados para edición
  const [editingItem, setEditingItem] = useState<FileSystemItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Estados para eliminación
  const [deletingItem, setDeletingItem] = useState<FileSystemItem | null>(null);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    loadData();
  }, [currentFolderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar carpetas
      const foldersRes = await fetch(`/api/file-system/folders?parent_id=${currentFolderId || ''}`);
      const foldersData = await foldersRes.json();
      setFolders(foldersData);

      // Cargar archivos
      const filesRes = await fetch(`/api/file-system/files?folder_id=${currentFolderId || ''}`);
      const filesData = await filesRes.json();
      setFiles(filesData);

      // Cargar breadcrumbs si estamos en una carpeta específica
      if (currentFolderId) {
        const breadcrumbsRes = await fetch(`/api/file-system/folders/${currentFolderId}?action=breadcrumbs`);
        if (breadcrumbsRes.ok) {
          const breadcrumbsData = await breadcrumbsRes.json();
          setBreadcrumbs(breadcrumbsData);
        }
      } else {
        setBreadcrumbs([]);
      }

      // Combinar items
      const combinedItems: FileSystemItem[] = [
        ...foldersData.map((folder: FileFolder) => ({
          type: 'folder' as const,
          id: folder.id,
          name: folder.name,
          created_at: folder.created_at,
          description: folder.description,
          created_by: folder.created_by,
          is_active: folder.is_active
        })),
        ...filesData.map((file: FileSystemFile) => {
          console.log('File data:', { name: file.name, original_name: file.original_name });
          return {
            type: 'file' as const,
            id: file.id,
            name: file.name,
            original_name: file.original_name,
            created_at: file.created_at,
            size: file.file_size,
            size_formatted: file.size_formatted,
            mime_type: file.mime_type,
            file_extension: file.file_extension,
            description: file.description,
            created_by: file.created_by,
            is_active: file.is_active
          };
        })
      ];

      setItems(combinedItems);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderId: number) => {
    setCurrentFolderId(folderId);
  };

  const handleBreadcrumbClick = (folderId: number | null) => {
    setCurrentFolderId(folderId);
  };

  const handleCreateFolder = async () => {
    try {
      const response = await fetch('/api/file-system/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          parent_id: currentFolderId,
          description: newFolderDescription
        })
      });

      if (response.ok) {
        setNewFolderName('');
        setNewFolderDescription('');
        setCreateFolderOpen(false);
        loadData();
      }
    } catch (error) {
      console.error('Error al crear carpeta:', error);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder_id', currentFolderId?.toString() || '');
      formData.append('description', fileDescription);

      const response = await fetch('/api/file-system/files', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSelectedFile(null);
        setFileDescription('');
        setUploadFileOpen(false);
        loadData();
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleEditItem = (item: FileSystemItem) => {
    setEditingItem(item);
    
    // Para archivos, extraer solo el nombre sin la extensión
    if (item.type === 'file' && item.original_name) {
      const lastDotIndex = item.original_name.lastIndexOf('.');
      const nameWithoutExtension = lastDotIndex > 0 
        ? item.original_name.substring(0, lastDotIndex)
        : item.original_name;
      setEditName(nameWithoutExtension);
    } else {
      setEditName(item.original_name || item.name);
    }
    
    setEditDescription(item.description || '');
    setEditItemOpen(true);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const url = editingItem.type === 'folder' 
        ? `/api/file-system/folders/${editingItem.id}`
        : `/api/file-system/files/${editingItem.id}`;

      // Obtener token de las cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      // Para archivos, reconstruir el nombre completo con la extensión original
      let finalName = editName;
      if (editingItem.type === 'file' && editingItem.original_name) {
        const lastDotIndex = editingItem.original_name.lastIndexOf('.');
        if (lastDotIndex > 0) {
          const extension = editingItem.original_name.substring(lastDotIndex);
          finalName = editName + extension;
        }
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: finalName,
          description: editDescription
        })
      });

      if (response.ok) {
        setEditItemOpen(false);
        setEditingItem(null);
        setEditName('');
        setEditDescription('');
        loadData();
      }
    } catch (error) {
      console.error('Error al actualizar item:', error);
    }
  };

  const handleDeleteItem = (item: FileSystemItem) => {
    setDeletingItem(item);
    setPassword('');
    setDeleteError('');
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem || !password) return;

    try {
      const url = deletingItem.type === 'folder' 
        ? `/api/file-system/folders/${deletingItem.id}`
        : `/api/file-system/files/${deletingItem.id}`;

      // Obtener token de las cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setDeleteConfirmOpen(false);
        setDeletingItem(null);
        setPassword('');
        setDeleteError('');
        loadData();
      } else {
        const errorData = await response.json();
        setDeleteError(errorData.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar item:', error);
      setDeleteError('Error de conexión');
    }
  };

  const handleDownloadFile = async (item: FileSystemItem) => {
    if (item.type !== 'file') return;

    try {
      // Obtener token de las cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch(`/api/file-system/files/${item.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const fileData = await response.json();
        
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = fileData.file_url;
        link.download = fileData.original_name || fileData.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Error al descargar archivo');
      }
    } catch (error) {
      console.error('Error al descargar archivo:', error);
    }
  };

  const getFileIcon = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }
    
    const extension = item.file_extension?.toLowerCase();
    if (['pdf'].includes(extension || '')) {
      return <File className="w-8 h-8 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <File className="w-8 h-8 text-blue-600" />;
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return <File className="w-8 h-8 text-green-600" />;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <File className="w-8 h-8 text-purple-500" />;
    }
    
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const filteredItems = items.filter(item =>
    (item.original_name || item.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header con breadcrumbs y acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBreadcrumbClick(null)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Home className="w-4 h-4" />
            <span className="ml-1">Home</span>
          </Button>
          
          {breadcrumbs.length > 0 && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <div className="flex items-center space-x-1">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.id} className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBreadcrumbClick(breadcrumb.id)}
                      className="text-gray-600 hover:text-gray-900 p-1 h-auto"
                    >
                      {breadcrumb.name}
                    </Button>
                    {index < breadcrumbs.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Carpeta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Carpeta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder-name">Nombre de la carpeta</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nombre de la carpeta"
                  />
                </div>
                <div>
                  <Label htmlFor="folder-description">Descripción (opcional)</Label>
                  <Textarea
                    id="folder-description"
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    placeholder="Descripción de la carpeta"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    Crear Carpeta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={uploadFileOpen} onOpenChange={setUploadFileOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Subir Archivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Archivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Seleccionar archivo</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                  />
                </div>
                <div>
                  <Label htmlFor="file-description">Descripción (opcional)</Label>
                  <Textarea
                    id="file-description"
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    placeholder="Descripción del archivo"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setUploadFileOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUploadFile} disabled={!selectedFile}>
                    Subir Archivo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar archivos y carpetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid de archivos y carpetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Cargando...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Folder className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No hay archivos o carpetas</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <ContextMenu key={`${item.type}-${item.id}`}>
              <ContextMenuTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div 
                        className="cursor-pointer"
                        onClick={() => item.type === 'folder' && handleFolderClick(item.id)}
                      >
                        {getFileIcon(item)}
                      </div>
                      <div className="w-full">
                        <p 
                          className="text-sm font-medium truncate cursor-pointer" 
                          title={item.original_name || item.name}
                          onClick={() => item.type === 'folder' && handleFolderClick(item.id)}
                        >
                          {item.original_name || item.name}
                        </p>
                        {item.type === 'file' && item.size_formatted && (
                          <p className="text-xs text-gray-500">{item.size_formatted}</p>
                        )}
                        {item.file_extension && (
                          <Badge variant="secondary" className="text-xs">
                            {item.file_extension.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              
              <ContextMenuContent className="w-48">
                {item.type === 'file' && (
                  <>
                    <ContextMenuItem onClick={() => handleDownloadFile(item)}>
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                  </>
                )}
                <ContextMenuItem onClick={() => handleEditItem(item)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={() => handleDeleteItem(item)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        )}
      </div>

      {/* Modal de edición */}
      <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar {editingItem?.type === 'folder' ? 'Carpeta' : 'Archivo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">
                {editingItem?.type === 'file' ? 'Nombre (sin extensión)' : 'Nombre'}
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={editingItem?.type === 'file' ? 'Nombre del archivo' : 'Nombre de la carpeta'}
              />
              {editingItem?.type === 'file' && editingItem.file_extension && (
                <p className="text-xs text-gray-500 mt-1">
                  Extensión: <span className="font-mono">{editingItem.file_extension}</span> (no editable)
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción (opcional)</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descripción del item"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditItemOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateItem} disabled={!editName.trim()}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirmar Eliminación
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro de que quieres eliminar{' '}
              <strong>{deletingItem?.original_name || deletingItem?.name}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div>
              <Label htmlFor="delete-password">Contraseña de confirmación</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className={deleteError ? 'border-red-500' : ''}
              />
              {deleteError && (
                <p className="text-sm text-red-600 mt-1">{deleteError}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete} 
                disabled={!password.trim()}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
