// =====================================================
// SGI Opera Soluciones - Employee by ID API
// API de empleado por ID
// =====================================================
// Description: Get, update, and delete employee by ID
// Descripción: Obtener, actualizar y eliminar empleado por ID
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser, softDeleteUser } from "@/lib/repositories/users"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROLE_CODES } from "@/lib/constants"
import { userSchema } from "@/lib/validations"
import { deleteFromSpaces, extractKeyFromUrl } from "@/lib/digitalocean-spaces"

/**
 * Get employee by ID
 * Obtener empleado por ID
 */
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params
    const employeeId = parseInt(resolvedParams.id)
    if (isNaN(employeeId)) {
      return NextResponse.json({
        error: "ID de empleado inválido"
      }, { status: 400 })
    }

    // Get employee
    const employee = await getUserById(employeeId)
    if (!employee) {
      return NextResponse.json({
        error: "Empleado no encontrado"
      }, { status: 404 })
    }

    // Map database columns to frontend fields
    // Migración 007: Mapeo de US_ a nombres de dominio
    const employeeResponse = {
      id: employee.US_IDUSUARIO_PK,
      first_name: employee.US_NOMBRE,
      last_name: employee.US_APELLIDO,
      email: employee.US_EMAIL,
      phone: employee.US_TELEFONO,
      address: employee.US_DIRECCION,
      document_type: employee.US_TIPO_DOCUMENTO,
      document_number: employee.US_NUMERO_DOCUMENTO,
      birth_date: employee.US_FECHA_NACIMIENTO ? new Date(employee.US_FECHA_NACIMIENTO).toISOString() : null,
      gender: employee.US_GENERO,
      marital_status: employee.US_ESTADO_CIVIL,
      emergency_contact_name: employee.US_CONTACTO_EMERGENCIA_NOMBRE,
      emergency_contact_phone: employee.US_CONTACTO_EMERGENCIA_TELEFONO,
      departamento_id: employee.DE_IDDEPARTAMENTO_FK,
      municipio_id: employee.MU_IDMUNICIPIO_FK,
      cargo_id: employee.CA_IDCARGO_FK,
      cargo_name: employee.position,
      position: employee.position,
      hire_date: employee.US_FECHA_CONTRATACION ? new Date(employee.US_FECHA_CONTRATACION).toISOString() : null,
      termination_date: employee.US_FECHA_RETIRO ? new Date(employee.US_FECHA_RETIRO).toISOString() : null,
      work_schedule: employee.US_HORARIO_TRABAJO,
      department: employee.US_DEPARTAMENTO,
      employment_type: employee.US_TIPO_EMPLEO,
      contract_status_id: employee.EC_IDESTADO_CONTRATO_FK,
      contract_status_name: employee.contract_status_name,
      eps_id: employee.EP_IDEPS_FK,
      arl_id: employee.AR_IDARL_FK,
      pension_fund_id: employee.PE_IDPENSION_FK,
      compensation_fund_id: employee.CC_IDCAJA_FK,
      bank_name: employee.US_NOMBRE_BANCO,
      account_number: employee.US_NUMERO_CUENTA,
      account_type: employee.US_TIPO_CUENTA,
      role_id: employee.RO_IDROL_FK,
      role_name: employee.role_name,
      profile_picture: employee.US_FOTO_PERFIL,
      notes: employee.US_NOTAS,
      is_active: Boolean(employee.US_ACTIVO),
      created_at: employee.US_FECHA_CREACION ? new Date(employee.US_FECHA_CREACION).toISOString() : null
    }

    return NextResponse.json({
      success: true,
      employee: employeeResponse
    })

  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    }, { status: 500 })
  }
}

