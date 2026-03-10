"use client";

import { useState, useEffect, useTransition, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Folder, File, Upload, Plus, Search, Home, ChevronRight,
  MoreVertical, Download, Trash2, Edit, X, LayoutGrid, List,
  Info, ArrowLeft, ArrowRight, FileText, FileImage, FileType,
  Clock, HardDrive, Users, Star, FileArchive, FileSpreadsheet,
  FileVideo, FileAudio, FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import {
  DndContext, useDraggable, useDroppable, DragEndEvent,
  DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileSystemItem, FileFolder, FileSystemFile } from '@/lib/file-system/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileExplorerProps {
  initialFolderId?: number | null;
}

type UploadTask = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  targetFolderId: number | null;
};

// Utilidad para extraer el token
const getAuthToken = () => {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1] || '';
};

export function FileExplorer({ initialFolderId = null }: FileExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estado de navegación
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(initialFolderId);
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: number; name: string; path: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Historial de navegación
  const [navHistory, setNavHistory] = useState<(number | null)[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);

  // Modales
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadFileOpen, setUploadFileOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [viewFileOpen, setViewFileOpen] = useState(false);

  // Inputs de Formularios
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [editingItem, setEditingItem] = useState<FileSystemItem | null>(null);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Multiselección y Marquee
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionRect, setSelectionRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Portapapeles
  const [clipboard, setClipboard] = useState<{ type: 'cut' | 'copy'; itemIds: string[] } | null>(null);

  // Sensores DND
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Estados de Rename
  const [renamingId, setRenamingId] = useState<number | string | null>(null);
  const [renamingName, setRenamingName] = useState('');

  // Estados de Upload
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<FileSystemItem | null>(null);

  // Efecto Rename Foco
  useEffect(() => {
    if (!renamingId) return;

    let timer: NodeJS.Timeout;
    const input = document.getElementById(`rename-input-${renamingId}`) as HTMLInputElement;

    if (input) {
      timer = setTimeout(() => {
        input.focus();
        const val = input.value;
        const dotIndex = val.lastIndexOf('.');
        if (dotIndex > 0) input.setSelectionRange(0, dotIndex);
        else input.select();
      }, 20);
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (input && !input.contains(e.target as Node)) {
        input.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [renamingId]);

  // Sincronización URL y Navegación
  useEffect(() => {
    const urlFolderId = searchParams.get('folderId');
    const folderId = urlFolderId ? parseInt(urlFolderId) : null;

    if (navHistory.length === 0) {
      setNavHistory([folderId]);
      setHistoryIndex(0);
      setCurrentFolderId(folderId);
      return;
    }

    if (folderId !== currentFolderId) {
      setCurrentFolderId(folderId);
      const isForward = historyIndex < navHistory.length - 1 && navHistory[historyIndex + 1] === folderId;
      const isBack = historyIndex > 0 && navHistory[historyIndex - 1] === folderId;

      if (isForward) setHistoryIndex(historyIndex + 1);
      else if (isBack) setHistoryIndex(historyIndex - 1);
      else {
        const newHistory = navHistory.slice(0, historyIndex + 1);
        newHistory.push(folderId);
        setNavHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  }, [searchParams, currentFolderId, navHistory, historyIndex]);

  // Data Fetching
  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const folderParam = currentFolderId ? `?parent_id=${currentFolderId}` : '';
      const fileParam = currentFolderId ? `?folder_id=${currentFolderId}` : '';

      const [foldersRes, filesRes] = await Promise.all([
        fetch(`/api/file-system/folders${folderParam}`),
        fetch(`/api/file-system/files${fileParam}`)
      ]);

      const foldersData = await foldersRes.json();
      const filesData = await filesRes.json();

      if (currentFolderId) {
        const breadRes = await fetch(`/api/file-system/folders/${currentFolderId}?action=breadcrumbs`);
        if (breadRes.ok) setBreadcrumbs(await breadRes.json());
      } else {
        setBreadcrumbs([]);
      }

      const combined: FileSystemItem[] = [
        ...foldersData.map((f: FileFolder) => ({ ...f, type: 'folder' as const })),
        ...filesData.map((f: FileSystemFile) => ({ ...f, type: 'file' as const }))
      ];
      setItems(combined);
    } catch (error) {
      toast.error("Error al cargar los archivos");
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const navigateTo = useCallback((folderId: number | null) => {
    setSelectedItem(null);
    setSelectedIds(new Set());
    setShowPreview(false);
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (folderId) params.set('folderId', folderId.toString());
      else params.delete('folderId');
      router.push(`/inicio/sgi?${params.toString()}`);
    });
  }, [router]);

  const toggleSelection = useCallback((id: string, isMultiselect: boolean, isRange: boolean) => {
    setSelectedIds(prev => {
      const newSelected = new Set(prev);
      if (!isMultiselect && !isRange) {
        newSelected.clear();
        newSelected.add(id);
      } else if (isMultiselect) {
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
      }

      if (newSelected.size === 1) {
        const selectedId = Array.from(newSelected)[0];
        const item = items.find(i => `${i.type}-${i.id}` === selectedId);
        if (item) {
          setSelectedItem(item);
          // Mostrar previsualización automáticamente solo si es un archivo soportado (PDF, Excel, Word)
          if (item.type === 'file' && item.file_extension && ['pdf', 'xlsx', 'xls', 'doc', 'docx'].includes(item.file_extension.toLowerCase())) {
            setShowPreview(true);
          } else {
            setShowPreview(false);
          }
        }
      } else if (newSelected.size === 0) {
        setSelectedItem(null);
        setShowPreview(false);
      }
      return newSelected;
    });
  }, [items]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
    setActiveItem(active.data.current?.item || null);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (over && active.id !== over.id && over.id.toString().startsWith('folder-')) {
      const targetFolderId = parseInt(over.id.toString().split('-')[1]);
      const itemsToMove = selectedIds.has(active.id.toString()) ? Array.from(selectedIds) : [active.id.toString()];

      try {
        const res = await fetch('/api/file-system/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemIds: itemsToMove, targetFolderId })
        });
        if (res.ok) {
          toast.success("Elementos movidos correctamente");
          loadData(false);
          setSelectedIds(new Set());
        }
      } catch (err) {
        toast.error("Error al mover elementos");
      }
    }
  }, [selectedIds, loadData]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveItem(null);
  }, []);

  // Selección Marquee
  const onMouseDownArea = (e: React.MouseEvent) => {
    if (e.button !== 0 || e.ctrlKey || e.shiftKey) return;
    const target = e.target as HTMLElement;
    if (!target.classList.contains('selection-area-background')) return;
    setIsSelecting(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelectionRect({ x1: x, y1: y, x2: x, y2: y });
    setSelectedIds(new Set());
  };

  const onMouseMoveArea = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionRect || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    setSelectionRect(prev => prev ? { ...prev, x2: x, y2: y } : null);

    const marquee = {
      left: Math.min(selectionRect.x1, x),
      top: Math.min(selectionRect.y1, y),
      right: Math.max(selectionRect.x1, x),
      bottom: Math.max(selectionRect.y1, y)
    };

    const newSelected = new Set<string>();
    items.forEach(item => {
      const el = document.getElementById(`item-${item.type}-${item.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        const itemRect = {
          left: r.left - containerRect.left,
          top: r.top - containerRect.top,
          right: r.right - containerRect.left,
          bottom: r.bottom - containerRect.top
        };
        if (!(itemRect.left > marquee.right || itemRect.right < marquee.left || itemRect.top > marquee.bottom || itemRect.bottom < marquee.top)) {
          newSelected.add(`${item.type}-${item.id}`);
        }
      }
    });
    setSelectedIds(newSelected);
  };

  const onMouseUpArea = () => {
    setIsSelecting(false);
    setSelectionRect(null);
  };

  // Acciones Portapapeles
  const handleClipboard = (type: 'cut' | 'copy') => {
    if (selectedIds.size === 0) return;
    setClipboard({ type, itemIds: Array.from(selectedIds) });
    toast.info(`${type === 'cut' ? 'Cortado' : 'Copiado'} ${selectedIds.size} elementos`);
  };

  const handlePaste = async () => {
    if (!clipboard) return;
    try {
      const res = await fetch(`/api/file-system/${clipboard.type === 'cut' ? 'move' : 'copy'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: clipboard.itemIds, targetFolderId: currentFolderId })
      });
      if (res.ok) {
        toast.success("Elementos pegados correctamente");
        loadData(false);
        if (clipboard.type === 'cut') setClipboard(null);
      }
    } catch (err) {
      toast.error("Error al pegar elementos");
    }
  };

  const getFileIcon = useCallback((item: FileSystemItem, size: "sm" | "lg" = "lg") => {
    const iconClass = size === "lg" ? "w-10 h-10" : "w-5 h-5";
    if (item.type === 'folder') return <Folder className={cn(iconClass, "text-amber-500 fill-amber-500/20")} />;

    const ext = item.file_extension?.toLowerCase() || '';
    if (ext === 'pdf') return <FileText className={cn(iconClass, "text-rose-500")} />;
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return <FileImage className={cn(iconClass, "text-emerald-500")} />;
    if (['doc', 'docx'].includes(ext)) return <FileType className={cn(iconClass, "text-blue-600")} />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className={cn(iconClass, "text-green-600")} />;
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return <FileVideo className={cn(iconClass, "text-purple-500")} />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileArchive className={cn(iconClass, "text-orange-500")} />;

    return <File className={cn(iconClass, "text-slate-400")} />;
  }, []);

  const handleCreateFolder = async () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) return;

    if (items.some(i => (i.original_name || i.name).toLowerCase() === trimmedName.toLowerCase())) {
      toast.error(`El destino ya contiene un elemento llamado "${trimmedName}".`);
      return;
    }

    try {
      const res = await fetch('/api/file-system/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, parent_id: currentFolderId, description: newFolderDescription })
      });
      if (res.ok) {
        setCreateFolderOpen(false);
        setNewFolderName('');
        loadData();
        toast.success("Carpeta creada correctamente");
      }
    } catch (err) { toast.error("Error al crear la carpeta"); }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    if (items.some(i => (i.original_name || i.name).toLowerCase() === selectedFile.name.toLowerCase())) {
      toast.error(`El destino ya contiene un elemento llamado "${selectedFile.name}".`);
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folder_id', currentFolderId?.toString() || '');
    formData.append('description', fileDescription);

    try {
      const res = await fetch('/api/file-system/files', { method: 'POST', body: formData });
      if (res.ok) {
        setUploadFileOpen(false);
        setSelectedFile(null);
        loadData();
        toast.success("Archivo subido correctamente");
      }
    } catch (err) { toast.error("Error al subir el archivo"); }
  };

  const handleRenameSubmit = useCallback(async (item: FileSystemItem) => {
    if (!renamingName.trim() || renamingName === (item.original_name || item.name)) {
      setRenamingId(null);
      return;
    }

    try {
      const res = await fetch(`/api/file-system/${item.type}s/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renamingName })
      });

      if (res.ok) {
        toast.success("Renombrado correctamente");
        setItems(prev => prev.map(i => i.id === item.id && i.type === item.type ? { ...i, name: renamingName, original_name: renamingName } : i));
        loadData(false);
      } else {
        toast.error("Error al renombrar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setRenamingId(null);
    }
  }, [renamingName, loadData]);

  // Manejadores DND Nativo
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsDragging(false); };
    const onBlur = () => setIsDragging(false);
    window.addEventListener('keydown', onEsc);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onEsc);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const readAllEntries = async (dirReader: any): Promise<any[]> => {
    let entries: any[] = [];
    let readEntries = async () => new Promise<any[]>((resolve) => dirReader.readEntries(resolve));
    let result = await readEntries();
    while (result.length > 0) {
      entries = entries.concat(result);
      result = await readEntries();
    }
    return entries;
  };

  const processEntry = async (entry: any, targetFolderId: number | null): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (entry.isFile) {
        entry.file(async (file: File) => {
          if (targetFolderId === currentFolderId && items.some(i => (i.original_name || i.name).toLowerCase() === file.name.toLowerCase())) {
            toast.error(`"${file.name}" ya existe. Omitido.`);
            return resolve();
          }

          const taskId = Math.random().toString(36).substring(7);
          setUploadTasks(prev => [...prev, { id: taskId, name: file.name, type: 'file', status: 'uploading', progress: 30, targetFolderId }]);

          const formData = new FormData();
          formData.append('file', file);
          if (targetFolderId) formData.append('folder_id', targetFolderId.toString());

          try {
            const res = await fetch('/api/file-system/files', { method: 'POST', body: formData });
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: res.ok ? 'complete' : 'error', progress: 100 } : t));
          } catch {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', progress: 100 } : t));
          }
          resolve();
        }, reject);
      } else if (entry.isDirectory) {
        if (targetFolderId === currentFolderId && items.some(i => (i.original_name || i.name).toLowerCase() === entry.name.toLowerCase())) {
          toast.error(`La carpeta "${entry.name}" ya existe. Omitida.`);
          return resolve();
        }

        const taskId = Math.random().toString(36).substring(7);
        setUploadTasks(prev => [...prev, { id: taskId, name: entry.name, type: 'folder', status: 'uploading', progress: 50, targetFolderId }]);

        const createDir = async () => {
          try {
            const res = await fetch('/api/file-system/folders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: entry.name, parent_id: targetFolderId })
            });

            if (res.ok) {
              setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'complete', progress: 100 } : t));
              const { id: newFolderId } = await res.json();
              const dirReader = entry.createReader();
              const entries = await readAllEntries(dirReader);
              for (const childEntry of entries) await processEntry(childEntry, newFolderId);
            } else {
              setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', progress: 100 } : t));
            }
          } catch {
            setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', progress: 100 } : t));
          }
          resolve();
        };
        createDir();
      } else {
        resolve();
      }
    });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!e.dataTransfer || !e.dataTransfer.items) return;
    setShowUploadModal(true);

    const entries = Array.from(e.dataTransfer.items)
      .filter(item => item.kind === 'file')
      .map(item => item.webkitGetAsEntry())
      .filter(Boolean);

    for (const entry of entries) {
      if (entry) await processEntry(entry, currentFolderId);
    }
    loadData();
    toast.success("Operación de subida finalizada");
  };

  const handleDownloadFile = useCallback(async (item: FileSystemItem) => {
    if (item.type !== 'file') return;
    try {
      const res = await fetch(`/api/file-system/files/${item.id}`, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
      if (res.ok) {
        const data = await res.json();
        const link = document.createElement('a');
        link.href = data.file_url;
        link.download = data.original_name || data.name;
        link.target = '_blank';
        link.click();
      }
    } catch (err) { toast.error("Error al descargar"); }
  }, []);

  const handleConfirmDelete = async () => {
    if (!password) return;

    // Si editingItem existe, es una eliminación individual (desde el menú de un item específico)
    // De lo contrario, usamos los seleccionados actualmente (bulk)
    const targets = editingItem
      ? [`${editingItem.type}-${editingItem.id}`]
      : Array.from(selectedIds);

    if (targets.length === 0) return;

    try {
      setDeleteError('');
      let successCount = 0;

      for (const target of targets) {
        const [type, id] = target.split('-');
        const res = await fetch(`/api/file-system/${type}s/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
          body: JSON.stringify({ password })
        });

        if (res.ok) {
          successCount++;
        } else {
          const err = await res.json();
          // Si el primer error es de contraseña (401), mostramos el error y abortamos todo el proceso
          if (res.status === 401) {
            setDeleteError("Contraseña incorrecta. Se detuvo la operación.");
            return;
          }
          toast.error(`Error al eliminar uno de los elementos: ${err.error || 'Desconocido'}`);
        }
      }

      if (successCount > 0) {
        setDeleteConfirmOpen(false);
        setPassword('');
        setEditingItem(null);
        setSelectedIds(new Set());
        toast.success(`Se eliminaron ${successCount} de ${targets.length} elementos.`);
        loadData(false);
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  // Memoizados para optimizar renders
  const filteredItems = useMemo(() =>
    items.filter(i => (i.original_name || i.name).toLowerCase().includes(searchTerm.toLowerCase())),
    [items, searchTerm]
  );

  const pendingTasksInCurrentFolder = useMemo(() =>
    uploadTasks.filter(t => t.targetFolderId === currentFolderId && (t.status === 'uploading' || t.status === 'pending')),
    [uploadTasks, currentFolderId]
  );

  return (
    <div className="h-full bg-background flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl glassmorphism relative">
      <ResizablePanelGroup id="file-explorer-group" direction="horizontal" className="h-full">
        {/* Panel Lateral Izquierdo */}
        <ResizablePanel id="file-explorer-nav-panel" defaultSize={20} minSize={15} maxSize={30} className="bg-slate-50/50 dark:bg-slate-900/50 hidden md:block">
          <div className="p-4 space-y-6 flex flex-col h-full">
            <div className="space-y-4">
              <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acceso Rápido</h3>
              <nav className="space-y-1">
                {[
                  { icon: Home, label: "Inicio SGI", id: null },
                  { icon: Star, label: "Favoritos", id: "fav" },
                  { icon: Clock, label: "Recientes", id: "rec" },
                ].map((item) => (
                  <Button
                    key={item.label}
                    variant={currentFolderId === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm h-9 px-3 font-normal"
                    onClick={() => item.id !== "fav" && item.id !== "rec" && navigateTo(null)}
                  >
                    <item.icon className="mr-3 w-4 h-4 text-primary" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            <div className="space-y-4">
              <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bibliotecas</h3>
              <nav className="space-y-1">
                {[{ icon: HardDrive, label: "Unidad Central", id: null }].map((item) => (
                  <Button key={item.label} variant="ghost" className="w-full justify-start text-sm h-9 px-3 font-normal">
                    <item.icon className="mr-3 w-4 h-4 text-slate-400" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center space-x-2 text-xs text-primary font-medium mb-2">
                <Info className="w-3 h-3" />
                <span>Espacio Utilizado</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} className="h-full bg-primary" />
              </div>
              <p className="mt-2 text-[10px] text-slate-500">4.5 GB de 10 GB disponibles</p>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle id="file-explorer-handle-1" />

        {/* Panel Central */}
        <ResizablePanel id="file-explorer-content-panel" defaultSize={80}>
          <div
            className="flex flex-col h-full bg-white dark:bg-slate-950 relative"
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {/* Overlay Drag */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onDragOver={(e) => e.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
                  className="absolute inset-2 z-50 bg-primary/10 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-primary border-dashed rounded-xl pointer-events-auto"
                >
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-primary animate-bounce mt-2" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 text-center">Suelta aquí para subir archivos</h2>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header / Toolbar */}
            <header className="p-3 border-b flex items-center justify-between gap-4 bg-slate-50/30 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="flex items-center mr-2 border rounded-md shadow-sm bg-background overflow-hidden">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r" disabled={historyIndex <= 0} onClick={() => router.back()} title="Atrás">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" disabled={historyIndex >= navHistory.length - 1} onClick={() => window.history.forward()} title="Adelante">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <nav className="flex items-center px-3 h-8 rounded-md border bg-background shadow-sm overflow-hidden max-w-[400px]">
                  <Button variant="ghost" size="sm" className="h-full px-2 hover:bg-slate-100 text-slate-500 shrink-0" onClick={() => navigateTo(null)}>
                    <Home className="w-3.5 h-3.5" />
                  </Button>
                  {breadcrumbs.map((b) => (
                    <div key={b.id} className="flex items-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-slate-300 mx-1" />
                      <Button variant="ghost" size="sm" className="h-full px-2 text-xs font-normal hover:bg-slate-100 whitespace-nowrap" onClick={() => navigateTo(b.id)}>
                        {b.name}
                      </Button>
                    </div>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-64 group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                  <Input
                    name="q-search-file-explorer"
                    placeholder="Buscar en esta carpeta..."
                    className="h-8 pl-9 bg-background focus-visible:ring-1 border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                  />
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border">
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-md" onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-md" onClick={() => setViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant={showPreview ? "secondary" : "outline"}
                  size="sm"
                  className={cn("h-8 gap-2", showPreview && "bg-primary/10 text-primary border-primary/20")}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden lg:inline text-xs">Preview</span>
                </Button>
              </div>
            </header>

            {/* Scroll Area */}
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <ScrollArea className="flex-1" ref={containerRef}>
                  <div
                    className="p-6 h-full min-h-[400px] relative selection-area-background"
                    onMouseDown={onMouseDownArea}
                    onMouseMove={onMouseMoveArea}
                    onMouseUp={onMouseUpArea}
                    onMouseLeave={onMouseUpArea}
                  >
                    {selectionRect && (
                      <div
                        className="absolute z-50 bg-primary/20 border border-primary pointer-events-none"
                        style={{
                          left: Math.min(selectionRect.x1, selectionRect.x2),
                          top: Math.min(selectionRect.y1, selectionRect.y2),
                          width: Math.abs(selectionRect.x2 - selectionRect.x1),
                          height: Math.abs(selectionRect.y2 - selectionRect.y1)
                        }}
                      />
                    )}

                    <DndContext
                      sensors={sensors}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragCancel={handleDragCancel}
                    >
                      <div className="relative h-full pointer-events-none">
                        <div className="pointer-events-auto h-full">
                          {loading && items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse text-muted-foreground">
                              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                            </div>
                          ) : (
                            <div className="relative h-full min-h-[400px]">
                              <AnimatePresence mode="popLayout" initial={false}>
                                {items.length === 0 && !loading && (
                                  <motion.div key="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 text-slate-300">
                                    <div className="relative mb-4">
                                      <Folder className="w-20 h-20 opacity-20" />
                                      <Search className="absolute bottom-2 right-2 w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-400">Esta carpeta está vacía</p>
                                    <p className="text-sm">Arrastra archivos aquí para subirlos</p>
                                  </motion.div>
                                )}

                                {items.length > 0 && filteredItems.length === 0 && (
                                  <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 text-slate-300">
                                    <Search className="w-16 h-16 opacity-10 mb-4" />
                                    <p className="text-sm font-medium text-slate-400">No se encontraron resultados para "{searchTerm}"</p>
                                  </motion.div>
                                )}

                                <motion.div key="items-grid" className={cn(viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4" : "space-y-1")}>
                                  {pendingTasksInCurrentFolder.map((task) => (
                                    <motion.div
                                      key={`task-${task.id}`} layout
                                      initial={{ opacity: 0, scale: 0.92, y: 10 }}
                                      animate={{ opacity: 0.7, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.92, y: 10 }}
                                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                      className={cn("group relative flex flex-col items-center rounded-xl transition-all border border-dashed border-primary/50 bg-slate-50/50 dark:bg-slate-900/50 animate-pulse select-none", viewMode === 'list' && "flex-row p-2 gap-4 items-center h-16")}
                                    >
                                      <div className={cn("flex items-center justify-center", viewMode === 'grid' ? "py-6 flex-1" : "shrink-0 ml-2")}>
                                        {task.type === 'folder' ? <Folder className="w-10 h-10 text-primary/40" /> : <File className="w-10 h-10 text-primary/40" />}
                                      </div>
                                      <div className={cn("w-full overflow-hidden", viewMode === 'grid' ? "px-3 pb-4 text-center" : "flex-1 text-left")}>
                                        <p className="text-xs font-medium truncate text-primary/60">{task.name}</p>
                                        <p className="text-[10px] text-primary/50">Subiendo... {task.progress}%</p>
                                      </div>
                                      {viewMode === 'grid' && (
                                        <div className="absolute inset-x-3 bottom-1.5 h-1 bg-primary/10 rounded-full overflow-hidden">
                                          <motion.div className="h-full bg-primary/40" animate={{ width: `${task.progress}%` }} />
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}

                                  {filteredItems.map((item) => (
                                    <DraggableItem
                                      key={`${item.type}-${item.id}`}
                                      item={item}
                                      isSelected={selectedIds.has(`${item.type}-${item.id}`)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelection(`${item.type}-${item.id}`, e.ctrlKey || e.metaKey, e.shiftKey);
                                        setSelectedItem(item);
                                        setShowPreview(true);
                                      }}
                                      onDoubleClick={() => {
                                        if (item.type === 'folder') navigateTo(item.id);
                                        else {
                                          setSelectedItem(item);
                                          setViewFileOpen(true);
                                        }
                                      }}
                                      viewMode={viewMode}
                                      getFileIcon={getFileIcon}
                                      setRenamingId={setRenamingId}
                                      setRenamingName={setRenamingName}
                                      renamingId={renamingId}
                                      renamingName={renamingName}
                                      handleRenameSubmit={handleRenameSubmit}
                                      setEditingItem={setEditingItem}
                                      setDeleteConfirmOpen={setDeleteConfirmOpen}
                                      setSelectedItem={setSelectedItem}
                                      setViewFileOpen={setViewFileOpen}
                                      setShowPreview={setShowPreview}
                                      handleDownloadFile={handleDownloadFile}
                                      handleClipboard={handleClipboard}
                                    />
                                  ))}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>

                      <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                          styles: {
                            active: {
                              opacity: '0.4',
                            },
                          },
                        }),
                      }}>
                        {activeId && activeItem ? (
                          <div className={cn(
                            "flex flex-col items-center rounded-xl p-4 bg-white dark:bg-slate-900 border-2 border-primary shadow-2xl opacity-90 scale-105 select-none touch-none",
                            viewMode === 'list' && "flex-row w-64 gap-4"
                          )}>
                            {getFileIcon(activeItem)}
                            <div className={cn("overflow-hidden", viewMode === 'grid' ? "mt-2 text-center" : "flex-1")}>
                              <p className="text-sm font-bold truncate">{activeItem.original_name || activeItem.name}</p>
                            </div>
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>
                </ScrollArea>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-56 rounded-xl shadow-xl p-1.5 border-slate-200/50 backdrop-blur-md">
                {selectedIds.size > 0 && (
                  <>
                    <ContextMenuItem onClick={() => handleClipboard('copy')} className="rounded-lg">
                      <Clock className="w-4 h-4 mr-3" /> Copiar ({selectedIds.size})
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleClipboard('cut')} className="rounded-lg">
                      <Edit className="w-4 h-4 mr-3" /> Cortar ({selectedIds.size})
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setDeleteConfirmOpen(true)} className="rounded-lg text-rose-500 font-medium">
                      <Trash2 className="w-4 h-4 mr-3" /> Eliminar Selección ({selectedIds.size})
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                  </>
                )}
                {clipboard && (
                  <ContextMenuItem onClick={handlePaste} className="rounded-lg font-bold text-primary bg-primary/5">
                    <Plus className="w-4 h-4 mr-3" /> Pegar aquí
                  </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => setCreateFolderOpen(true)} className="rounded-lg">
                  <Plus className="w-4 h-4 mr-3" /> Nueva Carpeta
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setUploadFileOpen(true)} className="rounded-lg">
                  <Upload className="w-4 h-4 mr-3" /> Subir Archivo
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => loadData()} className="rounded-lg">
                  <Clock className="w-4 h-4 mr-3" /> Actualizar
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </ResizablePanel>

        {/* Panel Preview Flotante */}
        <AnimatePresence>
          {showPreview && selectedItem && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-80 lg:w-96 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-3xl border-l shadow-2xl z-40 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                <header className="px-4 py-3 border-b flex items-center justify-between bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10 w-full">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Previsualización</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0" onClick={() => setShowPreview(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </header>
                <div className="flex-1 overflow-auto p-4 flex flex-col pt-4">
                  <div className="w-full h-48 sm:h-64 object-contain rounded-lg border bg-white dark:bg-slate-950 shadow-sm overflow-hidden mb-6 relative group shrink-0">
                    {selectedItem.type === 'file' && selectedItem.file_url ? (
                      selectedItem.file_extension?.toLowerCase() === 'pdf' ? (
                        <iframe src={`${selectedItem.file_url}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full border-none" title="Vista previa" />
                      ) : ['xlsx', 'xls'].includes(selectedItem.file_extension?.toLowerCase() || '') ? (
                        <div className="absolute inset-0 w-full h-full overflow-hidden bg-white doc-viewer-wrapper">
                          <style dangerouslySetInnerHTML={{
                            __html: `
                            .doc-viewer-wrapper #react-doc-viewer,
                            .doc-viewer-wrapper #react-doc-viewer > div,
                            .doc-viewer-wrapper #react-doc-viewer iframe {
                              height: 100% !important;
                              min-height: 100% !important;
                              display: block !important;
                            }
                          `}} />
                          <DocViewer
                            documents={[{ uri: selectedItem.file_url, fileType: selectedItem.file_extension?.toLowerCase() }]}
                            pluginRenderers={DocViewerRenderers}
                            config={{ header: { disableHeader: true } }}
                            className="w-full h-full border-none"
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                          <File className="w-20 h-20 mb-4 opacity-10 text-slate-400" />
                          <p className="text-sm text-slate-400 font-medium z-10 w-2/3 text-center">Vista previa restringida a PDF y Excel</p>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                        <Folder className="w-20 h-20 mb-4 opacity-10" />
                        <p className="text-sm text-slate-400">Carpeta: {selectedItem.name}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 pointer-events-none transition-opacity group-hover:opacity-100 opacity-0" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-bold truncate leading-snug mb-1" title={selectedItem.original_name || selectedItem.name}>
                        {selectedItem.original_name || selectedItem.name}
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-background/50 border-slate-200">
                          {selectedItem.type === 'folder' ? 'Carpeta' : selectedItem.file_extension?.toLowerCase()}
                        </Badge>
                        {selectedItem.size_formatted && <Badge variant="secondary">{selectedItem.size_formatted}</Badge>}
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 gap-4 text-xs">
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase tracking-tighter">Descripción</p>
                        <p className="text-slate-600 dark:text-slate-400 italic">{selectedItem.description || "Sin descripción añadida."}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase tracking-tighter">Fecha de creación</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {new Date(selectedItem.created_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium uppercase tracking-tighter">Propietario</p>
                        <div className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <Badge variant="outline" className="h-5 px-1 bg-primary/5 text-primary">SGI System</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button variant="default" className="w-full shadow-lg" onClick={() => selectedItem.type === 'file' ? setViewFileOpen(true) : navigateTo(selectedItem.id)}>
                        <Info className="w-4 h-4 mr-2" /> Abrir
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => handleDownloadFile(selectedItem)}>
                        <Download className="w-4 h-4 mr-2" /> Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ResizablePanelGroup>

      {/* Modales */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Folder className="w-5 h-5 text-amber-500 fill-amber-500/20" /> Nueva Carpeta</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nombre</Label><Input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={newFolderDescription} onChange={(e) => setNewFolderDescription(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setCreateFolderOpen(false)}>Cancelar</Button><Button onClick={handleCreateFolder}>Crear Carpeta</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadFileOpen} onOpenChange={setUploadFileOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Subir Documentos</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group" onClick={() => document.getElementById('file-input')?.click()}>
              <File className="w-6 h-6 text-primary" />
              <p className="text-xs text-center text-slate-500 max-w-[200px]">{selectedFile ? selectedFile.name : "Selecciona o arrastra el archivo aquí"}</p>
              <Input id="file-input" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={fileDescription} onChange={(e) => setFileDescription(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setUploadFileOpen(false)}>Cancelar</Button><Button disabled={!selectedFile} onClick={handleUploadFile}>Iniciar Subida</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => { setDeleteConfirmOpen(open); if (!open) { setPassword(''); setEditingItem(null); setDeleteError(''); } }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader><DialogTitle className="text-rose-600 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Eliminar Definitivamente</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm">¿Estás seguro de que deseas eliminar <span className="font-bold">{editingItem ? `"${editingItem.original_name || editingItem.name}"` : `${selectedIds.size} elementos seleccionados`}</span>? Esta acción es irreversible.</p>
            <div className="space-y-2 p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100">
              <Label className="text-xs uppercase font-bold text-rose-700">Contraseña requerida</Label>
              {/* Campos ocultos para evitar que Chrome autocompleto el username en la búsqueda */}
              <input type="text" name="username" autoComplete="username" value="juanmanuel@operasoluciones.com" readOnly className="sr-only" aria-hidden="true" />
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-rose-600 mt-1">{deleteError}</p>
            </div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button><Button variant="destructive" onClick={handleConfirmDelete} disabled={!password}>Confirmar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewFileOpen} onOpenChange={setViewFileOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col rounded-xl overflow-hidden shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedItem?.original_name || selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <header className="px-6 flex shrink-0 items-center justify-between border-b bg-slate-50 dark:bg-slate-900 z-10 w-full h-14">
            <div className="flex items-center gap-3 overflow-hidden">{selectedItem && getFileIcon(selectedItem, "sm")}<h2 className="text-base font-semibold truncate">{selectedItem?.original_name || selectedItem?.name}</h2></div>
            <div className="flex shrink-0 items-center gap-2">{selectedItem?.type === 'file' && <Button variant="outline" size="sm" onClick={() => handleDownloadFile(selectedItem)}><Download className="w-4 h-4 mr-2" />Descargar</Button>}</div>
          </header>
          <div className="flex-1 overflow-hidden bg-slate-100/50 dark:bg-neutral-950 relative w-full">
            {selectedItem?.type === 'file' && selectedItem.file_url ? (
              selectedItem.file_extension?.toLowerCase() === 'pdf' ? (
                <iframe src={`${selectedItem.file_url}#toolbar=0&navpanes=0`} className="w-full h-full bg-white" title="Vista previa" />
              ) : ['xlsx', 'xls'].includes(selectedItem.file_extension?.toLowerCase() || '') ? (
                <div className="absolute inset-0 w-full h-full overflow-hidden bg-white doc-viewer-wrapper">
                  <style dangerouslySetInnerHTML={{
                    __html: `
                    .doc-viewer-wrapper #react-doc-viewer,
                    .doc-viewer-wrapper #react-doc-viewer > div,
                    .doc-viewer-wrapper #react-doc-viewer iframe {
                      height: 100% !important;
                      min-height: 100% !important;
                      display: block !important;
                    }
                  `}} />
                  <DocViewer
                    documents={[{ uri: selectedItem.file_url, fileType: selectedItem.file_extension?.toLowerCase() }]}
                    pluginRenderers={DocViewerRenderers}
                    config={{ header: { disableHeader: true } }}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 h-full w-full p-4">
                  <File className="w-24 h-24 mb-6 opacity-20" />
                  <p className="text-lg font-medium">Previsualización disponible solo para PDF y Excel</p>
                  <Button variant="default" className="mt-6" onClick={() => handleDownloadFile(selectedItem)}>
                    <Download className="w-4 h-4 mr-2" /> Descargar
                  </Button>
                </div>
              )
            ) : <div className="text-muted-foreground">No se puede mostrar la previsualización</div>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Panel Subidas */}
      <AnimatePresence>
        {showUploadModal && uploadTasks.length > 0 && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-6 right-6 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
            <header className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b flex items-center justify-between"><h4 className="text-sm font-semibold flex items-center gap-2"><Upload className="w-4 h-4 text-primary" /> Subiendo {uploadTasks.length} elemento(s)</h4><Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setShowUploadModal(false)}><X className="w-3 h-3" /></Button></header>
            <div className="flex-1 p-2 overflow-y-auto">
              <div className="space-y-1">
                {uploadTasks.map(task => (
                  <div key={task.id} className="p-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors">
                    {task.type === 'folder' ? <Folder className="w-5 h-5 text-amber-500 shrink-0" /> : <File className="w-5 h-5 text-blue-500 shrink-0" />}
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-medium truncate" title={task.name}>{task.name}</p>
                      <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden"><motion.div className={cn("h-full", task.status === 'error' ? "bg-rose-500" : task.status === 'complete' ? "bg-emerald-500" : "bg-primary")} initial={{ width: 0 }} animate={{ width: `${task.progress}%` }} transition={{ duration: 0.3 }} /></div>
                    </div>
                    <div className="shrink-0 text-xs font-medium">{task.status === 'complete' ? <span className="text-emerald-500">Listo</span> : task.status === 'error' ? <span className="text-rose-500">Falló</span> : <span className="text-primary animate-pulse">{task.progress}%</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Tipado estricto para las Props de DraggableItem
interface DraggableItemProps {
  item: FileSystemItem;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  viewMode: 'grid' | 'list';
  getFileIcon: (item: FileSystemItem, size?: "sm" | "lg") => React.ReactNode;
  setRenamingId: (id: number | string | null) => void;
  setRenamingName: (name: string) => void;
  renamingId: number | string | null;
  renamingName: string;
  handleRenameSubmit: (item: FileSystemItem) => void;
  setEditingItem: (item: FileSystemItem | null) => void;
  setDeleteConfirmOpen: (open: boolean) => void;
  setSelectedItem: (item: FileSystemItem | null) => void;
  setViewFileOpen: (open: boolean) => void;
  setShowPreview: (show: boolean) => void;
  handleDownloadFile: (item: FileSystemItem) => void;
  handleClipboard: (type: 'cut' | 'copy') => void;
}

function DraggableItem({
  item, isSelected, onClick, onDoubleClick, viewMode, getFileIcon,
  setRenamingId, setRenamingName, renamingId, renamingName, handleRenameSubmit,
  setEditingItem, setDeleteConfirmOpen, setSelectedItem, setViewFileOpen,
  setShowPreview, handleDownloadFile, handleClipboard
}: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `${item.type}-${item.id}`, data: { item } });
  const { isOver, setNodeRef: setDropRef } = useDroppable({ id: `folder-${item.id}`, disabled: item.type !== 'folder' || (isSelected && item.type === 'folder') });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const combinedRef = (node: any) => { setNodeRef(node); if (item.type === 'folder') setDropRef(node); };

  return (
    <motion.div
      layout id={`item-${item.type}-${item.id}`} ref={combinedRef} style={style} {...attributes} {...listeners}
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={isDragging ? false : { opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 5 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        layout: { duration: 0.2 }
      }}
      onClick={onClick} onDoubleClick={onDoubleClick}
      className={cn(
        "group relative flex flex-col items-center rounded-xl transition-all cursor-pointer border select-none touch-none",
        isDragging ? "cursor-grabbing opacity-30" : "cursor-pointer",
        isSelected ? "bg-primary/10 border-primary/20 ring-1 ring-primary/30 shadow-sm" : isOver ? "bg-emerald-50 border-emerald-500 shadow-md scale-105" : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800",
        viewMode === 'list' && "flex-row p-2 gap-4 items-center"
      )}
    >
      <div className={cn("relative transition-transform duration-200 group-hover:scale-105 pointer-events-none", viewMode === 'grid' ? "py-4 flex items-center justify-center flex-1" : "shrink-0")}>
        {getFileIcon(item)}
      </div>
      <div className={cn("w-full overflow-hidden pointer-events-none", viewMode === 'grid' ? "px-3 pb-3 text-center" : "flex-1 text-left")}>
        {renamingId === item.id ? (
          <div className="pointer-events-auto">
            <Input
              id={`rename-input-${item.id}`} autoFocus
              className="h-7 py-0.5 px-2 text-xs text-center border-primary bg-background shadow-md ring-2 ring-primary/20"
              value={renamingName} onChange={(e) => setRenamingName(e.target.value)} onBlur={() => handleRenameSubmit(item)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(item); if (e.key === 'Escape') setRenamingId(null); }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : <p className="text-sm font-medium truncate leading-tight mb-0.5">{item.original_name || item.name}</p>}
        <div className="flex items-center justify-center gap-1.5 opacity-60">
          {item.type === 'file' && <span className="text-[10px] uppercase font-bold text-slate-400">{item.file_extension}</span>}
          {item.size_formatted && <span className="text-[10px] text-slate-400">• {item.size_formatted}</span>}
        </div>
      </div>

      <ContextMenu>
        <ContextMenuTrigger asChild><div className="absolute inset-0 z-0" /></ContextMenuTrigger>
        <ContextMenuContent className="w-56 rounded-xl shadow-xl p-1.5 border-slate-200/50 backdrop-blur-md">
          <ContextMenuItem onClick={() => item.type === 'folder' ? onDoubleClick() : (() => { setSelectedItem(item); setViewFileOpen(true); })()} className="rounded-lg"><Info className="w-4 h-4 mr-3" /> Abrir</ContextMenuItem>
          <ContextMenuItem onClick={() => { setSelectedItem(item); setShowPreview(true); }} className="rounded-lg"><Info className="w-4 h-4 mr-3" /> Detalles</ContextMenuItem>
          {item.type === 'file' && <ContextMenuItem onClick={() => handleDownloadFile(item)} className="rounded-lg"><Download className="w-4 h-4 mr-3" /> Descargar</ContextMenuItem>}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => handleClipboard('copy')} className="rounded-lg"><Clock className="w-4 h-4 mr-3" /> Copiar</ContextMenuItem>
          <ContextMenuItem onClick={() => handleClipboard('cut')} className="rounded-lg"><Trash2 className="w-4 h-4 mr-3" /> Cortar</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={(e) => { e.stopPropagation(); setRenamingId(item.id); setRenamingName(item.original_name || item.name); }} className="rounded-lg"><Edit className="w-4 h-4 mr-3" /> Renombrar</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => { setEditingItem(item); setDeleteConfirmOpen(true); }} className="rounded-lg text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-950 focus:text-rose-600 font-medium"><Trash2 className="w-4 h-4 mr-3" /> Mover a papelera</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </motion.div>
  );
}