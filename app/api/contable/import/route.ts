import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth/token-verifier'
import { executeQuery } from '@/lib/database'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    console.log('Import API called')
    
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    console.log('Token found:', !!token)
    
    if (!token) {
      console.log('No token found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('Verifying token...')
    const user = await verifyTokenEdge(token)
    console.log('User verified:', !!user)
    
    if (!user) {
      console.log('Token verification failed')
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Obtener datos del formulario
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const sheet = formData.get('sheet') as string

    console.log('Form data received:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      type, 
      sheet 
    })

    if (!file || !type) {
      console.log('Missing required parameters')
      return NextResponse.json({ 
        error: 'Faltan parámetros requeridos: file, type' 
      }, { status: 400 })
    }

    // Leer archivo
    console.log('Reading file...')
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    console.log('Workbook sheets:', workbook.SheetNames)
    
    // Si se especifica una hoja, usar esa; sino usar la primera
    const sheetName = sheet || workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    if (!worksheet) {
      return NextResponse.json({ 
        error: `Hoja '${sheetName}' no encontrada` 
      }, { status: 400 })
    }

    // Si solo se solicita información de hojas
    if (!sheet) {
      console.log('Processing sheets info...')
      const sheets = workbook.SheetNames.map(name => {
        const ws = workbook.Sheets[name]
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1')
        const headers = []
        
        // Obtener headers de la primera fila
        for (let col = range.s.c; col <= Math.min(range.e.c, 10); col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col })
          const cell = ws[cellAddress]
          if (cell && cell.v) {
            headers.push(String(cell.v))
          }
        }
        
        return {
          name,
          rows: range.e.r - range.s.r,
          columns: headers
        }
      })
      
      console.log('Sheets info:', sheets)
      return NextResponse.json({ sheets })
    }

    // Convertir a JSON
    console.log('Converting sheet to JSON...')
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ''
    }) as any[][]

    console.log('JSON data length:', jsonData.length)

    if (jsonData.length < 2) {
      console.log('Insufficient data rows')
      return NextResponse.json({ 
        error: 'El archivo debe tener al menos una fila de encabezados y una fila de datos' 
      }, { status: 400 })
    }

    // Obtener headers y datos - SIN TRIM para mantener estructura exacta
    const rawHeaders = jsonData[0].map(h => String(h))
    
    // NO filtrar headers vacíos - mantener la estructura original
    const headers = rawHeaders
    
    // Mantener todas las columnas de datos, incluyendo las vacías
    const dataRows = jsonData.slice(1)
      .filter(row => 
        row.some(cell => cell !== '' && cell !== null && cell !== undefined)
      )

    console.log('Raw headers:', rawHeaders)
    console.log('Filtered headers:', headers)
    console.log('Headers length:', headers.length)
    console.log('Data rows:', dataRows.length)
    console.log('First data row:', dataRows[0])
    console.log('First data row length:', dataRows[0]?.length)
    console.log('First 3 data rows:', dataRows.slice(0, 3))

    // Validar y procesar datos según el tipo
    console.log('Processing data...')
    const processedData = await processDataByType(dataRows, headers, type)
    console.log('Processed data:', { 
      totalRows: processedData.totalRows, 
      validRows: processedData.validRows 
    })
    
    return NextResponse.json(processedData)

  } catch (error) {
    console.error('Error en importación:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

async function processDataByType(
  dataRows: any[][], 
  headers: string[], 
  type: string
) {
  const errors: string[] = []
  const warnings: string[] = []
  const validRows: any[] = []
  let totalAmount = 0

  // Mapeo de columnas según el tipo
  const columnMapping = getColumnMapping(type)
  console.log('Column mapping for type', type, ':', Object.keys(columnMapping))
  console.log('Full column mapping:', columnMapping)
  
  // Extraer fechas para determinar años y meses únicos
  const dates = extractDatesFromData(dataRows, headers, columnMapping)
  console.log('Extracted dates:', dates.slice(0, 5)) // Mostrar solo las primeras 5 fechas
  console.log('Total dates extracted:', dates.length)
  const yearMonthMap = new Map<string, { year: number, mes: string }>()
  
  for (const dateStr of dates) {
    if (dateStr && dateStr !== '') { // Solo procesar fechas válidas
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) { // Verificar que la fecha sea válida
        const year = date.getFullYear()
        const mes = getMonthName(date.getMonth())
        yearMonthMap.set(dateStr, { year, mes })
        console.log(`Mapped date ${dateStr} -> year: ${year}, mes: ${mes}`)
      }
    }
  }
  
  console.log('YearMonthMap size:', yearMonthMap.size)
  console.log('YearMonthMap entries:', Array.from(yearMonthMap.entries()).slice(0, 3))
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const rowData: any = {}
    let isValid = true
    const rowErrors: string[] = []

    // Log para las primeras 3 filas
    if (i < 3) {
      console.log(`Processing row ${i + 1}:`, row)
      console.log(`Headers:`, headers)
    }

    try {
      // Procesar cada columna según el mapeo
      for (const [dbColumn, excelColumns] of Object.entries(columnMapping)) {
        let value
        if ((type === 'transfers' || type === 'expenses' || type === 'payroll') && excelColumns.position !== undefined) {
          // Para transfers, expenses y payroll, usar posición específica
          value = findValueByPosition(row, excelColumns.position)
        } else {
          // Para otros tipos, usar búsqueda por nombre
          value = findValueInRow(row, headers, excelColumns.columns)
        }
        
        // Log para las primeras 3 filas
        if (i < 3) {
          console.log(`  ${dbColumn}: found value "${value}" ${(type === 'transfers' || type === 'expenses' || type === 'payroll') && excelColumns.position !== undefined ? `from position ${excelColumns.position}` : `from columns [${excelColumns.columns.join(', ')}]`}`)
        }
        
        if (value === null && excelColumns.required) {
          rowErrors.push(`Falta ${excelColumns.label}`)
          isValid = false
        } else if (value !== null) {
          // Convertir según el tipo
          if (excelColumns.type === 'date') {
            const dateStr = parseDate(value)
            rowData[dbColumn] = dateStr
            
            // Asignar año y mes automáticamente basado en la fecha
            const dateInfo = yearMonthMap.get(dateStr)
            if (dateInfo) {
              rowData.year = dateInfo.year
              rowData.mes = dateInfo.mes
              console.log(`Row ${i + 1}: Assigned year=${dateInfo.year}, mes=${dateInfo.mes} for date ${dateStr}`)
            } else {
              console.log(`Row ${i + 1}: No dateInfo found for date ${dateStr}`)
            }
          } else if (excelColumns.type === 'number') {
            const numValue = parseNumber(value)
            if (isNaN(numValue)) {
              rowErrors.push(`${excelColumns.label} debe ser un número válido`)
              isValid = false
            } else {
              rowData[dbColumn] = numValue
              if (excelColumns.isAmount) {
                totalAmount += numValue
              }
            }
          } else {
            rowData[dbColumn] = String(value)
          }
        } else if (value === null && !excelColumns.required) {
          // Para campos no requeridos, asignar null explícitamente para celdas vacías
          rowData[dbColumn] = null
        }
      }

      // Validaciones específicas por tipo
      if (type === 'payroll') {
        // Calcular total automáticamente
        const valor_neto = rowData.valor_neto || 0
        const iva = rowData.iva || 0
        const retencion = rowData.retencion || 0
        rowData.total = valor_neto + iva - retencion
      } else if (type === 'expenses') {
        // Calcular total automáticamente
        const valor = rowData.valor || 0
        const iva = rowData.iva || 0
        rowData.total = valor + iva
      }

      if (isValid) {
        validRows.push(rowData)
      } else {
        errors.push(`Fila ${i + 2}: ${rowErrors.join(', ')}`)
      }

    } catch (error) {
      errors.push(`Fila ${i + 2}: Error de procesamiento`)
    }
  }

  // Crear lista completa de registros con estado
  const allRowsWithStatus: any[] = []
  
  // Agregar registros válidos
  validRows.forEach((row, index) => {
    allRowsWithStatus.push({
      ...row,
      _isValid: true,
      _errors: [],
      _originalIndex: index
    })
  })
  
  // Agregar registros con errores (reconstruir desde los errores reportados)
  const errorRowMap = new Map<number, string[]>()
  errors.forEach(error => {
    const match = error.match(/Fila (\d+):/)
    if (match) {
      const rowNumber = parseInt(match[1]) - 2 // -2 porque Excel empieza en 1 y tenemos headers
      if (rowNumber >= 0 && rowNumber < dataRows.length) {
        if (!errorRowMap.has(rowNumber)) {
          errorRowMap.set(rowNumber, [])
        }
        errorRowMap.get(rowNumber)!.push(error)
      }
    }
  })
  
  // Agregar registros con errores a la lista
  errorRowMap.forEach((rowErrors, rowIndex) => {
    const originalRow = dataRows[rowIndex]
    const processedRow: any = { _isValid: false, _errors: rowErrors, _originalIndex: rowIndex }
    
    // Intentar procesar parcialmente la fila para mostrar algunos datos
    try {
      const columnMapping = getColumnMapping(type)
      console.log(`Processing error row ${rowIndex} with column mapping:`, Object.keys(columnMapping))
      console.log(`Original row data:`, originalRow)
      
      for (const [dbColumn, excelColumns] of Object.entries(columnMapping)) {
        let value
        if ((type === 'transfers' || type === 'expenses' || type === 'payroll') && excelColumns.position !== undefined) {
          // Para transfers, expenses y payroll, usar posición específica
          value = findValueByPosition(originalRow, excelColumns.position)
          console.log(`Error row ${rowIndex} - ${dbColumn} (position ${excelColumns.position}):`, value)
        } else {
          // Para otros tipos, usar búsqueda por nombre
          value = findValueInRow(originalRow, headers, excelColumns.columns)
          console.log(`Error row ${rowIndex} - ${dbColumn} (by name):`, value)
        }
        
        // Siempre asignar el valor, incluso si es null o vacío
        if (value !== null) {
          if (excelColumns.type === 'date') {
            processedRow[dbColumn] = parseDate(value)
          } else if (excelColumns.type === 'number') {
            const numValue = parseNumber(value)
            processedRow[dbColumn] = isNaN(numValue) ? null : numValue
          } else {
            processedRow[dbColumn] = String(value)
          }
        } else {
          // Asignar null explícitamente para campos vacíos
          processedRow[dbColumn] = null
        }
      }
      
      console.log(`Processed error row ${rowIndex}:`, processedRow)
    } catch (error) {
      console.error(`Error processing row ${rowIndex}:`, error)
      // Si hay error en el procesamiento parcial, mantener solo el estado de error
    }
    
    allRowsWithStatus.push(processedRow)
  })

  console.log('Backend returning allRowsWithStatus:', allRowsWithStatus.slice(0, 2))
  console.log('First allRowsWithStatus item:', allRowsWithStatus[0])
  console.log('First allRowsWithStatus keys:', allRowsWithStatus[0] ? Object.keys(allRowsWithStatus[0]) : 'No first item')
  
  return {
    rows: validRows, // Mantener compatibilidad
    allRows: allRowsWithStatus, // Nueva propiedad con todos los registros
    totalRows: dataRows.length,
    validRows: validRows.length,
    invalidRows: dataRows.length - validRows.length,
    errors,
    warnings,
    summary: {
      totalAmount,
      dateRange: getDateRange(validRows),
      uniqueValues: getUniqueValues(validRows, type)
    }
  }
}

