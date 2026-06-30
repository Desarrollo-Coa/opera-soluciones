'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    ColDef,
    GridReadyEvent,
    CellValueChangedEvent,
    GridApi,
    ClientSideRowModelModule,
    ModuleRegistry,
    ValidationModule,
    TextEditorModule,
    NumberEditorModule,
    DateEditorModule,
    SelectEditorModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    RenderApiModule,
    RowApiModule,
    CellApiModule,
    RowSelectionModule,
    ClientSideRowModelApiModule,
    CustomEditorModule,
    GridOptions
} from 'ag-grid-community';
import { themeAlpine } from 'ag-grid-community'; // fallback theme

// Registro de módulos requeridos en ag-grid v35+
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ValidationModule,
    TextEditorModule,
    NumberEditorModule,
    DateEditorModule,
    SelectEditorModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    RenderApiModule,
    RowApiModule,
    CellApiModule,
    RowSelectionModule,
    ClientSideRowModelApiModule,
    CustomEditorModule
]);

import { FinModuleColumn, FinModuleDataRow } from '@/types/fin-modules';
import { saveFinDataRowAction, deleteFinDataRowsAction } from '@/actions/fin-modules';
import { CheckCircle2, Clock, Trash2, Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CurrencyCellEditor } from './currency-cell-editor';

interface Props {
    moduleId: number;
    sheetId: number;
    initialColumns: FinModuleColumn[];
    initialData: FinModuleDataRow[];
    moduleName?: string;
}

