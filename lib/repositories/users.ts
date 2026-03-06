import { executeQuery } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { ERROR_MESSAGES } from "@/lib/constants"

// =====================================================
// SGI Opera Soluciones - User Management Functions
// Migración 007: columnas renombradas al estándar OS_
// =====================================================

export interface UserWithRole {
  US_IDUSUARIO_PK: number
  US_NOMBRE: string
  US_APELLIDO: string
  US_EMAIL: string
  US_PASSWORD_HASH: string

  // Información personal y documental
  US_TIPO_DOCUMENTO?: string
  US_NUMERO_DOCUMENTO?: string
  US_FECHA_NACIMIENTO?: Date
  US_GENERO?: string
  US_ESTADO_CIVIL?: string
  US_CONTACTO_EMERGENCIA_NOMBRE?: string
  US_CONTACTO_EMERGENCIA_TELEFONO?: string

  // Información de contacto
  US_TELEFONO?: string
  US_DIRECCION?: string
  DE_IDDEPARTAMENTO_FK?: number
  MU_IDMUNICIPIO_FK?: number

  // Información laboral
  CA_IDCARGO_FK?: number
  position?: string // Alias virtual → CA_NOMBRE
  US_FECHA_CONTRATACION?: Date
  US_FECHA_RETIRO?: Date
  US_HORARIO_TRABAJO?: string
  US_DEPARTAMENTO?: string
  US_IDMANAGER_FK?: number
  US_TIPO_EMPLEO?: string

  // Información de seguridad social (FK texto, no numérico)
  EP_IDEPS_FK?: string
  AR_IDARL_FK?: string
  PE_IDPENSION_FK?: string
  CC_IDCAJA_FK?: string

  // Información bancaria
  US_NOMBRE_BANCO?: string
  US_NUMERO_CUENTA?: string
  US_TIPO_CUENTA?: string

  // Información adicional
  US_FOTO_PERFIL?: string
  US_NOTAS?: string
  US_ACTIVO?: boolean

  // Campos del sistema
  EC_IDESTADO_CONTRATO_FK?: number
  RO_IDROL_FK?: number
  contract_status_name: string
  role_name: string
  role_code: string
  US_FECHA_CREACION: Date
  US_FECHA_ACTUALIZACION?: Date
}

export interface CreateUserData {
  US_NOMBRE: string
  US_APELLIDO: string
  US_EMAIL: string
  password: string // Se hasheará antes de guardar

  // Información personal y documental
  US_TIPO_DOCUMENTO?: string
  US_NUMERO_DOCUMENTO?: string
  US_FECHA_NACIMIENTO?: Date
  US_GENERO?: string
  US_ESTADO_CIVIL?: string
  US_CONTACTO_EMERGENCIA_NOMBRE?: string
  US_CONTACTO_EMERGENCIA_TELEFONO?: string

  // Información de contacto
  US_TELEFONO?: string
  US_DIRECCION?: string

  // Información laboral
  CA_IDCARGO_FK?: number
  US_FECHA_CONTRATACION?: Date
  US_FECHA_RETIRO?: Date
  US_HORARIO_TRABAJO?: string
  US_DEPARTAMENTO?: string
  US_IDMANAGER_FK?: number
  US_TIPO_EMPLEO?: string

  // Información de seguridad social
  EP_IDEPS_FK?: string
  AR_IDARL_FK?: string
  PE_IDPENSION_FK?: string
  CC_IDCAJA_FK?: string

  // Información bancaria
  US_NOMBRE_BANCO?: string
  US_NUMERO_CUENTA?: string
  US_TIPO_CUENTA?: string

  // Información adicional
  US_FOTO_PERFIL?: string
  US_NOTAS?: string
  US_ACTIVO?: boolean

  // Campos del sistema
  RO_IDROL_FK: number
  EC_IDESTADO_CONTRATO_FK: number
  US_CREADO_POR: number
}

