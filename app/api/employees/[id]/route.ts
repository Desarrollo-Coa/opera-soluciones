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
import { getUserById, updateUser, softDeleteUser } from "@/database/users"
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
  { params }: { params: { id: string } }
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
    
    const employeeId = parseInt(params.id)
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

    // Convert is_active from 0/1 to boolean and add days_until_termination
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const daysUntilTermination = employee.termination_date
      ? Math.floor((new Date(employee.termination_date).getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    const employeeResponse = {
      ...employee,
      is_active: Boolean(employee.is_active),
      days_until_termination: daysUntilTermination
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
  { params }: { params: { id: string } }
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

    const employeeId = parseInt(params.id)
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
    if (validatedData.profile_picture && validatedData.profile_picture !== existingEmployee.profile_picture) {
      // Delete old profile picture if it exists
      if (existingEmployee.profile_picture && existingEmployee.profile_picture.trim() !== '') {
        try {
          // Extract key from the old profile picture URL
          const key = extractKeyFromUrl(existingEmployee.profile_picture)
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
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      email: validatedData.email,
      phone: validatedData.phone,
      address: validatedData.address,
      position: validatedData.position,
      salary: validatedData.salary ? parseFloat(validatedData.salary) : undefined,
      hire_date: validatedData.hire_date ? new Date(validatedData.hire_date) : undefined,
      termination_date: validatedData.termination_date ? new Date(validatedData.termination_date) : undefined,
      work_schedule: validatedData.work_schedule,
      department: validatedData.department,
      manager_id: validatedData.manager_id ? parseInt(validatedData.manager_id) : undefined,
      employment_type: validatedData.employment_type,
      eps_id: validatedData.eps_id,
      arl_id: validatedData.arl_id,
      pension_fund_id: validatedData.pension_fund_id,
      compensation_fund_id: validatedData.compensation_fund_id,
      bank_name: validatedData.bank_name,
      account_number: validatedData.account_number,
      account_type: validatedData.account_type,
      profile_picture: profilePictureUrl || undefined,
      notes: validatedData.notes,
      is_active: validatedData.is_active,
      role_id: validatedData.role_id ? parseInt(validatedData.role_id) : undefined,
      contract_status_id: validatedData.contract_status_id ? parseInt(validatedData.contract_status_id) : undefined,
      document_type: validatedData.document_type,
      document_number: validatedData.document_number,
      birth_date: validatedData.birth_date ? new Date(validatedData.birth_date) : undefined,
      gender: validatedData.gender,
      marital_status: validatedData.marital_status,
      emergency_contact_name: validatedData.emergency_contact_name,
      emergency_contact_phone: validatedData.emergency_contact_phone,
      updated_by: payload.id
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
  { params }: { params: { id: string } }
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

    const employeeId = parseInt(params.id)
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
  { params }: { params: { id: string } }
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

    const employeeId = parseInt(params.id)
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
      is_active,
      updated_by: payload.id
    })

    // Verify the update by fetching the employee again
    const updatedEmployee = await getUserById(employeeId)
    console.log('Employee after update:', updatedEmployee?.is_active)

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