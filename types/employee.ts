export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    address?: string | null;

    // Información personal
    document_type?: 'CC' | 'CE' | 'TI' | 'RC' | 'PA';
    document_number?: string | null;
    birth_date?: string | null;
    gender?: 'M' | 'F' | 'O' | null;
    marital_status?: 'Soltero/a' | 'Casado/a' | 'Divorciado/a' | 'Viudo/a' | 'Unión Libre' | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    profile_picture?: string | null;
    departamento_id?: number | null;
    municipio_id?: number | null;

    // Información laboral
    cargo_id?: number | null;
    cargo_name?: string | null;
    position?: string | null;
    hire_date?: string | null;
    termination_date?: string | null;
    work_schedule?: string | null;
    department?: string | null;
    employment_type?: 'Tiempo Completo' | 'Medio Tiempo' | 'Por Horas' | 'Por Contrato';
    contract_status_id?: number | null;
    contract_status_name?: string | null;

    // Seguridad Social
    eps_id?: string | null;
    arl_id?: string | null;
    pension_fund_id?: string | null;
    compensation_fund_id?: string | null;

    // Información bancaria
    bank_name?: string | null;
    account_number?: string | null;
    account_type?: 'Ahorros' | 'Corriente' | null;

    notes?: string | null;
    is_active?: boolean;
    role_id?: number;
    role_name?: string;
    created_at?: string;
}
