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
(2, 'Daniel', 'Ramirez', 'asdasanueasdal@operasoluciones.com', '$2a$12$1A/jF1I6fG1MjUekPAlb4Ohq1qG3L/1AaIUh74h69Ek.9P11HlIny', 'CC', '3189139831', '2025-06-01', 'M', 'Soltero', '213123123', '13311414', '1219831938', 'ASJKDNADSN', 'Viviente', 1349999.00, '2025-08-30', '2025-11-16', '8  a.m -  5 p.m.', 'dadad', NULL, 'Tiempo Completo', 'eps', 'arl', 'fp', 'cjc', 'BANCOLOMBIA', '13131444', 'Ahorros', 'https://sgiopera-prod-files.nyc3.digitaloceanspaces.com/profile-pictures/profile_1_e19faec6-5514-4e98-844d-7fa9f4ee15eb_454756.jpg', 'AOKSDMAKSDNKAJSDNAKJSDN', 1, 1, 1, '2025-09-18 12:27:07', 1, '2025-09-18 12:27:37', 1, NULL, NULL);

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
 

 INSERT INTO `payroll_mes_a_mes` (`id`, `year`, `mes`, `fecha`, `proveedor`, `pago`, `objeto`, `valor_neto`, `iva`, `retencion`, `total`, `nit`, `numero_factura`, `obra`, `created_at`, `created_by`, `updated_by`) VALUES