export function FinGridClient({ moduleId, sheetId, initialColumns, initialData, moduleName }: Props) {
    const gridRef = useRef<AgGridReact>(null);
    const [gridApi, setGridApi] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Transformar los datos de Base de Datos para AG-Grid (Aplanar el JSON metadata)
    // El row_data JSON lo subimos de nivel para que AG-Grid pueda leer columnas como data.monto en vez de data.row_data.monto
    const rowData = useMemo(() => {
        const data = initialData.map(row => {
            // OJO: A veces mysql2 devuelve el JSON como string. Debemos parsearlo si es necesario.
            const parsedMeta = typeof row.row_data === 'string'
                ? JSON.parse(row.row_data)
                : row.row_data;

            // Tomamos el json interior y le injectamos el id principal de la fila para saber editar después
            const flat = { ...parsedMeta, _dbId: row.id, _transDate: row.transaction_date };
            return flat;
        });

        // Agregar 50 filas vacías al final para simular Excel
        for (let i = 0; i < 50; i++) {
            data.push({ _dbId: undefined } as any);
        }

        return data;
    }, [initialData]);

    console.log(`[DEBUG] AG-Grid formatted rowData (sheetId: ${sheetId}):`, rowData.slice(0, 3)); // Solo mostramos los 3 primeros para no saturar 

    // Construir configuración de columnas basada en la Base de Datos dinámica
    const columnDefs = useMemo<ColDef[]>(() => {
        // Columna base predeterminada: ID oculto o visible
        const cols: ColDef[] = [];

        // Columnas inyectadas por el usuario desde BD
        initialColumns.forEach(c => {
            let filter = true;
            let valueFormatter = undefined;
            let cellEditorParams = undefined;
            let cellEditor = undefined;

            if (c.field_type === 'number' || c.field_type === 'currency') {
                filter = true;
                if (c.field_type === 'currency') {
                    cellEditor = CurrencyCellEditor;
                    valueFormatter = (params: any) => {
                        if (params.value == null || params.value === '') return '';
                        const numero = Number(params.value);
                        if (isNaN(numero)) return params.value;
                        return new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0
                        }).format(numero);
                    };
                } else {
                    valueFormatter = (params: any) => {
                        if (params.value == null || params.value === '') return '';
                        const numero = Number(params.value);
                        if (isNaN(numero)) return params.value;
                        return new Intl.NumberFormat('es-CO').format(numero);
                    };
                }
            } else if (c.field_type === 'date') {
                filter = true;
            } else if (c.field_type === 'select') {
                cellEditor = 'agSelectCellEditor';
                // Defensa extra: si por algún motivo llega como string (ej: caché), intentamos parsear
                let opts = c.options;
                if (typeof opts === 'string') {
                    try { opts = JSON.parse(opts); } catch { opts = []; }
                }

                if (Array.isArray(opts)) {
                    cellEditorParams = { values: opts };
                } else {
                    cellEditorParams = { values: [] };
                }
            }

            cols.push({
                field: c.field_key,
                headerName: c.header_name,
                width: c.width || 150,
                editable: true,
                filter: filter,
                valueFormatter: valueFormatter,
                cellEditor: cellEditor,
                cellEditorParams: cellEditorParams,
            });
        });

        // Si el módulo no tiene columnas configuradas aún, mostramos una de aviso
        if (cols.length === 0) {
            cols.push({
                headerName: "Módulo sin columnas (Agrega columnas en la configuración)",
                field: "_placeholder",
                editable: false,
                flex: 1
            });
        }

        return cols;
    }, [initialColumns]);

    const defaultColDef = useMemo<ColDef>(() => {
        return {
            flex: 1,
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true,
            editable: true,
        };
    }, []);

    const onGridReady = useCallback((params: GridReadyEvent) => {
        setGridApi(params.api);
    }, []);

    // Evento Creado/Editado en CELDA Vía Server Action
    const onCellValueChanged = async (event: CellValueChangedEvent) => {
        const { data, oldValue, newValue, node } = event;
        if (oldValue === newValue) return;

        setSaveState('saving');

        const rowId = data._dbId; // Extraemos el ID mágico

        // Limpiar metadata interna antes de enviar a DB
        const payloadData = { ...data };
        delete payloadData._dbId;
        delete payloadData._transDate;

        try {
            // Enviamos el RowData entero (las Nx columnas JSON) para actualizar solo la correspondiente
            const input = {
                id: rowId,
                module_id: moduleId,
                sheet_id: sheetId,
                transaction_date: data.transaction_date || null,
                row_data: payloadData
            };

            const res = await saveFinDataRowAction(input, 1); // UserID hardcoded por ahora
            if (!res.success) {
                setSaveState('error');
                toast.error('Error al guardar: ' + res.message);
                // Podríamos revertimos celda si falla
            } else {
                setSaveState('saved');

                // Si esta fila era nueva (sin _dbId), el backend acabó de crearla y nos devolvió su nuevo ID.
                // Inyectamos este ID a la fila para que las futuras ediciones hagan un UPDATE y no generen duplicados.
                if (!rowId && res.data?.id && node) {
                    data._dbId = res.data.id;
                }

                // Volver a estado idle despues de 3 segundos
                setTimeout(() => setSaveState('idle'), 3000);
            }
        } catch (e: any) {
            setSaveState('error');
            toast.error('Error enviando datos');
        }
    };

    const deleteSelectedRows = async () => {
        if (!gridApi) return;
        const selectedNodes = gridApi.getSelectedNodes();
        if (selectedNodes.length === 0) return;

        const idsToDelete: number[] = [];
        const rowsToRemove: any[] = [];

        selectedNodes.forEach((node: any) => {
            const data = node.data;
            rowsToRemove.push(data);
            if (data._dbId) {
                idsToDelete.push(data._dbId);
            }
        });

        if (idsToDelete.length > 0) {
            setSaveState('saving');
            const res = await deleteFinDataRowsAction(idsToDelete);
            if (!res.success) {
                setSaveState('error');
                toast.error('Error al eliminar filas: ' + res.message);
                return;
            }
            setSaveState('saved');
            setTimeout(() => setSaveState('idle'), 3000);
        }

        gridApi.applyTransaction({ remove: rowsToRemove });
        toast.success(`${rowsToRemove.length} fila(s) eliminada(s)`);
    };

    const addEmptyRows = (count: number = 50) => {
        if (!gridApi) return;
        const newRows = Array(count).fill(null).map(() => ({ _dbId: undefined }));
        gridApi.applyTransaction({ add: newRows });
    };

    const onExportCsv = () => {
        if (!gridApi) return;
        gridApi.exportDataAsCsv({
            fileName: `${moduleName || 'Export'}_${new Date().toISOString().split('T')[0]}.csv`
        });
        toast.success("Descargando archivo CSV...");
    };


    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Barra de Herramientas Estilo Excel */}
            <div className="bg-muted/30 p-2 border-b flex gap-4 items-center">
                <span className="text-xs text-muted-foreground">
                    Autoguardado activado. Edita cualquier celda para guardar.
                </span>

                <div className="flex items-center text-xs">
                    {saveState === 'saving' && (
                        <span className="text-orange-500 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 animate-spin" /> Guardando...
                        </span>
                    )}
                    {saveState === 'saved' && (
                        <span className="text-green-500 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Guardado
                        </span>
                    )}
                    {saveState === 'error' && (
                        <span className="text-destructive flex items-center gap-1 font-medium">
                            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Error
                        </span>
                    )}
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onExportCsv}>
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Descargar Excel (CSV)
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addEmptyRows(50)}>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        50 Filas
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={deleteSelectedRows}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Eliminar Filas
                    </Button>
                </div>
            </div>

            {/* El Componente Central React G */}
            <div className="flex-1 w-full h-full pb-4">
                {mounted ? (
                    <AgGridReact
                        theme={themeAlpine}
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        onGridReady={onGridReady}
                        onCellValueChanged={onCellValueChanged}
                        rowSelection={{ mode: "multiRow" }}
                        suppressRowClickSelection={true}
                        popupParent={document.body}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/10 animate-pulse text-muted-foreground">
                        Cargando grilla interactiva...
                    </div>
                )}
            </div>

        </div>
    );
}
