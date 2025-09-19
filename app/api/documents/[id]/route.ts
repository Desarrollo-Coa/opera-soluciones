// =====================================================
// SGI Opera Soluciones - Documents API (Delete)
// API de Documentos (Eliminar)
// =====================================================

import { NextResponse, type NextRequest } from "next/server"
import { executeQuery } from "@/lib/database"
import { deleteFromSpaces, extractKeyFromUrl } from "@/lib/digitalocean-spaces"

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Fetch file URL
    const rows = await executeQuery("SELECT file_url FROM documents WHERE id = ? AND deleted_at IS NULL", [id])
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    const fileUrl: string = rows[0].file_url
    const key = extractKeyFromUrl(fileUrl)

    // Soft delete in DB
    await executeQuery("UPDATE documents SET deleted_at = NOW(), deleted_by = ? WHERE id = ?", [1, id])

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


