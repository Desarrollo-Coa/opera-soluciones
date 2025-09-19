// =====================================================
// SGI Opera Soluciones - Admin User Initialization
// Inicialización del usuario administrador
// =====================================================
// Description: Creates admin user on server startup if it doesn't exist
// Descripción: Crea usuario administrador al iniciar el servidor si no existe
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { getUserByEmailWithStatus, createUser } from "@/database/users"
import { hashPassword } from "@/lib/auth"

let adminInitialized = false
let adminInitializationInProgress = false

/**
 * Initialize admin user on server startup
 * Inicializar usuario administrador al arrancar el servidor
 */
export async function initializeAdminUser(): Promise<void> {
  // Prevent multiple initializations
  if (adminInitialized || adminInitializationInProgress) {
    console.log('⏳ Admin initialization already in progress or completed')
    return
  }

  try {
    adminInitializationInProgress = true
    console.log('🔍 Checking for admin user...')
    
    // Check if admin user exists
    const adminUser = await getUserByEmailWithStatus('juanmanuel@operasoluciones.com')
    
    if (!adminUser) {
      console.log('👤 Creating initial admin user...')
      
      // Get the correct role and contract status IDs from database
      const { executeQuery } = await import('@/lib/database')
      
      // Get ADMIN role ID
      const adminRoleResult = await executeQuery(`
        SELECT id FROM user_roles WHERE code = 'ADMIN' LIMIT 1
      `) as any[]
      
      if (adminRoleResult.length === 0) {
        console.error('❌ ADMIN role not found in database')
        return
      }
      
      // Get ACTIVE contract status ID
      const activeStatusResult = await executeQuery(`
        SELECT id FROM contract_statuses WHERE name = 'Activo' LIMIT 1
      `) as any[]
      
      if (activeStatusResult.length === 0) {
        console.error('❌ ACTIVE contract status not found in database')
        return
      }
      
      const adminRoleId = adminRoleResult[0].id
      const activeStatusId = activeStatusResult[0].id
      
      // Create admin user with all optional fields as null
      const adminPassword = await hashPassword('admin123')
      await createUser({
        first_name: 'Juan Manuel',
        last_name: 'Administrador',
        email: 'juanmanuel@operasoluciones.com',
        password: adminPassword,
        role_id: adminRoleId,
        contract_status_id: activeStatusId,
        created_by: 1, // Use 1 as initial created_by
        
        // All optional fields set to null/undefined
        document_type: undefined,
        document_number: undefined,
        birth_date: undefined,
        gender: undefined,
        marital_status: undefined,
        emergency_contact_name: undefined,
        emergency_contact_phone: undefined,
        phone: undefined,
        address: undefined,
        position: undefined,
        salary: undefined,
        hire_date: undefined,
        termination_date: undefined,
        work_schedule: undefined,
        department: undefined,
        manager_id: undefined,
        employment_type: undefined,
        eps_id: undefined,
        arl_id: undefined,
        pension_fund_id: undefined,
        compensation_fund_id: undefined,
        bank_name: undefined,
        account_number: undefined,
        account_type: undefined,
        profile_picture: undefined,
        notes: undefined,
        is_active: true
      })
      
      console.log('✅ Admin user created successfully')
      console.log('📧 Email: juanmanuel@operasoluciones.com')
      console.log('🔑 Password: admin123')
    } else {
      console.log('✅ Admin user already exists')
    }
    
    adminInitialized = true
  } catch (error) {
    console.error('❌ Error initializing admin user:', error)
    // Reset the flag on error so it can be retried
    adminInitializationInProgress = false
    throw error
  } finally {
    adminInitializationInProgress = false
  }
}

/**
 * Check if admin user exists
 * Verificar si existe usuario administrador
 */
export async function checkAdminUserExists(): Promise<boolean> {
  try {
    // If admin is already initialized, return true
    if (adminInitialized) {
      return true
    }
    
    // If initialization is in progress, wait a bit and check again
    if (adminInitializationInProgress) {
      console.log('⏳ Admin initialization in progress, waiting...')
      // Wait a bit and check if it's completed
      await new Promise(resolve => setTimeout(resolve, 1000))
      return adminInitialized
    }
    
    const adminUser = await getUserByEmailWithStatus('juanmanuel@operasoluciones.com')
    return !!adminUser
  } catch (error) {
    console.error('Error checking admin user:', error)
    return false
  }
}
