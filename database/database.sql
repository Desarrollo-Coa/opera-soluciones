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
  marital_status ENUM('Soltero', 'Casado', 'Divorciado', 'Viudo', 'Unión Libre'),
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
  numero_factura VARCHAR(50) NOT NULL, -- Número de factura
  fecha DATE NOT NULL, -- Fecha real del movimiento
  proveedor VARCHAR(255) NOT NULL, -- Nombre del proveedor
  nit VARCHAR(50) NOT NULL, -- NIT del proveedor
  pago VARCHAR(100) NOT NULL, -- Forma de pago
  objeto VARCHAR(255) NOT NULL, -- Descripción del objeto/gasto
  valor_neto DECIMAL(12,2) NOT NULL, -- Valor neto (sin IVA)
  iva DECIMAL(12,2) DEFAULT 0.00, -- Valor del IVA
  obra VARCHAR(255) NOT NULL, -- Obra o proyecto
  total DECIMAL(12,2) NOT NULL, -- Valor total (valor_neto + iva)
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
  concepto VARCHAR(255) NOT NULL, -- Concepto del movimiento
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

-- Insert sample data for payroll_mes_a_mes (ejemplo de datos de gastos)
-- Insertar datos de ejemplo para libro gastos mes a mes
INSERT INTO payroll_mes_a_mes (year, mes, numero_factura, fecha, proveedor, nit, pago, objeto, valor_neto, iva, obra, total, created_by) VALUES
(2023, 'ENERO', 'FAC-001', '2023-01-15', 'Proveedor ABC', '12345678-9', 'Efectivo', 'Materiales de construcción', 500000, 95000, 'Obra Principal', 595000, 1),
(2023, 'ENERO', 'FAC-002', '2023-01-20', 'Proveedor XYZ', '87654321-0', 'Transferencia', 'Herramientas', 300000, 57000, 'Obra Secundaria', 357000, 1),
(2023, 'FEBRERO', 'FAC-003', '2023-02-15', 'Proveedor DEF', '11223344-5', 'Cheque', 'Equipos', 800000, 152000, 'Obra Principal', 952000, 1),
(2024, 'ENERO', 'FAC-004', '2024-01-15', 'Proveedor GHI', '99887766-3', 'Efectivo', 'Servicios', 400000, 76000, 'Obra Nueva', 476000, 1);

-- Insert sample data for libro_gastos_facturacion (ejemplo de datos de facturación)
-- Insertar datos de ejemplo para facturación
INSERT INTO libro_gastos_facturacion (year, mes, numero_facturacion, fecha, cliente, servicio, nit, valor, iva, total, created_by) VALUES
(2023, 'ENERO', 'FACT-001', '2023-01-15', 'Cliente ABC S.A.S', 'Servicio de consultoría', '900123456-7', 1000000, 190000, 1190000, 1),
(2023, 'ENERO', 'FACT-002', '2023-01-20', 'Cliente XYZ Ltda', 'Servicio de mantenimiento', '900876543-2', 500000, 95000, 595000, 1),
(2023, 'FEBRERO', 'FACT-003', '2023-02-10', 'Cliente DEF S.A', 'Servicio de instalación', '900112233-4', 800000, 152000, 952000, 1),
(2024, 'ENERO', 'FACT-004', '2024-01-05', 'Cliente GHI S.A.S', 'Servicio de capacitación', '900998877-6', 300000, 57000, 357000, 1);

-- Insert sample data for transferencias_pagos (ejemplo de datos de transferencias)
-- Insertar datos de ejemplo para transferencias y pagos
INSERT INTO transferencias_pagos (year, mes, fecha, actividad, sale, entra, concepto, created_by) VALUES
(2023, 'ENERO', '2023-01-15', 'Pago a proveedores', 500000, 0, 'Pago materiales', 1),
(2023, 'ENERO', '2023-01-20', 'Cobro de factura', 0, 1000000, 'Cobro servicio consultoría', 1),
(2023, 'FEBRERO', '2023-02-10', 'Transferencia bancaria', 200000, 0, 'Transferencia a cuenta ahorros', 1),
(2024, 'ENERO', '2024-01-05', 'Ingreso por ventas', 0, 1500000, 'Venta de servicios', 1);

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
(2, 'DAASDNK', 'KJDNASKJDN', 'asdasanueasdal@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '3189139831', '2025-06-01', 'M', 'Soltero', '213123123', '13311414', '1219831938', 'ASJKDNADSN', 'Viviente', 1349999.00, '2025-08-30', '2025-11-16', '8  a.m -  5 p.m.', 'dadad', NULL, 'Tiempo Completo', 'eps', 'arl', 'fp', 'cjc', 'BANCOLOMBIA', '13131444', 'Ahorros', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/profile-pictures/profile_1_e19faec6-5514-4e98-844d-7fa9f4ee15eb_454756.jpg', 'AOKSDMAKSDNKAJSDNAKJSDN', 1, 1, 1, '2025-09-18 12:27:07', 1, '2025-09-18 12:27:37', 1, NULL, NULL);

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
-- INITIAL DATA FOR FILE SYSTEM
-- =====================================================

-- Insert root folder
-- Insertar carpeta raíz
INSERT INTO file_folders (name, parent_id, path, description, created_by) VALUES
('Archivos', NULL, '/', 'Carpeta raíz del sistema de archivos', 1);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Database initialization completed successfully with absence management and file system
SELECT 'SGI Opera Soluciones database initialization completed successfully with absence management and file system tables' AS status;










