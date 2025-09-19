// =====================================================
// SGI Opera Soluciones - Export Utilities
// Utilidades de exportación
// =====================================================
// Description: Utilities for exporting data to Excel formats
// Descripción: Utilidades para exportar datos a formatos Excel
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

// Dynamic import for XLSX library
let XLSX: any = null;

const loadXLSX = async () => {
  if (!XLSX) {
    XLSX = await import('xlsx');
  }
  return XLSX;
};

/**
 * Export data to Excel format (.xlsx)
 * Exportar datos a formato Excel (.xlsx)
 */
export async function exportToExcel(data: any[], filename: string, sheetName: string = 'Datos') {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  try {
    const xlsx = await loadXLSX();
    
    // Create a new workbook
    const wb = xlsx.utils.book_new();
    
    // Convert data to worksheet
    const ws = xlsx.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate Excel file
    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create and download file
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.xlsx`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    // Fallback to CSV if XLSX fails
    exportToCSV(data, filename);
  }
}

/**
 * Fallback: Export data to CSV format
 * Respaldo: Exportar datos a formato CSV
 */
function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content with BOM for Excel compatibility
  let csvContent = '\uFEFF'; // BOM for UTF-8
  
  // Add headers
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes, wrap in quotes if necessary
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export ausencias data to Excel with formatted columns
 * Exportar datos de ausencias a Excel con columnas formateadas
 */
export async function exportAusenciasToExcel(ausencias: any[], filename: string = 'historial_ausencias') {
  if (!ausencias || ausencias.length === 0) {
    console.warn('No hay ausencias para exportar');
    return;
  }

  // Format data for export
  const formattedData = ausencias.map(ausencia => {
    // Calculate days between dates
    const fechaInicio = new Date(ausencia.fecha_inicio);
    const fechaFin = new Date(ausencia.fecha_fin);
    const diasCalculados = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      'ID': ausencia.id_ausencia,
      'Colaborador': `${ausencia.nombre_colaborador} ${ausencia.apellido_colaborador}`,
      'Tipo de Ausencia': ausencia.nombre_tipo_ausencia,
      'Fecha Inicio': fechaInicio.toLocaleDateString('es-CO'),
      'Fecha Fin': fechaFin.toLocaleDateString('es-CO'),
      'Días': ausencia.dias_ausencia || diasCalculados,
      'Descripción': ausencia.descripcion || '',
      'Departamento': ausencia.nombre_departamento || '',
      'Cargo': ausencia.nombre_puesto || '',
      'Fecha Registro': new Date(ausencia.fecha_registro).toLocaleDateString('es-CO'),
      'Estado': ausencia.activo ? 'Activo' : 'Inactivo'
    };
  });

  await exportToExcel(formattedData, filename, 'Historial de Ausencias');
}

/**
 * Export dashboard stats to Excel
 * Exportar estadísticas del dashboard a Excel
 */
export async function exportStatsToExcel(stats: any, filename: string = 'estadisticas_ausencias') {
  const data = [
    { 'Métrica': 'Total Ausencias', 'Valor': stats.totalAusencias },
    { 'Métrica': 'Ausencias Este Mes', 'Valor': stats.ausenciasEsteMes },
    { 'Métrica': 'Colaboradores Afectados', 'Valor': stats.colaboradoresAfectados }
  ];

  await exportToExcel(data, filename, 'Estadísticas Generales');
}

/**
 * Export colaboradores with most ausencias to Excel
 * Exportar colaboradores con más ausencias a Excel
 */
export async function exportColaboradoresToExcel(colaboradores: any[], filename: string = 'colaboradores_ausencias') {
  if (!colaboradores || colaboradores.length === 0) {
    console.warn('No hay colaboradores para exportar');
    return;
  }

  const formattedData = colaboradores.map(colaborador => ({
    'Colaborador': `${colaborador.nombre} ${colaborador.apellido}`,
    'Negocio': colaborador.negocio || colaborador.departamento || '',
    'Enfermedad': colaborador.enfermedad,
    'Incumplimiento': colaborador.incumplimiento,
    'Accidente': colaborador.accidente,
    'Total': colaborador.total
  }));

  await exportToExcel(formattedData, filename, 'Colaboradores con Más Ausencias');
}
