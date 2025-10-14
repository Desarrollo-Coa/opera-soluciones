import { NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth/token-verifier"
import { executeQuery } from "@/lib/database"

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
      `SELECT id, year, mes, numero_facturacion, fecha, cliente, servicio, nit, valor, iva, total 
       FROM libro_gastos_facturacion 
       WHERE year = ? AND mes = ? 
       ORDER BY fecha DESC, id DESC`,
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
          `INSERT INTO libro_gastos_facturacion 
           (year, mes, numero_facturacion, fecha, cliente, servicio, nit, valor, iva, total, created_by) 
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
          `UPDATE libro_gastos_facturacion 
           SET numero_facturacion = ?, fecha = ?, cliente = ?, servicio = ?, nit = ?, valor = ?, iva = ?, total = ?, updated_by = ?
           WHERE id = ?`,
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
      "DELETE FROM libro_gastos_facturacion WHERE id = ?",
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