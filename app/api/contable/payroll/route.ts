import { NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth/token-verifier"
import { executeQuery } from "@/lib/database"

// GET - Obtener datos de nómina por año y mes
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
    console.log(`Fetching payroll data for year: ${year}, mes: ${mes}`)
    
    const rows = await executeQuery(
      `SELECT id, year, mes, fecha, proveedor, pago, objeto, valor_neto, iva, retencion, total, nit, numero_factura, obra 
       FROM payroll_mes_a_mes 
       WHERE year = ? AND mes = ? 
       ORDER BY fecha DESC, id DESC`,
      [parseInt(year), mes]
    )

    console.log(`Found ${(rows as any[]).length} payroll records`)
    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error("Error fetching payroll data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Crear o actualizar datos de nómina
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
          row.proveedor === undefined || row.proveedor === null ||
          row.objeto === undefined || row.objeto === null ||
          row.nit === undefined || row.nit === null ||
          row.numero_factura === undefined || row.numero_factura === null ||
          row.obra === undefined || row.obra === null) {
        console.log("Validation error - missing required fields:", {
          year: row.year,
          mes: row.mes,
          fecha: row.fecha,
          proveedor: row.proveedor,
          objeto: row.objeto,
          nit: row.nit,
          numero_factura: row.numero_factura,
          obra: row.obra
        })
        
        // Crear mensaje específico sobre qué campos faltan
        const missingFields = []
        if (!row.year) missingFields.push("año")
        if (!row.mes) missingFields.push("mes")
        if (!row.fecha) missingFields.push("fecha")
        if (row.proveedor === undefined || row.proveedor === null) missingFields.push("proveedor")
        if (row.objeto === undefined || row.objeto === null) missingFields.push("objeto")
        if (row.nit === undefined || row.nit === null) missingFields.push("NIT")
        if (row.numero_factura === undefined || row.numero_factura === null) missingFields.push("número de factura")
        if (row.obra === undefined || row.obra === null) missingFields.push("obra")
        
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
      const pago = Number(row.pago) || 0
      const valor_neto = Number(row.valor_neto) || 0
      const iva = Number(row.iva) || 0
      const retencion = Number(row.retencion) || 0
      const total = Number(row.total) || 0

      if (row.isNew) {
        // Insertar nueva fila
        const result = await executeQuery(
          `INSERT INTO payroll_mes_a_mes 
           (year, mes, fecha, proveedor, pago, objeto, valor_neto, iva, retencion, total, nit, numero_factura, obra, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.year,
            row.mes,
            row.fecha,
            row.proveedor,
            pago,
            row.objeto,
            valor_neto,
            iva,
            retencion,
            total,
            row.nit,
            row.numero_factura,
            row.obra,
            userId
          ]
        )
        results.push({ id: (result as any).insertId, ...row })
      } else if (row.id) {
        // Actualizar fila existente
        await executeQuery(
          `UPDATE payroll_mes_a_mes 
           SET fecha = ?, proveedor = ?, pago = ?, objeto = ?, valor_neto = ?, iva = ?, retencion = ?, total = ?, nit = ?, numero_factura = ?, obra = ?, updated_by = ?
           WHERE id = ?`,
          [
            row.fecha,
            row.proveedor,
            pago,
            row.objeto,
            valor_neto,
            iva,
            retencion,
            total,
            row.nit,
            row.numero_factura,
            row.obra,
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
    console.error("Error saving payroll data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar registro de nómina
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
      "DELETE FROM payroll_mes_a_mes WHERE id = ?",
      [parseInt(id)]
    )

    return NextResponse.json({ 
      success: true,
      message: "Registro eliminado correctamente"
    })
  } catch (error) {
    console.error("Error deleting payroll data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}