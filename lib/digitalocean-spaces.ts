// =====================================================
// SGI Opera Soluciones - DigitalOcean Spaces Service
// Servicio para DigitalOcean Spaces
// =====================================================
// Description: Service for uploading files to DigitalOcean Spaces
// Descripción: Servicio para subir archivos a DigitalOcean Spaces
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// DigitalOcean Spaces configuration
const spacesClient = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || 'nyc3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
})

const BUCKET_NAME = process.env.DO_SPACES_BUCKET!
const SPACES_URL = `https://${process.env.DO_SPACES_BUCKET}.nyc3.digitaloceanspaces.com`

// Validate required environment variables
if (!process.env.DO_SPACES_ENDPOINT) {
  throw new Error('DO_SPACES_ENDPOINT environment variable is required')
}
if (!process.env.DO_SPACES_KEY) {
  throw new Error('DO_SPACES_KEY environment variable is required')
}
if (!process.env.DO_SPACES_SECRET) {
  throw new Error('DO_SPACES_SECRET environment variable is required')
}
if (!process.env.DO_SPACES_BUCKET) {
  throw new Error('DO_SPACES_BUCKET environment variable is required')
}

export interface UploadResult {
  url: string
  key: string
}

/**
 * Upload file to DigitalOcean Spaces
 * Subir archivo a DigitalOcean Spaces
 */
export async function uploadToSpaces(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'profile-pictures'
): Promise<UploadResult> {
  const key = `${folder}/${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read', // Make the file publicly accessible
  })

  await spacesClient.send(command)

  return {
    url: `${SPACES_URL}/${key}`,
    key: key
  }
}

/**
 * Delete file from DigitalOcean Spaces
 * Eliminar archivo de DigitalOcean Spaces
 */
export async function deleteFromSpaces(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await spacesClient.send(command)
}

/**
 * Generate presigned URL for direct upload
 * Generar URL firmada para subida directa
 */
export async function generatePresignedUrl(
  fileName: string,
  contentType: string,
  folder: string = 'profile-pictures'
): Promise<string> {
  const key = `${folder}/${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  })

  return await getSignedUrl(spacesClient, command, { expiresIn: 3600 }) // 1 hour
}

/**
 * Extract key from DigitalOcean Spaces URL
 * Extraer clave de URL de DigitalOcean Spaces
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Remove leading slash and extract the key
    return pathname.startsWith('/') ? pathname.slice(1) : pathname
  } catch {
    return null
  }
}
