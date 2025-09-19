// =====================================================
// SGI Opera Soluciones - Profile Picture Upload API
// API para subir fotos de perfil
// =====================================================
// Description: Handle profile picture uploads
// Descripción: Manejar subidas de fotos de perfil
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES } from "@/lib/constants"
import { uploadToSpaces, deleteFromSpaces, extractKeyFromUrl } from "@/lib/digitalocean-spaces"
import { generateSimpleFileName, isValidFileType, isValidFileSize } from "@/lib/file-utils"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }, { status: 401 })
    }

    // Verify token
    const payload = await verifyToken(token)

    // Get form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ 
        error: "No se proporcionó ningún archivo" 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["jpeg", "jpg", "png", "webp"]
    if (!isValidFileType(file.name, allowedTypes)) {
      return NextResponse.json({ 
        error: "Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP" 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (!isValidFileSize(file.size, 5)) {
      return NextResponse.json({ 
        error: "El archivo es demasiado grande. Máximo 5MB" 
      }, { status: 400 })
    }

    // Generate simple unique filename using UUID
    const fileName = generateSimpleFileName(file.name)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to DigitalOcean Spaces
    const uploadResult = await uploadToSpaces(
      buffer,
      fileName,
      file.type,
      'profile-pictures'
    )

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      message: "Foto de perfil subida exitosamente"
    })

  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}

/**
 * Delete profile picture
 * Eliminar foto de perfil
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }, { status: 401 })
    }

    // Verify token
    const payload = await verifyToken(token)

    // Get URL from query params
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: "URL de imagen requerida" 
      }, { status: 400 })
    }

    // Extract key from URL
    const key = extractKeyFromUrl(imageUrl)
    if (!key) {
      return NextResponse.json({ 
        error: "URL de imagen inválida" 
      }, { status: 400 })
    }

    // Delete from DigitalOcean Spaces
    await deleteFromSpaces(key)

    return NextResponse.json({
      success: true,
      message: "Foto de perfil eliminada exitosamente"
    })

  } catch (error) {
    console.error("Error deleting profile picture:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}
