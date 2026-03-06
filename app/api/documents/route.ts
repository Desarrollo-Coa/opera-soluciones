// =====================================================
// SGI Opera Soluciones - Documents API (Create/List)
// API de Documentos (Crear/Listar)
// =====================================================

import { NextResponse, type NextRequest } from "next/server"
import { executeQuery } from "@/lib/db"
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
      `SELECT d.DO_IDDOCUMENTO_PK as id, d.DO_NOMBRE as document_name, d.DO_URL_ARCHIVO as file_url, 
              dt.TD_NOMBRE AS document_type_name, d.DO_FECHA_SUBIDA as uploaded_at, d.DO_DESCRIPCION as description
       FROM OS_DOCUMENTOS d
       LEFT JOIN OS_TIPOS_DOCUMENTO dt ON dt.TD_IDTIPO_DOCUMENTO_PK = d.TD_IDTIPO_DOCUMENTO_FK
       WHERE d.US_IDUSUARIO_FK = ? AND d.DO_FECHA_ELIMINACION IS NULL
       ORDER BY d.DO_FECHA_SUBIDA DESC`,
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
      `INSERT INTO OS_DOCUMENTOS (US_IDUSUARIO_FK, DO_NOMBRE, DO_URL_ARCHIVO, TD_IDTIPO_DOCUMENTO_FK, DO_DESCRIPCION, DO_CREADO_POR)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeId, documentName, upload.url, parseInt(documentTypeId), description, 1]
    )

    return NextResponse.json({ success: true, url: upload.url })

  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}


