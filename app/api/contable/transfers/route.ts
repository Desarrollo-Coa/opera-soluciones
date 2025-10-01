import { NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth/token-verifier"
import { executeQuery } from "@/lib/database"

// GET - Obtener datos de transferencias por año y mes
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
    console.log(`Fetching transfers data for year: ${year}, mes: ${mes}`)
    
    const rows = await executeQuery(
      `SELECT id, year, mes, fecha, actividad, sale, entra, concepto 
       FROM transferencias_pagos 
       WHERE year = ? AND mes = ? 
       ORDER BY fecha DESC, id DESC`,
      [parseInt(year), mes]
    )

    console.log(`Found ${(rows as any[]).length} transfer records`)
    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error("Error fetching transfers data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST - Crear o actualizar datos de transferencias
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
      if (row.isNew) {
        // Insertar nueva fila
        const result = await executeQuery(
          `INSERT INTO transferencias_pagos 
           (year, mes, fecha, actividad, sale, entra, concepto, created_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.year,
            row.mes,
            row.fecha,
            row.actividad,
            row.sale,
            row.entra,
            row.concepto,
            userId
          ]
        )
        results.push({ id: (result as any).insertId, ...row })
      } else if (row.id) {
        // Actualizar fila existente
        await executeQuery(
          `UPDATE transferencias_pagos 
           SET fecha = ?, actividad = ?, sale = ?, entra = ?, concepto = ?, updated_by = ?
           WHERE id = ?`,
          [
            row.fecha,
            row.actividad,
            row.sale,
            row.entra,
            row.concepto,
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
    console.error("Error saving transfers data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar registro de transferencias
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
      "DELETE FROM transferencias_pagos WHERE id = ?",
      [parseInt(id)]
    )

    return NextResponse.json({ 
      success: true,
      message: "Registro eliminado correctamente"
    })
  } catch (error) {
    console.error("Error deleting transfers data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
