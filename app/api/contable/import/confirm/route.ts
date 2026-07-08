import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth/token-verifier'
import { executeQuery } from '@/lib/db'

function getMonthName(monthIndex: number): string {
  const months = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ]
  return months[monthIndex]
}

export async function POST(request: NextRequest) {
  try {
    console.log('Confirm import API called')
    
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      console.log('No token found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await verifyTokenEdge(token)
    if (!user) {
      console.log('Token verification failed')
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { data, type } = await request.json()
    console.log('Received data:', { 
      dataLength: data?.length, 
      type, 
      firstRow: data?.[0],
      firstRowKeys: data?.[0] ? Object.keys(data[0]) : 'No data'
    })

    if (!data || !type) {
      console.log('Missing required parameters')
      return NextResponse.json({ 
        error: 'Faltan parámetros requeridos: data, type' 
      }, { status: 400 })
    }

    // Determinar tabla según el tipo
    const tableName = getTableName(type)
    console.log('Table name for type', type, ':', tableName)
    
    if (!tableName) {
      console.log('Invalid module type:', type)
      return NextResponse.json({ 
        error: 'Tipo de módulo no válido' 
      }, { status: 400 })
    }

    // Filtrar datos válidos (sin campos requeridos vacíos)
    const validData = data.filter((row: any) => {
      // Para transfers, verificar solo campos realmente requeridos
      if (type === 'bancos' || type === 'transfers') {
        // Solo fecha es realmente requerido para bancos/transfers
        // actividad y concepto pueden estar vacíos si no hay datos
        return row.fecha && row.fecha !== '' && row.fecha !== null
      }
      // Para otros tipos, mantener la lógica actual
      return true
    })

    // Asegurar que los campos year y mes estén presentes para bancos/transfers
    if (type === 'bancos' || type === 'transfers') {
      validData.forEach((row: any) => {
        if (row.fecha && !row.year) {
          // Extraer año y mes de la fecha
          const date = new Date(row.fecha)
          if (!isNaN(date.getTime())) {
            row.year = date.getFullYear()
            row.mes = getMonthName(date.getMonth())
            console.log(`Added year=${row.year}, mes=${row.mes} for date ${row.fecha}`)
          }
        }
      })
    }
    
    console.log('Valid data after filtering:', {
      originalLength: data.length,
      validLength: validData.length,
      filteredOut: data.length - validData.length
    })
    
    // Log de algunos registros filtrados para debugging
    if (data.length > 0 && validData.length === 0) {
      console.log('Sample filtered out rows (first 3):')
      data.slice(0, 3).forEach((row: any, index: number) => {
        console.log(`Row ${index + 1}:`, {
          fecha: row.fecha,
          actividad: row.actividad,
          concepto: row.concepto,
          sale: row.sale,
          entra: row.entra,
          saldo: row.saldo
        })
      })
    }

    if (validData.length === 0) {
      console.log('No valid data to insert')
      return NextResponse.json({ 
        error: 'No hay datos válidos para importar' 
      }, { status: 400 })
    }

    // Insertar datos en lotes
    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize)
      console.log(`Processing batch ${i}-${i + batch.length} of ${validData.length}`)
      
      // Preparar valores para inserción
      const rawColumns = Object.keys(validData[0])
      
      const colMap = getColumnMapping(tableName) || {};
      // Mapear columnas usando el diccionario
      const dbColumns = rawColumns.map(k => colMap[k] || k)
      
      // Agregar columnas de auditoría
      dbColumns.push(colMap['created_by'] || 'created_by')
      dbColumns.push(colMap['created_at'] || 'created_at')

      const placeholdersPerRow = Array(dbColumns.length).fill('?').join(', ')
      const values = batch.map(() => `(${placeholdersPerRow})`).join(', ')

      // Construir query de inserción
      const insertQuery = `
        INSERT INTO ${tableName} (${dbColumns.join(', ')})
        VALUES ${values}
      `

      // Preparar todos los valores para la query
      const allValues = batch.flatMap((row: any) => 
        Object.values(row).concat([user.id, new Date()])
      )

      console.log('Insert query:', insertQuery)
      console.log('Columns count:', dbColumns.length)

      try {
        await executeQuery(insertQuery, allValues)
        insertedCount += batch.length
        console.log(`Successfully inserted batch ${i}-${i + batch.length}`)
      } catch (error) {
        console.error(`Error insertando lote ${i}-${i + batch.length}:`, error)
        console.error('Batch data:', batch)
        throw error
      }
    }

    return NextResponse.json({ 
      success: true, 
      insertedCount,
      message: `${insertedCount} registros importados correctamente`
    })

  } catch (error) {
    console.error('Error en confirmación de importación:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor al importar datos' 
    }, { status: 500 })
  }
}

function getTableName(type: string): string | null {
  const tableMapping: Record<string, string> = {
    'gastos': 'os_gastos_mes',
    'facturacion': 'os_facturacion',
    'bancos': 'os_transferencias',
    'payroll': 'os_gastos_mes',
    'expenses': 'os_gastos_mes',
    'transfers': 'os_transferencias'
  }
  
  console.log('Mapping type', type, 'to table:', tableMapping[type])
  return tableMapping[type] || null
}

function getColumnMapping(tableName: string): Record<string, string> {
  const mapping: Record<string, Record<string, string>> = {
    'os_transferencias': {
      'fecha': 'TR_FECHA',
      'year': 'TR_ANIO',
      'mes': 'TR_MES',
      'actividad': 'TR_ACTIVIDAD',
      'sale': 'TR_SALE',
      'entra': 'TR_ENTRA',
      'saldo': 'TR_SALDO',
      'concepto': 'TR_CONCEPTO',
      'created_by': 'TR_CREADO_POR',
      'created_at': 'TR_FECHA_CREACION'
    },
    'os_gastos_mes': {
      'fecha': 'GM_FECHA',
      'year': 'GM_ANIO',
      'mes': 'GM_MES',
      'proveedor': 'GM_PROVEEDOR',
      'pago': 'GM_PAGO',
      'objeto': 'GM_OBJETO',
      'valorNeto': 'GM_VALOR_NETO',
      'valor_neto': 'GM_VALOR_NETO',
      'iva': 'GM_IVA',
      'retencion': 'GM_RETENCION',
      'total': 'GM_TOTAL',
      'nit': 'GM_NIT',
      'numeroFactura': 'GM_NUMERO_FACTURA',
      'numero_factura': 'GM_NUMERO_FACTURA',
      'obra': 'GM_OBRA',
      'created_by': 'GM_CREADO_POR',
      'created_at': 'GM_FECHA_CREACION'
    },
    'os_facturacion': {
      'fecha': 'FA_FECHA',
      'year': 'FA_ANIO',
      'mes': 'FA_MES',
      'numeroFactura': 'FA_NUMERO_FACTURACION',
      'numero_facturacion': 'FA_NUMERO_FACTURACION',
      'cliente': 'FA_CLIENTE',
      'servicio': 'FA_SERVICIO',
      'nit': 'FA_NIT',
      'valor': 'FA_VALOR',
      'iva': 'FA_IVA',
      'total': 'FA_TOTAL',
      'created_by': 'FA_CREADO_POR',
      'created_at': 'FA_FECHA_CREACION'
    }
  };
  return mapping[tableName] || {};
}