function getColumnMapping(type: string) {
  const mappings: Record<string, Record<string, any>> = {
    payroll: {
      fecha: { 
        columns: ['fecha', 'date', 'fecha_pago'], 
        type: 'date', 
        required: true, 
        label: 'Fecha',
        position: 0 // Columna A
      },
      proveedor: { 
        columns: ['proveedor', 'supplier', 'empresa', 'nombre'], 
        type: 'string', 
        required: true, 
        label: 'Proveedor',
        position: 1 // Columna B
      },
      pago: { 
        columns: ['pago', 'payment', 'monto', 'valor'], 
        type: 'number', 
        required: true, 
        label: 'Pago',
        isAmount: true,
        position: 2 // Columna C
      },
      objeto: { 
        columns: ['objeto', 'concepto', 'descripcion', 'description'], 
        type: 'string', 
        required: true, 
        label: 'Objeto',
        position: 3 // Columna D
      },
      valor_neto: { 
        columns: ['valor_neto', 'neto', 'subtotal'], 
        type: 'number', 
        required: true, 
        label: 'Valor Neto',
        isAmount: true,
        position: 4 // Columna E
      },
      iva: { 
        columns: ['iva', 'tax', 'impuesto'], 
        type: 'number', 
        required: false, 
        label: 'IVA',
        isAmount: true,
        position: 5 // Columna F
      },
      retencion: { 
        columns: ['retencion', 'retention', 'withholding'], 
        type: 'number', 
        required: false, 
        label: 'Retención',
        isAmount: true,
        position: 6 // Columna G
      },
      nit: { 
        columns: ['nit', 'tax_id', 'id'], 
        type: 'string', 
        required: true, 
        label: 'NIT',
        position: 7 // Columna H
      },
      numero_factura: { 
        columns: ['numero_factura', 'factura', 'invoice', 'numero'], 
        type: 'string', 
        required: true, 
        label: 'Número de Factura',
        position: 8 // Columna I
      },
      obra: { 
        columns: ['obra', 'project', 'proyecto'], 
        type: 'string', 
        required: true, 
        label: 'Obra',
        position: 9 // Columna J
      }
    },
    expenses: {
      numero_facturacion: { 
        columns: ['numero_facturacion', 'facturacion', 'invoice_number'], 
        type: 'string', 
        required: true, 
        label: 'Número de Facturación',
        position: 0 // Columna A
      },
      fecha: { 
        columns: ['fecha', 'date', 'fecha_factura'], 
        type: 'date', 
        required: true, 
        label: 'Fecha',
        position: 1 // Columna B
      },
      cliente: { 
        columns: ['cliente', 'customer', 'client'], 
        type: 'string', 
        required: true, 
        label: 'Cliente',
        position: 2 // Columna C
      },
      servicio: { 
        columns: ['servicio', 'service', 'descripcion'], 
        type: 'string', 
        required: true, 
        label: 'Servicio',
        position: 3 // Columna D
      },
      nit: { 
        columns: ['nit', 'tax_id', 'id'], 
        type: 'string', 
        required: true, 
        label: 'NIT',
        position: 4 // Columna E
      },
      valor: { 
        columns: ['valor', 'value', 'amount', 'monto'], 
        type: 'number', 
        required: true, 
        label: 'Valor',
        isAmount: true,
        position: 5 // Columna F
      },
      iva: { 
        columns: ['iva', 'tax', 'impuesto'], 
        type: 'number', 
        required: false, 
        label: 'IVA',
        isAmount: true,
        position: 6 // Columna G
      }
    },
    transfers: {
      fecha: { 
        columns: ['fecha', 'date'], 
        type: 'date', 
        required: true, 
        label: 'Fecha',
        position: 0 // Columna A
      },
      actividad: { 
        columns: ['actividad', 'activity', 'descripcion'], 
        type: 'string', 
        required: true, 
        label: 'Actividad',
        position: 1 // Columna B
      },
      sale: { 
        columns: ['sale', 'salida', 'egreso', 'debe'], 
        type: 'number', 
        required: false, 
        label: 'Sale',
        isAmount: true,
        position: 2 // Columna C
      },
      entra: { 
        columns: ['entra', 'entrada', 'ingreso', 'haber'], 
        type: 'number', 
        required: false, 
        label: 'Entra',
        isAmount: true,
        position: 3 // Columna D
      },
      saldo: { 
        columns: ['saldo', 'balance'], 
        type: 'number', 
        required: false, 
        label: 'Saldo',
        isAmount: true,
        position: 4 // Columna E
      },
      concepto: { 
        columns: ['concepto', 'concept', 'descripcion'], 
        type: 'string', 
        required: false, 
        label: 'Concepto',
        position: 5 // Columna F
      }
    }
  }

  return mappings[type] || {}
}

