import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth/token-verifier'
import { executeQuery } from '@/lib/database'

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
      const columns = Object.keys(validData[0])
      console.log('Available columns in first row:', columns)
      console.log('First row data:', validData[0])
      
      // Generar placeholders para todas las columnas: datos + created_by + created_at
      const placeholdersPerRow = Array(columns.length + 2).fill('?').join(', ')
      const values = batch.map(() => `(${placeholdersPerRow})`).join(', ')

      // Construir query de inserción
      const insertQuery = `
        INSERT INTO ${tableName} (${columns.join(', ')}, created_by, created_at)
        VALUES ${values}
      `

      // Preparar todos los valores para la query
      const allValues = batch.flatMap((row: any) => 
        Object.values(row).concat([user.id, new Date()])
      )

      console.log('Insert query:', insertQuery)
      console.log('Columns count:', columns.length)
      console.log('Placeholders per row:', placeholdersPerRow)
      console.log('Total placeholders:', placeholdersPerRow.split(',').length)
      console.log('Values count:', allValues.length)
      console.log('Expected values count:', batch.length * (columns.length + 2))

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
    'payroll': 'payroll_mes_a_mes',
    'expenses': 'libro_gastos_facturacion',
    'transfers': 'transferencias_pagos',
    // Mapeo desde el frontend
    'gastos': 'payroll_mes_a_mes',
    'facturacion': 'libro_gastos_facturacion',
    'bancos': 'transferencias_pagos'
  }
  
  console.log('Mapping type', type, 'to table:', tableMapping[type])
  return tableMapping[type] || null
}