/**
 * Update employee
 * Actualizar empleado
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check if user has permission to update employees
    if (payload.role !== ROLE_CODES.ADMIN && payload.role !== ROLE_CODES.HR) {
      return NextResponse.json({
        error: ERROR_MESSAGES.FORBIDDEN
      }, { status: 403 })
    }

    const resolvedParams = await params
    const employeeId = parseInt(resolvedParams.id)
    if (isNaN(employeeId)) {
      return NextResponse.json({
        error: "ID de empleado inválido"
      }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = userSchema.parse(body)

    // Check if employee exists
    const existingEmployee = await getUserById(employeeId)
    if (!existingEmployee) {
      return NextResponse.json({
        error: "Empleado no encontrado"
      }, { status: 404 })
    }

    // Handle profile picture update
    let profilePictureUrl = validatedData.profile_picture
    if (validatedData.profile_picture && validatedData.profile_picture !== existingEmployee.US_FOTO_PERFIL) {
      // Delete old profile picture if it exists
      if (existingEmployee.US_FOTO_PERFIL && existingEmployee.US_FOTO_PERFIL.trim() !== '') {
        try {
          // Extract key from the old profile picture URL
          const key = extractKeyFromUrl(existingEmployee.US_FOTO_PERFIL)
          if (key) {
            // Delete from DigitalOcean Spaces directly
            await deleteFromSpaces(key)
          }
        } catch (error) {
          console.warn('Error deleting old profile picture:', error)
          // Continue with update even if deletion fails
        }
      }
    }

    // Update employee
    const updatedEmployee = await updateUser(employeeId, {
      US_NOMBRE: validatedData.first_name,
      US_APELLIDO: validatedData.last_name,
      US_EMAIL: validatedData.email,
      US_TELEFONO: validatedData.phone,
      US_DIRECCION: validatedData.address,
      US_FECHA_CONTRATACION: validatedData.hire_date ? new Date(validatedData.hire_date) : undefined,
      US_FECHA_RETIRO: validatedData.termination_date ? new Date(validatedData.termination_date) : undefined,
      US_HORARIO_TRABAJO: validatedData.work_schedule,
      US_DEPARTAMENTO: validatedData.department,
      US_IDMANAGER_FK: validatedData.manager_id ? parseInt(validatedData.manager_id) : undefined,
      US_TIPO_EMPLEO: validatedData.employment_type,
      EP_IDEPS_FK: validatedData.eps_id,
      AR_IDARL_FK: validatedData.arl_id,
      PE_IDPENSION_FK: validatedData.pension_fund_id,
      CC_IDCAJA_FK: validatedData.compensation_fund_id,
      US_NOMBRE_BANCO: validatedData.bank_name,
      US_NUMERO_CUENTA: validatedData.account_number,
      US_TIPO_CUENTA: validatedData.account_type,
      US_FOTO_PERFIL: profilePictureUrl || undefined,
      US_NOTAS: validatedData.notes,
      US_ACTIVO: validatedData.is_active,
      RO_IDROL_FK: validatedData.role_id ? parseInt(validatedData.role_id) : undefined,
      EC_IDESTADO_CONTRATO_FK: validatedData.contract_status_id ? parseInt(validatedData.contract_status_id) : undefined,
      US_TIPO_DOCUMENTO: validatedData.document_type,
      US_NUMERO_DOCUMENTO: validatedData.document_number,
      US_FECHA_NACIMIENTO: validatedData.birth_date ? new Date(validatedData.birth_date) : undefined,
      US_GENERO: validatedData.gender,
      US_ESTADO_CIVIL: validatedData.marital_status,
      US_CONTACTO_EMERGENCIA_NOMBRE: validatedData.emergency_contact_name,
      US_CONTACTO_EMERGENCIA_TELEFONO: validatedData.emergency_contact_phone,
      US_ACTUALIZADO_POR: payload.id
    })

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.USER_UPDATED,
      employee: updatedEmployee
    })

  } catch (error) {
    console.error("Error updating employee:", error)

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    }, { status: 500 })
  }
}

/**
 * Delete employee (soft delete)
 * Eliminar empleado (eliminación lógica)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check if user has permission to delete employees
    if (payload.role !== ROLE_CODES.ADMIN) {
      return NextResponse.json({
        error: ERROR_MESSAGES.FORBIDDEN
      }, { status: 403 })
    }

    const resolvedParams = await params
    const employeeId = parseInt(resolvedParams.id)
    if (isNaN(employeeId)) {
      return NextResponse.json({
        error: "ID de empleado inválido"
      }, { status: 400 })
    }

    // Check if employee exists
    const existingEmployee = await getUserById(employeeId)
    if (!existingEmployee) {
      return NextResponse.json({
        error: "Empleado no encontrado"
      }, { status: 404 })
    }

    // Soft delete employee
    await softDeleteUser(employeeId, payload.id)

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.USER_DELETED
    })

  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    }, { status: 500 })
  }
}

/**
 * PATCH employee status (activate/deactivate)
 * Actualizar estado del empleado (activar/desactivar)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check if user has permission to manage employees
    if (payload.role !== ROLE_CODES.ADMIN && payload.role !== ROLE_CODES.HR) {
      return NextResponse.json({
        error: ERROR_MESSAGES.FORBIDDEN
      }, { status: 403 })
    }

    const resolvedParams = await params
    const employeeId = parseInt(resolvedParams.id)
    if (isNaN(employeeId)) {
      return NextResponse.json({
        error: "ID de empleado inválido"
      }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const { is_active } = body

    console.log('PATCH request body:', body)
    console.log('is_active value:', is_active, 'type:', typeof is_active)

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({
        error: "is_active debe ser un booleano"
      }, { status: 400 })
    }

    // Check if employee exists
    const existingEmployee = await getUserById(employeeId)
    if (!existingEmployee) {
      return NextResponse.json({
        error: "Empleado no encontrado"
      }, { status: 404 })
    }

    // Update employee status
    console.log('Updating employee', employeeId, 'with is_active:', is_active, 'updated_by:', payload.id)
    await updateUser(employeeId, {
      US_ACTIVO: is_active,
      US_ACTUALIZADO_POR: payload.id
    })

    // Verify the update by fetching the employee again
    const updatedEmployee = await getUserById(employeeId)
    console.log('Employee after update:', updatedEmployee?.US_ACTIVO)

    return NextResponse.json({
      success: true,
      message: is_active ? "Empleado activado exitosamente" : "Empleado desactivado exitosamente"
    })

  } catch (error) {
    console.error("Error updating employee status:", error)
    return NextResponse.json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    }, { status: 500 })
  }
}