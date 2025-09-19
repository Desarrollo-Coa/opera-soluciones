// =====================================================
// SGI Opera Soluciones - Admin Initialization API
// API de inicialización del administrador
// =====================================================
// Description: Endpoint to initialize admin user
// Descripción: Endpoint para inicializar usuario administrador
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { NextResponse } from "next/server"
import { initializeAdminUser, checkAdminUserExists } from "@/lib/init-admin"

export async function POST() {
  try {
    console.log('🔍 Checking admin user initialization...')
    
    // Check if admin user already exists
    const adminExists = await checkAdminUserExists()
    
    if (adminExists) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        adminExists: true
      })
    }
    
    // Initialize admin user
    await initializeAdminUser()
    
    return NextResponse.json({
      success: true,
      message: 'Admin user initialized successfully',
      adminExists: true
    })
    
  } catch (error) {
    console.error('Error in admin initialization API:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error initializing admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const adminExists = await checkAdminUserExists()
    
    return NextResponse.json({
      success: true,
      adminExists,
      message: adminExists ? 'Admin user exists' : 'Admin user does not exist'
    })
    
  } catch (error) {
    console.error('Error checking admin user:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error checking admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