export interface UpdateUserData {
  US_NOMBRE?: string
  US_APELLIDO?: string
  US_EMAIL?: string

  // Información personal y documental
  US_TIPO_DOCUMENTO?: string
  US_NUMERO_DOCUMENTO?: string
  US_FECHA_NACIMIENTO?: Date
  US_GENERO?: string
  US_ESTADO_CIVIL?: string
  US_CONTACTO_EMERGENCIA_NOMBRE?: string
  US_CONTACTO_EMERGENCIA_TELEFONO?: string

  // Información de contacto
  US_TELEFONO?: string
  US_DIRECCION?: string

  // Información laboral
  CA_IDCARGO_FK?: number
  US_FECHA_CONTRATACION?: Date
  US_FECHA_RETIRO?: Date
  US_HORARIO_TRABAJO?: string
  US_DEPARTAMENTO?: string
  US_IDMANAGER_FK?: number
  US_TIPO_EMPLEO?: string

  // Información de seguridad social
  EP_IDEPS_FK?: string
  AR_IDARL_FK?: string
  PE_IDPENSION_FK?: string
  CC_IDCAJA_FK?: string

  // Información bancaria
  US_NOMBRE_BANCO?: string
  US_NUMERO_CUENTA?: string
  US_TIPO_CUENTA?: string

  // Información adicional
  US_FOTO_PERFIL?: string
  US_NOTAS?: string
  US_ACTIVO?: boolean

  // Campos del sistema
  RO_IDROL_FK?: number
  EC_IDESTADO_CONTRATO_FK?: number
  US_ACTUALIZADO_POR?: number
}

/**
 * Obtener usuario por email con información de rol
 */
