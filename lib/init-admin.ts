// =====================================================
// SGI Opera Soluciones - Admin User Initialization
// Migración 007: tablas OS_ROLES, OS_ESTADOS_CONTRATO, OS_USUARIOS
// =====================================================

import { getUserByEmailWithStatus, createUser } from "@/lib/repositories/users"
import { hashPassword } from "@/lib/auth"

let adminInitialized = false
let adminInitializationInProgress = false

/**
 * Initialize admin user on server startup
 * Migración 007: queries actualizadas a OS_ROLES y OS_ESTADOS_CONTRATO
 */
export async function initializeAdminUser(): Promise<void> {
  if (adminInitialized || adminInitializationInProgress) {
    console.log('⏳ Admin initialization already in progress or completed')
    return
  }

  try {
    adminInitializationInProgress = true
    console.log('🔍 Checking for admin user...')

    const adminUser = await getUserByEmailWithStatus('juanmanuel@operasoluciones.com')

    if (!adminUser) {
      console.log('👤 Creating initial admin user...')

      const { executeQuery } = await import('@/lib/db')

      // Migración 007: OS_ROLES (RO_CODIGO, RO_IDROL_PK)
      const adminRoleResult = await executeQuery(`
        SELECT RO_IDROL_PK as id FROM OS_ROLES WHERE RO_CODIGO = 'ADMIN' LIMIT 1
      `) as any[]

      if (adminRoleResult.length === 0) {
        console.error('❌ ADMIN role not found in database')
        return
      }

      // Migración 007: OS_ESTADOS_CONTRATO (EC_NOMBRE, EC_IDESTADO_CONTRATO_PK)
      const activeStatusResult = await executeQuery(`
        SELECT EC_IDESTADO_CONTRATO_PK as id FROM OS_ESTADOS_CONTRATO WHERE EC_NOMBRE = 'Activo' LIMIT 1
      `) as any[]

      if (activeStatusResult.length === 0) {
        console.error('❌ ACTIVE contract status not found in database')
        return
      }

      const adminRoleId = adminRoleResult[0].id
      const activeStatusId = activeStatusResult[0].id

      const adminPassword = await hashPassword('admin123')

      // Migración 007: CreateUserData usa las nuevas claves de campo
      await createUser({
        US_NOMBRE: 'Juan Manuel',
        US_APELLIDO: 'Administrador',
        US_EMAIL: 'juanmanuel@operasoluciones.com',
        password: adminPassword,
        RO_IDROL_FK: adminRoleId,
        EC_IDESTADO_CONTRATO_FK: activeStatusId,
        US_CREADO_POR: 1,
        US_ACTIVO: true
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
    adminInitializationInProgress = false
    throw error
  } finally {
    adminInitializationInProgress = false
  }
}

/**
 * Check if admin user exists
 */
export async function checkAdminUserExists(): Promise<boolean> {
  try {
    if (adminInitialized) {
      return true
    }

    if (adminInitializationInProgress) {
      console.log('⏳ Admin initialization in progress, waiting...')
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
