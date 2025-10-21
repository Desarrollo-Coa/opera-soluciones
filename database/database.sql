-- =====================================================
-- SGI Opera Soluciones - Simplified Database Initialization Script
-- Script simplificado de inicialización de base de datos
-- Description: Minimal database setup for user login and document management
-- Descripción: Configuración mínima para login de usuarios y gestión de documentos
-- Author: Carlos Muñoz (simplified version)
-- Date: 2025-09-16
-- =====================================================

-- Drop database if exists
-- Eliminar base de datos si existe
DROP DATABASE IF EXISTS sgi_opera_soluciones;

-- Create database
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sgi_opera_soluciones;
USE sgi_opera_soluciones;

-- Disable foreign key checks to avoid issues during initialization
-- Desactivar verificaciones de claves foráneas durante la inicialización
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- REFERENCE TABLES (TABLAS DE REFERENCIA)
-- =====================================================

-- User roles reference table
-- Tabla de referencia para roles de usuario
CREATE TABLE IF NOT EXISTS user_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(30) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- Document types reference table
-- Tabla de referencia para tipos de documento
CREATE TABLE IF NOT EXISTS document_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- Contract statuses reference table
-- Tabla de referencia para estados de contrato
CREATE TABLE IF NOT EXISTS contract_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- =====================================================
-- CORE TABLES (TABLAS PRINCIPALES)
-- =====================================================

-- Users table
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Información personal y documental
  document_type ENUM('CC', 'CE', 'TI', 'RC', 'PA') DEFAULT 'CC',
  document_number VARCHAR(20) UNIQUE,
  birth_date DATE,
  gender ENUM('M', 'F', 'O'),
  marital_status ENUM('Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre'),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  
  -- Información de contacto
  phone VARCHAR(20),
  address VARCHAR(255),
  
  -- Información laboral
  position VARCHAR(100),
  salary DECIMAL(12,2),
  hire_date DATE,
  termination_date DATE,
  work_schedule VARCHAR(50),
  department VARCHAR(100),
  manager_id INT,
  employment_type ENUM('Tiempo Completo', 'Medio Tiempo', 'Por Horas', 'Por Contrato') DEFAULT 'Tiempo Completo',
  
  -- Información de seguridad social
  eps_id VARCHAR(50),
  arl_id VARCHAR(50),
  pension_fund_id VARCHAR(50),
  compensation_fund_id VARCHAR(50),
  
  -- Información bancaria
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_type ENUM('Ahorros', 'Corriente'),
  
  -- Información adicional
  profile_picture VARCHAR(500),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE, 
  
  -- Campos del sistema
  role_id INT,
  contract_status_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  deleted_at DATETIME DEFAULT NULL,
  deleted_by INT DEFAULT NULL
);

-- Documents table
-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  document_type_id INT,
  description TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT,
  deleted_at DATETIME DEFAULT NULL,
  deleted_by INT DEFAULT NULL
);

-- =====================================================
-- NOMINA AND ACCOUNTING TABLES (TABLAS DE NÓMINA Y CONTABILIDAD)
-- =====================================================

-- Libro Gastos Mes a Mes table (tabla para gastos con facturas)
-- Tabla para datos de gastos mes a mes con facturas
CREATE TABLE IF NOT EXISTS payroll_mes_a_mes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL, -- Año para agrupación y filtrado (2023, 2024, 2025, etc.)
  mes VARCHAR(20) NOT NULL, -- Mes para agrupación y filtrado (ENERO, FEBRERO, MARZO, etc.)
  fecha DATE NOT NULL, -- Fecha real del movimiento
  proveedor VARCHAR(255) NOT NULL, -- Nombre del proveedor
  pago DECIMAL(12,2) NOT NULL, -- Monto del pago
  objeto VARCHAR(255) NOT NULL, -- Descripción del objeto/gasto
  valor_neto DECIMAL(12,2) NOT NULL, -- Valor neto (sin IVA)
  iva DECIMAL(12,2) DEFAULT 0.00, -- Valor del IVA
  retencion DECIMAL(12,2) DEFAULT 0.00, -- Valor de retención aplicada
  total DECIMAL(12,2) NOT NULL, -- Valor total (valor_neto + iva - retencion)
  nit VARCHAR(50) NOT NULL, -- NIT del proveedor
  numero_factura VARCHAR(50) NOT NULL, -- Número de factura
  obra VARCHAR(255) NOT NULL, -- Obra o proyecto
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- Facturación table (tabla para facturación de servicios)
-- Tabla para datos de facturación de servicios
CREATE TABLE IF NOT EXISTS libro_gastos_facturacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL, -- Año para agrupación y filtrado (2023, 2024, 2025, etc.)
  mes VARCHAR(20) NOT NULL, -- Mes para agrupación y filtrado (ENERO, FEBRERO, MARZO, etc.)
  numero_facturacion VARCHAR(50) NOT NULL, -- Número de facturación
  fecha DATE NOT NULL, -- Fecha real del movimiento  
  cliente VARCHAR(255) NOT NULL, -- Nombre del cliente
  servicio VARCHAR(255) NOT NULL, -- Descripción del servicio
  nit VARCHAR(50) NOT NULL, -- NIT del cliente
  valor DECIMAL(12,2) NOT NULL, -- Valor base (sin IVA)
  iva DECIMAL(12,2) DEFAULT 0.00, -- Valor del IVA
  total DECIMAL(12,2) NOT NULL, -- Valor total (valor + iva)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- Transferencias y Pagos table (tabla para transferencias y pagos)
