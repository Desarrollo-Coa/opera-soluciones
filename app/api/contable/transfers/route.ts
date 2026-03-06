import { NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth/token-verifier"
import { executeQuery } from "@/lib/db"

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
      `SELECT 
         TR_IDTRANSFERENCIA_PK as id, 
         TR_ANIO as year, 
         TR_MES as mes, 
         TR_FECHA as fecha, 
         TR_ACTIVIDAD as actividad, 
         TR_SALE as sale, 
         TR_ENTRA as entra, 
         TR_SALDO as saldo, 
         TR_CONCEPTO as concepto 
       FROM OS_TRANSFERENCIAS 
       WHERE TR_ANIO = ? AND TR_MES = ? 
       ORDER BY TR_FECHA DESC, TR_IDTRANSFERENCIA_PK DESC`,
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
      // Validar datos requeridos (permitir cadenas vacías pero no null/undefined)
      if (!row.year || !row.mes || !row.fecha ||
        row.actividad === undefined || row.actividad === null) {
        console.log("Validation error - missing required fields:", {
          year: row.year,
          mes: row.mes,
          fecha: row.fecha,
          actividad: row.actividad,
          concepto: row.concepto
        })

        // Crear mensaje específico sobre qué campos faltan
        const missingFields = []
        if (!row.year) missingFields.push("año")
        if (!row.mes) missingFields.push("mes")
        if (!row.fecha) missingFields.push("fecha")
        if (row.actividad === undefined || row.actividad === null) missingFields.push("actividad")

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
      const sale = Number(row.sale) || 0
      const entra = Number(row.entra) || 0
      const saldo = Number(row.saldo) || 0

      if (row.isNew) {
        // Insertar nueva fila
        const result = await executeQuery(
          `INSERT INTO OS_TRANSFERENCIAS 
           (TR_ANIO, TR_MES, TR_FECHA, TR_ACTIVIDAD, TR_SALE, TR_ENTRA, TR_SALDO, TR_CONCEPTO, TR_CREADO_POR) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.year,
            row.mes,
            row.fecha,
            row.actividad,
            sale,
            entra,
            saldo,
            row.concepto,
            userId
          ]
        )
        results.push({ id: (result as any).insertId, ...row })
      } else if (row.id) {
        // Actualizar fila existente
        await executeQuery(
          `UPDATE OS_TRANSFERENCIAS 
           SET TR_FECHA = ?, TR_ACTIVIDAD = ?, TR_SALE = ?, TR_ENTRA = ?, TR_SALDO = ?, TR_CONCEPTO = ?, TR_ACTUALIZADO_POR = ?
           WHERE TR_IDTRANSFERENCIA_PK = ?`,
          [
            row.fecha,
            row.actividad,
            sale,
            entra,
            saldo,
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
      "DELETE FROM OS_TRANSFERENCIAS WHERE TR_IDTRANSFERENCIA_PK = ?",
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
