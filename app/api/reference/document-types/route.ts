// =====================================================
// SGI Opera Soluciones - Reference: Document Types API
// Tipos de documento - API
// =====================================================
// GET: Lista los tipos de documento
// =====================================================

import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET() {
  try {
    const rows = await executeQuery(
      "SELECT id, name, description, is_active FROM document_types WHERE is_active = 1 ORDER BY name"
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