-- Tabla para datos de transferencias y pagos
CREATE TABLE IF NOT EXISTS transferencias_pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL, -- Año para agrupación y filtrado (2023, 2024, 2025, etc.)
  mes VARCHAR(20) NOT NULL, -- Mes para agrupación y filtrado (ENERO, FEBRERO, MARZO, etc.)
  fecha DATE NOT NULL, -- Fecha real del movimiento
  actividad VARCHAR(255) NOT NULL, -- Descripción de la actividad
  sale DECIMAL(12,2) DEFAULT 0.00, -- Valor que sale
  entra DECIMAL(12,2) DEFAULT 0.00, -- Valor que entra
  saldo DECIMAL(12,2) DEFAULT 0.00, -- Saldo manual (ingresado por el usuario)
  concepto VARCHAR(255) DEFAULT NULL, -- Concepto del movimiento (ahora permite NULL)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- =====================================================
-- INITIAL DATA (DATOS INICIALES)
-- =====================================================

-- Insert initial data for user_roles
-- Insertar datos iniciales para roles de usuario
INSERT INTO user_roles (name, code, description, created_by) VALUES
('Administrador', 'ADMIN', 'Administrador del sistema con acceso completo', 1),
('Empleado', 'EMPLOYEE', 'Empleado regular con acceso limitado', 1),
('Recursos Humanos', 'HR', 'Responsable de gestión de personal', 1),
('Auditor', 'AUDITOR', 'Auditor interno o externo', 1);

-- Insert initial data for contract_statuses
-- Insertar datos iniciales para estados de contrato
INSERT INTO contract_statuses (name, description, created_by) VALUES
('Activo', 'Contrato activo y vigente', 1),
('Inactivo', 'Contrato inactivo o suspendido', 1),
('Terminado', 'Contrato terminado', 1);

-- Insert initial data for document_types
-- Insertar datos iniciales para tipos de documento
INSERT INTO document_types (name, description, created_by) VALUES
('Contrato', 'Contratos de empleo y acuerdos laborales', 1),
('Hoja de vida', 'Currículum vitae y documentos de perfil profesional', 1),
('Volantes de pago', 'Comprobantes de nómina y pagos salariales', 1),
('Exámenes médicos', 'Certificados médicos y exámenes de salud ocupacional', 1),
('Seguridad social', 'Documentos de afiliación y aportes a seguridad social', 1);
 



-- =====================================================
-- INDEXES (ÍNDICES)
-- =====================================================

-- Create indexes for better performance
-- Crear índices para mejor rendimiento
CREATE INDEX idx_user_roles_active ON user_roles(is_active);
CREATE INDEX idx_user_roles_code ON user_roles(code);
CREATE INDEX idx_document_types_active ON document_types(is_active);
CREATE INDEX idx_contract_statuses_active ON contract_statuses(is_active);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_contract_status_id ON users(contract_status_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
-- New indexes for additional user fields
CREATE INDEX idx_users_document_number ON users(document_number);
CREATE INDEX idx_users_document_type ON users(document_type);
CREATE INDEX idx_users_birth_date ON users(birth_date);
CREATE INDEX idx_users_hire_date ON users(hire_date);
CREATE INDEX idx_users_termination_date ON users(termination_date);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_employment_type ON users(employment_type);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_document_type_id ON documents(document_type_id);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);

