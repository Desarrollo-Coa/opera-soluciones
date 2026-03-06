// =====================================================
// SGI Opera Soluciones - Reference: Document Types API
// Tipos de documento - API
// =====================================================
// GET: Lista los tipos de documento
// =====================================================

import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const rows = await executeQuery(
      "SELECT TD_IDTIPO_DOCUMENTO_PK as id, TD_NOMBRE as name, TD_DESCRIPCION as description, TD_ACTIVO as is_active FROM OS_TIPOS_DOCUMENTO WHERE TD_ACTIVO = 1 ORDER BY TD_NOMBRE"
    )

    return NextResponse.json({
      success: true,
      document_types: rows,
    })
  } catch (error) {
    console.error("Error fetching document types:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