function findValueByPosition(row: any[], position: number): any {
  console.log(`Looking for value at position ${position} in row:`, row)
  console.log(`Row length:`, row.length)
  
  if (position < 0 || position >= row.length) {
    console.log(`Position ${position} is out of bounds (row length: ${row.length})`)
    return null
  }
  
  const cellValue = row[position]
  console.log(`Raw cell value at position ${position}:`, cellValue, `(type: ${typeof cellValue})`)
  
  // Verificar que la celda no esté vacía o sea solo espacios
  const isEmpty = cellValue === '' || cellValue === null || cellValue === undefined || 
                 (typeof cellValue === 'string' && cellValue.trim() === '')
  
  if (!isEmpty) {
    console.log(`Found value at position ${position}: "${cellValue}"`)
    return cellValue
  } else {
    console.log(`Position ${position} is empty: "${cellValue}"`)
    return null // Retornar null para celdas vacías
  }
}

function findValueInRow(row: any[], headers: string[], possibleColumns: string[]): any {
  console.log(`Looking for columns [${Array.isArray(possibleColumns) ? possibleColumns.join(', ') : 'NOT AN ARRAY'}] in headers [${headers.join(', ')}]`)
  console.log(`Row data:`, row)
  console.log(`Row length:`, row.length)
  console.log(`Headers length:`, headers.length)
  
  if (!Array.isArray(possibleColumns)) {
    console.log('possibleColumns is not an array:', possibleColumns)
    return null
  }
  
  for (const column of possibleColumns) {
    const index = headers.findIndex(h => {
      // Saltar headers vacíos
      if (!h || h === '') {
        return false
      }
      
      const headerLower = h.toLowerCase()
      const columnLower = column.toLowerCase()
      
      console.log(`Comparing "${headerLower}" with "${columnLower}"`)
      
      // Coincidencia exacta
      if (headerLower === columnLower) {
        console.log(`Exact match found!`)
        return true
      }
      
      // Coincidencia parcial más estricta
      if (headerLower.includes(columnLower) || columnLower.includes(headerLower)) {
        // Verificar que no sea una coincidencia muy débil
        const similarity = calculateSimilarity(headerLower, columnLower)
        console.log(`Partial match similarity: ${similarity}`)
        return similarity > 0.6
      }
      
      return false
    })
    
    console.log(`Index found for "${column}": ${index}`)
    
    if (index !== -1) {
      const cellValue = row[index]
      // Verificar que la celda no esté vacía o sea solo espacios
      const isEmpty = cellValue === '' || cellValue === null || cellValue === undefined || 
                     (typeof cellValue === 'string' && cellValue.trim() === '')
      
      if (!isEmpty) {
        console.log(`Found match: "${headers[index]}" -> "${column}" = "${cellValue}" (index: ${index})`)
        return cellValue
      } else {
        console.log(`Found column "${column}" but cell is empty: "${cellValue}" (index: ${index})`)
        return null // Retornar null para celdas vacías
      }
    }
  }
  console.log(`No match found for any column`)
  return null
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

function parseDate(value: any): string {
  console.log('Parsing date value:', value, 'Type:', typeof value)
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }
  
  if (typeof value === 'string') {
    // NO limpiar espacios - mantener valor exacto
    
    // Intentar diferentes formatos de fecha
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // D/M/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/, // D-M-YYYY
    ]
    
    for (const format of formats) {
      if (format.test(value)) {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          console.log('Parsed date:', date.toISOString().split('T')[0])
          return date.toISOString().split('T')[0]
        }
      }
    }
    
    // Intentar parseo directo
    const directDate = new Date(value)
    if (!isNaN(directDate.getTime())) {
      console.log('Direct parsed date:', directDate.toISOString().split('T')[0])
      return directDate.toISOString().split('T')[0]
    }
  }
  
  // Si es un número (días desde 1900 en Excel)
  if (typeof value === 'number' && value > 0) {
    // Excel cuenta desde 1900-01-01, pero hay un bug conocido donde 1900 se considera año bisiesto
    // Además, Excel cuenta desde el día 1, no desde el día 0
    // Para corregir esto, necesitamos ajustar el cálculo
    
    // Excel serial date: 1 = 1900-01-01, pero en realidad debería ser 1900-01-01
    // El problema es que Excel trata 1900 como año bisiesto cuando no lo es
    let days = Math.floor(value)
    
    // Ajuste para el bug del año 1900 en Excel
    if (days > 59) {
      days = days - 1 // Compensar el día extra que Excel agrega incorrectamente
    }
    
    // Crear fecha desde 1900-01-01
    const excelEpoch = new Date(1900, 0, 1) // 1900-01-01
    const date = new Date(excelEpoch.getTime() + (days - 1) * 24 * 60 * 60 * 1000)
    
    console.log('Excel number date:', value, '->', date.toISOString().split('T')[0])
    return date.toISOString().split('T')[0]
  }
  
  console.log('Using current date as fallback')
  return new Date().toISOString().split('T')[0]
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value
  
  if (typeof value === 'string') {
    // Verificar si la cadena está vacía
    if (value === '') {
      return 0 // Retornar 0 para celdas vacías
    }
    
    // Remover caracteres no numéricos excepto punto y coma
    const cleaned = value.replace(/[^\d.,-]/g, '')
    // Reemplazar coma por punto para decimales
    const normalized = cleaned.replace(',', '.')
    return parseFloat(normalized) || 0
  }
  
  // Para valores null, undefined, etc.
  return 0
}