-- Indexes for payroll and accounting tables
-- Índices para tablas de nómina y contabilidad
CREATE INDEX idx_payroll_mes_a_mes_year ON payroll_mes_a_mes(year);
CREATE INDEX idx_payroll_mes_a_mes_mes ON payroll_mes_a_mes(mes);
CREATE INDEX idx_payroll_mes_a_mes_year_mes ON payroll_mes_a_mes(year, mes);
CREATE INDEX idx_payroll_mes_a_mes_fecha ON payroll_mes_a_mes(fecha);
CREATE INDEX idx_payroll_mes_a_mes_proveedor ON payroll_mes_a_mes(proveedor);
CREATE INDEX idx_payroll_mes_a_mes_nit ON payroll_mes_a_mes(nit);
CREATE INDEX idx_payroll_mes_a_mes_obra ON payroll_mes_a_mes(obra);
CREATE INDEX idx_libro_gastos_year ON libro_gastos_facturacion(year);
CREATE INDEX idx_libro_gastos_mes ON libro_gastos_facturacion(mes);
CREATE INDEX idx_libro_gastos_year_mes ON libro_gastos_facturacion(year, mes);
CREATE INDEX idx_libro_gastos_fecha ON libro_gastos_facturacion(fecha);
CREATE INDEX idx_libro_gastos_cliente ON libro_gastos_facturacion(cliente);
CREATE INDEX idx_libro_gastos_nit ON libro_gastos_facturacion(nit);
CREATE INDEX idx_libro_gastos_servicio ON libro_gastos_facturacion(servicio);
CREATE INDEX idx_transferencias_year ON transferencias_pagos(year);
CREATE INDEX idx_transferencias_mes ON transferencias_pagos(mes);
CREATE INDEX idx_transferencias_year_mes ON transferencias_pagos(year, mes);
CREATE INDEX idx_transferencias_fecha ON transferencias_pagos(fecha);
CREATE INDEX idx_transferencias_actividad ON transferencias_pagos(actividad);
CREATE INDEX idx_transferencias_concepto ON transferencias_pagos(concepto);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS (RESTRICCIONES DE CLAVE FORÁNEA)
-- =====================================================

-- Users table foreign keys
ALTER TABLE users 
ADD CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES user_roles(id),
ADD CONSTRAINT fk_users_contract_status_id FOREIGN KEY (contract_status_id) REFERENCES contract_statuses(id),
ADD CONSTRAINT fk_users_manager_id FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- Documents table foreign keys
ALTER TABLE documents 
ADD CONSTRAINT fk_documents_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_documents_document_type_id FOREIGN KEY (document_type_id) REFERENCES document_types(id);

-- No foreign key constraints needed for simplified tables
-- No se necesitan restricciones de clave foránea para las tablas simplificadas

-- Re-enable foreign key checks
-- Reactivar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Database initialization completed successfully
SELECT 'SGI Opera Soluciones simplified database initialization completed successfully' AS status;








INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `document_type`, `document_number`, `birth_date`, `gender`, `marital_status`, `emergency_contact_name`, `emergency_contact_phone`, `phone`, `address`, `position`, `salary`, `hire_date`, `termination_date`, `work_schedule`, `department`, `manager_id`, `employment_type`, `eps_id`, `arl_id`, `pension_fund_id`, `compensation_fund_id`, `bank_name`, `account_number`, `account_type`, `profile_picture`, `notes`, `is_active`, `role_id`, `contract_status_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 'Juan Manuel', 'Administrador', 'juanmanuel@operasoluciones.com', '$2a$12$UH3BnGQSh6mHS2dKRz0j.OpO6jEe7tVSIOjgJofbIGtL23k3mITdm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-18 12:20:41', 1, '2025-09-18 12:20:41', NULL, NULL, NULL),
(2, 'Daniel', 'Ramirez', 'daniel.ramirez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '3189139831', '1995-06-01', 'M', 'Soltero/a', 'María Ramirez', '3001234567', '3009876543', 'Calle 123 #45-67, Cartagena', 'Desarrollador Senior', 4500000.00, '2023-08-30', NULL, '8:00 a.m - 5:00 p.m.', 'Tecnología', 1, 'Tiempo Completo', 'SURA', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'BANCOLOMBIA', '1234567890', 'Ahorros', NULL, 'Desarrollador con experiencia en React y Node.js', 1, 2, 1, '2025-09-18 12:27:07', 1, '2025-09-18 12:27:37', 1, NULL, NULL),
(3, 'María', 'González', 'maria.gonzalez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '1234567890', '1990-03-15', 'F', 'Casado/a', 'Carlos González', '3002345678', '3008765432', 'Carrera 45 #78-90, Barranquilla', 'Gerente de Recursos Humanos', 6500000.00, '2022-01-15', NULL, '8:00 a.m - 6:00 p.m.', 'Recursos Humanos', 1, 'Tiempo Completo', 'SANITAS', 'SURA', 'COLFONDOS', 'CAJACOPI', 'BBVA', '2345678901', 'Corriente', NULL, 'Experta en gestión de talento humano', 1, 3, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(4, 'Carlos', 'Mendoza', 'carlos.mendoza@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '2345678901', '1988-11-22', 'M', 'Soltero/a', 'Ana Mendoza', '3003456789', '3007654321', 'Calle 67 #12-34, Medellín', 'Contador Senior', 5200000.00, '2021-06-01', NULL, '8:00 a.m - 5:00 p.m.', 'Contabilidad', 1, 'Tiempo Completo', 'NUEVA EPS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'SCOTIABANK', '3456789012', 'Ahorros', NULL, 'Contador público con especialización en tributaria', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(5, 'Ana', 'Rodríguez', 'ana.rodriguez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '3456789012', '1992-07-08', 'F', 'Soltero/a', 'Luis Rodríguez', '3004567890', '3006543210', 'Carrera 89 #23-45, Bogotá', 'Analista de Sistemas', 3800000.00, '2023-02-15', NULL, '8:00 a.m - 5:00 p.m.', 'Tecnología', 2, 'Tiempo Completo', 'SURA', 'SURA', 'COLFONDOS', 'CAJACOPI', 'BANCOLOMBIA', '4567890123', 'Ahorros', NULL, 'Analista especializada en sistemas de información', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(6, 'Luis', 'Hernández', 'luis.hernandez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '4567890123', '1985-12-03', 'M', 'Casado/a', 'Carmen Hernández', '3005678901', '3005432109', 'Calle 12 #56-78, Cali', 'Supervisor de Obras', 4800000.00, '2020-09-01', NULL, '7:00 a.m - 4:00 p.m.', 'Construcción', 1, 'Tiempo Completo', 'SANITAS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'BBVA', '5678901234', 'Corriente', NULL, 'Supervisor con 10 años de experiencia en construcción', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(7, 'Carmen', 'Vargas', 'carmen.vargas@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '5678901234', '1993-04-18', 'F', 'Soltero/a', 'Roberto Vargas', '3006789012', '3004321098', 'Carrera 34 #67-89, Bucaramanga', 'Asistente Administrativa', 2800000.00, '2023-05-20', NULL, '8:00 a.m - 5:00 p.m.', 'Administración', 3, 'Tiempo Completo', 'NUEVA EPS', 'SURA', 'COLFONDOS', 'CAJACOPI', 'SCOTIABANK', '6789012345', 'Ahorros', NULL, 'Asistente administrativa con experiencia en gestión documental', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(8, 'Roberto', 'Silva', 'roberto.silva@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '6789012345', '1987-09-25', 'M', 'Divorciado/a', 'Patricia Silva', '3007890123', '3003210987', 'Calle 78 #90-12, Pereira', 'Ingeniero Civil', 5500000.00, '2019-03-10', NULL, '8:00 a.m - 5:00 p.m.', 'Ingeniería', 1, 'Tiempo Completo', 'SANITAS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'BANCOLOMBIA', '7890123456', 'Corriente', NULL, 'Ingeniero civil especializado en estructuras', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(9, 'Patricia', 'Morales', 'patricia.morales@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '7890123456', '1991-01-12', 'F', 'Casado/a', 'Fernando Morales', '3008901234', '3002109876', 'Carrera 56 #78-90, Manizales', 'Auditora Interna', 4200000.00, '2022-08-15', NULL, '8:00 a.m - 5:00 p.m.', 'Auditoría', 1, 'Tiempo Completo', 'SURA', 'SURA', 'COLFONDOS', 'CAJACOPI', 'BBVA', '8901234567', 'Ahorros', NULL, 'Auditora con certificación en normas internacionales', 1, 4, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(10, 'Fernando', 'Castro', 'fernando.castro@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '8901234567', '1989-06-30', 'M', 'Soltero/a', 'Isabel Castro', '3009012345', '3001098765', 'Calle 90 #12-34, Armenia', 'Coordinador de Proyectos', 4600000.00, '2021-11-01', NULL, '8:00 a.m - 6:00 p.m.', 'Proyectos', 1, 'Tiempo Completo', 'NUEVA EPS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'SCOTIABANK', '9012345678', 'Corriente', NULL, 'Coordinador con PMP y experiencia en gestión de proyectos', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(11, 'Isabel', 'Jiménez', 'isabel.jimenez@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '9012345678', '1994-08-14', 'F', 'Soltero/a', 'Miguel Jiménez', '3000123456', '3000987654', 'Carrera 12 #34-56, Pasto', 'Diseñadora Gráfica', 3200000.00, '2023-07-01', NULL, '8:00 a.m - 5:00 p.m.', 'Diseño', 1, 'Tiempo Completo', 'SANITAS', 'SURA', 'COLFONDOS', 'CAJACOPI', 'BANCOLOMBIA', '0123456789', 'Ahorros', NULL, 'Diseñadora gráfica especializada en branding corporativo', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL),
(12, 'Miguel', 'Torres', 'miguel.torres@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '0123456789', '1986-02-28', 'M', 'Casado/a', 'Elena Torres', '3001234567', '3009876543', 'Calle 45 #67-89, Santa Marta', 'Jefe de Seguridad', 3900000.00, '2020-12-01', NULL, '6:00 a.m - 2:00 p.m.', 'Seguridad', 1, 'Tiempo Completo', 'NUEVA EPS', 'POSITIVA', 'PROTECCIÓN', 'CAJACOPI', 'BBVA', '1234567890', 'Corriente', NULL, 'Jefe de seguridad con certificación en gestión de riesgos', 1, 2, 1, '2025-01-27 10:00:00', 1, NULL, NULL, NULL, NULL);

-- =====================================================
-- ABSENCE MANAGEMENT TABLES (TABLAS DE GESTIÓN DE AUSENCIAS)
-- =====================================================

-- Absence types reference table
-- Tabla de referencia para tipos de ausencia
CREATE TABLE IF NOT EXISTS tipos_ausencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  es_remunerada BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- Absences table
-- Tabla de ausencias
CREATE TABLE IF NOT EXISTS ausencias (
  id_ausencia INT AUTO_INCREMENT PRIMARY KEY,
  id_colaborador INT NOT NULL,
  id_tipo_ausencia INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias_ausencia INT GENERATED ALWAYS AS (DATEDIFF(fecha_fin, fecha_inicio) + 1) STORED,
  descripcion TEXT,
  soporte_url VARCHAR(255) DEFAULT NULL,
  id_usuario_registro INT NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT
);

-- Absence files table
-- Tabla de archivos de ausencias
CREATE TABLE IF NOT EXISTS archivos_ausencias (
  id_archivo INT AUTO_INCREMENT PRIMARY KEY,
  id_ausencia INT NOT NULL,
  url_archivo VARCHAR(255) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(50),
  tamano_archivo INT,
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- INITIAL DATA FOR ABSENCE MANAGEMENT
-- =====================================================

-- Insert initial data for absence types
-- Insertar datos iniciales para tipos de ausencia
INSERT INTO tipos_ausencia (nombre, descripcion, es_remunerada, created_by) VALUES
('Vacaciones', 'Días de descanso por vacaciones anuales', TRUE, 1),
('Enfermedad General', 'Incapacidad por enfermedad común', TRUE, 1),
('Enfermedad Laboral', 'Incapacidad por accidente o enfermedad laboral', TRUE, 1),
('Maternidad', 'Licencia de maternidad', TRUE, 1),
('Paternidad', 'Licencia de paternidad', TRUE, 1),
('Duelo', 'Licencia por fallecimiento de familiar', TRUE, 1),
('Permiso No Remunerado', 'Permiso sin goce de salario', FALSE, 1),
('Permiso Personal', 'Permiso por asuntos personales', FALSE, 1),
('No Presentado', 'Ausencia sin justificación - no se presentó a trabajar', FALSE, 1);

-- =====================================================
-- INDEXES FOR ABSENCE MANAGEMENT
-- =====================================================

-- Indexes for absence management tables
-- Índices para tablas de gestión de ausencias
CREATE INDEX idx_tipos_ausencia_active ON tipos_ausencia(is_active);
CREATE INDEX idx_ausencias_colaborador ON ausencias(id_colaborador);
CREATE INDEX idx_ausencias_tipo ON ausencias(id_tipo_ausencia);
CREATE INDEX idx_ausencias_fecha_inicio ON ausencias(fecha_inicio);
CREATE INDEX idx_ausencias_fecha_fin ON ausencias(fecha_fin);
CREATE INDEX idx_ausencias_dias_ausencia ON ausencias(dias_ausencia);
CREATE INDEX idx_ausencias_activo ON ausencias(activo);
CREATE INDEX idx_ausencias_fecha_registro ON ausencias(fecha_registro);
CREATE INDEX idx_archivos_ausencias_ausencia ON archivos_ausencias(id_ausencia);
CREATE INDEX idx_archivos_ausencias_active ON archivos_ausencias(is_active);
CREATE INDEX idx_archivos_ausencias_fecha_subida ON archivos_ausencias(fecha_subida);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS FOR ABSENCE MANAGEMENT
-- =====================================================

-- Foreign key constraints for absence management
-- Restricciones de clave foránea para gestión de ausencias
ALTER TABLE ausencias 
ADD CONSTRAINT fk_ausencias_colaborador FOREIGN KEY (id_colaborador) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_ausencias_tipo FOREIGN KEY (id_tipo_ausencia) REFERENCES tipos_ausencia(id),
ADD CONSTRAINT fk_ausencias_usuario_registro FOREIGN KEY (id_usuario_registro) REFERENCES users(id),
ADD CONSTRAINT fk_ausencias_created_by FOREIGN KEY (created_by) REFERENCES users(id),
ADD CONSTRAINT fk_ausencias_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE archivos_ausencias 
ADD CONSTRAINT fk_archivos_ausencias_ausencia FOREIGN KEY (id_ausencia) REFERENCES ausencias(id_ausencia) ON DELETE CASCADE,
ADD CONSTRAINT fk_archivos_ausencias_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id);

ALTER TABLE tipos_ausencia 
ADD CONSTRAINT fk_tipos_ausencia_created_by FOREIGN KEY (created_by) REFERENCES users(id),
ADD CONSTRAINT fk_tipos_ausencia_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- FILE SYSTEM TABLES (TABLAS DEL SISTEMA DE ARCHIVOS)
-- =====================================================

-- File system folders table
-- Tabla de carpetas del sistema de archivos
CREATE TABLE IF NOT EXISTS file_folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT NULL, -- NULL para carpetas raíz
  path VARCHAR(500) NOT NULL, -- Ruta completa de la carpeta (reducido para evitar error de índice)
  description TEXT,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_file_folders_parent (parent_id),
  INDEX idx_file_folders_path (path(191)), -- Índice parcial para evitar error de longitud
  INDEX idx_file_folders_active (is_active),
  FOREIGN KEY (parent_id) REFERENCES file_folders(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- File system files table
-- Tabla de archivos del sistema de archivos
CREATE TABLE IF NOT EXISTS file_system_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  folder_id INT NULL, -- NULL para archivos en raíz
  file_path VARCHAR(500) NOT NULL, -- Ruta completa del archivo (reducido para evitar error de índice)
  file_url VARCHAR(500) NOT NULL, -- URL de acceso al archivo (reducido para evitar error de índice)
  file_size BIGINT NOT NULL, -- Tamaño en bytes
  mime_type VARCHAR(100) NOT NULL, -- Tipo MIME del archivo
  file_extension VARCHAR(10), -- Extensión del archivo
  description TEXT,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_file_system_files_folder (folder_id),
  INDEX idx_file_system_files_path (file_path(191)), -- Índice parcial para evitar error de longitud
  INDEX idx_file_system_files_active (is_active),
  INDEX idx_file_system_files_mime_type (mime_type),
  FOREIGN KEY (folder_id) REFERENCES file_folders(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Database initialization completed successfully with absence management and file system
SELECT 'SGI Opera Soluciones database initialization completed successfully with absence management and file system tables' AS status;