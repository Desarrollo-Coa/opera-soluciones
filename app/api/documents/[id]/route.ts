// =====================================================
// SGI Opera Soluciones - Documents API (Delete)
// API de Documentos (Eliminar)
// =====================================================

import { NextResponse, type NextRequest } from "next/server"
import { executeQuery } from "@/lib/db"
import { deleteFromSpaces, extractKeyFromUrl } from "@/lib/digitalocean-spaces"

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Fetch file URL
    const rows = await executeQuery("SELECT DO_URL_ARCHIVO as file_url FROM OS_DOCUMENTOS WHERE DO_IDDOCUMENTO_PK = ? AND DO_FECHA_ELIMINACION IS NULL", [id]) as any[]
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    const fileUrl: string = rows[0].file_url
    const key = extractKeyFromUrl(fileUrl)

    // Soft delete in DB
    await executeQuery("UPDATE OS_DOCUMENTOS SET DO_FECHA_ELIMINACION = NOW(), DO_ELIMINADO_POR = ? WHERE DO_IDDOCUMENTO_PK = ?", [1, id])

    // Delete from Spaces if we could extract key
    if (key) {
      await deleteFromSpaces(key)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}


