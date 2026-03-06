import { NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth/token-verifier"
import { executeQuery } from "@/lib/db"

// GET - Obtener datos de gastos/facturación por año y mes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const mes = searchParams.get('mes')

    if (!year || !mes) {
      return NextResponse.json(
        { error: "Año y mes son requeridos" },
        { status: 400 }
      )
    }

    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    try {
      await verifyTokenEdge(token)
    } catch (error) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      )
    }

    // Obtener datos de la base de datos
    console.log(`Fetching expenses data for year: ${year}, mes: ${mes}`)

    const rows = await executeQuery(
      `SELECT 
         FA_IDFACTURA_PK as id, 
         FA_ANIO as year, 
         FA_MES as mes, 
         FA_NUMERO_FACTURACION as numero_facturacion, 
         FA_FECHA as fecha, 
         FA_CLIENTE as cliente, 
         FA_SERVICIO as servicio, 
         FA_NIT as nit, 
         FA_VALOR as valor, 
         FA_IVA as iva, 
         FA_TOTAL as total 
       FROM OS_FACTURACION 
       WHERE FA_ANIO = ? AND FA_MES = ? 
       ORDER BY FA_FECHA DESC, FA_IDFACTURA_PK DESC`,
      [parseInt(year), mes]
    )

    console.log(`Found ${(rows as any[]).length} expense records`)
    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error("Error fetching expenses data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Crear o actualizar datos de gastos/facturación
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    let userId: number
    try {
      const payload = await verifyTokenEdge(token)
      userId = payload.id
    } catch (error) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      )
    }

    const { data } = await request.json()

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    const results = []

    for (const row of data) {
      // Validar datos requeridos (permitir cadenas vacías pero no null/undefined)
      if (!row.year || !row.mes || !row.fecha ||
        row.numero_facturacion === undefined || row.numero_facturacion === null ||
        row.cliente === undefined || row.cliente === null ||
        row.servicio === undefined || row.servicio === null ||
        row.nit === undefined || row.nit === null) {
        console.log("Validation error - missing required fields:", {
          year: row.year,
          mes: row.mes,
          fecha: row.fecha,
          numero_facturacion: row.numero_facturacion,
          cliente: row.cliente,
          servicio: row.servicio,
          nit: row.nit
        })

        // Crear mensaje específico sobre qué campos faltan
        const missingFields = []
        if (!row.year) missingFields.push("año")
        if (!row.mes) missingFields.push("mes")
        if (!row.fecha) missingFields.push("fecha")
        if (row.numero_facturacion === undefined || row.numero_facturacion === null) missingFields.push("número de facturación")
        if (row.cliente === undefined || row.cliente === null) missingFields.push("cliente")
        if (row.servicio === undefined || row.servicio === null) missingFields.push("servicio")
        if (row.nit === undefined || row.nit === null) missingFields.push("NIT")

        const errorMessage = `Los siguientes campos son obligatorios: ${missingFields.join(", ")}`

        return NextResponse.json(
          { error: errorMessage },
          { status: 400 }
        )
      }

      // Validar fecha
      const fecha = new Date(row.fecha)
      if (isNaN(fecha.getTime())) {
        console.log("Validation error - invalid date:", row.fecha)
        return NextResponse.json(
          { error: "Fecha inválida. Por favor selecciona una fecha válida." },
          { status: 400 }
        )
      }

      // Validar valores numéricos
      const valor = Number(row.valor) || 0
      const iva = Number(row.iva) || 0
      const total = Number(row.total) || 0

      if (row.isNew) {
        // Insertar nueva fila
        const result = await executeQuery(
          `INSERT INTO OS_FACTURACION 
           (FA_ANIO, FA_MES, FA_NUMERO_FACTURACION, FA_FECHA, FA_CLIENTE, FA_SERVICIO, FA_NIT, FA_VALOR, FA_IVA, FA_TOTAL, FA_CREADO_POR) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.year,
            row.mes,
            row.numero_facturacion,
            row.fecha,
            row.cliente,
            row.servicio,
            row.nit,
            valor,
            iva,
            total,
            userId
          ]
        )
        results.push({ id: (result as any).insertId, ...row })
      } else if (row.id) {
        // Actualizar fila existente
        await executeQuery(
          `UPDATE OS_FACTURACION 
           SET FA_NUMERO_FACTURACION = ?, FA_FECHA = ?, FA_CLIENTE = ?, FA_SERVICIO = ?, FA_NIT = ?, FA_VALOR = ?, FA_IVA = ?, FA_TOTAL = ?, FA_ACTUALIZADO_POR = ?
           WHERE FA_IDFACTURA_PK = ?`,
          [
            row.numero_facturacion,
            row.fecha,
            row.cliente,
            row.servicio,
            row.nit,
            valor,
            iva,
            total,
            userId,
            row.id
          ]
        )
        results.push(row)
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: "Datos guardados correctamente"
    })
  } catch (error) {
    console.error("Error saving expenses data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar registro de gastos/facturación
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    try {
      await verifyTokenEdge(token)
    } catch (error) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      )
    }

    // Eliminar registro
    await executeQuery(
      "DELETE FROM OS_FACTURACION WHERE FA_IDFACTURA_PK = ?",
      [parseInt(id)]
    )

    return NextResponse.json({
      success: true,
      message: "Registro eliminado correctamente"
    })
  } catch (error) {
    console.error("Error deleting expenses data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
