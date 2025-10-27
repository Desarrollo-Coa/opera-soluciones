// =====================================================
// SGI Opera Soluciones - Employees API
// API de empleados
// =====================================================
// Description: Employee management API endpoints
// Descripción: Endpoints de API para gestión de empleados
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROLE_CODES } from "@/lib/constants"
import { userSchema } from "@/lib/validations"
import { z } from "zod"

// Validation schema for employee creation (extends userSchema with required password)
const createEmployeeSchema = userSchema.extend({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

// Helper function to get role code by role_id
function getRoleCodeById(roleId: string | number): string {
  const roleMapping: Record<string, string> = {
    "1": ROLE_CODES.ADMIN,
    "2": ROLE_CODES.EMPLOYEE,
    "3": ROLE_CODES.HR,
    "4": ROLE_CODES.AUDITOR,
  }
  return roleMapping[roleId.toString()] || ROLE_CODES.EMPLOYEE
}

/**
 * Get all employees
 * Obtener todos los empleados
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }, { status: 401 })
    }

    // Verify token and get user info
    const payload = await verifyToken(token)
    
    // Get all employees
    const employees = await userService.getAllUsers()

    return NextResponse.json({
      success: true,
      employees
    })

  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}

/**
 * Create a new employee
 * Crear un nuevo empleado
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }, { status: 401 })
    }

    // Verify token and get user info
    const payload = await verifyToken(token)
    
    // Check if user has permission to create employees
    if (payload.role !== ROLE_CODES.ADMIN && payload.role !== ROLE_CODES.HR) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.FORBIDDEN 
      }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    
    let validatedData
    try {
      validatedData = createEmployeeSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors for frontend
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        return NextResponse.json({
          error: "Datos de validación inválidos",
          details: formattedErrors
        }, { status: 400 })
      }
      
      return NextResponse.json({
        error: ERROR_MESSAGES.VALIDATION_ERROR
      }, { status: 400 })
    }

    // Check if user is trying to create an admin user
    // Only ADMIN users can create other ADMIN users
    const roleCode = getRoleCodeById(validatedData.role_id)
    if (roleCode === ROLE_CODES.ADMIN && payload.role !== ROLE_CODES.ADMIN) {
      return NextResponse.json({ 
        error: "Solo los administradores pueden crear otros administradores" 
      }, { status: 403 })
    }

    // Create employee
    const employee = await userService.createUser({
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      email: validatedData.email,
      password: validatedData.password,
      role: roleCode as any,
      contract_status_id: parseInt(validatedData.contract_status_id),
      created_by: payload.id,
      // Additional fields
      document_type: validatedData.document_type,
      document_number: validatedData.document_number,
      birth_date: validatedData.birth_date ? new Date(validatedData.birth_date) : undefined,
      gender: validatedData.gender,
      marital_status: validatedData.marital_status,
      emergency_contact_name: validatedData.emergency_contact_name,
      emergency_contact_phone: validatedData.emergency_contact_phone,
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
      profile_picture: validatedData.profile_picture || undefined,
      notes: validatedData.notes,
      is_active: validatedData.is_active
    })

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      employee
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating employee:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.errors
      }, { status: 400 })
    }
    
    if (error instanceof Error && error.message.includes("ya está registrado")) {
      return NextResponse.json({ 
        error: "El email ya está registrado" 
      }, { status: 409 })
    }
    
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}