(1, 2023, 'ENERO', '2023-01-15', 'Proveedor ABC', 595000.00, 'Materiales de construcción', 500000.00, 95000.00, 0.00, 595000.00, '12345678-9', 'FAC-001', 'Obra Principal', '2025-09-30 23:11:47', 1, NULL),
(2, 2023, 'ENERO', '2023-01-20', 'Proveedor XYZ', 357000.00, 'Herramientas', 300000.00, 57000.00, 0.00, 357000.00, '87654321-0', 'FAC-002', 'Obra Secundaria', '2025-09-30 23:11:47', 1, NULL),
(3, 2023, 'FEBRERO', '2023-02-15', 'Proveedor DEF', 952000.00, 'Equipos', 800000.00, 152000.00, 0.00, 952000.00, '11223344-5', 'FAC-003', 'Obra Principal', '2025-09-30 23:11:47', 1, NULL),
(4, 2024, 'ENERO', '2024-01-15', 'Proveedor GHI', 476000.00, 'Servicios', 400000.00, 76000.00, 0.00, 476000.00, '99887766-3', 'FAC-004', 'Obra Nueva', '2025-09-30 23:11:47', 1, NULL),
(5, 2025, 'ENERO', '2025-01-27', 'CAMARA DE COMERCIO DE CARTAGENA', 217937.00, 'pago camara de comercio', 216500.00, 1437.00, 0.00, 217937.00, '890480041-1', 'OSCT762956', '', '2025-10-01 09:27:21', 1, NULL),
(6, 2025, 'ENERO', '2025-01-28', 'ALKOSTO', 3002378.00, 'Dinero de cuenta opera, computador e impresora para ofi de opera soluciones', 2878000.00, 124378.00, 0.00, 3002378.00, '890900943-1', 'Z0592514691', '', '2025-10-01 09:27:21', 1, NULL),
(7, 2025, 'ENERO', '2025-01-30', 'TAURO', 97064.00, 'Dinero de cuenta opera, compra de carpetas para clasificar documentos, grapadora.', 83700.00, 13364.00, 0.00, 97064.00, '802008192-1', '510211805', '', '2025-10-01 09:27:21', 1, NULL),
(8, 2025, 'ENERO', '2025-01-31', 'FALABELLA', 1507447.00, 'Reloj WATCH, Guillermo ', 1299900.00, 207547.00, 0.00, 1507447.00, '900017447-8', '0101-0017-5833', '', '2025-10-01 09:27:21', 1, NULL),
(9, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', 650000.00, 'PAGO A MARTA ARTUNDUAGA', 650000.00, 0.00, 0.00, 650000.00, '', '', '', '2025-10-01 09:50:02', 1, 1),
(10, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', 836330.00, 'NOMINA DEL 30 DE ENERO', 836330.00, 0.00, 0.00, 836330.00, '', '', '', '2025-10-01 09:50:02', 1, 1),
(11, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', 500000.00, 'PAGO A ANA PINZON', 500000.00, 0.00, 0.00, 500000.00, '', '', '', '2025-10-01 09:50:02', 1, 1),
(12, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', 836330.00, 'NOMINA DEL 30 DE ENERO', 836330.00, 0.00, 0.00, 836330.00, '', '', '', '2025-10-01 09:50:02', 1, 1),
(13, 2025, 'FEBRERO', '2025-02-01', 'TRANSFERENCIA VIRTUAL PYME', 836330.00, 'NOMINA DEL 30 DE ENERO', 836330.00, 0.00, 0.00, 836330.00, '', '', '', '2025-10-01 09:50:02', 1, 1),
(14, 2025, 'FEBRERO', '2025-02-04', 'TRANSFERENCIA VIRTUAL PYME', 600000.00, '', 600000.00, 0.00, 0.00, 600000.00, '', '', '', '2025-10-01 09:50:02', 1, 1),
(15, 2025, 'FEBRERO', '2025-02-05', 'TRANSFERENCIA VIRTUAL PYME', 134000.00, 'PAGO DE IMPUESTOS ANA MARIA', 134000.00, 0.00, 0.00, 134000.00, '', '', '', '2025-10-01 09:50:02', 1, 1),
(16, 2025, 'FEBRERO', '2025-02-05', 'HOMECENTER', 1599988.00, 'TANQUE  HUMBOLDT DE 1, SEÑOR GUILLERMO', 1379700.00, 220288.00, 0.00, 1599988.00, '800242106-2', '5909100283648', '', '2025-10-01 09:50:02', 1, 1),
(17, 2025, 'FEBRERO', '2025-02-07', 'HOMECENTER', 374107.00, 'SEÑALIZACIONES, SEÑOR GUILLERMO', 322600.00, 51507.00, 0.00, 374107.00, '800242106-2', '5907100317343', '', '2025-10-01 09:50:02', 1, 1),
(18, 2025, 'FEBRERO', '2025-02-12', 'APORTES EN LINEA', 1304600.00, 'PRESTACIONES SOCIALES', 1304600.00, 0.00, 0.00, 1304600.00, '', '', '', '2025-10-01 09:50:02', 1, 1),
(20, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 09:52:45', 1, NULL),
(21, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 09:53:11', 1, NULL),
(22, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:01:24', 1, NULL),
(23, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', 754810.00, 'NOMINA', 754810.00, 0.00, 0.00, 754810.00, '', '', '', '2025-10-01 10:01:24', 1, NULL),
(24, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:01:24', 1, NULL),
(25, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:01:24', 1, NULL),
(26, 2025, 'FEBRERO', '2025-02-14', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:01:24', 1, NULL),
(27, 2025, 'FEBRERO', '2025-02-16', '	 HOMECENTER', 1139300.00, 'COMPRA', 1139300.00, 0.00, 0.00, 1139300.00, '', '', '', '2025-10-01 10:01:24', 1, NULL),
(28, 2025, 'FEBRERO', '2025-02-17', 'BEY ROUTH 93', 400450.00, 'ALMUERZOS', 400450.00, 0.00, 0.00, 400450.00, '', '', '', '2025-10-01 10:01:24', 1, NULL),
(29, 2025, 'FEBRERO', '2025-02-20', 'HOMECENTER', 239800.00, '', 239800.00, 0.00, 0.00, 239800.00, '', '', '', '2025-10-01 10:01:25', 1, NULL),
(30, 2025, 'FEBRERO', '2025-02-24', 'PAISST SAS', 957300.00, 'COMPRA DE DOTACIONES', 957300.00, 0.00, 0.00, 957300.00, '901911954-9', '18764088726728', '', '2025-10-01 10:01:25', 1, NULL),
(31, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:01:25', 1, NULL),
(32, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:01:25', 1, NULL),
(33, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', 754810.00, 'NOMINA', 754810.00, 0.00, 0.00, 754810.00, '', '', '', '2025-10-01 10:01:25', 1, NULL),
(34, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:01:25', 1, NULL),
(35, 2025, 'FEBRERO', '2025-02-28', 'TRANSFERENCIA VIRTUAL PYME', 830070.00, 'NOMINA', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:01:25', 1, NULL),
(36, 2025, 'MARZO', '2025-10-01', '', 0.00, '', 0.00, 0.00, 0.00, 0.00, '', '', '', '2025-10-01 10:01:43', 1, NULL),
(37, 2025, 'MARZO', '2025-03-07', 'COMPRA EN HOMECENTER', 226100.00, 'casa policia', 226100.00, 0.00, 0.00, 226100.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(38, 2025, 'MARZO', '2025-03-13', 'COMPRA EN ASADOS DON', 150669.00, 'ALMUERZO CONGUILLO', 150669.00, 0.00, 0.00, 150669.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(39, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(40, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(41, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', 754810.00, 'nomina', 754810.00, 0.00, 0.00, 754810.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(42, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(43, 2025, 'MARZO', '2025-03-15', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(44, 2025, 'MARZO', '2025-03-20', 'TRANSFERENCIA CTA SUC VIRTUAL', 1500000.00, 'lanchas', 1500000.00, 0.00, 0.00, 1500000.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(45, 2025, 'MARZO', '2025-03-20', 'TRANSFERENCIA CTA SUC VIRTUAL', 3000000.00, 'casa policia', 3000000.00, 0.00, 0.00, 3000000.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(46, 2025, 'MARZO', '2025-03-25', 'COMPREA EN M COCINA A', 263315.00, 'Almuerzo juan Pablo', 263315.00, 0.00, 0.00, 263315.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(47, 2025, 'MARZO', '2025-03-25', 'TRANSFERENCIA CTA SUC VIRTUAL', 23000000.00, 'Pago Joao', 23000000.00, 0.00, 0.00, 23000000.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(48, 2025, 'MARZO', '2025-03-28', 'COMPRA EN PARMESSANO', 138432.00, 'ALMUERZO CONGUILLO', 138432.00, 0.00, 0.00, 138432.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(49, 2025, 'MARZO', '2025-03-28', 'TRANSFERENCIA CTA SUC VIRTUAL', 1000000.00, 'Pago Joao', 1000000.00, 0.00, 0.00, 1000000.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(50, 2025, 'MARZO', '2025-03-29', 'COMPREA EN TIENDA ALT', 136100.00, '', 136100.00, 0.00, 0.00, 136100.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(51, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', 1656900.00, 'aportes en linea', 1656900.00, 0.00, 0.00, 1656900.00, '', '', '', '2025-10-01 10:40:25', 1, NULL),
(52, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', 555583.00, 'De res cartagena', 555583.00, 0.00, 0.00, 555583.00, '', '', '', '2025-10-01 10:40:26', 1, NULL),
(53, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', 665203.00, 'valentina', 665203.00, 0.00, 0.00, 665203.00, '', '', '', '2025-10-01 10:40:26', 1, NULL),
(54, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', 652160.00, 'Pasaje Guillermo medellin', 652160.00, 0.00, 0.00, 652160.00, '', '', '', '2025-10-01 10:40:26', 1, NULL),
(55, 2025, 'MARZO', '2025-03-29', 'TRANSFERENCIA CTA SUC VIRTUAL', 352245.00, 'valentina', 352245.00, 0.00, 0.00, 352245.00, '', '', '', '2025-10-01 10:40:26', 1, NULL),
(56, 2025, 'MARZO', '2025-03-31', 'TRANSFERENCIA CTA SUC VIRTUAL', 2211000.00, 'obra baru', 2211000.00, 0.00, 0.00, 2211000.00, '', '', '', '2025-10-01 10:40:26', 1, NULL),
(57, 2025, 'MARZO', '2025-03-31', 'TRANSFERENCIA CTA SUC VIRTUAL', 625100.00, 'camara de comercio', 625100.00, 0.00, 0.00, 625100.00, '', '', '', '2025-10-01 10:40:26', 1, NULL),
(58, 2025, 'ABRIL', '2025-04-01', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:58:29', 1, 1),
(59, 2025, 'ABRIL', '2025-04-01', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:58:29', 1, 1),
(60, 2025, 'ABRIL', '2025-04-01', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:58:29', 1, 1),
(61, 2025, 'ABRIL', '2025-04-01', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:58:29', 1, 1),
(62, 2025, 'ABRIL', '2025-04-02', ' tranferencia CTA suc virtual', 600000.00, '', 600000.00, 0.00, 0.00, 600000.00, '', '', '', '2025-10-01 10:58:29', 1, 1),
(66, 2025, 'ABRIL', '2025-04-12', ' tranferencia CTA suc virtual', 1523500.00, ' Obra Casa', 1523500.00, 0.00, 0.00, 1523500.00, '', '', '', '2025-10-01 10:58:29', 1, 1),
(73, 2025, 'ABRIL', '2025-04-22', ' tranferencia CTA suc virtual', 454000.00, ' Compra construtec, cementos blanco ', 454000.00, 0.00, 0.00, 454000.00, '', '', '', '2025-10-01 10:58:29', 1, 1),
(75, 2025, 'ABRIL', '2025-04-01', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:59:52', 1, 1),
(76, 2025, 'ABRIL', '2025-04-01', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:59:52', 1, 1),
(77, 2025, 'ABRIL', '2025-04-01', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:59:52', 1, 1),
(78, 2025, 'ABRIL', '2025-04-01', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 10:59:52', 1, 1),
(89, 2025, 'ABRIL', '2025-04-22', ' tranferencia CTA suc virtual', 79700.00, ' Obra piso', 79700.00, 0.00, 0.00, 79700.00, '', '', '', '2025-10-01 10:59:52', 1, 1),
(97, 2025, 'ABRIL', '2025-04-04', ' tranferencia CTA suc virtual', 11000000.00, ' abono deuda Juan Caputo', 11000000.00, 0.00, 0.00, 11000000.00, '', '', '', '2025-10-01 11:00:47', 1, 1),
(101, 2025, 'ABRIL', '2025-04-15', ' tranferencia CTA suc virtual', 1692000.00, ' aportes en linea', 1692000.00, 0.00, 0.00, 1692000.00, '', '', '', '2025-10-01 11:00:47', 1, 1),
(115, 2025, 'ABRIL', '2025-04-05', ' tranferencia CTA suc virtual', 1400000.00, ' Ana Maria Contadora', 1400000.00, 0.00, 0.00, 1400000.00, '', '', '', '2025-10-01 11:01:30', 1, 1),
(116, 2025, 'ABRIL', '2025-04-06', ' compra homecenter', 121700.00, ' obra home center', 121700.00, 0.00, 0.00, 121700.00, '', '', '', '2025-10-01 11:01:30', 1, 1),
(117, 2025, 'ABRIL', '2025-04-12', ' tranferencia CTA suc virtual', 73000.00, ' Obra Cementos', 73000.00, 0.00, 0.00, 73000.00, '', '', '', '2025-10-01 11:01:30', 1, 1),
(126, 2025, 'ABRIL', '2025-04-22', ' tranferencia CTA suc virtual', 79700.00, ' Obra piso', 79700.00, 0.00, 0.00, 79700.00, '', '', '', '2025-10-01 12:34:42', 1, 1),
(127, 2025, 'ABRIL', '2025-04-29', ' tranferencia CTA suc virtual', 440000.00, ' Obra Ventanas', 440000.00, 0.00, 0.00, 440000.00, '', '', '', '2025-10-01 12:34:42', 1, 1),
(128, 2025, 'ABRIL', '2025-04-24', ' tranferencia CTA suc virtual', 540000.00, ' Puerta ventana/ventana baño', 540000.00, 0.00, 0.00, 540000.00, '', '', '', '2025-10-01 12:34:42', 1, 1),
(129, 2025, 'ABRIL', '2025-04-30', ' tranferencia CTA suc virtual', 920349.00, ' Compra de porcelanato beige ', 920349.00, 0.00, 0.00, 920349.00, '', '', '', '2025-10-01 12:34:42', 1, 1),
(130, 2025, 'MAYO', '2025-05-02', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 12:51:18', 1, NULL),
(131, 2025, 'MAYO', '2025-05-02', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 12:51:18', 1, NULL),
(132, 2025, 'MAYO', '2025-05-02', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 12:51:18', 1, NULL),
(133, 2025, 'MAYO', '2025-05-02', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 12:51:18', 1, NULL),
(134, 2025, 'MAYO', '2025-05-03', ' tranferencia CTA suc virtual', 1400000.00, ' Ventanas baru', 1400000.00, 0.00, 0.00, 1400000.00, '', '', '', '2025-10-01 12:51:18', 1, NULL),
(135, 2025, 'MAYO', '2025-05-08', ' tranferencia CTA suc virtual', 0.00, '', 0.00, 0.00, 0.00, 0.00, '', '', '', '2025-10-01 12:51:18', 1, NULL),
(136, 2025, 'MAYO', '2025-05-16', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(137, 2025, 'MAYO', '2025-05-16', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(138, 2025, 'MAYO', '2025-05-16', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(139, 2025, 'MAYO', '2025-05-16', ' tranferencia CTA suc virtual', 830070.00, 'nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(140, 2025, 'MAYO', '2025-05-17', ' compra homecenter', 871270.00, '', 871270.00, 0.00, 0.00, 871270.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(141, 2025, 'MAYO', '2025-05-22', ' tranferencia CTA suc virtual', 350000.00, ' Compra puerta ventana ', 350000.00, 0.00, 0.00, 350000.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(142, 2025, 'MAYO', '2025-05-26', ' tranferencia CTA suc virtual', 2000000.00, ' Lancha Cartagena', 2000000.00, 0.00, 0.00, 2000000.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(143, 2025, 'MAYO', '2025-05-26', ' tranferencia CTA suc virtual', 500000.00, ' Ana Maria Contadora', 500000.00, 0.00, 0.00, 500000.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(144, 2025, 'MAYO', '2025-05-30', ' tranferencia CTA suc virtual', 12000000.00, 'Varios/ lancha, casa cartagena policia, seguridad social', 12000000.00, 0.00, 0.00, 12000000.00, '', '', '', '2025-10-01 12:51:19', 1, NULL),
(145, 2025, 'JUNIO', '2025-06-01', ' tranferencia CTA SUC VIRTUAL', 1000000.00, 'Juan Pablo', 1000000.00, 0.00, 0.00, 1000000.00, '', '', '', '2025-10-01 13:27:33', 1, 1),
(146, 2025, 'JUNIO', '2025-06-03', ' tranferencia CTA SUC VIRTUAL', 830070.00, 'Pago Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 13:27:33', 1, 1),
(147, 2025, 'JUNIO', '2025-06-03', ' tranferencia CTA SUC VIRTUAL', 830070.00, 'Pago Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(148, 2025, 'JUNIO', '2025-06-03', ' tranferencia CTA SUC VIRTUAL', 830070.00, 'Pago Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(149, 2025, 'JUNIO', '2025-06-03', ' tranferencia CTA SUC VIRTUAL', 830070.00, 'Pago Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(150, 2025, 'JUNIO', '2025-06-05', ' compra home center', 98100.00, ' compra home center', 98100.00, 0.00, 0.00, 98100.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(151, 2025, 'JUNIO', '2025-06-06', ' compra en espumas', 199000.00, 'Compra espumas- espumados', 199000.00, 0.00, 0.00, 199000.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(152, 2025, 'JUNIO', '2025-06-07', ' Pago PSE coomeva', 2173080.00, 'EPS', 2173080.00, 0.00, 0.00, 2173080.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(153, 2025, 'JUNIO', '2025-06-07', ' tranferencia CTA SUC VIRTUAL', 349500.00, 'Ferremar la 94', 349500.00, 0.00, 0.00, 349500.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(154, 2025, 'JUNIO', '2025-06-08', ' compra en home center', 395400.00, 'Home center', 395400.00, 0.00, 0.00, 395400.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(155, 2025, 'JUNIO', '2025-06-08', ' compra en home center', 89900.00, ' Home center', 89900.00, 0.00, 0.00, 89900.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(156, 2025, 'JUNIO', '2025-06-12', ' tranferencia CTA SUC VIRTUAL', 8903480.00, ' Impuesto', 8903480.00, 0.00, 0.00, 8903480.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(157, 2025, 'JUNIO', '2025-06-13', ' tranferencia CTA SUC VIRTUAL', 1641820.00, ' Pagos primas y quincena', 1641820.00, 0.00, 0.00, 1641820.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(158, 2025, 'JUNIO', '2025-06-13', ' tranferencia CTA SUC VIRTUAL', 1562000.00, '', 1562000.00, 0.00, 0.00, 1562000.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(159, 2025, 'JUNIO', '2025-06-13', ' tranferencia CTA SUC VIRTUAL', 1562000.00, 'aportes en linea', 1562000.00, 0.00, 0.00, 1562000.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(160, 2025, 'JUNIO', '2025-06-13', ' tranferencia CTA SUC VIRTUAL', 1641820.00, 'Pagos primas y quincena', 1641820.00, 0.00, 0.00, 1641820.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(161, 2025, 'JUNIO', '2025-06-13', ' tranferencia CTA SUC VIRTUAL', 1641820.00, 'Pagos primas y quincena', 1641820.00, 0.00, 0.00, 1641820.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(162, 2025, 'JUNIO', '2025-06-13', ' tranferencia CTA SUC VIRTUAL', 464860.00, 'Pago mayo ana', 464860.00, 0.00, 0.00, 464860.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(163, 2025, 'JUNIO', '2025-06-13', ' tranferencia CTA SUC VIRTUAL', 1641820.00, 'Pagos primas y quincena', 1641820.00, 0.00, 0.00, 1641820.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(164, 2025, 'JUNIO', '2025-06-14', 'compra en home center', 433400.00, 'compra en home center', 433400.00, 0.00, 0.00, 433400.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(165, 2025, 'JUNIO', '2025-06-14', 'compra en supertienda', 262855.00, 'Olimpica aseo', 262855.00, 0.00, 0.00, 262855.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(166, 2025, 'JUNIO', '2025-06-18', 'tranferencia CTA SUC VIRTUAL', 1668700.00, 'Aportes en linea Jhon Jairo', 1668700.00, 0.00, 0.00, 1668700.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(167, 2025, 'JUNIO', '2025-06-22', 'tranferencia CTA SUC VIRTUAL', 3000000.00, 'Compra caballo y mano de obra', 3000000.00, 0.00, 0.00, 3000000.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(168, 2025, 'JUNIO', '2025-06-25', 'compra importadora el hueco', 125500.00, 'compra de cubiertos y platos', 125500.00, 0.00, 0.00, 125500.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(169, 2025, 'JUNIO', '2025-06-25', 'tranferencia CTA SUC VIRTUAL', 1300000.00, '', 1300000.00, 0.00, 0.00, 1300000.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(170, 2025, 'JUNIO', '2025-06-28', 'tranferencia CTA SUC VIRTUAL', 218300.00, 'Compra caballo y mano de obra', 218300.00, 0.00, 0.00, 218300.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(171, 2025, 'JUNIO', '2025-06-30', 'tranferencia CTA SUC VIRTUAL', 2000000.00, '', 2000000.00, 0.00, 0.00, 2000000.00, '', '', '', '2025-10-01 13:27:34', 1, 1),
(195, 2025, 'JULIO', '2025-07-02', ' TRANSFERENCIA CTA SUC VIRTUAL', 1490092.00, 'Jhon Jairo Liquidacion', 1490092.00, 0.00, 0.00, 1490092.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(196, 2025, 'JULIO', '2025-07-02', ' TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(197, 2025, 'JULIO', '2025-07-02', ' TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(198, 2025, 'JULIO', '2025-07-02', ' TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(199, 2025, 'JULIO', '2025-07-04', ' COMPRA EN BOLD*Resta', 344900.00, 'COMPRA EN BOLD*Resta', 344900.00, 0.00, 0.00, 344900.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(200, 2025, 'JULIO', '2025-07-08', ' TRANSFERENCIA CTA SUC VIRTUAL', 774000.00, 'TRANSFERENCIA CTA SUC VIRTUAL', 774000.00, 0.00, 0.00, 774000.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(201, 2025, 'JULIO', '2025-07-08', ' TRANSFERENCIA CTA SUC VIRTUAL', 1342930.00, 'facturacion SIGO', 1342930.00, 0.00, 0.00, 1342930.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(202, 2025, 'JULIO', '2025-07-10', ' TRANSFERENCIA VIRTUAL', 1492500.00, 'APORTES EN LINEA', 1492500.00, 0.00, 0.00, 1492500.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(203, 2025, 'JULIO', '2025-07-11', ' COMPRA EN HOMECENTER', 859800.00, 'Compra Home center elementos piscinas', 859800.00, 0.00, 0.00, 859800.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(204, 2025, 'JULIO', '2025-07-15', ' COMPRA EN HOMECENTER', 517100.00, 'Compra home center inodoro', 517100.00, 0.00, 0.00, 517100.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(205, 2025, 'JULIO', '2025-07-15', ' TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(206, 2025, 'JULIO', '2025-07-15', ' TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(207, 2025, 'JULIO', '2025-07-15', ' TRANSFERENCIA CTA SUC VIRTUAL', 500000.00, 'NominaNomina ana', 500000.00, 0.00, 0.00, 500000.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(208, 2025, 'JULIO', '2025-07-15', ' TRANSFERENCIA CTA SUC VIRTUAL', 823400.00, 'Nomina', 823400.00, 0.00, 0.00, 823400.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(209, 2025, 'JULIO', '2025-07-15', ' TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, 'Nomina', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(210, 2025, 'JULIO', '2025-07-16', ' TRANSFERENCIA CTA SUC VIRTUAL', 2000000.00, 'Calculista', 2000000.00, 0.00, 0.00, 2000000.00, '', '', '', '2025-10-01 16:55:33', 1, 1),
(211, 2025, 'JULIO', '2025-07-18', ' TRANSFERENCIA CTA SUC VIRTUAL', 179000.00, '', 179000.00, 0.00, 0.00, 179000.00, '', '', '', '2025-10-01 16:55:34', 1, 1),
(212, 2025, 'JULIO', '2025-07-20', ' TRANSFERENCIA CTA SUC VIRTUAL', 500000.00, '', 500000.00, 0.00, 0.00, 500000.00, '', '', '', '2025-10-01 16:55:34', 1, 1),
(213, 2025, 'JULIO', '2025-07-21', ' TRANSFERENCIA CTA SUC VIRTUAL', 250000.00, '', 250000.00, 0.00, 0.00, 250000.00, '', '', '', '2025-10-01 16:55:34', 1, 1),
(214, 2025, 'JULIO', '2025-07-25', ' TRANSFERENCIA CTA SUC VIRTUAL', 1500000.00, '', 1500000.00, 0.00, 0.00, 1500000.00, '', '', '', '2025-10-01 16:55:34', 1, 1),
(215, 2025, 'JULIO', '2025-07-28', ' TRANSFERENCIA CTA SUC VIRTUAL', 60000.00, '', 60000.00, 0.00, 0.00, 60000.00, '', '', '', '2025-10-01 16:55:34', 1, 1),
(216, 2025, 'JULIO', '2025-07-28', ' TRANSFERENCIA CTA SUC VIRTUAL', 1602404.00, 'Liquidacion y salario Jhon Fredy', 1602404.00, 0.00, 0.00, 1602404.00, '', '', '', '2025-10-01 16:55:34', 1, 1),
(217, 2025, 'JULIO', '2025-07-31', ' TRANSFERENCIA CTA SUC VIRTUAL', 2000000.00, '', 2000000.00, 0.00, 0.00, 2000000.00, '', '', '', '2025-10-01 16:55:34', 1, 1),
(218, 2025, 'AGOSTO', '2025-10-01', '', 0.00, '', 0.00, 0.00, 0.00, 0.00, '', '', '', '2025-10-01 17:11:54', 1, NULL),
(219, 2025, 'AGOSTO', '2025-08-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, '', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(220, 2025, 'AGOSTO', '2025-08-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 250000.00, '', 250000.00, 0.00, 0.00, 250000.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(221, 2025, 'AGOSTO', '2025-08-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 900000.00, '', 900000.00, 0.00, 0.00, 900000.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(222, 2025, 'AGOSTO', '2025-08-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, '', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(223, 2025, 'AGOSTO', '2025-10-01', 'COMPRA EN RESTAURANT', 323409.00, '', 323409.00, 0.00, 0.00, 323409.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(224, 2025, 'AGOSTO', '2025-10-01', 'Miguel Polo', 225000.00, '', 225000.00, 0.00, 0.00, 225000.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(225, 2025, 'AGOSTO', '2025-10-01', 'RETIRO TARJETA EN SUCURSAL', 50000000.00, '', 50000000.00, 0.00, 0.00, 50000000.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(226, 2025, 'AGOSTO', '2025-10-01', 'TRASLADO DEBITO PIN PAD', 13078242.00, '', 13078242.00, 0.00, 0.00, 13078242.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(227, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, '', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(228, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, '', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(229, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 830070.00, '', 830070.00, 0.00, 0.00, 830070.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(230, 2025, 'AGOSTO', '2025-10-01', 'Andrea Zuñiga', 250000.00, '', 250000.00, 0.00, 0.00, 250000.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(231, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 900000.00, '', 900000.00, 0.00, 0.00, 900000.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(232, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 1638000.00, '', 1638000.00, 0.00, 0.00, 1638000.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(233, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 1822090.00, '', 1822090.00, 0.00, 0.00, 1822090.00, '', '', '', '2025-10-01 17:31:23', 1, NULL),
(234, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 320000.00, '', 320000.00, 0.00, 0.00, 320000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(235, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 2951200.00, '', 2951200.00, 0.00, 0.00, 2951200.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(236, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 662200.00, '', 662200.00, 0.00, 0.00, 662200.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(237, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 2050000.00, '', 2050000.00, 0.00, 0.00, 2050000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(238, 2025, 'AGOSTO', '2025-10-01', 'RETIRO EN CAJA CON CHEQUE', 92532478.00, '', 92532478.00, 0.00, 0.00, 92532478.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(239, 2025, 'AGOSTO', '2025-10-01', 'COMPRA EN FERRE ELEC', 316400.00, '', 316400.00, 0.00, 0.00, 316400.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(240, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 12646616.00, '', 12646616.00, 0.00, 0.00, 12646616.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(241, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 704000.00, '', 704000.00, 0.00, 0.00, 704000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(242, 2025, 'AGOSTO', '2025-10-01', 'Miguel Polo', 6100000.00, '', 6100000.00, 0.00, 0.00, 6100000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(243, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 1092799.00, '', 1092799.00, 0.00, 0.00, 1092799.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(244, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 1723016.00, '', 1723016.00, 0.00, 0.00, 1723016.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(245, 2025, 'AGOSTO', '2025-10-01', 'Miguel Polo', 4804000.00, '', 4804000.00, 0.00, 0.00, 4804000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(246, 2025, 'AGOSTO', '2025-10-01', 'Miguel Polo', 3000000.00, '', 3000000.00, 0.00, 0.00, 3000000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(247, 2025, 'AGOSTO', '2025-10-01', 'Miguel Polo', 5000000.00, '', 5000000.00, 0.00, 0.00, 5000000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(248, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 1477000.00, '', 1477000.00, 0.00, 0.00, 1477000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(249, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 4710000.00, '', 4710000.00, 0.00, 0.00, 4710000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(250, 2025, 'AGOSTO', '2025-10-01', 'TRANSFERENCIA CTA SUC VIRTUAL', 2000000.00, '', 2000000.00, 0.00, 0.00, 2000000.00, '', '', '', '2025-10-01 17:31:24', 1, NULL),
(252, 2025, 'JUNIO', '2025-10-10', '', 0.00, '', 0.00, 0.00, 0.00, 0.00, '', '', 'corozal', '2025-10-10 10:14:54', 1, NULL),
(253, 2025, 'JUNIO', '2025-10-10', '', 0.00, '', 0.00, 0.00, 0.00, 0.00, '', '', 'corozal', '2025-10-10 10:14:54', 1, NULL),
(254, 2025, 'JUNIO', '2025-10-10', '', 0.00, '', 0.00, 0.00, 0.00, 0.00, '', '', 'corozal', '2025-10-10 10:14:54', 1, NULL);


-- Insert root folder
-- Insertar carpeta raíz
INSERT INTO file_folders (name, parent_id, path, description, created_by) VALUES
('Archivos', NULL, '/', 'Carpeta raíz del sistema de archivos', 1);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Database initialization completed successfully with absence management and file system
SELECT 'SGI Opera Soluciones database initialization completed successfully with absence management and file system tables' AS status;










