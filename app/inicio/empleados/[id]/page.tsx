import { pool } from "@/lib/db";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EmployeeProfileClient } from "@/components/employees/employee-profile-client";
import { getCargosAction } from "@/actions/nomina/cargos-actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Employee } from "@/types/employee";
import { RowDataPacket } from "mysql2/promise";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const employeeId = parseInt(resolvedParams.id);

  // Validar sesión y rol (Simplified for this example, usually handled by middleware)
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) redirect("/login");

  let userRole = "EMPLOYEE";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userRole = payload.role || "EMPLOYEE";
  } catch (e) { }

  // Fetch Employee Data (Server Side) — Migración 007: OS_USUARIOS, OS_ROLES, OS_ESTADOS_CONTRATO, OS_CARGOS
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 
      u.US_IDUSUARIO_PK as id,
      u.US_NOMBRE as first_name,
      u.US_APELLIDO as last_name,
      u.US_EMAIL as email,
      u.US_TIPO_DOCUMENTO as document_type,
      u.US_NUMERO_DOCUMENTO as document_number,
      u.US_FECHA_NACIMIENTO as birth_date,
      u.US_GENERO as gender,
      u.US_ESTADO_CIVIL as marital_status,
      u.US_CONTACTO_EMERGENCIA_NOMBRE as emergency_contact_name,
      u.US_CONTACTO_EMERGENCIA_TELEFONO as emergency_contact_phone,
      u.US_TELEFONO as phone,
      u.US_DIRECCION as address,
      u.DE_IDDEPARTAMENTO_FK as departamento_id,
      u.MU_IDMUNICIPIO_FK as municipio_id,
      u.US_HORARIO_TRABAJO as work_schedule,
      u.US_DEPARTAMENTO as department,
      u.US_TIPO_EMPLEO as employment_type,
      u.EP_IDEPS_FK as eps_id,
      u.AR_IDARL_FK as arl_id,
      u.PE_IDPENSION_FK as pension_fund_id,
      u.CC_IDCAJA_FK as compensation_fund_id,
      u.US_NOMBRE_BANCO as bank_name,
      u.US_NUMERO_CUENTA as account_number,
      u.US_TIPO_CUENTA as account_type,
      u.US_FOTO_PERFIL as profile_picture,
      u.US_NOTAS as notes,
      u.US_ACTIVO as is_active,
      u.RO_IDROL_FK as role_id,
      u.CA_IDCARGO_FK as cargo_id,
      u.EC_IDESTADO_CONTRATO_FK as contract_status_id,
      u.US_FECHA_CONTRATACION as hire_date,
      u.US_FECHA_RETIRO as termination_date,
      ur.RO_NOMBRE as role_name, 
      cs.EC_NOMBRE as contract_status_name, 
      c.CA_NOMBRE as cargo_name 
     FROM OS_USUARIOS u 
     LEFT JOIN OS_ROLES ur ON u.RO_IDROL_FK = ur.RO_IDROL_PK 
     LEFT JOIN OS_ESTADOS_CONTRATO cs ON u.EC_IDESTADO_CONTRATO_FK = cs.EC_IDESTADO_CONTRATO_PK 
     LEFT JOIN OS_CARGOS c ON u.CA_IDCARGO_FK = c.CA_IDCARGO_PK
     WHERE u.US_IDUSUARIO_PK = ?`,
    [employeeId]
  );

  const employee = rows[0] as Employee;

  if (!employee) {
    redirect("/inicio/empleados");
  }

  // Fetch Cargos for the selector
  const cargosRes = await getCargosAction();
  const cargos = cargosRes.success ? cargosRes.data || [] : [];

  return (
    <DashboardLayout userRole={userRole}>
      <EmployeeProfileClient
        initialEmployee={employee}
        cargos={cargos}
        userRole={userRole}
      />
    </DashboardLayout>
  );
}