function getDateRange(rows: any[]): { from: string, to: string } {
  if (rows.length === 0) return { from: '', to: '' }
  
  const dates = rows.map(row => row.fecha).filter(Boolean).sort()
  return {
    from: dates[0] || '',
    to: dates[dates.length - 1] || ''
  }
}

function getUniqueValues(rows: any[], type: string): Record<string, number> {
  const uniqueValues: Record<string, number> = {}
  
  if (type === 'payroll') {
    const proveedores = new Set(rows.map(row => row.proveedor))
    uniqueValues['Proveedores únicos'] = proveedores.size
  } else if (type === 'expenses') {
    const clientes = new Set(rows.map(row => row.cliente))
    uniqueValues['Clientes únicos'] = clientes.size
  }
  
  // Agregar información de años y meses únicos
  const years = new Set(rows.map(row => row.year))
  const months = new Set(rows.map(row => row.mes))
  uniqueValues['Años únicos'] = years.size
  uniqueValues['Meses únicos'] = months.size
  
  return uniqueValues
}

function extractDatesFromData(dataRows: any[][], headers: string[], columnMapping: any): string[] {
  const dates: string[] = []
  
  for (const row of dataRows) {
    for (const [, excelColumns] of Object.entries(columnMapping)) {
      if ((excelColumns as any).type === 'date') {
        let value
        if ((excelColumns as any).position !== undefined) {
          // Para transfers, expenses y payroll, usar posición específica
          value = findValueByPosition(row, (excelColumns as any).position)
        } else {
          // Para otros tipos, usar búsqueda por nombre
          value = findValueInRow(row, headers, (excelColumns as any).columns)
        }
        
        if (value !== null) {
          const dateStr = parseDate(value)
          // Solo agregar fechas válidas y no vacías
          if (dateStr && dateStr !== '' && !isNaN(new Date(dateStr).getTime()) && !dates.includes(dateStr)) {
            dates.push(dateStr)
          }
        }
      }
    }
  }
  
  return dates
}

function getMonthName(monthIndex: number): string {
  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ]
  return months[monthIndex]
}
