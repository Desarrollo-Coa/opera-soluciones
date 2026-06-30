-- Migration: 014_sistema_financiero_v2.sql
-- Descripción: Creación de tablas para el sistema financiero dinámico con soporte de Hojas (Pestañas) estilo Excel.
-- Versión 2.1: Incluye Módulos (Libros) -> Hojas (Pestañas) -> Columnas y Datos.

-- 1. Tabla de Módulos (Equivale al "Libro" de Excel)
CREATE TABLE IF NOT EXISTS `FIN_MODULES` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL COMMENT 'Nombre del libro financiero',
  `description` TEXT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Hojas (Las pestañas internas de cada módulo)
CREATE TABLE IF NOT EXISTS `FIN_MODULE_SHEETS` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `module_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'Nombre de la pestaña, ej: Enero, Febrero',
  `sheet_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`module_id`) REFERENCES `FIN_MODULES`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Definición de Columnas (Estructura por Hoja)
CREATE TABLE IF NOT EXISTS `FIN_MODULE_COLUMNS` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `module_id` INT NOT NULL,
  `sheet_id` INT NOT NULL,
  `field_key` VARCHAR(100) NOT NULL COMMENT 'Llave JSON, ej: monto',
  `header_name` VARCHAR(100) NOT NULL COMMENT 'Nombre visible',
  `field_type` ENUM('text', 'number', 'date', 'select', 'currency', 'boolean') NOT NULL,
  `options` JSON NULL COMMENT 'Opciones para selects',
  `is_required` BOOLEAN DEFAULT FALSE,
  `column_order` INT DEFAULT 0,
  `width` INT DEFAULT 150,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`module_id`) REFERENCES `FIN_MODULES`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sheet_id`) REFERENCES `FIN_MODULE_SHEETS`(`id`) ON DELETE CASCADE,
  UNIQUE INDEX `idx_sheet_field` (`sheet_id`, `field_key`),
  INDEX `idx_mod_col` (`module_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Datos (Las filas dinámicas por Hoja)
CREATE TABLE IF NOT EXISTS `FIN_MODULE_DATA` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `module_id` INT NOT NULL,
  `sheet_id` INT NOT NULL,
  `transaction_date` DATE NULL COMMENT 'Fecha opcional para reportes',
  `row_data` JSON NOT NULL COMMENT 'Contenido dynamic: {"col": "val"}',
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`module_id`) REFERENCES `FIN_MODULES`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sheet_id`) REFERENCES `FIN_MODULE_SHEETS`(`id`) ON DELETE CASCADE,
  INDEX `idx_data_sheet_date` (`sheet_id`, `transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Dashboards asociados a módulos
CREATE TABLE IF NOT EXISTS `FIN_DASHBOARDS` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `module_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `layout_config` JSON NOT NULL,
  `widgets_config` JSON NOT NULL,
  `created_by` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`module_id`) REFERENCES `FIN_MODULES`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