export async function getUserByEmailWithStatus(email: string): Promise<UserWithRole | null> {
  try {
    const users = await executeQuery(`
      SELECT u.*, 
             COALESCE(cs.EC_NOMBRE, 'Activo') as contract_status_name, 
             ur.RO_NOMBRE as role_name, 
             ur.RO_CODIGO as role_code 
      FROM OS_USUARIOS u 
      LEFT JOIN OS_ESTADOS_CONTRATO cs ON u.EC_IDESTADO_CONTRATO_FK = cs.EC_IDESTADO_CONTRATO_PK 
      LEFT JOIN OS_ROLES ur ON u.RO_IDROL_FK = ur.RO_IDROL_PK 
      WHERE u.US_EMAIL = ? AND u.US_FECHA_ELIMINACION IS NULL
    `, [email]) as UserWithRole[]

    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Crear nuevo usuario con rol y estado de contrato
 */
export async function createUser(userData: CreateUserData): Promise<number> {
  try {
    const result = await executeQuery(`
      INSERT INTO OS_USUARIOS (
        US_NOMBRE, US_APELLIDO, US_EMAIL, US_PASSWORD_HASH, RO_IDROL_FK, EC_IDESTADO_CONTRATO_FK, US_CREADO_POR,
        US_TIPO_DOCUMENTO, US_NUMERO_DOCUMENTO, US_FECHA_NACIMIENTO, US_GENERO, US_ESTADO_CIVIL, 
        US_CONTACTO_EMERGENCIA_NOMBRE, US_CONTACTO_EMERGENCIA_TELEFONO, US_TELEFONO, US_DIRECCION,
        CA_IDCARGO_FK, US_FECHA_CONTRATACION, US_FECHA_RETIRO, US_HORARIO_TRABAJO, US_DEPARTAMENTO, 
        US_IDMANAGER_FK, US_TIPO_EMPLEO, EP_IDEPS_FK, AR_IDARL_FK, PE_IDPENSION_FK, CC_IDCAJA_FK,
        US_NOMBRE_BANCO, US_NUMERO_CUENTA, US_TIPO_CUENTA, US_FOTO_PERFIL, US_NOTAS, US_ACTIVO
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userData.US_NOMBRE,
      userData.US_APELLIDO,
      userData.US_EMAIL,
      userData.password,
      userData.RO_IDROL_FK,
      userData.EC_IDESTADO_CONTRATO_FK,
      userData.US_CREADO_POR,
      userData.US_TIPO_DOCUMENTO || null,
      userData.US_NUMERO_DOCUMENTO || null,
      userData.US_FECHA_NACIMIENTO || null,
      userData.US_GENERO || null,
      userData.US_ESTADO_CIVIL && userData.US_ESTADO_CIVIL.trim() !== '' ? userData.US_ESTADO_CIVIL : null,
      userData.US_CONTACTO_EMERGENCIA_NOMBRE || null,
      userData.US_CONTACTO_EMERGENCIA_TELEFONO || null,
      userData.US_TELEFONO || null,
      userData.US_DIRECCION || null,
      userData.CA_IDCARGO_FK || null,
      userData.US_FECHA_CONTRATACION || null,
      userData.US_FECHA_RETIRO || null,
      userData.US_HORARIO_TRABAJO || null,
      userData.US_DEPARTAMENTO || null,
      userData.US_IDMANAGER_FK || null,
      userData.US_TIPO_EMPLEO || null,
      userData.EP_IDEPS_FK || null,
      userData.AR_IDARL_FK || null,
      userData.PE_IDPENSION_FK || null,
      userData.CC_IDCAJA_FK || null,
      userData.US_NOMBRE_BANCO || null,
      userData.US_NUMERO_CUENTA || null,
      userData.US_TIPO_CUENTA || null,
      userData.US_FOTO_PERFIL || null,
      userData.US_NOTAS || null,
      userData.US_ACTIVO !== undefined ? userData.US_ACTIVO : true
    ]) as any

    return result.insertId
  } catch (error: any) {
    console.error("Error creating user:", error)

    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('US_EMAIL')) {
      throw new Error('El email ya está registrado en el sistema')
    }

    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Obtener usuario por ID con rol y estado de contrato
 */
export async function getUserById(id: number): Promise<UserWithRole | null> {
  try {
    const users = await executeQuery(`
      SELECT u.*, cs.EC_NOMBRE as contract_status_name, ur.RO_NOMBRE as role_name, ur.RO_CODIGO as role_code, c.CA_NOMBRE as position
      FROM OS_USUARIOS u 
      LEFT JOIN OS_ESTADOS_CONTRATO cs ON u.EC_IDESTADO_CONTRATO_FK = cs.EC_IDESTADO_CONTRATO_PK 
      LEFT JOIN OS_ROLES ur ON u.RO_IDROL_FK = ur.RO_IDROL_PK 
      LEFT JOIN OS_CARGOS c ON u.CA_IDCARGO_FK = c.CA_IDCARGO_PK
      WHERE u.US_IDUSUARIO_PK = ? AND u.US_FECHA_ELIMINACION IS NULL
    `, [id]) as UserWithRole[]

    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Obtener todos los usuarios activos con rol y estado de contrato
 */
export async function getAllActiveUsers(): Promise<UserWithRole[]> {
  try {
    const users = await executeQuery(`
      SELECT 
        u.US_IDUSUARIO_PK, u.US_NOMBRE, u.US_APELLIDO, u.US_EMAIL, u.US_TELEFONO, u.US_NUMERO_DOCUMENTO,
        u.CA_IDCARGO_FK, c.CA_NOMBRE as position, u.US_FECHA_RETIRO, u.US_FOTO_PERFIL, u.US_ACTIVO,
        u.US_FECHA_CREACION, u.RO_IDROL_FK, u.EC_IDESTADO_CONTRATO_FK, u.US_DEPARTAMENTO, u.US_IDMANAGER_FK,
        cs.EC_NOMBRE as contract_status_name, 
        ur.RO_NOMBRE as role_name, 
        ur.RO_CODIGO as role_code 
      FROM OS_USUARIOS u 
      LEFT JOIN OS_ESTADOS_CONTRATO cs ON u.EC_IDESTADO_CONTRATO_FK = cs.EC_IDESTADO_CONTRATO_PK 
      LEFT JOIN OS_ROLES ur ON u.RO_IDROL_FK = ur.RO_IDROL_PK 
      LEFT JOIN OS_CARGOS c ON u.CA_IDCARGO_FK = c.CA_IDCARGO_PK
      WHERE u.US_FECHA_ELIMINACION IS NULL 
      ORDER BY u.US_IDUSUARIO_PK DESC
    `) as UserWithRole[]

    return users
  } catch (error) {
    console.error("Error getting all active users:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Actualizar información de usuario
 */
export async function updateUser(id: number, userData: UpdateUserData): Promise<void> {
  try {
    const updateFields = []
    const updateValues = []

    if (userData.US_NOMBRE) {
      updateFields.push("US_NOMBRE = ?")
      updateValues.push(userData.US_NOMBRE)
    }
    if (userData.US_APELLIDO) {
      updateFields.push("US_APELLIDO = ?")
      updateValues.push(userData.US_APELLIDO)
    }
    if (userData.US_EMAIL) {
      updateFields.push("US_EMAIL = ?")
      updateValues.push(userData.US_EMAIL)
    }
    if (userData.US_TIPO_DOCUMENTO !== undefined) {
      updateFields.push("US_TIPO_DOCUMENTO = ?")
      updateValues.push(userData.US_TIPO_DOCUMENTO)
    }
    if (userData.US_NUMERO_DOCUMENTO !== undefined) {
      updateFields.push("US_NUMERO_DOCUMENTO = ?")
      updateValues.push(userData.US_NUMERO_DOCUMENTO)
    }
    if (userData.US_FECHA_NACIMIENTO !== undefined) {
      updateFields.push("US_FECHA_NACIMIENTO = ?")
      updateValues.push(userData.US_FECHA_NACIMIENTO)
    }
    if (userData.US_GENERO !== undefined) {
      updateFields.push("US_GENERO = ?")
      updateValues.push(userData.US_GENERO)
    }
    if (userData.US_ESTADO_CIVIL !== undefined) {
      updateFields.push("US_ESTADO_CIVIL = ?")
      updateValues.push(userData.US_ESTADO_CIVIL)
    }
    if (userData.US_CONTACTO_EMERGENCIA_NOMBRE !== undefined) {
      updateFields.push("US_CONTACTO_EMERGENCIA_NOMBRE = ?")
      updateValues.push(userData.US_CONTACTO_EMERGENCIA_NOMBRE)
    }
    if (userData.US_CONTACTO_EMERGENCIA_TELEFONO !== undefined) {
      updateFields.push("US_CONTACTO_EMERGENCIA_TELEFONO = ?")
      updateValues.push(userData.US_CONTACTO_EMERGENCIA_TELEFONO)
    }
    if (userData.US_TELEFONO !== undefined) {
      updateFields.push("US_TELEFONO = ?")
      updateValues.push(userData.US_TELEFONO)
    }
    if (userData.US_DIRECCION !== undefined) {
      updateFields.push("US_DIRECCION = ?")
      updateValues.push(userData.US_DIRECCION)
    }
    if (userData.CA_IDCARGO_FK !== undefined) {
      updateFields.push("CA_IDCARGO_FK = ?")
      updateValues.push(userData.CA_IDCARGO_FK)
    }
    if (userData.US_FECHA_CONTRATACION !== undefined) {
      updateFields.push("US_FECHA_CONTRATACION = ?")
      updateValues.push(userData.US_FECHA_CONTRATACION)
    }
    if (userData.US_FECHA_RETIRO !== undefined) {
      updateFields.push("US_FECHA_RETIRO = ?")
      updateValues.push(userData.US_FECHA_RETIRO)
    }
    if (userData.US_HORARIO_TRABAJO !== undefined) {
      updateFields.push("US_HORARIO_TRABAJO = ?")
      updateValues.push(userData.US_HORARIO_TRABAJO)
    }
    if (userData.US_DEPARTAMENTO !== undefined) {
      updateFields.push("US_DEPARTAMENTO = ?")
      updateValues.push(userData.US_DEPARTAMENTO)
    }
    if (userData.US_IDMANAGER_FK !== undefined) {
      updateFields.push("US_IDMANAGER_FK = ?")
      updateValues.push(userData.US_IDMANAGER_FK)
    }
    if (userData.US_TIPO_EMPLEO !== undefined) {
      updateFields.push("US_TIPO_EMPLEO = ?")
      updateValues.push(userData.US_TIPO_EMPLEO)
    }
    if (userData.EP_IDEPS_FK !== undefined) {
      updateFields.push("EP_IDEPS_FK = ?")
      updateValues.push(userData.EP_IDEPS_FK)
    }
    if (userData.AR_IDARL_FK !== undefined) {
      updateFields.push("AR_IDARL_FK = ?")
      updateValues.push(userData.AR_IDARL_FK)
    }
    if (userData.PE_IDPENSION_FK !== undefined) {
      updateFields.push("PE_IDPENSION_FK = ?")
      updateValues.push(userData.PE_IDPENSION_FK)
    }
    if (userData.CC_IDCAJA_FK !== undefined) {
      updateFields.push("CC_IDCAJA_FK = ?")
      updateValues.push(userData.CC_IDCAJA_FK)
    }
    if (userData.US_NOMBRE_BANCO !== undefined) {
      updateFields.push("US_NOMBRE_BANCO = ?")
      updateValues.push(userData.US_NOMBRE_BANCO)
    }
    if (userData.US_NUMERO_CUENTA !== undefined) {
      updateFields.push("US_NUMERO_CUENTA = ?")
      updateValues.push(userData.US_NUMERO_CUENTA)
    }
    if (userData.US_TIPO_CUENTA !== undefined) {
      updateFields.push("US_TIPO_CUENTA = ?")
      updateValues.push(userData.US_TIPO_CUENTA)
    }
    if (userData.US_FOTO_PERFIL !== undefined) {
      updateFields.push("US_FOTO_PERFIL = ?")
      updateValues.push(userData.US_FOTO_PERFIL)
    }
    if (userData.US_NOTAS !== undefined) {
      updateFields.push("US_NOTAS = ?")
      updateValues.push(userData.US_NOTAS)
    }
    if (userData.US_ACTIVO !== undefined) {
      updateFields.push("US_ACTIVO = ?")
      updateValues.push(userData.US_ACTIVO)
    }
    if (userData.RO_IDROL_FK !== undefined) {
      updateFields.push("RO_IDROL_FK = ?")
      updateValues.push(userData.RO_IDROL_FK)
    }
    if (userData.EC_IDESTADO_CONTRATO_FK !== undefined) {
      updateFields.push("EC_IDESTADO_CONTRATO_FK = ?")
      updateValues.push(userData.EC_IDESTADO_CONTRATO_FK)
    }

    updateFields.push("US_FECHA_ACTUALIZACION = CURRENT_TIMESTAMP")
    if (userData.US_ACTUALIZADO_POR !== undefined) {
      updateFields.push("US_ACTUALIZADO_POR = ?")
      updateValues.push(userData.US_ACTUALIZADO_POR)
    }
    updateValues.push(id)

    await executeQuery(`
      UPDATE OS_USUARIOS 
      SET ${updateFields.join(", ")}
      WHERE US_IDUSUARIO_PK = ?
    `, updateValues)
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Soft delete de usuario (eliminación lógica)
 */
export async function softDeleteUser(id: number, deletedBy: number): Promise<void> {
  try {
    await executeQuery(`
      UPDATE OS_USUARIOS 
      SET US_FECHA_ELIMINACION = CURRENT_TIMESTAMP, US_ELIMINADO_POR = ?
      WHERE US_IDUSUARIO_PK = ?
    `, [deletedBy, id])
  } catch (error) {
    console.error("Error soft deleting user:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}
