// =====================================================
// SGI Opera Soluciones - Documents API (Create/List)
// API de Documentos (Crear/Listar)
// =====================================================

import { NextResponse, type NextRequest } from "next/server"
import { executeQuery } from "@/lib/database"
import { uploadToSpaces, extractKeyFromUrl, deleteFromSpaces } from "@/lib/digitalocean-spaces"
import { generateSimpleFileName } from "@/lib/file-utils"

// GET: Lista documentos por empleado (?employeeId=)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId es requerido' }, { status: 400 })
    }

    const rows = await executeQuery(
      `SELECT d.id, d.document_name, d.file_url, dt.name AS document_type_name, d.uploaded_at, d.description
       FROM documents d
       LEFT JOIN document_types dt ON dt.id = d.document_type_id
       WHERE d.user_id = ? AND d.deleted_at IS NULL
       ORDER BY d.uploaded_at DESC`,
      [employeeId]
    )

    return NextResponse.json({ success: true, documents: rows })

  } catch (error) {
    console.error('Error listing documents:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST: Crea documento (FormData con file)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const employeeId = formData.get('employee_id') as string
    const documentName = formData.get('document_name') as string
    const documentTypeId = formData.get('document_type_id') as string
    const description = (formData.get('description') as string) || ''
    const file = formData.get('file') as File | null

    if (!employeeId || !documentName || !documentTypeId || !file) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generar nombre único simple con UUID
    const uniqueFileName = generateSimpleFileName(file.name);
    
    const upload = await uploadToSpaces(
      buffer,
      uniqueFileName,
      file.type || 'application/octet-stream',
      'documents'
    )

    await executeQuery(
      `INSERT INTO documents (user_id, document_name, file_url, document_type_id, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeId, documentName, upload.url, parseInt(documentTypeId), description, 1]
    )

    return NextResponse.json({ success: true, url: upload.url })

  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}


